<template>
    <div class="emotion-panel">
        <Transition name="toast-pop">
            <div v-if="toastVisible" class="save-toast">
                {{ toastMessage }}
            </div>
        </Transition>

        <div class="grid-2 primary-grid">
            <div class="mood-picker">
                <div class="eyebrow">TODAY · 此刻心情</div>
                <div class="mood-row">
                    <button
                        v-for="m in moods"
                        :key="m.score"
                        class="mood-emoji"
                        :class="{ selected: selectedMoodScore === m.score }"
                        type="button"
                        @click="selectedMoodScore = m.score"
                    >
                        {{ m.emoji }}
                    </button>
                </div>
                <div class="mood-labels">
                    <span v-for="m in moods" :key="m.label">{{ m.label }}</span>
                </div>

                <div class="keyword-box">
                    <div class="keyword-title">用关键词形容此刻：</div>
                    <div class="keyword-row">
                        <button
                            v-for="tag in moodKeywords"
                            :key="tag"
                            class="mood-tag filled"
                            type="button"
                            @click="removeKeyword(tag)"
                        >
                            {{ tag }}
                        </button>
                        <input
                            v-if="showKeywordInput"
                            v-model="keywordInput"
                            class="keyword-input"
                            placeholder="输入关键词"
                            @keydown.enter.prevent="addKeyword"
                        />
                        <button
                            class="mood-tag add"
                            type="button"
                            @click="
                                showKeywordInput
                                    ? addKeyword()
                                    : (showKeywordInput = true)
                            "
                        >
                            + 添加
                        </button>
                    </div>
                </div>

                <div class="mood-actions">
                    <span class="status-note">{{ emotionStatusText }}</span>
                    <button
                        class="btn"
                        type="button"
                        :disabled="isSavingEmotion || !hasActiveUser"
                        @click="saveEmotionRecord"
                    >
                        {{ isSavingEmotion ? "保存中" : "保存心情" }}
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0">
                        <span class="dot"></span>近 17 日情绪曲线
                    </div>
                    <div class="avg-text">
                        平均
                        <strong>{{ averageMoodText }}</strong>
                    </div>
                </div>
                <div class="mood-trend">
                    <svg
                        viewBox="0 0 700 120"
                        preserveAspectRatio="none"
                        aria-label="近 17 日情绪曲线"
                    >
                        <defs>
                            <linearGradient
                                id="moodGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stop-color="#C9A55C"
                                    stop-opacity="0.5"
                                />
                                <stop
                                    offset="100%"
                                    stop-color="#C9A55C"
                                    stop-opacity="0"
                                />
                            </linearGradient>
                        </defs>
                        <path
                            v-if="hasMoodTrend"
                            :d="moodAreaPath"
                            fill="url(#moodGrad)"
                        />
                        <path
                            :d="moodLinePath"
                            fill="none"
                            stroke="#C9A55C"
                            stroke-width="2.5"
                        />
                        <circle
                            v-for="point in moodChartPoints"
                            :key="point.date"
                            class="chart-dot"
                            :class="{ empty: !point.score }"
                            :cx="point.x"
                            :cy="point.y"
                            r="3.6"
                        />
                    </svg>
                </div>
                <div class="trend-insight">
                    <strong>💡 趋势洞察：</strong>{{ trendInsight }}
                </div>
            </div>
        </div>

        <div class="grid-2 secondary-grid">
            <div class="card">
                <div class="card-title"><span class="dot"></span>冥想引导</div>
                <div v-if="isLoadingMeditations" class="meditation-state">
                    正在同步冥想音频...
                </div>
                <div v-else-if="meditationError" class="meditation-state error">
                    <span>{{ meditationError }}</span>
                    <button type="button" @click="loadMeditations">重试</button>
                </div>
                <div
                    v-else-if="meditations.length === 0"
                    class="meditation-state"
                >
                    暂无冥想引导资源。
                </div>
                <template v-else>
                    <button
                        v-for="med in meditations"
                        :key="med.id ?? med.title"
                        class="meditation-row"
                        :class="{
                            active: activeMeditation === meditationKey(med),
                            disabled: !med.mediaUrl,
                        }"
                        type="button"
                        @click="toggleMeditation(med)"
                    >
                        <div class="med-icon">{{ med.emoji }}</div>
                        <div class="med-info">
                            <div class="med-title">{{ med.title }}</div>
                            <div class="med-dur">{{ med.dur }}</div>
                        </div>
                        <div class="play-state">
                            {{
                                activeMeditation === meditationKey(med)
                                    ? "暂停"
                                    : med.mediaUrl
                                      ? "开始"
                                      : "无资源"
                            }}
                        </div>
                    </button>
                </template>
            </div>

            <div class="card">
                <div class="card-title">
                    <span class="dot"></span>心理量表自评
                </div>
                <div class="survey-list">
                    <button
                        v-for="survey in surveys"
                        :key="survey.code"
                        class="survey-card"
                        type="button"
                        @click="openSurvey(survey)"
                    >
                        <div class="survey-name">{{ survey.name }}</div>
                        <div class="survey-desc">{{ survey.desc }}</div>
                    </button>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="emotion-modal">
                <div
                    v-if="selectedSurvey"
                    class="emotion-backdrop"
                    @click.self="closeSurvey"
                >
                    <section
                        class="emotion-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="survey-title"
                    >
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭量表"
                            @click="closeSurvey"
                        >
                            ×
                        </button>
                        <h3 id="survey-title">{{ selectedSurvey.name }}</h3>
                        <p>{{ selectedSurvey.desc }}</p>

                        <div v-if="isLoadingSurvey" class="survey-state">
                            正在同步量表题目...
                        </div>
                        <div
                            v-else-if="surveyQuestions.length === 0"
                            class="survey-state"
                        >
                            暂无量表题目
                        </div>
                        <div v-else class="survey-questions">
                            <div
                                v-for="question in surveyQuestions"
                                :key="question.questionNo"
                                class="survey-question"
                            >
                                <span>
                                    {{ question.questionNo }}.
                                    {{ question.questionText }}
                                </span>
                                <div class="survey-options">
                                    <button
                                        v-for="option in question.options"
                                        :key="option.optionCode"
                                        class="survey-option"
                                        :class="{
                                            active:
                                                surveyAnswers[
                                                    question.questionNo
                                                ] === option.optionCode,
                                        }"
                                        type="button"
                                        @click="
                                            setSurveyAnswer(
                                                question.questionNo,
                                                option.optionCode,
                                            )
                                        "
                                    >
                                        {{ option.optionText }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="surveyResult || selectedSurveyLatest"
                            class="survey-result"
                        >
                            <strong>{{
                                (surveyResult ?? selectedSurveyLatest)
                                    ?.resultLevel || "已记录"
                            }}</strong>
                            <span>
                                标准分
                                {{
                                    formatScore(
                                        (surveyResult ?? selectedSurveyLatest)
                                            ?.standardScore,
                                    )
                                }}
                            </span>
                            <p>
                                {{
                                    (surveyResult ?? selectedSurveyLatest)
                                        ?.resultDesc || "结果已同步。"
                                }}
                            </p>
                        </div>

                        <div v-if="scaleHistory.length" class="survey-history">
                            <span
                                v-for="item in scaleHistory.slice(0, 3)"
                                :key="`${item.testDate}-${item.standardScore}`"
                            >
                                {{ formatDateText(item.testDate) }} ·
                                {{ item.resultLevel || "已测" }}
                            </span>
                        </div>

                        <button
                            class="btn"
                            type="button"
                            :disabled="
                                isSubmittingSurvey ||
                                !canSubmitSurvey ||
                                !hasActiveUser
                            "
                            @click="submitSurvey"
                        >
                            {{ isSubmittingSurvey ? "提交中" : "提交量表" }}
                        </button>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
    ApiEmotion,
    ApiWellnessMedia,
    type DayEmotionVO,
    type Emotion17DaysVO,
    type PsychScaleLatestVO,
    type PsychScaleQuestionVO,
    type WellnessMediaResourceVO,
} from "@/network";
import { useUserStore } from "@/store";

