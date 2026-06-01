import { GAxiosWithCredentials } from "@/plugins";

export type EmotionRecordCreatePayload = {
    userId: number;
    recordDate: string;
    emotionScore: number;
    note: string;
};

export type EmotionRecordVO = {
    id?: number | string;
    userId: number;
    recordDate: string;
    emotionScore: number;
    emotionText: string;
    note: string;
};

export type DayEmotionVO = {
    recordDate: string;
    emotionScore: number;
    emotionText: string;
};

export type Emotion17DaysVO = {
    userId: number;
    days: DayEmotionVO[];
    averageScore: number;
    averageText: string;
};

export type PsychScaleOptionVO = {
    optionCode: string;
    optionText: string;
};

export type PsychScaleQuestionVO = {
    questionNo: string;
    questionText: string;
    reverseScore: number;
    sortOrder: number;
    options: PsychScaleOptionVO[];
};

export type PsychScaleAnswerDTO = {
    questionNo: string;
    optionCode: string;
};

export type PsychScaleTestSubmitPayload = {
    userId: number;
    answers: PsychScaleAnswerDTO[];
};

export type PsychScaleAnswerVO = {
    questionNo: string;
    questionText: string;
    optionCode: string;
    optionText: string;
    scoreValue: number;
    reverseScored: number;
};

export type PsychScaleLatestVO = {
    testDate?: string;
    userId?: number;
    scaleCode: string;
    scaleName: string;
    rawScore: number;
    standardScore: number;
    resultLevel: string;
    resultDesc: string;
    resultJson?: string;
    dimensionScores?: Record<string, number>;
    answers?: PsychScaleAnswerVO[];
};

type RawPsychScaleLatestVO = Omit<
    PsychScaleLatestVO,
    "answers" | "dimensionScores"
> & {
    answers?: PsychScaleAnswerVO[] | string;
    dimensionScores?: Record<string, number> | string;
};

type ApiEnvelope<T> = {
    code?: number;
    data?: T;
    result?: T;
    payload?: T;
    message?: string;
    msg?: string;
    success?: boolean;
};

function isApiEnvelope<T>(data: T | ApiEnvelope<T>): data is ApiEnvelope<T> {
    return (
        typeof data === "object" &&
        data !== null &&
        ("code" in data ||
            "data" in data ||
            "result" in data ||
            "payload" in data ||
            "message" in data ||
            "msg" in data ||
            "success" in data)
    );
}

function isSuccessCode(code: number | undefined, success?: boolean) {
    return (
        success !== false && (code === undefined || code === 0 || code === 200)
    );
}

function unwrapEmotionResponse<T>(data: T | ApiEnvelope<T>, fallback: T) {
    if (!isApiEnvelope<T>(data)) return data;
    if (isSuccessCode(data.code, data.success)) {
        return data.data ?? data.result ?? data.payload ?? fallback;
    }
    throw new Error(data.message || data.msg || "情绪疗愈接口返回异常");
}

function parseJsonArray<T>(value: unknown, fallback: T[]) {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== "string" || !value.trim()) return fallback;
    if (value.trim() === "##default") return fallback;
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
        return fallback;
    }
}

function parseJsonObject(value: unknown) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    if (typeof value !== "string" || !value.trim()) return {};
    if (value.trim() === "##default") return {};
    try {
        const parsed: unknown = JSON.parse(value);
        return typeof parsed === "object" &&
            parsed !== null &&
            !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
}

function normalizeNumberMap(value: unknown) {
    return Object.fromEntries(
        Object.entries(parseJsonObject(value))
            .map(([key, item]) => [key, Number(item)] as const)
            .filter((entry): entry is readonly [string, number] =>
                Number.isFinite(entry[1]),
            ),
    );
}

function normalizeQuestions(questions: PsychScaleQuestionVO[]) {
    return [...questions]
        .map((question) => ({
            ...question,
            options: parseJsonArray<PsychScaleOptionVO>(question.options, []),
        }))
        .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));
}

function normalizeEmotion17Days(data: Emotion17DaysVO): Emotion17DaysVO {
    return {
        ...data,
        days: parseJsonArray<DayEmotionVO>(data.days, []),
    };
}

