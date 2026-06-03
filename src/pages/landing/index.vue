<!-- src/pages/landing/index.vue -->
<template>
    <div class="landing-page">
        <!-- 固定森林场景 -->
        <LandingScene />

        <!-- 内容层 -->
        <div class="page-content">
            <LandingNav />

            <main>
                <LandingHero @go-login="router.push('/login')" />
                <LandingStats />
                <LandingFeatures />
                <LandingAIButler />
                <LandingHowTo />
                <LandingExperts />
                <LandingTestimonials />
                <LandingCTA @go-login="router.push('/login')" />
                <LandingFooter />
            </main>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import LandingScene from "@/components/landing/LandingScene.vue";
import LandingNav from "@/components/landing/LandingNav.vue";
import LandingHero from "@/components/landing/LandingHero.vue";
import LandingStats from "@/components/landing/LandingStats.vue";
import LandingFeatures from "@/components/landing/LandingFeatures.vue";
import LandingAIButler from "@/components/landing/LandingAIButler.vue";
import LandingHowTo from "@/components/landing/LandingHowTo.vue";
import LandingExperts from "@/components/landing/LandingExperts.vue";
import LandingTestimonials from "@/components/landing/LandingTestimonials.vue";
import LandingCTA from "@/components/landing/LandingCTA.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";

const router = useRouter();
</script>

<style lang="scss" scoped>
.landing-page {
    min-height: 100vh;
    background: #0c180a; // 图片加载前的兜底色
    color: white;
    font-family:
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
}

.page-content {
    position: relative;
    z-index: 1;
}
</style>

<!-- 全局 reduced-motion（非 scoped，影响子组件动画） -->
<style lang="scss">
@media (prefers-reduced-motion: reduce) {
    .landing-page *,
    .landing-page *::before,
    .landing-page *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    .scene-bg {
        animation: none !important;
    }

    .chat-row {
        opacity: 1 !important;
        transform: none !important;
    }

    [data-animate] {
        opacity: 1 !important;
        transform: none !important;
    }
}
</style>
