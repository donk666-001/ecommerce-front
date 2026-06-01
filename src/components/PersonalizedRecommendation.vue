<template>
    <div class="recommendation-panel">
        <div class="profile-strip">
            <div class="profile-icon">🌿</div>
            <div class="profile-main">
                <div class="label">YOUR PROFILE · 你的画像</div>
                <div class="profile-title">
                    {{ profileTitleText }}
                </div>

                <div v-if="summaryChips.length" class="summary-chips">
                    <span v-for="chip in summaryChips" :key="chip.label">
                        {{ chip.label }} · {{ chip.value }}
                    </span>
                </div>

                <div v-if="profileTags.length" class="tags">
                    <span v-for="tag in profileTags" :key="tag" class="tag">
                        {{ tag }}
                    </span>
                </div>
            </div>
            <button
                class="btn btn-outline"
                type="button"
                :disabled="isReloading || !hasActiveUser"
                @click="reloadAll"
            >
                {{ isReloading ? "同步中" : "刷新推荐" }}
            </button>
        </div>

        <div v-if="!hasActiveUser" class="card state-card">
            登录后可同步你的用户画像和今日推荐。
        </div>

        <section v-else class="card recommendation-card">
            <div class="row">
                <div>
                    <div class="card-title">
                        <span class="dot"></span>{{ homeTitle }}
                    </div>
                    <p class="section-summary">{{ homeSummary }}</p>
                </div>
                <div class="filter-row">
                    <button
                        v-for="filter in feedFilters"
                        :key="filter.value"
                        class="term-chip"
                        :class="{ active: selectedFilter === filter.value }"
                        type="button"
                        @click="selectFilter(filter.value)"
                    >
                        {{ filter.label }}
                        <span v-if="filter.count > 0">{{ filter.count }}</span>
                    </button>
                </div>
            </div>

            <div v-if="errorMessage" class="sync-alert">
                <span>{{ errorMessage }}</span>
                <button type="button" @click="reloadAll">重试</button>
            </div>

            <div class="feed-shell">
                <div
                    v-if="isLoadingCards && currentFeedItems.length > 0"
                    class="sync-mask"
                    aria-hidden="true"
                >
                    <span></span>
                </div>

                <div
                    v-if="isLoadingCards && currentFeedItems.length === 0"
                    class="feed-grid"
                >
                    <article
                        v-for="index in 3"
                        :key="index"
                        class="feed-card skeleton-card"
                    >
                        <div class="feed-img"></div>
                        <div class="feed-body">
                            <span class="skeleton-line short"></span>
                            <span class="skeleton-line"></span>
                            <span class="skeleton-line muted"></span>
                        </div>
                    </article>
                </div>

                <div v-else-if="visibleFeedItems.length" class="feed-grid">
                    <article
                        v-for="item in visibleFeedItems"
                        :key="cardKey(item)"
                        class="feed-card"
                        @click="selectedFeed = item"
                    >
                        <button
                            class="feed-close"
                            type="button"
                            aria-label="关闭推荐"
                            @click.stop="dismissCard(item)"
                        >
                            ×
                        </button>
                        <div
                            v-if="shouldShowCover(item)"
                            class="feed-img cover"
                            :class="imageClass(item)"
                        >
                            <img
                                :src="item.coverUrl"
                                :alt="item.title"
                                @error="markCoverBroken(item)"
                            />
                        </div>
                        <div v-else class="feed-img" :class="imageClass(item)">
                            {{ cardEmoji(item) }}
                        </div>
                        <div class="feed-body">
                            <span class="feed-type" :class="typeClass(item)">
                                {{ typeLabel(item) }}
                            </span>
                            <div class="feed-title">{{ item.title }}</div>
                            <div v-if="item.subtitle" class="feed-subtitle">
                                {{ item.subtitle }}
                            </div>
                            <div v-if="item.reason" class="feed-reason">
                                ✨ {{ item.reason }}
                            </div>
                            <div v-if="item.tags.length" class="feed-tags">
                                <span
                                    v-for="tag in item.tags.slice(0, 3)"
                                    :key="`${cardKey(item)}-${tag}`"
                                >
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                    </article>
                </div>

                <div v-else class="empty-feed">
                    <strong>{{ emptyTitle }}</strong>
                    <span>{{ emptyDescription }}</span>
                    <button
                        class="btn btn-outline"
                        type="button"
                        @click="restoreFeed"
                    >
                        恢复推荐
                    </button>
                </div>
            </div>
        </section>

        <section v-if="profileRecommendations.length" class="profile-advice">
            <button
                v-for="item in profileRecommendations"
                :key="`${item.type}-${item.title}`"
                class="advice-row"
                type="button"
            >
                <span>{{ profileRecommendationIcon(item.type) }}</span>
                <strong>{{ item.title || item.type || "画像建议" }}</strong>
                <em>{{ item.desc }}</em>
            </button>
        </section>

        <Teleport to="body">
            <Transition name="rec-modal">
                <div
                    v-if="selectedFeed"
                    class="rec-backdrop"
                    @click.self="selectedFeed = null"
                >
                    <section
                        class="rec-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="feed-title"
                    >
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭推荐详情"
                            @click="selectedFeed = null"
                        >
                            ×
                        </button>
                        <div
                            v-if="shouldShowCover(selectedFeed)"
                            class="feed-detail-icon cover"
                            :class="imageClass(selectedFeed)"
                        >
                            <img
                                :src="selectedFeed.coverUrl"
                                :alt="selectedFeed.title"
                                @error="markCoverBroken(selectedFeed)"
                            />
                        </div>
                        <div
                            v-else
                            class="feed-detail-icon"
                            :class="imageClass(selectedFeed)"
                        >
                            {{ cardEmoji(selectedFeed) }}
                        </div>
                        <span
                            class="feed-type"
                            :class="typeClass(selectedFeed)"
                        >
                            {{ typeLabel(selectedFeed) }}
                        </span>
                        <h3 id="feed-title">{{ selectedFeed.title }}</h3>
                        <p>
                            {{
                                selectedFeed.subtitle ||
                                selectedFeed.reason ||
                                "这条推荐已根据你的画像生成。"
                            }}
                        </p>
                        <div
                            v-if="selectedFeed.tags.length"
                            class="detail-tags"
                        >
                            <span
                                v-for="tag in selectedFeed.tags"
                                :key="`${cardKey(selectedFeed)}-detail-${tag}`"
                            >
                                {{ tag }}
                            </span>
                        </div>
                        <button class="btn" type="button" @click="openTarget">
                            {{
                                selectedFeed.targetUrl ? "查看详情" : "我知道了"
                            }}
                        </button>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
    ApiRecommendation,
    type RecommendationCardVO,
    type RecommendationHomeVO,
    type RecommendationVO,
    type UserProfileVO,
} from "@/network";
import { useUserStore } from "@/store";

