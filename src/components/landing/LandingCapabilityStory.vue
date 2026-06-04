<template>
    <section
        ref="sectionEl"
        id="capability-story-section"
        class="capability-story"
        :class="{ 'is-visible': inView, 'is-leaving': sectionLeaving }"
        :style="storyStyle"
        aria-label="颐养阁核心能力"
    >
        <div class="story-atmosphere" aria-hidden="true" />
        <div class="story-shell">
            <div class="story-intro">
                <p class="story-mark">从清晨到入夜</p>
                <h2 class="intro-heading" aria-label="把养生变成一天里可感知的节律">
                    <span class="intro-line" style="--line-delay: 0ms">
                        <span class="intro-line-inner">把养生变成</span>
                    </span>
                    <span class="intro-line" style="--line-delay: 90ms">
                        <span class="intro-line-inner">一天里可感知</span>
                    </span>
                    <span class="intro-line" style="--line-delay: 180ms">
                        <span class="intro-line-inner">的节律</span>
                    </span>
                </h2>
                <p class="story-tagline">
                    <span class="tl-pre">颐养阁不是把功能堆给用户，</span>
                    <strong class="tl-pivot">根据时令 · 体质<br />睡眠 · 问诊记录</strong>
                    <span class="tl-close">把每一次建议，落到<br />真实的日程和行动里。</span>
                </p>
            </div>

            <div class="story-layout">
                <aside class="stage-column">
                    <div class="stage-sticky">
                        <div class="stage-caption">
                            <span>颐养阁能力图谱</span>
                            <strong>{{ activeCard.title }}</strong>
                        </div>
                        <div class="stage-deck">
                            <div
                                v-for="(card, index) in cards"
                                :key="card.kind"
                                class="stage-card"
                                :class="{ active: activeIndex === index }"
                                :style="getCardStyle(index)"
                            >
                                <LandingCapabilityCard :card="card" />
                            </div>
                        </div>
                        <div class="stage-switcher" role="group" aria-label="切换核心能力">
                            <button
                                v-for="(card, index) in cards"
                                :key="`${card.kind}-switch`"
                                class="stage-dot"
                                :class="{ active: activeIndex === index }"
                                type="button"
                                :aria-label="`查看${card.title}`"
                                :aria-pressed="activeIndex === index"
                                @click="scrollToStep(index)"
                            >
                                <span>{{ card.short }}</span>
                            </button>
                        </div>
                    </div>
                </aside>

                <div ref="copyEl" class="story-copy">
                    <div class="story-copy-panel">
                        <section
                            v-for="(card, index) in cards"
                            :key="`${card.kind}-copy`"
                            class="story-step"
                            :class="{ active: activeIndex === index }"
                        >
                            <span class="step-index">{{ formatIndex(index) }}</span>
                            <h3 class="step-heading" :aria-label="card.heading">
                                <span
                                    v-for="(char, charIndex) in splitHeading(card.heading)"
                                    :key="`${card.kind}-heading-${charIndex}`"
                                    aria-hidden="true"
                                    :style="getHeadingCharStyle(charIndex)"
                                >
                                    {{ char }}
                                </span>
                            </h3>
                            <p class="step-description">{{ card.description }}</p>
                            <div class="step-details">
                                <span v-for="detail in card.details" :key="detail">
                                    {{ detail }}
                                </span>
                            </div>
                            <LandingCapabilityCard
                                class="mobile-story-card"
                                :card="card"
                            />
                        </section>
                    </div>
                    <div class="story-copy-rail" aria-hidden="true">
                        <div
                            v-for="card in cards"
                            :key="`${card.kind}-scroll-anchor`"
                            class="story-scroll-step"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    type CSSProperties,
} from "vue";
import LandingCapabilityCard from "@/components/landing/LandingCapabilityCard.vue";

interface CapabilityStoryCard {
    kind: "seasonal" | "butler" | "sleep" | "course" | "consult";
    seal: string;
    short: string;
    kicker: string;
    title: string;
    heading: string;
    status: string;
    summary: string;
    description: string;
    details: string[];
}

type CardStyle = CSSProperties & Record<string, string | number>;
type HeadingCharStyle = CSSProperties & Record<string, string | number>;

