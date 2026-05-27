<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1fr 1.3fr">
            <div class="cycle-card">
                <div class="cycle-ring">
                    <svg viewBox="0 0 200 200">
                        <circle class="cycle-bg" cx="100" cy="100" r="80" />
                        <circle class="cycle-fg" cx="100" cy="100" r="80" />
                    </svg>
                    <div class="cycle-num">
                        <div class="big">{{ activeMonth.daysLeft }}</div>
                        <div class="label">DAYS LEFT</div>
                    </div>
                </div>
                <div
                    style="font-size: 14px; color: var(--ink); font-weight: 600"
                >
                    距下次月经
                </div>
                <div class="cycle-phase">{{ activeMonth.phase }}</div>
                <div
                    style="
                        margin-top: 16px;
                        font-size: 13px;
                        color: var(--ink-muted);
                        line-height: 1.6;
                    "
                >
                    {{ activeMonth.phaseAdvice }}
                </div>
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0">
                        <span class="dot"></span>{{ calendarTitle }}
                    </div>
                    <div class="month-switch">
                        <button
                            type="button"
                            :disabled="activeMonthIndex === 0"
                            @click="switchMonth(-1)"
                        >
                            ‹
                        </button>
                        <span>{{ visibleMonth }}</span>
                        <button
                            type="button"
                            :disabled="
                                activeMonthIndex === monthProfiles.length - 1
                            "
                            @click="switchMonth(1)"
                        >
                            ›
                        </button>
                    </div>
                </div>
                <div class="calendar">
                    <div class="cal-head">日</div>
                    <div class="cal-head">一</div>
                    <div class="cal-head">二</div>
                    <div class="cal-head">三</div>
                    <div class="cal-head">四</div>
                    <div class="cal-head">五</div>
                    <div class="cal-head">六</div>
                    <button
                        v-for="day in calDays"
                        :key="day.key"
                        class="cal-day"
                        :class="[
                            day.cls,
                            { selected: selectedDayKey === day.key },
                        ]"
                        type="button"
                        @click="selectDay(day)"
                    >
                        <span class="day-num">{{ day.text }}</span>
                        <span
                            v-if="day.cls.includes('today')"
                            class="today-badge"
                            >今日</span
                        >
                    </button>
                </div>
                <div class="calendar-legend">
                    <span><i class="legend-swatch period"></i>经期</span>
                    <span><i class="legend-swatch ovul"></i>排卵期</span>
                    <span><i class="legend-swatch predict"></i>预测经期</span>
                    <span
                        ><i class="legend-swatch overlap"></i>经期 +
                        预测重合</span
                    >
                </div>
                <div class="selected-day-panel">
                    <strong>{{ selectedDayText }}</strong>
                    <span>{{ selectedDayAdvice }}</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>今日身体记录
                </div>
                <button
                    class="btn btn-ghost"
                    type="button"
                    @click="saveSymptoms"
                >
                    {{ symptomSaved ? "已保存" : "保存记录" }}
                </button>
            </div>
            <div class="symptom-grid">
                <button
                    v-for="s in symptoms"
                    :key="s.name"
                    class="symptom"
                    :class="{ on: s.on }"
                    type="button"
                    @click="s.on = !s.on"
                >
                    <span class="emoji">{{ s.emoji }}</span
                    >{{ s.name }}
                </button>
            </div>
        </div>

        <div class="card" style="margin-top: 20px">
            <div class="card-title">
                <span class="dot"></span>黄体期养生方案
            </div>
            <div class="grid-3">
                <button
                    v-for="plan in lutealPlans"
                    :key="plan.title"
                    class="tip-row"
                    type="button"
                    @click="selectedPlan = plan"
                >
                    <span class="icon">{{ plan.icon }}</span>
                    <div class="text">
                        <strong>{{ plan.title }}</strong
                        ><br />{{ plan.short }}
                    </div>
                </button>
            </div>
        </div>

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
                            加入今日提醒
                        </button>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type CalendarDay = {
    key: string;
    text: string;
    cls: string;
    dateLabel: string;
};
type MonthProfile = {
    year: number;
    month: number;
    period: number[];
    ovul: number[];
    predict: number[];
    today?: number;
    defaultDay: number;
    daysLeft: number;
    phase: string;
    phaseAdvice: string;
};
type Plan = { icon: string; title: string; short: string; detail: string };

