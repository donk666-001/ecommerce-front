<template>
    <div v-if="products.length" class="product-rec">
        <div class="product-rec__head">
            <h4 class="product-rec__title">{{ title }}</h4>
            <p v-if="summary" class="product-rec__summary">{{ summary }}</p>
        </div>

        <div class="product-rec__grid">
            <article
                v-for="product in products"
                :key="product.key"
                class="product-rec__item"
            >
                <div
                    class="product-rec__media"
                    :class="{ broken: isBroken(product.key) }"
                >
                    <img
                        v-if="product.imageSrc && !isBroken(product.key)"
                        :src="product.imageSrc"
                        :alt="product.name"
                        class="product-rec__image"
                        @error="markImageBroken(product.key)"
                    />
                    <span v-else class="product-rec__icon">
                        {{ product.icon }}
                    </span>
                </div>

                <div class="product-rec__body">
                    <div class="product-rec__meta">
                        <span
                            v-if="product.categoryName"
                            class="product-rec__category"
                        >
                            {{ product.categoryName }}
                        </span>
                        <span
                            v-if="product.stockLabel"
                            class="product-rec__stock"
                        >
                            {{ product.stockLabel }}
                        </span>
                    </div>

                    <h5 class="product-rec__name">{{ product.name }}</h5>

                    <p v-if="product.efficacy" class="product-rec__efficacy">
                        {{ product.efficacy }}
                    </p>

                    <div
                        v-if="product.tags.length"
                        class="product-rec__tags"
                    >
                        <span
                            v-for="tag in product.tags"
                            :key="`${product.key}-${tag}`"
                            class="product-rec__tag"
                        >
                            {{ tag }}
                        </span>
                    </div>

                    <p
                        v-if="product.reasonText"
                        class="product-rec__reason"
                    >
                        {{ product.reasonText }}
                    </p>
                    <p
                        v-else-if="product.description"
                        class="product-rec__description"
                    >
                        {{ product.description }}
                    </p>

                    <div class="product-rec__footer">
                        <div class="product-rec__price-box">
                            <span class="product-rec__price">
                                ¥{{ formatPrice(product.price) }}
                            </span>
                            <span
                                v-if="showOriginalPrice(product)"
                                class="product-rec__original"
                            >
                                ¥{{ formatPrice(product.originalPrice ?? 0) }}
                            </span>
                        </div>

                        <button
                            type="button"
                            class="product-rec__action"
                            @click="openProduct(product.routeProductId)"
                        >
                            查看商品
                        </button>
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
    resolveProductRecommendationItems,
    resolveProductRecommendationPayload,
    type ProductRecommendationPayload,
    type RawProductRecommendationRecord,
} from "./productRecommendation";

const props = defineProps<{
    content?: string | undefined;
    structuredJson?: string | undefined;
}>();

const router = useRouter();
const brokenImageKeys = ref<string[]>([]);

interface ProductCardModel {
    key: string;
    routeProductId: string;
    name: string;
    imageSrc: string | undefined;
    icon: string;
    categoryName: string;
    price: number;
    originalPrice: number | undefined;
    efficacy: string;
    description: string;
    reasonText: string;
    tags: string[];
    stockLabel: string;
}

const DEFAULT_TITLE = "为你推荐的养生商品";

const parsed = computed<Record<string, unknown>>(() => {
    if (!props.structuredJson) return {};

    try {
        return JSON.parse(props.structuredJson) as Record<string, unknown>;
    } catch {
        return {};
    }
});

const payload = computed<ProductRecommendationPayload>(() =>
    resolveProductRecommendationPayload(parsed.value),
);

const title = computed(
    () => normalizeText(payload.value.title) || DEFAULT_TITLE,
);

const summary = computed(
    () =>
        normalizeText(payload.value.summary) ||
        normalizeText(props.content) ||
        "",
);

const products = computed<ProductCardModel[]>(() =>
    resolveProductRecommendationItems(payload.value)
        .map((item, index) => normalizeProduct(item, index))
        .filter((item): item is ProductCardModel => item !== null),
);

function normalizeProduct(
    raw: RawProductRecommendationRecord,
    index: number,
): ProductCardModel | null {
    const name = normalizeText(raw.name || raw.productName);
    if (!name) return null;

    const routeProductId = normalizeRouteProductId(raw.id ?? raw.productId);
    if (!routeProductId) return null;

    const price = toFiniteNumber(
        raw.discountPrice ?? raw.price ?? raw.currentPrice,
    );

    return {
        key: `${routeProductId}-${index}`,
        routeProductId,
        name,
        imageSrc: normalizeImageSrc(raw.image || raw.productImage),
        icon: resolveProductIcon(raw.categoryName || raw.category, name),
        categoryName: normalizeText(raw.categoryName || raw.category),
        price: price ?? 0,
        originalPrice: toFiniteNumber(raw.originalPrice) ?? undefined,
        efficacy: normalizeText(raw.efficacy || raw.effect),
        description: normalizeText(raw.description || raw.desc),
        reasonText: normalizeText(raw.reason || raw.recommendationReason),
        tags: normalizeTags(raw.tags),
        stockLabel: normalizeStockLabel(raw.stock),
    };
}

function normalizeRouteProductId(value: unknown): string | null {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        return trimmed.startsWith("p") ? trimmed : `p${trimmed}`;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return `p${value}`;
    }

    return null;
}

