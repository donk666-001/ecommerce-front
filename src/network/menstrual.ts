import { GAxios } from "@/plugins";

export type MenstrualBodyStatusItem = {
    bodyStatus: number;
    painLevel: number;
};

export type MenstrualRecordCreatePayload = {
    userId: number;
    recordDate: string;
    cyclePhase: number;
    bodyStatuses: MenstrualBodyStatusItem[];
};

export type MenstrualRecordCreateVO = MenstrualRecordCreatePayload;

export type MenstrualCalendarDayVO = {
    date: string;
    currentMonth: boolean;
    hasRecord: boolean;
    cyclePhase: number;
    bodyStatus: number;
    painLevel: number;
    dayLabel: string;
};

export type MenstrualCalendarVO = {
    year: number;
    month: number;
    monthStart: string;
    monthEnd: string;
    calendarStart: string;
    calendarEnd: string;
    days: MenstrualCalendarDayVO[];
};

export type MenstrualHealthPlanVO = {
    id: number;
    cyclePhase: number;
    planName: string;
    planContent: string;
    sortOrder: number;
};

export type MenstrualDayDetailVO = {
    date: string;
    hasRecord: boolean;
    cyclePhase: number;
    bodyStatus: number;
    painLevel: number;
    bodyStatuses: MenstrualBodyStatusItem[];
    recommendations: MenstrualHealthPlanVO[];
};

export type MenstrualCycleHistoryVO = {
    startDate: string;
    cycleDays: number | null;
};

export type MenstrualPredictVO = {
    userId: number;
    lastPeriodStartDate: string;
    predictedNextPeriodStartDate: string;
    predictedNextPeriodEndDate: string;
    averageCycleDays: number;
    averagePeriodDays: number;
    confidenceLevel: string;
    confidenceScore: number;
    historyCycles: MenstrualCycleHistoryVO[];
    unavailableReason?: string;
};

type ApiEnvelope<T> = {
    code?: number;
    data?: T;
    message?: string;
};

function isApiEnvelope<T>(data: T | ApiEnvelope<T>): data is ApiEnvelope<T> {
    return (
        typeof data === "object" &&
        data !== null &&
        ("code" in data || "data" in data || "message" in data)
    );
}

function isSuccessCode(code: number | undefined) {
    return code === undefined || code === 0 || code === 200;
}

function unwrapMenstrualResponse<T>(data: T | ApiEnvelope<T>, fallback: T) {
    if (!isApiEnvelope<T>(data)) return data;
    if (isSuccessCode(data.code)) return data.data ?? fallback;
    throw new Error(data.message || "经期管理接口返回异常");
}

function createEmptyPredict(userId: number, unavailableReason?: string) {
    const fallback: MenstrualPredictVO = {
        userId,
        lastPeriodStartDate: "",
        predictedNextPeriodStartDate: "",
        predictedNextPeriodEndDate: "",
        averageCycleDays: 0,
        averagePeriodDays: 0,
        confidenceLevel: "",
        confidenceScore: 0,
        historyCycles: [],
    };
    return unavailableReason ? { ...fallback, unavailableReason } : fallback;
}

function getResponseMessage(data: unknown) {
    if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
    ) {
        return data.message;
    }
    return "";
}

function isInsufficientPredictMessage(message: string) {
    return /暂无足够|无法预测|经期记录/.test(message);
}

const MIN_CYCLE_DAYS = 15;
const MAX_CYCLE_DAYS = 60;
const DEFAULT_CYCLE_DAYS = 28;
const MIN_PERIOD_DAYS = 1;
const MAX_PERIOD_DAYS = 10;
const DEFAULT_PERIOD_DAYS = 5;

type PeriodSegment = {
    start: Date;
    end: Date;
    lengthDays: number;
};

export function normalizeMenstrualPredict(
    predict: MenstrualPredictVO,
    today = new Date(),
): MenstrualPredictVO {
    if (predict.unavailableReason) return predict;

    const todayDate = startOfLocalDay(today);
    const segments = buildPeriodSegments(predict.historyCycles);
    const historyBasedPredict = createHistoryBasedPredict(
        predict,
        segments,
        todayDate,
    );
    if (historyBasedPredict) return historyBasedPredict;

    return rollPredictionIntoFuture(predict, todayDate);
}