type FilterOption = {
    value: string;
    label: string;
    count: number;
};

const router = useRouter();
const userStore = useUserStore();

const profile = ref<UserProfileVO | null>(null);
const home = ref<RecommendationHomeVO | null>(null);
const categoryCards = ref<Record<string, RecommendationCardVO[]>>({});
const selectedFilter = ref("all");
const selectedFeed = ref<RecommendationCardVO | null>(null);
const dismissedCardKeys = ref<Set<string>>(new Set());
const brokenCoverKeys = ref<Set<string>>(new Set());
const isLoadingProfile = ref(false);
const isLoadingCards = ref(false);
const errorMessage = ref("");
let loadedUserId: number | null = null;

const activeUserId = computed(() => {
    const loginId = Number(userStore.G_LoginInfo.id);
    const infoId = Number(userStore.G_UserInfo.id);
    return Number.isFinite(loginId) && loginId > 0 ? loginId : infoId;
});
const hasActiveUser = computed(() => isValidUserId(activeUserId.value));
const isReloading = computed(
    () => isLoadingProfile.value || isLoadingCards.value,
);

const profileTitleText = computed(() => {
    if (profile.value?.profileTitle) return profile.value.profileTitle;
    if (isLoadingProfile.value) return "正在生成你的养生画像";
    return "画像待生成";
});
const profileTags = computed(() => profile.value?.profileTags ?? []);
const summaryChips = computed(() => {
    const summary = profile.value?.summary;
    if (!summary) return [];
    return [
        { label: "体质", value: summary.constitution },
        { label: "节气", value: summary.solarTerm },
        { label: "周期", value: summary.menstrualPhase },
        { label: "睡眠", value: summary.sleepType },
    ].filter((item): item is { label: string; value: string } =>
        Boolean(item.value),
    );
});
const profileRecommendations = computed(() =>
    (profile.value?.recommendations ?? []).filter(
        (item) => item.title || item.desc,
    ),
);
const homeTitle = computed(() => home.value?.title || "今日为你精选");
const homeSummary = computed(
    () => home.value?.summary || "根据你的体质、经期、睡眠和节气动态推荐",
);
const homeCards = computed(() =>
    (home.value?.groups ?? []).flatMap((group) => group.cards),
);
const feedFilters = computed<FilterOption[]>(() => {
    const groups = (home.value?.groups ?? []).filter((group) => group.category);
    return [
        { value: "all", label: "全部", count: homeCards.value.length },
        ...groups.map((group) => ({
            value: group.category,
            label: group.categoryText || categoryLabel(group.category),
            count: group.cards.length,
        })),
    ];
});
const currentFeedItems = computed(() => {
    if (selectedFilter.value === "all") return homeCards.value;
    const cached = categoryCards.value[selectedFilter.value];
    if (cached) return cached;
    return (
        home.value?.groups.find(
            (group) => group.category === selectedFilter.value,
        )?.cards ?? []
    );
});
const visibleFeedItems = computed(() =>
    currentFeedItems.value.filter(
        (item) => !dismissedCardKeys.value.has(cardKey(item)),
    ),
);
const emptyTitle = computed(() =>
    isLoadingCards.value ? "正在同步推荐" : "这一类暂时没有推荐",
);
const emptyDescription = computed(() =>
    errorMessage.value
        ? "可稍后重试，或切换到全部推荐。"
        : "保存更多睡眠、经期或情绪记录后，系统会给出更贴合的内容。",
);

