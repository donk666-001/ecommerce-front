import type { ChatStreamRequest } from "@/network/aiButler";
import { ref } from "vue";

// ─────────────────────── SSE 事件类型 ───────────────────────

/** 后端推送的 SSE 事件结构 */
export interface SseEvent<T = unknown> {
    id?: string | undefined;
    event: string;
    data: T;
}

/** message.delta 事件数据 */
export interface MessageDeltaData {
    messageId: number;
    delta: string;
    replaced?: boolean;
}

/** message.completed 事件数据 */
export interface MessageCompletedData {
    messageId: number;
    contentType: string;
    structuredJson?: string;
}

/** tool.started / tool.completed 事件数据 */
export interface ToolEventData {
    toolName?: string;
    status?: string;
}

/** error 事件数据 */
export interface ErrorEventData {
    code: string;
    message: string;
}

/** intent.resolved 事件数据 */
export interface IntentResolvedData {
    intent: string;
}

/** SSE 事件回调集合 */
export interface SseCallbacks {
    onDelta?: (data: MessageDeltaData) => void;
    onCompleted?: (data: MessageCompletedData) => void;
    onToolStarted?: (data: ToolEventData) => void;
    onToolCompleted?: (data: ToolEventData) => void;
    onIntentResolved?: (data: IntentResolvedData) => void;
    onStreamCompleted?: () => void;
    onInterrupted?: () => void;
    onError?: (data: ErrorEventData) => void;
    onRawEvent?: (event: SseEvent) => void;
}

// ─────────────────────── SSE 解析工具 ───────────────────────

interface ParseResult {
    events: SseEvent[];
    remainder: string;
}

/**
 * 解析 SSE 文本缓冲区，返回完整事件列表和剩余未完成内容。
 * 支持：id / event / data 多行、空行分隔、代码块内嵌换行。
 */
function parseSseBuffer(buffer: string): ParseResult {
    const events: SseEvent[] = [];
    // SSE 事件以双换行符分隔（\n\n 或 \r\n\r\n）
    const parts = buffer.split(/\r?\n\r?\n/);
    const remainder = parts.pop() ?? ""; // 最后一块可能不完整

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        let id: string | undefined;
        let eventType = "message";
        let dataLines: string[] = [];

        for (const line of trimmed.split(/\r?\n/)) {
            if (line.startsWith("id:")) {
                id = line.slice(3).trim();
            } else if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trim());
            }
            // 以 ':' 开头的注释行忽略
        }

        if (dataLines.length === 0) continue;
        const rawData = dataLines.join("\n");

        let parsedData: unknown = rawData;
        try {
            parsedData = JSON.parse(rawData);
        } catch {
            // 非 JSON 数据保持字符串
        }

        events.push({ id, event: eventType, data: parsedData });
    }

    return { events, remainder };
}

// ─────────────────────── Composable ───────────────────────

/** SSE 连接基础路径（与 Axios 保持一致） */
const SSE_BASE_URL = "/e-commerce/api";

/**
 * AI 管家 SSE 流式对话 Composable。
 * 使用 fetch + ReadableStream 实现真实流式体验。
 * 支持：分块解析、多事件合并、afterSeq 重连、用户取消。
 */