const cards: CapabilityStoryCard[] = [
    {
        kind: "seasonal",
        seal: "节",
        short: "节气",
        kicker: "二十四节气",
        title: "节气养生",
        heading: "先读懂今天的气候，再安排饮食起居",
        status: "芒种当令",
        summary: "按节气、地域和体质生成当天建议，避免泛泛而谈的养生清单。",
        description:
            "系统把节气时令、湿热指数和个人体质放在同一张日程里，早晨吃什么、午后怎么休息、夜间按揉哪个穴位，都能直接执行。",
        details: ["当令食材", "穴位提醒", "地域湿热校准"],
    },
    {
        kind: "butler",
        seal: "AI",
        short: "管家",
        kicker: "个性问答",
        title: "AI 健康管家",
        heading: "回答问题之前，先理解你的日常状态",
        status: "实时分析",
        summary: "融合体质、睡眠、经期与最近问诊记录，让建议更像长期陪伴。",
        description:
            "AI 管家会把用户近几天的睡眠、情绪和节气变化纳入上下文，给出能被追问、能继续调整的建议，而不是一次性的标准答案。",
        details: ["多轮追问", "风险提醒", "方案持续修订"],
    },
    {
        kind: "sleep",
        seal: "眠",
        short: "睡眠",
        kicker: "夜间节律",
        title: "睡眠分析",
        heading: "把一晚睡眠拆成可以调理的线索",
        status: "昨夜报告",
        summary: "从入睡时间、夜醒次数和睡眠阶段里提取调理重点。",
        description:
            "睡眠分析不止给出分数，也会指出影响节律的具体因素，比如下午茶饮、晚间屏幕时间和体质相关的疲乏模式。",
        details: ["深睡趋势", "夜醒原因", "晚间建议"],
    },
    {
        kind: "course",
        seal: "方",
        short: "课程",
        kicker: "古方课程",
        title: "中医古方课程",
        heading: "把古方从知识，变成能跟练的生活课",
        status: "正在学习",
        summary: "课程围绕古方来源、适用体质、现代应用和日常茶饮展开。",
        description:
            "用户可以在课程中学习方剂原理，也能获得配套的饮食、茶饮和作息计划，让传统知识进入可验证的日常实践。",
        details: ["直播答疑", "体质适配", "课后计划"],
    },
    {
        kind: "consult",
        seal: "诊",
        short: "问诊",
        kicker: "名医健康圈",
        title: "在线问诊",
        heading: "当 AI 识别到边界，顺手交给专业医生",
        status: "专家在线",
        summary: "遇到需要判断的症状时，连接认证医生并保留前序健康上下文。",
        description:
            "问诊入口不会孤立出现，医生可以看到用户授权的体质、睡眠和近期建议记录，减少重复描述，让咨询更快进入关键问题。",
        details: ["三甲医生", "上下文同步", "一键预约"],
    },
];

const sectionEl = ref<HTMLElement | null>(null);
const copyEl = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const progress = ref(0);
const inView = ref(false);
const reducedMotion = ref(false);
const sectionLeaving = ref(false);

let frameId = 0;
let revealObserver: IntersectionObserver | null = null;
let mediaQuery: MediaQueryList | null = null;

const activeCard = computed<CapabilityStoryCard>(
    () => cards[activeIndex.value] ?? cards[0]!,
);
const storyStyle = computed<CardStyle>(() => ({
    "--story-progress": progress.value.toFixed(4),
    "--active-index": String(activeIndex.value),
}));

const storyAnchorRatio = 0.5;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function formatIndex(index: number): string {
    return String(index + 1).padStart(2, "0");
}

function splitHeading(text: string): string[] {
    return Array.from(text);
}

function getHeadingCharStyle(index: number): HeadingCharStyle {
    return {
        "--char-index": index,
    };
}

