<template>
    <div class="sleep-panel" :class="{ loading: isLoadingSleep }">
        <Transition name="toast-pop">
            <div v-if="savedToast" class="save-toast">
                {{ toastMessage }}
            </div>
        </Transition>

        <section class="sleep-input module-card">
            <div class="sleep-input-head">
                <div>
                    <div class="eyebrow">SLEEP LOG · 睡眠作息</div>
                    <h3>记录睡眠</h3>
                </div>
                <div class="sleep-head-actions">
                    <button
                        class="phone-sync-btn"
                        type="button"
                        :disabled="isPhoneImportRunning"
                        @click="startPhoneTransfer"
                    >
                        <span class="phone-sync-icon">⌁</span>
                        <span>不想手动输入？连接手机传输睡眠数据</span>
                    </button>
                </div>
            </div>

            <Transition name="import-slide">
                <section
                    v-if="showPhoneImportPanel"
                    class="phone-import-panel"
                    :class="phoneImportStatus"
                >
                    <div class="phone-import-main">
                        <div class="phone-import-icon">
                            {{ phoneImportIcon }}
                        </div>
                        <div>
                            <strong>{{ phoneImportTitle }}</strong>
                            <p>{{ phoneImportMessage }}</p>
                        </div>
                    </div>
                    <div class="phone-import-steps">
                        <div
                            v-for="(step, index) in phoneImportSteps"
                            :key="step"
                            class="phone-step"
                            :class="{
                                active: index === phoneImportStepIndex,
                                done: index < phoneImportStepIndex,
                            }"
                        >
                            <span>{{ index + 1 }}</span
                            >{{ step }}
                        </div>
                    </div>
                    <button
                        v-if="phoneImportStatus === 'completed'"
                        class="phone-import-close"
                        type="button"
                        @click="showPhoneImportPanel = false"
                    >
                        我知道了
                    </button>
                </section>
            </Transition>

            <div class="sleep-form">
                <button
                    class="time-input-group"
                    type="button"
                    @click="openTimePicker('sleep')"
                >
                    <div class="time-input-label">🌙 入睡时间</div>
                    <div class="time-display">{{ sleepTime }}</div>
                    <span class="time-hint">点击时钟选择</span>
                </button>
                <button
                    class="time-input-group"
                    type="button"
                    @click="openTimePicker('wake')"
                >
                    <div class="time-input-label">☀️ 起床时间</div>
                    <div class="time-display">{{ wakeTime }}</div>
                    <span class="time-hint">点击时钟选择</span>
                </button>
            </div>

            <div class="duration-display">
                <span>本次睡眠总时长</span>
                <strong>{{ durationText }}</strong>
            </div>

            <div class="time-extra">
                <div>
                    <div class="form-row">
                        <span class="lbl">睡眠质量</span>
                        <div class="quality-stars">
                            <button
                                v-for="i in 5"
                                :key="i"
                                class="star"
                                :class="{ active: i <= sleepQuality }"
                                type="button"
                                :aria-label="`睡眠质量 ${i} 星`"
                                @click="sleepQuality = i"
                            >
                                ★
                            </button>
                        </div>
                    </div>
                    <div class="form-row wake-row">
                        <span class="lbl">夜醒次数</span>
                        <div class="tag-pick">
                            <button
                                v-for="n in wakeOptions"
                                :key="n"
                                class="pick-chip"
                                :class="{ active: wakeCount === n }"
                                type="button"
                                disabled
                            >
                                {{ n }}
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="form-row tag-row">
                        <span class="lbl">睡眠状态</span>
                        <div class="tag-pick">
                            <button
                                v-for="tag in sleepTags"
                                :key="tag"
                                class="pick-chip"
                                :class="{
                                    active: sleepTagSelected.includes(tag),
                                }"
                                :disabled="isSleepTagDisabled(tag)"
                                type="button"
                                @click="toggleSleepTag(tag)"
                            >
                                {{ tag }}
                            </button>
                        </div>
                    </div>
                    <p class="logic-note">
                        已选择互斥状态时，冲突标签会自动锁定或移除。
                    </p>
                </div>
            </div>

            <div class="submit-row">
                <button
                    class="btn btn-ghost"
                    type="button"
                    @click="resetSleepForm"
                >
                    取消
                </button>
                <button
                    class="btn"
                    type="button"
                    :disabled="isSavingSleep"
                    @click="saveSleep"
                >
                    {{ isSavingSleep ? "保存中" : "保存记录" }}
                </button>
            </div>
        </section>

        <Transition name="summary-soft">
            <div v-if="showTodayRoutineCards" class="grid-2 summary-grid">
                <section
                    class="sleep-summary-shell module-card"
                    :class="{ flipped: isSleepCardFlipped }"
                    role="button"
                    tabindex="0"
                    aria-label="切换睡眠数据总览"
                    @click="toggleSleepCardFlip"
                    @keydown.enter.prevent="toggleSleepCardFlip"
                    @keydown.space.prevent="toggleSleepCardFlip"
                >
                    <div class="sleep-flip-card">
                        <div
                            class="sleep-summary sleep-card-face sleep-face-front"
                        >
                            <div class="label">LAST NIGHT · 昨夜</div>
                            <div class="sleep-score">
                                {{ overviewSleepScore }}<span>/100</span>
                            </div>
                            <div class="summary-line">
                                {{ overviewDurationText }} ·
                                {{ overviewStatusText }} · 深睡比例
                                {{ overviewDeepSleepRateText }}
                            </div>
                            <div class="sleep-stats">
                                <div class="stat">
                                    <strong>{{ overviewSleepTime }}</strong
                                    >入睡
                                </div>
                                <div class="stat">
                                    <strong>{{ overviewWakeTime }}</strong
                                    >清醒
                                </div>
                                <div class="stat">
                                    <strong>{{ overviewWakeCountLabel }}</strong
                                    >夜醒
                                </div>
                                <div class="stat">
                                    <strong>{{ overviewQualityText }}</strong
                                    >自评
                                </div>
                            </div>
                        </div>

                        <div
                            class="sleep-summary sleep-card-face sleep-face-back"
                        >
                            <div class="sleep-stage-head">
                                <div>
                                    <div class="label">
                                        SLEEP STAGES · {{ recordDateTitle }}
                                    </div>
                                    <strong>睡眠数据总览</strong>
                                </div>
                                <label
                                    class="summary-date-picker"
                                    @click.stop
                                    @keydown.stop
                                >
                                    <span>📅</span>
                                    <input
                                        v-model="recordDateISO"
                                        type="date"
                                        :min="minRecordDateISO"
                                        :max="todayISO"
                                        aria-label="选择近七天睡眠记录日期"
                                        @change="handleRecordDateChange"
                                    />
                                </label>
                            </div>

                            <div class="stage-overview-strip">
                                <span>
                                    总时长
                                    <strong>{{ overviewDurationText }}</strong>
                                </span>
                                <span>
                                    入睡
                                    <strong>{{ overviewSleepTime }}</strong>
                                </span>
                                <span>
                                    清醒
                                    <strong>{{ overviewWakeTime }}</strong>
                                </span>
                                <span>
                                    深睡
                                    <strong>{{
                                        overviewDeepSleepRateText
                                    }}</strong>
                                </span>
                            </div>

                            <div v-if="hasOverviewTimeline" class="stage-chart">
                                <div class="stage-y-labels">
                                    <span
                                        v-for="row in stageRows"
                                        :key="row.key"
                                        >{{ row.label }}</span
                                    >
                                </div>
                                <svg
                                    class="stage-svg"
                                    viewBox="0 0 720 166"
                                    preserveAspectRatio="none"
                                    role="img"
                                    :aria-label="stageChartLabel"
                                >
                                    <line
                                        v-for="row in stageRows"
                                        :key="`${row.key}-line`"
                                        class="stage-grid"
                                        x1="32"
                                        x2="700"
                                        :y1="row.y + 6"
                                        :y2="row.y + 6"
                                    />
                                    <template
                                        v-for="(
                                            segment, index
                                        ) in stageChartSegments"
                                        :key="`${segment.stage}-${segment.start}-${segment.end}`"
                                    >
                                        <line
                                            v-if="index > 0"
                                            class="stage-connector"
                                            :x1="segment.x"
                                            :x2="segment.x"
                                            :y1="segment.previousY + 6"
                                            :y2="segment.y + 6"
                                        />
                                        <rect
                                            class="stage-block"
                                            :class="segment.stage"
                                            :x="segment.x"
                                            :y="segment.y"
                                            :width="segment.width"
                                            height="12"
                                            rx="6"
                                        >
                                            <title>
                                                {{ stageName(segment.stage) }} ·
                                                {{ segment.start }}-{{
                                                    segment.end
                                                }}
                                            </title>
                                        </rect>
                                    </template>
                                </svg>
                                <div class="stage-time-axis">
                                    <span
                                        v-for="label in stageTimeLabels"
                                        :key="label"
                                        >{{ label }}</span
                                    >
                                </div>
                            </div>
                            <div v-else class="stage-empty">
                                该日期暂无睡眠阶段明细
                            </div>

                            <div class="stage-legend">
                                <span
                                    v-for="item in stageSummary"
                                    :key="item.stage"
                                    :class="item.stage"
                                >
                                    <i></i>{{ item.label }}
                                    <strong>{{ item.duration }}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="card module-card">
                    <div class="card-title">
                        <span class="dot"></span>今日作息建议
                    </div>
                    <div class="timeline">
                        <div
                            v-for="item in scheduleItems"
                            :key="item.time"
                            class="timeline-item"
                            :class="{ active: item.active }"
                        >
                            <span class="time-tag">{{ item.time }}</span>
                            <span class="time-desc">{{ item.desc }}</span>
                        </div>
                    </div>
                </section>
            </div>
        </Transition>

        <section class="card module-card">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>近 7 日睡眠趋势
                </div>
                <div class="metric-text">{{ weeklyMetricText }}</div>
            </div>
            <div class="sleep-chart">
                <svg
                    class="chart-svg"
                    viewBox="0 0 700 140"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient
                            id="sleepGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stop-color="#5C8374"
                                stop-opacity="0.4"
                            />
                            <stop
                                offset="100%"
                                stop-color="#5C8374"
                                stop-opacity="0"
                            />
                        </linearGradient>
                    </defs>
                    <line class="chart-grid" x1="0" y1="35" x2="700" y2="35" />
                    <line class="chart-grid" x1="0" y1="70" x2="700" y2="70" />
                    <line
                        class="chart-grid"
                        x1="0"
                        y1="105"
                        x2="700"
                        y2="105"
                    />
                    <path
                        v-for="path in chartAreaPaths"
                        :key="`area-${path}`"
                        class="chart-area"
                        :d="path"
                    />
                    <path
                        v-for="path in chartLinePaths"
                        :key="`line-${path}`"
                        class="chart-line"
                        :d="path"
                    />
                    <circle
                        v-for="point in chartPoints"
                        :key="point.cx"
                        class="chart-dot"
                        :class="{ today: point.today }"
                        :cx="point.cx"
                        :cy="point.cy"
                        r="4"
                        tabindex="0"
                        role="img"
                        :aria-label="chartPointLabel(point)"
                        @mouseenter="hoveredChartPoint = point"
                        @mouseleave="hoveredChartPoint = null"
                        @focus="hoveredChartPoint = point"
                        @blur="hoveredChartPoint = null"
                    />
                </svg>
                <div
                    v-if="hoveredChartPoint"
                    class="chart-tooltip"
                    :style="chartTooltipStyle"
                >
                    <span>{{ formatChartDate(hoveredChartPoint.date) }}</span>
                    <strong>{{
                        formatChartPointDuration(hoveredChartPoint)
                    }}</strong>
                </div>
            </div>
            <div class="chart-labels">
                <span v-for="label in chartLabels" :key="label">{{
                    label
                }}</span>
            </div>
        </section>

        <section class="card module-card">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>助眠音律
                </div>
                <div class="metric-text">{{ playingAudioTitle }}</div>
            </div>
            <div class="grid-2">
                <div>
                    <button
                        v-for="audio in audioList1"
                        :key="audio.title"
                        class="audio-row"
                        :class="{ playing: audio.playing }"
                        type="button"
                        @click="toggleAudio(audio.title)"
                    >
                        <div class="audio-play">
                            {{ audio.playing ? "Ⅱ" : "▶" }}
                        </div>
                        <div class="audio-info">
                            <div class="audio-title">{{ audio.title }}</div>
                            <div class="audio-meta">{{ audio.meta }}</div>
                        </div>
                    </button>
                </div>
                <div>
                    <button
                        v-for="audio in audioList2"
                        :key="audio.title"
                        class="audio-row"
                        :class="{ playing: audio.playing }"
                        type="button"
                        @click="toggleAudio(audio.title)"
                    >
                        <div class="audio-play">
                            {{ audio.playing ? "Ⅱ" : "▶" }}
                        </div>
                        <div class="audio-info">
                            <div class="audio-title">{{ audio.title }}</div>
                            <div class="audio-meta">{{ audio.meta }}</div>
                        </div>
                    </button>
                </div>
            </div>
        </section>

        <Transition name="modal-soft">
            <div
                v-if="showTimePicker"
                class="time-picker-backdrop"
                @click.self="closeTimePicker"
            >
                <section
                    class="time-picker module-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="time-picker-title"
                >
                    <div class="time-picker-head">
                        <div>
                            <div class="eyebrow">24H WHEEL · 一日时辰</div>
                            <h3 id="time-picker-title">{{ pickerTitle }}</h3>
                        </div>
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭时间选择器"
                            @click="closeTimePicker"
                        >
                            ×
                        </button>
                    </div>

                    <div class="wheel-board">
                        <div class="clock-preview">
                            <span class="clock-dot"></span>
                            <span
                                class="clock-hand"
                                :style="clockHandStyle"
                            ></span>
                            <strong>{{ draftTimeText }}</strong>
                            <em>{{ pickerPeriod }}</em>
                        </div>
                        <div class="wheel-columns">
                            <div class="wheel-column-wrap">
                                <div class="wheel-label">小时</div>
                                <div class="wheel-column">
                                    <button
                                        v-for="hour in hours"
                                        :key="hour"
                                        class="wheel-option"
                                        :class="{ active: draftHour === hour }"
                                        type="button"
                                        @click="draftHour = hour"
                                    >
                                        {{ padTime(hour) }}
                                    </button>
                                </div>
                            </div>
                            <div class="wheel-column-wrap">
                                <div class="wheel-label">分钟</div>
                                <div class="wheel-column">
                                    <button
                                        v-for="minute in minutes"
                                        :key="minute"
                                        class="wheel-option"
                                        :class="{
                                            active: draftMinute === minute,
                                        }"
                                        type="button"
                                        @click="draftMinute = minute"
                                    >
                                        {{ padTime(minute) }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="quick-times">
                        <button
                            v-for="time in quickTimes"
                            :key="time"
                            type="button"
                            @click="setDraftTime(time)"
                        >
                            {{ time }}
                        </button>
                    </div>

                    <div class="picker-actions">
                        <button
                            class="btn btn-ghost"
                            type="button"
                            @click="closeTimePicker"
                        >
                            取消
                        </button>
                        <button class="btn" type="button" @click="confirmTime">
                            确定时间
                        </button>
                    </div>
                </section>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
    ApiSleep,
    type SleepRecordPayload,
    type SleepRecordDTO,
    type SleepWeeklyStatDTO,
} from "@/network/sleep";
import { useUserStore } from "@/store";

