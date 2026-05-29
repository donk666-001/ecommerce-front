import {
    ApiMenstrual,
    normalizeMenstrualPredict,
    type MenstrualPredictVO,
} from "../menstrual";
import { GAxios } from "@/plugins";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/plugins", () => ({
    GAxios: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    },
}));

const mockedGet = vi.mocked(GAxios.get);

beforeEach(() => {
    mockedGet.mockReset();
});

describe("ApiMenstrual.predict", () => {
    it("uses userId only and keeps backend prediction dates unchanged", async () => {
        const predict: MenstrualPredictVO = {
            userId: 1,
            averageCycleDays: 10,
            averagePeriodDays: 5,
            confidenceLevel: "LOW",
            confidenceScore: 0.5887012440248978,
            historyCycles: [
                { cycleDays: null, startDate: "2026-01-25" },
                { cycleDays: 15, startDate: "2026-02-09" },
                { cycleDays: 12, startDate: "2026-02-21" },
                { cycleDays: 12, startDate: "2026-03-05" },
                { cycleDays: 12, startDate: "2026-03-17" },
                { cycleDays: 12, startDate: "2026-03-29" },
                { cycleDays: 3, startDate: "2026-04-01" },
                { cycleDays: 12, startDate: "2026-04-13" },
                { cycleDays: 12, startDate: "2026-04-25" },
                { cycleDays: 6, startDate: "2026-05-01" },
                { cycleDays: 12, startDate: "2026-05-13" },
                { cycleDays: 12, startDate: "2026-05-25" },
                { cycleDays: 1, startDate: "2026-05-26" },
            ],
            lastPeriodStartDate: "2026-05-26",
            predictedNextPeriodEndDate: "2026-06-09",
            predictedNextPeriodStartDate: "2026-06-05",
        };
        mockedGet.mockResolvedValue({
            status: 200,
            data: {
                code: 200,
                message: "success",
                data: predict,
            },
        });

        const result = await ApiMenstrual.predict(1);

        expect(mockedGet).toHaveBeenCalledWith(
            "/menstrual/predict",
            expect.objectContaining({
                params: { userId: 1 },
            }),
        );
        expect(result.predictedNextPeriodStartDate).toBe("2026-06-05");
        expect(result.predictedNextPeriodEndDate).toBe("2026-06-09");
    });
});

describe("normalizeMenstrualPredict", () => {
    it("repairs daily period records into the next future cycle", () => {
        const predict: MenstrualPredictVO = {
            userId: 4,
            averageCycleDays: 5,
            averagePeriodDays: 5,
            confidenceLevel: "LOW",
            confidenceScore: 0.5,
            historyCycles: [
                { cycleDays: null, startDate: "2026-01-19" },
                { cycleDays: 1, startDate: "2026-01-20" },
                { cycleDays: 1, startDate: "2026-01-21" },
                { cycleDays: 1, startDate: "2026-01-22" },
                { cycleDays: 1, startDate: "2026-01-23" },
                { cycleDays: 24, startDate: "2026-02-16" },
                { cycleDays: 1, startDate: "2026-02-17" },
                { cycleDays: 1, startDate: "2026-02-18" },
                { cycleDays: 1, startDate: "2026-02-19" },
                { cycleDays: 1, startDate: "2026-02-20" },
                { cycleDays: 24, startDate: "2026-03-16" },
                { cycleDays: 1, startDate: "2026-03-17" },
                { cycleDays: 1, startDate: "2026-03-18" },
                { cycleDays: 1, startDate: "2026-03-19" },
                { cycleDays: 1, startDate: "2026-03-20" },
                { cycleDays: 24, startDate: "2026-04-13" },
                { cycleDays: 1, startDate: "2026-04-14" },
                { cycleDays: 1, startDate: "2026-04-15" },
                { cycleDays: 1, startDate: "2026-04-16" },
                { cycleDays: 1, startDate: "2026-04-17" },
                { cycleDays: 24, startDate: "2026-05-11" },
                { cycleDays: 1, startDate: "2026-05-12" },
                { cycleDays: 1, startDate: "2026-05-13" },
                { cycleDays: 1, startDate: "2026-05-14" },
                { cycleDays: 1, startDate: "2026-05-15" },
            ],
            lastPeriodStartDate: "2026-05-15",
            predictedNextPeriodEndDate: "2026-05-24",
            predictedNextPeriodStartDate: "2026-05-20",
        };

        const normalized = normalizeMenstrualPredict(
            predict,
            new Date(2026, 4, 28),
        );

        expect(normalized.lastPeriodStartDate).toBe("2026-05-11");
        expect(normalized.averageCycleDays).toBe(28);
        expect(normalized.averagePeriodDays).toBe(5);
        expect(normalized.predictedNextPeriodStartDate).toBe("2026-06-08");
        expect(normalized.predictedNextPeriodEndDate).toBe("2026-06-12");
    });
});
