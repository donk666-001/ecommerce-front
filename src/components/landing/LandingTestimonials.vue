<template>
    <section ref="sectionEl" class="testimonials glass-section">
        <div class="testi-blob drifting-2" />
        <div class="container">
            <div class="testi-header">
                <div class="section-tag" data-animate>✦ 用户评价</div>
                <h2 class="section-title" data-animate style="--delay: 80ms">
                    真实用户<br />真实改变
                </h2>
                <p class="section-sub" data-animate style="--delay: 160ms">
                    来自社区用户的真实体验分享。
                </p>
            </div>
            <div class="testi-grid">
                <div
                    v-for="(t, i) in testimonials"
                    :key="t.name"
                    class="testi-card shimmer-card"
                    data-animate
                    :style="{ '--delay': `${i * 110}ms` }"
                >
                    <div class="testi-quote">"</div>
                    <p class="testi-text">{{ t.text }}</p>
                    <div class="testi-user">
                        <div class="testi-avatar">{{ t.initial }}</div>
                        <div>
                            <div class="testi-name">{{ t.name }}</div>
                            <div class="testi-role">{{ t.role }}</div>
                        </div>
                        <div class="testi-stars">★★★★★</div>
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

const testimonials = [
    {
        initial: "小",
        name: "小雨同学",
        role: "使用 3 个月 · 阴虚体质",
        text: "按节气调整饮食后，整个人感觉轻盈了很多，春困也减轻了不少。",
    },
    {
        initial: "陈",
        name: "陈志远",
        role: "使用 5 个月 · 气郁体质",
        text: "AI 管家帮我分析失眠根因，照做后睡眠明显改善，再也不用数羊了。",
    },
    {
        initial: "月",
        name: "月牙儿",
        role: "使用 2 个月 · 寒湿体质",
        text: "照着张医师的专属经期方案做了两个月，痛经减轻了很多，太感谢了。",
    },
];
</script>

<style lang="scss" scoped>
.testimonials {
    padding: 108px 0;
    background: rgba(8, 14, 6, 0.44);
    backdrop-filter: blur(2px);
    position: relative;
    overflow: hidden;
    z-index: 1;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
}
.testi-blob {
    position: absolute;
    right: -80px;
    bottom: -60px;
    width: 320px;
    height: 280px;
    background: rgba(193, 140, 93, 0.07);
    border-radius: 30% 70% 60% 40% / 50% 40% 60% 50%;
    filter: blur(64px);
}
.testi-header {
    text-align: center;
    margin-bottom: 64px;
    position: relative;
    z-index: 1;
}
.section-tag {
    display: inline-flex;
    align-items: center;
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
.testi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    position: relative;
    z-index: 1;
}
.testi-card {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 2rem;
    padding: 30px;
    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition:
        transform 0.3s,
        background 0.3s;
    backdrop-filter: blur(12px);
    &:hover {
        transform: rotate(1.2deg) translateY(-4px);
        background: rgba(255, 255, 255, 0.1);
    }
    &:nth-child(2):hover {
        transform: rotate(-1.2deg) translateY(-4px);
    }
}
.testi-quote {
    font-size: 36px;
    line-height: 1;
    color: rgba(143, 168, 130, 0.5);
    font-family: Georgia, serif;
    margin-bottom: 12px;
}
.testi-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.68);
    line-height: 1.85;
    margin-bottom: 20px;
    font-style: italic;
}
.testi-user {
    display: flex;
    align-items: center;
    gap: 12px;
}
.testi-avatar {
    width: 38px;
    height: 38px;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    background: linear-gradient(
        135deg,
        rgba(93, 112, 82, 0.7),
        rgba(193, 140, 93, 0.7)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.15);
}
.testi-name {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
}
.testi-role {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}
.testi-stars {
    margin-left: auto;
    color: var(--ld-terra);
    font-size: 13px;
    letter-spacing: 1px;
}
</style>
