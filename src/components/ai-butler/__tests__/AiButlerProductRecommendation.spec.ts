import AiButlerMessage from "@/components/ai-butler/AiButlerMessage.vue";
import ProductRecommendationCard from "@/components/ai-butler/ProductRecommendationCard.vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn().mockResolvedValue(undefined);

vi.mock("vue-router", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

const recommendationJson = JSON.stringify({
    title: "为你推荐 2 款养生商品",
    summary: "根据你最近入睡偏慢、易醒的情况，优先推荐安神助眠方向。",
    products: [
        {
            id: 12,
            name: "酸枣仁晚安茶",
            discountPrice: 59,
            originalPrice: 79,
            efficacy: "安神助眠",
            description: "晚间饮用更适合放松入睡。",
            tags: ["助眠", "安神"],
            categoryName: "养生茶饮",
            stock: 18,
        },
        {
            productId: 31,
            productName: "艾草热敷眼罩",
            price: 89,
            reason: "适合睡前热敷，帮助眼周放松。",
            tags: "睡前放松,热敷",
            categoryName: "养生器具",
            stock: 40,
        },
    ],
});

const nestedRecommendationJson = JSON.stringify({
    productRecommendation: {
        title: "睡眠方向商品推荐",
        data: {
            records: [
                {
                    id: 88,
                    name: "百合酸枣仁粉",
                    discountPrice: 69,
                    recommendationReason: "更适合晚间冲饮，减少夜间惊醒。",
                    tags: ["晚间冲饮", "助眠"],
                },
            ],
        },
    },
});

describe("AI 商品推荐卡片", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("解析 structuredJson 并跳转到商品详情", async () => {
        const wrapper = mount(ProductRecommendationCard, {
            props: {
                content: "根据你的睡眠情况，为你推荐以下商品。",
                structuredJson: recommendationJson,
            },
        });

        expect(wrapper.text()).toContain("为你推荐 2 款养生商品");
        expect(wrapper.text()).toContain("酸枣仁晚安茶");
        expect(wrapper.text()).toContain("艾草热敷眼罩");
        expect(wrapper.findAll(".product-rec__item")).toHaveLength(2);

        await wrapper.find(".product-rec__action").trigger("click");

        expect(pushMock).toHaveBeenCalledWith({
            path: "/shop",
            query: { open: "p12" },
        });
    });

    it("在 TEXT 消息中渲染商品推荐卡片", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "TEXT",
                content: "根据你的睡眠情况，为你推荐以下商品。",
                structuredJson: recommendationJson,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).toContain("AI 管家 · 商品推荐");
        expect(wrapper.findAll(".product-rec__item")).toHaveLength(2);
        expect(wrapper.find(".full").exists()).toBe(true);
    });

    it("兼容嵌套的 data.records 推荐结果", () => {
        const wrapper = mount(AiButlerMessage, {
            props: {
                role: "ASSISTANT",
                contentType: "PRODUCT_RECOMMENDATION",
                content: "这是基于睡眠状态给出的推荐。",
                structuredJson: nestedRecommendationJson,
                isStreaming: false,
            },
        });

        expect(wrapper.text()).toContain("AI 管家 · 商品推荐");
        expect(wrapper.text()).toContain("百合酸枣仁粉");
        expect(wrapper.findAll(".product-rec__item")).toHaveLength(1);
    });
});
