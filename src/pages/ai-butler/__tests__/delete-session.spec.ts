import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteSessionMock = vi.fn().mockResolvedValue({ data: { data: true } });

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
        deleteSession: deleteSessionMock,
        cancelGeneration: vi.fn(),
    },
}));

vi.mock("@/composables/useAiButlerStream", () => ({
    useAiButlerStream: () => ({
        isStreaming: { value: false },
        lastEventSeq: { value: 0 },
        currentRequestId: { value: null },
        startStream: vi.fn(),
        reconnect: vi.fn(),
        cancelStream: vi.fn(),
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

describe("AI Butler delete session dialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createTestPinia();
    });

    it("opens a styled dialog and deletes the current session after confirmation", async () => {
        const AiButlerPage = (await import("@/pages/ai-butler/index.vue"))
            .default;
        const wrapper = mount(AiButlerPage, {
            global: {
                stubs: {
                    HeaderLayout: { template: "<div></div>" },
                    AiButlerMessage: {
                        template:
                            '<div class="msg-stub">{{ $props.content }}</div>',
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
                    },
                    "router-link": { template: "<a></a>" },
                },
            },
        });

        await wrapper.find(".new-chat-btn").trigger("click");
        await flushAll();

        await wrapper.find(".history-delete-btn").trigger("click");
        await flushAll();

        expect(wrapper.find(".session-dialog-overlay").exists()).toBe(true);
        expect(wrapper.text()).toContain("确认删除这段对话吗？");
        expect(wrapper.text()).toContain("新对话");
        expect(deleteSessionMock).not.toHaveBeenCalled();

        await wrapper.find(".session-dialog__btn--danger").trigger("click");
        await flushAll();

        expect(deleteSessionMock).toHaveBeenCalledWith(1);
        expect(wrapper.find(".session-dialog-overlay").exists()).toBe(false);
        expect(wrapper.find(".welcome-state").exists()).toBe(true);
        expect(wrapper.find(".history-item").exists()).toBe(false);
    });
});
