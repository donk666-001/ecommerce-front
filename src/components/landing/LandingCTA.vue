<template>
    <section ref="sectionEl" class="cta-section">
        <div class="cta-glow" />
        <div class="container">
            <div class="cta-content">
                <h2 class="cta-title" data-animate style="--delay: 80ms">
                    与自然同频<br />从今天开始
                </h2>
                <p class="cta-sub" data-animate style="--delay: 160ms">
                    免费注册，立即体验六大功能模块<br />让 AI
                    管家为你生成第一份专属养生日历
                </p>
                <div class="cta-btns" data-animate style="--delay: 260ms">
                    <button class="cta-btn-p" @click="$emit('go-login')">
                        🌿 免费开始使用
                    </button>
                    <button class="cta-btn-o">查看全部功能</button>
                </div>
                <div class="cta-features" data-animate style="--delay: 360ms">
                    <span
                        v-for="f in ctaFeatures"
                        :key="f"
                        class="cta-feature-item"
                        >{{ f }}</span
                    >
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useScrollAnimate } from "@/composables/landing/useScrollAnimate";

defineEmits<{ "go-login": [] }>();

const sectionEl = ref<HTMLElement | null>(null);
onMounted(() => {
    if (sectionEl.value) useScrollAnimate(sectionEl.value);
});

const ctaFeatures = [
    "完全免费注册",
    "AI 体质评估",
    "专属养生日历",
    "50+ 认证专家",
];
</script>

<style lang="scss" scoped>
.cta-section {
    padding: 120px 0;
    background: rgba(6, 10, 5, 0.7);
    position: relative;
    overflow: hidden;
    z-index: 1;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
}
.cta-glow {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 600px;
    height: 320px;
    background: radial-gradient(
        ellipse at 50% 0%,
        rgba(93, 112, 82, 0.12) 0%,
        transparent 70%
    );
    pointer-events: none;
}
.cta-content {
    position: relative;
    z-index: 1;
    text-align: center;
}
.cta-title {
    font-size: clamp(2.5rem, 4.5vw, 3.5rem);
    font-weight: 500;
    color: white;
    line-height: 1.5;
    font-family: "STKaiti", "KaiTi", "STSong", serif;
    margin-bottom: 20px;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
    text-wrap: balance;
}
.cta-sub {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.85;
    margin-bottom: 44px;
}
.cta-btns {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
}
.cta-btn-p {
    background: rgba(93, 112, 82, 0.85);
    color: white;
    border-radius: 999px;
    padding: 17px 38px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(93, 112, 82, 0.6);
    box-shadow: 0 8px 32px rgba(93, 112, 82, 0.3);
    transition: all 0.25s;
    &:hover {
        transform: scale(1.04);
        background: rgba(93, 112, 82, 1);
    }
}
.cta-btn-o {
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.78);
    border-radius: 999px;
    padding: 17px 38px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.25s;
    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.32);
    }
}
.cta-features {
    display: flex;
    gap: 36px;
    justify-content: center;
    margin-top: 52px;
    flex-wrap: wrap;
}
.cta-feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.38);
    &::before {
        content: "✓";
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: rgba(93, 112, 82, 0.25);
        color: var(--ld-moss-light);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
    }
}
</style>