type TimeField = "sleep" | "wake";
type AudioItem = { title: string; meta: string; playing: boolean };
type PhoneImportStatus =
    | "idle"
    | "checking"
    | "connected"
    | "opening"
    | "transferring"
    | "completed";
type SleepStage = "awake" | "light" | "deep";
type SleepStageSegment = {
    stage: SleepStage;
    start: string;
    end: string;
};

type ImportedSleepData = {
    sleepTime: string;
    wakeTime: string;
    quality: number;
    awakeCount: number;
    tags: string[];
    stages?: SleepStageSegment[];
};

type SleepRecord = Required<ImportedSleepData> & {
    dateISO: string;
    serverId?: number | string;
    apiSleepStage?: string;
    durationMinutes?: number;
};

type ChartPoint = {
    cx: number;
    cy: number;
    date: string;
    durationMinutes: number;
    index: number;
    today: boolean;
};

const initialSleepTime = "23:18";
const initialWakeTime = "07:00";
const userStore = useUserStore();
const stageRows: { key: SleepStage; label: string; y: number }[] = [
    { key: "awake", label: "清醒", y: 24 },
    { key: "light", label: "浅睡", y: 74 },
    { key: "deep", label: "深睡", y: 124 },
];
const sleepTime = ref(initialSleepTime);
const wakeTime = ref(initialWakeTime);
const sleepQuality = ref(4);
const wakeCount = ref("1 次");
const awakeCount = ref(1);
const todayDate = startOfLocalDay(new Date());
const todayISO = toISODate(todayDate);
const minRecordDateISO = toISODate(addDays(todayDate, -6));
const recordDateISO = ref(todayISO);
const todayRecordUpdated = ref(false);
const isSleepCardFlipped = ref(false);
const showPhoneImportPanel = ref(false);
const phoneImportStatus = ref<PhoneImportStatus>("idle");
const phoneImportStepIndex = ref(0);
const isLoadingSleep = ref(false);
const isSavingSleep = ref(false);
const toastMessage = ref("睡眠记录已保存，今日建议已同步更新");
let phoneImportTimers: ReturnType<typeof setTimeout>[] = [];
let loadedUserId: number | null = null;
const savedRecordDates = ref<Record<string, boolean>>({});
const sleepRecords = ref<Record<string, SleepRecord>>({});
const weeklyStats = ref<SleepWeeklyStatDTO[]>([]);
const sleepTags = [
    "入睡快",
    "入睡慢",
    "多梦",
    "易醒",
    "早醒",
    "沉睡",
    "磨牙",
    "打鼾",
];
const sleepTagSelected = ref(["入睡慢", "沉睡"]);
const wakeOptions = ["0 次", "1 次", "2 次", "3+ 次"];
const phoneImportSteps = [
    "检测 USB 连接",
    "识别睡眠 App",
    "读取睡眠阶段",
    "写入今日记录",
];

const showTimePicker = ref(false);
const pickerField = ref<TimeField>("sleep");
const draftHour = ref(23);
const draftMinute = ref(18);
const savedToast = ref(false);
const hoveredChartPoint = ref<ChartPoint | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const conflictMap: Record<string, string[]> = {
    入睡快: ["入睡慢"],
    入睡慢: ["入睡快"],
    沉睡: ["多梦", "易醒", "早醒"],
    多梦: ["沉睡"],
    易醒: ["沉睡"],
    早醒: ["沉睡"],
};

