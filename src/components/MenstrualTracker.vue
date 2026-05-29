<template>
    <div class="menstrual-panel">
        <Transition name="toast-pop">
            <div v-if="toastVisible" class="save-toast">
                {{ toastMessage }}
            </div>
        </Transition>

        <div class="grid-2 primary-grid">
            <section class="cycle-card module-card">
                <div class="cycle-ring">
                    <svg viewBox="0 0 200 200">
                        <circle class="cycle-bg" cx="100" cy="100" r="80" />
                        <circle
                            class="cycle-fg"
                            cx="100"
                            cy="100"
                            r="80"
                            :style="cycleProgressStyle"
                        />
                    </svg>
                    <div class="cycle-num">
                        <div class="big">{{ daysLeftText }}</div>
                        <div class="label">DAYS LEFT</div>
                    </div>
                </div>
                <div class="cycle-kicker">距下次月经</div>
                <div class="cycle-phase">{{ selectedPhaseText }}</div>
                <p class="cycle-advice">{{ predictionAdvice }}</p>

                <div class="predict-stats">
                    <div>
                        <strong>{{ predictStartText }}</strong>
                        <span>预计开始</span>
                    </div>
                    <div>
                        <strong>{{ predictEndText }}</strong>
                        <span>预计结束</span>
                    </div>
                    <div>
                        <strong>{{ confidenceText }}</strong>
                        <span>置信度</span>
                    </div>
                </div>
            </section>

            <section class="card module-card">
                <div class="row">
                    <div class="card-title" style="margin: 0">
                        <span class="dot"></span>{{ calendarTitle }}
                    </div>
                    <div class="month-switch">
                        <button type="button" @click="switchMonth(-1)">
                            ‹
                        </button>
                        <span>{{ visibleMonth }}</span>
                        <button type="button" @click="switchMonth(1)">›</button>
                        <button type="button" @click="goToday">今</button>
                    </div>
                </div>

                <div class="calendar-shell">
                    <div
                        v-if="isLoadingCalendar"
                        class="sync-mask"
                        aria-hidden="true"
                    >
                        <span></span>
                    </div>
                    <div class="calendar">
                        <div
                            v-for="weekday in weekdays"
                            :key="weekday"
                            class="cal-head"
                        >
                            {{ weekday }}
                        </div>
                        <button
                            v-for="day in calDays"
                            :key="day.key"
                            class="cal-day"
                            :class="[
                                day.classes,
                                { selected: selectedDateISO === day.dateISO },
                            ]"
                            type="button"
                            @click="selectDay(day)"
                        >
                            <span class="day-num">{{ day.text }}</span>
                            <span v-if="day.isToday" class="today-badge">
                                今日
                            </span>
                            <span
                                v-else-if="day.hasRecord"
                                class="record-dot"
                                aria-hidden="true"
                            ></span>
                        </button>
                    </div>
                </div>

                <div class="calendar-legend">
                    <span><i class="legend-swatch period"></i>经期</span>
                    <span><i class="legend-swatch follicular"></i>卵泡期</span>
                    <span><i class="legend-swatch ovul"></i>排卵期</span>
                    <span><i class="legend-swatch luteal"></i>黄体期</span>
                    <span><i class="legend-swatch predict"></i>预测经期</span>
                    <span><i class="legend-swatch recorded"></i>已记录</span>
                </div>
                <div class="selected-day-panel">
                    <strong>{{ selectedDayText }}</strong>
                    <span>{{ selectedDayAdvice }}</span>
                </div>
            </section>
        </div>

        <section class="card module-card record-card">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>{{ recordPanelTitle }}
                </div>
                <button
                    class="btn btn-ghost"
                    type="button"
                    :disabled="isSavingRecord || !hasActiveUser"
                    @click="saveSymptoms"
                >
                    {{ isSavingRecord ? "保存中" : saveButtonText }}
                </button>
            </div>

            <p v-if="!hasActiveUser" class="status-note">
                登录后可同步经期记录。
            </p>

            <div class="phase-pick">
                <span class="section-label">周期阶段</span>
                <div class="chip-row">
                    <button
                        v-for="phase in cyclePhaseOptions"
                        :key="phase.value"
                        class="pick-chip"
                        :class="{ active: cyclePhase === phase.value }"
                        type="button"
                        @click="cyclePhase = phase.value"
                    >
                        {{ phase.label }}
                    </button>
                </div>
            </div>

            <div class="symptom-grid">
                <div
                    v-for="symptom in symptomOptions"
                    :key="symptom.value"
                    class="symptom-box"
                    :class="{ on: isSymptomSelected(symptom.value) }"
                >
                    <button
                        class="symptom"
                        type="button"
                        @click="toggleSymptom(symptom.value)"
                    >
                        <span class="emoji">{{ symptom.emoji }}</span>
                        <strong>{{ symptom.name }}</strong>
                    </button>
                    <div
                        v-if="isSymptomSelected(symptom.value)"
                        class="pain-picker"
                    >
                        <button
                            v-for="level in painLevels"
                            :key="level.value"
                            type="button"
                            :class="{
                                active:
                                    selectedPainLevels[symptom.value] ===
                                    level.value,
                            }"
                            @click="setPainLevel(symptom.value, level.value)"
                        >
                            {{ level.label }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="card module-card plans-card">
            <div class="card-title">
                <span class="dot"></span>{{ planSectionTitle }}
            </div>
            <div v-if="isLoadingDetail" class="plan-empty">
                正在同步调养方案...
            </div>
            <div v-else-if="planRows.length > 0" class="grid-3">
                <button
                    v-for="plan in planRows"
                    :key="plan.id"
                    class="tip-row"
                    type="button"
                    @click="selectedPlan = plan"
                >
                    <span class="icon">{{ plan.icon }}</span>
                    <div class="text">
                        <strong>{{ plan.title }}</strong>
                        <br />{{ plan.short }}
                    </div>
                </button>
            </div>
            <div v-else class="plan-empty">
                当前日期暂无后端推荐方案，保存记录后可再次同步。
            </div>
        </section>

        <Teleport to="body">
            <Transition name="plan-modal">
                <div
                    v-if="selectedPlan"
                    class="plan-backdrop"
                    @click.self="selectedPlan = null"
                >
                    <section
                        class="plan-card"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="plan-title"
                    >
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭方案详情"
                            @click="selectedPlan = null"
                        >
                            ×
                        </button>
                        <div class="plan-icon">{{ selectedPlan.icon }}</div>
                        <h3 id="plan-title">{{ selectedPlan.title }}</h3>
                        <p>{{ selectedPlan.detail }}</p>
                        <button
                            class="btn"
                            type="button"
                            @click="selectedPlan = null"
                        >
                            我知道了
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
    ApiMenstrual,
    type MenstrualCalendarDayVO,
    type MenstrualCalendarVO,
    type MenstrualDayDetailVO,
    type MenstrualHealthPlanVO,
    type MenstrualRecordCreatePayload,
} from "@/network";
import { useUserStore } from "@/store";

