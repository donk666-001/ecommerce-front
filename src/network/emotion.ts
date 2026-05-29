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
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
        return fallback;
    }
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
            PsychScaleLatestVO | ApiEnvelope<PsychScaleLatestVO>
        >(`/psych-scale/${scaleCode}/test`, data);
        const fallback: PsychScaleLatestVO = {
            userId: data.userId,
            scaleCode,
            scaleName: scaleCode,
            rawScore: 0,
            standardScore: 0,
            resultLevel: "",
            resultDesc: "",
        };
        return unwrapEmotionResponse(response.data, fallback);
    }

    static async getScaleHistory(scaleCode: string, userId: number) {
        const response = await GAxiosWithCredentials.get<
            PsychScaleLatestVO[] | ApiEnvelope<PsychScaleLatestVO[]>
        >(`/psych-scale/${scaleCode}/history`, {
            params: { userId },
        });
        return unwrapEmotionResponse(response.data, []);
    }

    static async getScaleLatest(scaleCode: string, userId: number) {
        const response = await GAxiosWithCredentials.get<
            PsychScaleLatestVO | ApiEnvelope<PsychScaleLatestVO | null>
        >(`/psych-scale/${scaleCode}/latest`, {
            params: { userId },
            validateStatus: (status) =>
                (status >= 200 && status < 300) || status === 404,
        });
        if (response.status === 404) return null;
        return unwrapEmotionResponse(response.data, null);
    }
}

export { ApiEmotion };