async function reloadAll() {
    if (!hasActiveUser.value) return;
    const userId = activeUserId.value;
    loadedUserId = userId;
    errorMessage.value = "";
    dismissedCardKeys.value = new Set();
    brokenCoverKeys.value = new Set();
    categoryCards.value = {};
    isLoadingProfile.value = true;
    isLoadingCards.value = true;

    const [profileResult, homeResult] = await Promise.allSettled([
        ApiRecommendation.getProfile(userId),
        ApiRecommendation.getHome(userId),
    ]);

    if (profileResult.status === "fulfilled") {
        profile.value = profileResult.value;
    } else {
        console.error("同步用户画像失败", profileResult.reason);
    }

    if (homeResult.status === "fulfilled") {
        home.value = homeResult.value;
        if (
            selectedFilter.value !== "all" &&
            !homeResult.value.groups.some(
                (group) => group.category === selectedFilter.value,
            )
        ) {
            selectedFilter.value = "all";
        }
    } else {
        console.error("同步首页推荐失败", homeResult.reason);
    }

    if (
        profileResult.status === "rejected" ||
        homeResult.status === "rejected"
    ) {
        errorMessage.value = resolveRecommendationErrorMessage(
            homeResult.status === "rejected"
                ? homeResult.reason
                : profileResult.status === "rejected"
                  ? profileResult.reason
                  : null,
            "推荐同步失败，请稍后重试",
        );
    }

    isLoadingProfile.value = false;
    isLoadingCards.value = false;
}

async function selectFilter(value: string) {
    selectedFilter.value = value;
    errorMessage.value = "";
    if (value === "all" || categoryCards.value[value]) return;
    await loadCategory(value);
}

async function loadCategory(category: string) {
    if (!hasActiveUser.value) return;
    isLoadingCards.value = true;
    try {
        const cards = await ApiRecommendation.getCategory(
            category,
            activeUserId.value,
        );
        categoryCards.value = {
            ...categoryCards.value,
            [category]: cards,
        };
    } catch (error) {
        console.error("同步分类推荐失败", error);
        errorMessage.value = resolveRecommendationErrorMessage(
            error,
            "分类推荐同步失败，请稍后重试",
        );
    } finally {
        isLoadingCards.value = false;
    }
}