type MoodOption = {
    score: number;
    emoji: string;
    label: string;
};

type ScaleDefinition = {
    code: string;
    name: string;
    defaultCount: number;
    minutes: number;
};

type ScaleSurvey = ScaleDefinition & {
    desc: string;
};

type MoodChartPoint = {
    date: string;
    score: number;
    x: number;
    y: number;
};

type MeditationItem = {
    id?: number | string;
    emoji: string;
    title: string;
    dur: string;
    mediaUrl: string;
    source: WellnessMediaResourceVO;
};

const moods: MoodOption[] = [
    { score: 1, emoji: "😔", label: "很差" },
    { score: 2, emoji: "😐", label: "低落" },
    { score: 3, emoji: "🙂", label: "平静" },
    { score: 4, emoji: "😊", label: "愉悦" },
    { score: 5, emoji: "🥰", label: "极佳" },
];

const meditations = ref<MeditationItem[]>([]);

const scaleDefinitions: ScaleDefinition[] = [
    { code: "SAS", name: "SAS · 焦虑自评量表", defaultCount: 20, minutes: 5 },
    { code: "SDS", name: "SDS · 抑郁自评量表", defaultCount: 20, minutes: 5 },
    { code: "PSS", name: "PSS · 压力知觉量表", defaultCount: 14, minutes: 3 },
];