type CalendarDay = {
    key: string;
    recordId?: number;
    dateISO: string;
    text: string;
    classes: string[];
    dateLabel: string;
    dayLabel: string;
    currentMonth: boolean;
    hasRecord: boolean;
    isToday: boolean;
    cyclePhase: number;
    bodyStatus: number;
    painLevel: number;
};

type SymptomOption = {
    value: number;
    name: string;
    emoji: string;
};

type Plan = {
    id: number;
    icon: string;
    title: string;
    short: string;
    detail: string;
};

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const cyclePhaseOptions = [
    { value: 1, label: "经期" },
    { value: 2, label: "卵泡期" },
    { value: 3, label: "排卵期" },
    { value: 4, label: "黄体期" },
];
const symptomOptions: SymptomOption[] = [
    { value: 1, name: "良好", emoji: "🌿" },
    { value: 2, name: "疲惫", emoji: "😴" },
    { value: 3, name: "腹胀", emoji: "💧" },
    { value: 4, name: "情绪波动", emoji: "😤" },
    { value: 5, name: "腰酸", emoji: "🧘" },
    { value: 6, name: "痛经", emoji: "😣" },
    { value: 7, name: "乏力", emoji: "🍵" },
];
const painLevels = [
    { value: 1, label: "无" },
    { value: 2, label: "轻" },
    { value: 3, label: "中" },
    { value: 4, label: "较重" },
    { value: 5, label: "严重" },
];
const phaseLabelMap: Record<number, string> = {
    1: "经期",
    2: "卵泡期",
    3: "排卵期",
    4: "黄体期",
};
const phaseIconMap: Record<number, string> = {
    1: "♨",
    2: "🌿",
    3: "🌕",
    4: "🍲",
};

const userStore = useUserStore();
const todayDate = startOfLocalDay(new Date());
const todayISO = toISODate(todayDate);
const visibleMonthDate = ref(
    new Date(todayDate.getFullYear(), todayDate.getMonth(), 1),
);
const selectedDateISO = ref(todayISO);
const calendarData = ref<MenstrualCalendarVO | null>(null);
const dayDetail = ref<MenstrualDayDetailVO | null>(null);
const prediction = ref<Awaited<ReturnType<typeof ApiMenstrual.predict>> | null>(
    null,
);
const cyclePhase = ref(1);
const selectedPainLevels = ref<Record<number, number>>({});
const selectedPlan = ref<Plan | null>(null);
const isLoadingCalendar = ref(false);
const isLoadingDetail = ref(false);
const isLoadingPrediction = ref(false);
const isSavingRecord = ref(false);
const toastVisible = ref(false);
const toastMessage = ref("经期记录已保存");
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let loadedUserId: number | null = null;

