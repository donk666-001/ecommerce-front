<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <div class="hub">
            <!-- Hero -->
            <section class="hero">
                <div class="hero-text">
                    <div class="hero-label font-serif">
                        YǍNG SHĒNG ZHÌ KÙ · 顺应节气 调和阴阳
                    </div>
                    <h1 class="font-serif">养生智库</h1>
                    <p class="hero-sub">
                        集二十四节气、睡眠作息、经期管理、中医养生、情绪疗愈与个性推荐于一体
                    </p>
                </div>
                <div class="hero-meta">
                    <button
                        class="meta-item meta-button"
                        type="button"
                        @click="switchTab('solar-term')"
                    >
                        🌿 今日节气 <strong>{{ seasonalMetaText }}</strong>
                    </button>
                    <button
                        class="meta-item meta-button"
                        type="button"
                        @click="switchTab('sleep')"
                    >
                        🌙 昨夜睡眠 <strong>{{ sleepMetaText }}</strong>
                    </button>
                    <button
                        class="meta-item meta-button"
                        type="button"
                        @click="switchTab('menstrual')"
                    >
                        🌸 经期阶段 <strong>{{ menstrualMetaText }}</strong>
                    </button>
                    <button
                        class="meta-item meta-button"
                        type="button"
                        @click="switchTab('tcm')"
                    >
                        🍵 体质 <strong>{{ constitutionMetaText }}</strong>
                    </button>
                </div>
            </section>

            <!-- Module Tabs -->
            <div class="tabs">
                <button
                    v-for="tab in tabs"
                    :key="tab.name"
                    class="tab"
                    :class="{ active: activeTab === tab.name }"
                    @click="switchTab(tab.name)"
                >
                    <span class="tab-icon">{{ tab.icon }}</span>
                    {{ tab.label }}
                </button>
            </div>

            <!-- Tab Panels -->
            <Transition name="panel-swap" mode="out-in">
                <div :key="activeTab" class="panel-wrap">
                    <component
                        :is="activeComponent"
                        @constitution-updated="applyHeroConstitution"
                    />
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import SolarTermKnowledge from "@/components/SolarTermKnowledge.vue";
import SleepTracker from "@/components/SleepTracker.vue";
import MenstrualTracker from "@/components/MenstrualTracker.vue";
import TcmWisdom from "@/components/TcmWisdom.vue";
import EmotionHealing from "@/components/EmotionHealing.vue";
import PersonalizedRecommendation from "@/components/PersonalizedRecommendation.vue";
import {
    ApiMenstrual,
    ApiPsychScale,
    ApiSeasonalHealth,
    ApiSleep,
    type MenstrualCalendarDayVO,
    type MenstrualDayDetailVO,
    type MenstrualPredictVO,
    type PsychScaleLatestVO,
    type SeasonalHealthDTO,
    type SleepRecordDTO,
} from "@/network";
import {
    addSleepRecordSyncedListener,
    useSleepRecordSync,
    type SleepRecordSyncedDetail,
} from "@/composables/useSleepRecordSync";
import { useUserStore } from "@/store";

const CONSTITUTION_SCALE_CODE = "CONSTITUTION";
const activeTab = ref("solar-term");
const userStore = useUserStore();
const todayDate = startOfLocalDay(new Date());
const todayISO = toISODate(todayDate);
const yesterdayISO = toISODate(addDays(todayDate, -1));
const seasonalHealth = ref<SeasonalHealthDTO | null>(null);
const sleepRecord = ref<SleepRecordDTO | null>(null);
const menstrualPredict = ref<MenstrualPredictVO | null>(null);
const menstrualToday = ref<MenstrualCalendarDayVO | null>(null);
const menstrualDayDetail = ref<MenstrualDayDetailVO | null>(null);
const constitutionLatest = ref<PsychScaleLatestVO | null>(null);
const isLoadingSeasonal = ref(false);
const isLoadingSleep = ref(false);
const isLoadingMenstrual = ref(false);
const isLoadingConstitution = ref(false);
let loadedUserId: number | null = null;
let removeHeroSleepSyncedListener: (() => void) | null = null;
const heroSleepSyncOrigin = `wisdom-hero-${Math.random().toString(36).slice(2)}`;

const tabs = [
    { name: "solar-term", icon: "🌿", label: "节气养生" },
    { name: "sleep", icon: "🌙", label: "睡眠作息" },
    { name: "menstrual", icon: "🌸", label: "经期管理" },
    { name: "tcm", icon: "🍵", label: "中医养生" },
    { name: "emotion", icon: "🫂", label: "情绪疗愈" },
    { name: "recommendation", icon: "✨", label: "个性推荐" },
];

