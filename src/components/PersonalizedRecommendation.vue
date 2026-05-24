<template>
    <div>
        <div class="profile-strip">
            <div style="font-size: 36px;">🌿</div>
            <div style="flex: 1;">
                <div class="label">YOUR PROFILE · 你的画像</div>
                <div class="profile-title">阴虚体质 · 立夏 · 黄体期 · 浅睡型</div>
                <div class="tags">
                    <span v-for="tag in profileTags" :key="tag" class="tag">{{ tag }}</span>
                </div>
            </div>
            <button class="btn btn-outline">管理偏好</button>
        </div>

        <div class="card" style="margin-top: 20px;">
            <div class="row">
                <div class="card-title" style="margin: 0;"><span class="dot"></span>今日为你精选</div>
                <div style="display: flex; gap: 8px;">
                    <button v-for="f in feedFilters" :key="f" class="term-chip" :class="{ active: selectedFilter === f }" @click="selectedFilter = f">{{ f }}</button>
                </div>
            </div>

            <div class="feed-grid">
                <div v-for="(item, idx) in feedItems" :key="idx" class="feed-card" v-show="!item.dismissed">
                    <div class="feed-close" @click="item.dismissed = true">×</div>
                    <div class="feed-img" :class="item.imgClass">{{ item.emoji }}</div>
                    <div class="feed-body">
                        <span class="feed-type" :class="item.typeClass">{{ item.typeLabel }}</span>
                        <div class="feed-title">{{ item.title }}</div>
                        <div class="feed-reason">{{ item.reason }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const profileTags = ["阴虚", "气郁", "立夏", "睡眠改善", "经期养护", "冥想", "食疗"];

const feedFilters = ["全部", "食谱", "文章", "冥想", "视频"];
const selectedFilter = ref("全部");

const feedItems = ref([
    { emoji: "🍵", imgClass: "gold", typeLabel: "食谱", typeClass: "type-recipe", title: "立夏养阴 · 冰糖银耳莲子羹", reason: "✨ 阴虚体质 · 立夏节气", dismissed: false },
    { emoji: "🧘", imgClass: "jade", typeLabel: "文章", typeClass: "type-article", title: "黄体期 7 天瑜伽方案，缓解经前综合征", reason: "✨ 经期阶段 · 历史偏好", dismissed: false },
    { emoji: "🌙", imgClass: "moon", typeLabel: "冥想", typeClass: "type-meditation", title: "浅睡型 · 深度入眠引导 20 分钟", reason: "✨ 昨夜深睡仅 23% · 推荐改善", dismissed: false },
    { emoji: "🌸", imgClass: "pink", typeLabel: "食疗方", typeClass: "type-recipe", title: "气郁体质必备 · 玫瑰陈皮茶", reason: "✨ 兼体质 · 气郁调理", dismissed: false },
    { emoji: "📖", imgClass: "jade", typeLabel: "视频课", typeClass: "type-video", title: "八段锦第三式：调理脾胃须单举", reason: "✨ 学习中 · 接续上次", dismissed: false },
    { emoji: "📜", imgClass: "gold", typeLabel: "文章", typeClass: "type-article", title: "为什么阴虚的人立夏要格外护心？", reason: "✨ 体质 + 节气交叉推荐", dismissed: false },
]);
</script>

<style scoped lang="scss">
.profile-strip {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white;
    border-radius: 16px;
    padding: 22px 28px;
    display: flex; align-items: center; gap: 24px;
}
.profile-strip .label { font-size: 12px; opacity: 0.8; letter-spacing: 2px; }
.profile-title { font-family: "STKaiti", serif; font-size: 22px; margin-top: 2px; }
.profile-strip .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.profile-strip .tag {
    background: rgba(255,255,255,0.2);
    padding: 4px 10px; border-radius: 12px;
    font-size: 12px;
}
.btn-outline {
    background: rgba(255,255,255,0.2); color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 10px 20px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.3); }

.card {
    background: var(--paper); border-radius: 14px; padding: 24px;
    box-shadow: var(--shadow); border: 1px solid rgba(232, 223, 208, 0.4);
}
.card-title {
    font-family: "STKaiti", serif; font-size: 18px; font-weight: 600;
    color: var(--ink); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
}
.card-title .dot { width: 4px; height: 16px; background: var(--jade); border-radius: 2px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

.term-chip {
    flex-shrink: 0;
    padding: 8px 14px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 13px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all .2s;
}
.term-chip:hover { border-color: var(--jade); color: var(--jade); }
.term-chip.active { background: var(--jade); color: white; border-color: var(--jade); }

.feed-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feed-card {
    background: var(--paper);
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--line);
    cursor: pointer; transition: all .2s;
    position: relative;
}
.feed-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.feed-img {
    height: 140px;
    display: flex; align-items: center; justify-content: center;
    font-size: 48px;
}
.feed-img.jade { background: linear-gradient(135deg, var(--jade-soft), #D5E4DA); }
.feed-img.pink { background: linear-gradient(135deg, var(--pink-soft), #F5D5DD); }
.feed-img.gold { background: linear-gradient(135deg, var(--gold-soft), #EFD9A8); }
.feed-img.moon { background: linear-gradient(135deg, var(--moon-soft), #C8D5E5); }
.feed-body { padding: 14px; }
.feed-type {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 8px;
    margin-bottom: 6px;
}
.type-recipe { background: var(--gold-soft); color: var(--gold); }
.type-article { background: var(--jade-soft); color: var(--jade); }
.type-meditation { background: var(--moon-soft); color: var(--moon); }
.type-video { background: var(--cinnabar-soft); color: var(--cinnabar); }
.feed-title { font-size: 14px; font-weight: 600; line-height: 1.4; }
.feed-reason {
    margin-top: 8px; font-size: 11px; color: var(--ink-muted);
    display: flex; align-items: center; gap: 4px;
}
.feed-close {
    position: absolute; top: 8px; right: 8px;
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(255,255,255,0.9);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; opacity: 0;
    transition: opacity .2s;
    font-size: 14px; color: var(--ink-muted);
}
.feed-card:hover .feed-close { opacity: 1; }
.feed-close:hover { color: var(--cinnabar); }

@media (max-width: 900px) { .feed-grid { grid-template-columns: 1fr; } }
</style>
