<!-- src/components/landing/LandingStats.vue -->
<template>
    <section ref="sectionEl" class="stats">
        <div class="container">
            <div class="stats-grid">
                <div
                    v-for="(s, i) in stats"
                    :key="s.label"
                    class="stat-item"
                    data-animate
                    :style="{ '--delay': `${i * 100}ms` }"
                >
                    <div class="stat-num">
                        <span>{{ s.displayed }}</span>
                        <span class="stat-unit">{{ s.unit }}</span>
                    </div>
                    <div class="stat-label">{{ s.label }}</div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useScrollAnimate } from "@/composables/landing/useScrollAnimate";
import { useCountUp } from "@/composables/landing/useCountUp";

const sectionEl = ref<HTMLElement | null>(null);

const stats = reactive([
    { target: 24, unit: "节", label: "二十四节气完整覆盖", displayed: "0" },
    { target: 6, unit: "+", label: "健康管理功能模块", displayed: "0" },
    { target: 50, unit: "+", label: "三甲医院认证专家", displayed: "0" },
    { target: 10, unit: "万+", label: "活跃用户", displayed: "0" },
]);

onMounted(() => {
    const el = sectionEl.value;
    if (!el) return;

    useScrollAnimate(el);

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                stats.forEach((s) => {
                    useCountUp(s.target, 1600, (v) => {
                        s.displayed = String(v);
                    });
                });
                observer.disconnect();
            }
        },
        { threshold: 0.3 },
    );
    observer.observe(el);
});
</script>

<style lang="scss" scoped>
.stats {
    padding: 72px 0;
    background: rgba(8, 18, 6, 0.42);
    backdrop-filter: blur(2px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;
    z-index: 1;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.stat-item {
    text-align: center;
    padding: 36px 24px;
    position: relative;

    & + & {
        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 20%;
            bottom: 20%;
            width: 1px;
            background: rgba(255, 255, 255, 0.1);
        }
    }
}

.stat-num {
    font-size: 52px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    font-family: Georgia, serif;
    margin-bottom: 8px;
    text-shadow: 0 0 30px rgba(93, 112, 82, 0.5);
}

.stat-unit {
    font-size: 24px;
    font-weight: 400;
    opacity: 0.65;
}
.stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.52);
}
</style>
