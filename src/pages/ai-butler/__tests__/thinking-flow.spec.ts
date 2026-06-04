import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const streamHarness = vi.hoisted(() => {
    const state: {
        callbacks: Record<
            string,
            ((payload?: unknown) => void) | undefined
        > | null;
    } = {
        callbacks: null,
    };

    return {
        state,
        startStreamMock: vi.fn(async (_request, callbacks) => {
            state.callbacks = callbacks as Record<
                string,
                ((payload?: unknown) => void) | undefined
            >;
        }),
        reconnectMock: vi.fn(),
        cancelStreamMock: vi.fn(),
    };
});

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock("@/network", () => ({
    ApiSeasonalHealth: {
        getCurrent: vi.fn().mockResolvedValue({
            solarTerm: { termName: "小满" },
        }),
    },
    ApiAiButler: {
        listSessions: vi.fn().mockResolvedValue({
            data: { data: [] },
        }),
        createSession: vi.fn().mockResolvedValue({
            data: { data: { sessionId: 1, title: "新对话", status: "ACTIVE" } },
        }),
        listMessages: vi.fn().mockResolvedValue({
            data: { data: [] },
        }),
        cancelGeneration: vi.fn(),
    },
}));

vi.mock("@/composables/useAiButlerStream", () => ({
    useAiButlerStream: () => ({
        isStreaming: { value: false },
        lastEventSeq: { value: 0 },
        currentRequestId: { value: null },
        startStream: streamHarness.startStreamMock,
        reconnect: streamHarness.reconnectMock,
        cancelStream: streamHarness.cancelStreamMock,
    }),
}));

vi.mock("@/store/user", () => ({
    useUserStore: () => ({
        G_LoginInfo: {
            nickName: "测试用户",
            account: "tester",
        },
        G_UserInfo: {
            avatar: "",
        },
    }),
}));

function createTestPinia() {
    const pinia = createPinia();
    setActivePinia(pinia);
    return pinia;
}

async function flushAll(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

function buildMessageStub() {
    return {
        template: `
            <div
                class="msg-stub"
                :data-thinking="$props.isThinking ? 'yes' : 'no'"
                :data-structured="$props.structuredJson || ''"
            >
                {{ $props.content }}
            </div>
        `,
        props: [
            "role",
            "contentType",
            "content",
            "structuredJson",
            "isStreaming",
            "isThinking",
            "userInitial",
            "userAvatar",
        ],
    };
}

describe("AI Butler thinking flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        streamHarness.state.callbacks = null;
        createTestPinia();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows thinking briefly, then starts visible streaming before completion", async () => {
        const AiButlerPage = (await import("@/pages/ai-butler/index.vue"))
            .default;
        const wrapper = mount(AiButlerPage, {
            global: {
                stubs: {
                    HeaderLayout: { template: "<div></div>" },
                    AiButlerMessage: buildMessageStub(),
                    "router-link": { template: "<a></a>" },
                },
            },
        });

        await wrapper.find(".new-chat-btn").trigger("click");
        await flushAll();

        await wrapper.find("input").setValue("帮我做一份本月计划");
        await wrapper.find(".send-btn").trigger("click");
        await flushAll();

        expect(wrapper.text()).toContain("思考中........");
        expect(wrapper.text()).not.toContain("第一段回答");

        streamHarness.state.callbacks?.onDelta?.({
            messageId: 101,
            delta: "第一段回答",
        });
        await flushAll();

        expect(wrapper.text()).toContain("思考中........");
        expect(wrapper.text()).not.toContain("第一段回答");

        await vi.advanceTimersByTimeAsync(600);
        await flushAll();

        expect(wrapper.text()).not.toContain("思考中........");
        expect(wrapper.text()).toContain("第一段回答");

        streamHarness.state.callbacks?.onDelta?.({
            messageId: 101,
            delta: "，第二段回答",
        });
        await flushAll();

        expect(wrapper.text()).toContain("第一段回答，第二段回答");

        streamHarness.state.callbacks?.onCompleted?.({
            messageId: 101,
            contentType: "TEXT",
        });
        await flushAll();

        expect(wrapper.text()).toContain("第一段回答，第二段回答");
    });

    it("attaches handoff structuredJson when the stream completes", async () => {
        const AiButlerPage = (await import("@/pages/ai-butler/index.vue"))
            .default;
        const wrapper = mount(AiButlerPage, {
            global: {
                stubs: {
                    HeaderLayout: { template: "<div></div>" },
                    AiButlerMessage: buildMessageStub(),
                    "router-link": { template: "<a></a>" },
                },
            },
        });

        await wrapper.find(".new-chat-btn").trigger("click");
        await flushAll();

        await wrapper
            .find("input")
            .setValue("帮我诊断这个病情，喉咙痛感冒发烧");
        await wrapper.find(".send-btn").trigger("click");
        await flushAll();

        streamHarness.state.callbacks?.onDelta?.({
            messageId: 202,
            delta: "先给您一些基础建议",
        });
        await flushAll();

        const handoffJson = JSON.stringify({
            handoff: {
                title: "建议前往在线咨询",
                actions: [
                    {
                        label: "前往咨询",
                        targetUrl: "/consultation?tab=m2&entry=ai-butler-minor",
                    },
                ],
            },
        });

        streamHarness.state.callbacks?.onCompleted?.({
            messageId: 202,
            contentType: "TEXT",
            structuredJson: handoffJson,
        });
        await flushAll();

        const assistantMessages = wrapper.findAll(".msg-stub");
        const latestAssistant = assistantMessages[assistantMessages.length - 1];
        if (!latestAssistant) {
            throw new Error("Expected assistant message after stream completion");
        }
        expect(latestAssistant.attributes("data-structured")).toContain(
            "handoff",
        );
        expect(latestAssistant.text()).toContain("先给您一些基础建议");
    });
});