function restoreFeed() {
    dismissedCardKeys.value = new Set();
    if (
        selectedFilter.value !== "all" &&
        !categoryCards.value[selectedFilter.value]
    ) {
        void loadCategory(selectedFilter.value);
    }
}

function dismissCard(item: RecommendationCardVO) {
    dismissedCardKeys.value = new Set([
        ...dismissedCardKeys.value,
        cardKey(item),
    ]);
}

function shouldShowCover(item: RecommendationCardVO) {
    return Boolean(item.coverUrl) && !brokenCoverKeys.value.has(cardKey(item));
}

function markCoverBroken(item: RecommendationCardVO) {
    brokenCoverKeys.value = new Set([...brokenCoverKeys.value, cardKey(item)]);
}

async function openTarget() {
    const item = selectedFeed.value;
    if (!item?.targetUrl) {
        selectedFeed.value = null;
        return;
    }

    const targetUrl = item.targetUrl.trim();
    selectedFeed.value = null;
    if (/^https?:\/\//i.test(targetUrl)) {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
        return;
    }

    await router.push(targetUrl).catch(() => {
        window.location.href = targetUrl;
    });
}

function cardKey(item: RecommendationCardVO) {
    return [
        item.category || "recommendation",
        item.id ?? item.targetId ?? item.title,
    ].join(":");
}

function categoryLabel(category: string) {
    const labels: Record<string, string> = {
        diet_therapy: "食疗方案",
        article: "养生文章",
        meditation: "冥想放松",
        video: "视频课程",
        sleep: "睡眠改善",
        emotion: "情绪疗愈",
        menstrual: "经期调养",
    };
    return labels[category] ?? category;
}

function typeLabel(item: RecommendationCardVO) {
    if (item.categoryText) return item.categoryText;
    if (item.targetType) return categoryLabel(item.targetType);
    return categoryLabel(item.category) || "推荐";
}

function cardTone(item: RecommendationCardVO) {
    const text = `${item.category} ${item.categoryText} ${item.targetType}`;
    if (/diet|recipe|food|食|膳|茶/.test(text)) return "gold";
    if (/sleep|meditation|mind|冥想|睡眠|放松/.test(text)) return "moon";
    if (/menstrual|period|经期|周期|黄体/.test(text)) return "pink";
    if (/video|course|课|视频/.test(text)) return "cinnabar";
    return "jade";
}

function imageClass(item: RecommendationCardVO) {
    return cardTone(item);
}

function typeClass(item: RecommendationCardVO) {
    return `type-${cardTone(item)}`;
}

function cardEmoji(item: RecommendationCardVO) {
    const tone = cardTone(item);
    if (tone === "gold") return "🍵";
    if (tone === "moon") return "🌙";
    if (tone === "pink") return "🌸";
    if (tone === "cinnabar") return "📖";
    return "🌿";
}

function profileRecommendationIcon(type: RecommendationVO["type"]) {
    if (!type) return "✨";
    if (/diet|recipe|食|茶/.test(type)) return "🍵";
    if (/sleep|meditation|睡|冥想/.test(type)) return "🌙";
    if (/emotion|情绪/.test(type)) return "🫂";
    return "✨";
}

function resolveRecommendationErrorMessage(error: unknown, fallback: string) {
    const response = (
        error as { response?: { status?: number; data?: unknown } }
    )?.response;
    if (response?.status === 401) return "登录已过期，请重新登录";
    if (response?.status === 403) return "当前登录状态无权访问推荐接口";
    return (
        readErrorMessage(response?.data) || readErrorMessage(error) || fallback
    );
}

function readErrorMessage(data: unknown) {
    if (typeof data !== "object" || data === null) return "";
    const source = data as Record<string, unknown>;
    return typeof source.message === "string"
        ? source.message
        : typeof source.msg === "string"
          ? source.msg
          : "";
}

function isValidUserId(value: number) {
    return Number.isFinite(value) && value > 0;
}

onMounted(() => {
    void reloadAll();
});

