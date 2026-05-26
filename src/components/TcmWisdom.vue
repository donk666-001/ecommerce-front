<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1fr 1.2fr">
            <div class="constitution-card">
                <div
                    style="
                        font-size: 12px;
                        color: var(--gold);
                        letter-spacing: 2px;
                    "
                >
                    YOUR BODY TYPE
                </div>
                <div class="constitution-name">{{ constitutionName }}</div>
                <div class="constitution-sub">
                    主体质 阴虚 (68 分) · 兼体质 气郁 (52 分)
                </div>

                <svg class="radar" viewBox="0 0 200 200">
                    <polygon
                        points="100,20 175,60 175,140 100,180 25,140 25,60"
                        fill="none"
                        stroke="#C9A55C"
                        stroke-opacity="0.3"
                    />
                    <polygon
                        points="100,40 154,72 154,128 100,160 46,128 46,72"
                        fill="none"
                        stroke="#C9A55C"
                        stroke-opacity="0.3"
                    />
                    <polygon
                        points="100,60 133,80 133,120 100,140 67,120 67,80"
                        fill="none"
                        stroke="#C9A55C"
                        stroke-opacity="0.3"
                    />
                    <polygon
                        points="100,30 165,60 150,135 90,170 35,130 50,55"
                        fill="#C9A55C"
                        fill-opacity="0.3"
                        stroke="#C9A55C"
                        stroke-width="2"
                    />
                    <text
                        x="100"
                        y="15"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        阴虚
                    </text>
                    <text
                        x="185"
                        y="62"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        气郁
                    </text>
                    <text
                        x="185"
                        y="145"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        血瘀
                    </text>
                    <text
                        x="100"
                        y="195"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        平和
                    </text>
                    <text
                        x="15"
                        y="145"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        湿热
                    </text>
                    <text
                        x="15"
                        y="62"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        气虚
                    </text>
                </svg>
                <button
                    class="btn"
                    style="margin-top: 8px"
                    type="button"
                    @click="showTestModal = true"
                >
                    重新测试体质
                </button>
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0">
                        <span class="dot"></span>经络穴位
                    </div>
                    <div style="font-size: 12px; color: var(--ink-muted)">
                        点击穴位查看主治
                    </div>
                </div>
                <div class="meridian-body">
                    <span class="body-figure">🧍</span>
                    <button
                        v-for="point in acupoints"
                        :key="point.name"
                        class="acupoint"
                        :class="{
                            selected: selectedAcupoint.name === point.name,
                        }"
                        :style="{ top: point.top, left: point.left }"
                        type="button"
                        :aria-label="point.name"
                        @click="selectedAcupoint = point"
                    ></button>
                </div>
                <div
                    style="
                        display: flex;
                        gap: 8px;
                        margin-top: 12px;
                        font-size: 13px;
                    "
                >
                    <span class="acu-tag"
                        >{{ selectedAcupoint.name }} ·
                        {{ selectedAcupoint.effect }}</span
                    >
                    <span class="acu-tag ghost">{{
                        selectedAcupoint.method
                    }}</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>为你推荐的中医课程
                </div>
                <button
                    class="btn btn-ghost"
                    type="button"
                    @click="showAllCourses = true"
                >
                    查看全部 →
                </button>
            </div>
            <div class="grid-4">
                <button
                    v-for="course in courses"
                    :key="course.name"
                    class="course-card"
                    type="button"
                    @click="selectedCourse = course"
                >
                    <div class="course-img">{{ course.emoji }}</div>
                    <div class="course-body">
                        <div class="course-name">{{ course.name }}</div>
                        <div class="course-meta">{{ course.meta }}</div>
                    </div>
                </button>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="tcm-modal">
                <div
                    v-if="showTestModal"
                    class="modal-backdrop"
                    @click.self="showTestModal = false"
                >
                    <section
                        class="tcm-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="test-title"
                    >
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭体质测试"
                            @click="showTestModal = false"
                        >
                            ×
                        </button>
                        <h3 id="test-title">体质快速复测</h3>
                        <p>
                            选择近期最明显的感受，系统会在前端即时更新体质倾向。
                        </p>
                        <div class="test-options">
                            <button
                                v-for="item in testOptions"
                                :key="item.name"
                                type="button"
                                :class="{
                                    active: selectedBodyType === item.name,
                                }"
                                @click="selectedBodyType = item.name"
                            >
                                <strong>{{ item.name }}</strong>
                                <span>{{ item.desc }}</span>
                            </button>
                        </div>
                        <button
                            class="btn"
                            type="button"
                            @click="completeBodyTest"
                        >
                            完成测试
                        </button>
                    </section>
                </div>
            </Transition>

            <Transition name="tcm-modal">
                <div
                    v-if="selectedCourse || showAllCourses"
                    class="modal-backdrop"
                    @click.self="closeCourseDialog"
                >
                    <section
                        class="tcm-dialog course-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="course-title"
                    >
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭课程详情"
                            @click="closeCourseDialog"
                        >
                            ×
                        </button>
                        <h3 id="course-title">
                            {{
                                selectedCourse
                                    ? selectedCourse.name
                                    : "全部中医课程"
                            }}
                        </h3>
                        <p>
                            {{
                                selectedCourse
                                    ? selectedCourse.detail
                                    : "课程均为纯前端模拟数据，可点击任意课程查看学习进度与简介。"
                            }}
                        </p>
                        <div class="course-list">
                            <button
                                v-for="course in allCourses"
                                :key="course.name"
                                type="button"
                                :class="{
                                    active:
                                        selectedCourse?.name === course.name,
                                }"
                                @click="selectedCourse = course"
                            >
                                <span>{{ course.emoji }}</span>
                                <strong>{{ course.name }}</strong>
                                <em>{{ course.meta }}</em>
                            </button>
                        </div>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