const activeUserId = computed(() => {
    const loginId = Number(userStore.G_LoginInfo.id);
    const infoId = Number(userStore.G_UserInfo.id);
    return Number.isFinite(loginId) && loginId > 0 ? loginId : infoId;
});
const hasActiveUser = computed(() => isValidUserId(activeUserId.value));
const visibleYear = computed(() => visibleMonthDate.value.getFullYear());
const visibleMonthNumber = computed(
    () => visibleMonthDate.value.getMonth() + 1,
);
const visibleMonth = computed(
    () => `${visibleYear.value}年${visibleMonthNumber.value}月`,
);
const calendarTitle = computed(
    () => `${visibleMonthNumber.value} 月 · 周期日历`,
);
const calDays = computed<CalendarDay[]>(() => {
    const days = calendarData.value?.days;
    if (Array.isArray(days) && days.length) {
        return days.map(normalizeCalendarDay);
    }
    return buildCalendarShell(visibleMonthDate.value);
});
const selectedDay = computed(
    () =>
        calDays.value.find((day) => day.dateISO === selectedDateISO.value) ??
        normalizeCalendarDay({
            date: selectedDateISO.value,
            currentMonth: true,
            hasRecord: false,
            cyclePhase: 0,
            bodyStatus: 0,
            painLevel: 0,
            dayLabel: "",
        }),
);
const selectedDayText = computed(() => formatDateCN(selectedDateISO.value));
const selectedPhaseText = computed(() => {
    const label = dayDetail.value?.hasRecord
        ? phaseLabel(dayDetail.value.cyclePhase)
        : selectedDay.value.dayLabel || phaseLabel(cyclePhase.value);
    return label || "未记录";
});
const selectedDayAdvice = computed(() => {
    if (isLoadingDetail.value) return "正在同步当日详情与推荐方案。";
    if (dayDetail.value?.hasRecord) {
        const statusText = bodyStatusSummary(
            dayDetail.value.bodyStatuses,
            dayDetail.value.bodyStatus,
            dayDetail.value.painLevel,
        );
        return statusText
            ? `已记录：${statusText}`
            : `已记录${phaseLabel(dayDetail.value.cyclePhase)}。`;
    }
    if (selectedDay.value.dayLabel) return selectedDay.value.dayLabel;
    if (selectedDay.value.classes.includes("predict"))
        return "预测经期，适合提前安排温热饮食、睡眠和用品准备。";
    if (selectedDay.value.classes.includes("ovul"))
        return "排卵期，适合记录体温、分泌物和精力变化。";
    if (selectedDay.value.classes.includes("follicular"))
        return "卵泡期，身体恢复和精力回升，可安排轻量运动与均衡饮食。";
    if (selectedDay.value.classes.includes("luteal"))
        return "黄体期，留意情绪、睡眠和水肿变化，少甜腻并放慢节奏。";
    if (selectedDay.value.classes.includes("period"))
        return "经期中，注意保暖，运动以舒缓拉伸为主。";
    return "普通周期日，可保持规律作息与轻量运动。";
});
const recordPanelTitle = computed(() => `${selectedDayText.value}身体记录`);
const saveButtonText = computed(() =>
    dayDetail.value?.hasRecord ? "更新记录" : "保存记录",
);
const daysLeft = computed(() => {
    const nextStart = parseApiDate(
        prediction.value?.predictedNextPeriodStartDate,
    );
    if (!nextStart) return null;
    return Math.max(0, diffDays(todayDate, nextStart));
});
const daysLeftText = computed(() =>
    daysLeft.value === null ? "--" : String(daysLeft.value),
);
const cycleProgressStyle = computed(() => {
    const circumference = 502;
    const averageCycle = Math.max(1, prediction.value?.averageCycleDays || 28);
    const left = daysLeft.value ?? averageCycle;
    const progress = Math.min(1, Math.max(0, 1 - left / averageCycle));
    return {
        strokeDashoffset: String(circumference * (1 - progress)),
    };
});
const predictStartText = computed(() =>
    shortDateText(prediction.value?.predictedNextPeriodStartDate),
);
const predictEndText = computed(() =>
    shortDateText(prediction.value?.predictedNextPeriodEndDate),
);
const confidenceText = computed(() => {
    if (prediction.value?.unavailableReason) return "样本不足";
    const level = prediction.value?.confidenceLevel?.trim();
    if (level) return level;
    const score = prediction.value?.confidenceScore;
    if (typeof score !== "number" || Number.isNaN(score) || score <= 0)
        return "待积累";
    return `${Math.round(score <= 1 ? score * 100 : score)}%`;
});
const predictionAdvice = computed(() => {
    if (isLoadingPrediction.value) return "正在同步经期预测。";
    if (prediction.value?.unavailableReason) {
        return `${prediction.value.unavailableReason}。请至少补录两次不同周期的经期开始日。`;
    }
    if (!prediction.value?.predictedNextPeriodStartDate) {
        return "记录几次经期开始日后，系统会给出更稳定的下次经期预测。";
    }
    const averageCycle = prediction.value.averageCycleDays;
    const averagePeriod = prediction.value.averagePeriodDays;
    const parts = [
        averageCycle ? `平均周期 ${averageCycle} 天` : "",
        averagePeriod ? `平均经期 ${averagePeriod} 天` : "",
    ].filter(Boolean);
    return parts.length
        ? `${parts.join("，")}。可结合当日记录微调调养节奏。`
        : "已同步下次经期预测，可结合当日记录微调调养节奏。";
});
const planSectionTitle = computed(() => `${selectedPhaseText.value}养生方案`);
const planRows = computed<Plan[]>(() => {
    const recommendations = dayDetail.value?.recommendations;
    if (!Array.isArray(recommendations)) return [];
    return [...recommendations]
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(toPlan);
});