watch(activeUserId, (userId) => {
    if (isValidUserId(userId) && userId !== loadedUserId) {
        void reloadAll();
    }
});
</script>

<style scoped lang="scss">
.recommendation-panel {
    position: relative;
}

.profile-strip {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white;
    border-radius: 16px;
    padding: 22px 28px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: var(--shadow-lg);
    animation: cardRise 0.28s ease both;
}

.profile-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.16);
    font-size: 28px;
    flex-shrink: 0;
}

.profile-main {
    flex: 1;
    min-width: 0;
}

.label {
    font-size: 12px;
    opacity: 0.8;
    letter-spacing: 0;
}

.profile-title {
    font-family: "STKaiti", serif;
    font-size: 22px;
    line-height: 1.35;
    margin-top: 2px;
}

.summary-chips,
.tags,
.feed-tags,
.detail-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.summary-chips {
    margin-top: 8px;
}

.summary-chips span,
.tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
}

.tags {
    margin-top: 8px;
}

.btn-outline {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
}

.btn {
    border: none;
    padding: 10px 20px;
    border-radius: 22px;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn:not(.btn-outline) {
    background: var(--jade);
    color: white;
}

.btn:hover:not(:disabled):not(.btn-outline) {
    background: var(--ink);
    transform: translateY(-1px);
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.card {
    background: var(--paper);
    border-radius: 14px;
    padding: 24px;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.4);
    animation: cardRise 0.28s ease both;
}

.state-card,
.recommendation-card {
    margin-top: 20px;
}

.state-card {
    color: var(--ink-muted);
    text-align: center;
}

.card-title {
    font-family: "STKaiti", serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 8px;
}

.card-title .dot {
    width: 4px;
    height: 16px;
    background: var(--jade);
    border-radius: 2px;
}

.section-summary {
    margin-top: 6px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.7;
}

.row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
}

.filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.term-chip {
    flex-shrink: 0;
    padding: 8px 14px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 13px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.term-chip span {
    margin-left: 4px;
    color: inherit;
    opacity: 0.72;
}

.term-chip:hover {
    border-color: var(--jade);
    color: var(--jade);
}

.term-chip.active {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
}

.sync-alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 12px 0 16px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--cinnabar-soft);
    color: var(--cinnabar);
    font-size: 13px;
}

.sync-alert button {
    border: 1px solid rgba(179, 60, 44, 0.22);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.56);
    color: var(--cinnabar);
    cursor: pointer;
    font-family: inherit;
    padding: 5px 12px;
}

.feed-shell {
    position: relative;
    overflow: hidden;
    border-radius: 14px;
}

.sync-mask {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
    background: rgba(253, 250, 243, 0.52);
}

.sync-mask span {
    position: absolute;
    top: -28%;
    bottom: -28%;
    left: -45%;
    width: 36%;
    transform: rotate(14deg);
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.74),
        transparent
    );
    animation: shimmer 1.1s ease-in-out infinite;
}

.feed-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.feed-card {
    background: var(--paper);
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--line);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    min-height: 274px;
}

.feed-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
}

.feed-img {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    overflow: hidden;
}

.feed-img img,
.feed-detail-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.feed-img.cover,
.feed-detail-icon.cover {
    background: var(--paper-warm);
}