const symptoms = ref([
    { name: "痛经", emoji: "😣", on: true },
    { name: "胀痛", emoji: "🌸", on: false },
    { name: "嗜睡", emoji: "😴", on: false },
    { name: "食欲增", emoji: "🍫", on: true },
    { name: "烦躁", emoji: "😤", on: false },
    { name: "水肿", emoji: "💧", on: false },
    { name: "头痛", emoji: "🤕", on: false },
    { name: "痤疮", emoji: "🔥", on: false },
]);

const monthProfiles: MonthProfile[] = [
    {
        year: 2026,
        month: 4,
        period: [3, 4, 5, 6],
        ovul: [16, 17, 18, 19],
        predict: [30],
        defaultDay: 18,
        daysLeft: 12,
        phase: "黄体期 · 第 17 天",
        phaseAdvice: "本月经期较短，黄体期注意放慢节奏，睡眠和温热饮食优先。",
    },
    {
        year: 2026,
        month: 5,
        period: [2, 3, 4, 5, 6, 7],
        ovul: [15, 16, 17, 18],
        predict: [29, 30, 31],
        today: 19,
        defaultDay: 19,
        daysLeft: 10,
        phase: "黄体期 · 第 18 天",
        phaseAdvice: "本阶段易乏力、情绪起伏，建议慢节奏生活，多食温性食物。",
    },
    {
        year: 2026,
        month: 6,
        period: [1, 2, 3, 4, 5],
        ovul: [14, 15, 16, 17],
        predict: [4, 5, 6, 7],
        defaultDay: 5,
        daysLeft: 27,
        phase: "经期 · 第 5 天",
        phaseAdvice: "本月预测与实际记录有轻微重合，注意观察经量与腹部保暖。",
    },
];

const activeMonthIndex = ref(1);
const selectedDayKey = ref(
    dayKey(monthProfiles[1]!, monthProfiles[1]!.defaultDay),
);
const symptomSaved = ref(false);
const selectedPlan = ref<Plan | null>(null);

const activeMonth = computed<MonthProfile>(
    () => monthProfiles[activeMonthIndex.value] ?? monthProfiles[1]!,
);
const visibleMonth = computed(
    () => `${activeMonth.value.year}年${activeMonth.value.month}月`,
);
const calendarTitle = computed(
    () => `${activeMonth.value.month} 月 · 周期日历`,
);
const calDays = computed<CalendarDay[]>(() =>
    buildCalendarDays(activeMonth.value),
);

const lutealPlans: Plan[] = [
    {
        icon: "🍲",
        title: "温补脾胃",
        short: "红枣桂圆粥、当归乌鸡汤",
        detail: "黄体期可少量温补，晚餐避免生冷甜腻，优先选择温热软食，帮助缓解疲乏与腹部坠胀。",
    },
    {
        icon: "🧘",
        title: "舒缓运动",
        short: "瑜伽婴儿式、八段锦慢练",
        detail: "运动以不出大汗为度，选择拉伸、呼吸和慢节奏练习，帮助稳定情绪并减轻经前紧绷。",
    },
    {
        icon: "🦶",
        title: "泡脚配方",
        short: "艾叶 + 生姜 + 红花，30 分钟",
        detail: "睡前温热泡脚 20 到 30 分钟即可，水温不宜过烫。经量偏多或经期已至时减少红花用量。",
    },
];

const fallbackDay: CalendarDay = {
    key: "2026-5-19",
    text: "19",
    cls: "today",
    dateLabel: "2026年5月19日",
};
const selectedDay = computed<CalendarDay>(
    () =>
        calDays.value.find((day) => day.key === selectedDayKey.value) ??
        fallbackDay,
);
const selectedDayText = computed(() => selectedDay.value.dateLabel);
const selectedDayAdvice = computed(() => {
    if (selectedDay.value.cls.includes("overlap"))
        return "这天是实际经期与预测经期重合日，颜色已做混合提示，建议重点观察记录。";
    if (selectedDay.value.cls.includes("period"))
        return "经期中，注意保暖，运动以舒缓拉伸为主。";
    if (selectedDay.value.cls.includes("ovul"))
        return "排卵期，适合记录分泌物、体温与精力变化。";
    if (selectedDay.value.cls.includes("predict"))
        return "预测经期，提前准备温补饮食与睡眠安排。";
    if (selectedDay.value.cls.includes("today"))
        return "今天处于黄体期，建议少咖啡因，早点休息。";
    return "普通周期日，可保持规律作息与轻量运动。";
});