const tabComponents = {
    "solar-term": SolarTermKnowledge,
    sleep: SleepTracker,
    menstrual: MenstrualTracker,
    tcm: TcmWisdom,
    emotion: EmotionHealing,
    recommendation: PersonalizedRecommendation,
};

const activeComponent = computed(
    () => tabComponents[activeTab.value as keyof typeof tabComponents],
);
const activeUserId = computed(() => {
    const loginId = Number(userStore.G_LoginInfo.id);
    const infoId = Number(userStore.G_UserInfo.id);
    return Number.isFinite(loginId) && loginId > 0 ? loginId : infoId;
});
const hasActiveUser = computed(() => isValidUserId(activeUserId.value));
useSleepRecordSync({
    userId: () => activeUserId.value,
    dateISO: () => todayISO,
    enabled: () => hasActiveUser.value,
    intervalMs: 5000,
    origin: heroSleepSyncOrigin,
    onRecord: (record) => applyHeroSyncedSleepRecord(record),
    onError: (error) => {
        console.error("首页睡眠数据监听失败", error);
    },
});
const seasonalMetaText = computed(() => {
    if (isLoadingSeasonal.value && !seasonalHealth.value) return "同步中";
    const term = seasonalHealth.value?.solarTerm;
    if (!term?.termName) return "暂无数据";

    const dayIndex = calcTermDayIndex(seasonalHealth.value);
    return dayIndex ? `${term.termName}·第${dayIndex}日` : term.termName;
});
const sleepMetaText = computed(() => {
    if (!hasActiveUser.value) return "登录后同步";
    if (isLoadingSleep.value && !sleepRecord.value) return "同步中";
    const minutes = getSleepDurationMinutes(sleepRecord.value);
    return minutes > 0 ? formatSleepDuration(minutes) : "暂无记录";
});
const menstrualMetaText = computed(() => {
    if (!hasActiveUser.value) return "登录后同步";
    if (isLoadingMenstrual.value && !menstrualToday.value) return "同步中";

    const phase =
        resolveMenstrualPhase(
            menstrualDayDetail.value,
            menstrualToday.value,
            menstrualPredict.value,
        ) || "暂无记录";
    const cycleDay = calcCycleDay(menstrualPredict.value);
    return cycleDay ? `${phase} D${cycleDay}` : phase;
});
const constitutionMetaText = computed(() => {
    if (!hasActiveUser.value) return "登录后同步";
    if (isLoadingConstitution.value && !constitutionLatest.value)
        return "同步中";
    return readConstitutionTitle(constitutionLatest.value) || "暂无记录";
});

function switchTab(name: string) {
    activeTab.value = name;
}

async function loadHeroSeasonalHealth() {
    isLoadingSeasonal.value = true;
    try {
        seasonalHealth.value = await ApiSeasonalHealth.getCurrent();
    } catch (error) {
        console.error("首页节气数据同步失败", error);
        seasonalHealth.value = null;
    } finally {
        isLoadingSeasonal.value = false;
    }
}

async function loadHeroSleep(userId: number) {
    isLoadingSleep.value = true;
    try {
        const todayRecord = await ApiSleep.getRecordByDate(userId, todayISO);
        if (getSleepDurationMinutes(todayRecord) > 0) {
            sleepRecord.value = todayRecord;
            return;
        }

        const yesterdayRecord = await ApiSleep.getRecordByDate(
            userId,
            yesterdayISO,
        );
        sleepRecord.value =
            getSleepDurationMinutes(yesterdayRecord) > 0
                ? yesterdayRecord
                : todayRecord;
    } catch (error) {
        console.error("首页睡眠数据同步失败", error);
        sleepRecord.value = null;
    } finally {
        isLoadingSleep.value = false;
    }
}

function applyHeroSyncedSleepRecord(record: SleepRecordDTO) {
    if (getSleepDurationMinutes(record) > 0) {
        sleepRecord.value = record;
    }
}

function handleHeroSleepRecordSynced(detail: SleepRecordSyncedDetail) {
    if (
        detail.origin === heroSleepSyncOrigin ||
        detail.userId !== activeUserId.value ||
        detail.dateISO !== todayISO
    ) {
        return;
    }

    applyHeroSyncedSleepRecord(detail.record);
}