.feed-img.jade,
.feed-detail-icon.jade {
    background: linear-gradient(135deg, var(--jade-soft), #d5e4da);
}

.feed-img.pink,
.feed-detail-icon.pink {
    background: linear-gradient(135deg, var(--pink-soft), #f5d5dd);
}

.feed-img.gold,
.feed-detail-icon.gold {
    background: linear-gradient(135deg, var(--gold-soft), #efd9a8);
}

.feed-img.moon,
.feed-detail-icon.moon {
    background: linear-gradient(135deg, var(--moon-soft), #c8d5e5);
}

.feed-img.cinnabar,
.feed-detail-icon.cinnabar {
    background: linear-gradient(135deg, var(--cinnabar-soft), #f0c2ba);
}

.feed-body {
    padding: 14px;
}

.feed-type {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 8px;
    margin-bottom: 6px;
}

.type-gold {
    background: var(--gold-soft);
    color: var(--gold-deep);
}

.type-jade {
    background: var(--jade-soft);
    color: var(--jade);
}

.type-moon {
    background: var(--moon-soft);
    color: var(--moon);
}

.type-pink {
    background: var(--pink-soft);
    color: var(--pink);
}

.type-cinnabar {
    background: var(--cinnabar-soft);
    color: var(--cinnabar);
}

.feed-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.45;
    color: var(--ink);
}

.feed-subtitle {
    margin-top: 5px;
    color: var(--ink-muted);
    font-size: 12px;
    line-height: 1.5;
}

.feed-reason {
    margin-top: 8px;
    font-size: 11px;
    color: var(--ink-muted);
    display: flex;
    align-items: flex-start;
    gap: 4px;
}

.feed-tags {
    margin-top: 10px;
}

.feed-tags span,
.detail-tags span {
    border-radius: 999px;
    background: var(--paper-warm);
    color: var(--ink-muted);
    font-size: 11px;
    padding: 3px 8px;
}

.feed-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 16px;
    color: var(--ink-muted);
}

.feed-card:hover .feed-close {
    opacity: 1;
}

.feed-close:hover {
    color: var(--cinnabar);
}

.empty-feed {
    padding: 28px;
    border-radius: 14px;
    background: var(--paper-warm);
    border: 1px dashed var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    color: var(--ink-muted);
    font-size: 13px;
}

.empty-feed strong {
    color: var(--ink);
}

.empty-feed .btn-outline {
    color: var(--jade);
    border-color: var(--jade);
    background: transparent;
}

.profile-advice {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 20px;
}

.advice-row {
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--paper);
    padding: 12px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 10px;
    text-align: left;
    color: var(--ink);
    font-family: inherit;
    cursor: default;
}

.advice-row span {
    grid-row: span 2;
    font-size: 20px;
}

.advice-row strong {
    font-size: 13px;
}

.advice-row em {
    color: var(--ink-muted);
    font-size: 12px;
    line-height: 1.5;
    font-style: normal;
}

.skeleton-card {
    cursor: default;
    pointer-events: none;
}

.skeleton-card .feed-img,
.skeleton-line {
    background: linear-gradient(90deg, var(--line-soft), var(--paper-warm));
}

.skeleton-line {
    display: block;
    height: 12px;
    border-radius: 999px;
    margin-top: 10px;
}

.skeleton-line.short {
    width: 34%;
    margin-top: 0;
}

.skeleton-line.muted {
    width: 72%;
}

.rec-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.34);
}

.rec-dialog {
    position: relative;
    width: min(500px, 100%);
    padding: 28px;
    border-radius: 18px;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    box-shadow: 0 24px 60px rgba(44, 54, 57, 0.22);
}

.rec-dialog h3 {
    margin-top: 8px;
    font-family: "STKaiti", serif;
    font-size: 24px;
    color: var(--ink);
    line-height: 1.35;
}

.rec-dialog p {
    margin: 8px 0 16px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.7;
}

.detail-tags {
    margin: -4px 0 18px;
}

.modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 34px;
    height: 34px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
    font-size: 22px;
}

.feed-detail-icon {
    width: 86px;
    height: 86px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    overflow: hidden;
    margin-bottom: 10px;
}

.rec-modal-enter-active,
.rec-modal-leave-active {
    transition: opacity 0.22s ease;
}

.rec-modal-enter-active .rec-dialog,
.rec-modal-leave-active .rec-dialog {
    transition: transform 0.22s ease;
}

.rec-modal-enter-from,
.rec-modal-leave-to {
    opacity: 0;
}

.rec-modal-enter-from .rec-dialog,
.rec-modal-leave-to .rec-dialog {
    transform: translateY(16px) scale(0.98);
}

@keyframes cardRise {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shimmer {
    to {
        left: 110%;
    }
}

@media (max-width: 900px) {
    .profile-strip,
    .row {
        align-items: flex-start;
        flex-direction: column;
    }

    .filter-row {
        justify-content: flex-start;
    }

    .feed-grid,
    .profile-advice {
        grid-template-columns: 1fr;
    }
}
</style>