const hours = Array.from({ length: 24 }, (_, index) => index);
const minutes = Array.from({ length: 60 }, (_, index) => index);
const quickTimes = computed(() =>
    pickerField.value === "sleep"
        ? ["21:30", "22:00", "22:30", "23:00", "23:30"]
        : ["06:00", "06:30", "07:00", "07:30", "08:00"],
);
const selectableDates = computed(() =>
    Array.from({ length: 7 }, (_, index) => addDays(todayDate, -index)),
);
const recordDateTitle = computed(() => formatRecordDate(recordDateISO.value));
const chartLabels = computed(() =>
    [...selectableDates.value]
        .reverse()
        .map((date) => `${date.getMonth() + 1}/${date.getDate()}`),
);
const weeklyStatsByDate = computed(() =>
    weeklyStats.value.reduce<Record<string, SleepWeeklyStatDTO>>(
        (next, item) => {
            const dateISO = getWeeklyStatDate(item);
            if (dateISO) next[dateISO] = item;
            return next;
        },
        {},
    ),
);
const selectedWeeklyStat = computed(
    () => weeklyStatsByDate.value[recordDateISO.value],
);
const selectedWeeklyDurationMinutes = computed(() =>
    getWeeklyDuration(selectedWeeklyStat.value),
);
const chartPoints = computed<ChartPoint[]>(() => {
    const statsByDate = weeklyStatsByDate.value;
    const timelineDates = [...selectableDates.value].reverse();
    const durations = timelineDates.map((date) => {
        const dateISO = toISODate(date);
        return getDisplayDurationForDate(dateISO, statsByDate[dateISO]);
    });
    const validDurations = durations.filter((duration) => duration > 0);
    const minDuration = validDurations.length ? Math.min(...validDurations) : 0;
    const maxDuration = validDurations.length ? Math.max(...validDurations) : 0;
    const range = Math.max(60, maxDuration - minDuration);

    return timelineDates
        .map((date, index) => {
            const duration = durations[index] ?? 0;
            if (duration <= 0) return null;
            const cx = 50 + index * 100;
            const cy = 110 - ((duration - minDuration) / range) * 80;
            const dateISO = toISODate(date);
            return {
                cx,
                cy,
                date: dateISO,
                durationMinutes: duration,
                index,
                today: dateISO === todayISO,
            };
        })
        .filter((point): point is ChartPoint => point !== null);
});
const chartPointGroups = computed(() => {
    const groups: ChartPoint[][] = [];
    chartPoints.value.forEach((point) => {
        const currentGroup = groups[groups.length - 1];
        const previousPoint = currentGroup?.[currentGroup.length - 1];
        if (
            currentGroup &&
            previousPoint &&
            point.index === previousPoint.index + 1
        ) {
            currentGroup.push(point);
            return;
        }
        groups.push([point]);
    });
    return groups;
});
const chartLinePaths = computed(() =>
    chartPointGroups.value
        .filter((group) => group.length > 1)
        .map((group) =>
            group
                .map(
                    (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.cx} ${point.cy}`,
                )
                .join(" "),
        ),
);
const chartAreaPaths = computed(() =>
    chartPointGroups.value
        .filter((group) => group.length > 1)
        .map((group) => {
            const first = group[0];
            const last = group[group.length - 1];
            if (!first || !last) return "";
            const line = group
                .map(
                    (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.cx} ${point.cy}`,
                )
                .join(" ");
            return `${line} L ${last.cx} 140 L ${first.cx} 140 Z`;
        })
        .filter(Boolean),
);
const hasChartData = computed(() => chartPoints.value.length > 0);
const chartMetricSuffix = computed(() => {
    if (!hasChartData.value) return "";
    return chartPoints.value.length === 1
        ? "仅 1 天有记录"
        : `已同步 ${chartPoints.value.length} 天`;
});
const weeklyMetricText = computed(() => {
    const validDurations = chartPoints.value
        .map((point) => point.durationMinutes)
        .filter((duration) => duration > 0);
    if (!validDurations.length) return "";
    const average = Math.round(
        validDurations.reduce((sum, duration) => sum + duration, 0) /
            validDurations.length,
    );
    return `平均 ${formatMinutesShort(average)} · ${chartMetricSuffix.value}`;
});
const chartTooltipStyle = computed(() => {
    const point = hoveredChartPoint.value;
    if (!point) return {};
    const transform =
        point.cx < 110
            ? "translate(0, calc(-100% - 10px))"
            : point.cx > 590
              ? "translate(-100%, calc(-100% - 10px))"
              : "translate(-50%, calc(-100% - 10px))";
    return {
        left: `${(point.cx / 700) * 100}%`,
        top: `${(point.cy / 140) * 100}%`,
        transform,
    };
});

const audioList1 = ref<AudioItem[]>([
    { title: "竹林夜雨", meta: "自然白噪音 · 30 分钟", playing: false },
    { title: "古琴 · 平沙落雁", meta: "国风轻音 · 12 分钟", playing: false },
    { title: "颂钵冥想", meta: "放松引导 · 20 分钟", playing: false },
]);

const audioList2 = ref<AudioItem[]>([
    { title: "深海蓝调", meta: "慢波音乐 · 45 分钟", playing: false },
    { title: "睡前呼吸引导", meta: "4-7-8 呼吸法 · 8 分钟", playing: false },
    { title: "山雨竹篱", meta: "环境音 · 60 分钟", playing: false },
]);

const allAudios = computed(() => [...audioList1.value, ...audioList2.value]);
const playingAudioTitle = computed(() => {
    const active = allAudios.value.find((audio) => audio.playing);
    return active ? `正在播放：${active.title}` : "点击曲目即可播放";
});
const isPhoneImportRunning = computed(() =>
    ["checking", "connected", "opening", "transferring"].includes(
        phoneImportStatus.value,
    ),
);
const phoneImportTitle = computed(() => {
    switch (phoneImportStatus.value) {
        case "checking":
            return "正在检测 iPhone";
        case "connected":
            return "已识别苹果手机";
        case "opening":
            return "正在唤起睡眠数据 App";
        case "transferring":
            return "正在接收睡眠数据";
        case "completed":
            return "今日睡眠记录已写入";
        default:
            return "准备连接手机";
    }
});
const phoneImportMessage = computed(() => {
    switch (phoneImportStatus.value) {
        case "checking":
            return "请保持手机解锁并信任这台电脑。";
        case "connected":
            return "检测到设备后，将尝试唤起手机端睡眠读取工具。";
        case "opening":
            return "手机端确认后，网页会接收后端同步完成的数据。";
        case "transferring":
            return "前端测试流正在写入一条来自手机的睡眠记录。";
        case "completed":
            return "已自动选择日期、入睡时间、起床时间和夜醒次数。";
        default:
            return "后端接口完成后，这里会替换为真实 USB 与 App 检测。";
    }
});
const phoneImportIcon = computed(() =>
    phoneImportStatus.value === "completed" ? "✓" : "📱",
);
const activeUserId = computed(() => {
    const loginId = Number(userStore.G_LoginInfo.id);
    const infoId = Number(userStore.G_UserInfo.id);
    return Number.isFinite(loginId) && loginId > 0 ? loginId : infoId;
});
const showTodayRoutineCards = computed(() => true);
const selectedSleepRecord = computed(
    () => sleepRecords.value[recordDateISO.value] ?? null,
);
const overviewDurationMinutes = computed(() =>
    getRecordDurationMinutes(selectedSleepRecord.value) > 0
        ? getRecordDurationMinutes(selectedSleepRecord.value)
        : selectedWeeklyDurationMinutes.value,
);
const overviewDurationText = computed(() =>
    selectedSleepRecord.value
        ? formatMinutesShort(overviewDurationMinutes.value)
        : "暂无数据",
);
const overviewSleepTime = computed(
    () => selectedSleepRecord.value?.sleepTime || "--:--",
);
const overviewWakeTime = computed(
    () => selectedSleepRecord.value?.wakeTime || "--:--",
);
const overviewWakeCountLabel = computed(() => {
    const count = selectedSleepRecord.value?.awakeCount;
    if (count == null) return "--";
    return count >= 3 ? "3+ 次" : `${count} 次`;
});
const overviewQualityText = computed(() =>
    selectedSleepRecord.value ? `★ ${selectedSleepRecord.value.quality}` : "--",
);
const overviewStatusText = computed(
    () => selectedSleepRecord.value?.tags[0] ?? "待同步",
);
const overviewDeepSleepRate = computed(() =>
    calcDeepSleepRate(selectedSleepRecord.value),
);
const overviewDeepSleepRateText = computed(() =>
    selectedSleepRecord.value ? `${overviewDeepSleepRate.value}%` : "--",
);
const overviewSleepScore = computed(() =>
    selectedSleepRecord.value
        ? calcSleepScore(
              selectedSleepRecord.value,
              overviewDeepSleepRate.value,
              overviewDurationMinutes.value,
          )
        : "--",
);
const hasOverviewTimeline = computed(
    () => buildStageChartSegments(selectedSleepRecord.value).length > 0,
);
const stageChartSegments = computed(() =>
    buildStageChartSegments(selectedSleepRecord.value),
);
const stageTimeLabels = computed(() => {
    const record = selectedSleepRecord.value;
    if (!record || !hasRecordTimeRange(record)) return [];
    const midpoint = addMinutesToTime(
        record.sleepTime,
        Math.round(calcDurationBetween(record.sleepTime, record.wakeTime) / 2),
    );
    return [record.sleepTime, midpoint, record.wakeTime];
});
const stageSummary = computed(() =>
    buildStageSummary(selectedSleepRecord.value),
);
const stageChartLabel = computed(
    () => `${recordDateTitle.value} 睡眠阶段分布，包含清醒、浅睡、深睡`,
);

function padTime(value: number) {
    return String(value).padStart(2, "0");
}

function startOfLocalDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
}

function toISODate(date: Date) {
    return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())}`;
}

function parseISODate(value: string) {
    const [year = "0", month = "1", day = "1"] = value.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function parseApiDateTime(value: string) {
    const normalized = value.trim();
    const hasDateTime = /^\d{4}-\d{1,2}-\d{1,2}[T\s]\d{1,2}:\d{2}/.test(
        normalized,
    );
    const hasOffset = /(?:Z|[+-]\d{2}:?\d{2}(?::?\d{2})?)$/i.test(normalized);
    if (!hasDateTime) return null;

    const date = new Date(hasOffset ? normalized : `${normalized}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimezoneOffset(date: Date) {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteMinutes = Math.abs(offsetMinutes);
    return `${sign}${padTime(Math.floor(absoluteMinutes / 60))}:${padTime(
        absoluteMinutes % 60,
    )}`;
}

function toApiDateTime(dateISO: string, time: string, addOneDay = false) {
    const date = parseISODate(dateISO);
    if (addOneDay) date.setDate(date.getDate() + 1);
    const parsed = parseTime(time);
    return `${toISODate(date)}T${padTime(parsed.hour)}:${padTime(
        parsed.minute,
    )}:00${formatTimezoneOffset(date)}`;
}