function normalizeCalendarDay(day: MenstrualCalendarDayVO): CalendarDay {
    const dateISO = normalizeDateString(day.date) || selectedDateISO.value;
    const date = parseISODate(dateISO);
    const text = date ? String(date.getDate()) : dateISO.slice(-2);
    const label = day.dayLabel || "";
    const classes = calendarDayClasses(day, label, dateISO);
    const isToday = dateISO === todayISO;
    if (isToday) classes.push("today");
    const calendarDay: CalendarDay = {
        key: dateISO,
        dateISO,
        text,
        classes,
        dateLabel: formatDateCN(dateISO),
        dayLabel: label,
        currentMonth: Boolean(day.currentMonth),
        hasRecord: Boolean(day.hasRecord),
        isToday,
        cyclePhase: normalizeNumber(day.cyclePhase),
        bodyStatus: normalizeNumber(day.bodyStatus),
        painLevel: normalizeNumber(day.painLevel),
    };
    const recordId = readMenstrualRecordId(day);
    if (recordId != null) calendarDay.recordId = recordId;
    return calendarDay;
}

function calendarDayClasses(
    day: MenstrualCalendarDayVO,
    label: string,
    dateISO: string,
) {
    const classes: string[] = [];
    const phase = normalizeNumber(day.cyclePhase);
    const isPeriod = phase === 1 || (/经期/.test(label) && !/预测/.test(label));
    const isFollicular = phase === 2 || /卵泡/.test(label);
    const isOvulation = phase === 3 || /排卵/.test(label);
    const isLuteal = phase === 4 || /黄体/.test(label);
    const isPredict =
        isPredictedPeriodDate(dateISO) ||
        /预测/.test(label) ||
        /预计/.test(label);

    if (!day.currentMonth) classes.push("muted");
    if (isPredict && (isPeriod || isFollicular || isOvulation || isLuteal)) {
        classes.push("overlap");
    } else if (isPeriod) classes.push("period");
    else if (isFollicular) classes.push("follicular");
    else if (isOvulation) classes.push("ovul");
    else if (isLuteal) classes.push("luteal");
    else if (isPredict) classes.push("predict");
    if (
        day.hasRecord &&
        !classes.some((item) =>
            ["period", "follicular", "ovul", "luteal", "overlap"].includes(
                item,
            ),
        )
    ) {
        classes.push("recorded");
    }
    return classes;
}

function buildCalendarShell(monthDate: Date) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days: CalendarDay[] = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
        const day = prevMonthDays - index;
        const date = new Date(year, month - 1, day);
        days.push(shellDay(date, false));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push(shellDay(new Date(year, month, day), true));
    }

    const nextCount = 42 - days.length;
    for (let day = 1; day <= nextCount; day += 1) {
        days.push(shellDay(new Date(year, month + 1, day), false));
    }

    return days;
}

function shellDay(date: Date, currentMonth: boolean): CalendarDay {
    const dateISO = toISODate(date);
    const classes = currentMonth ? [] : ["muted"];
    const isToday = dateISO === todayISO;
    if (isPredictedPeriodDate(dateISO)) classes.push("predict");
    if (isToday) classes.push("today");
    return {
        key: dateISO,
        dateISO,
        text: String(date.getDate()),
        classes,
        dateLabel: formatDateCN(dateISO),
        dayLabel: "",
        currentMonth,
        hasRecord: false,
        isToday,
        cyclePhase: 0,
        bodyStatus: 0,
        painLevel: 0,
    };
}

function selectDay(day: CalendarDay) {
    selectedDateISO.value = day.dateISO;
    const date = parseISODate(day.dateISO);
    if (date && !isSameMonth(date, visibleMonthDate.value)) {
        visibleMonthDate.value = new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
        );
        void loadCalendar();
    }
}

function switchMonth(direction: number) {
    const nextMonth = new Date(
        visibleYear.value,
        visibleMonthNumber.value - 1 + direction,
        1,
    );
    visibleMonthDate.value = nextMonth;
    const nextSelected = isSameMonth(todayDate, nextMonth)
        ? todayISO
        : toISODate(nextMonth);
    selectedDateISO.value = nextSelected;
    void loadCalendar();
}

function goToday() {
    visibleMonthDate.value = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1,
    );
    selectedDateISO.value = todayISO;
    void loadCalendar();
}