function updateFromScroll(): void {
    frameId = 0;
    const copy = copyEl.value;
    if (!copy) return;

    const viewport = Math.max(window.innerHeight, 1);
    const anchorY = viewport * storyAnchorRatio;
    const steps = Array.from(copy.querySelectorAll<HTMLElement>(".story-scroll-step"));
    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    if (!firstStep || !lastStep) return;

    let nextIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const distance = Math.abs(stepCenter - anchorY);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nextIndex = index;
        }
    });

    const firstRect = firstStep.getBoundingClientRect();
    const lastRect = lastStep.getBoundingClientRect();
    const firstCenter = firstRect.top + firstRect.height / 2;
    const lastCenter = lastRect.top + lastRect.height / 2;
    const travel = Math.max(lastCenter - firstCenter, 1);
    const nextProgress = clamp((anchorY - firstCenter) / travel, 0, 1);

    progress.value = nextProgress;
    activeIndex.value = clamp(nextIndex, 0, cards.length - 1);

    // 当最后一步的中心点已高于 anchor 35vh 时，触发 exit 淡出
    sectionLeaving.value = anchorY - lastCenter > viewport * 0.35;
}

function requestScrollUpdate(): void {
    if (frameId) return;
    frameId = window.requestAnimationFrame(updateFromScroll);
}

function getCardStyle(index: number): CardStyle {
    const offset = index - activeIndex.value;
    const depth = Math.min(Math.abs(offset), 4);
    const direction = offset < 0 ? -1 : 1;
    const x = offset * 22;
    const y = offset * 18 + depth * 5;
    const scale = 1 - depth * 0.056;
    const rotate = offset * -2.7;
    const opacity = 1 - depth * 0.17;
    const blur = depth * 0.65;
    const zIndex = 40 - depth * 4 + (offset === 0 ? 12 : 0) - (offset < 0 ? 1 : 0);

    return {
        "--stage-x": `${x}px`,
        "--stage-y": `${y}px`,
        "--stage-scale": scale.toFixed(3),
        "--stage-rotate": `${rotate}deg`,
        "--stage-opacity": opacity.toFixed(3),
        "--stage-blur": `${blur}px`,
        "--stage-origin": offset === 0 ? "50% 50%" : `${50 + direction * 8}% 50%`,
        zIndex,
    };
}

function scrollToStep(index: number): void {
    const copy = copyEl.value;
    if (!copy) return;

    const step = copy.querySelectorAll<HTMLElement>(".story-scroll-step").item(index);
    if (!step) return;

    const viewport = Math.max(window.innerHeight, 1);
    const targetTop =
        window.scrollY +
        step.getBoundingClientRect().top +
        step.offsetHeight / 2 -
        viewport * storyAnchorRatio;

    window.scrollTo({
        top: targetTop,
        behavior: reducedMotion.value ? "auto" : "smooth",
    });
}

function handleMotionChange(event: MediaQueryListEvent): void {
    reducedMotion.value = event.matches;
    updateFromScroll();
}

onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.value = mediaQuery.matches;
    mediaQuery.addEventListener("change", handleMotionChange);

    revealObserver = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting) {
                inView.value = true;
                revealObserver?.disconnect();
            }
        },
        { threshold: 0.18 },
    );

    if (sectionEl.value) revealObserver.observe(sectionEl.value);

    updateFromScroll();
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
});

onBeforeUnmount(() => {
    if (frameId) window.cancelAnimationFrame(frameId);
    revealObserver?.disconnect();
    mediaQuery?.removeEventListener("change", handleMotionChange);
    window.removeEventListener("scroll", requestScrollUpdate);
    window.removeEventListener("resize", requestScrollUpdate);
});
</script>

<style lang="scss" scoped>
@keyframes headingLightSweep {
    0% {
        opacity: 0;
        transform: translate3d(-48%, 0, 0) skewX(-14deg);
    }
    22% {
        opacity: 0.58;
    }
    100% {
        opacity: 0;
        transform: translate3d(72%, 0, 0) skewX(-14deg);
    }
}

.capability-story {
    position: relative;
    z-index: 1;
    overflow: clip;
    color: rgba(248, 251, 242, 0.94);
    background:
        linear-gradient(
            180deg,
            rgba(8, 18, 7, 0.58) 0%,
            rgba(9, 24, 15, 0.86) 22%,
            rgba(8, 17, 9, 0.9) 72%,
            rgba(8, 16, 6, 0.6) 100%
        );
}

.story-atmosphere {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
        linear-gradient(
            112deg,
            transparent 0%,
            rgba(224, 238, 206, 0.08) 27%,
            transparent 42%
        ),
        radial-gradient(
            ellipse at 62% 22%,
            rgba(118, 150, 104, 0.18),
            transparent 48%
        );
    mask-image: linear-gradient(to bottom, transparent, black 12%, black 86%, transparent);
}

