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
    bedTime?: string;
    bedtime?: string;
    startTime?: string;
    wakeTime?: string;
    endTime?: string;
    quality?: number;
    sleepQuality?: number;
    sleepStage?: string;
    awakeCount?: number;
    wakeCount?: number;
    tags?: string[] | string;
    sleepTagsJson?: string;
    stages?: SleepStageDTO[] | string;
    durationMinutes?: number;
    durationMinute?: number;
    durationInMinutes?: number;
    duration?: number;
    sleepMinutes?: number;
    sleepingMinutes?: number;
    totalSleepMinutes?: number;
    sleepDuration?: number;
    sleepDurationMinutes?: number;
    totalMinutes?: number;
    totalDuration?: number;
    totalDurationMinutes?: number;
    totalAsleepMinutes?: number;
    minutes?: number;
    durationHours?: number;
    sleepHours?: number;
    sleepingHours?: number;
    totalHours?: number;
    hours?: number;
    deepSleepRate?: number;
    score?: number;
    createdAt?: string;
    updatedAt?: string;
    createTime?: string;
    updateTime?: string;
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
    statDate?: string;
    day?: string;
    sleepTime?: string;
    bedTime?: string;
    bedtime?: string;
    startTime?: string;
    wakeTime?: string;
    endTime?: string;
    sleepQuality?: number;
    sleepStage?: string;
    sleepTagsJson?: string;
    durationMinutes?: number;
    durationMinute?: number;
    durationInMinutes?: number;
    duration?: number;
    sleepMinutes?: number;
    sleepingMinutes?: number;
    totalSleepMinutes?: number;
    sleepDuration?: number;
    sleepDurationMinutes?: number;
    totalMinutes?: number;
    totalDuration?: number;
    totalDurationMinutes?: number;
    totalAsleepMinutes?: number;
    minutes?: number;
    durationHours?: number;
    sleepHours?: number;
    sleepingHours?: number;
    totalHours?: number;
    hours?: number;
    score?: number;
    createdAt?: string;
    updatedAt?: string;
    createTime?: string;
    updateTime?: string;
};

type SleepRecordDatePayload =
    | SleepRecordDTO
    | SleepRecordDTO[]
    | null
    | {
          data?: SleepRecordDatePayload;
          result?: SleepRecordDatePayload;
          payload?: SleepRecordDatePayload;
          records?: SleepRecordDTO[];
          rows?: SleepRecordDTO[];
          list?: SleepRecordDTO[];
          content?: SleepRecordDTO[];
          items?: SleepRecordDTO[];
      };