function isSymptomSelected(value: number) {
    return selectedPainLevels.value[value] !== undefined;
}

function toggleSymptom(value: number) {
    const next = { ...selectedPainLevels.value };
    if (next[value] !== undefined) delete next[value];
    else next[value] = 1;
    selectedPainLevels.value = next;
}

function setPainLevel(status: number, level: number) {
    selectedPainLevels.value = {
        ...selectedPainLevels.value,
        [status]: level,
    };
}

async function saveSymptoms() {
    if (!hasActiveUser.value) {
        showToast("请先登录后再保存经期记录");
        return;
    }
    isSavingRecord.value = true;
    try {
        const payload: MenstrualRecordCreatePayload = {
            userId: activeUserId.value,
            recordDate: selectedDateISO.value,
            cyclePhase: cyclePhase.value,
            bodyStatuses: Object.entries(selectedPainLevels.value).map(
                ([bodyStatus, painLevel]) => ({
                    bodyStatus: Number(bodyStatus),
                    painLevel,
                }),
            ),
        };
        const shouldUpdate =
            dayDetail.value?.hasRecord === true || selectedDay.value.hasRecord;
        try {
            if (shouldUpdate) {
                await ApiMenstrual.updateRecord(
                    await buildMenstrualUpdatePayload(payload),
                );
            } else {
                await ApiMenstrual.createRecord(payload);
            }
        } catch (error) {
            if (shouldUpdate || !isExistingMenstrualRecordError(error)) {
                throw error;
            }
            await ApiMenstrual.updateRecord(
                await buildMenstrualUpdatePayload(payload),
            );
        }
        await Promise.all([
            loadCalendar(),
            loadDayDetail(selectedDateISO.value),
            loadPrediction(),
        ]);
        showToast("经期记录已同步");
    } catch (error) {
        console.error("保存经期记录失败", error);
        showToast("保存失败，请稍后重试");
    } finally {
        isSavingRecord.value = false;
    }
}

function isExistingMenstrualRecordError(error: unknown) {
    if (typeof error !== "object" || error === null) return false;
    const source = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
    };
    const message = [source.message, responseDataText(source.response?.data)]
        .filter(Boolean)
        .join(" ");
    return source.response?.status === 500 && /已存在|更新逻辑/.test(message);
}

async function buildMenstrualUpdatePayload(
    payload: MenstrualRecordCreatePayload,
): Promise<MenstrualRecordCreatePayload> {
    const recordId =
        readMenstrualRecordId(dayDetail.value) ?? selectedDay.value.recordId;
    if (recordId != null) return { ...payload, id: recordId };

    const latestDetail = await ApiMenstrual.getDayDetail(
        payload.userId,
        payload.recordDate,
    );
    dayDetail.value = latestDetail;
    applyDayDetailToForm(latestDetail);

    const latestRecordId = readMenstrualRecordId(latestDetail);
    if (latestRecordId != null) return { ...payload, id: latestRecordId };

    throw new Error("经期记录已存在，但后端未返回记录 ID，无法调用更新接口");
}

function readMenstrualRecordId(
    source:
        | MenstrualCalendarDayVO
        | MenstrualDayDetailVO
        | CalendarDay
        | null
        | undefined,
) {
    if (!source) return undefined;
    const recordSource = source as Record<string, unknown>;
    return normalizeRecordId(
        recordSource.id ??
            recordSource.recordId ??
            recordSource.menstrualRecordId ??
            recordSource.menstrualId ??
            recordSource.record_id,
    );
}

function normalizeRecordId(value: unknown) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) return undefined;
    return numberValue;
}

function responseDataText(data: unknown) {
    if (typeof data === "string") return data;
    if (typeof data !== "object" || data === null) return "";
    if (
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
    ) {
        return (data as { message: string }).message;
    }
    try {
        return JSON.stringify(data);
    } catch {
        return "";
    }
}

async function loadCalendar() {
    if (!hasActiveUser.value) return;
    isLoadingCalendar.value = true;
    try {
        calendarData.value = await ApiMenstrual.getCalendar(
            activeUserId.value,
            visibleYear.value,
            visibleMonthNumber.value,
        );
    } catch (error) {
        console.error("读取经期月历失败", error);
        calendarData.value = null;
        showToast("月历同步失败，请稍后重试");
    } finally {
        isLoadingCalendar.value = false;
    }
}

async function loadDayDetail(dateISO: string) {
    if (!hasActiveUser.value) return;
    isLoadingDetail.value = true;
    try {
        dayDetail.value = await ApiMenstrual.getDayDetail(
            activeUserId.value,
            dateISO,
        );
        applyDayDetailToForm(dayDetail.value);
    } catch (error) {
        console.error("读取经期日详情失败", error);
        dayDetail.value = null;
        selectedPainLevels.value = {};
        showToast("日详情同步失败，请稍后重试");
    } finally {
        isLoadingDetail.value = false;
    }
}