function selectDay(day: CalendarDay) {
    selectedDayKey.value = day.key;
}

function switchMonth(direction: number) {
    const nextIndex = activeMonthIndex.value + direction;
    if (nextIndex < 0 || nextIndex >= monthProfiles.length) return;
    activeMonthIndex.value = nextIndex;
    const nextMonth = monthProfiles[nextIndex]!;
    selectedDayKey.value = dayKey(nextMonth, nextMonth.defaultDay);
}

function saveSymptoms() {
    symptomSaved.value = true;
    window.setTimeout(() => {
        symptomSaved.value = false;
    }, 1800);
}

function dayKey(profile: MonthProfile, day: number) {
    return `${profile.year}-${profile.month}-${day}`;
}

function buildCalendarDays(profile: MonthProfile) {
    const firstDay = new Date(profile.year, profile.month - 1, 1).getDay();
    const daysInMonth = new Date(profile.year, profile.month, 0).getDate();
    const prevMonthDays = new Date(
        profile.year,
        profile.month - 1,
        0,
    ).getDate();
    const days: CalendarDay[] = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
        const day = prevMonthDays - index;
        days.push({
            key: `${profile.year}-${profile.month}-prev-${day}`,
            text: String(day),
            cls: "muted",
            dateLabel: `上月${day}日`,
        });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const classes: string[] = [];
        const isPeriod = profile.period.includes(day);
        const isPredict = profile.predict.includes(day);
        if (isPeriod && isPredict) classes.push("overlap");
        else if (isPeriod) classes.push("period");
        else if (isPredict) classes.push("predict");
        if (profile.ovul.includes(day)) classes.push("ovul");
        if (profile.today === day) classes.push("today");

        days.push({
            key: dayKey(profile, day),
            text: String(day),
            cls: classes.join(" "),
            dateLabel: `${profile.year}年${profile.month}月${day}日`,
        });
    }

    const nextMonthDayCount = 42 - days.length;
    for (let day = 1; day <= nextMonthDayCount; day += 1) {
        days.push({
            key: `${profile.year}-${profile.month}-next-${day}`,
            text: String(day),
            cls: "muted",
            dateLabel: `下月${day}日`,
        });
    }

    return days;
}
</script>

<style scoped lang="scss">
.cycle-card {
    background: linear-gradient(135deg, var(--pink-soft) 0%, #fff 100%);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.45);
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
    stroke-dashoffset: 200;
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
.cycle-phase {
    display: inline-block;
    padding: 6px 16px;
    background: var(--pink);
    color: white;
    border-radius: 14px;
    font-size: 13px;
    margin-top: 8px;
}
.month-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
    font-size: 12px;
}
.month-switch button {
    width: 26px;
    height: 26px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
}
.month-switch button:hover {
    border-color: var(--pink);
    color: var(--pink);
}
.month-switch button:disabled {
    opacity: 0.42;
    cursor: not-allowed;
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
.cal-day:hover.period,
.cal-day:hover.predict,
.cal-day:hover.ovul,
.cal-day:hover.overlap {
    filter: brightness(0.98);
}
.cal-day.muted {
    color: var(--line);
}
.cal-day.period {
    background: #d78398;
    color: white;
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
.cal-day.today:not(.period):not(.predict):not(.ovul):not(.overlap) {
    background: var(--paper);
}
.cal-day.selected {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
}
.day-num {
    line-height: 1;
}
.today-badge {
    padding: 1px 5px;
    border-radius: 999px;
    background: var(--ink);
    color: white;
    font-size: 10px;
    line-height: 1.4;
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
.legend-swatch.ovul {
    background: #c7dce5;
}
.legend-swatch.predict {
    background: #f6e7eb;
}
.legend-swatch.overlap {
    background: linear-gradient(135deg, #d78398 0%, #f6e7eb 100%);
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

.symptom-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}
.symptom {
    padding: 10px 8px;
    text-align: center;
    border-radius: 10px;
    background: var(--cream);
    font-size: 12px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
    font-family: inherit;
    color: var(--ink-muted);
}
.symptom:hover {
    border-color: var(--pink);
}
.symptom.on {
    background: var(--pink-soft);
    border-color: var(--pink);
    color: var(--pink);
}
.symptom .emoji {
    font-size: 22px;
    display: block;
    margin-bottom: 4px;
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
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
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
    .selected-day-panel {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
