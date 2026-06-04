import { GAxios } from "@/plugins";

export type SleepStageDTO = {
    stage?: string;
    type?: string;
    name?: string;
    start?: string;
    startTime?: string;
    end?: string;
    endTime?: string;
    durationMinutes?: number;
    duration?: number;
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
    getUpTime?: string;
    endTime?: string;
    stage?: string;
    type?: string;
    quality?: number;
    sleepQuality?: number;
    sleepStage?: string;
    awakeCount?: number;
    wakeCount?: number;
    tags?: string[] | string;
    sleepTagsJson?: string;
    stages?: SleepStageDTO[] | string;
    sleepStages?: SleepStageDTO[] | string;
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
    getUpTime?: string;
    endTime?: string;
    stage?: string;
    type?: string;
    sleepQuality?: number;
    sleepStage?: string;
    sleepTagsJson?: string;
    stages?: SleepStageDTO[] | string;
    sleepStages?: SleepStageDTO[] | string;
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

function readStringValue(value: unknown) {
    return typeof value === "string" && value.trim() ? value.trim() : "";
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

function parseOffsetDateTime(value: string) {
    const normalized = value.trim();
    const hasTime = /[T\s]\d{1,2}:\d{2}/.test(normalized);
    const hasOffset = /(?:Z|[+-]\d{2}:?\d{2}(?::?\d{2})?)$/i.test(normalized);
    if (!hasTime || !hasOffset) return null;

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function toLocalDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateTimeValue(value: unknown) {
    if (value == null) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === "number" && Number.isFinite(value)) {
        const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;
        const date = new Date(timestamp);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const text = String(value).trim();
    if (!text) return null;

    const offsetDate = parseOffsetDateTime(text);
    if (offsetDate) return offsetDate;

    if (/[T\s]\d{1,2}:\d{2}/.test(text)) {
        const date = new Date(text);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
}

function sleepNightDateKey(date: Date) {
    const shifted = new Date(date);
    shifted.setHours(shifted.getHours() - 12);
    return toLocalDateKey(shifted);
}

function readStageStart(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    return readObjectField(source, [
        "start",
        "startTime",
        "sleepTime",
        "bedTime",
        "bedtime",
    ]);
}

function readStageEnd(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    return readObjectField(source, ["end", "endTime", "wakeTime", "getUpTime"]);
}

function normalizeStageValue(value: unknown) {
    const text = String(value ?? "")
        .trim()
        .toLowerCase();
    if (!text) return "";
    if (text.includes("deep") || text.includes("深")) return "deep";
    if (text.includes("rem")) return "rem";
    if (text.includes("awake") || text.includes("清醒")) return "awake";
    if (
        text.includes("light") ||
        text.includes("core") ||
        text.includes("核心") ||
        text.includes("浅")
    ) {
        return "light";
    }
    if (
        text.includes("asleep") ||
        text.includes("睡着") ||
        text.includes("睡眠")
    ) {
        return "light";
    }
    if (
        text.includes("inbed") ||
        text.includes("in_bed") ||
        text.includes("在床")
    ) {
        return "inBed";
    }
    return text;
}

function readStageValue(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    return normalizeStageValue(
        readObjectField(source, ["stage", "type", "name", "sleepStage"]),
    );
}

function isSleepStageRecord(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    return Boolean(
        readStageStart(record) &&
        readStageEnd(record) &&
        readStageValue(record),
    );
}

function isAwakeStage(stage: string) {
    return stage === "awake";
}

function diffStageMinutes(start: Date | null, end: Date | null) {
    if (!start || !end) return 0;
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return minutes > 0 && minutes < 24 * 60 ? minutes : 0;
}

function readStageDurationMinutes(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const source = record as Record<string, unknown>;
    const start = parseDateTimeValue(readStageStart(record));
    const end = parseDateTimeValue(readStageEnd(record));
    const diffMinutes = diffStageMinutes(start, end);
    if (diffMinutes > 0) return diffMinutes;

    return readDurationForSort(source as SleepRecordDTO);
}

function getStageDateKey(record: SleepRecordDTO | SleepWeeklyStatDTO) {
    const start = parseDateTimeValue(readStageStart(record));
    if (start) return sleepNightDateKey(start);

    const explicitDate = readObjectField(record as Record<string, unknown>, [
        "date",
        "recordDate",
        "sleepDate",
        "statDate",
        "day",
    ]);
    if (explicitDate)
        return readDateKey({ date: explicitDate } as SleepRecordDTO);

    return readDateKey(record);
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
    const offsetDate = parseOffsetDateTime(String(value));
    if (offsetDate) return toLocalDateKey(offsetDate);

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

function mergeSleepStageRecords(
    records: Array<SleepRecordDTO | SleepWeeklyStatDTO>,
): SleepRecordDTO[] {
    const stageRecords = records.filter(isSleepStageRecord);
    if (!stageRecords.length) return records as SleepRecordDTO[];

    const grouped = stageRecords.reduce<
        Record<string, Array<SleepRecordDTO | SleepWeeklyStatDTO>>
    >((next, item) => {
        const dateKey = getStageDateKey(item);
        if (!dateKey) return next;
        next[dateKey] = [...(next[dateKey] ?? []), item];
        return next;
    }, {});

    const mergedRecords = Object.entries(grouped).map(([dateISO, items]) =>
        mergeStageGroup(dateISO, items),
    );
    const nonStageRecords = records.filter((item) => !isSleepStageRecord(item));

    return dedupeRecordsByDate([
        ...mergedRecords,
        ...(nonStageRecords as SleepRecordDTO[]),
    ]);
}

function mergeStageGroup(
    dateISO: string,
    items: Array<SleepRecordDTO | SleepWeeklyStatDTO>,
): SleepRecordDTO {
    const sorted = [...items].sort((left, right) => {
        const leftTime =
            parseDateTimeValue(readStageStart(left))?.getTime() ?? 0;
        const rightTime =
            parseDateTimeValue(readStageStart(right))?.getTime() ?? 0;
        return leftTime - rightTime;
    });
    const first = sorted[0]!;
    const last = [...sorted].sort((left, right) => {
        const leftTime = parseDateTimeValue(readStageEnd(left))?.getTime() ?? 0;
        const rightTime =
            parseDateTimeValue(readStageEnd(right))?.getTime() ?? 0;
        return rightTime - leftTime;
    })[0]!;
    const latestMeta = sorted.reduce<
        SleepRecordDTO | SleepWeeklyStatDTO | undefined
    >((current, item) => preferLatestRecord(current, item), undefined);

    const stageTotals = sorted.reduce<Record<string, number>>((next, item) => {
        const stage = readStageValue(item);
        const minutes = readStageDurationMinutes(item);
        if (minutes <= 0) return next;
        next[stage] = (next[stage] ?? 0) + minutes;
        return next;
    }, {});
    const totalAsleepMinutes =
        (stageTotals.deep ?? 0) +
        (stageTotals.light ?? 0) +
        (stageTotals.rem ?? 0);
    const dominantStage =
        ["light", "rem", "deep"].sort(
            (left, right) =>
                (stageTotals[right] ?? 0) - (stageTotals[left] ?? 0),
        )[0] ?? "light";
    const awakeCount = sorted.filter((item) =>
        isAwakeStage(readStageValue(item)),
    ).length;
    const latestSource = (latestMeta ?? {}) as Record<string, unknown>;

    const merged: Record<string, unknown> = {
        date: dateISO,
        recordDate: dateISO,
        sleepDate: dateISO,
        sleepTime: readStringValue(readStageStart(first)),
        wakeTime: readStringValue(readStageEnd(last)),
        sleepStage: dominantStage,
        awakeCount,
        wakeCount: awakeCount,
        stages: sorted
            .map((item) => {
                const stage = readStageValue(item);
                if (!stage || stage === "inBed" || stage === "unknown")
                    return null;
                const segment: SleepStageDTO = {
                    stage,
                    type: stage,
                    start: readStringValue(readStageStart(item)),
                    startTime: readStringValue(readStageStart(item)),
                    end: readStringValue(readStageEnd(item)),
                    endTime: readStringValue(readStageEnd(item)),
                    durationMinutes: readStageDurationMinutes(item),
                };
                return segment;
            })
            .filter((item): item is SleepStageDTO => item !== null),
        durationMinutes: totalAsleepMinutes,
        totalAsleepMinutes,
    };
    const id = readObjectField(latestSource, ["id"]);
    const userId = readObjectField(latestSource, ["userId"]);
    const quality = readObjectField(latestSource, ["quality", "sleepQuality"]);
    const tags = readObjectField(latestSource, ["tags"]);
    const sleepTagsJson = readObjectField(latestSource, ["sleepTagsJson"]);
    const createdAt = readObjectField(latestSource, ["createdAt"]);
    const updatedAt = readObjectField(latestSource, ["updatedAt"]);
    const createTime = readObjectField(latestSource, ["createTime"]);
    const updateTime = readObjectField(latestSource, ["updateTime"]);

    if (id != null) merged.id = id;
    if (userId != null) merged.userId = userId;
    if (quality != null) {
        merged.quality = quality;
        merged.sleepQuality = quality;
    }
    if (tags != null) merged.tags = tags;
    if (sleepTagsJson != null) merged.sleepTagsJson = sleepTagsJson;
    if (totalAsleepMinutes > 0) {
        merged.deepSleepRate = Math.round(
            ((stageTotals.deep ?? 0) / totalAsleepMinutes) * 100,
        );
    }
    if (createdAt != null) merged.createdAt = createdAt;
    if (updatedAt != null) merged.updatedAt = updatedAt;
    if (createTime != null) merged.createTime = createTime;
    if (updateTime != null) merged.updateTime = updateTime;

    return Object.fromEntries(
        Object.entries(merged).filter(([, value]) => value !== undefined),
    ) as SleepRecordDTO;
}

export function normalizeSleepRecordByDatePayload(
    data: SleepRecordDatePayload,
): SleepRecordDTO | null {
    if (!data) return null;
    if (Array.isArray(data)) {
        const mergedRecords = mergeSleepStageRecords(data);
        return (
            mergedRecords.reduce<SleepRecordDTO | undefined>(
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
    if (Array.isArray(data)) {
        return mergeSleepStageRecords(data) as SleepWeeklyStatDTO[];
    }
    const nested = data.data ?? data.result ?? data.payload;
    if (nested) return normalizeWeeklyStats(nested);

    const naturalWeekRecords = [
        ...(data.lastWeekRecords ?? []),
        ...(data.currentWeekRecords ?? []),
    ];
    if (naturalWeekRecords.length)
        return mergeSleepStageRecords(
            naturalWeekRecords,
        ) as SleepWeeklyStatDTO[];

    return mergeSleepStageRecords(
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
