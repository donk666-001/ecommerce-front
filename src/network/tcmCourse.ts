import { GAxiosWithCredentials } from "@/plugins";

export type TcmCourseVO = {
    id?: number | string;
    courseCode: string;
    courseTitle: string;
    courseSubtitle: string;
    courseCategory: string;
    courseLevel: string;
    coverUrl: string;
    introText: string;
    contentUrl: string;
    durationMinutes: number;
    teacherName: string;
    tagJson?: string[] | string;
    tags: string[];
    targetConstitution: string;
    targetCyclePhase: number;
    targetSleepType: string;
    status: number;
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

function unwrapTcmCourseResponse<T>(data: T | ApiEnvelope<T>, fallback: T) {
    if (!isApiEnvelope<T>(data)) return data;
    if (isSuccessCode(data.code, data.success)) {
        return data.data ?? data.result ?? data.payload ?? fallback;
    }
    throw new Error(data.message || data.msg || "中医课程接口返回异常");
}

function readObject(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : {};
}

function readString(value: unknown) {
    if (value == null) return "";
    const text = String(value).trim();
    return text === "##default" ? "" : text;
}

function readNumber(value: unknown, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}

function parseJsonArray<T>(value: unknown, fallback: T[]) {
    if (Array.isArray(value)) return value as T[];
    if (typeof value !== "string" || !value.trim()) return fallback;
    const text = value.trim();
    if (text === "##default") return fallback;

    try {
        const parsed: unknown = JSON.parse(text);
        return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
        return fallback;
    }
}

function normalizeStringList(value: unknown) {
    const parsed = parseJsonArray<unknown>(value, []);
    if (parsed.length) {
        return parsed
            .map((item) => readString(item))
            .filter((item) => item.length > 0);
    }
    if (typeof value !== "string") return [];
    return value
        .split(/[、,，;；\s]+/)
        .map((item) => readString(item))
        .filter((item) => item.length > 0);
}

function normalizeAssetUrl(url: string, baseURL?: string) {
    if (/^https?:\/\/example\.com\//i.test(url)) {
        return "";
    }
    if (
        !url ||
        /^(https?:)?\/\//.test(url) ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
    ) {
        return url;
    }
    if (url.startsWith("/") && baseURL) {
        return `${baseURL.replace(/\/$/, "")}${url}`;
    }
    return url;
}

function normalizeCourse(value: unknown, baseURL?: string): TcmCourseVO {
    const source = readObject(value);
    const tagJson = source.tagJson ?? source.tags;
    const course: TcmCourseVO = {
        courseCode: readString(source.courseCode),
        courseTitle: readString(source.courseTitle),
        courseSubtitle: readString(source.courseSubtitle),
        courseCategory: readString(source.courseCategory),
        courseLevel: readString(source.courseLevel),
        coverUrl: normalizeAssetUrl(readString(source.coverUrl), baseURL),
        introText: readString(source.introText),
        contentUrl: readString(source.contentUrl),
        durationMinutes: readNumber(source.durationMinutes),
        teacherName: readString(source.teacherName),
        tags: normalizeStringList(tagJson),
        targetConstitution: readString(source.targetConstitution),
        targetCyclePhase: readNumber(source.targetCyclePhase),
        targetSleepType: readString(source.targetSleepType),
        status: readNumber(source.status, 1),
    };
    if (source.id !== undefined && source.id !== null) {
        course.id = source.id as number | string;
    }
    if (tagJson !== undefined) {
        course.tagJson = tagJson as string[] | string;
    }
    return course;
}

class ApiTcmCourse {
    static async getRecommended(userId: number) {
        const response = await GAxiosWithCredentials.get<
            unknown[] | ApiEnvelope<unknown[]>
        >("/tcm-course/recommended", {
            params: { userId },
        });
        return parseJsonArray<unknown>(
            unwrapTcmCourseResponse(response.data, []),
            [],
        ).map((course) => normalizeCourse(course, response.config.baseURL));
    }

    static async getDetail(id: number | string) {
        const response = await GAxiosWithCredentials.get<
            unknown | ApiEnvelope<unknown>
        >(`/tcm-course/${id}`);
        return normalizeCourse(
            unwrapTcmCourseResponse(response.data, {}),
            response.config.baseURL,
        );
    }
}

export { ApiTcmCourse };
