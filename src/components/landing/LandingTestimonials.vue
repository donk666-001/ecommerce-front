<template>
    <section ref="sectionEl" class="testimonials">
        <div class="testi-blob" />
        <div class="container">
            <div class="testi-header">
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
                    class="testi-card"
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
    padding: 100px 0;
    background: rgba(6, 12, 4, 0.46);
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
    right: -100px;
    bottom: -80px;
    width: 360px;
    height: 320px;
    background: rgba(193, 140, 93, 0.05);
    border-radius: 30% 70% 60% 40% / 50% 40% 60% 50%;
    filter: blur(70px);
}
.testi-header {
    text-align: center;
    margin-bottom: 64px;
    position: relative;
    z-index: 1;
}
.section-title {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 500;
    color: white;
    line-height: 1.5;
    font-family: "STKaiti", "KaiTi", "STSong", serif;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
    text-wrap: balance;
}
.section-sub {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.8;
    max-width: 520px;
    margin: 14px auto 0;
}
.testi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    position: relative;
    z-index: 1;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
}
.testi-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 30px;
    box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition:
        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
        background 0.3s;
    &:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.1);
    }
}
.testi-quote {
    font-size: 36px;
    line-height: 1;
    color: rgba(143, 168, 130, 0.4);
    font-family: "STKaiti", "KaiTi", serif;
    margin-bottom: 12px;
}
.testi-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.68);
    line-height: 1.85;
    margin-bottom: 20px;
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
