import { GAxios } from "@/plugins";

export type SleepStageDTO = {
    stage: string;
    start: string;
    end: string;
};

export type SleepRecordDTO = {
    id?: number | string;
    userId?: number;
    date?: string;
    recordDate?: string;
    sleepDate?: string;
    sleepTime?: string;
    wakeTime?: string;
    quality?: number;
    sleepQuality?: number;
    sleepStage?: string;
    awakeCount?: number;
    wakeCount?: number;
    tags?: string[] | string;
    sleepTagsJson?: string;
    stages?: SleepStageDTO[] | string;
    durationMinutes?: number;
    deepSleepRate?: number;
    score?: number;
};

export type SleepRecordPayload = {
    id?: number | string;
    userId: number;
    sleepTime: string;
    wakeTime: string;
    sleepQuality: number;
    sleepStage: string;
    sleepTagsJson: string;
};

export type SleepWeeklyStatDTO = {
    id?: number | string;
    userId?: number;
    date?: string;
    recordDate?: string;
    sleepDate?: string;
    sleepTime?: string;
    wakeTime?: string;
    sleepQuality?: number;
    sleepStage?: string;
    sleepTagsJson?: string;
    durationMinutes?: number;
    duration?: number;
    sleepMinutes?: number;
    totalSleepMinutes?: number;
    sleepDuration?: number;
    totalMinutes?: number;
    durationHours?: number;
    sleepHours?: number;
    totalHours?: number;
    score?: number;
};

type SleepWeeklyStatsPayload =
    | SleepWeeklyStatDTO[]
    | {
          records?: SleepWeeklyStatDTO[];
          rows?: SleepWeeklyStatDTO[];
          list?: SleepWeeklyStatDTO[];
          stats?: SleepWeeklyStatDTO[];
          weeklyStats?: SleepWeeklyStatDTO[];
      };

type ApiEnvelope<T> = {
    code?: number;
    data?: T;
    message?: string;
};

function unwrapSleepResponse<T>(data: T | ApiEnvelope<T>, fallback: T) {
    if (isApiEnvelope<T>(data)) {
        if (data.code === 200) return data.data ?? fallback;
        throw new Error(data.message || "睡眠接口返回异常");
    }
    return data;
}

function isApiEnvelope<T>(data: T | ApiEnvelope<T>): data is ApiEnvelope<T> {
    return (
        typeof data === "object" &&
        data !== null &&
        ("code" in data || "data" in data || "message" in data)
    );
}

function normalizeWeeklyStats(data: SleepWeeklyStatsPayload) {
    if (Array.isArray(data)) return data;
    return (
        data.records ??
        data.rows ??
        data.list ??
        data.stats ??
        data.weeklyStats ??
        []
    );
}

class ApiSleep {
    static async createRecord(data: SleepRecordPayload) {
        const response = await GAxios.post<
            SleepRecordDTO | ApiEnvelope<SleepRecordDTO>
        >("/sleep-records", data);
        return unwrapSleepResponse(response.data, data as SleepRecordDTO);
    }

    static async updateRecord(data: SleepRecordPayload) {
        const response = await GAxios.put<
            SleepRecordDTO | ApiEnvelope<SleepRecordDTO>
        >("/sleep-records/update", data);
        return unwrapSleepResponse(response.data, data as SleepRecordDTO);
    }

    static async getRecordByDate(userId: number, date: string) {
        const response = await GAxios.get<
            SleepRecordDTO | null | ApiEnvelope<SleepRecordDTO | null>
        >("/sleep-records/date", {
            params: { userId, date },
        });
        return unwrapSleepResponse<SleepRecordDTO | null>(response.data, null);
    }

    static async getWeeklyStats(userId: number) {
        const response = await GAxios.get<
            SleepWeeklyStatsPayload | ApiEnvelope<SleepWeeklyStatsPayload>
        >("/sleep-records/weekly-stats", {
            params: { userId },
        });
        return normalizeWeeklyStats(unwrapSleepResponse(response.data, []));
    }
}

export { ApiSleep };