const userStore = useUserStore();
const todayDate = startOfLocalDay(new Date());
const todayISO = toISODate(todayDate);

const selectedMoodScore = ref(3);
const moodKeywords = ref(["平静", "温暖"]);
const showKeywordInput = ref(false);
const keywordInput = ref("");
const activeMeditation = ref("");
const activeMeditationAudio = ref<HTMLAudioElement | null>(null);
const isLoadingMeditations = ref(false);
const meditationError = ref("");
const emotionSummary = ref<Emotion17DaysVO | null>(null);
const isLoadingEmotion = ref(false);
const isSavingEmotion = ref(false);
const toastVisible = ref(false);
const toastMessage = ref("");
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const selectedSurvey = ref<ScaleSurvey | null>(null);
const surveyQuestions = ref<PsychScaleQuestionVO[]>([]);
const surveyAnswers = ref<Record<string, string>>({});
const surveyResult = ref<PsychScaleLatestVO | null>(null);
const scaleHistory = ref<PsychScaleLatestVO[]>([]);
const scaleLatestMap = ref<Record<string, PsychScaleLatestVO | null>>({});
const isLoadingSurvey = ref(false);
const isSubmittingSurvey = ref(false);

const activeUserId = computed(() => {
    const loginId = Number(userStore.G_LoginInfo.id);
    const infoId = Number(userStore.G_UserInfo.id);
    return Number.isFinite(loginId) && loginId > 0 ? loginId : infoId;
});
const hasActiveUser = computed(() => isValidUserId(activeUserId.value));
const selectedMood = computed(
    () =>
        moods.find((item) => item.score === selectedMoodScore.value) ??
        moods[2]!,
);
const emotionStatusText = computed(() => {
    if (!hasActiveUser.value) return "登录后可同步情绪记录";
    if (isLoadingEmotion.value) return "正在同步情绪趋势";
    return `今日心情：${selectedMood.value.label}`;
});
const averageMoodText = computed(() => {
    const score = emotionSummary.value?.averageScore ?? 0;
    const text =
        emotionSummary.value?.averageText ||
        moodLabelFromScore(score) ||
        "待记录";
    return score > 0 ? `${text} · ${formatScore(score)}` : text;
});
const moodDays = computed(() =>
    buildRecentMoodDays(emotionSummary.value?.days ?? []),
);
const hasMoodTrend = computed(() =>
    moodDays.value.some((item) => item.score > 0),
);
const moodChartPoints = computed<MoodChartPoint[]>(() =>
    moodDays.value.map((item, index) => {
        const step = 660 / Math.max(1, moodDays.value.length - 1);
        const score = clampMoodScore(item.score);
        return {
            ...item,
            score,
            x: 20 + step * index,
            y: score > 0 ? 106 - ((score - 1) / 4) * 78 : 104,
        };
    }),
);
const moodLinePath = computed(() =>
    moodChartPoints.value
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" "),
);
const moodAreaPath = computed(() => {
    const points = moodChartPoints.value;
    const line = moodLinePath.value;
    const first = points[0];
    const last = points[points.length - 1];
    if (!line || !first || !last) return "";
    return `${line} L ${last.x} 120 L ${first.x} 120 Z`;
});
const trendInsight = computed(() => {
    const scoredDays = moodDays.value.filter((item) => item.score > 0);
    if (!scoredDays.length) return "暂无记录，保存几天心情后会生成趋势。";
    const recent = scoredDays.slice(-3);
    if (recent.length < 2) return "已同步今日心情，继续记录会更准确。";
    const diff = recent[recent.length - 1]!.score - recent[0]!.score;
    if (diff > 0) return "最近几次记录在回升，适合延续当前的放松节奏。";
    if (diff < 0) return "最近几次记录略有回落，今晚可以安排更轻的任务。";
    return "最近几次记录较平稳，适合保持规律作息和温和运动。";
});
const surveys = computed<ScaleSurvey[]>(() =>
    scaleDefinitions.map((scale) => {
        const latest = scaleLatestMap.value[scale.code];
        const latestText = latest
            ? `上次评分 ${formatScore(latest.standardScore)} 分（${
                  latest.resultLevel || "已测"
              }）`
            : "尚未测试";
        return {
            ...scale,
            desc: `${scale.defaultCount} 题 · 约 ${scale.minutes} 分钟 · ${latestText}`,
        };
    }),
);
const selectedSurveyLatest = computed(() =>
    selectedSurvey.value
        ? (scaleLatestMap.value[selectedSurvey.value.code] ?? null)
        : null,
);
const canSubmitSurvey = computed(
    () =>
        surveyQuestions.value.length > 0 &&
        surveyQuestions.value.every((question) =>
            Boolean(surveyAnswers.value[question.questionNo]),
        ),
);