.story-shell {
    position: relative;
    max-width: 1240px;
    margin: 0 auto;
    padding: clamp(96px, 11vw, 150px) 48px clamp(78px, 9vw, 130px);
}

.story-intro {
    display: grid;
    grid-template-columns: minmax(360px, 0.9fr) minmax(340px, 0.78fr);
    gap: clamp(44px, 7vw, 96px);
    align-items: start;
    max-width: 1120px;
    margin-bottom: clamp(30px, 4vw, 52px);
    opacity: 0;
    transform: translateY(26px);
    transition:
        opacity 0.8s var(--ld-ease-out),
        transform 0.8s var(--ld-ease-out);

    .is-visible & {
        opacity: 1;
        transform: none;
    }

    .intro-heading {
        grid-column: 1;
        grid-row: 2;
        max-width: 12ch;
        margin: 0;
        font-family: "STKaiti", "KaiTi", "STSong", serif;
        font-size: clamp(2.35rem, 4.5vw, 4.4rem);
        font-weight: 500;
        line-height: 1.25;
        text-wrap: balance;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.28);
    }

    .intro-line {
        display: block;
        overflow: hidden;
        line-height: 1.32;
        padding-bottom: 0.05em;
    }

    .intro-line-inner {
        display: block;
        transform: translateY(108%);
        transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        transition-delay: var(--line-delay, 0s);

        .is-visible & {
            transform: translateY(0);
        }
    }

    .story-tagline {
        grid-column: 2;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 4px 0 0;
        padding-left: 20px;
        border-left: 1px solid rgba(180, 212, 152, 0.2);
        transform: translateY(22px);
        transition:
            opacity 0.9s var(--ld-ease-out) 0.5s,
            transform 0.9s var(--ld-ease-out) 0.5s;

        .is-visible & {
            transform: none;
        }
    }
}

.story-mark {
    grid-column: 1;
    grid-row: 1;
    margin: 0 0 18px;
    color: rgba(201, 220, 180, 0.7);
    font-size: 12px;
    letter-spacing: 0.14em;
    display: flex;
    align-items: center;
    gap: 12px;

    &::before {
        content: '';
        display: inline-block;
        width: 28px;
        height: 1px;
        background: rgba(201, 220, 180, 0.45);
        flex-shrink: 0;
    }
}

/* tagline 三层排版 */
.tl-pre {
    display: block;
    font-size: 13px;
    color: rgba(220, 238, 208, 0.44);
    line-height: 1.7;
    letter-spacing: 0.02em;
}

.tl-pivot {
    display: block;
    margin: 4px 0;
    font-family: "STKaiti", "KaiTi", "STSong", serif;
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    font-weight: 500;
    color: rgba(215, 240, 192, 0.9);
    line-height: 1.5;
    letter-spacing: 0.06em;
    text-shadow: 0 2px 16px rgba(160, 210, 130, 0.12);
}

.tl-close {
    display: block;
    font-size: 14px;
    color: rgba(236, 245, 226, 0.62);
    line-height: 1.9;
    letter-spacing: 0.01em;
}

.story-layout {
    --story-sticky-top: clamp(164px, 17vh, 210px);

    display: grid;
    grid-template-columns: minmax(390px, 0.92fr) minmax(360px, 1fr);
    gap: clamp(48px, 7vw, 96px);
    align-items: start;
    margin-top: clamp(96px, 11vh, 136px);
}

.stage-column {
    min-width: 0;
    align-self: stretch;
}

.stage-sticky {
    position: sticky;
    top: var(--story-sticky-top);
    min-height: calc(100vh - 156px);
    display: grid;
    align-content: start;
    gap: 18px;
    padding-top: clamp(16px, 3vh, 34px);
}

.stage-caption {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 18px;
    padding: 0 6px;

    span {
        color: rgba(231, 238, 221, 0.46);
        font-size: 13px;
    }

    strong {
        color: rgba(246, 250, 237, 0.88);
        font-size: 14px;
        font-weight: 700;
    }
}