type Acupoint = {
    name: string;
    effect: string;
    method: string;
    top: string;
    left: string;
};
type Course = { name: string; emoji: string; meta: string; detail: string };

const constitutionName = ref("阴虚兼气郁");
const showTestModal = ref(false);
const showAllCourses = ref(false);
const selectedBodyType = ref("阴虚");
const selectedCourse = ref<Course | null>(null);

const testOptions = [
    { name: "阴虚", desc: "口干、手足心热、睡眠偏浅" },
    { name: "气郁", desc: "胸闷、叹气、情绪容易波动" },
    { name: "平和", desc: "精力稳定，饮食睡眠较规律" },
    { name: "湿热", desc: "困重、油腻、口苦或痘痘明显" },
];

const acupoints: Acupoint[] = [
    {
        name: "膻中",
        effect: "宁心安神",
        method: "按揉 2 分钟",
        top: "28%",
        left: "48%",
    },
    {
        name: "左内关",
        effect: "和胃宽胸",
        method: "点按 1 分钟",
        top: "42%",
        left: "35%",
    },
    {
        name: "右内关",
        effect: "和胃宽胸",
        method: "点按 1 分钟",
        top: "42%",
        left: "60%",
    },
    {
        name: "中脘",
        effect: "健脾和胃",
        method: "顺揉 36 圈",
        top: "55%",
        left: "50%",
    },
    {
        name: "左足三里",
        effect: "补气养胃",
        method: "按揉 3 分钟",
        top: "70%",
        left: "42%",
    },
    {
        name: "右足三里",
        effect: "补气养胃",
        method: "按揉 3 分钟",
        top: "70%",
        left: "58%",
    },
];
const selectedAcupoint = ref<Acupoint>(acupoints[0]!);

const allCourses: Course[] = [
    {
        name: "八段锦入门",
        emoji: "🧘",
        meta: "12 节 · 王老师 · 已学 3 节",
        detail: "从预备式到两手托天理三焦，适合每天 15 分钟跟练。",
    },
    {
        name: "阴阳五行精讲",
        emoji: "📖",
        meta: "8 节 · 李教授 · 未开始",
        detail: "用生活场景讲清阴阳、五行、脏腑之间的基础关系。",
    },
    {
        name: "太极二十四式",
        emoji: "☯️",
        meta: "24 节 · 张师傅 · 未开始",
        detail: "节奏舒缓，适合改善体态、呼吸与下肢稳定性。",
    },
    {
        name: "面诊舌诊基础",
        emoji: "👐",
        meta: "6 节 · 陈医师 · 已学 1 节",
        detail: "认识常见舌象与面色变化，辅助日常健康记录。",
    },
    {
        name: "经络入门",
        emoji: "🧭",
        meta: "10 节 · 周老师 · 未开始",
        detail: "从十二经络走向到常用穴位，建立基础经络地图。",
    },
    {
        name: "四季食养",
        emoji: "🍵",
        meta: "16 节 · 苏老师 · 已收藏",
        detail: "按节气选择食材与烹调方式，适合搭配养生智库使用。",
    },
];
const courses = allCourses.slice(0, 4);

function completeBodyTest() {
    constitutionName.value =
        selectedBodyType.value === "平和"
            ? "平和质"
            : `${selectedBodyType.value}体质`;
    showTestModal.value = false;
}

function closeCourseDialog() {
    selectedCourse.value = null;
    showAllCourses.value = false;
}
</script>

