<template>
    <section ref="sectionEl" class="how">
        <div class="how-blob drifting-3" />
        <div class="container">
            <div class="how-header">
                <h2 class="section-title" data-animate style="--delay: 80ms">
                    三步开启<br />你的自然养生之旅
                </h2>
                <p class="section-sub" data-animate style="--delay: 160ms">
                    注册只需 60 秒，AI 管家完成体质评估并生成专属方案。
                </p>
            </div>
            <div class="how-steps">
                <template v-for="(step, i) in steps" :key="step.num">
                    <div
                        class="how-step"
                        data-animate
                        :style="{ '--delay': `${i * 240}ms` }"
                    >
                        <div class="how-step-num">{{ step.num }}</div>
                        <div class="how-step-name">{{ step.name }}</div>
                        <p class="how-step-desc">{{ step.desc }}</p>
                    </div>
                    <div
                        v-if="i < steps.length - 1"
                        class="how-connector"
                        data-animate
                        :style="{ '--delay': `${i * 240 + 120}ms` }"
                    >
                        <svg viewBox="0 0 60 24" fill="none">
                            <path
                                :d="
                                    i % 2 === 0
                                        ? 'M4 12 C14 4,24 20,34 12 C44 4,54 16,58 12'
                                        : 'M4 12 C14 20,24 4,34 12 C44 20,54 8,58 12'
                                "
                                stroke="#8fa882"
                                stroke-width="2"
                                stroke-dasharray="4 3"
                                stroke-linecap="round"
                            />
                            <path
                                d="M54 8 L58 12 L54 16"
                                stroke="#8fa882"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </div>
                </template>
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

const steps = [
    { num: "1", name: "注册账号", desc: "填写基本信息与体质问卷（约 3 分钟）" },
    { num: "2", name: "探索功能", desc: "查看节气指南，记录睡眠与情绪状态" },
    { num: "3", name: "获取方案", desc: "AI 生成每日养生日历 + 专家推荐" },
];
</script>

<style lang="scss" scoped>
.how {
    padding: 100px 0;
    background: rgba(6, 12, 4, 0.5);
    position: relative;
    overflow: hidden;
    z-index: 1;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
}
.how-blob {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 400px;
    background: rgba(93, 112, 82, 0.04);
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    filter: blur(80px);
}
.how-header {
    text-align: center;
    margin-bottom: 72px;
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
.how-steps {
    display: grid;
    grid-template-columns: 1fr 80px 1fr 80px 1fr;
    align-items: center;
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}
.how-connector {
    text-align: center;
    svg {
        width: 60px;
        opacity: 0.4;
    }
}
.how-step {
    text-align: center;
    padding: 0 20px;
}
.how-step-num {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    background: rgba(93, 112, 82, 0.5);
    border: 2px solid rgba(93, 112, 82, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    margin: 0 auto 22px;
    box-shadow:
        0 8px 24px -4px rgba(93, 112, 82, 0.4),
        0 0 20px rgba(93, 112, 82, 0.2);
    font-family: Georgia, serif;
    backdrop-filter: blur(8px);
}
.how-step-name {
    font-size: 18px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    margin-bottom: 10px;
}
.how-step-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.52);
    line-height: 1.7;
}
</style>