.stage-deck {
    position: relative;
    height: min(62vh, 540px);
    min-height: 468px;
    perspective: 1200px;
    isolation: isolate;

    &::after {
        content: "";
        position: absolute;
        left: 10%;
        right: 8%;
        bottom: -18px;
        height: 34px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.32);
        filter: blur(18px);
        opacity: 0.55;
        transform: scaleX(calc(0.86 + var(--story-progress) * 0.12));
    }
}

.stage-card {
    position: absolute;
    inset: 0;
    opacity: var(--stage-opacity);
    transform: translate3d(var(--stage-x), var(--stage-y), 0)
        scale(var(--stage-scale)) rotate(var(--stage-rotate));
    transform-origin: var(--stage-origin);
    filter: blur(var(--stage-blur));
    transition:
        transform 0.58s var(--ld-ease-out),
        opacity 0.44s var(--ld-ease-out),
        filter 0.44s var(--ld-ease-out);
    will-change: transform, opacity, filter;
    pointer-events: none;

    &.active {
        pointer-events: auto;
    }
}

.stage-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    border-radius: 999px;
    background: rgba(5, 14, 8, 0.38);
    border: 1px solid rgba(238, 246, 226, 0.08);
    width: fit-content;
    margin: 2px auto 0;
}

.stage-dot {
    border: 0;
    border-radius: 999px;
    padding: 8px 12px;
    color: rgba(234, 241, 224, 0.56);
    background: transparent;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    transition:
        color 0.22s var(--ld-ease-out),
        background 0.22s var(--ld-ease-out),
        transform 0.22s var(--ld-ease-out);

    &:hover,
    &.active {
        color: rgba(10, 22, 12, 0.96);
        background: rgba(232, 241, 211, 0.88);
    }

    &:hover {
        transform: translateY(-1px);
    }
}

.story-copy {
    position: relative;
    min-width: 0;
}

.story-copy-panel {
    position: sticky;
    top: calc(var(--story-sticky-top) + clamp(50px, 5vh, 64px));
    z-index: 2;
    height: 0;
}

.story-copy-rail {
    position: relative;
}

.story-scroll-step {
    min-height: 86vh;
}

.story-step {
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0 0 clamp(30px, 4vh, 48px);
    opacity: 0;
    transform: translateY(22px);
    filter: blur(8px);
    transition:
        opacity 0.72s var(--ld-ease-out),
        transform 0.72s var(--ld-ease-out),
        filter 0.72s var(--ld-ease-out);
    pointer-events: none;
    will-change: opacity, transform;

    &.active {
        opacity: 1;
        transform: none;
        filter: none;
        pointer-events: auto;
    }

    > :not(.step-heading) {
        opacity: 0;
        transform: translateY(14px);
        transition:
            opacity 0.72s var(--ld-ease-out),
            transform 0.72s var(--ld-ease-out);
    }

    &.active > :not(.step-heading) {
        opacity: 1;
        transform: none;
    }

    &.active .step-index {
        transition-delay: 0.02s;
    }

    &.active .step-description {
        transition-delay: 0.18s;
    }

    &.active .step-details {
        transition-delay: 0.26s;
    }

    h3 {
        margin: 0;
        font-family: "STKaiti", "KaiTi", "STSong", serif;
        font-size: clamp(2rem, 3.7vw, 3.35rem);
        font-weight: 500;
        line-height: 1.32;
    }

    p {
        max-width: 58ch;
        margin: 24px 0 0;
        color: rgba(235, 243, 225, 0.68);
        font-size: 16px;
        line-height: 1.95;
        text-wrap: pretty;
    }
}

.step-heading {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.01em;
    width: fit-content;
    perspective: 720px;
    isolation: isolate;

    &::after {
        content: "";
        position: absolute;
        inset: -0.12em -8%;
        z-index: -1;
        pointer-events: none;
        background: linear-gradient(
            100deg,
            transparent 18%,
            rgba(238, 249, 223, 0.06) 42%,
            rgba(255, 255, 255, 0.28) 50%,
            rgba(186, 212, 157, 0.08) 58%,
            transparent 82%
        );
        filter: blur(10px);
        opacity: 0;
    }

    span {
        display: inline-block;
        color: rgba(246, 251, 239, 0.96);
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(221, 239, 203, 0.9) 54%,
            rgba(180, 206, 151, 0.72) 100%
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 0;
        filter: blur(12px);
        transform: translate3d(0, 0.72em, 0) rotateX(62deg) scale(0.94);
        transform-origin: 50% 100%;
        transition:
            opacity 0.62s var(--ld-ease-out),
            filter 0.74s var(--ld-ease-out),
            transform 0.74s var(--ld-ease-out);
        transition-delay: calc(0.05s + var(--char-index) * 26ms);
        text-shadow: 0 0 0 rgba(225, 242, 205, 0);
        will-change: transform, opacity, filter;
    }

    .story-step.active & {
        &::after {
            animation: headingLightSweep 1.4s 0.34s var(--ld-ease-out);
        }

        span {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0) rotateX(0) scale(1);
            text-shadow: 0 10px 34px rgba(198, 222, 169, 0.12);
        }
    }
}

