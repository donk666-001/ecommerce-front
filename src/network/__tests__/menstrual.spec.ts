import {
    normalizeMenstrualPredict,
    type MenstrualPredictVO,
} from "../menstrual";
import { describe, expect, it } from "vitest";

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
