<!-- src/components/landing/LandingHero.vue -->
<template>
    <section class="hero">
        <!-- 左侧文案 -->
        <div class="hero-left">
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
                <button class="hero-btn-p" type="button" @click="$emit('go-login')">
                    开启养生之旅
                </button>
                <button class="hero-btn-o" type="button" @click="scrollToStory">
                    了解核心能力
                </button>
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
                    <span class="fg-icon">{{ card.seal }}</span>
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
        seal: "节",
        name: "节气养生",
        desc: "按节气、地域与体质生成每日饮食起居建议",
        delay: "1.1s",
    },
    {
        seal: "眠",
        name: "睡眠作息",
        desc: "拆解深睡、夜醒与晚间习惯，找到调理线索",
        delay: "1.2s",
    },
    {
        seal: "方",
        name: "中医智慧",
        desc: "体质辨识与古方课程，帮助传统知识进入日常",
        delay: "1.3s",
    },
    {
        seal: "AI",
        name: "AI 管家",
        desc: "结合最近记录持续追问，给出可调整的方案",
        delay: "1.4s",
    },
    {
        seal: "诊",
        name: "名医健康圈 · 在线问诊",
        desc: "50+ 三甲医院认证专家，承接 AI 识别到的专业边界",
        wide: true,
        delay: "1.5s",
    },
];

function scrollToStory() {
    const target = document.querySelector<HTMLElement>("#capability-story-section");
    if (!target) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
    });
}

onMounted(() => {
    const el = typeEl.value;
    if (!el) return;
    const text = "与自然同频";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = text;
        return;
    }
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
    padding: 100px 48px 110px;
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


.hero-title {
    font-size: clamp(3rem, 5.2vw, 5.2rem);
    font-weight: 400;
    color: white;
    line-height: 1.15;
    margin-bottom: 28px;
    font-family: "HongLeiXingShu", "STKaiti", "KaiTi", cursive;
    text-shadow:
        0 4px 40px rgba(0, 0, 0, 0.5),
        0 2px 12px rgba(0, 0, 0, 0.3);
    text-wrap: balance;
    opacity: 0;
    animation: heroFadeUp 0.9s 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;

    .light {
        font-weight: 400;
        font-size: clamp(2.2rem, 4vw, 4rem);
        display: block;
        opacity: 0.72;
        margin-bottom: 8px;
        letter-spacing: 0.08em;
    }

    /* 主打字行不换行 */
    > span:not(.light) {
        display: block;
        white-space: nowrap;
    }
}

.hero-sub {
    font-size: 17px;
    color: rgba(239, 245, 232, 0.76);
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
    background: rgba(238, 246, 226, 0.96);
    color: rgba(22, 47, 28, 0.95);
    border-radius: 999px;
    padding: 16px 34px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.22);
    transition:
        transform 0.25s var(--ld-ease-out),
        background 0.25s var(--ld-ease-out),
        box-shadow 0.25s var(--ld-ease-out);
    border: none;

    &:hover {
        transform: translateY(-2px);
        background: rgba(250, 253, 243, 0.98);
    }

    &:active {
        transform: translateY(0) scale(0.98);
    }

    &:focus-visible {
        outline: 2px solid rgba(221, 239, 202, 0.75);
        outline-offset: 3px;
    }
}

.hero-btn-o {
    border: 1px solid rgba(232, 241, 211, 0.24);
    background: rgba(232, 241, 211, 0.07);
    color: rgba(245, 250, 239, 0.88);
    border-radius: 999px;
    padding: 16px 30px;
    font-size: 16px;
    cursor: pointer;
    backdrop-filter: blur(6px);
    transition:
        transform 0.25s var(--ld-ease-out),
        background 0.25s var(--ld-ease-out),
        border-color 0.25s var(--ld-ease-out);

    &:hover {
        transform: translateY(-2px);
        background: rgba(232, 241, 211, 0.12);
        border-color: rgba(232, 241, 211, 0.38);
    }

    &:active {
        transform: translateY(0) scale(0.98);
    }

    &:focus-visible {
        outline: 2px solid rgba(221, 239, 202, 0.68);
        outline-offset: 3px;
    }
}

.hero-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.fg-card {
    position: relative;
    border-radius: 16px;
    padding: 26px 20px 22px;
    overflow: hidden;
    cursor: default;
    transition:
        transform 0.3s var(--ld-ease-out),
        border-color 0.3s var(--ld-ease-out),
        background 0.3s var(--ld-ease-out),
        box-shadow 0.3s var(--ld-ease-out);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px) saturate(1.6) brightness(1.08);
    -webkit-backdrop-filter: blur(20px) saturate(1.6) brightness(1.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.22),
        inset 0 -1px 0 rgba(255, 255, 255, 0.04);
    opacity: 0;
    animation: heroFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: var(--card-delay, 1.1s);

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(255, 255, 255, 0.28);
        background: rgba(255, 255, 255, 0.13);
        box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
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
        background: rgba(221, 239, 202, 0.18);
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
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: rgba(201, 220, 180, 0.13);
    border: 1px solid rgba(201, 220, 180, 0.14);
    color: rgba(239, 247, 229, 0.94);
    font-family: "STKaiti", "KaiTi", "STSong", serif;
    font-size: 17px;
    font-weight: 700;
    line-height: 1;
}
.fg-name {
    font-size: 14px;
    font-weight: 700;
    color: rgba(246, 250, 239, 0.94);
    margin-bottom: 5px;
}
.fg-desc {
    font-size: 12px;
    color: rgba(233, 241, 224, 0.62);
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
    color: rgba(233, 241, 224, 0.45);
    letter-spacing: 0;
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


@media (max-width: 980px) {
    .hero {
        grid-template-columns: 1fr;
        gap: 38px;
        padding: 126px 32px 92px;
    }

    .hero-right {
        max-width: 620px;
    }
}

@media (max-width: 620px) {
    .hero {
        min-height: auto;
        padding: 110px 20px 82px;
    }

    .hero-title {
        font-size: clamp(3.2rem, 16vw, 5rem);

        .light {
            font-size: clamp(2rem, 9vw, 3rem);
        }
    }

    .hero-sub {
        font-size: 15px;
        max-width: 100%;
    }

    .hero-btns {
        flex-direction: column;
        align-items: stretch;
    }

    .hero-btn-p,
    .hero-btn-o {
        width: 100%;
        padding: 15px 22px;
    }

    .hero-right {
        grid-template-columns: 1fr;
    }

    .fg-card.wide {
        grid-column: auto;
        border-radius: 16px;
        padding: 24px 20px;
        align-items: flex-start;
    }

    .scroll-hint {
        display: none;
    }

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