.step-index {
    width: fit-content;
    margin-bottom: 18px;
    padding: 5px 11px;
    border-radius: 999px;
    color: rgba(221, 232, 205, 0.62);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 12px;
}

.step-details {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 28px;

    span {
        border-radius: 999px;
        padding: 8px 12px;
        color: rgba(227, 239, 211, 0.72);
        background: rgba(132, 157, 114, 0.14);
        border: 1px solid rgba(172, 202, 151, 0.16);
        font-size: 13px;
    }
}

.mobile-story-card {
    display: none;
}

/* ── Section exit：滚过最后一步时淡出左右两侧内容 ── */
.is-leaving {
    .story-copy-panel {
        opacity: 0;
        transform: translateY(-28px);
        transition:
            opacity 0.65s var(--ld-ease-out),
            transform 0.65s var(--ld-ease-out);
        pointer-events: none;
    }

    .stage-sticky {
        opacity: 0;
        transform: translateY(-20px);
        transition:
            opacity 0.55s var(--ld-ease-out),
            transform 0.55s var(--ld-ease-out);
        pointer-events: none;
    }
}

@media (max-width: 980px) {
    .story-shell {
        padding: 92px 28px 78px;
    }

    .story-layout {
        grid-template-columns: 1fr;
        margin-top: 0;
    }

    .story-copy {
        padding-top: 0;
    }

    .story-copy-panel {
        position: static;
        height: auto;
    }

    .story-copy-rail {
        display: none;
    }

    .stage-column {
        display: none;
    }

    .story-intro {
        display: block;
        max-width: 760px;
        margin-bottom: 34px;

        p:not(.story-mark) {
            margin-top: 22px;
        }
    }

    .story-step {
        position: relative;
        inset: auto;
        width: auto;
        min-height: auto;
        padding: 34px 0 52px;
        opacity: 1;
        filter: none;
        transform: none;
        pointer-events: auto;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);

        > * {
            opacity: 1;
            transform: none;
        }

        h3 {
            max-width: 18ch;
        }
    }

    .step-heading {
        &::after {
            display: none;
        }

        span {
            opacity: 1;
            filter: none;
            transform: none;
            transition: none;
        }
    }

    .mobile-story-card {
        display: block;
        margin-top: 28px;
    }
}

@media (max-width: 620px) {
    .story-shell {
        padding: 78px 20px 64px;
    }

    .story-intro {
        margin-bottom: 34px;

        .intro-heading {
            font-size: clamp(2rem, 12vw, 3.2rem);
        }

        p:not(.story-mark) {
            font-size: 15px;
        }
    }

    .story-step {
        h3 {
            font-size: clamp(1.82rem, 10vw, 2.65rem);
        }

        p {
            font-size: 15px;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .story-intro,
    .stage-card,
    .story-step,
    .stage-dot,
    .step-heading span {
        transition: none !important;
        filter: none !important;
        transform: none !important;
    }

    .story-intro,
    .story-step.active,
    .story-step.active > :not(.step-heading),
    .story-step.active .step-heading span {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
    }

    .story-step:not(.active) {
        opacity: 0 !important;
    }

    .step-heading::after {
        display: none !important;
    }

    .stage-sticky {
        position: static;
        min-height: 0;
    }

    .stage-deck {
        height: auto;
        min-height: 0;
        display: grid;
        gap: 16px;

        &::after {
            display: none;
        }
    }

    .stage-card {
        position: relative;
        opacity: 1 !important;
        filter: none !important;
        pointer-events: auto;
    }
}
</style>
