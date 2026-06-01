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
                    {{ constitutionSubText }}
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
                        :points="constitutionRadarPoints"
                        fill="#C9A55C"
                        fill-opacity="0.3"
                        stroke="#C9A55C"
                        stroke-width="2"
                    />
                    <text
                        v-for="axis in radarAxes"
                        :key="axis.name"
                        :x="axis.labelX"
                        :y="axis.labelY"
                        text-anchor="middle"
                        font-size="11"
                        fill="#6B7C7A"
                    >
                        {{ axis.name }}
                    </text>
                </svg>

                <div v-if="topDimensions.length" class="constitution-tags">
                    <span
                        v-for="item in topDimensions.slice(0, 3)"
                        :key="item.name"
                    >
                        {{ item.name }} {{ formatScore(item.score) }}分
                    </span>
                </div>

                <button
                    class="btn"
                    style="margin-top: 8px"
                    type="button"
                    :disabled="isLoadingConstitution"
                    @click="openConstitutionTest"
                >
                    {{ constitutionButtonText }}
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
                    @click.self="closeTestModal"
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
                            @click="closeTestModal"
                        >
                            ×
                        </button>
                        <h3 id="test-title">体质测试</h3>
                        <p>{{ testIntroText }}</p>

                        <div v-if="isLoadingQuestions" class="test-state">
                            正在同步体质测试题目...
                        </div>
                        <div
                            v-else-if="constitutionQuestions.length === 0"
                            class="test-state"
                        >
                            暂无体质测试题目
                        </div>
                        <div v-else class="test-questions">
                            <div
                                v-for="question in constitutionQuestions"
                                :key="question.questionNo"
                                class="test-question"
                            >
                                <span>
                                    {{ question.questionNo }}.
                                    {{ question.questionText }}
                                </span>
                                <div class="test-options">
                                    <button
                                        v-for="option in question.options"
                                        :key="option.optionCode"
                                        type="button"
                                        :class="{
                                            active:
                                                testAnswers[
                                                    question.questionNo
                                                ] === option.optionCode,
                                        }"
                                        @click="
                                            setTestAnswer(
                                                question.questionNo,
                                                option.optionCode,
                                            )
                                        "
                                    >
                                        <strong>{{ option.optionCode }}</strong>
                                        <span>{{ option.optionText }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="testResult || latestConstitution"
                            class="test-result"
                        >
                            <strong>{{ resultTitle }}</strong>
                            <span>标准分 {{ resultScoreText }}</span>
                            <p>{{ resultDescription }}</p>
                        </div>

                        <div
                            v-if="constitutionHistory.length"
                            class="test-history"
                        >
                            <span
                                v-for="item in constitutionHistory.slice(0, 3)"
                                :key="`${item.testDate}-${item.standardScore}`"
                            >
                                {{ formatDateText(item.testDate) }} ·
                                {{ readResultTitle(item) || "已测" }}
                            </span>
                        </div>

                        <div v-if="testError" class="test-error">
                            {{ testError }}
                        </div>
                        <button
                            class="btn"
                            type="button"
                            :disabled="
                                isSubmittingTest ||
                                !canSubmitTest ||
                                !hasActiveUser
                            "
                            @click="submitConstitutionTest"
                        >
                            {{ isSubmittingTest ? "提交中" : "提交测试" }}
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
import { computed, onMounted, ref, watch } from "vue";
import {
    ApiPsychScale,
    type PsychScaleLatestVO,
    type PsychScaleQuestionVO,
} from "@/network";
import { useUserStore } from "@/store";

type Acupoint = {
    name: string;
    effect: string;
    method: string;
    top: string;
    left: string;
};
type Course = { name: string; emoji: string; meta: string; detail: string };
type DimensionEntry = { name: string; score: number };
type RadarAxis = {
    name: string;
    labelX: number;
    labelY: number;
    valueX: number;
    valueY: number;
};

const CONSTITUTION_SCALE_CODE = "CONSTITUTION";
const emit = defineEmits<{
    "constitution-updated": [result: PsychScaleLatestVO | null];
}>();
const userStore = useUserStore();

const showTestModal = ref(false);
const showAllCourses = ref(false);
const selectedCourse = ref<Course | null>(null);
const latestConstitution = ref<PsychScaleLatestVO | null>(null);
const testResult = ref<PsychScaleLatestVO | null>(null);
const constitutionHistory = ref<PsychScaleLatestVO[]>([]);
const constitutionQuestions = ref<PsychScaleQuestionVO[]>([]);
const testAnswers = ref<Record<string, string>>({});
const isLoadingConstitution = ref(false);
const isLoadingQuestions = ref(false);
const isSubmittingTest = ref(false);
const testError = ref("");

const radarAxes: RadarAxis[] = [
    { name: "阴虚", labelX: 100, labelY: 15, valueX: 100, valueY: 30 },
    { name: "气郁", labelX: 185, labelY: 62, valueX: 165, valueY: 60 },
    { name: "血瘀", labelX: 185, labelY: 145, valueX: 150, valueY: 135 },
    { name: "平和", labelX: 100, labelY: 195, valueX: 90, valueY: 170 },
    { name: "湿热", labelX: 15, labelY: 145, valueX: 35, valueY: 130 },
    { name: "气虚", labelX: 15, labelY: 62, valueX: 50, valueY: 55 },
];
const bodyTypeAliases = [
    { name: "平和", keys: ["平和", "pinghe", "balanced"] },
    { name: "气虚", keys: ["气虚", "qixu", "qideficiency"] },
    { name: "阳虚", keys: ["阳虚", "yangxu", "yangdeficiency"] },
    { name: "阴虚", keys: ["阴虚", "yinxu", "yindeficiency"] },
    { name: "痰湿", keys: ["痰湿", "tanshi", "phlegmdamp"] },
    { name: "湿热", keys: ["湿热", "shire", "dampheat"] },
    { name: "血瘀", keys: ["血瘀", "xueyu", "bloodstasis"] },
    { name: "气郁", keys: ["气郁", "qiyu", "qistagnation"] },
    { name: "特禀", keys: ["特禀", "tebing", "specialdiathesis"] },
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

const activeUserId = computed(() => {
    const loginId = Number(userStore.G_LoginInfo.id);
    const infoId = Number(userStore.G_UserInfo.id);
    return Number.isFinite(loginId) && loginId > 0 ? loginId : infoId;
});
const hasActiveUser = computed(() => isValidUserId(activeUserId.value));
const displayResult = computed(
    () => testResult.value ?? latestConstitution.value,
);
const topDimensions = computed(() => readDimensionEntries(displayResult.value));
const radarScores = computed(() =>
    Object.fromEntries(
        topDimensions.value.map((item) => [item.name, item.score]),
    ),
);
const constitutionName = computed(
    () => readResultTitle(displayResult.value) || "待测试体质",
);
const constitutionSubText = computed(() => {
    if (!hasActiveUser.value) return "登录后同步后台体质测试结果";
    if (isLoadingConstitution.value && !latestConstitution.value) {
        return "正在同步体质测试结果";
    }
    if (!displayResult.value) return "完成一次体质测试后，这里会显示后台结果";

    const [primary, secondary] = topDimensions.value;
    if (primary && secondary) {
        return `主体质 ${formatConstitutionName(primary.name)} (${formatScore(
            primary.score,
        )} 分) · 兼体质 ${formatConstitutionName(
            secondary.name,
        )} (${formatScore(secondary.score)} 分)`;
    }
    if (primary) {
        return `主体质 ${formatConstitutionName(primary.name)} (${formatScore(
            primary.score,
        )} 分)`;
    }

    const result = displayResult.value;
    return (
        cleanApiText(result.resultDesc) ||
        `标准分 ${formatScore(result.standardScore)}`
    );
});
const constitutionRadarPoints = computed(() =>
    radarAxes
        .map((axis) => {
            const score = radarScores.value[axis.name] ?? 18;
            const ratio = clamp(Number(score) / 100, 0.18, 1);
            const x = 100 + (axis.valueX - 100) * ratio;
            const y = 100 + (axis.valueY - 100) * ratio;
            return `${formatCoordinate(x)},${formatCoordinate(y)}`;
        })
        .join(" "),
);
const constitutionButtonText = computed(() =>
    latestConstitution.value ? "重新测试体质" : "开始体质测试",
);
const testIntroText = computed(() => {
    if (!hasActiveUser.value)
        return "可先查看题目，登录后才能提交后台测评结果。";
    if (constitutionQuestions.value.length) {
        return `${constitutionQuestions.value.length} 题 · 提交后同步保存体质测试结果。`;
    }
    return "题目来自统一量表测评接口，提交后会写入测试历史。";
});
const canSubmitTest = computed(
    () =>
        constitutionQuestions.value.length > 0 &&
        constitutionQuestions.value.every((question) =>
            Boolean(testAnswers.value[question.questionNo]),
        ),
);
const resultTitle = computed(
    () => readResultTitle(displayResult.value) || "体质结果已同步",
);
const resultScoreText = computed(() =>
    formatScore(displayResult.value?.standardScore),
);
const resultDescription = computed(
    () =>
        cleanApiText(displayResult.value?.resultDesc) ||
        "结果已保存，可在后台历史中继续查看。",
);

function closeCourseDialog() {
    selectedCourse.value = null;
    showAllCourses.value = false;
}

async function openConstitutionTest() {
    showTestModal.value = true;
    testResult.value = null;
    testAnswers.value = {};
    await loadConstitutionTest();
}

function closeTestModal() {
    showTestModal.value = false;
}

function setTestAnswer(questionNo: string, optionCode: string) {
    testAnswers.value = {
        ...testAnswers.value,
        [questionNo]: optionCode,
    };
}

async function loadLatestConstitution() {
    if (!hasActiveUser.value) {
        latestConstitution.value = null;
        return;
    }

    isLoadingConstitution.value = true;
    try {
        latestConstitution.value = await ApiPsychScale.getScaleLatest(
            CONSTITUTION_SCALE_CODE,
            activeUserId.value,
        );
    } catch (error) {
        console.error("读取体质测试结果失败", error);
        latestConstitution.value = null;
    } finally {
        isLoadingConstitution.value = false;
    }
}

async function loadConstitutionTest() {
    isLoadingQuestions.value = true;
    testError.value = "";
    try {
        const [questionsResult, historyResult, latestResult] =
            await Promise.allSettled([
                ApiPsychScale.getScaleQuestions(CONSTITUTION_SCALE_CODE),
                hasActiveUser.value
                    ? ApiPsychScale.getScaleHistory(
                          CONSTITUTION_SCALE_CODE,
                          activeUserId.value,
                      )
                    : Promise.resolve<PsychScaleLatestVO[]>([]),
                hasActiveUser.value
                    ? ApiPsychScale.getScaleLatest(
                          CONSTITUTION_SCALE_CODE,
                          activeUserId.value,
                      )
                    : Promise.resolve<PsychScaleLatestVO | null>(null),
            ] as const);

        if (questionsResult.status === "rejected") throw questionsResult.reason;
        constitutionQuestions.value = questionsResult.value;

        if (historyResult.status === "fulfilled") {
            constitutionHistory.value = historyResult.value;
        } else {
            constitutionHistory.value = [];
            console.error("读取体质测试历史失败", historyResult.reason);
        }

        if (latestResult.status === "fulfilled") {
            latestConstitution.value = latestResult.value;
        } else {
            console.error("读取最近一次体质测试失败", latestResult.reason);
        }
    } catch (error) {
        console.error("读取体质测试题目失败", error);
        constitutionQuestions.value = [];
        testError.value = resolveTcmErrorMessage(error, "体质测试题目同步失败");
    } finally {
        isLoadingQuestions.value = false;
    }
}

async function submitConstitutionTest() {
    if (!canSubmitTest.value || !hasActiveUser.value) return;

    isSubmittingTest.value = true;
    testError.value = "";
    try {
        const result = await ApiPsychScale.submitScaleTest(
            CONSTITUTION_SCALE_CODE,
            {
                userId: activeUserId.value,
                answers: constitutionQuestions.value.map((question) => ({
                    questionNo: question.questionNo,
                    optionCode: testAnswers.value[question.questionNo]!,
                })),
            },
        );
        testResult.value = result;
        latestConstitution.value = result;
        constitutionHistory.value = [result, ...constitutionHistory.value];
        emit("constitution-updated", result);
    } catch (error) {
        console.error("提交体质测试失败", error);
        testError.value = resolveTcmErrorMessage(
            error,
            "体质测试提交失败，请稍后重试",
        );
    } finally {
        isSubmittingTest.value = false;
    }
}

function readDimensionEntries(
    result: PsychScaleLatestVO | null | undefined,
): DimensionEntry[] {
    return Object.entries(result?.dimensionScores ?? {})
        .map(([name, score]) => ({
            name: normalizeBodyTypeName(name),
            score: Number(score),
        }))
        .filter((item) => item.name && Number.isFinite(item.score))
        .sort((left, right) => right.score - left.score);
}

function readResultTitle(result: PsychScaleLatestVO | null | undefined) {
    if (!result) return "";
    const level = cleanApiText(result.resultLevel);
    if (level) return formatConstitutionName(level);
    const top = readDimensionEntries(result)[0];
    return top ? formatConstitutionName(top.name) : "";
}

function normalizeBodyTypeName(value: string) {
    const clean = cleanApiText(value)
        .replace(/体质|质|得分|score/gi, "")
        .trim();
    if (!clean) return "";

    const key = clean.toLowerCase().replace(/[\s_-]/g, "");
    const alias = bodyTypeAliases.find((item) =>
        item.keys.some((aliasKey) => key.includes(aliasKey.toLowerCase())),
    );
    return alias?.name ?? clean;
}

function formatConstitutionName(value: string) {
    const clean = cleanApiText(value);
    if (!clean) return "";
    if (/体质$|质$/.test(clean)) return clean;
    return clean === "平和" ? "平和质" : `${clean}体质`;
}

function cleanApiText(value: unknown) {
    if (value == null) return "";
    const text = String(value).trim();
    return text && text !== "##default" ? text : "";
}

function formatScore(value: number | undefined) {
    if (typeof value !== "number" || Number.isNaN(value)) return "--";
    return value.toFixed(1).replace(/\.0$/, "");
}

function formatDateText(value: string | undefined) {
    if (!value) return "最近";
    return value.split("T")[0] ?? value;
}

function formatCoordinate(value: number) {
    return Number(value.toFixed(1));
}

function clamp(value: number, min: number, max: number) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
}

function resolveTcmErrorMessage(error: unknown, fallback: string) {
    const response = (
        error as { response?: { status?: number; data?: unknown } }
    )?.response;
    if (response?.status === 403) {
        return readErrorMessage(response.data) || "当前登录状态无权访问该接口";
    }
    if (response?.status === 401) {
        return "登录已过期，请重新登录";
    }
    return readErrorMessage(response?.data) || fallback;
}

function readErrorMessage(data: unknown) {
    if (typeof data !== "object" || data === null) return "";
    const source = data as Record<string, unknown>;
    return typeof source.message === "string"
        ? source.message
        : typeof source.msg === "string"
          ? source.msg
          : "";
}

function isValidUserId(value: number) {
    return Number.isFinite(value) && value > 0;
}

onMounted(() => {
    void loadLatestConstitution();
});

watch(activeUserId, (userId) => {
    if (!isValidUserId(userId)) {
        latestConstitution.value = null;
        return;
    }
    void loadLatestConstitution();
});
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
.constitution-tags {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}
.constitution-tags span {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(92, 131, 116, 0.12);
    color: var(--jade);
    font-size: 12px;
    font-weight: 600;
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
.btn:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
}
.btn:disabled:hover {
    background: var(--jade);
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
    width: min(720px, 100%);
    max-height: min(86vh, 760px);
    overflow: auto;
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
.test-state {
    display: grid;
    place-items: center;
    min-height: 120px;
    color: var(--ink-muted);
    font-size: 13px;
}
.test-questions {
    display: grid;
    gap: 14px;
    margin-bottom: 16px;
}
.test-question {
    padding: 14px;
    border: 1px solid rgba(232, 223, 208, 0.72);
    border-radius: 12px;
    background: var(--paper-warm);
}
.test-question > span {
    display: block;
    margin-bottom: 10px;
    color: var(--ink);
    font-weight: 600;
    line-height: 1.6;
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
.test-options strong {
    display: block;
    color: var(--jade);
    font-size: 13px;
}
.test-result {
    margin-bottom: 14px;
    padding: 14px;
    border-radius: 12px;
    background: rgba(92, 131, 116, 0.12);
    border: 1px solid rgba(92, 131, 116, 0.18);
}
.test-result strong {
    display: block;
    color: var(--ink);
    font-size: 16px;
}
.test-result span,
.test-result p {
    display: block;
    margin: 6px 0 0;
    color: var(--ink-muted);
    font-size: 13px;
}
.test-history {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
}
.test-history span {
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--paper-warm);
    color: var(--ink-muted);
    border: 1px solid var(--line);
    font-size: 12px;
}
.test-error {
    margin-bottom: 12px;
    color: var(--cinnabar);
    font-size: 13px;
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
    .test-options {
        grid-template-columns: 1fr;
    }
}
</style>
