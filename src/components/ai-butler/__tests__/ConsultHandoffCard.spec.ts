import ConsultHandoffCard from "@/components/ai-butler/ConsultHandoffCard.vue";
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

describe("ConsultHandoffCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("使用结构化卡片里的在线咨询地址", async () => {
        const wrapper = mount(ConsultHandoffCard, {
            props: {
                content: "此问题涉及病情判断或诊疗建议",
                structuredJson: JSON.stringify({
                    title: "建议前往在线咨询",
                    description:
                        "此问题涉及病情判断或诊疗建议，AI 管家不作诊断。",
                    actions: [
                        {
                            label: "前往咨询",
                            targetUrl:
                                "/consultation?tab=m2&entry=ai-butler-medical",
                        },
                    ],
                }),
            },
        });

        expect(wrapper.text()).toContain("建议前往在线咨询");
        expect(wrapper.text()).toContain("前往咨询");

        await wrapper.find(".handoff-btn").trigger("click");

        expect(pushMock).toHaveBeenCalledWith(
            "/consultation?tab=m2&entry=ai-butler-medical",
        );
    });

    it("没有结构化数据时使用默认在线咨询地址", async () => {
        const wrapper = mount(ConsultHandoffCard, {
            props: {
                content: "建议直接联系专业医师在线咨询。",
            },
        });

        await wrapper.find(".handoff-btn").trigger("click");

        expect(pushMock).toHaveBeenCalledWith(
            "/consultation?tab=m2&entry=ai-butler-medical",
        );
    });
});
