import AiButlerMessage from "@/components/ai-butler/AiButlerMessage.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe("AiButlerMessage avatar", () => {
    it("renders the user avatar image when a URL is provided", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "USER",
                contentType: "TEXT",
                content: "帮我分析睡眠",
                userInitial: "我",
                userAvatar: "https://example.com/avatar.png",
            },
        });

        const avatarImage = wrapper.find(".msg-avatar-img");
        expect(avatarImage.exists()).toBe(true);
        expect(avatarImage.attributes("src")).toBe(
            "https://example.com/avatar.png",
        );
        expect(wrapper.find(".msg-avatar").text()).toBe("");
    });

    it("falls back to the user initial when the avatar image fails to load", async () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "USER",
                contentType: "TEXT",
                content: "帮我分析睡眠",
                userInitial: "我",
                userAvatar: "https://example.com/broken-avatar.png",
            },
        });

        await wrapper.find(".msg-avatar-img").trigger("error");

        expect(wrapper.find(".msg-avatar-img").exists()).toBe(false);
        expect(wrapper.find(".msg-avatar").text()).toContain("我");
    });
});
