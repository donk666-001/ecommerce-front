import AiButlerMessage from "@/components/ai-butler/AiButlerMessage.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

describe("AiButlerMessage thinking state", () => {
    it("renders an animated thinking placeholder without the streaming cursor", () => {
        const placeholder = "\u601D\u8003\u4E2D........";
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: placeholder,
                isThinking: true,
                isStreaming: true,
            },
        });

        expect(wrapper.find(".thinking-text").text()).toBe(placeholder);
        expect(wrapper.find(".thinking-label").text()).toBe(
            "\u601D\u8003\u4E2D",
        );
        expect(wrapper.findAll(".thinking-dot")).toHaveLength(8);
        expect(wrapper.find(".cursor").exists()).toBe(false);
    });
});