function createHistoryBasedPredict(
    predict: MenstrualPredictVO,
    segments: PeriodSegment[],
    today: Date,
) {
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return null;

    const cycleDays = resolveCycleDays(predict, segments);
    const periodDays = resolvePeriodDays(predict, segments);
    if (!cycleDays || !periodDays) return null;

    let predictedStart = addDays(lastSegment.start, cycleDays);
    let predictedEnd = addDays(predictedStart, periodDays - 1);
    let guard = 0;
    while (predictedEnd < today && guard < 24) {
        predictedStart = addDays(predictedStart, cycleDays);
        predictedEnd = addDays(predictedStart, periodDays - 1);
        guard += 1;
    }

    return {
        ...predict,
        lastPeriodStartDate: toISODate(lastSegment.start),
        predictedNextPeriodStartDate: toISODate(predictedStart),
        predictedNextPeriodEndDate: toISODate(predictedEnd),
        averageCycleDays: cycleDays,
        averagePeriodDays: periodDays,
    };
}

function buildPeriodSegments(historyCycles: MenstrualCycleHistoryVO[]) {
    const dates = uniqueSortedDates(
        historyCycles
            .map((item) => parseApiDate(item.startDate))
            .filter((date): date is Date => Boolean(date)),
    );
    const firstDate = dates[0];
    if (!firstDate) return [];

    const segments: PeriodSegment[] = [];
    let segmentStart = firstDate;
    let segmentEnd = firstDate;

    for (let index = 1; index < dates.length; index += 1) {
        const currentDate = dates[index];
        if (!currentDate) continue;

        if (diffDays(segmentEnd, currentDate) <= 1) {
            segmentEnd = currentDate;
            continue;
        }

        segments.push(toPeriodSegment(segmentStart, segmentEnd));
        segmentStart = currentDate;
        segmentEnd = currentDate;
    }

    segments.push(toPeriodSegment(segmentStart, segmentEnd));
    return segments;
}

function uniqueSortedDates(dates: Date[]) {
    return Array.from(
        new Map(dates.map((date) => [toISODate(date), date])).values(),
    ).sort((left, right) => left.getTime() - right.getTime());
}

function toPeriodSegment(start: Date, end: Date): PeriodSegment {
    return {
        start,
        end,
        lengthDays: diffDays(start, end) + 1,
    };
}

function resolveCycleDays(
    predict: MenstrualPredictVO,
    segments: PeriodSegment[],
) {
    const intervals: number[] = [];
    for (let index = 1; index < segments.length; index += 1) {
        const previous = segments[index - 1];
        const current = segments[index];
        if (!previous || !current) continue;

        const interval = diffDays(previous.start, current.start);
        if (isReasonableCycleDays(interval)) intervals.push(interval);
    }

    if (intervals.length) return roundedAverage(intervals);
    if (isReasonableCycleDays(predict.averageCycleDays)) {
        return Math.round(predict.averageCycleDays);
    }
    return DEFAULT_CYCLE_DAYS;
}

function resolvePeriodDays(
    predict: MenstrualPredictVO,
    segments: PeriodSegment[],
) {
    const expandedLengths = segments
        .map((segment) => segment.lengthDays)
        .filter((length) => length > 1 && isReasonablePeriodDays(length));
    if (expandedLengths.length) return roundedAverage(expandedLengths);
    if (isReasonablePeriodDays(predict.averagePeriodDays)) {
        return Math.round(predict.averagePeriodDays);
    }
    return DEFAULT_PERIOD_DAYS;
}

function rollPredictionIntoFuture(
    predict: MenstrualPredictVO,
    today: Date,
): MenstrualPredictVO {
    const start = parseApiDate(predict.predictedNextPeriodStartDate);
    const end = parseApiDate(predict.predictedNextPeriodEndDate);
    if (!start || !end || end >= today) return predict;

    const cycleDays = isReasonableCycleDays(predict.averageCycleDays)
        ? Math.round(predict.averageCycleDays)
        : DEFAULT_CYCLE_DAYS;
    const rawPeriodDays = diffDays(start, end) + 1;
    const periodDays = isReasonablePeriodDays(rawPeriodDays)
        ? rawPeriodDays
        : isReasonablePeriodDays(predict.averagePeriodDays)
          ? Math.round(predict.averagePeriodDays)
          : DEFAULT_PERIOD_DAYS;

    let predictedStart = start;
    let predictedEnd = end;
    let guard = 0;
    while (predictedEnd < today && guard < 24) {
        predictedStart = addDays(predictedStart, cycleDays);
        predictedEnd = addDays(predictedStart, periodDays - 1);
        guard += 1;
    }

    return {
        ...predict,
        predictedNextPeriodStartDate: toISODate(predictedStart),
        predictedNextPeriodEndDate: toISODate(predictedEnd),
        averageCycleDays: cycleDays,
        averagePeriodDays: periodDays,
    };
}

