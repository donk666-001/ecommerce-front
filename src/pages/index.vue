<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <div class="hub">
            <!-- Hero -->
            <section class="hero">
                <div class="hero-text">
                    <div class="hero-label font-serif">YǍNG SHĒNG ZHÌ KÙ · 顺应节气 调和阴阳</div>
                    <h1 class="font-serif">养生智库</h1>
                    <p class="hero-sub">集二十四节气、睡眠作息、经期管理、中医养生、情绪疗愈与个性推荐于一体</p>
                </div>
                <div class="hero-meta">
                    <span class="meta-item">🌿 今日节气 <strong>立夏·第3日</strong></span>
                    <span class="meta-item" style="cursor:pointer" @click="switchTab('sleep')">🌙 昨夜睡眠 <strong>7h 42min</strong></span>
                    <span class="meta-item" style="cursor:pointer" @click="switchTab('menstrual')">🌸 经期阶段 <strong>黄体期 D18</strong></span>
                    <span class="meta-item">⚖️ 体质 <strong>阴虚兼气郁</strong></span>
                </div>
            </section>

            <!-- Module Tabs -->
            <div class="tabs">
                <button
                    v-for="tab in tabs"
                    :key="tab.name"
                    class="tab"
                    :class="{ active: activeTab === tab.name }"
                    @click="switchTab(tab.name)"
                >
                    <span class="tab-icon">{{ tab.icon }}</span>
                    {{ tab.label }}
                </button>
            </div>

            <!-- Tab Panels -->
            <div v-show="activeTab === 'solar-term'" class="panel-wrap">
                <SolarTermKnowledge />
            </div>
            <div v-show="activeTab === 'sleep'" class="panel-wrap">
                <SleepTracker />
            </div>
            <div v-show="activeTab === 'menstrual'" class="panel-wrap">
                <MenstrualTracker />
            </div>
            <div v-show="activeTab === 'tcm'" class="panel-wrap">
                <TcmWisdom />
            </div>
            <div v-show="activeTab === 'emotion'" class="panel-wrap">
                <EmotionHealing />
            </div>
            <div v-show="activeTab === 'recommendation'" class="panel-wrap">
                <PersonalizedRecommendation />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import SolarTermKnowledge from "@/components/SolarTermKnowledge.vue";
import SleepTracker from "@/components/SleepTracker.vue";
import MenstrualTracker from "@/components/MenstrualTracker.vue";
import TcmWisdom from "@/components/TcmWisdom.vue";
import EmotionHealing from "@/components/EmotionHealing.vue";
import PersonalizedRecommendation from "@/components/PersonalizedRecommendation.vue";

const activeTab = ref("solar-term");

const tabs = [
    { name: "solar-term", icon: "🌿", label: "节气养生" },
    { name: "sleep", icon: "🌙", label: "睡眠作息" },
    { name: "menstrual", icon: "🌸", label: "经期管理" },
    { name: "tcm", icon: "🍵", label: "中医养生" },
    { name: "emotion", icon: "🫂", label: "情绪疗愈" },
    { name: "recommendation", icon: "✨", label: "个性推荐" },
];

function switchTab(name: string) {
    activeTab.value = name;
}
</script>

<style scoped lang="scss">
.page-wrapper {
    min-height: 100vh;
}

.hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 40px 80px;
}

// Hero
.hero {
    background: linear-gradient(135deg, #FDFAF3 0%, #F0E8D5 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 20px;
    padding: 36px 40px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '養';
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        font-family: "STKaiti", serif;
        font-size: 200px;
        color: var(--gold);
        opacity: 0.10;
        line-height: 1;
        font-weight: 900;
        pointer-events: none;
    }
}

.hero-label {
    font-size: 13px;
    color: var(--gold);
    letter-spacing: 4px;
    margin-bottom: 8px;
}

.hero h1 {
    font-size: 38px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
}

.hero-sub {
    color: var(--ink-muted);
    font-size: 15px;
    max-width: 580px;
}

.hero-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    font-size: 13px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);

    strong {
        color: var(--jade);
        font-weight: 600;
    }
}

// Tabs
.tabs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-bottom: 28px;
    background: var(--paper);
    border-radius: 14px;
    padding: 8px;
    box-shadow: var(--shadow);
}

.tab {
    background: transparent;
    border: none;
    padding: 14px 8px;
    cursor: pointer;
    border-radius: 10px;
    font-family: inherit;
    color: var(--ink-muted);
    font-size: 13px;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    &:hover {
        background: var(--cream);
        color: var(--ink);
    }

    &.active {
        background: linear-gradient(135deg, var(--jade), var(--jade-light));
        color: white;
        box-shadow: 0 4px 12px rgba(92, 131, 116, 0.3);
    }
}

.tab-icon {
    font-size: 22px;
    line-height: 1;
}

.panel-wrap {
    animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
    .hub { padding: 20px 16px 60px; }
    .hero { padding: 24px 20px; }
    .hero::before { display: none; }
    .tabs { grid-template-columns: repeat(3, 1fr); }
    .hero-meta { gap: 12px; }
}
</style>