function formatRecordDate(value: string) {
    const date = parseISODate(value);
    const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const prefix =
        value === todayISO
            ? "今日"
            : value === toISODate(addDays(todayDate, -1))
              ? "昨夜"
              : weekNames[date.getDay()];
    return `${prefix} · ${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function normalizeRecordDate() {
    if (recordDateISO.value > todayISO) {
        recordDateISO.value = todayISO;
        return;
    }
    if (recordDateISO.value < minRecordDateISO) {
        recordDateISO.value = minRecordDateISO;
    }
}

async function handleRecordDateChange() {
    normalizeRecordDate();
    const record = await loadSleepRecord(recordDateISO.value, true);
    const cachedRecord = sleepRecords.value[recordDateISO.value];
    if (!record && cachedRecord) {
        applySleepRecordToForm(cachedRecord);
    }
}

function parseTime(value: string) {
    const [hourText = "0", minuteText = "0"] = value.split(":");
    return {
        hour: Number(hourText),
        minute: Number(minuteText),
    };
}

function formatTime(hour: number, minute: number) {
    return `${padTime(hour)}:${padTime(minute)}`;
}

function calcDurationBetween(start: string, end: string) {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    let minutes =
        endTime.hour * 60 +
        endTime.minute -
        (startTime.hour * 60 + startTime.minute);
    if (minutes <= 0) minutes += 24 * 60;
    return minutes;
}

function addMinutesToTime(start: string, amount: number) {
    const parsed = parseTime(start);
    const total = parsed.hour * 60 + parsed.minute + amount;
    const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    return formatTime(Math.floor(normalized / 60), normalized % 60);
}

function minutesFromStart(start: string, time: string) {
    const startTime = parseTime(start);
    const targetTime = parseTime(time);
    let minutes =
        targetTime.hour * 60 +
        targetTime.minute -
        (startTime.hour * 60 + startTime.minute);
    if (minutes < 0) minutes += 24 * 60;
    return minutes;
}

function stageName(stage: SleepStage) {
    const names: Record<SleepStage, string> = {
        awake: "清醒",
        light: "浅睡",
        deep: "深睡",
    };
    return names[stage];
}

function stageY(stage: SleepStage) {
    return stageRows.find((row) => row.key === stage)?.y ?? 74;
}

function buildStageSegments(
    start: string,
    end: string,
    awakeCountValue: number,
) {
    const total = calcDurationBetween(start, end);
    const patternSource: { stage: SleepStage; ratio: number }[] = [
        { stage: "light", ratio: 0.13 },
        { stage: "deep", ratio: 0.18 },
        { stage: "light", ratio: 0.15 },
        { stage: "awake", ratio: awakeCountValue > 0 ? 0.025 : 0 },
        { stage: "light", ratio: 0.18 },
        { stage: "deep", ratio: 0.17 },
        { stage: "awake", ratio: awakeCountValue > 1 ? 0.025 : 0 },
        { stage: "light", ratio: 0.16 },
        { stage: "awake", ratio: awakeCountValue > 2 ? 0.02 : 0 },
        { stage: "light", ratio: 0.12 },
    ];
    const pattern = patternSource.filter((item) => item.ratio > 0);
    const ratioTotal = pattern.reduce((sum, item) => sum + item.ratio, 0);
    let cursor = 0;

    return pattern.map((item, index) => {
        const isLast = index === pattern.length - 1;
        const remaining = Math.max(0, total - cursor);
        const minutes = isLast
            ? remaining
            : Math.min(
                  remaining,
                  Math.max(
                      item.stage === "awake" ? 6 : 18,
                      Math.round((total * item.ratio) / ratioTotal),
                  ),
              );
        const segmentStart = addMinutesToTime(start, cursor);
        cursor += minutes;
        const segmentEnd = addMinutesToTime(start, Math.min(cursor, total));

        return {
            stage: item.stage,
            start: segmentStart,
            end: segmentEnd,
        };
    });
}

function buildStageSegmentsByDominantStage(
    start: string,
    end: string,
    awakeCountValue: number,
    dominantStage: SleepStage,
) {
    if (dominantStage === "light") {
        return buildStageSegments(start, end, awakeCountValue);
    }

    const total = calcDurationBetween(start, end);
    const firstChunk = Math.min(total, Math.max(18, Math.round(total * 0.24)));
    const secondChunk = Math.min(
        Math.max(0, total - firstChunk),
        Math.max(18, Math.round(total * 0.3)),
    );
    const awakeMinutes = Math.min(
        Math.max(0, total - firstChunk - secondChunk),
        awakeCountValue > 0 ? 8 : 0,
    );
    const lastChunk = Math.max(
        0,
        total - firstChunk - secondChunk - awakeMinutes,
    );
    let cursor = 0;
    const segments: SleepStageSegment[] = [
        {
            stage: "light",
            start,
            end: addMinutesToTime(start, firstChunk),
        },
        {
            stage: dominantStage,
            start: addMinutesToTime(start, firstChunk),
            end: addMinutesToTime(start, firstChunk + secondChunk),
        },
    ];
    cursor += firstChunk + secondChunk;

    if (awakeMinutes > 0) {
        segments.push({
            stage: "awake",
            start: addMinutesToTime(start, cursor),
            end: addMinutesToTime(start, cursor + awakeMinutes),
        });
        cursor += awakeMinutes;
    }

    if (lastChunk > 0) {
        segments.push({
            stage: dominantStage === "awake" ? "light" : dominantStage,
            start: addMinutesToTime(start, cursor),
            end,
        });
    }

    return segments;
}

function buildCurrentSleepRecord(dateISO: string): SleepRecord {
    const existingRecord = sleepRecords.value[dateISO];
    const record: SleepRecord = {
        dateISO,
        sleepTime: sleepTime.value,
        wakeTime: wakeTime.value,
        quality: sleepQuality.value,
        awakeCount: awakeCount.value,
        tags: [...sleepTagSelected.value],
        stages: buildStageSegments(
            sleepTime.value,
            wakeTime.value,
            awakeCount.value,
        ),
    };
    if (existingRecord?.serverId != null) {
        record.serverId = existingRecord.serverId;
    }
    if (existingRecord?.apiSleepStage) {
        record.apiSleepStage = existingRecord.apiSleepStage;
    }
    return record;
}

function applySleepRecordToForm(record: SleepRecord) {
    if (hasRecordTimeRange(record)) {
        sleepTime.value = record.sleepTime;
        wakeTime.value = record.wakeTime;
    }
    sleepQuality.value = record.quality;
    applyAwakeCount(record.awakeCount);
    sleepTagSelected.value = [...record.tags];
}

function buildStageChartSegments(record?: SleepRecord | null) {
    if (!record || !hasRecordTimeRange(record) || !record.stages.length) {
        return [];
    }
    const chartStartX = 44;
    const chartWidth = 650;
    const total = calcDurationBetween(record.sleepTime, record.wakeTime);

    const segments = record.stages.map((segment) => {
        const startOffset = minutesFromStart(record.sleepTime, segment.start);
        const endOffset = minutesFromStart(record.sleepTime, segment.end);
        const duration = Math.max(1, endOffset - startOffset);

        return {
            ...segment,
            x: chartStartX + (startOffset / total) * chartWidth,
            y: stageY(segment.stage),
            width: Math.max(8, (duration / total) * chartWidth),
        };
    });

    return segments.map((segment, index) => ({
        ...segment,
        previousY: segments[index - 1]?.y ?? segment.y,
    }));
}

function formatMinutesCompact(minutes: number) {
    if (minutes < 60) return `${minutes} 分钟`;
    return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
}

function buildStageSummary(record?: SleepRecord | null) {
    const totals = record?.stages.reduce<Record<SleepStage, number>>(
        (next, segment) => {
            next[segment.stage] += calcDurationBetween(
                segment.start,
                segment.end,
            );
            return next;
        },
        { awake: 0, light: 0, deep: 0 },
    ) ?? { awake: 0, light: 0, deep: 0 };

    return stageRows.map((row) => ({
        stage: row.key,
        label: row.label,
        duration: formatMinutesCompact(totals[row.key]),
    }));
}

function isValidUserId(value: number) {
    return Number.isFinite(value) && value > 0;
}

function normalizeDateValue(value?: unknown, fallback = todayISO) {
    if (value == null) return fallback;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return toISODate(value);
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;
        const date = new Date(timestamp);
        return Number.isNaN(date.getTime()) ? fallback : toISODate(date);
    }

    const rawValue = String(value).trim();
    if (!rawValue) return fallback;

    const offsetDate = parseApiDateTime(rawValue);
    if (offsetDate) return toISODate(offsetDate);

    const dateMatch = rawValue.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
    if (dateMatch) {
        return `${dateMatch[1]}-${padTime(Number(dateMatch[2]))}-${padTime(
            Number(dateMatch[3]),
        )}`;
    }

    const numericValue = Number(rawValue);
    if (/^\d{10,13}$/.test(rawValue) && Number.isFinite(numericValue)) {
        const timestamp =
            rawValue.length === 10 ? numericValue * 1000 : numericValue;
        const date = new Date(timestamp);
        return Number.isNaN(date.getTime()) ? fallback : toISODate(date);
    }

    return fallback;
}

function formatMinutesShort(minutes: number) {
    const normalizedMinutes = Math.max(0, Math.round(minutes));
    const hours = Math.floor(normalizedMinutes / 60);
    const restMinutes = normalizedMinutes % 60;
    if (hours <= 0) return `${restMinutes}分钟`;
    if (restMinutes === 0) return `${hours}小时`;
    return `${hours}小时${restMinutes}分钟`;
}

function formatChartDate(dateISO: string) {
    const date = parseISODate(dateISO);
    const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekNames[date.getDay()]}`;
}

function formatChartPointDuration(point: ChartPoint) {
    if (point.durationMinutes <= 0) return "暂无数据";
    return `睡眠 ${formatMinutesShort(point.durationMinutes)}`;
}

function chartPointLabel(point: ChartPoint) {
    return `${formatChartDate(point.date)}，${formatChartPointDuration(point)}`;
}

function readNumberValue(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value.trim().match(/-?\d+(?:\.\d+)?/)?.[0]);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function readFieldValue(source: Record<string, unknown>, keys: string[]) {
    return keys.map((key) => source[key]).find((item) => item != null);
}

function normalizeDurationNumber(
    value: number,
    mode: "minutes" | "hours" | "auto",
) {
    if (!Number.isFinite(value) || value <= 0) return 0;
    if (mode === "hours") return value * 60;
    if (mode === "minutes") return value;
    return value <= 24 ? value * 60 : value;
}

function readDurationValue(value: unknown, mode: "minutes" | "hours" | "auto") {
    if (value == null) return 0;
    if (typeof value === "number") return normalizeDurationNumber(value, mode);

    const text = String(value).trim();
    if (!text) return 0;

    const colonMatch = text.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/);
    if (colonMatch) {
        return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
    }

    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:小时|hour|hours|h)/i);
    const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:分钟|分|min|mins|m)/i);
    if (hourMatch || minuteMatch) {
        const hours = hourMatch ? Number(hourMatch[1]) : 0;
        const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
        return hours * 60 + minutes;
    }

    return normalizeDurationNumber(readNumberValue(text), mode);
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