function addKeyword() {
    const next = keywordInput.value.trim();
    if (next && !moodKeywords.value.includes(next)) {
        moodKeywords.value.push(next);
    }
    keywordInput.value = "";
    showKeywordInput.value = false;
}

function removeKeyword(tag: string) {
    moodKeywords.value = moodKeywords.value.filter((item) => item !== tag);
}

async function saveEmotionRecord() {
    if (!hasActiveUser.value) {
        showToast("请先登录后再保存心情");
        return;
    }
    if (showKeywordInput.value) addKeyword();
    isSavingEmotion.value = true;
    try {
        await ApiEmotion.createRecord({
            userId: activeUserId.value,
            recordDate: todayISO,
            emotionScore: selectedMoodScore.value,
            note: moodKeywords.value.join("、"),
        });
        await loadEmotionTrend();
        showToast("今日心情已同步");
    } catch (error) {
        console.error("保存情绪记录失败", error);
        showToast(
            resolveEmotionErrorMessage(error, "心情保存失败，请稍后重试"),
        );
    } finally {
        isSavingEmotion.value = false;
    }
}

async function loadEmotionTrend() {
    if (!hasActiveUser.value) return;
    isLoadingEmotion.value = true;
    try {
        const data = await ApiEmotion.getLast17Days(activeUserId.value);
        emotionSummary.value = data;
        const todayRecord = data.days.find(
            (item) => item.recordDate === todayISO,
        );
        if (todayRecord?.emotionScore) {
            selectedMoodScore.value =
                clampMoodScore(todayRecord.emotionScore) || 3;
        }
    } catch (error) {
        console.error("读取情绪趋势失败", error);
        emotionSummary.value = null;
    } finally {
        isLoadingEmotion.value = false;
    }
}