async function loadHeroMenstrual(userId: number) {
    isLoadingMenstrual.value = true;
    try {
        const [predictResult, calendarResult, detailResult] =
            await Promise.allSettled([
                ApiMenstrual.predict(userId),
                ApiMenstrual.getCalendar(
                    userId,
                    todayDate.getFullYear(),
                    todayDate.getMonth() + 1,
                ),
                ApiMenstrual.getDayDetail(userId, todayISO),
            ]);

        menstrualPredict.value =
            predictResult.status === "fulfilled" ? predictResult.value : null;
        menstrualToday.value =
            calendarResult.status === "fulfilled"
                ? (calendarResult.value.days.find(
                      (day) => normalizeDateString(day.date) === todayISO,
                  ) ?? null)
                : null;
        menstrualDayDetail.value =
            detailResult.status === "fulfilled" ? detailResult.value : null;

        if (predictResult.status === "rejected") {
            console.error("首页经期预测同步失败", predictResult.reason);
        }
        if (calendarResult.status === "rejected") {
            console.error("首页经期日历同步失败", calendarResult.reason);
        }
        if (detailResult.status === "rejected") {
            console.error("首页经期详情同步失败", detailResult.reason);
        }
    } finally {
        isLoadingMenstrual.value = false;
    }
}

async function loadHeroConstitution(userId: number) {
    isLoadingConstitution.value = true;
    try {
        constitutionLatest.value = await ApiPsychScale.getScaleLatest(
            CONSTITUTION_SCALE_CODE,
            userId,
        );
    } catch (error) {
        console.error("首页体质测试结果同步失败", error);
        constitutionLatest.value = null;
    } finally {
        isLoadingConstitution.value = false;
    }
}

function loadHeroUserMetrics() {
    if (!hasActiveUser.value) {
        sleepRecord.value = null;
        menstrualPredict.value = null;
        menstrualToday.value = null;
        menstrualDayDetail.value = null;
        constitutionLatest.value = null;
        return;
    }

    loadedUserId = activeUserId.value;
    void loadHeroSleep(activeUserId.value);
    void loadHeroMenstrual(activeUserId.value);
    void loadHeroConstitution(activeUserId.value);
}

function applyHeroConstitution(result: PsychScaleLatestVO | null) {
    constitutionLatest.value = result;
}

function readConstitutionTitle(result: PsychScaleLatestVO | null) {
    if (!result) return "";
    const level = cleanApiText(result.resultLevel);
    if (level) return formatConstitutionName(level);

    const topEntry = Object.entries(result.dimensionScores ?? {})
        .map(([name, score]) => ({
            name: normalizeConstitutionName(name),
            score: Number(score),
        }))
        .filter((item) => item.name && Number.isFinite(item.score))
        .sort((left, right) => right.score - left.score)[0];
    return topEntry ? formatConstitutionName(topEntry.name) : "";
}

function normalizeConstitutionName(value: string) {
    return cleanApiText(value)
        .replace(/体质|质|得分|score/gi, "")
        .trim();
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

function calcTermDayIndex(data: SeasonalHealthDTO | null) {
    const start = parseApiDate(data?.solarTerm.startTime);
    if (!start) return 0;
    const queryDate = parseApiDate(data?.queryTime) ?? todayDate;
    return Math.max(1, diffDays(start, queryDate) + 1);
}

function getSleepDurationMinutes(record: SleepRecordDTO | null) {
    if (!record) return 0;
    const source = record as Record<string, unknown>;
    const minuteValue = readDurationFromFields(
        source,
        [
            "durationMinutes",
            "durationMinute",
            "durationInMinutes",
            "sleepDurationMinutes",
            "sleepMinutes",
            "sleepingMinutes",
            "totalSleepMinutes",
            "totalMinutes",
            "totalDurationMinutes",
            "totalAsleepMinutes",
            "minutes",
        ],
        "minutes",
    );
    if (minuteValue > 0) return minuteValue;

    const hourValue = readDurationFromFields(
        source,
        ["durationHours", "sleepHours", "sleepingHours", "totalHours", "hours"],
        "hours",
    );
    if (hourValue > 0) return hourValue;

    const durationValue = readDurationFromFields(
        source,
        ["sleepDuration", "duration", "totalDuration"],
        "auto",
    );
    if (durationValue > 0) return durationValue;

    const sleepTime = readStringField(source, [
        "sleepTime",
        "bedTime",
        "bedtime",
        "startTime",
    ]);
    const wakeTime = readStringField(source, [
        "wakeTime",
        "getUpTime",
        "endTime",
    ]);
    return sleepTime && wakeTime
        ? calcTimeDuration(
              ensureTimeValue(sleepTime),
              ensureTimeValue(wakeTime),
          )
        : 0;
}

function readDurationFromFields(
    source: Record<string, unknown>,
    keys: string[],
    mode: "minutes" | "hours" | "auto",
) {
    for (const key of keys) {
        const duration = readDurationValue(source[key], mode);
        if (duration > 0) return Math.round(duration);
    }
    return 0;
}

function readDurationValue(value: unknown, mode: "minutes" | "hours" | "auto") {
    if (value == null) return 0;
    if (typeof value === "number" && Number.isFinite(value)) {
        if (mode === "hours") return value * 60;
        if (mode === "minutes") return value;
        return value <= 24 ? value * 60 : value;
    }

    const text = String(value).trim();
    const colonMatch = text.match(/(\d{1,2}):(\d{2})/);
    if (colonMatch) return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);

    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hours|h)/i);
    const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:分钟|分|min|mins|m)/i);
    if (hourMatch || minuteMatch) {
        const hours = hourMatch ? Number(hourMatch[1]) : 0;
        const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
        return hours * 60 + minutes;
    }

    const numeric = Number(text.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    if (mode === "hours") return numeric * 60;
    if (mode === "minutes") return numeric;
    return numeric <= 24 ? numeric * 60 : numeric;
}