async function loadPrediction() {
    if (!hasActiveUser.value) return;
    isLoadingPrediction.value = true;
    try {
        prediction.value = await ApiMenstrual.predict(activeUserId.value);
    } catch (error) {
        console.error("读取经期预测失败", error);
        prediction.value = null;
    } finally {
        isLoadingPrediction.value = false;
    }
}

async function reloadMenstrualDataForActiveUser() {
    if (!hasActiveUser.value) return;
    if (loadedUserId !== activeUserId.value) {
        calendarData.value = null;
        dayDetail.value = null;
        prediction.value = null;
        selectedPainLevels.value = {};
    }
    loadedUserId = activeUserId.value;
    await Promise.all([
        loadCalendar(),
        loadDayDetail(selectedDateISO.value),
        loadPrediction(),
    ]);
}

function applyDayDetailToForm(detail: MenstrualDayDetailVO) {
    if (!detail.hasRecord) {
        const nextPhase = normalizeNumber(selectedDay.value.cyclePhase) || 1;
        cyclePhase.value = phaseLabelMap[nextPhase] ? nextPhase : 1;
        selectedPainLevels.value = {};
        return;
    }

    const nextPhase =
        normalizeNumber(detail.cyclePhase) ||
        normalizeNumber(selectedDay.value.cyclePhase) ||
        1;
    cyclePhase.value = phaseLabelMap[nextPhase] ? nextPhase : 1;

    const nextLevels: Record<number, number> = {};
    const bodyStatuses = Array.isArray(detail.bodyStatuses)
        ? detail.bodyStatuses
        : [];
    bodyStatuses.forEach((item) => {
        const status = normalizeNumber(item.bodyStatus);
        if (status > 0) nextLevels[status] = clampPainLevel(item.painLevel);
    });

    const singleStatus = normalizeNumber(detail.bodyStatus);
    if (singleStatus > 0 && nextLevels[singleStatus] === undefined) {
        nextLevels[singleStatus] = clampPainLevel(detail.painLevel);
    }

    selectedPainLevels.value = nextLevels;
}

function toPlan(plan: MenstrualHealthPlanVO): Plan {
    return {
        id: plan.id,
        icon: phaseIconMap[plan.cyclePhase] ?? "🌸",
        title: plan.planName || "调养方案",
        short: compactText(plan.planContent, 24),
        detail: plan.planContent || "暂无方案详情。",
    };
}

function bodyStatusSummary(
    items: { bodyStatus: number; painLevel: number }[],
    bodyStatus: number,
    painLevel: number,
) {
    const source =
        items.length > 0
            ? items
            : [{ bodyStatus, painLevel }].filter((item) => item.bodyStatus > 0);
    return source
        .map((item) => {
            const symptom = symptomOptions.find(
                (option) => option.value === item.bodyStatus,
            );
            const name = symptom?.name || `状态 ${item.bodyStatus}`;
            return `${name}${painLabel(item.painLevel)}`;
        })
        .join("、");
}

function phaseLabel(value: number) {
    return phaseLabelMap[normalizeNumber(value)] ?? "";
}

function painLabel(value: number) {
    const normalized = clampPainLevel(value);
    return painLevels.find((level) => level.value === normalized)?.label ?? "";
}

function clampPainLevel(value: number) {
    const normalized = normalizeNumber(value);
    if (normalized <= 1) return 1;
    if (normalized >= 5) return 5;
    return normalized;
}

function showToast(message: string) {
    toastMessage.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastVisible.value = true;
    toastTimer = setTimeout(() => {
        toastVisible.value = false;
    }, 2200);
}