function hasRecordTimeRange(record?: SleepRecord | null) {
    return Boolean(record?.sleepTime && record.wakeTime);
}

function getRecordDurationMinutes(record?: SleepRecord | null) {
    if (!record) return 0;
    if (record.durationMinutes && record.durationMinutes > 0) {
        return Math.round(record.durationMinutes);
    }
    if (!hasRecordTimeRange(record)) return 0;
    return calcDurationBetween(record.sleepTime, record.wakeTime);
}

function getDisplayDurationForDate(
    dateISO: string,
    weeklyStat?: SleepWeeklyStatDTO,
) {
    const recordDuration = getRecordDurationMinutes(
        sleepRecords.value[dateISO],
    );
    return recordDuration > 0 ? recordDuration : getWeeklyDuration(weeklyStat);
}

function getStageDuration(
    record: SleepRecord | null | undefined,
    stage: SleepStage,
) {
    if (!record) return 0;
    return record.stages
        .filter((segment) => segment.stage === stage)
        .reduce(
            (sum, segment) =>
                sum + calcDurationBetween(segment.start, segment.end),
            0,
        );
}

function calcDeepSleepRate(record?: SleepRecord | null) {
    const total = getRecordDurationMinutes(record);
    if (!record || total <= 0) return 0;
    const deepMinutes = getStageDuration(record, "deep");
    if (deepMinutes <= 0) return 0;
    return Math.round((deepMinutes / total) * 100);
}

function calcSleepScore(
    record: SleepRecord,
    deepRate: number,
    durationOverride?: number,
) {
    const duration =
        durationOverride && durationOverride > 0
            ? durationOverride
            : getRecordDurationMinutes(record);
    const durationScore =
        duration >= 420 && duration <= 540
            ? 26
            : Math.max(10, 26 - Math.abs(duration - 480) / 20);
    const wakePenalty =
        record.awakeCount <= 0
            ? 0
            : record.awakeCount === 1
              ? 4
              : record.awakeCount === 2
                ? 8
                : 14;
    const tagBonus = record.tags.includes("入睡快")
        ? 6
        : record.tags.includes("入睡慢")
          ? -6
          : 0;
    const deepBonus =
        deepRate >= 25 ? 4 : deepRate > 0 && deepRate < 15 ? -4 : 0;
    const raw =
        record.quality * 12 +
        durationScore -
        wakePenalty +
        tagBonus +
        deepBonus;
    return Math.round(Math.min(100, Math.max(45, raw)));
}

function getWeeklyStatDate(stat: SleepWeeklyStatDTO) {
    const source = stat as Record<string, unknown>;
    return normalizeDateValue(
        readFieldValue(source, [
            "date",
            "recordDate",
            "sleepDate",
            "statDate",
            "day",
            "createdAt",
            "sleepTime",
            "bedTime",
            "bedtime",
            "startTime",
            "wakeTime",
            "endTime",
        ]),
        "",
    );
}

function getWeeklyDuration(stat?: SleepWeeklyStatDTO) {
    if (!stat) return 0;
    const source = stat as Record<string, unknown>;
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

    const sleepStart = readStringField(
        source,
        ["sleepTime", "bedTime", "bedtime", "startTime"],
        "",
    );
    const wakeEnd = readStringField(source, ["wakeTime", "endTime"], "");
    if (sleepStart && wakeEnd) {
        return calcDurationBetween(
            ensureTimeValue(sleepStart, initialSleepTime),
            ensureTimeValue(wakeEnd, initialWakeTime),
        );
    }

    return 0;
}

