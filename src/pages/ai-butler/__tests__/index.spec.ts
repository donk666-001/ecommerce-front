import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, vi, beforeEach } from "vitest";

const startStreamMock = vi.fn();

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

function createTestPinia() {
    const pinia = createPinia();
    setActivePinia(pinia);
    return pinia;
}

vi.mock("@/network", () => ({
    ApiSeasonalHealth: {
        getCurrent: vi.fn().mockResolvedValue({
            solarTerm: { termName: "小暑" },
        }),
    },
    ApiAiButler: {
        listSessions: vi.fn().mockResolvedValue({
            data: { data: [] },
        }),
        createSession: vi.fn().mockResolvedValue({
            data: { data: { sessionId: 1, title: "新对话" } },
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
        startStream: startStreamMock,
        reconnect: vi.fn(),
        cancelStream: vi.fn(),
    }),
}));

vi.mock("@/store/user", () => ({
    useUserStore: () => ({
        G_LoginInfo: {
            nickName: "测试用户",
            account: "test_user",
        },
        G_UserInfo: {
            avatar: "",
        },
    }),
}));

describe("AI 管家页面", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createTestPinia();
    });

    async function mountPage() {
        const AiButlerPage = (await import("@/pages/ai-butler/index.vue"))
            .default;
        return mount(AiButlerPage, {
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
                            "userInitial",
                            "userAvatar",
                        ],
                    },
                    "router-link": { template: "<a></a>" },
                },
            },
        });
    }

    it("渲染页面基础结构", async () => {
        const wrapper = await mountPage();

        expect(wrapper.text()).toContain("AI 管家");
        expect(wrapper.find(".hero").exists()).toBe(true);
    });

    it("模板 HTML 不包含社区打卡入口", async () => {
        const wrapper = await mountPage();
        const html = wrapper.html();

        expect(html).not.toMatch(/check.?in|签到|打卡/i);
        expect(html).not.toMatch(/community|社区动态/i);
    });

    it("不展示伪商城信息或交易动作", async () => {
        const wrapper = await mountPage();
        const html = wrapper.html();

        expect(html).not.toMatch(/购物车|加入购物车|下单/i);
        expect(html).not.toMatch(/价格|¥|￥|\$\d+/i);
        expect(html).not.toMatch(/商品详情|立即购买/i);
    });

    it("显示 AI 免责声明", async () => {
        const wrapper = await mountPage();

        expect(wrapper.text()).toContain("AI 生成内容，仅供参考");
        expect(wrapper.text()).toContain("咨询专业医师");
    });

    it("快速提示区保留商品推荐入口，但不出现交易动作文案", async () => {
        const wrapper = await mountPage();

        const prompts = wrapper.findAll(".quick-prompt");
        expect(prompts.length).toBeGreaterThanOrEqual(6);

        const allText = prompts.map((btn) => btn.text()).join(" ");
        expect(allText).toContain("商品推荐");
        expect(allText).not.toMatch(/购物车|下单|立即购买|价格/);
    });

    it("点击商品推荐入口时发起 AI 会话请求", async () => {
        const wrapper = await mountPage();
        await wrapper.find(".new-chat-btn").trigger("click");
        await Promise.resolve();
        const buttons = wrapper.findAll(".quick-prompt");
        const productButton = buttons.find((btn) =>
            btn.text().includes("商品推荐"),
        );

        expect(productButton).toBeTruthy();
        await productButton!.trigger("click");

        expect(startStreamMock).toHaveBeenCalledTimes(1);
        const request = startStreamMock.mock.calls[0]?.[0];
        expect(request).toBeTruthy();
        expect(request.message).toContain("根据我的体质推荐适合的养生商品");
    });

    it("无会话时显示欢迎状态", async () => {
        const wrapper = await mountPage();

        expect(wrapper.find(".welcome-state").exists()).toBe(true);
    });

    it("医疗关键词输入时不再在输入框上方提前显示咨询入口", async () => {
        const wrapper = await mountPage();

        await wrapper.find(".new-chat-btn").trigger("click");
        await Promise.resolve();
        const input = wrapper.find("input");
        await input.setValue("帮我诊断这个病情");

        expect(wrapper.find(".consult-shortcut").exists()).toBe(false);
        expect(wrapper.text()).not.toContain("前往名医健康圈在线咨询");
    });
});
