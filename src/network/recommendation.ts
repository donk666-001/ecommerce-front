import { GAxios } from "@/plugins";

export type RecommendationSummaryVO = {
    constitution?: string;
    solarTerm?: string;
    menstrualPhase?: string;
    sleepType?: string;
};

export type RecommendationVO = {
    type?: string;
    title?: string;
    desc?: string;
};

export type UserProfileVO = {
    userId: number;
    profileTitle: string;
    profileTags: string[];
    summary: RecommendationSummaryVO;
    recommendations: RecommendationVO[];
};

export type RecommendationCardVO = {
    id?: number | string;
    category: string;
    categoryText: string;
    title: string;
    subtitle: string;
    coverUrl: string;
    reason: string;
    targetType: string;
    targetId?: number | string;
    targetUrl: string;
    tags: string[];
    score?: number;
};

export type RecommendationGroupVO = {
    category: string;
    categoryText: string;
    cards: RecommendationCardVO[];
};

export type RecommendationHomeVO = {
    userId: number;
    title: string;
    summary: string;
    groups: RecommendationGroupVO[];
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

function unwrapRecommendationResponse<T>(
    data: T | ApiEnvelope<T>,
    fallback: T,
) {
    if (!isApiEnvelope<T>(data)) return data;
    if (isSuccessCode(data.code, data.success)) {
        return data.data ?? data.result ?? data.payload ?? fallback;
    }
    throw new Error(data.message || data.msg || "个性推荐接口返回异常");
}

function normalizeAssetUrl(url: string, baseURL?: string) {
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
            .map((item) => String(item).trim())
            .filter((item) => item && item !== "##default");
    }

    if (typeof value !== "string") return [];
    return value
        .split(/[、,，|]/)
        .map((item) => item.trim())
        .filter((item) => item && item !== "##default");
}

function readObject(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : {};
}

function readString(value: unknown) {
    return value == null ? "" : String(value);
}

function readNumber(value: unknown) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : undefined;
}

function normalizeSummary(value: unknown): RecommendationSummaryVO {
    const source = readObject(value);
    return {
        constitution: readString(source.constitution),
        solarTerm: readString(source.solarTerm),
        menstrualPhase: readString(source.menstrualPhase),
        sleepType: readString(source.sleepType),
    };
}

function normalizeRecommendations(value: unknown) {
    return parseJsonArray<Record<string, unknown>>(value, []).map((item) => ({
        type: readString(item.type),
        title: readString(item.title),
        desc: readString(item.desc),
    }));
}

function normalizeProfile(data: unknown, userId: number): UserProfileVO {
    const source = readObject(data);
    return {
        userId: readNumber(source.userId) ?? userId,
        profileTitle: readString(source.profileTitle),
        profileTags: normalizeStringList(source.profileTags),
        summary: normalizeSummary(source.summary),
        recommendations: normalizeRecommendations(source.recommendations),
    };
}

function normalizeCard(
    value: unknown,
    fallbackCategory = "",
    fallbackCategoryText = "",
    baseURL?: string,
): RecommendationCardVO {
    const source = readObject(value);
    const card: RecommendationCardVO = {
        category: readString(source.category) || fallbackCategory,
        categoryText: readString(source.categoryText) || fallbackCategoryText,
        title: readString(source.title),
        subtitle: readString(source.subtitle),
        coverUrl: normalizeAssetUrl(readString(source.coverUrl), baseURL),
        reason: readString(source.reason),
        targetType: readString(source.targetType),
        targetUrl: readString(source.targetUrl),
        tags: normalizeStringList(source.tags),
    };
    if (source.id != null) card.id = source.id as number | string;
    if (source.targetId != null) {
        card.targetId = source.targetId as number | string;
    }
    const score = readNumber(source.score);
    if (score !== undefined) card.score = score;
    return card;
}

function normalizeGroup(
    value: unknown,
    baseURL?: string,
): RecommendationGroupVO {
    const source = readObject(value);
    const category = readString(source.category);
    const categoryText = readString(source.categoryText);
    return {
        category,
        categoryText,
        cards: parseJsonArray<unknown>(source.cards, []).map((card) =>
            normalizeCard(card, category, categoryText, baseURL),
        ),
    };
}

function normalizeHome(
    data: unknown,
    userId: number,
    baseURL?: string,
): RecommendationHomeVO {
    const source = readObject(data);
    return {
        userId: readNumber(source.userId) ?? userId,
        title: readString(source.title) || "今日为你精选",
        summary:
            readString(source.summary) ||
            "根据你的体质、经期、睡眠和节气动态推荐",
        groups: parseJsonArray<unknown>(source.groups, []).map((group) =>
            normalizeGroup(group, baseURL),
        ),
    };
}

class ApiRecommendation {
    static async getProfile(userId: number) {
        const response = await GAxios.get<unknown | ApiEnvelope<unknown>>(
            `/profile/${userId}`,
        );
        return normalizeProfile(
            unwrapRecommendationResponse(response.data, {}),
            userId,
        );
    }

    static async getHome(userId: number) {
        const response = await GAxios.get<unknown | ApiEnvelope<unknown>>(
            "/recommendation/home",
            {
                params: { userId },
            },
        );
        return normalizeHome(
            unwrapRecommendationResponse(response.data, {}),
            userId,
            response.config.baseURL,
        );
    }

    static async getCategory(category: string, userId: number) {
        const response = await GAxios.get<unknown | ApiEnvelope<unknown>>(
            `/recommendation/category/${category}`,
            {
                params: { userId },
            },
        );
        return parseJsonArray<unknown>(
            unwrapRecommendationResponse(response.data, []),
            [],
        ).map((card) =>
            normalizeCard(card, category, "", response.config.baseURL),
        );
    }
}

export { ApiRecommendation };