export function useAiButlerStream() {
    const isStreaming = ref(false);
    const lastEventSeq = ref(0);
    const currentRequestId = ref<string | null>(null);

    let _abortController: AbortController | null = null;

    /**
     * 发起初次流式对话（或同 requestId 幂等重放）。
     *
     * @param request  对话请求参数（sessionId / requestId / message）
     * @param callbacks 事件回调
     */
    async function startStream(
        request: ChatStreamRequest,
        callbacks: SseCallbacks,
    ): Promise<void> {
        if (isStreaming.value) {
            console.warn("[AiButlerStream] 已有正在进行的流式请求，请先停止");
            return;
        }

        _abortController = new AbortController();
        currentRequestId.value = request.requestId;
        lastEventSeq.value = 0;
        isStreaming.value = true;

        try {
            const response = await fetch(
                `${SSE_BASE_URL}/ai-butler/chat/stream`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(request),
                    signal: _abortController.signal,
                },
            );

            if (!response.ok) {
                callbacks.onError?.({
                    code: "AI_HTTP_ERROR",
                    message: `HTTP ${response.status}`,
                });
                return;
            }

            await readStream(response, callbacks);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
                // 用户主动取消，静默处理
            } else {
                const message =
                    err instanceof Error ? err.message : String(err);
                callbacks.onError?.({ code: "AI_NETWORK_ERROR", message });
            }
        } finally {
            isStreaming.value = false;
            _abortController = null;
        }
    }

    /**
     * 断线重连：从 afterSeq 开始重放历史事件，并继续接收新事件。
     *
     * @param requestId  原请求 ID
     * @param afterSeq   已收到的最后事件序号（0 = 从头重放）
     * @param callbacks  事件回调
     */
    async function reconnect(
        requestId: string,
        afterSeq: number,
        callbacks: SseCallbacks,
    ): Promise<void> {
        if (isStreaming.value) {
            console.warn("[AiButlerStream] 已有正在进行的流式请求");
            return;
        }

        _abortController = new AbortController();
        currentRequestId.value = requestId;
        isStreaming.value = true;
        lastEventSeq.value = afterSeq;

        try {
            const url = `${SSE_BASE_URL}/ai-butler/chat/stream/${requestId}?afterSeq=${afterSeq}`;
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                signal: _abortController.signal,
            });

            if (!response.ok) {
                callbacks.onError?.({
                    code: "AI_HTTP_ERROR",
                    message: `HTTP ${response.status}`,
                });
                return;
            }

            await readStream(response, callbacks);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
                // 用户取消
            } else {
                const message =
                    err instanceof Error ? err.message : String(err);
                callbacks.onError?.({ code: "AI_NETWORK_ERROR", message });
            }
        } finally {
            isStreaming.value = false;
            _abortController = null;
        }
    }

    /**
     * 取消当前流式请求（仅中断客户端连接，不通知服务端）。
     * 如需服务端停止生成，请同时调用 ApiAiButler.cancelGeneration()。
     */
    function cancelStream(): void {
        _abortController?.abort();
    }

    // ─── 私有：读取并解析 SSE 流 ───

    async function readStream(
        response: Response,
        callbacks: SseCallbacks,
    ): Promise<void> {
        if (!response.body) {
            callbacks.onError?.({
                code: "AI_NO_BODY",
                message: "响应体为空",
            });
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const { events, remainder } = parseSseBuffer(buffer);
                buffer = remainder;

                for (const event of events) {
                    // 更新最后收到的事件序号
                    if (event.id) {
                        const seq = parseInt(event.id, 10);
                        if (!isNaN(seq)) lastEventSeq.value = seq;
                    }

                    dispatchEvent(event, callbacks);
                }
            }

            if (buffer.trim()) {
                const { events } = parseSseBuffer(`${buffer}\n\n`);
                for (const event of events) {
                    if (event.id) {
                        const seq = parseInt(event.id, 10);
                        if (!isNaN(seq)) lastEventSeq.value = seq;
                    }

                    dispatchEvent(event, callbacks);
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    function dispatchEvent(event: SseEvent, cb: SseCallbacks): void {
        cb.onRawEvent?.(event);

        const data = event.data as Record<string, unknown>;

        switch (event.event) {
            case "message.delta":
                cb.onDelta?.(data as unknown as MessageDeltaData);
                break;
            case "message.completed":
                cb.onCompleted?.(data as unknown as MessageCompletedData);
                break;
            case "tool.started":
                cb.onToolStarted?.(data as unknown as ToolEventData);
                break;
            case "tool.completed":
                cb.onToolCompleted?.(data as unknown as ToolEventData);
                break;
            case "intent.resolved":
                cb.onIntentResolved?.(data as unknown as IntentResolvedData);
                break;
            case "stream.completed":
                cb.onStreamCompleted?.();
                break;
            case "message.interrupted":
                cb.onInterrupted?.();
                break;
            case "error":
                cb.onError?.(data as unknown as ErrorEventData);
                break;
            default:
                break;
        }
    }

    return {
        isStreaming,
        lastEventSeq,
        currentRequestId,
        startStream,
        reconnect,
        cancelStream,
    };
}