async function preloadScaleLatest() {
    if (!hasActiveUser.value) return;
    const results = await Promise.allSettled(
        scaleDefinitions.map((scale) =>
            ApiEmotion.getScaleLatest(scale.code, activeUserId.value),
        ),
    );
    const next: Record<string, PsychScaleLatestVO | null> = {};
    results.forEach((result, index) => {
        const code = scaleDefinitions[index]?.code;
        if (!code) return;
        next[code] = result.status === "fulfilled" ? result.value : null;
    });
    scaleLatestMap.value = next;
}

async function openSurvey(survey: ScaleSurvey) {
    selectedSurvey.value = survey;
    surveyQuestions.value = [];
    surveyAnswers.value = {};
    surveyResult.value = null;
    scaleHistory.value = [];
    isLoadingSurvey.value = true;
    try {
        const [questions, history, latest] = await Promise.all([
            ApiEmotion.getScaleQuestions(survey.code),
            hasActiveUser.value
                ? ApiEmotion.getScaleHistory(survey.code, activeUserId.value)
                : Promise.resolve([]),
            hasActiveUser.value
                ? ApiEmotion.getScaleLatest(survey.code, activeUserId.value)
                : Promise.resolve(null),
        ]);
        surveyQuestions.value = questions;
        scaleHistory.value = history;
        scaleLatestMap.value = {
            ...scaleLatestMap.value,
            [survey.code]: latest,
        };
    } catch (error) {
        console.error("读取心理量表失败", error);
        showToast(resolveEmotionErrorMessage(error, "量表题目同步失败"));
    } finally {
        isLoadingSurvey.value = false;
    }
}

function closeSurvey() {
    selectedSurvey.value = null;
}

function setSurveyAnswer(questionNo: string, optionCode: string) {
    surveyAnswers.value = {
        ...surveyAnswers.value,
        [questionNo]: optionCode,
    };
}

async function submitSurvey() {
    if (
        !selectedSurvey.value ||
        !canSubmitSurvey.value ||
        !hasActiveUser.value
    ) {
        return;
    }
    isSubmittingSurvey.value = true;
    try {
        const result = await ApiEmotion.submitScaleTest(
            selectedSurvey.value.code,
            {
                userId: activeUserId.value,
                answers: surveyQuestions.value.map((question) => ({
                    questionNo: question.questionNo,
                    optionCode: surveyAnswers.value[question.questionNo]!,
                })),
            },
        );
        surveyResult.value = result;
        scaleLatestMap.value = {
            ...scaleLatestMap.value,
            [selectedSurvey.value.code]: result,
        };
        scaleHistory.value = [result, ...scaleHistory.value];
        showToast("量表结果已同步");
    } catch (error) {
        console.error("提交心理量表失败", error);
        showToast(
            resolveEmotionErrorMessage(error, "量表提交失败，请稍后重试"),
        );
    } finally {
        isSubmittingSurvey.value = false;
    }
}

function toMeditationItem(resource: WellnessMediaResourceVO): MeditationItem {
    const item: MeditationItem = {
        emoji: meditationIcon(resource),
        title: cleanMediaText(resource.mediaName) || "冥想引导",
        dur: buildMediaMeta(resource, "冥想音频"),
        mediaUrl: resource.mediaUrl,
        source: resource,
    };
    if (resource.id !== undefined && resource.id !== null) {
        item.id = resource.id;
    }
    return item;
}

function meditationIcon(resource: WellnessMediaResourceVO) {
    const text = `${resource.mediaName} ${resource.mediaCategory} ${resource.description}`;
    if (/呼吸|breath|478|4-7-8/i.test(text)) return "🌬️";
    if (/身体|扫描|body/i.test(text)) return "🌸";
    if (/晨|唤醒|morning/i.test(text)) return "🌅";
    if (/睡|夜|sleep/i.test(text)) return "🌙";
    return "🧘";
}