<style scoped lang="scss">
.constitution-card {
    background: linear-gradient(135deg, #faf6ee 0%, #f5ebd3 100%);
    border-radius: 16px;
    padding: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.45);
    animation: cardRise 0.28s ease both;
}
.constitution-card::after {
    content: "医";
    position: absolute;
    right: -10px;
    bottom: -30px;
    font-family: "STKaiti", serif;
    font-size: 160px;
    color: var(--gold);
    opacity: 0.1;
    font-weight: 900;
}
.constitution-name {
    font-family: "STKaiti", serif;
    font-size: 32px;
    color: var(--ink);
    font-weight: 600;
}
.constitution-sub {
    color: var(--ink-muted);
    margin-top: 6px;
    font-size: 14px;
}

.radar {
    width: 220px;
    height: 220px;
    margin: 20px auto 0;
}

.meridian-body {
    height: 280px;
    background: linear-gradient(180deg, var(--jade-soft), var(--paper-warm));
    border-radius: 14px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.body-figure {
    font-size: 120px;
    opacity: 0.4;
}
.acupoint {
    position: absolute;
    width: 14px;
    height: 14px;
    background: var(--cinnabar);
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 0 rgba(179, 60, 44, 0.5);
    animation: pulse 2s infinite;
}
.acupoint.selected {
    width: 18px;
    height: 18px;
    background: var(--gold);
    box-shadow: 0 0 0 8px rgba(201, 165, 92, 0.18);
}
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(179, 60, 44, 0.5);
    }
    100% {
        box-shadow: 0 0 0 10px rgba(179, 60, 44, 0);
    }
}
.acu-tag {
    display: inline-block;
    background: var(--cinnabar);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
}
.acu-tag.ghost {
    background: var(--paper-warm);
    color: var(--ink-muted);
    border: 1px solid var(--line);
}

.course-card {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
    text-align: left;
    font-family: inherit;
}
.course-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
.course-img {
    height: 100px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
}
.course-body {
    padding: 12px;
}
.course-name {
    font-size: 14px;
    font-weight: 600;
}
.course-meta {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 4px;
}

.card {
    background: var(--paper);
    border-radius: 14px;
    padding: 24px;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.4);
    animation: cardRise 0.28s ease both;
}
.card-title {
    font-family: "STKaiti", serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.card-title .dot {
    width: 4px;
    height: 16px;
    background: var(--jade);
    border-radius: 2px;
}
.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}
.btn {
    background: var(--jade);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 22px;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}
.btn:hover {
    background: var(--ink);
    transform: translateY(-1px);
}
.btn-ghost {
    background: transparent;
    color: var(--jade);
    border: 1px solid var(--jade);
}
.btn-ghost:hover {
    background: var(--jade-soft);
}
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.34);
}
.tcm-dialog {
    position: relative;
    width: min(560px, 100%);
    padding: 28px;
    border-radius: 18px;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    box-shadow: 0 24px 60px rgba(44, 54, 57, 0.22);
}
.tcm-dialog h3 {
    font-family: "STKaiti", serif;
    font-size: 24px;
    color: var(--ink);
}
.tcm-dialog p {
    margin: 8px 0 16px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.7;
}
.modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 34px;
    height: 34px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
    font-size: 22px;
}
.test-options,
.course-list {
    display: grid;
    gap: 10px;
    margin-bottom: 16px;
}
.test-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.test-options button,
.course-list button {
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--paper-warm);
    padding: 12px;
    text-align: left;
    font-family: inherit;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.2s;
}
.test-options button:hover,
.test-options button.active,
.course-list button:hover,
.course-list button.active {
    border-color: var(--jade);
    box-shadow: var(--shadow);
    transform: translateY(-1px);
}
.test-options span,
.course-list em {
    display: block;
    margin-top: 4px;
    color: var(--ink-muted);
    font-size: 12px;
    font-style: normal;
}
.course-list button {
    display: grid;
    grid-template-columns: 34px 1fr;
    align-items: center;
    column-gap: 10px;
}
.course-list em {
    grid-column: 2;
}
.tcm-modal-enter-active,
.tcm-modal-leave-active {
    transition: opacity 0.22s ease;
}
.tcm-modal-enter-active .tcm-dialog,
.tcm-modal-leave-active .tcm-dialog {
    transition: transform 0.22s ease;
}
.tcm-modal-enter-from,
.tcm-modal-leave-to {
    opacity: 0;
}
.tcm-modal-enter-from .tcm-dialog,
.tcm-modal-leave-to .tcm-dialog {
    transform: translateY(16px) scale(0.98);
}

@keyframes cardRise {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 900px) {
    .grid-2,
    .grid-4 {
        grid-template-columns: 1fr;
    }
}
</style>