function compactText(value: string, maxLength: number) {
    const text = value.trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

function normalizeNumber(value: unknown) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeDateString(value: string | undefined) {
    if (!value) return "";
    return value.split("T")[0] ?? value;
}

function parseApiDate(value: string | undefined) {
    const normalized = normalizeDateString(value);
    return normalized ? parseISODate(normalized) : null;
}

function parseISODate(value: string) {
    const [year = "", month = "", day = ""] = value.split("-");
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isPredictedPeriodDate(dateISO: string) {
    const start = normalizeDateString(
        prediction.value?.predictedNextPeriodStartDate,
    );
    const end = normalizeDateString(
        prediction.value?.predictedNextPeriodEndDate,
    );
    if (!start || !end) return false;
    return dateISO >= start && dateISO <= end;
}

function toISODate(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateCN(value: string) {
    const date = parseISODate(value);
    if (!date) return value;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function shortDateText(value: string | undefined) {
    const date = parseApiDate(value);
    if (!date) return "--";
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function startOfLocalDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(start: Date, end: Date) {
    const millis =
        startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime();
    return Math.ceil(millis / 86400000);
}

function isSameMonth(left: Date, right: Date) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth()
    );
}

onMounted(() => {
    void reloadMenstrualDataForActiveUser();
});

watch(activeUserId, (userId) => {
    if (isValidUserId(userId) && userId !== loadedUserId) {
        void reloadMenstrualDataForActiveUser();
    }
});

watch(selectedDateISO, (dateISO) => {
    void loadDayDetail(dateISO);
});

onBeforeUnmount(() => {
    if (toastTimer) clearTimeout(toastTimer);
});

function isValidUserId(value: number) {
    return Number.isFinite(value) && value > 0;
}
</script>

<style scoped lang="scss">
.menstrual-panel {
    position: relative;
}

.module-card {
    box-shadow: var(--shadow-lg);
    animation: cardRise 0.28s ease both;
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

.cycle-card {
    background: linear-gradient(135deg, var(--pink-soft) 0%, var(--paper) 100%);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    border: 1px solid rgba(232, 223, 208, 0.45);
}
.cycle-ring {
    width: 180px;
    height: 180px;
    margin: 0 auto 16px;
    position: relative;
}
.cycle-ring svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}
.cycle-ring circle {
    fill: none;
    stroke-width: 10;
}
.cycle-bg {
    stroke: var(--pink-soft);
}
.cycle-fg {
    stroke: var(--pink);
    stroke-linecap: round;
    stroke-dasharray: 502;
    transition: stroke-dashoffset 0.35s ease;
}
.cycle-num {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.cycle-num .big {
    font-family: "STKaiti", serif;
    font-size: 48px;
    font-weight: 600;
    color: var(--pink);
}
.cycle-num .label {
    font-size: 12px;
    color: var(--ink-muted);
    letter-spacing: 2px;
}
.cycle-kicker {
    font-size: 14px;
    color: var(--ink);
    font-weight: 600;
}
.cycle-phase {
    display: inline-block;
    padding: 6px 16px;
    background: var(--pink);
    color: white;
    border-radius: 14px;
    font-size: 13px;
    margin-top: 8px;
}
.cycle-advice {
    margin-top: 16px;
    font-size: 13px;
    color: var(--ink-muted);
    line-height: 1.7;
}
.predict-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 18px;
}
.predict-stats div {
    padding: 10px 8px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(216, 138, 154, 0.18);
}
.predict-stats strong,
.predict-stats span {
    display: block;
}
.predict-stats strong {
    color: var(--ink);
    font-size: 15px;
}
.predict-stats span {
    margin-top: 3px;
    color: var(--ink-muted);
    font-size: 11px;
}

.calendar-shell {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
}
.sync-mask {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
    background: rgba(253, 250, 243, 0.68);
}
.sync-mask span {
    position: absolute;
    top: -28%;
    bottom: -28%;
    left: -45%;
    width: 36%;
    transform: rotate(14deg);
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.74),
        transparent
    );
    animation: shimmer 1.1s ease-in-out infinite;
}
@keyframes shimmer {
    to {
        left: 110%;
    }
}

.month-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
    font-size: 12px;
}
.month-switch button {
    min-width: 26px;
    height: 26px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
    font-family: inherit;
}
.month-switch button:last-child {
    border-radius: 999px;
    padding: 0 8px;
}
.month-switch button:hover {
    border-color: var(--pink);
    color: var(--pink);
}

.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-top: 12px;
}
.cal-head {
    text-align: center;
    font-size: 11px;
    color: var(--ink-muted);
    padding: 6px 0;
    font-weight: 600;
}
.cal-day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 13px;
    border-radius: 8px;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-family: inherit;
    background: transparent;
}
.cal-day:hover {
    background: var(--cream);
}
.cal-day.muted {
    color: var(--line);
}
.cal-day.period {
    background: #d78398;
    color: white;
    font-weight: 600;
}
.cal-day.follicular {
    background: #dfeadf;
    color: #53785f;
    font-weight: 600;
}
.cal-day.predict {
    background: #f6e7eb;
    color: #c16e83;
}
.cal-day.ovul {
    background: #c7dce5;
    color: #5d7893;
    font-weight: 600;
}
.cal-day.recorded {
    background: var(--jade-soft);
    color: var(--jade);
    font-weight: 600;
}
.cal-day.luteal {
    background: #f3e3b9;
    color: #8d7132;
    font-weight: 600;
}
.cal-day.overlap {
    background: linear-gradient(135deg, #d78398 0%, #f6e7eb 100%);
    color: #8f4257;
    font-weight: 700;
}
.cal-day.today {
    box-shadow:
        inset 0 0 0 2px var(--ink),
        0 0 0 2px rgba(201, 165, 92, 0.36);
}
.cal-day.today:not(.period):not(.follicular):not(.predict):not(.ovul):not(
        .luteal
    ):not(.overlap):not(.recorded) {
    background: var(--paper);
}
.cal-day.selected {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
}
.day-num {
    line-height: 1;
}
.today-badge,
.record-dot {
    border-radius: 999px;
    line-height: 1.4;
}
.today-badge {
    padding: 1px 5px;
    background: var(--ink);
    color: white;
    font-size: 10px;
}
.record-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    opacity: 0.7;
}
.calendar-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    margin-top: 14px;
    color: var(--ink-muted);
    font-size: 12px;
}
.calendar-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.legend-swatch {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px rgba(44, 54, 57, 0.08);
}
.legend-swatch.period {
    background: #d78398;
}
.legend-swatch.follicular {
    background: #dfeadf;
}
.legend-swatch.ovul {
    background: #c7dce5;
}
.legend-swatch.luteal {
    background: #f3e3b9;
}
.legend-swatch.predict {
    background: #f6e7eb;
}
.legend-swatch.recorded {
    background: var(--jade-soft);
}
.selected-day-panel {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--paper-warm);
    display: flex;
    gap: 10px;
    align-items: center;
    color: var(--ink-muted);
    font-size: 13px;
}
.selected-day-panel strong {
    color: var(--ink);
    white-space: nowrap;
}

