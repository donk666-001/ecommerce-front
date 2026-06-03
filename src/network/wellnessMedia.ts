import { GAxios } from "@/plugins";

export type WellnessMediaResourceVO = {
    id?: number | string;
    mediaCode: string;
    mediaName: string;
    mediaType: string;
    mediaCategory: string;
    mediaUrl: string;
    description: string;
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

function unwrapMediaResponse<T>(data: T | ApiEnvelope<T>, fallback: T) {
    if (!isApiEnvelope<T>(data)) return data;
    if (isSuccessCode(data.code, data.success)) {
        return data.data ?? data.result ?? data.payload ?? fallback;
    }
    throw new Error(data.message || data.msg || "媒体资源接口返回异常");
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

function parseArray<T>(value: unknown, fallback: T[]) {
    return Array.isArray(value) ? (value as T[]) : fallback;
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

function normalizeMedia(
    value: unknown,
    baseURL?: string,
): WellnessMediaResourceVO {
    const source = readObject(value);
    const media: WellnessMediaResourceVO = {
        mediaCode: readString(source.mediaCode),
        mediaName: readString(source.mediaName),
        mediaType: readString(source.mediaType),
        mediaCategory: readString(source.mediaCategory),
        mediaUrl: normalizeAssetUrl(readString(source.mediaUrl), baseURL),
        description: readString(source.description),
        status: readNumber(source.status, 1),
    };
    if (source.id !== undefined && source.id !== null) {
        media.id = source.id as number | string;
    }
    return media;
}

async function getMediaList(url: string) {
    const response = await GAxios.get<unknown[] | ApiEnvelope<unknown[]>>(url);
    return parseArray<unknown>(unwrapMediaResponse(response.data, []), [])
        .map((item) => normalizeMedia(item, response.config.baseURL))
        .filter((item) => item.status === 1);
}

class ApiWellnessMedia {
    static getSleepMusic() {
        return getMediaList("/wellness-media/sleep-music");
    }

    static getMeditationAudio() {
        return getMediaList("/wellness-media/meditation-audio");
    }
}

export { ApiWellnessMedia };
