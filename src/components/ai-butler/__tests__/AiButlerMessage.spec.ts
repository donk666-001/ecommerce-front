import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AiButlerMessage from "@/components/ai-butler/AiButlerMessage.vue";

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

/**
 * AI 管家消息组件测试。
 * 覆盖：文本渲染、结构化卡片（睡眠/计划/引用/转接）、XSS 防护。
 */

describe("AiButlerMessage", () => {
    // ─── 普通文本消息 ───

    it("渲染用户消息", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "USER",
                contentType: "TEXT",
                content: "帮我分析睡眠",
                structuredJson: undefined,
                isStreaming: false,
                userInitial: "我",
            },
        });

        // 消息文本渲染
        expect(wrapper.text()).toContain("帮我分析睡眠");
        // 用户消息有 me 类
        expect(wrapper.find(".me").exists()).toBe(true);
    });

    it("渲染 AI 回复", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "根据您的睡眠数据…",
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).toContain("根据您的睡眠数据…");
        expect(wrapper.find(".bub-ai").exists()).toBe(true);
    });

    it("流式生成时显示光标", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "正在生成…",
                structuredJson: undefined,
                isStreaming: true,
            },
        });

        expect(wrapper.find(".cursor").exists()).toBe(true);
    });

    // ─── 结构化卡片渲染 ───

    it("渲染睡眠分析卡片", () => {
        const sleepData = JSON.stringify({
            sleepSummary: {
                days: 7,
                coveredDays: 5,
                averageSleepMinutes: 420,
                averageQuality: 3.5,
                deepRatio: 0.3,
                remRatio: 0.25,
                trend: "改善中",
            },
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "SLEEP_ANALYSIS",
                content: "",
                structuredJson: sleepData,
                isStreaming: false,
            },
        });

        // 显示标签
        expect(wrapper.text()).toContain("AI 管家 · 睡眠分析");
        // 显示数据
        expect(wrapper.text()).toContain("7h 0min");
        expect(wrapper.text()).toContain("改善中");
        // 免责声明
        expect(wrapper.text()).toContain("不替代专业医疗建议");
    });

    it("渲染养生计划卡片", () => {
        const planData = JSON.stringify({
            plan: {
                days: 30,
                title: "30 天养生计划",
                goal: "改善睡眠质量",
                dimensions: [
                    {
                        type: "diet",
                        icon: "🥗",
                        label: "饮食",
                        items: [
                            { label: "早餐", value: "燕麦粥" },
                            { label: "晚餐", value: "清淡蔬菜" },
                        ],
                    },
                ],
            },
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "WELLNESS_PLAN",
                content: "",
                structuredJson: planData,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).toContain("AI 管家 · 制定计划");
        expect(wrapper.text()).toContain("30 天养生计划");
        expect(wrapper.text()).toContain("改善睡眠质量");
        expect(wrapper.text()).toContain("燕麦粥");
        // 标签金色样式
        expect(wrapper.find(".tag-gold").exists()).toBe(true);
    });

    it("渲染引用列表", () => {
        const citationData = JSON.stringify({
            citations: [
                { title: "春季养生食谱", sourceType: "节气养生", tags: ["春季", "食疗"] },
                { title: "八段锦教程", sourceType: "运动养生", tags: ["运动"] },
            ],
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "以下是一些建议：",
                structuredJson: citationData,
                isStreaming: false,
            },
        });

        // 引用列表渲染
        expect(wrapper.text()).toContain("春季养生食谱");
        expect(wrapper.text()).toContain("八段锦教程");
        expect(wrapper.text()).toContain("节气养生");
        expect(wrapper.text()).toContain("春季");
    });

    it("渲染医疗转接卡片", () => {
        const handoffData = JSON.stringify({
            title: "建议前往在线咨询",
            description: "该问题涉及医疗判断，建议咨询医师",
            actions: [
                {
                    label: "前往咨询",
                    targetUrl: "/consultation?tab=m2&entry=ai-butler-medical",
                },
            ],
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "HANDOFF",
                content: "",
                structuredJson: handoffData,
                isStreaming: false,
            },
            global: {
                stubs: { "router-link": true },
            },
        });

        expect(wrapper.text()).toContain("AI 管家 · 转专家");
        expect(wrapper.text()).toContain("前往咨询");
        // 标签朱砂色
        expect(wrapper.find(".tag-cinnabar").exists()).toBe(true);
    });

    it("渲染错误消息", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "ERROR",
                content: "服务暂时不可用",
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).toContain("服务暂时不可用");
        expect(wrapper.find(".error-text").exists()).toBe(true);
    });

    // ─── XSS 防护 ───

    it("普通文本不渲染 HTML 标签（防止 XSS）", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: '<script>alert("xss")</script>',
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        // 不应渲染为 HTML 元素（文本显示而非执行）
        expect(wrapper.find("script").exists()).toBe(false);
        // 文本内容应保留
        expect(wrapper.text()).toContain('<script>alert("xss")</script>');
    });

    it("HTML 实体不被解析", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "<img src=x onerror=alert(1)>",
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        // img 不应被渲染为 DOM 元素
        expect(wrapper.find("img").exists()).toBe(false);
        // 原始文本保留
        expect(wrapper.text()).toContain("<img src=x onerror=alert(1)>");
    });

    it("STRucturedJson 中的 HTML 不被解析为 DOM", () => {
        const xssJson = JSON.stringify({
            title: '<script>alert("bad")</script>',
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "safe text",
                structuredJson: xssJson,
                isStreaming: false,
            },
        });

        // structuredJson 内容只通过 JSON.parse 读取，不经过 v-html
        expect(wrapper.find("script").exists()).toBe(false);
    });

    // ─── 新卡片类型 ───

    it("渲染 EMERGENCY 卡片", () => {
        const emergencyJson = JSON.stringify({
            type: "emergency",
            title: "紧急情况，请立即就医",
            description: "请立即拨打 120",
            actions: [{ code: "CALL_120", label: "拨打 120", phone: "120" }],
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "EMERGENCY",
                content: "您描述的情况可能是紧急医疗状况",
                structuredJson: emergencyJson,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).toContain("AI 管家 · 紧急提示");
        expect(wrapper.find("a[href='tel:120']").exists()).toBe(true);
        expect(wrapper.find(".tag-error").exists()).toBe(true);
    });

    it("TEXT 消息含 handoff 时底部追加咨询卡片", () => {
        const handoffWrapped = JSON.stringify({
            handoff: {
                type: "handoff",
                title: "建议前往在线咨询",
                description: "AI 养生建议已生成，如需专业医师意见请前往咨询。",
                actions: [
                    {
                        code: "GO_TO_CONSULTATION",
                        label: "前往咨询",
                        targetUrl: "/consultation?tab=m2&entry=ai-butler-minor",
                    },
                ],
            },
        });

        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "感冒期间多喝温水，注意休息。",
                structuredJson: handoffWrapped,
                isStreaming: false,
            },
            global: { stubs: { "router-link": true } },
        });

        // 文字内容正常展示
        expect(wrapper.text()).toContain("感冒期间多喝温水");
        // 底部咨询卡片展示
        expect(wrapper.text()).toContain("前往咨询");
    });

    it("TEXT 消息无 handoff 时不渲染咨询卡片", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "今天适合喝红枣枸杞茶。",
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).not.toContain("前往咨询");
    });

    // ─── 边界情况 ───

    it("空内容不崩溃", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "",
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        expect(wrapper.find(".bubble").exists()).toBe(true);
    });

    it("无效 structuredJson 不崩溃", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "SLEEP_ANALYSIS",
                content: "",
                structuredJson: "invalid json {{{",
                isStreaming: false,
            },
        });

        // 应优雅降级
        expect(() => wrapper.vm).not.toThrow();
    });

    it("SYSTEM 角色渲染 AI 样式", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "SYSTEM",
                contentType: "TEXT",
                content: "系统提示",
                structuredJson: undefined,
                isStreaming: false,
            },
        });

        // SYSTEM 视为非用户消息
        expect(wrapper.find(".me").exists()).toBe(false);
    });
});
