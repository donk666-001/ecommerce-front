<!-- src/components/landing/LandingHero.vue -->
<template>
    <section class="hero">
        <!-- 左侧文案 -->
        <div class="hero-left">
            <div class="hero-badge">🌿 传承东方养生智慧 · 顺时而为</div>
            <h1 class="hero-title">
                <span class="light">让每一天</span>
                <span ref="typeEl"></span>
            </h1>
            <p class="hero-sub">
                二十四节气 × 中医古方 × AI个性推荐<br />
                一站式东方自然健康生活平台，<br />
                让养生回归最本真的节律。
            </p>
            <div class="hero-btns">
                <button class="hero-btn-p" @click="$emit('go-login')">
                    🌿 开启养生之旅
                </button>
                <button class="hero-btn-o">了解更多</button>
            </div>
        </div>

        <!-- 右侧毛玻璃卡片 -->
        <div class="hero-right">
            <div
                v-for="card in cards"
                :key="card.name"
                class="fg-card shimmer-card"
                :class="{ wide: card.wide }"
                :style="{ '--card-delay': card.delay }"
            >
                <div class="fg-icon-wrap">
                    <span class="fg-icon">{{ card.icon }}</span>
                </div>
                <div>
                    <div class="fg-name">{{ card.name }}</div>
                    <div class="fg-desc">{{ card.desc }}</div>
                </div>
            </div>
        </div>

        <!-- 滚动提示 -->
        <div class="scroll-hint">
            <span class="scroll-hint-text">向下滚动</span>
            <div class="scroll-line" />
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

defineEmits<{ "go-login": [] }>();

const typeEl = ref<HTMLElement | null>(null);

const cards = [
    {
        icon: "🌿",
        name: "节气养生",
        desc: "随二十四节气变化，调整饮食起居，顺时而为",
        delay: "1.1s",
    },
    {
        icon: "🌙",
        name: "睡眠作息",
        desc: "追踪记录，优化你的自然睡眠节律",
        delay: "1.2s",
    },
    {
        icon: "🍵",
        name: "中医智慧",
        desc: "体质辨识，古法今用，调和阴阳平衡",
        delay: "1.3s",
    },
    {
        icon: "🤖",
        name: "AI 管家",
        desc: "专属健康顾问，智能分析每日状态",
        delay: "1.4s",
    },
    {
        icon: "👩‍⚕️",
        name: "名医健康圈 · 在线问诊",
        desc: "50+ 三甲医院认证专家，随时在线，专业守护",
        wide: true,
        delay: "1.5s",
    },
];

onMounted(() => {
    const el = typeEl.value;
    if (!el) return;
    const text = "与自然同频";
    let i = 0;
    function type() {
        if (i <= text.length) {
            el!.textContent = text.slice(0, i);
            i++;
            setTimeout(type, i === 1 ? 600 : 120);
        }
    }
    setTimeout(type, 900);
});
</script>

<style lang="scss" scoped>
@keyframes heroFadeUp {
    from {
        opacity: 0;
        transform: translateY(24px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.hero {
    position: relative;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 52px;
    align-items: center;
    max-width: 1240px;
    margin: 0 auto;
    padding: 140px 48px 110px;
    z-index: 1;

    &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: -48px;
        right: -48px;
        height: 180px;
        background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(10, 16, 8, 0.15) 100%
        );
        pointer-events: none;
    }
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    padding: 7px 18px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 1.5px;
    margin-bottom: 32px;
    backdrop-filter: blur(8px);
    opacity: 0;
    animation: heroFadeUp 0.8s 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hero-title {
    font-size: 86px;
    font-weight: 800;
    color: white;
    line-height: 1.02;
    letter-spacing: -3px;
    margin-bottom: 24px;
    font-family: Georgia, "STSong", serif;
    text-shadow: 0 4px 40px rgba(0, 0, 0, 0.45);
    opacity: 0;
    animation: heroFadeUp 0.9s 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    .light {
        font-weight: 300;
        font-size: 58px;
        display: block;
        opacity: 0.78;
        margin-bottom: 4px;
        letter-spacing: -1.5px;
    }
}

.hero-sub {
    font-size: 17px;
    color: rgba(255, 255, 255, 0.72);
    line-height: 1.9;
    max-width: 420px;
    margin-bottom: 40px;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    opacity: 0;
    animation: heroFadeUp 0.9s 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hero-btns {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    opacity: 0;
    animation: heroFadeUp 0.9s 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hero-btn-p {
    background: rgba(255, 255, 255, 0.95);
    color: var(--ld-moss);
    border-radius: 999px;
    padding: 16px 34px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transition: all 0.25s;
    border: none;

    &:hover {
        transform: scale(1.04) translateY(-2px);
    }
}

.hero-btn-o {
    border: 1.5px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.07);
    color: white;
    border-radius: 999px;
    padding: 16px 30px;
    font-size: 16px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.25s;

    &:hover {
        background: rgba(255, 255, 255, 0.16);
    }
}

.hero-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.fg-card {
    position: relative;
    border-radius: 22px;
    padding: 26px 20px 22px;
    overflow: hidden;
    cursor: default;
    transition:
        transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
        box-shadow 0.3s,
        background 0.3s;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(18px) saturate(1.45);
    -webkit-backdrop-filter: blur(18px) saturate(1.45);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
        0 6px 24px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.32);
    opacity: 0;
    animation: heroFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: var(--card-delay, 1.1s);

    &:hover {
        transform: translateY(-7px) scale(1.028);
        box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.26),
            inset 0 1px 0 rgba(255, 255, 255, 0.42);
        background: rgba(255, 255, 255, 0.16);
    }

    &.wide {
        grid-column: span 2;
        border-radius: 999px;
        padding: 20px 32px;
        display: flex;
        align-items: center;
        gap: 18px;
    }
}

.fg-icon-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    &::after {
        content: "";
        width: 1px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        flex-shrink: 0;
    }

    .fg-card.wide & {
        margin-bottom: 0;

        &::after {
            display: none;
        }
    }
}

.fg-icon {
    font-size: 28px;
    line-height: 1;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.22));
}
.fg-name {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.96);
    margin-bottom: 5px;
}
.fg-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
}

.scroll-hint {
    position: absolute;
    bottom: 56px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0;
    animation: heroFadeUp 0.8s 1.8s forwards;
}

.scroll-hint-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 2px;
    text-transform: uppercase;
}

.scroll-line {
    width: 1px;
    height: 36px;
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.55),
        transparent
    );
    animation: scrollLine 2s ease-in-out infinite;
}

@keyframes scrollLine {
    0%,
    100% {
        transform: scaleY(1);
        opacity: 1;
    }
    50% {
        transform: scaleY(0.6) translateY(6px);
        opacity: 0.4;
    }
}
</style>
