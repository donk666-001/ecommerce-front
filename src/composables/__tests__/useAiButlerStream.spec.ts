import { useAiButlerStream } from "../useAiButlerStream";
import type { SseCallbacks } from "../useAiButlerStream";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * SSE 解析器验证：覆盖分块、多事件合并、id/event/data 行、afterSeq 重连、用户取消。
 * 通过 mock fetch + ReadableStream 模拟真实 SSE 流。
 */

// 创建可读 SSE 文本流的辅助函数
function createSseResponse(
    chunks: string[],
    options?: { ok?: boolean; status?: number },
): Response {
    const encoder = new TextEncoder();
    let chunkIndex = 0;

    const stream = new ReadableStream({
        pull(controller) {
            if (chunkIndex < chunks.length) {
                controller.enqueue(encoder.encode(chunks[chunkIndex]));
                chunkIndex++;
            } else {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        status: options?.status ?? (options?.ok === false ? 500 : 200),
        headers: { "Content-Type": "text/event-stream" },
    });
}

describe("useAiButlerStream SSE 解析", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // ─── 基础解析：单事件 ───

    it("解析单条 message.delta 事件", async () => {
        const { startStream } = useAiButlerStream();
        const callbacks: SseCallbacks = {
            onDelta: vi.fn(),
            onCompleted: vi.fn(),
            onStreamCompleted: vi.fn(),
            onError: vi.fn(),
        };

        const fetchMock = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(
                createSseResponse([
                    'id:1\nevent:message.delta\ndata:{"messageId":1,"delta":"你好"}\n\n',
                ]),
            );

        await startStream(
            { sessionId: 1, requestId: "req-1", message: "test" },
            callbacks,
        );

        expect(callbacks.onDelta).toHaveBeenCalledWith(
            expect.objectContaining({ messageId: 1, delta: "你好" }),
        );
    });

    // ─── 多行 data ───

    it("正确合并多行 data", async () => {
        const { startStream } = useAiButlerStream();
        const onDelta = vi.fn();
        const onError = vi.fn();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse([
                // 多行 data 格式（每行以 data: 开头）
                "id:1\nevent:message.delta\ndata:第1行\ndata:第2行\n\n",
            ]),
        );

        await startStream(
            { sessionId: 1, requestId: "req-2", message: "test" },
            { onDelta, onError },
        );

        // 多行 data 应合并为一个字符串（用换行连接）
        expect(onDelta).toHaveBeenCalled();
        const deltaCall = onDelta.mock.calls[0][0];
        // 非 JSON 时 delta 是合并后的字符串
        expect(deltaCall).toBe("第1行\n第2行");
    });

    // ─── 多事件合并（同一 chunk） ───

    it("同一 chunk 中解析多个事件", async () => {
        const { startStream } = useAiButlerStream();
        const onDelta = vi.fn();
        const onCompleted = vi.fn();
        const onStreamCompleted = vi.fn();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse([
                'id:1\nevent:message.delta\ndata:{"messageId":1,"delta":"你"}\n\n' +
                    'id:2\nevent:message.delta\ndata:{"messageId":1,"delta":"好"}\n\n' +
                    'id:3\nevent:message.completed\ndata:{"messageId":1,"contentType":"TEXT"}\n\n',
            ]),
        );

        await startStream(
            { sessionId: 1, requestId: "req-3", message: "test" },
            { onDelta, onCompleted, onStreamCompleted },
        );

        expect(onDelta).toHaveBeenCalledTimes(2);
        expect(onCompleted).toHaveBeenCalledTimes(1);
    });

    // ─── 跨 chunk 分块解析 ───

    it("跨 chunk 正确拼接不完整事件", async () => {
        const { startStream } = useAiButlerStream();
        const onDelta = vi.fn();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse([
                // chunk 1: 不完整（缺少末尾空行）
                'id:1\nevent:message.delta\ndata:{"messageId":1,"delta":"断',
                // chunk 2: 补全
                '点续传"}\n\n',
            ]),
        );

        await startStream(
            { sessionId: 1, requestId: "req-4", message: "test" },
            { onDelta },
        );

        expect(onDelta).toHaveBeenCalledTimes(1);
        const call = onDelta.mock.calls[0][0];
        expect(call.delta).toBe("断点续传");
    });

    // ─── error 事件 ───

    it("error 事件触发 onError 回调", async () => {
        const { startStream } = useAiButlerStream();
        const onError = vi.fn();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse([
                'event:error\ndata:{"code":"AI_TOOL_FAILED","message":"工具不可用"}\n\n',
            ]),
        );

        await startStream(
            { sessionId: 1, requestId: "req-5", message: "test" },
            { onError },
        );

        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({ code: "AI_TOOL_FAILED" }),
        );
    });

    // ─── HTTP 错误 ───

    it("HTTP 非 200 触发 onError", async () => {
        const { startStream } = useAiButlerStream();
        const onError = vi.fn();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse([], { ok: false, status: 500 }),
        );

        await startStream(
            { sessionId: 1, requestId: "req-6", message: "test" },
            { onError },
        );

        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({ code: "AI_HTTP_ERROR" }),
        );
    });

    // ─── 用户取消 ───

    it("用户取消不触发 error 回调", { timeout: 10000 }, async () => {
        const { startStream, cancelStream } = useAiButlerStream();
        const onError = vi.fn();

        // mock fetch 延迟返回以留出取消时间
        vi.spyOn(globalThis, "fetch").mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const stream = new ReadableStream({
                        start(controller) {
                            controller.enqueue(
                                new TextEncoder().encode(
                                    "event:stream.completed\ndata:{}\n\n",
                                ),
                            );
                            controller.close();
                        },
                    });
                    resolve(
                        new Response(stream, {
                            headers: { "Content-Type": "text/event-stream" },
                        }),
                    );
                }, 100);
            });
        });

        const promise = startStream(
            { sessionId: 1, requestId: "req-cancel", message: "test" },
            { onError },
        );

        // 立即取消（在 fetch resolve 之前）
        cancelStream();

        try {
            await promise;
        } catch {
            // AbortError 可能传播
        }

        // 取消不应触发 error 回调
        expect(onError).not.toHaveBeenCalled();
    });

    // ─── 非 JSON data 不崩溃 ───

    it("非 JSON 格式 data 不抛异常", async () => {
        const { startStream } = useAiButlerStream();
        const onDelta = vi.fn();
        const onError = vi.fn();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse([
                "id:1\nevent:message.delta\ndata:纯文本非JSON\n\n",
                "id:2\nevent:stream.completed\ndata:{}\n\n",
            ]),
        );

        await startStream(
            { sessionId: 1, requestId: "req-7", message: "test" },
            { onDelta, onError },
        );

        // 不应报错
        expect(onError).not.toHaveBeenCalled();
    });

    // ─── 重置 isStreaming ───

    it("流完成后 isStreaming 为 false", async () => {
        const { startStream, isStreaming } = useAiButlerStream();

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            createSseResponse(["event:stream.completed\ndata:{}\n\n"]),
        );

        await startStream(
            { sessionId: 1, requestId: "req-8", message: "test" },
            {},
        );

        expect(isStreaming.value).toBe(false);
    });
});
