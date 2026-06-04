export interface RawProductRecommendationRecord {
    id?: number | string;
    productId?: number | string;
    name?: string;
    productName?: string;
    image?: string;
    productImage?: string;
    price?: number | string;
    discountPrice?: number | string;
    currentPrice?: number | string;
    originalPrice?: number | string;
    efficacy?: string;
    effect?: string;
    description?: string;
    desc?: string;
    reason?: string;
    recommendationReason?: string;
    tags?: string[] | string;
    categoryName?: string;
    category?: string;
    stock?: number | string;
    soldCount?: number | string;
}

export interface ProductRecommendationPayload {
    title?: string;
    summary?: string;
    products?: RawProductRecommendationRecord[];
    items?: RawProductRecommendationRecord[];
    records?: RawProductRecommendationRecord[];
    recommendations?: RawProductRecommendationRecord[];
    productRecommendations?: RawProductRecommendationRecord[];
    data?: ProductRecommendationPayload | RawProductRecommendationRecord[];
    result?: ProductRecommendationPayload | RawProductRecommendationRecord[];
    payload?: ProductRecommendationPayload | RawProductRecommendationRecord[];
}

type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as UnknownRecord)
        : null;
}

export function asRecordArray<T = unknown>(value: unknown): T[] | null {
    return Array.isArray(value) ? (value as T[]) : null;
}

export function resolveProductRecommendationPayload(
    value: unknown,
): ProductRecommendationPayload {
    const root = asRecord(value);
    if (!root) return {};

    const nested =
        asRecord(root.productRecommendation) ||
        asRecord(root.recommendation) ||
        asRecord(root.productRecommendResult);

    return {
        ...(root as ProductRecommendationPayload),
        ...(nested ?? {}),
    };
}

export function resolveProductRecommendationItems(
    value: unknown,
): RawProductRecommendationRecord[] {
    const directArray = asRecordArray<RawProductRecommendationRecord>(value);
    if (directArray) return directArray;

    const source = asRecord(value);
    if (!source) return [];

    const wrappedPayload =
        asRecord(source.productRecommendation) ||
        asRecord(source.recommendation) ||
        asRecord(source.productRecommendResult);
    if (wrappedPayload) {
        const wrappedItems = resolveProductRecommendationItems(wrappedPayload);
        if (wrappedItems.length) return wrappedItems;
    }

    const directItems =
        asRecordArray<RawProductRecommendationRecord>(source.products) ||
        asRecordArray<RawProductRecommendationRecord>(source.items) ||
        asRecordArray<RawProductRecommendationRecord>(source.records) ||
        asRecordArray<RawProductRecommendationRecord>(
            source.productRecommendations,
        ) ||
        asRecordArray<RawProductRecommendationRecord>(source.recommendations);

    if (directItems) return directItems;

    const nestedData = resolveProductRecommendationItems(source.data);
    if (nestedData.length) return nestedData;

    const nestedResult = resolveProductRecommendationItems(source.result);
    if (nestedResult.length) return nestedResult;

    return resolveProductRecommendationItems(source.payload);
}

export function isProductRecommendationRecord(value: unknown): boolean {
    const item = asRecord(value);
    if (!item) return false;

    const hasName =
        hasNonEmptyText(item.name) || hasNonEmptyText(item.productName);
    const hasId = item.id != null || item.productId != null;
    return hasName && hasId;
}

export function hasProductRecommendationItems(value: unknown): boolean {
    return resolveProductRecommendationItems(value).some(
        isProductRecommendationRecord,
    );
}

function hasNonEmptyText(value: unknown): boolean {
    return typeof value === "string" && value.trim().length > 0;
}