function isReasonableCycleDays(value: number) {
    return (
        Number.isFinite(value) &&
        value >= MIN_CYCLE_DAYS &&
        value <= MAX_CYCLE_DAYS
    );
}

function isReasonablePeriodDays(value: number) {
    return (
        Number.isFinite(value) &&
        value >= MIN_PERIOD_DAYS &&
        value <= MAX_PERIOD_DAYS
    );
}

function roundedAverage(values: number[]) {
    return Math.round(
        values.reduce((total, value) => total + value, 0) / values.length,
    );
}

function normalizeDateString(value: string | null | undefined) {
    if (!value) return "";
    return value.split("T")[0] ?? value;
}

function parseApiDate(value: string | null | undefined) {
    const normalized = normalizeDateString(value);
    if (!normalized) return null;

    const [yearText = "", monthText = "", dayText = ""] = normalized.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const parsed = new Date(year, month - 1, day);
    if (
        Number.isNaN(parsed.getTime()) ||
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return null;
    }
    return startOfLocalDay(parsed);
}

function addDays(date: Date, days: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function toISODate(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(start: Date, end: Date) {
    const millis =
        startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime();
    return Math.round(millis / 86400000);
}

class ApiMenstrual {
    static async createRecord(data: MenstrualRecordCreatePayload) {
        const response = await GAxios.post<
            MenstrualRecordCreateVO | ApiEnvelope<MenstrualRecordCreateVO>
        >("/menstrual/record", data);
        return unwrapMenstrualResponse(response.data, data);
    }

    static async getCalendar(userId: number, year: number, month: number) {
        const response = await GAxios.get<
            MenstrualCalendarVO | ApiEnvelope<MenstrualCalendarVO>
        >("/menstrual/calendar", {
            params: { userId, year, month },
        });
        return unwrapMenstrualResponse(response.data, {
            year,
            month,
            monthStart: "",
            monthEnd: "",
            calendarStart: "",
            calendarEnd: "",
            days: [],
        });
    }

    static async getDayDetail(userId: number, date: string) {
        const response = await GAxios.get<
            MenstrualDayDetailVO | ApiEnvelope<MenstrualDayDetailVO>
        >("/menstrual/day-detail", {
            params: { userId, date },
        });
        return unwrapMenstrualResponse(response.data, {
            date,
            hasRecord: false,
            cyclePhase: 0,
            bodyStatus: 0,
            painLevel: 0,
            bodyStatuses: [],
            recommendations: [],
        });
    }

    static async predict(userId: number) {
        const fallback = createEmptyPredict(userId);
        const response = await GAxios.get<
            MenstrualPredictVO | ApiEnvelope<MenstrualPredictVO>
        >("/menstrual/predict", {
            params: { userId },
            validateStatus: (status) =>
                (status >= 200 && status < 300) ||
                status === 400 ||
                status === 500,
        });
        const message = getResponseMessage(response.data);

        if (response.status >= 400) {
            if (isInsufficientPredictMessage(message)) {
                return createEmptyPredict(userId, message);
            }
            throw new Error(message || "经期预测接口返回异常");
        }

        if (
            isApiEnvelope<MenstrualPredictVO>(response.data) &&
            !isSuccessCode(response.data.code)
        ) {
            if (isInsufficientPredictMessage(message)) {
                return createEmptyPredict(userId, message);
            }
            throw new Error(message || "经期预测接口返回异常");
        }

        return normalizeMenstrualPredict(
            unwrapMenstrualResponse(response.data, fallback),
        );
    }
}

export { ApiMenstrual };