function readStringField(
    source: Record<string, unknown>,
    keys: string[],
    fallback: string,
) {
    const value = keys.map((key) => source[key]).find((item) => item != null);
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readNumberField(
    source: Record<string, unknown>,
    keys: string[],
    fallback: number,
) {
    const value = keys.map((key) => source[key]).find((item) => item != null);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const parsed = Number(value.replace(/[^\d.-]/g, ""));
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

function ensureTimeValue(value: string, fallback: string) {
    const offsetDate = parseApiDateTime(value);
    if (offsetDate) {
        return formatTime(offsetDate.getHours(), offsetDate.getMinutes());
    }

    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) return fallback;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return fallback;
    return formatTime(hour, minute);
}

function inferRecordDateFromSource(
    source: Record<string, unknown>,
    fallbackDateISO: string,
) {
    const rawDate = readStringField(
        source,
        ["date", "recordDate", "sleepDate", "sleepTime"],
        fallbackDateISO,
    );
    return normalizeDateValue(rawDate);
}

function normalizeStageName(value: string): SleepStage {
    const normalized = value.toLowerCase();
    if (
        normalized.includes("awake") ||
        normalized.includes("rem") ||
        value.includes("清醒")
    ) {
        return "awake";
    }
    if (normalized.includes("deep") || value.includes("深睡")) return "deep";
    return "light";
}

function parseTagsValue(value: unknown, fallback: string[]) {
    if (Array.isArray(value)) {
        const tags = value.map(String).filter(Boolean);
        return tags.length ? tags : fallback;
    }
    if (typeof value !== "string" || !value.trim()) return fallback;
    try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
            const tags = parsed.map(String).filter(Boolean);
            return tags.length ? tags : fallback;
        }
    } catch {
        // 兼容逗号分隔的后端字段。
    }
    const tags = value
        .split(/[,\uFF0C;；\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    return tags.length ? tags : fallback;
}

function parseStageValue(
    value: unknown,
    fallbackSleepTime: string,
    fallbackWakeTime: string,
) {
    const stageSource: unknown =
        typeof value === "string" ? parseJson(value) : value;
    if (!Array.isArray(stageSource)) return null;
    const stages = stageSource
        .map((item) => {
            if (typeof item !== "object" || item === null) return null;
            const source = item as Record<string, unknown>;
            const start = ensureTimeValue(
                readStringField(
                    source,
                    ["start", "startTime"],
                    fallbackSleepTime,
                ),
                fallbackSleepTime,
            );
            const end = ensureTimeValue(
                readStringField(source, ["end", "endTime"], fallbackWakeTime),
                fallbackWakeTime,
            );
            const stage = normalizeStageName(
                readStringField(source, ["stage", "type", "name"], "light"),
            );
            return { stage, start, end };
        })
        .filter((item): item is SleepStageSegment => item !== null);
    return stages.length ? stages : null;
}

function parseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function hasSleepRecordPayload(
    data: SleepRecordDTO | null,
): data is SleepRecordDTO {
    if (!data || typeof data !== "object") return false;
    const source = data as Record<string, unknown>;
    return [
        "id",
        "date",
        "recordDate",
        "sleepDate",
        "sleepTime",
        "bedTime",
        "bedtime",
        "startTime",
        "wakeTime",
        "endTime",
        "quality",
        "sleepQuality",
        "sleepStage",
        "sleepTagsJson",
        "durationMinutes",
        "sleepMinutes",
        "totalSleepMinutes",
        "sleepDuration",
    ].some((key) => source[key] != null);
}

function normalizeSleepRecord(
    data: SleepRecordDTO,
    fallbackDateISO: string,
): SleepRecord {
    const source = data as Record<string, unknown>;
    const dateISO = inferRecordDateFromSource(source, fallbackDateISO);
    const rawSleepTime = readStringField(
        source,
        ["sleepTime", "bedTime", "bedtime", "startTime"],
        "",
    );
    const rawWakeTime = readStringField(
        source,
        ["wakeTime", "getUpTime", "endTime"],
        "",
    );
    const normalizedSleepTime = ensureTimeValue(rawSleepTime, initialSleepTime);
    const normalizedWakeTime = ensureTimeValue(rawWakeTime, initialWakeTime);
    const hasTimeRange = Boolean(rawSleepTime && rawWakeTime);
    const sleepDurationMinutes = hasTimeRange
        ? calcDurationBetween(normalizedSleepTime, normalizedWakeTime)
        : getWeeklyDuration(data as SleepWeeklyStatDTO);
    const normalizedAwakeCount = Math.max(
        0,
        Math.round(
            readNumberField(
                source,
                ["awakeCount", "wakeCount", "nightWakeCount"],
                awakeCount.value,
            ),
        ),
    );
    const stages = hasTimeRange
        ? (parseStageValue(
              source.stages ?? source.sleepStages,
              normalizedSleepTime,
              normalizedWakeTime,
          ) ??
          buildStageSegmentsByDominantStage(
              normalizedSleepTime,
              normalizedWakeTime,
              normalizedAwakeCount,
              normalizeStageName(
                  readStringField(source, ["sleepStage"], "core"),
              ),
          ))
        : [];

    const record: SleepRecord = {
        dateISO,
        sleepTime: hasTimeRange ? normalizedSleepTime : "",
        wakeTime: hasTimeRange ? normalizedWakeTime : "",
        quality: Math.min(
            5,
            Math.max(
                1,
                Math.round(
                    readNumberField(
                        source,
                        ["quality", "sleepQuality"],
                        sleepQuality.value,
                    ),
                ),
            ),
        ),
        awakeCount: normalizedAwakeCount,
        tags: parseTagsValue(
            source.sleepTagsJson ?? source.tags ?? source.sleepTags,
            ["状态平稳"],
        ),
        stages,
    };
    if (sleepDurationMinutes > 0) {
        record.durationMinutes = sleepDurationMinutes;
    }
    const serverId = source.id;
    if (typeof serverId === "number" || typeof serverId === "string") {
        record.serverId = serverId;
    }
    const apiSleepStage = source.sleepStage;
    if (typeof apiSleepStage === "string" && apiSleepStage.trim()) {
        record.apiSleepStage = apiSleepStage.trim();
    }
    return record;
}

function markRecordSaved(dateISO: string, saved: boolean) {
    const next = { ...savedRecordDates.value };
    if (saved) next[dateISO] = true;
    else delete next[dateISO];
    savedRecordDates.value = next;
}

function upsertSleepRecord(record: SleepRecord, saved: boolean) {
    sleepRecords.value = {
        ...sleepRecords.value,
        [record.dateISO]: record,
    };
    markRecordSaved(record.dateISO, saved);
}

function removeSleepRecord(dateISO: string) {
    const next = { ...sleepRecords.value };
    delete next[dateISO];
    sleepRecords.value = next;
    markRecordSaved(dateISO, false);
}

function inferApiSleepStage(record: SleepRecord) {
    if (record.apiSleepStage) return record.apiSleepStage;
    if (record.tags.some((tag) => /沉睡|深睡/.test(tag))) return "deep";
    if (record.tags.some((tag) => /多梦|易醒|早醒/.test(tag))) return "core";
    if (record.quality >= 5 && deepSleepRate.value >= 30) return "deep";
    return "core";
}

function buildSleepRecordPayload(record: SleepRecord): SleepRecordPayload {
    const wakeCrossesMidnight =
        calcDurationBetween(record.sleepTime, record.wakeTime) >
        minutesFromStart("00:00", record.wakeTime);
    const payload: SleepRecordPayload = {
        userId: activeUserId.value,
        sleepTime: toApiDateTime(record.dateISO, record.sleepTime),
        wakeTime: toApiDateTime(
            record.dateISO,
            record.wakeTime,
            wakeCrossesMidnight,
        ),
        sleepQuality: record.quality,
        sleepStage: inferApiSleepStage(record),
        sleepTagsJson: JSON.stringify(record.tags),
    };
    if (record.serverId != null) payload.id = record.serverId;
    return payload;
}

function withServerRecord(
    record: SleepRecord,
    serverId: number | string,
    apiSleepStage?: string,
): SleepRecord {
    const nextRecord: SleepRecord = { ...record, serverId };
    if (apiSleepStage) nextRecord.apiSleepStage = apiSleepStage;
    return nextRecord;
}

async function loadSleepRecord(dateISO: string, shouldApplyToForm: boolean) {
    if (!isValidUserId(activeUserId.value)) return null;
    isLoadingSleep.value = true;
    try {
        const data = await ApiSleep.getRecordByDate(
            activeUserId.value,
            dateISO,
        );
        if (!hasSleepRecordPayload(data)) {
            removeSleepRecord(dateISO);
            return null;
        }
        const record = normalizeSleepRecord(data, dateISO);
        upsertSleepRecord(record, true);
        if (shouldApplyToForm) applySleepRecordToForm(record);
        if (record.dateISO === todayISO) todayRecordUpdated.value = true;
        return record;
    } catch (error) {
        console.error("读取睡眠记录失败", error);
        showToast("睡眠记录读取失败，请稍后重试");
        return null;
    } finally {
        isLoadingSleep.value = false;
    }
}

async function loadWeeklyStats() {
    if (!isValidUserId(activeUserId.value)) return;
    try {
        const stats = await ApiSleep.getWeeklyStats(activeUserId.value);
        weeklyStats.value = Array.isArray(stats) ? stats : [];
    } catch (error) {
        console.error("读取近七日睡眠趋势失败", error);
        weeklyStats.value = [];
    }
}

async function reloadSleepDataForActiveUser() {
    if (!isValidUserId(activeUserId.value)) return;
    if (loadedUserId !== activeUserId.value) {
        sleepRecords.value = {};
        savedRecordDates.value = {};
        weeklyStats.value = [];
        todayRecordUpdated.value = false;
    }
    loadedUserId = activeUserId.value;
    await Promise.all([loadSleepRecord(todayISO, true), loadWeeklyStats()]);
}

async function persistSleepRecord(record: SleepRecord, successMessage: string) {
    if (!isValidUserId(activeUserId.value)) {
        throw new Error("缺少登录用户 ID");
    }
    let recordToPersist = record;
    if (
        recordToPersist.serverId == null &&
        savedRecordDates.value[record.dateISO] === true
    ) {
        const latestRecord = await loadSleepRecord(record.dateISO, false);
        if (latestRecord?.serverId != null) {
            recordToPersist = withServerRecord(
                record,
                latestRecord.serverId,
                record.apiSleepStage ?? latestRecord.apiSleepStage,
            );
        }
    }

    const shouldUpdate = recordToPersist.serverId != null;
    const payload = buildSleepRecordPayload(recordToPersist);
    let response: SleepRecordDTO;
    try {
        response = shouldUpdate
            ? await ApiSleep.updateRecord(payload)
            : await ApiSleep.createRecord(payload);
    } catch (error) {
        if (shouldUpdate) throw error;
        const latestRecord = await loadSleepRecord(record.dateISO, false);
        if (latestRecord?.serverId == null) throw error;
        response = await ApiSleep.updateRecord(
            buildSleepRecordPayload(
                withServerRecord(
                    record,
                    latestRecord.serverId,
                    record.apiSleepStage ?? latestRecord.apiSleepStage,
                ),
            ),
        );
    }
    const savedRecord = hasSleepRecordPayload(response)
        ? normalizeSleepRecord(response, record.dateISO)
        : record;
    upsertSleepRecord(savedRecord, true);
    if (savedRecord.dateISO === todayISO) todayRecordUpdated.value = true;
    if (savedRecord.serverId == null) {
        await loadSleepRecord(savedRecord.dateISO, false);
    }
    await loadWeeklyStats();
    showToast(successMessage);
}

function showToast(message: string) {
    toastMessage.value = message;
    if (toastTimer) clearTimeout(toastTimer);
    savedToast.value = true;
    toastTimer = setTimeout(() => {
        savedToast.value = false;
    }, 2200);
}

function toggleSleepCardFlip() {
    isSleepCardFlipped.value = !isSleepCardFlipped.value;
}

function openTimePicker(field: TimeField) {
    const source = field === "sleep" ? sleepTime.value : wakeTime.value;
    const parsed = parseTime(source);
    pickerField.value = field;
    draftHour.value = parsed.hour;
    draftMinute.value = parsed.minute;
    showTimePicker.value = true;
}

function closeTimePicker() {
    showTimePicker.value = false;
}

function setDraftTime(time: string) {
    const parsed = parseTime(time);
    draftHour.value = parsed.hour;
    draftMinute.value = parsed.minute;
}

function confirmTime() {
    const nextValue = formatTime(draftHour.value, draftMinute.value);
    if (pickerField.value === "sleep") sleepTime.value = nextValue;
    else wakeTime.value = nextValue;
    closeTimePicker();
}

function calcDurationMinutes() {
    return calcDurationBetween(sleepTime.value, wakeTime.value);
}

const durationMinutes = computed(() => calcDurationMinutes());
const durationText = computed(() => {
    const minutes = durationMinutes.value;
    return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
});

const deepSleepRate = computed(() =>
    Math.min(
        38,
        Math.max(
            12,
            sleepQuality.value * 6 +
                (sleepTagSelected.value.includes("沉睡") ? 6 : 0) -
                (wakeCount.value === "3+ 次" ? 8 : 0),
        ),
    ),
);
const pickerTitle = computed(() =>
    pickerField.value === "sleep" ? "选择入睡时间" : "选择起床时间",
);
const draftTimeText = computed(() =>
    formatTime(draftHour.value, draftMinute.value),
);
const pickerPeriod = computed(() =>
    draftHour.value < 6
        ? "凌晨"
        : draftHour.value < 12
          ? "上午"
          : draftHour.value < 18
            ? "下午"
            : "夜间",
);
const clockHandStyle = computed(() => ({
    transform: `translateX(-50%) rotate(${(draftHour.value % 12) * 30 + draftMinute.value * 0.5}deg)`,
}));

const scheduleItems = computed(() => [
    {
        time: "06:30",
        desc: "寅时末起床，温水一杯",
        active: wakeTime.value <= "06:45",
    },
    { time: "12:30", desc: "午时小憩 20 分钟（养心）", active: true },
    { time: "18:00", desc: "晚餐七分饱，少油少盐", active: false },
    {
        time: "21:00",
        desc: "温水泡脚 15 分钟",
        active: sleepTagSelected.value.includes("入睡慢"),
    },
    {
        time: "22:30",
        desc: "放下手机，进入睡前状态",
        active: sleepTime.value <= "22:45",
    },
    {
        time: "23:00",
        desc: "熄灯入眠，子时入睡养肝胆",
        active: sleepTime.value <= "23:00",
    },
]);

function isSleepTagDisabled(tag: string) {
    if (sleepTagSelected.value.includes(tag)) return false;
    return sleepTagSelected.value.some((selected) =>
        conflictMap[selected]?.includes(tag),
    );
}

function toggleSleepTag(tag: string) {
    if (isSleepTagDisabled(tag)) return;
    const idx = sleepTagSelected.value.indexOf(tag);
    if (idx >= 0) {
        sleepTagSelected.value.splice(idx, 1);
        return;
    }
    const conflicts = conflictMap[tag] || [];
    sleepTagSelected.value = sleepTagSelected.value.filter(
        (selected) => !conflicts.includes(selected),
    );
    sleepTagSelected.value.push(tag);
}

function wakeCountToOption(count: number) {
    if (count <= 0) return "0 次";
    if (count === 1) return "1 次";
    if (count === 2) return "2 次";
    return "3+ 次";
}

function applyAwakeCount(count: number) {
    awakeCount.value = Math.max(0, count);
    wakeCount.value = wakeCountToOption(awakeCount.value);
}

function buildMockPhoneSleepData(): ImportedSleepData {
    return {
        sleepTime: "23:06",
        wakeTime: "06:52",
        quality: 5,
        awakeCount: 2,
        tags: ["入睡快", "沉睡"],
        stages: buildStageSegments("23:06", "06:52", 2),
    };
}

function applyImportedSleepData(data: ImportedSleepData) {
    recordDateISO.value = todayISO;
    sleepTime.value = data.sleepTime;
    wakeTime.value = data.wakeTime;
    sleepQuality.value = data.quality;
    applyAwakeCount(data.awakeCount);
    sleepTagSelected.value = data.tags;
    sleepRecords.value = {
        ...sleepRecords.value,
        [todayISO]: {
            ...data,
            dateISO: todayISO,
            stages:
                data.stages ??
                buildStageSegments(
                    data.sleepTime,
                    data.wakeTime,
                    data.awakeCount,
                ),
        },
    };
    todayRecordUpdated.value = true;
}

function clearPhoneImportTimers() {
    phoneImportTimers.forEach((timer) => clearTimeout(timer));
    phoneImportTimers = [];
}

function setPhoneImportState(
    status: PhoneImportStatus,
    stepIndex: number,
    delay: number,
) {
    const timer = setTimeout(() => {
        phoneImportStatus.value = status;
        phoneImportStepIndex.value = stepIndex;

        if (status === "completed") {
            applyImportedSleepData(buildMockPhoneSleepData());
            void persistSleepRecord(
                buildCurrentSleepRecord(todayISO),
                "手机睡眠数据已同步",
            ).catch((error: unknown) => {
                console.error("手机睡眠数据保存失败", error);
                showToast("手机数据已导入，保存到后端失败");
            });
        }
    }, delay);
    phoneImportTimers.push(timer);
}

function startPhoneTransfer() {
    clearPhoneImportTimers();
    showPhoneImportPanel.value = true;
    phoneImportStatus.value = "checking";
    phoneImportStepIndex.value = 0;
    setPhoneImportState("connected", 1, 700);
    setPhoneImportState("opening", 2, 1350);
    setPhoneImportState("transferring", 3, 2050);
    setPhoneImportState("completed", 4, 2950);
}

function resetSleepForm() {
    sleepTime.value = initialSleepTime;
    wakeTime.value = initialWakeTime;
    sleepQuality.value = 4;
    applyAwakeCount(1);
    sleepTagSelected.value = ["入睡慢", "沉睡"];
}

async function saveSleep() {
    normalizeRecordDate();
    isSavingSleep.value = true;
    try {
        const shouldUpdate =
            savedRecordDates.value[recordDateISO.value] === true;
        await persistSleepRecord(
            buildCurrentSleepRecord(recordDateISO.value),
            shouldUpdate
                ? "睡眠记录已更新，今日建议已同步"
                : "睡眠记录已新增，今日建议已同步",
        );
    } catch (error) {
        console.error("保存睡眠记录失败", error);
        showToast("睡眠记录保存失败，请稍后重试");
    } finally {
        isSavingSleep.value = false;
    }
}

function toggleAudio(title: string) {
    const wasPlaying = allAudios.value.find(
        (audio) => audio.title === title,
    )?.playing;
    allAudios.value.forEach((audio) => {
        audio.playing = audio.title === title ? !wasPlaying : false;
    });
}

onMounted(() => {
    void reloadSleepDataForActiveUser();
});

watch(activeUserId, (userId) => {
    if (isValidUserId(userId) && userId !== loadedUserId) {
        void reloadSleepDataForActiveUser();
    }
});

watch(showTimePicker, (visible) => {
    if (typeof document !== "undefined") {
        document.body.style.overflow = visible ? "hidden" : "";
    }
});

onBeforeUnmount(() => {
    if (toastTimer) clearTimeout(toastTimer);
    clearPhoneImportTimers();
    if (typeof document !== "undefined") {
        document.body.style.overflow = "";
    }
});
</script>

<style scoped lang="scss">
.sleep-panel {
    position: relative;
}

.module-card {
    box-shadow: var(--shadow-lg);
    animation: cardRise 0.32s ease both;
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
.toast-pop-leave-active,
.modal-soft-enter-active,
.modal-soft-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}
.toast-pop-enter-from,
.toast-pop-leave-to {
    opacity: 0;
    transform: translate(-50%, -12px);
}
.modal-soft-enter-from,
.modal-soft-leave-to {
    opacity: 0;
}
.modal-soft-enter-from .time-picker,
.modal-soft-leave-to .time-picker {
    transform: translateY(18px) scale(0.98);
}

.sleep-input {
    background: linear-gradient(135deg, #fdfaf3 0%, #f0e8d5 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
}
.sleep-input::after {
    content: "📝";
    position: absolute;
    right: 24px;
    top: 24px;
    font-size: 40px;
    opacity: 0.28;
}
.sleep-input-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
}
.sleep-head-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
}
.eyebrow {
    font-size: 12px;
    color: var(--gold-deep);
    letter-spacing: 2px;
    margin-bottom: 4px;
}
.sleep-input-head h3,
.time-picker-head h3 {
    font-family: "STKaiti", serif;
    font-size: 22px;
    color: var(--ink);
    font-weight: 600;
}
.phone-sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    border: 1px solid rgba(92, 131, 116, 0.22);
    border-radius: 999px;
    background: color-mix(in srgb, var(--jade-soft) 78%, white);
    color: var(--jade);
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 14px 7px 10px;
    box-shadow: 0 8px 20px rgba(92, 131, 116, 0.08);
    transition:
        background-color 0.22s ease,
        border-color 0.22s ease,
        color 0.22s ease,
        box-shadow 0.22s ease,
        transform 0.22s ease;
}
.phone-sync-btn:hover:not(:disabled) {
    background: var(--jade-soft);
    border-color: var(--jade);
    transform: translateY(-1px);
}
.phone-sync-btn:disabled {
    cursor: wait;
    opacity: 0.72;
}
.phone-sync-icon {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--jade);
    color: white;
    font-size: 13px;
}
.phone-import-panel {
    margin: -4px 0 18px;
    padding: 14px 16px;
    border: 1px solid rgba(92, 131, 116, 0.2);
    border-radius: 16px;
    background: color-mix(in srgb, var(--jade-soft) 58%, white);
    box-shadow: 0 14px 30px rgba(92, 131, 116, 0.1);
}
.phone-import-main {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}
.phone-import-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: var(--jade);
    color: white;
    font-size: 18px;
}
.phone-import-main strong {
    color: var(--ink);
    font-size: 14px;
}
.phone-import-main p {
    margin-top: 4px;
    color: var(--ink-muted);
    font-size: 12px;
    line-height: 1.6;
}
.phone-import-steps {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
}
.phone-step {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 7px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.58);
    color: var(--ink-muted);
    font-size: 11px;
    transition: all 0.2s;
}
.phone-step span {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: var(--line);
    color: var(--ink-muted);
    font-size: 10px;
}
.phone-step.active {
    background: var(--paper);
    color: var(--jade);
    box-shadow: 0 8px 16px rgba(92, 131, 116, 0.1);
}
.phone-step.active span,
.phone-step.done span {
    background: var(--jade);
    color: white;
}
.phone-step.done {
    color: var(--jade);
}
.phone-import-close {
    margin-top: 12px;
    border: none;
    background: transparent;
    color: var(--jade);
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
}
.import-slide-enter-active,
.import-slide-leave-active,
.summary-soft-enter-active,
.summary-soft-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}
.import-slide-enter-from,
.import-slide-leave-to,
.summary-soft-enter-from,
.summary-soft-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
.sleep-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.time-input-group {
    text-align: left;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 16px 18px;
    transition: all 0.2s;
    cursor: pointer;
    font-family: inherit;
}
.time-input-group:hover,
.time-input-group:focus-visible {
    border-color: var(--jade);
    box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.12);
    transform: translateY(-1px);
    outline: none;
}
.time-input-label {
    font-size: 12px;
    color: var(--ink-muted);
    letter-spacing: 2px;
    margin-bottom: 6px;
}
.time-display {
    font-family: "STKaiti", serif;
    font-size: 32px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.1;
}
.time-hint {
    display: inline-block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--jade);
}
.time-extra {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
}
.quality-stars {
    display: flex;
    gap: 6px;
    align-items: center;
}
.star {
    border: none;
    background: transparent;
    font-size: 26px;
    cursor: pointer;
    color: var(--line);
    transition: all 0.15s;
    line-height: 1;
}
.star:hover,
.star.active {
    color: var(--gold);
    transform: scale(1.1);
}
.tag-pick {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.pick-chip {
    padding: 5px 12px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 14px;
    font-family: inherit;
    font-size: 12px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.2s;
}
.pick-chip:hover:not(:disabled) {
    border-color: var(--jade);
    color: var(--jade);
}
.pick-chip.active {
    background: var(--jade-soft);
    border-color: var(--jade);
    color: var(--jade);
    font-weight: 500;
}
.pick-chip:disabled {
    opacity: 0.38;
    cursor: not-allowed;
}
.wake-row .pick-chip:disabled {
    opacity: 1;
    cursor: default;
}
.wake-row .pick-chip:not(.active):disabled {
    background: rgba(255, 255, 255, 0.52);
    color: color-mix(in srgb, var(--ink-muted) 76%, white);
}
.form-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
.wake-row {
    margin-top: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
}
.tag-row {
    align-items: flex-start;
}
.form-row .lbl {
    font-size: 13px;
    color: var(--ink-muted);
    min-width: 64px;
}
.logic-note {
    margin-top: 8px;
    padding-left: 80px;
    font-size: 12px;
    color: var(--ink-muted);
}
.duration-display {
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--jade-soft);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--jade);
}
.duration-display strong {
    font-family: "STKaiti", serif;
    font-size: 20px;
    font-weight: 600;
}
.submit-row {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.summary-grid {
    margin-bottom: 20px;
    align-items: stretch;
}
.summary-grid > .card {
    margin-top: 0;
    display: flex;
    flex-direction: column;
}
.sleep-summary-shell {
    height: 430px;
    border-radius: 16px;
    background: transparent;
    cursor: pointer;
    perspective: 1200px;
    outline: none;
    align-self: start;
}
.sleep-summary-shell:focus-visible {
    box-shadow:
        var(--shadow-lg),
        0 0 0 3px rgba(92, 131, 116, 0.18);
}
.sleep-flip-card {
    position: relative;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
}
.sleep-summary-shell.flipped .sleep-flip-card {
    transform: rotateY(180deg);
}
.sleep-card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}
.sleep-face-front {
    transform: rotateY(0deg);
}
.sleep-face-back {
    transform: rotateY(180deg);
}
.sleep-summary {
    background: linear-gradient(135deg, #2c3e50 0%, #4a5f7a 100%);
    color: white;
    border-radius: 16px;
    padding: 28px;
    box-sizing: border-box;
    overflow: hidden;
    height: 100%;
}
.sleep-face-front::after {
    content: "🌙";
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 60px;
    opacity: 0.3;
}
.sleep-summary .label {
    font-size: 12px;
    opacity: 0.7;
    letter-spacing: 2px;
}
.sleep-score {
    font-family: "STKaiti", serif;
    font-size: 56px;
    font-weight: 600;
    margin: 8px 0;
}
.sleep-score span {
    font-size: 18px;
    opacity: 0.6;
    margin-left: 4px;
}
.summary-line {
    opacity: 0.85;
    font-size: 14px;
}
.sleep-stats {
    display: flex;
    gap: 24px;
    margin-top: 16px;
    font-size: 13px;
    flex-wrap: wrap;
}
.sleep-stats .stat {
    opacity: 0.85;
}
.sleep-stats .stat strong {
    display: block;
    font-size: 18px;
    opacity: 1;
}
.sleep-stage-head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}
.sleep-stage-head strong {
    display: block;
    margin-top: 10px;
    font-family: "STKaiti", serif;
    font-size: 22px;
    color: rgba(250, 252, 248, 0.96);
}
.summary-date-picker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid rgba(244, 237, 223, 0.26);
    border-radius: 999px;
    background: rgba(244, 237, 223, 0.1);
    color: rgba(250, 252, 248, 0.88);
    cursor: default;
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}
.summary-date-picker:hover {
    background: rgba(244, 237, 223, 0.16);
    border-color: rgba(244, 237, 223, 0.42);
    box-shadow: 0 8px 18px rgba(23, 32, 42, 0.18);
}
.summary-date-picker input {
    width: 118px;
    border: none;
    background: transparent;
    color: rgba(250, 252, 248, 0.95);
    color-scheme: dark;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    outline: none;
}
.stage-overview-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 18px;
}
.stage-overview-strip span {
    min-width: 0;
    padding: 8px 10px;
    border-radius: 12px;
    background: rgba(244, 237, 223, 0.1);
    color: rgba(250, 252, 248, 0.62);
    font-size: 11px;
}
.stage-overview-strip strong {
    display: block;
    margin-top: 4px;
    color: rgba(250, 252, 248, 0.96);
    font-size: 13px;
    white-space: nowrap;
}
.stage-chart {
    display: grid;
    grid-template-columns: 42px 1fr;
    column-gap: 10px;
    margin-top: 18px;
}
.stage-y-labels {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18px 0 30px;
    color: rgba(250, 252, 248, 0.64);
    font-size: 12px;
}
.stage-svg {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    height: 166px;
    overflow: visible;
}
.stage-grid {
    stroke: rgba(244, 237, 223, 0.16);
    stroke-width: 1;
}
.stage-connector {
    stroke: rgba(244, 237, 223, 0.22);
    stroke-width: 2;
}
.stage-block {
    filter: drop-shadow(0 4px 10px rgba(9, 14, 21, 0.22));
}
.stage-block.awake {
    fill: #f07c8b;
}
.stage-block.light {
    fill: #2fd0e6;
}
.stage-block.deep {
    fill: #2769d8;
}
.stage-time-axis {
    grid-column: 2;
    display: flex;
    justify-content: space-between;
    margin-top: 2px;
    color: rgba(250, 252, 248, 0.56);
    font-size: 11px;
}
.stage-empty {
    margin-top: 26px;
    min-height: 184px;
    display: grid;
    place-items: center;
    border: 1px dashed rgba(244, 237, 223, 0.22);
    border-radius: 12px;
    color: rgba(250, 252, 248, 0.62);
    font-size: 13px;
}
.stage-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
}
.stage-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(244, 237, 223, 0.1);
    color: rgba(250, 252, 248, 0.72);
    font-size: 12px;
}
.stage-legend i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}
.stage-legend strong {
    color: rgba(250, 252, 248, 0.94);
    font-weight: 600;
}
.stage-legend .awake i {
    background: #f07c8b;
}
.stage-legend .light i {
    background: #2fd0e6;
}
.stage-legend .deep i {
    background: #2769d8;
}

