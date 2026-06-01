import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import EmergencyCard from "@/components/ai-butler/EmergencyCard.vue";

const emergencyJson = JSON.stringify({
    type: "emergency",
    urgency: "EMERGENCY",
    title: "紧急情况，请立即就医",
    description: "您描述的情况可能是紧急医疗状况，请立即拨打 120 或前往最近急诊科。",
    actions: [{ code: "CALL_120", label: "拨打 120", phone: "120" }],
});

describe("EmergencyCard", () => {
    it("渲染 structuredJson 中的标题", () => {
        const wrapper = mount(EmergencyCard, { props: { structuredJson: emergencyJson } });
        expect(wrapper.find("h6").text()).toBe("紧急情况，请立即就医");
    });

    it("渲染 structuredJson 中的描述", () => {
        const wrapper = mount(EmergencyCard, { props: { structuredJson: emergencyJson } });
        expect(wrapper.find("p").text()).toContain("拨打 120");
    });

    it("拨打按钮 href 为 tel:120", () => {
        const wrapper = mount(EmergencyCard, { props: { structuredJson: emergencyJson } });
        expect(wrapper.find("a").attributes("href")).toBe("tel:120");
    });

    it("按钮文字来自 actions[0].label", () => {
        const wrapper = mount(EmergencyCard, { props: { structuredJson: emergencyJson } });
        expect(wrapper.find("a").text()).toBe("拨打 120");
    });

    it("无 structuredJson 时显示默认标题", () => {
        const wrapper = mount(EmergencyCard);
        expect(wrapper.find("h6").text()).toBe("紧急情况，请立即就医");
    });

    it("无 structuredJson 时仍渲染 tel:120 链接", () => {
        const wrapper = mount(EmergencyCard);
        expect(wrapper.find("a").attributes("href")).toBe("tel:120");
    });

    it("无效 structuredJson 不崩溃", () => {
        const wrapper = mount(EmergencyCard, { props: { structuredJson: "invalid{{" } });
        expect(() => wrapper.find("h6")).not.toThrow();
    });
});