function formatSleepDuration(minutes: number) {
    const normalized = Math.max(0, Math.round(minutes));
    const hours = Math.floor(normalized / 60);
    const restMinutes = normalized % 60;
    return `${hours}h ${restMinutes}min`;
}

function resolveMenstrualPhase(
    detail: MenstrualDayDetailVO | null,
    calendarDay: MenstrualCalendarDayVO | null,
    predict: MenstrualPredictVO | null,
) {
    if (detail?.hasRecord) {
        const phase = phaseLabel(detail.cyclePhase);
        if (phase) return phase;
    }

    const calendarPhase = phaseLabel(calendarDay?.cyclePhase ?? 0);
    if (calendarPhase) return calendarPhase;

    const phaseFromLabel = phaseLabelFromText(calendarDay?.dayLabel);
    if (phaseFromLabel) return phaseFromLabel;

    return inferPhaseFromPredict(predict);
}

function inferPhaseFromPredict(predict: MenstrualPredictVO | null) {
    const cycleDay = calcCycleDay(predict);
    if (!cycleDay) return "";
    const averageCycle = normalizeRange(predict?.averageCycleDays, 15, 60, 28);
    const averagePeriod = normalizeRange(predict?.averagePeriodDays, 1, 10, 5);
    const ovulationStart = Math.max(averagePeriod + 1, averageCycle - 16);
    const ovulationEnd = Math.min(averageCycle, averageCycle - 12);

    if (cycleDay <= averagePeriod) return "经期";
    if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) return "排卵期";
    if (cycleDay > ovulationEnd) return "黄体期";
    return "卵泡期";
}

function calcCycleDay(predict: MenstrualPredictVO | null) {
    const lastStart = parseApiDate(predict?.lastPeriodStartDate);
    if (!lastStart) return 0;
    const daysFromStart = diffDays(lastStart, todayDate);
    if (daysFromStart < 0) return 0;

    const averageCycle = normalizeRange(predict?.averageCycleDays, 15, 60, 0);
    if (averageCycle && daysFromStart >= averageCycle) {
        return (daysFromStart % averageCycle) + 1;
    }
    return daysFromStart + 1;
}

function phaseLabel(value: number) {
    const labels: Record<number, string> = {
        1: "经期",
        2: "卵泡期",
        3: "排卵期",
        4: "黄体期",
    };
    return labels[Number(value)] ?? "";
}

function phaseLabelFromText(value: string | undefined) {
    if (!value) return "";
    if (/经期/.test(value) && !/预测|预计/.test(value)) return "经期";
    if (/卵泡/.test(value)) return "卵泡期";
    if (/排卵/.test(value)) return "排卵期";
    if (/黄体/.test(value)) return "黄体期";
    return "";
}

function normalizeRange(
    value: number | undefined,
    min: number,
    max: number,
    fallback: number,
) {
    return typeof value === "number" &&
        Number.isFinite(value) &&
        value >= min &&
        value <= max
        ? Math.round(value)
        : fallback;
}

function readStringField(source: Record<string, unknown>, keys: string[]) {
    const value = keys.map((key) => source[key]).find((item) => item != null);
    return typeof value === "string" && value.trim() ? value.trim() : "";
}

function ensureTimeValue(value: string) {
    const date = parseDateTime(value);
    if (date)
        return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;

    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) return "";
    return `${padTime(Number(match[1]))}:${padTime(Number(match[2]))}`;
}