function normalizeText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, 4);
    }

    if (typeof value !== "string") return [];

    return value
        .split(/[,\uFF0C\u3001|]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4);
}

function normalizeStockLabel(value: unknown): string {
    const stock = toFiniteNumber(value);
    if (stock == null) return "";
    if (stock <= 0) return "暂时缺货";
    if (stock <= 20) return `库存 ${stock}`;
    return "现货";
}

function toFiniteNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
        const parsedNumber = Number(value);
        return Number.isFinite(parsedNumber) ? parsedNumber : null;
    }
    return null;
}

function normalizeImageSrc(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (/^(https?:|data:image\/|blob:|\/)/i.test(trimmed)) {
        return trimmed;
    }

    if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 80) {
        return `data:image/jpeg;base64,${trimmed}`;
    }

    return undefined;
}

function resolveProductIcon(category: unknown, name: string): string {
    const categoryText = String(category ?? "");
    const source = `${categoryText} ${name}`;

    if (/茶|饮|枣|汤/.test(source)) return "🍵";
    if (/艾|灸|盒|器|仪|枕/.test(source)) return "🪴";
    if (/膏|丸|方|粉|胶/.test(source)) return "🌿";
    if (/睡|眠|安神/.test(source)) return "🌙";
    if (/食|粥|糕|膳/.test(source)) return "🥣";
    return "📦";
}

function formatPrice(value: number): string {
    if (!Number.isFinite(value)) return "0";

    return value
        .toFixed(value % 1 === 0 ? 0 : 2)
        .replace(/\.00$/, "")
        .replace(/(\.\d)0$/, "$1");
}

function showOriginalPrice(product: ProductCardModel): boolean {
    return Boolean(
        product.originalPrice &&
            product.originalPrice > 0 &&
            product.originalPrice > product.price,
    );
}

function isBroken(key: string): boolean {
    return brokenImageKeys.value.includes(key);
}

function markImageBroken(key: string): void {
    if (!isBroken(key)) {
        brokenImageKeys.value = [...brokenImageKeys.value, key];
    }
}

async function openProduct(productId: string): Promise<void> {
    await router
        .push({
            path: "/shop",
            query: { open: productId },
        })
        .catch(() => {
            window.location.href = `/shop?open=${encodeURIComponent(productId)}`;
        });
}
</script>

<style scoped lang="scss">
.product-rec {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.product-rec__head {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.product-rec__title {
    margin: 0;
    color: var(--ink);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
}

.product-rec__summary {
    margin: 0;
    color: var(--ink-soft);
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
}

.product-rec__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
}

.product-rec__item {
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr);
    gap: 12px;
    border: 1px solid rgba(232, 223, 208, 0.88);
    border-radius: 12px;
    background: rgba(255, 253, 249, 0.92);
    padding: 12px;
}

.product-rec__media {
    border-radius: 10px;
    min-height: 88px;
    background: linear-gradient(135deg, var(--paper-warm), var(--gold-soft));
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.product-rec__media.broken {
    background: linear-gradient(135deg, var(--paper-warm), var(--jade-soft));
}

.product-rec__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.product-rec__icon {
    font-size: 34px;
    line-height: 1;
}

.product-rec__body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.product-rec__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
}

.product-rec__category,
.product-rec__stock {
    font-size: 11px;
    line-height: 1.4;
    color: var(--ink-muted);
}

.product-rec__category {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-rec__stock {
    flex-shrink: 0;
}

.product-rec__name {
    margin: 0;
    color: var(--ink);
    font-size: 15px;
    line-height: 1.45;
    font-weight: 700;
    word-break: break-word;
}

.product-rec__efficacy,
.product-rec__description,
.product-rec__reason {
    margin: 0;
    font-size: 12px;
    line-height: 1.7;
    color: var(--ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-rec__reason {
    color: var(--jade);
}

.product-rec__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.product-rec__tag {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(92, 131, 116, 0.1);
    color: var(--jade);
    font-size: 11px;
    line-height: 1;
}

.product-rec__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
}

.product-rec__price-box {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
}

.product-rec__price {
    color: var(--cinnabar);
    font-size: 20px;
    line-height: 1.2;
    font-weight: 700;
}

.product-rec__original {
    color: var(--ink-muted);
    font-size: 12px;
    text-decoration: line-through;
}

.product-rec__action {
    border: none;
    border-radius: 999px;
    min-height: 34px;
    padding: 0 14px;
    background: var(--jade);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition:
        background-color 0.18s ease,
        transform 0.18s ease;
    flex-shrink: 0;
}

.product-rec__action:hover {
    background: var(--ink);
    transform: translateY(-1px);
}

.product-rec__action:focus-visible {
    outline: 2px solid rgba(92, 131, 116, 0.25);
    outline-offset: 2px;
}

@media (max-width: 640px) {
    .product-rec__grid {
        grid-template-columns: 1fr;
    }

    .product-rec__item {
        grid-template-columns: 76px minmax(0, 1fr);
        gap: 10px;
    }

    .product-rec__media {
        min-height: 76px;
    }

    .product-rec__footer {
        align-items: flex-start;
        flex-direction: column;
    }

    .product-rec__action {
        width: 100%;
        justify-content: center;
    }
}

@media (prefers-reduced-motion: reduce) {
    .product-rec__action {
        transition: none;
    }

    .product-rec__action:hover {
        transform: none;
    }
}
</style>