function buildMediaMeta(resource: WellnessMediaResourceVO, fallback: string) {
    const description = cleanMediaText(resource.description);
    const category = cleanMediaText(resource.mediaCategory) || fallback;
    const playableText = resource.mediaUrl ? "可播放" : "暂无播放地址";
    return [description || category, playableText].filter(Boolean).join(" · ");
}

function cleanMediaText(value: unknown) {
    if (value == null) return "";
    const text = String(value).trim();
    return text === "##default" ? "" : text;
}

function meditationKey(meditation: MeditationItem) {
    return `${meditation.id ?? meditation.title}`;
}

async function loadMeditations() {
    isLoadingMeditations.value = true;
    meditationError.value = "";
    try {
        const resources = await ApiWellnessMedia.getMeditationAudio();
        meditations.value = resources.map(toMeditationItem);
    } catch (error) {
        console.error("读取冥想音频失败", error);
        meditations.value = [];
        meditationError.value = "冥想音频同步失败，请稍后重试";
    } finally {
        isLoadingMeditations.value = false;
    }
}

function stopMeditationAudio() {
    activeMeditationAudio.value?.pause();
    activeMeditationAudio.value = null;
    activeMeditation.value = "";
}

async function toggleMeditation(meditation: MeditationItem) {
    const key = meditationKey(meditation);
    if (activeMeditation.value === key) {
        stopMeditationAudio();
        return;
    }

    if (!meditation.mediaUrl) {
        showToast("该冥想音频暂无播放地址");
        return;
    }

    stopMeditationAudio();
    activeMeditation.value = key;

    if (typeof Audio === "undefined") return;

    const player = new Audio(meditation.mediaUrl);
    activeMeditationAudio.value = player;
    player.onended = () => {
        if (activeMeditationAudio.value === player) {
            activeMeditationAudio.value = null;
        }
        activeMeditation.value = "";
    };
    player.onerror = () => {
        if (activeMeditationAudio.value === player) {
            activeMeditationAudio.value = null;
        }
        activeMeditation.value = "";
        showToast("冥想音频加载失败，请稍后重试");
    };

    try {
        await player.play();
    } catch (error) {
        console.error("播放冥想音频失败", error);
        if (activeMeditationAudio.value === player) {
            activeMeditationAudio.value = null;
        }
        activeMeditation.value = "";
        showToast("冥想音频播放失败，请检查资源地址");
    }
}

function buildRecentMoodDays(source: DayEmotionVO[]) {
    const byDate = new Map(source.map((item) => [item.recordDate, item]));
    return Array.from({ length: 17 }, (_, index) => {
        const date = toISODate(addDays(todayDate, index - 16));
        const record = byDate.get(date);
        return {
            date,
            score: clampMoodScore(record?.emotionScore ?? 0),
            emotionText: record?.emotionText ?? "",
        };
    });
}

function moodLabelFromScore(value: number) {
    const rounded = Math.round(value);
    return moods.find((item) => item.score === rounded)?.label ?? "";
}

function clampMoodScore(value: number) {
    const normalized = Math.round(Number(value));
    if (!Number.isFinite(normalized) || normalized <= 0) return 0;
    if (normalized > 5) return 5;
    return normalized;
}

function formatScore(value: number | undefined) {
    if (typeof value !== "number" || Number.isNaN(value)) return "--";
    return value.toFixed(1).replace(/\.0$/, "");
}

function formatDateText(value: string | undefined) {
    if (!value) return "最近";
    return value.split("T")[0] ?? value;
}

function showToast(message: string) {
    toastMessage.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastVisible.value = true;
    toastTimer = setTimeout(() => {
        toastVisible.value = false;
    }, 2200);
}

