import {
    hasProductRecommendationItems,
    resolveProductRecommendationItems,
    resolveProductRecommendationPayload,
} from "@/components/ai-butler/productRecommendation";
import { describe, expect, it } from "vitest";

describe("productRecommendation parser", () => {
    it("extracts nested payload title and summary", () => {
        const payload = resolveProductRecommendationPayload({
            productRecommendation: {
                title: "睡眠方向推荐",
                summary: "优先看助眠和睡前放松类商品。",
                data: {
                    records: [],
                },
            },
        });

        expect(payload.title).toBe("睡眠方向推荐");
        expect(payload.summary).toContain("助眠");
    });

    it("extracts records from nested data wrapper", () => {
        const records = resolveProductRecommendationItems({
            productRecommendation: {
                data: {
                    records: [
                        {
                            id: 101,
                            name: "酸枣仁饮",
                        },
                    ],
                },
            },
        });

        expect(records).toHaveLength(1);
        expect(records[0]?.id).toBe(101);
    });

    it("extracts arrays directly from payload fields", () => {
        const records = resolveProductRecommendationItems({
            items: [
                {
                    productId: 202,
                    productName: "艾草热敷枕",
                },
            ],
        });

        expect(records).toHaveLength(1);
        expect(records[0]?.productId).toBe(202);
    });

    it("detects whether a payload contains usable product records", () => {
        expect(
            hasProductRecommendationItems({
                result: {
                    data: [
                        {
                            id: 12,
                            name: "百合晚安粉",
                        },
                    ],
                },
            }),
        ).toBe(true);

        expect(
            hasProductRecommendationItems({
                products: [
                    {
                        name: "只有名字没有 id",
                    },
                ],
            }),
        ).toBe(false);
    });
});
