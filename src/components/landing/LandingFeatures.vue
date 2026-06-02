<!-- src/components/landing/LandingFeatures.vue -->
<template>
    <section ref="sectionEl" class="features glass-section">
        <div class="feat-blob feat-blob-1 drifting-1" />
        <div class="feat-blob feat-blob-2 drifting-2" />
        <div class="container">
            <div class="features-header">
                <div class="section-tag" data-animate>✦ 核心功能</div>
                <h2 class="section-title" data-animate style="--delay: 80ms">
                    六大模块，<br />守护你的自然节律
                </h2>
                <p class="section-sub" data-animate style="--delay: 160ms">
                    从节气饮食到睡眠优化，从经期管理到情绪疗愈——每一个模块都与你的身体深度协同。
                </p>
            </div>
            <div class="features-grid">
                <div
                    v-for="(f, i) in features"
                    :key="f.name"
                    class="feature-card shimmer-card"
                    data-animate
                    :style="{ '--delay': `${i * 90}ms` }"
                >
                    <div class="feature-icon-wrap">{{ f.icon }}</div>
                    <div class="feature-name">{{ f.name }}</div>
                    <p class="feature-desc">{{ f.desc }}</p>
                    <div class="feature-tags">
                        <span
                            v-for="tag in f.tags"
                            :key="tag"
                            class="feature-tag"
                            >{{ tag }}</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useScrollAnimate } from "@/composables/landing/useScrollAnimate";

const sectionEl = ref<HTMLElement | null>(null);
onMounted(() => {
    if (sectionEl.value) useScrollAnimate(sectionEl.value);
});

const features = [
    {
        icon: "🌿",
        name: "节气养生",
        desc: "根据当前节气推送饮食、作息、经络调理建议，顺时而为。",
        tags: ["饮食推荐", "作息指南"],
    },
    {
        icon: "🌙",
        name: "睡眠作息",
        desc: "记录睡眠质量，AI分析规律，给出个性化改善建议。",
        tags: ["睡眠追踪", "AI分析"],
    },
    {
        icon: "🌸",
        name: "经期管理",
        desc: "智能预测经期，根据不同阶段推送养生建议。",
        tags: ["周期预测", "阶段养生"],
    },
    {
        icon: "🍵",
        name: "中医养生",
        desc: "九大体质辨识，推荐食疗、穴位与中药茶饮方案。",
        tags: ["体质辨识", "食疗方案"],
    },
    {
        icon: "🫂",
        name: "情绪疗愈",
        desc: "冥想引导、情绪日记与正念练习，找回内心平静。",
        tags: ["冥想引导", "正念练习"],
    },
    {
        icon: "✨",
        name: "个性推荐",
        desc: "AI管家综合多维数据，每日生成专属养生日历。",
        tags: ["AI定制", "每日日历"],
    },
];
</script>

<style lang="scss" scoped>
.features {
    padding: 108px 0;
    background: rgba(15, 22, 12, 0.58);
    backdrop-filter: blur(3px);
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
}

.feat-blob {
    position: absolute;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    filter: blur(64px);
    pointer-events: none;
}
.feat-blob-1 {
    right: -60px;
    top: -40px;
    width: 360px;
    height: 300px;
    background: rgba(93, 112, 82, 0.08);
}
.feat-blob-2 {
    left: -40px;
    bottom: -60px;
    width: 280px;
    height: 240px;
    background: rgba(193, 140, 93, 0.07);
    border-radius: 30% 70% 60% 40% / 50% 40% 60% 50%;
}

.features-header {
    text-align: center;
    margin-bottom: 64px;
    position: relative;
    z-index: 1;
}

.section-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
    margin-bottom: 16px;
    backdrop-filter: blur(6px);
}

.section-title {
    font-size: 42px;
    font-weight: 800;
    color: white;
    line-height: 1.15;
    letter-spacing: -0.5px;
    font-family: Georgia, "STSong", serif;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.section-sub {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.68);
    line-height: 1.75;
    max-width: 520px;
    margin: 12px auto 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    position: relative;
    z-index: 1;
}

.feature-card {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.5rem;
    padding: 32px;
    box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition:
        transform 0.3s,
        background 0.3s,
        box-shadow 0.3s;
    cursor: default;
    backdrop-filter: blur(12px);

    &:hover {
        transform: translateY(-6px);
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

        .feature-icon-wrap {
            background: rgba(93, 112, 82, 0.45);
            transform: scale(1.1) rotate(-4deg);
        }
    }
}

.feature-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(93, 112, 82, 0.25);
    border: 1px solid rgba(93, 112, 82, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 20px;
    transition: all 0.3s;
}

.feature-name {
    font-size: 18px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    margin-bottom: 10px;
}
.feature-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.7;
    margin-bottom: 16px;
}
.feature-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.feature-tag {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(93, 112, 82, 0.2);
    color: var(--ld-moss-light);
    border: 1px solid rgba(93, 112, 82, 0.25);
}
</style>