function resolveEmotionErrorMessage(error: unknown, fallback: string) {
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

function padTime(value: number) {
    return String(value).padStart(2, "0");
}

function toISODate(date: Date) {
    return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(
        date.getDate(),
    )}`;
}

function startOfLocalDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + amount,
    );
}

function isValidUserId(value: number) {
    return Number.isFinite(value) && value > 0;
}

onMounted(() => {
    void loadEmotionTrend();
    void preloadScaleLatest();
    void loadMeditations();
});

watch(activeUserId, (userId) => {
    if (!isValidUserId(userId)) return;
    void loadEmotionTrend();
    void preloadScaleLatest();
});

onBeforeUnmount(() => {
    if (toastTimer) clearTimeout(toastTimer);
    stopMeditationAudio();
});
</script>

<style scoped lang="scss">
.emotion-panel {
    position: relative;
}
.save-toast {
    position: fixed;
    top: 92px;
    left: 50%;
    z-index: 1001;
    transform: translateX(-50%);
    padding: 10px 18px;
    background: var(--jade);
    color: white;
    border-radius: 999px;
    box-shadow: var(--shadow-lg);
    font-size: 13px;
}
.toast-pop-enter-active,
.toast-pop-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}
.toast-pop-enter-from,
.toast-pop-leave-to {
    opacity: 0;
    transform: translate(-50%, -12px);
}
.mood-picker {
    background: linear-gradient(135deg, #f0e5f4 0%, #fdf8ff 100%);
    border-radius: 16px;
    padding: 28px;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.45);
    animation: cardRise 0.28s ease both;
}
.eyebrow {
    font-size: 12px;
    color: var(--ink-muted);
    letter-spacing: 2px;
}
.mood-row {
    display: flex;
    justify-content: space-around;
    margin: 16px 0;
}
.mood-emoji {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    background: var(--paper);
    border-radius: 50%;
    cursor: pointer;
    transition:
        transform 0.2s,
        border-color 0.2s,
        background-color 0.2s;
    border: 2px solid transparent;
    font-family: inherit;
}
.mood-emoji:hover {
    transform: scale(1.1);
}
.mood-emoji.selected {
    border-color: var(--gold);
    background: var(--gold-soft);
}
.mood-labels {
    display: flex;
    justify-content: space-around;
    font-size: 11px;
    color: var(--ink-muted);
}
.mood-labels span {
    width: 56px;
    text-align: center;
}
.keyword-box {
    background: var(--paper);
    border-radius: 10px;
    padding: 12px;
    margin-top: 16px;
}
.keyword-title {
    font-size: 13px;
    color: var(--ink-muted);
    margin-bottom: 8px;
}
.keyword-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.mood-tag {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    border: none;
    font-family: inherit;
    cursor: pointer;
}
.mood-tag.filled {
    background: var(--gold);
    color: white;
}
.mood-tag.add {
    background: var(--cream);
    color: var(--ink-muted);
    border: 1px solid var(--line);
    cursor: pointer;
}
.keyword-input {
    width: 96px;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 4px 10px;
    font-family: inherit;
    font-size: 12px;
    outline: none;
}
.keyword-input:focus {
    border-color: var(--gold);
}
.mood-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 16px;
}
.status-note {
    color: var(--ink-muted);
    font-size: 12px;
}
.avg-text {
    font-size: 12px;
    color: var(--ink-muted);
}
.avg-text strong {
    color: var(--gold);
}
.mood-trend {
    height: 120px;
    margin-top: 12px;
}
.mood-trend svg {
    width: 100%;
    height: 100%;
}
.chart-dot {
    fill: var(--gold);
    stroke: var(--paper);
    stroke-width: 1.5;
}
.chart-dot.empty {
    fill: var(--line);
    opacity: 0.5;
}
.trend-insight {
    margin-top: 12px;
    padding: 10px;
    background: var(--gold-soft);
    border-radius: 8px;
    font-size: 13px;
    color: var(--ink);
}
.trend-insight strong {
    color: var(--gold);
}
.secondary-grid {
    margin-top: 20px;
}
.meditation-state {
    min-height: 112px;
    display: grid;
    place-items: center;
    gap: 10px;
    border: 1px dashed rgba(96, 122, 158, 0.22);
    border-radius: 12px;
    background: color-mix(in srgb, var(--moon-soft) 48%, var(--paper));
    color: var(--ink-muted);
    font-size: 13px;
    text-align: center;
}
.meditation-state.error {
    color: var(--cinnabar);
}
.meditation-state button {
    border: 1px solid var(--moon);
    border-radius: 999px;
    background: transparent;
    color: var(--moon);
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    padding: 5px 12px;
}
.meditation-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: linear-gradient(90deg, var(--moon-soft), transparent);
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    text-align: left;
    font-family: inherit;
}
.meditation-row:hover,
.meditation-row.active {
    transform: translateX(4px);
    box-shadow: var(--shadow);
}
.meditation-row.disabled {
    cursor: not-allowed;
    opacity: 0.58;
}
.meditation-row.disabled:hover {
    transform: none;
    box-shadow: none;
}
.med-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--moon);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}
.med-info {
    flex: 1;
}
.med-title {
    font-size: 14px;
    font-weight: 600;
}
.med-dur {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
}
.play-state {
    color: var(--moon);
    font-size: 12px;
    font-weight: 600;
}
.survey-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.survey-card {
    padding: 16px;
    border-radius: 12px;
    background: var(--paper-warm);
    border: 1px solid var(--line);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-family: inherit;
    color: var(--ink);
}
.survey-card:hover {
    border-color: var(--gold);
}
.survey-name {
    font-weight: 600;
    margin-bottom: 4px;
}
.survey-desc {
    font-size: 12px;
    color: var(--ink-muted);
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
.primary-grid {
    grid-template-columns: 1fr 1.2fr;
}
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}
.emotion-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.34);
}
.emotion-dialog {
    position: relative;
    width: min(620px, 100%);
    max-height: calc(100vh - 48px);
    overflow: auto;
    padding: 28px;
    border-radius: 18px;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    box-shadow: 0 24px 60px rgba(44, 54, 57, 0.22);
}
.emotion-dialog h3 {
    font-family: "STKaiti", serif;
    font-size: 24px;
    color: var(--ink);
}
.emotion-dialog p {
    margin: 8px 0 16px;
    color: var(--ink-muted);
    font-size: 13px;
}
.survey-state {
    padding: 18px;
    border-radius: 10px;
    background: var(--paper-warm);
    color: var(--ink-muted);
    font-size: 13px;
    text-align: center;
}
.survey-questions {
    display: grid;
    gap: 12px;
}
.survey-question {
    display: grid;
    gap: 8px;
    color: var(--ink);
    font-size: 13px;
}
.survey-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.survey-option {
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    padding: 6px 12px;
}
.survey-option.active,
.survey-option:hover {
    border-color: var(--gold);
    background: var(--gold-soft);
    color: var(--gold-deep);
}
.survey-result {
    display: grid;
    gap: 4px;
    margin: 16px 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--gold-soft);
    color: var(--gold-deep);
    font-size: 13px;
}
.survey-result strong {
    color: var(--ink);
    font-size: 15px;
}
.survey-result p {
    margin: 0;
    color: var(--gold-deep);
}
.survey-history {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}
.survey-history span {
    border-radius: 999px;
    background: var(--paper-warm);
    color: var(--ink-muted);
    font-size: 12px;
    padding: 5px 10px;
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
.btn:hover:not(:disabled) {
    background: var(--ink);
    transform: translateY(-1px);
}
.btn:disabled {
    cursor: not-allowed;
    opacity: 0.58;
}
.emotion-modal-enter-active,
.emotion-modal-leave-active {
    transition: opacity 0.22s ease;
}
.emotion-modal-enter-active .emotion-dialog,
.emotion-modal-leave-active .emotion-dialog {
    transition: transform 0.22s ease;
}
.emotion-modal-enter-from,
.emotion-modal-leave-to {
    opacity: 0;
}
.emotion-modal-enter-from .emotion-dialog,
.emotion-modal-leave-to .emotion-dialog {
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
    .primary-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .row,
    .mood-actions {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
