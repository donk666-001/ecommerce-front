<template>
    <div class="sleep-panel">
        <Transition name="toast-pop">
            <div v-if="savedToast" class="save-toast">
                睡眠记录已保存，今日建议已同步更新
            </div>
        </Transition>

        <section class="sleep-input module-card">
            <div class="sleep-input-head">
                <div>
                    <div class="eyebrow">SLEEP LOG · 睡眠作息</div>
                    <h3>记录睡眠</h3>
                </div>
                <button
                    class="date-sel"
                    type="button"
                    @click="recordDate = nextRecordDate"
                >
                    📅 {{ recordDate }} ▾
                </button>
            </div>

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
                                @click="wakeCount = n"
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
                <button class="btn" type="button" @click="saveSleep">
                    保存记录
                </button>
            </div>
        </section>

        <div class="grid-2 summary-grid">
            <section class="sleep-summary module-card">
                <div class="label">LAST NIGHT · 昨夜</div>
                <div class="sleep-score">{{ sleepScore }}<span>/100</span></div>
                <div class="summary-line">
                    {{ durationText }} · {{ sleepStatusText }} · 深睡比例
                    {{ deepSleepRate }}%
                </div>
                <div class="sleep-stats">
                    <div class="stat">
                        <strong>{{ sleepTime }}</strong
                        >入睡
                    </div>
                    <div class="stat">
                        <strong>{{ wakeTime }}</strong
                        >清醒
                    </div>
                    <div class="stat">
                        <strong>{{ wakeCountLabel }}</strong
                        >夜醒
                    </div>
                    <div class="stat">
                        <strong>⭐ {{ sleepQuality }}</strong
                        >自评
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

        <section class="card module-card">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>近 7 日睡眠趋势
                </div>
                <div class="metric-text">
                    平均 <strong>7h 28min</strong> · 较上周 ↑ 12 分钟
                </div>
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
                        class="chart-area"
                        d="M 50 90 L 150 60 L 250 75 L 350 45 L 450 55 L 550 30 L 650 40 L 650 140 L 50 140 Z"
                    />
                    <path
                        class="chart-line"
                        d="M 50 90 L 150 60 L 250 75 L 350 45 L 450 55 L 550 30 L 650 40"
                    />
                    <circle
                        v-for="point in chartPoints"
                        :key="point.cx"
                        class="chart-dot"
                        :class="{ today: point.today }"
                        :cx="point.cx"
                        :cy="point.cy"
                        r="4"
                    />
                </svg>
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
import { computed, onBeforeUnmount, ref, watch } from "vue";

type TimeField = "sleep" | "wake";
type AudioItem = { title: string; meta: string; playing: boolean };

const initialSleepTime = "23:18";
const initialWakeTime = "07:00";
const sleepTime = ref(initialSleepTime);
const wakeTime = ref(initialWakeTime);
const sleepQuality = ref(4);
const wakeCount = ref("1 次");
const recordDate = ref("昨夜 · 2026 年 5 月 18 日");
const nextRecordDate = "昨夜 · 2026 年 5 月 19 日";
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

const showTimePicker = ref(false);
const pickerField = ref<TimeField>("sleep");
const draftHour = ref(23);
const draftMinute = ref(18);
const savedToast = ref(false);
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
const chartLabels = ["5/12", "5/13", "5/14", "5/15", "5/16", "5/17", "5/18"];
const chartPoints = [
    { cx: 50, cy: 90 },
    { cx: 150, cy: 60 },
    { cx: 250, cy: 75 },
    { cx: 350, cy: 45 },
    { cx: 450, cy: 55 },
    { cx: 550, cy: 30 },
    { cx: 650, cy: 40, today: true },
];

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

function padTime(value: number) {
    return String(value).padStart(2, "0");
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
    const sleep = parseTime(sleepTime.value);
    const wake = parseTime(wakeTime.value);
    let minutes =
        wake.hour * 60 + wake.minute - (sleep.hour * 60 + sleep.minute);
    if (minutes <= 0) minutes += 24 * 60;
    return minutes;
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
const wakeCountLabel = computed(() => wakeCount.value);
const sleepStatusText = computed(() => sleepTagSelected.value[0] || "状态平稳");
const sleepScore = computed(() => {
    const duration = durationMinutes.value;
    const durationScore =
        duration >= 420 && duration <= 540
            ? 26
            : Math.max(10, 26 - Math.abs(duration - 480) / 20);
    const wakePenalty =
        wakeCount.value === "0 次"
            ? 0
            : wakeCount.value === "1 次"
              ? 4
              : wakeCount.value === "2 次"
                ? 8
                : 14;
    const tagBonus = sleepTagSelected.value.includes("入睡快")
        ? 6
        : sleepTagSelected.value.includes("入睡慢")
          ? -6
          : 0;
    const raw =
        sleepQuality.value * 12 + durationScore - wakePenalty + tagBonus;
    return Math.round(Math.min(100, Math.max(45, raw)));
});

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

function resetSleepForm() {
    sleepTime.value = initialSleepTime;
    wakeTime.value = initialWakeTime;
    sleepQuality.value = 4;
    wakeCount.value = "1 次";
    sleepTagSelected.value = ["入睡慢", "沉睡"];
}

function saveSleep() {
    if (toastTimer) clearTimeout(toastTimer);
    savedToast.value = true;
    toastTimer = setTimeout(() => {
        savedToast.value = false;
    }, 2200);
}

function toggleAudio(title: string) {
    const wasPlaying = allAudios.value.find(
        (audio) => audio.title === title,
    )?.playing;
    allAudios.value.forEach((audio) => {
        audio.playing = audio.title === title ? !wasPlaying : false;
    });
}

watch(showTimePicker, (visible) => {
    if (typeof document !== "undefined") {
        document.body.style.overflow = visible ? "hidden" : "";
    }
});

onBeforeUnmount(() => {
    if (toastTimer) clearTimeout(toastTimer);
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
.date-sel {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 6px 14px;
    font-family: inherit;
    font-size: 13px;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
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
.form-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
.wake-row {
    margin-top: 12px;
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
}
.sleep-summary {
    background: linear-gradient(135deg, #2c3e50 0%, #4a5f7a 100%);
    color: white;
    border-radius: 16px;
    padding: 28px;
    position: relative;
    overflow: hidden;
}
.sleep-summary::after {
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
}
.chart-dot.today {
    fill: var(--cinnabar);
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
    .time-picker-backdrop {
        align-items: flex-end;
        padding: 14px;
    }
    .wheel-columns {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