.record-card {
    margin-top: 20px;
}
.status-note {
    margin-bottom: 14px;
    color: var(--pink);
    font-size: 13px;
}
.phase-pick {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
}
.section-label {
    min-width: 64px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 32px;
}
.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.pick-chip {
    padding: 7px 14px;
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 999px;
    font-family: inherit;
    font-size: 12px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.2s;
}
.pick-chip:hover,
.pick-chip.active {
    border-color: var(--pink);
    color: var(--pink);
    background: var(--pink-soft);
}
.symptom-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
}
.symptom-box {
    min-height: 96px;
    padding: 8px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: var(--cream);
    transition: all 0.2s;
}
.symptom-box.on {
    background: var(--pink-soft);
    border-color: var(--pink);
}
.symptom {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
    cursor: pointer;
    font-family: inherit;
    color: var(--ink-muted);
}
.symptom-box.on .symptom {
    color: var(--pink);
}
.symptom .emoji {
    font-size: 22px;
    display: block;
    margin-bottom: 4px;
}
.symptom strong {
    font-size: 12px;
    font-weight: 600;
}
.pain-picker {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
    margin-top: 8px;
}
.pain-picker button {
    border: 1px solid rgba(216, 138, 154, 0.22);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.56);
    color: var(--pink);
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
    padding: 3px 0;
}
.pain-picker button.active {
    background: var(--pink);
    color: white;
}

.plans-card {
    margin-top: 20px;
}
.plan-empty {
    padding: 20px;
    border-radius: 12px;
    background: var(--paper-warm);
    color: var(--ink-muted);
    font-size: 13px;
    text-align: center;
}

.card {
    background: var(--paper);
    border-radius: 14px;
    padding: 24px;
    border: 1px solid rgba(232, 223, 208, 0.4);
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
    grid-template-columns: 1fr 1.3fr;
}
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
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
.btn:hover:not(:disabled) {
    background: var(--ink);
    transform: translateY(-1px);
}
.btn:disabled {
    cursor: not-allowed;
    opacity: 0.58;
}
.btn-ghost {
    background: transparent;
    color: var(--jade);
    border: 1px solid var(--jade);
}
.btn-ghost:hover:not(:disabled) {
    background: var(--jade-soft);
}

.tip-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--paper-warm);
    border-radius: 10px;
    border: 1px solid var(--line);
    text-align: left;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
}
.tip-row:hover {
    border-color: var(--jade-light);
    box-shadow: var(--shadow);
    transform: translateY(-2px);
}
.tip-row .icon {
    font-size: 20px;
}
.tip-row .text {
    font-size: 14px;
    color: var(--ink);
    line-height: 1.6;
}
.tip-row .text strong {
    color: var(--jade);
}
.plan-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.34);
}
.plan-card {
    position: relative;
    width: min(420px, 100%);
    padding: 28px;
    border-radius: 18px;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    box-shadow: 0 24px 60px rgba(44, 54, 57, 0.22);
    text-align: center;
}
.plan-icon {
    width: 74px;
    height: 74px;
    margin: 0 auto 14px;
    border-radius: 20px;
    background: var(--pink-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
}
.plan-card h3 {
    font-family: "STKaiti", serif;
    font-size: 24px;
    color: var(--ink);
}
.plan-card p {
    margin: 12px auto 18px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.8;
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
.plan-modal-enter-active,
.plan-modal-leave-active {
    transition: opacity 0.22s ease;
}
.plan-modal-enter-active .plan-card,
.plan-modal-leave-active .plan-card {
    transition: transform 0.22s ease;
}
.plan-modal-enter-from,
.plan-modal-leave-to {
    opacity: 0;
}
.plan-modal-enter-from .plan-card,
.plan-modal-leave-to .plan-card {
    transform: translateY(16px) scale(0.98);
}

@media (max-width: 900px) {
    .grid-2,
    .grid-3,
    .symptom-grid {
        grid-template-columns: 1fr 1fr;
    }
    .primary-grid {
        grid-template-columns: 1fr;
    }
    .selected-day-panel,
    .phase-pick {
        align-items: flex-start;
        flex-direction: column;
    }
}

@media (max-width: 640px) {
    .row {
        align-items: flex-start;
        flex-direction: column;
    }
    .symptom-grid,
    .predict-stats {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