type SleepWeeklyStatsPayload =
    | SleepWeeklyStatDTO[]
    | {
          data?: SleepWeeklyStatsPayload;
          result?: SleepWeeklyStatsPayload;
          payload?: SleepWeeklyStatsPayload;
          records?: SleepWeeklyStatDTO[];
          rows?: SleepWeeklyStatDTO[];
          list?: SleepWeeklyStatDTO[];
          stats?: SleepWeeklyStatDTO[];
          weeklyStats?: SleepWeeklyStatDTO[];
          currentWeekRecords?: SleepWeeklyStatDTO[];
          lastWeekRecords?: SleepWeeklyStatDTO[];
          content?: SleepWeeklyStatDTO[];
          items?: SleepWeeklyStatDTO[];
          weekStart?: string;
          weekEnd?: string;
          currentWeekAverageSleepMinutes?: number;
          currentWeekTotalSleepMinutes?: number;
          lastWeekAverageSleepMinutes?: number;
          lastWeekTotalSleepMinutes?: number;
          avgDiffFromLastWeek?: number;
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

function unwrapSleepResponse<T>(data: T | ApiEnvelope<T>, fallback: T) {
    if (!isApiEnvelope<T>(data)) return data;
    if (isSuccessCode(data.code, data.success)) {
        return data.data ?? data.result ?? data.payload ?? fallback;
    }
    throw new Error(data.message || data.msg || "睡眠接口返回异常");
}

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

function readObjectField(source: Record<string, unknown>, keys: string[]) {
    return keys.map((key) => source[key]).find((item) => item != null);
}

function readTimestampValue(value: unknown) {
    if (value == null) return 0;
    if (typeof value === "number" && Number.isFinite(value)) {
        return value < 1_000_000_000_000 ? value * 1000 : value;
    }
    const timestamp = Date.parse(String(value));
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function readNumericValue(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value.trim().match(/-?\d+(?:\.\d+)?/)?.[0]);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function readDateKey(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    const value = readObjectField(source, [
        "date",
        "recordDate",
        "sleepDate",
        "statDate",
        "day",
        "sleepTime",
        "bedTime",
        "bedtime",
        "startTime",
        "wakeTime",
        "endTime",
    ]);
    if (value == null) return "";
    const match = String(value).match(
        /(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/,
    );
    if (!match) return "";
    return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(
        Number(match[3]),
    ).padStart(2, "0")}`;
}

function readRecordTimestamp(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    return readTimestampValue(
        readObjectField(source, [
            "updatedAt",
            "updateTime",
            "modifiedAt",
            "createdAt",
            "createTime",
            "createdTime",
        ]),
    );
}

function readRecordId(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    return readNumericValue(readObjectField(source, ["id", "recordId"]));
}

function readDurationForSort(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    return readNumericValue(
        readObjectField(source, [
            "durationMinutes",
            "durationMinute",
            "durationInMinutes",
            "sleepDurationMinutes",
            "sleepMinutes",
            "sleepingMinutes",
            "totalSleepMinutes",
            "totalMinutes",
            "totalDurationMinutes",
            "totalAsleepMinutes",
            "minutes",
            "sleepDuration",
            "duration",
            "totalDuration",
        ]),
    );
}

function preferLatestRecord<T extends SleepRecordDTO | SleepWeeklyStatDTO>(
    current: T | undefined,
    candidate: T,
) {
    if (!current) return candidate;

    const candidateTimestamp = readRecordTimestamp(candidate);
    const currentTimestamp = readRecordTimestamp(current);
    if (candidateTimestamp !== currentTimestamp) {
        return candidateTimestamp > currentTimestamp ? candidate : current;
    }

    const candidateId = readRecordId(candidate);
    const currentId = readRecordId(current);
    if (candidateId !== currentId) {
        return candidateId > currentId ? candidate : current;
    }

    return readDurationForSort(candidate) >= readDurationForSort(current)
        ? candidate
        : current;
}

function dedupeRecordsByDate<T extends SleepRecordDTO | SleepWeeklyStatDTO>(
    records: T[],
) {
    const byDate = records.reduce<Record<string, T>>((next, item) => {
        const dateKey = readDateKey(item);
        if (!dateKey) return next;
        next[dateKey] = preferLatestRecord(next[dateKey], item);
        return next;
    }, {});
    const withoutDate = records.filter((item) => !readDateKey(item));
    return [...Object.values(byDate), ...withoutDate];
}

export function normalizeSleepRecordByDatePayload(
    data: SleepRecordDatePayload,
): SleepRecordDTO | null {
    if (!data) return null;
    if (Array.isArray(data)) {
        return (
            data.reduce<SleepRecordDTO | undefined>(
                (current, item) => preferLatestRecord(current, item),
                undefined,
            ) ?? null
        );
    }

    const source = data as Record<string, unknown> & {
        data?: SleepRecordDatePayload;
        result?: SleepRecordDatePayload;
        payload?: SleepRecordDatePayload;
        records?: SleepRecordDTO[];
        rows?: SleepRecordDTO[];
        list?: SleepRecordDTO[];
        content?: SleepRecordDTO[];
        items?: SleepRecordDTO[];
    };
    const nested = source.data ?? source.result ?? source.payload;
    if (nested) return normalizeSleepRecordByDatePayload(nested);

    const records =
        source.records ??
        source.rows ??
        source.list ??
        source.content ??
        source.items;
    if (records) return normalizeSleepRecordByDatePayload(records);

    return data as SleepRecordDTO;
}

export function normalizeWeeklyStats(
    data: SleepWeeklyStatsPayload,
): SleepWeeklyStatDTO[] {
    if (Array.isArray(data)) return dedupeRecordsByDate(data);
    const nested = data.data ?? data.result ?? data.payload;
    if (nested) return normalizeWeeklyStats(nested);

    const naturalWeekRecords = [
        ...(data.lastWeekRecords ?? []),
        ...(data.currentWeekRecords ?? []),
    ];
    if (naturalWeekRecords.length)
        return dedupeRecordsByDate(naturalWeekRecords);

    return dedupeRecordsByDate(
        data.records ??
            data.rows ??
            data.list ??
            data.stats ??
            data.weeklyStats ??
            data.content ??
            data.items ??
            [],
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
            SleepRecordDatePayload | ApiEnvelope<SleepRecordDatePayload>
        >("/sleep-records/date", {
            params: { userId, date },
        });
        return normalizeSleepRecordByDatePayload(
            unwrapSleepResponse<SleepRecordDatePayload>(response.data, null),
        );
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
