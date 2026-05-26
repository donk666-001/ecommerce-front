<template>
    <div>
        <div class="profile-strip">
            <div style="font-size: 36px">🌿</div>
            <div style="flex: 1">
                <div class="label">YOUR PROFILE · 你的画像</div>
                <div class="profile-title">
                    阴虚体质 · 立夏 · 黄体期 · 浅睡型
                </div>
                <div class="tags">
                    <span v-for="tag in profileTags" :key="tag" class="tag">{{
                        tag
                    }}</span>
                </div>
            </div>
            <button
                class="btn btn-outline"
                type="button"
                @click="showPreferenceModal = true"
            >
                管理偏好
            </button>
        </div>

        <div class="card" style="margin-top: 20px">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>今日为你精选
                </div>
                <div class="filter-row">
                    <button
                        v-for="f in feedFilters"
                        :key="f"
                        class="term-chip"
                        :class="{ active: selectedFilter === f }"
                        @click="selectedFilter = f"
                    >
                        {{ f }}
                    </button>
                </div>
            </div>

            <div class="feed-grid">
                <article
                    v-for="(item, idx) in visibleFeedItems"
                    :key="idx"
                    class="feed-card"
                    @click="selectedFeed = item"
                >
                    <button
                        class="feed-close"
                        type="button"
                        aria-label="关闭推荐"
                        @click.stop="item.dismissed = true"
                    >
                        ×
                    </button>
                    <div class="feed-img" :class="item.imgClass">
                        {{ item.emoji }}
                    </div>
                    <div class="feed-body">
                        <span class="feed-type" :class="item.typeClass">{{
                            item.typeLabel
                        }}</span>
                        <div class="feed-title">{{ item.title }}</div>
                        <div class="feed-reason">{{ item.reason }}</div>
                    </div>
                </article>
                <div v-if="visibleFeedItems.length === 0" class="empty-feed">
                    <strong>这一类暂时清空了</strong>
                    <button
                        class="btn btn-outline"
                        type="button"
                        @click="restoreFeed"
                    >
                        恢复推荐
                    </button>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="rec-modal">
                <div
                    v-if="showPreferenceModal"
                    class="rec-backdrop"
                    @click.self="showPreferenceModal = false"
                >
                    <section
                        class="rec-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="preference-title"
                    >
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭偏好管理"
                            @click="showPreferenceModal = false"
                        >
                            ×
                        </button>
                        <h3 id="preference-title">管理推荐偏好</h3>
                        <p>
                            选择你希望养生智库优先推荐的主题，筛选会即时影响今日精选。
                        </p>
                        <div class="preference-tags">
                            <button
                                v-for="tag in preferenceOptions"
                                :key="tag"
                                type="button"
                                :class="{ active: profileTags.includes(tag) }"
                                @click="toggleProfileTag(tag)"
                            >
                                {{ tag }}
                            </button>
                        </div>
                        <button
                            class="btn"
                            type="button"
                            @click="showPreferenceModal = false"
                        >
                            保存偏好
                        </button>
                    </section>
                </div>
            </Transition>

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
                            class="feed-detail-icon"
                            :class="selectedFeed.imgClass"
                        >
                            {{ selectedFeed.emoji }}
                        </div>
                        <span
                            class="feed-type"
                            :class="selectedFeed.typeClass"
                            >{{ selectedFeed.typeLabel }}</span
                        >
                        <h3 id="feed-title">{{ selectedFeed.title }}</h3>
                        <p>
                            {{
                                selectedFeed.reason
                            }}。已根据你的体质、节气、周期和睡眠标签生成，可加入今日计划。
                        </p>
                        <button
                            class="btn"
                            type="button"
                            @click="selectedFeed = null"
                        >
                            加入今日计划
                        </button>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type FeedItem = {
    emoji: string;
    imgClass: string;
    typeLabel: string;
    typeClass: string;
    title: string;
    reason: string;
    dismissed: boolean;
};

const profileTags = ref([
    "阴虚",
    "气郁",
    "立夏",
    "睡眠改善",
    "经期养护",
    "冥想",
    "食疗",
]);

const feedFilters = ["全部", "食谱", "文章", "冥想", "视频"];
const selectedFilter = ref("全部");
const showPreferenceModal = ref(false);
const selectedFeed = ref<FeedItem | null>(null);
const preferenceOptions = [
    "阴虚",
    "气郁",
    "立夏",
    "睡眠改善",
    "经期养护",
    "冥想",
    "食疗",
    "运动",
    "课程",
    "情绪",
];