function calcTimeDuration(start: string, end: string) {
    if (!start || !end) return 0;
    const [startHour = 0, startMinute = 0] = start.split(":").map(Number);
    const [endHour = 0, endMinute = 0] = end.split(":").map(Number);
    let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (minutes <= 0) minutes += 24 * 60;
    return minutes;
}

function normalizeDateString(value: string | undefined) {
    if (!value) return "";
    return value.split("T")[0] ?? value;
}

function parseApiDate(value: string | undefined) {
    const dateTime = parseDateTime(value);
    if (dateTime) return startOfLocalDay(dateTime);

    const normalized = normalizeDateString(value);
    if (!normalized) return null;
    const [yearText = "", monthText = "", dayText = ""] = normalized.split("-");
    const parsed = new Date(
        Number(yearText),
        Number(monthText) - 1,
        Number(dayText),
    );
    return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
}

function parseDateTime(value: string | undefined) {
    if (!value) return null;
    const normalized = value.trim();
    if (!/[T\s]\d{1,2}:\d{2}/.test(normalized)) return null;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date) {
    return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(
        date.getDate(),
    )}`;
}

function padTime(value: number) {
    return String(value).padStart(2, "0");
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

function diffDays(start: Date, end: Date) {
    const millis =
        startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime();
    return Math.floor(millis / 86400000);
}

function isValidUserId(value: number) {
    return Number.isFinite(value) && value > 0;
}

onMounted(() => {
    removeHeroSleepSyncedListener = addSleepRecordSyncedListener(
        handleHeroSleepRecordSynced,
    );
    void loadHeroSeasonalHealth();
    loadHeroUserMetrics();
});

onBeforeUnmount(() => {
    removeHeroSleepSyncedListener?.();
});

watch(activeUserId, (userId) => {
    if (!isValidUserId(userId)) {
        loadHeroUserMetrics();
        return;
    }
    if (userId !== loadedUserId) loadHeroUserMetrics();
});
</script>

<style scoped lang="scss">
.page-wrapper {
    min-height: 100vh;
}

.hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 40px 80px;
}

// Hero
.hero {
    background: linear-gradient(135deg, #fdfaf3 0%, #f0e8d5 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 20px;
    padding: 36px 40px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;

    &::before {
        content: "養";
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        font-family: "STKaiti", serif;
        font-size: 200px;
        color: var(--gold);
        opacity: 0.1;
        line-height: 1;
        font-weight: 900;
        pointer-events: none;
    }
}

.hero-label {
    font-size: 13px;
    color: var(--gold);
    letter-spacing: 4px;
    margin-bottom: 8px;
}

.hero h1 {
    font-size: 38px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
}

.hero-sub {
    color: var(--ink-muted);
    font-size: 15px;
    max-width: 580px;
}

.hero-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    font-size: 13px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);

    strong {
        color: var(--jade);
        font-weight: 600;
    }
}

.meta-button {
    appearance: none;
    border: none;
    background: transparent;
    padding: 0;
    font: inherit;
    cursor: pointer;
}

.meta-button:hover strong,
.meta-button:focus-visible strong {
    color: var(--gold-deep);
}

.meta-button:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 4px;
    border-radius: 10px;
}

// Tabs
.tabs {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-bottom: 28px;
    background: var(--paper);
    border-radius: 14px;
    padding: 8px;
    box-shadow: var(--shadow);
}

.tab {
    background: transparent;
    border: none;
    padding: 14px 8px;
    cursor: pointer;
    border-radius: 10px;
    font-family: inherit;
    color: var(--ink-muted);
    font-size: 13px;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    &:hover {
        background: var(--cream);
        color: var(--ink);
    }

    &.active {
        background: linear-gradient(135deg, var(--jade), var(--jade-light));
        color: white;
        box-shadow: 0 4px 12px rgba(92, 131, 116, 0.3);
    }
}

.tab-icon {
    font-size: 22px;
    line-height: 1;
}

.panel-wrap {
    min-height: 360px;
}

.panel-swap-enter-active,
.panel-swap-leave-active {
    transition:
        opacity 0.24s ease,
        transform 0.24s ease,
        filter 0.24s ease;
}

.panel-swap-enter-from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
    filter: blur(3px);
}

.panel-swap-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.995);
    filter: blur(2px);
}

@media (max-width: 768px) {
    .hub {
        padding: 20px 16px 60px;
    }
    .hero {
        padding: 24px 20px;
    }
    .hero::before {
        display: none;
    }
    .tabs {
        grid-template-columns: repeat(3, 1fr);
    }
    .hero-meta {
        gap: 12px;
    }
}
</style>