.sleep-chart {
    height: 140px;
    margin-top: 12px;
    position: relative;
}
.chart-svg {
    width: 100%;
    height: 100%;
}
.chart-grid {
    stroke: var(--line);
    stroke-width: 1;
}
.chart-line {
    fill: none;
    stroke: var(--jade);
    stroke-width: 2.5;
}
.chart-area {
    fill: url(#sleepGrad);
    opacity: 0.4;
}
.chart-dot {
    fill: var(--jade);
    cursor: pointer;
    outline: none;
    transition:
        r 0.18s ease,
        filter 0.18s ease,
        stroke-width 0.18s ease;
}
.chart-dot.today {
    fill: var(--cinnabar);
}
.chart-dot:hover,
.chart-dot:focus-visible {
    filter: drop-shadow(0 4px 8px rgba(92, 131, 116, 0.28));
    stroke: var(--paper);
    stroke-width: 3;
}
.chart-tooltip {
    position: absolute;
    z-index: 2;
    min-width: 126px;
    padding: 8px 10px;
    border: 1px solid rgba(92, 131, 116, 0.22);
    border-radius: 10px;
    background: color-mix(in srgb, var(--paper) 94%, var(--jade-soft));
    box-shadow: 0 12px 26px rgba(44, 54, 57, 0.14);
    color: var(--ink);
    pointer-events: none;
}
.chart-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -6px;
    width: 10px;
    height: 10px;
    border-right: 1px solid rgba(92, 131, 116, 0.22);
    border-bottom: 1px solid rgba(92, 131, 116, 0.22);
    background: color-mix(in srgb, var(--paper) 94%, var(--jade-soft));
    transform: translateX(-50%) rotate(45deg);
}
.chart-tooltip span,
.chart-tooltip strong {
    display: block;
    white-space: nowrap;
}
.chart-tooltip span {
    color: var(--ink-muted);
    font-size: 11px;
}
.chart-tooltip strong {
    margin-top: 3px;
    color: var(--jade);
    font-size: 13px;
    font-weight: 700;
}
.chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 8px;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    padding-left: 28px;
}
.timeline::before {
    content: "";
    position: absolute;
    left: 6px;
    top: 6px;
    bottom: 6px;
    width: 2px;
    background: var(--line);
}
.timeline-item {
    position: relative;
    padding: 10px 0;
    display: flex;
    align-items: center;
    gap: 12px;
}
.timeline-item::before {
    content: "";
    position: absolute;
    left: -25px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--paper);
    border: 2px solid var(--jade-light);
}
.timeline-item.active::before {
    background: var(--jade);
    border-color: var(--jade);
}
.time-tag {
    font-weight: 600;
    color: var(--ink);
    font-size: 14px;
    width: 60px;
}
.time-desc {
    color: var(--ink-muted);
    font-size: 13px;
}