function normalizeScaleLatest(data: RawPsychScaleLatestVO): PsychScaleLatestVO {
    const dimensionScores = normalizeNumberMap(data.dimensionScores);
    const answers = parseJsonArray<PsychScaleAnswerVO>(data.answers, []);
    const normalized: PsychScaleLatestVO = {
        scaleCode: data.scaleCode,
        scaleName: data.scaleName,
        rawScore: normalizeNumber(data.rawScore),
        standardScore: normalizeNumber(data.standardScore),
        resultLevel: data.resultLevel,
        resultDesc: data.resultDesc,
    };
    if (data.testDate !== undefined) normalized.testDate = data.testDate;
    if (data.userId !== undefined) normalized.userId = data.userId;
    if (data.resultJson !== undefined) normalized.resultJson = data.resultJson;

    if (Object.keys(dimensionScores).length) {
        normalized.dimensionScores = dimensionScores;
    } else {
        delete normalized.dimensionScores;
    }
    if (answers.length) {
        normalized.answers = answers;
    } else {
        delete normalized.answers;
    }

    return normalized;
}

function normalizeScaleLatestList(data: RawPsychScaleLatestVO[]) {
    return data.map((item) => normalizeScaleLatest(item));
}

function normalizeNumber(value: unknown) {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
}

class ApiPsychScale {
    static async getScaleQuestions(scaleCode: string) {
        const response = await GAxiosWithCredentials.get<
            PsychScaleQuestionVO[] | ApiEnvelope<PsychScaleQuestionVO[]>
        >(`/psych-scale/${scaleCode}/questions`);
        return normalizeQuestions(unwrapEmotionResponse(response.data, []));
    }

    static async submitScaleTest(
        scaleCode: string,
        data: PsychScaleTestSubmitPayload,
    ) {
        const response = await GAxiosWithCredentials.post<
            RawPsychScaleLatestVO | ApiEnvelope<RawPsychScaleLatestVO>
        >(`/psych-scale/${scaleCode}/test`, data);
        const fallback: RawPsychScaleLatestVO = {
            userId: data.userId,
            scaleCode,
            scaleName: scaleCode,
            rawScore: 0,
            standardScore: 0,
            resultLevel: "",
            resultDesc: "",
        };
        return normalizeScaleLatest(
            unwrapEmotionResponse(response.data, fallback),
        );
    }

    static async getScaleHistory(scaleCode: string, userId: number) {
        const response = await GAxiosWithCredentials.get<
            RawPsychScaleLatestVO[] | ApiEnvelope<RawPsychScaleLatestVO[]>
        >(`/psych-scale/${scaleCode}/history`, {
            params: { userId },
        });
        return normalizeScaleLatestList(
            unwrapEmotionResponse(response.data, []),
        );
    }

    static async getScaleLatest(scaleCode: string, userId: number) {
        const response = await GAxiosWithCredentials.get<
            RawPsychScaleLatestVO | ApiEnvelope<RawPsychScaleLatestVO | null>
        >(`/psych-scale/${scaleCode}/latest`, {
            params: { userId },
            validateStatus: (status) =>
                (status >= 200 && status < 300) || status === 404,
        });
        if (response.status === 404) return null;
        const result = unwrapEmotionResponse(response.data, null);
        return result ? normalizeScaleLatest(result) : null;
    }
}

class ApiEmotion {
    static async createRecord(data: EmotionRecordCreatePayload) {
        const response = await GAxiosWithCredentials.post<
            EmotionRecordVO | ApiEnvelope<EmotionRecordVO>
        >("/emotion/record", data);
        return unwrapEmotionResponse(response.data, data as EmotionRecordVO);
    }

    static async getLast17Days(userId: number) {
        const fallback: Emotion17DaysVO = {
            userId,
            days: [],
            averageScore: 0,
            averageText: "",
        };
        const response = await GAxiosWithCredentials.get<
            Emotion17DaysVO | ApiEnvelope<Emotion17DaysVO>
        >("/emotion/last-17-days", {
            params: { userId },
        });
        return normalizeEmotion17Days(
            unwrapEmotionResponse(response.data, fallback),
        );
    }

    static getScaleQuestions(scaleCode: string) {
        return ApiPsychScale.getScaleQuestions(scaleCode);
    }

    static submitScaleTest(
        scaleCode: string,
        data: PsychScaleTestSubmitPayload,
    ) {
        return ApiPsychScale.submitScaleTest(scaleCode, data);
    }

    static getScaleHistory(scaleCode: string, userId: number) {
        return ApiPsychScale.getScaleHistory(scaleCode, userId);
    }

    static getScaleLatest(scaleCode: string, userId: number) {
        return ApiPsychScale.getScaleLatest(scaleCode, userId);
    }
}

export { ApiEmotion, ApiPsychScale };