const feedItems = ref<FeedItem[]>([
    {
        emoji: "🍵",
        imgClass: "gold",
        typeLabel: "食谱",
        typeClass: "type-recipe",
        title: "立夏养阴 · 冰糖银耳莲子羹",
        reason: "✨ 阴虚体质 · 立夏节气",
        dismissed: false,
    },
    {
        emoji: "🧘",
        imgClass: "jade",
        typeLabel: "文章",
        typeClass: "type-article",
        title: "黄体期 7 天瑜伽方案，缓解经前综合征",
        reason: "✨ 经期阶段 · 历史偏好",
        dismissed: false,
    },
    {
        emoji: "🌙",
        imgClass: "moon",
        typeLabel: "冥想",
        typeClass: "type-meditation",
        title: "浅睡型 · 深度入眠引导 20 分钟",
        reason: "✨ 昨夜深睡仅 23% · 推荐改善",
        dismissed: false,
    },
    {
        emoji: "🌸",
        imgClass: "pink",
        typeLabel: "食疗方",
        typeClass: "type-recipe",
        title: "气郁体质必备 · 玫瑰陈皮茶",
        reason: "✨ 兼体质 · 气郁调理",
        dismissed: false,
    },
    {
        emoji: "📖",
        imgClass: "jade",
        typeLabel: "视频课",
        typeClass: "type-video",
        title: "八段锦第三式：调理脾胃须单举",
        reason: "✨ 学习中 · 接续上次",
        dismissed: false,
    },
    {
        emoji: "📜",
        imgClass: "gold",
        typeLabel: "文章",
        typeClass: "type-article",
        title: "为什么阴虚的人立夏要格外护心？",
        reason: "✨ 体质 + 节气交叉推荐",
        dismissed: false,
    },
]);

const visibleFeedItems = computed(() =>
    feedItems.value.filter((item) => {
        if (item.dismissed) return false;
        if (selectedFilter.value === "全部") return true;
        if (selectedFilter.value === "食谱")
            return item.typeLabel.includes("食");
        if (selectedFilter.value === "视频")
            return item.typeLabel.includes("视频");
        return item.typeLabel.includes(selectedFilter.value);
    }),
);

function restoreFeed() {
    feedItems.value.forEach((item) => {
        item.dismissed = false;
    });
}

function toggleProfileTag(tag: string) {
    if (profileTags.value.includes(tag)) {
        profileTags.value = profileTags.value.filter((item) => item !== tag);
        return;
    }
    profileTags.value.push(tag);
}
</script>

<style scoped lang="scss">
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
.profile-strip .label {
    font-size: 12px;
    opacity: 0.8;
    letter-spacing: 2px;
}
.profile-title {
    font-family: "STKaiti", serif;
    font-size: 22px;
    margin-top: 2px;
}
.profile-strip .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
}
.profile-strip .tag {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
}
.btn-outline {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 10px 20px;
    border-radius: 22px;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-outline:hover {
    background: rgba(255, 255, 255, 0.3);
}
.btn {
    background: var(--jade);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 22px;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}
.btn:hover {
    background: var(--ink);
    transform: translateY(-1px);
}

.card {
    background: var(--paper);
    border-radius: 14px;
    padding: 24px;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.4);
    animation: cardRise 0.28s ease both;
}
.card-title {
    font-family: "STKaiti", serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 16px;
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
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}
.filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
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
}
.feed-img.jade {
    background: linear-gradient(135deg, var(--jade-soft), #d5e4da);
}
.feed-img.pink {
    background: linear-gradient(135deg, var(--pink-soft), #f5d5dd);
}
.feed-img.gold {
    background: linear-gradient(135deg, var(--gold-soft), #efd9a8);
}
.feed-img.moon {
    background: linear-gradient(135deg, var(--moon-soft), #c8d5e5);
}
.feed-detail-icon.jade {
    background: linear-gradient(135deg, var(--jade-soft), #d5e4da);
}
.feed-detail-icon.pink {
    background: linear-gradient(135deg, var(--pink-soft), #f5d5dd);
}
.feed-detail-icon.gold {
    background: linear-gradient(135deg, var(--gold-soft), #efd9a8);
}
.feed-detail-icon.moon {
    background: linear-gradient(135deg, var(--moon-soft), #c8d5e5);
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
.type-recipe {
    background: var(--gold-soft);
    color: var(--gold);
}
.type-article {
    background: var(--jade-soft);
    color: var(--jade);
}
.type-meditation {
    background: var(--moon-soft);
    color: var(--moon);
}
.type-video {
    background: var(--cinnabar-soft);
    color: var(--cinnabar);
}
.feed-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
}
.feed-reason {
    margin-top: 8px;
    font-size: 11px;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 4px;
}
.feed-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 14px;
    color: var(--ink-muted);
}
.feed-card:hover .feed-close {
    opacity: 1;
}
.feed-close:hover {
    color: var(--cinnabar);
}
.empty-feed {
    grid-column: 1 / -1;
    padding: 28px;
    border-radius: 14px;
    background: var(--paper-warm);
    border: 1px dashed var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: var(--ink-muted);
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
}
.rec-dialog p {
    margin: 8px 0 16px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.7;
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
.preference-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
}
.preference-tags button {
    border: 1px solid var(--line);
    background: var(--paper-warm);
    color: var(--ink-muted);
    border-radius: 999px;
    padding: 7px 12px;
    font-family: inherit;
    cursor: pointer;
}
.preference-tags button.active {
    background: var(--jade);
    border-color: var(--jade);
    color: white;
}
.feed-detail-icon {
    width: 86px;
    height: 86px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
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

@media (max-width: 900px) {
    .feed-grid {
        grid-template-columns: 1fr;
    }
}
</style>