.audio-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: transparent;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
}
.audio-row:hover,
.audio-row.playing {
    background: var(--cream);
    transform: translateX(3px);
}
.audio-play {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--jade-soft);
    color: var(--jade);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}
.audio-row.playing .audio-play {
    background: var(--jade);
    color: white;
}
.audio-info {
    flex: 1;
    text-align: left;
}
.audio-title {
    font-size: 14px;
    font-weight: 500;
}
.audio-meta {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
}

.time-picker-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.38);
}
.time-picker {
    width: min(760px, 100%);
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    border-radius: 18px;
    padding: 24px;
    transition: transform 0.22s ease;
}
.time-picker-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
}
.modal-close {
    width: 36px;
    height: 36px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
}
.wheel-board {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 22px;
    align-items: center;
}
.clock-preview {
    width: 240px;
    height: 240px;
    margin: 0 auto;
    border-radius: 50%;
    border: 12px solid var(--jade-soft);
    background:
        radial-gradient(circle, var(--paper) 0 58%, transparent 59%),
        conic-gradient(
            from -90deg,
            var(--gold-soft),
            var(--jade-soft),
            var(--gold-soft)
        );
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
.clock-dot {
    width: 10px;
    height: 10px;
    background: var(--jade);
    border-radius: 50%;
    position: absolute;
    z-index: 2;
}
.clock-hand {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 4px;
    height: 78px;
    margin-top: -78px;
    transform-origin: 50% 100%;
    background: var(--jade);
    border-radius: 999px;
    transition: transform 0.2s ease;
}
.clock-preview strong {
    font-family: "STKaiti", serif;
    font-size: 36px;
    color: var(--ink);
}
.clock-preview em {
    font-style: normal;
    color: var(--ink-muted);
    font-size: 13px;
}
.wheel-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}
.wheel-label {
    font-size: 12px;
    color: var(--ink-muted);
    margin-bottom: 8px;
    text-align: center;
}
.wheel-column {
    height: 230px;
    overflow: auto;
    padding: 76px 8px;
    border-radius: 14px;
    background: var(--paper-warm);
    border: 1px solid var(--line);
    scroll-snap-type: y mandatory;
}
.wheel-option {
    display: block;
    width: 100%;
    height: 38px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--ink-muted);
    font-family: "STKaiti", serif;
    font-size: 22px;
    cursor: pointer;
    scroll-snap-align: center;
}
.wheel-option:hover,
.wheel-option.active {
    background: var(--jade);
    color: white;
}
.quick-times {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
}
.quick-times button {
    border: 1px solid var(--line);
    background: var(--paper-warm);
    color: var(--ink-muted);
    border-radius: 999px;
    padding: 6px 12px;
    font-family: inherit;
    cursor: pointer;
}
.quick-times button:hover {
    border-color: var(--jade);
    color: var(--jade);
}
.picker-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
}

.card {
    background: var(--paper);
    border-radius: 14px;
    padding: 24px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    margin-top: 20px;
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
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
}
.metric-text {
    font-size: 12px;
    color: var(--ink-muted);
}
.metric-text strong {
    color: var(--jade);
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
    cursor: wait;
    opacity: 0.68;
    transform: none;
}
.btn-ghost {
    background: transparent;
    color: var(--jade);
    border: 1px solid var(--jade);
}
.btn-ghost:hover {
    background: var(--jade-soft);
}

@media (max-width: 900px) {
    .grid-2,
    .sleep-form,
    .time-extra,
    .wheel-board {
        grid-template-columns: 1fr;
    }
    .clock-preview {
        width: 210px;
        height: 210px;
    }
}

@media (max-width: 640px) {
    .sleep-input,
    .card,
    .time-picker {
        padding: 20px;
    }
    .sleep-input-head,
    .row {
        align-items: flex-start;
        flex-direction: column;
    }
    .form-row {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
    }
    .logic-note {
        padding-left: 0;
    }
    .sleep-summary-shell {
        height: 440px;
    }
    .sleep-stage-head {
        flex-direction: column;
    }
    .summary-date-picker {
        align-self: flex-start;
    }
    .stage-overview-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .stage-chart {
        grid-template-columns: 36px 1fr;
        column-gap: 8px;
    }
    .stage-legend {
        gap: 8px;
    }
    .time-picker-backdrop {
        align-items: flex-end;
        padding: 14px;
    }
    .wheel-columns {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
