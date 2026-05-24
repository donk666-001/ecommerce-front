<template>
    <div>
        <!-- Sleep Input Card -->
        <div class="sleep-input">
            <div class="sleep-input-head">
                <h3>记录睡眠</h3>
                <div class="date-sel">📅 昨夜 · 2026 年 5 月 18 日 ▾</div>
            </div>

            <div class="sleep-form">
                <div class="time-input-group">
                    <div class="time-input-label">🌙 入睡时间</div>
                    <input type="time" class="time-input" v-model="sleepTime" @change="calcDuration" />
                </div>
                <div class="time-input-group">
                    <div class="time-input-label">☀️ 起床时间</div>
                    <input type="time" class="time-input" v-model="wakeTime" @change="calcDuration" />
                </div>
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
                            <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= sleepQuality }" @click="sleepQuality = i">★</span>
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px;">
                        <span class="lbl">夜醒次数</span>
                        <div class="tag-pick">
                            <span v-for="n in ['0 次', '1 次', '2 次', '3+ 次']" :key="n" class="pick-chip" :class="{ active: wakeCount === n }" @click="wakeCount = n">{{ n }}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="form-row" style="align-items: flex-start;">
                        <span class="lbl" style="padding-top: 4px;">睡眠状态</span>
                        <div class="tag-pick">
                            <span v-for="tag in sleepTags" :key="tag" class="pick-chip" :class="{ active: sleepTagSelected.includes(tag) }" @click="toggleSleepTag(tag)">{{ tag }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="submit-row">
                <button class="btn btn-ghost">取消</button>
                <button class="btn" @click="saveSleep">保存记录</button>
            </div>
        </div>

        <div class="grid-2" style="grid-template-columns: 1.1fr 1fr;">
            <div class="sleep-summary">
                <div class="label">LAST NIGHT · 昨夜</div>
                <div class="sleep-score">{{ sleepScore }}<span>/100</span></div>
                <div style="opacity: 0.85; font-size: 14px;">{{ durationText }} · 入睡较快 · 深睡比例 23%</div>
                <div class="sleep-stats">
                    <div class="stat"><strong>{{ sleepTime }}</strong>入睡</div>
                    <div class="stat"><strong>{{ wakeTime }}</strong>清醒</div>
                    <div class="stat"><strong>{{ wakeCountLabel }}</strong>夜醒</div>
                    <div class="stat"><strong>⭐ {{ sleepQuality }}</strong>自评</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><span class="dot"></span>今日作息建议</div>
                <div class="timeline">
                    <div v-for="item in scheduleItems" :key="item.time" class="timeline-item" :class="{ active: item.active }">
                        <span class="time-tag">{{ item.time }}</span>
                        <span class="time-desc">{{ item.desc }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart -->
        <div class="card" style="margin-top: 20px;">
            <div class="row">
                <div class="card-title" style="margin: 0;"><span class="dot"></span>近 7 日睡眠趋势</div>
                <div style="font-size: 12px; color: var(--ink-muted);">平均 <strong style="color: var(--jade);">7h 28min</strong> · 较上周 ↑ 12 分钟</div>
            </div>
            <div class="sleep-chart">
                <svg class="chart-svg" viewBox="0 0 700 140" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#5C8374" stop-opacity="0.4"/>
                            <stop offset="100%" stop-color="#5C8374" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <line class="chart-grid" x1="0" y1="35" x2="700" y2="35"/>
                    <line class="chart-grid" x1="0" y1="70" x2="700" y2="70"/>
                    <line class="chart-grid" x1="0" y1="105" x2="700" y2="105"/>
                    <path class="chart-area" d="M 50 90 L 150 60 L 250 75 L 350 45 L 450 55 L 550 30 L 650 40 L 650 140 L 50 140 Z"/>
                    <path class="chart-line" d="M 50 90 L 150 60 L 250 75 L 350 45 L 450 55 L 550 30 L 650 40"/>
                    <circle class="chart-dot" cx="50" cy="90" r="4"/>
                    <circle class="chart-dot" cx="150" cy="60" r="4"/>
                    <circle class="chart-dot" cx="250" cy="75" r="4"/>
                    <circle class="chart-dot" cx="350" cy="45" r="4"/>
                    <circle class="chart-dot" cx="450" cy="55" r="4"/>
                    <circle class="chart-dot" cx="550" cy="30" r="4"/>
                    <circle class="chart-dot" cx="650" cy="40" r="4" fill="#B33C2C"/>
                </svg>
            </div>
            <div class="chart-labels">
                <span>5/12</span><span>5/13</span><span>5/14</span><span>5/15</span><span>5/16</span><span>5/17</span><span>5/18</span>
            </div>
        </div>

        <!-- Audio -->
        <div class="card" style="margin-top: 20px;">
            <div class="card-title"><span class="dot"></span>助眠音律</div>
            <div class="grid-2">
                <div>
                    <div v-for="audio in audioList1" :key="audio.title" class="audio-row">
                        <div class="audio-play">▶</div>
                        <div class="audio-info"><div class="audio-title">{{ audio.title }}</div><div class="audio-meta">{{ audio.meta }}</div></div>
                    </div>
                </div>
                <div>
                    <div v-for="audio in audioList2" :key="audio.title" class="audio-row">
                        <div class="audio-play">▶</div>
                        <div class="audio-info"><div class="audio-title">{{ audio.title }}</div><div class="audio-meta">{{ audio.meta }}</div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const sleepTime = ref("23:18");
const wakeTime = ref("07:00");
const sleepQuality = ref(4);
const wakeCount = ref("1 次");
const sleepTags = ["入睡快", "入睡慢", "多梦", "易醒", "早醒", "沉睡", "磨牙", "打鼾"];
const sleepTagSelected = ref(["入睡慢", "沉睡"]);

function toggleSleepTag(tag: string) {
    const idx = sleepTagSelected.value.indexOf(tag);
    if (idx >= 0) sleepTagSelected.value.splice(idx, 1);
    else sleepTagSelected.value.push(tag);
}

function calcDurationMinutes() {
    const [sh, sm] = sleepTime.value.split(":").map(Number);
    const [wh, wm] = wakeTime.value.split(":").map(Number);
    let minutes = wh * 60 + wm - (sh * 60 + sm);
    if (minutes < 0) minutes += 24 * 60;
    return minutes;
}

const durationText = computed(() => {
    const m = calcDurationMinutes();
    return `${Math.floor(m / 60)} 小时 ${m % 60} 分钟`;
});

const sleepScore = computed(() => sleepQuality.value * 20);

const wakeCountLabel = computed(() => wakeCount.value);

function saveSleep() {
    // Reflects into summary card automatically via reactive bindings
}

const scheduleItems = [
    { time: "06:30", desc: "寅时末起床，温水一杯", active: true },
    { time: "12:30", desc: "午时小憩 20 分钟（养心）", active: true },
    { time: "18:00", desc: "晚餐七分饱，少油少盐", active: false },
    { time: "21:00", desc: "温水泡脚 15 分钟", active: false },
    { time: "22:30", desc: "放下手机，进入睡前状态", active: false },
    { time: "23:00", desc: "熄灯入眠，子时入睡养肝胆", active: false },
];

const audioList1 = [
    { title: "竹林夜雨", meta: "自然白噪音 · 30 分钟" },
    { title: "古琴 · 平沙落雁", meta: "国风轻音 · 12 分钟" },
    { title: "颂钵冥想", meta: "放松引导 · 20 分钟" },
];

const audioList2 = [
    { title: "深海蓝调", meta: "慢波音乐 · 45 分钟" },
    { title: "睡前呼吸引导", meta: "4-7-8 呼吸法 · 8 分钟" },
    { title: "山雨竹篱", meta: "环境音 · 60 分钟" },
];
</script>

<style scoped lang="scss">
.sleep-input {
    background: linear-gradient(135deg, #FDFAF3 0%, #F0E8D5 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
}
.sleep-input::after {
    content: '📝'; position: absolute; right: 24px; top: 24px;
    font-size: 40px; opacity: 0.3;
}
.sleep-input-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
}
.sleep-input-head h3 {
    font-family: "STKaiti", serif;
    font-size: 22px; color: var(--ink); font-weight: 600;
}
.sleep-input-head .date-sel {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    color: var(--ink);
    display: flex; align-items: center; gap: 8px;
    cursor: pointer;
}
.sleep-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.time-input-group {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 16px 18px;
    transition: all .2s;
}
.time-input-group:focus-within {
    border-color: var(--jade);
    box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.1);
}
.time-input-label {
    font-size: 12px; color: var(--ink-muted);
    letter-spacing: 2px; margin-bottom: 6px;
    display: flex; align-items: center; gap: 6px;
}
.time-input {
    border: none; background: transparent;
    font-family: "STKaiti", serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--ink);
    width: 100%;
    outline: none;
    cursor: pointer;
}
.time-input::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
.time-extra {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
}
.quality-stars {
    display: flex; gap: 6px;
    align-items: center;
}
.star {
    font-size: 26px;
    cursor: pointer;
    color: var(--line);
    transition: all .15s;
}
.star:hover, .star.active { color: var(--gold); transform: scale(1.1); }
.tag-pick { display: flex; flex-wrap: wrap; gap: 6px; }
.pick-chip {
    padding: 5px 12px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 14px;
    font-size: 12px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all .2s;
}
.pick-chip:hover { border-color: var(--jade); color: var(--jade); }
.pick-chip.active {
    background: var(--jade-soft);
    border-color: var(--jade);
    color: var(--jade);
    font-weight: 500;
}
.form-row {
    display: flex; align-items: center;
    gap: 16px;
}
.form-row .lbl {
    font-size: 13px;
    color: var(--ink-muted);
    min-width: 64px;
}
.duration-display {
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--jade-soft);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px;
    color: var(--jade);
}
.duration-display strong {
    font-family: "STKaiti", serif;
    font-size: 20px;
    font-weight: 600;
}
.submit-row {
    display: flex; justify-content: flex-end; gap: 10px;
    margin-top: 20px;
}

.sleep-summary {
    background: linear-gradient(135deg, #2C3E50 0%, #4A5F7A 100%);
    color: white;
    border-radius: 16px;
    padding: 28px;
    position: relative;
    overflow: hidden;
}
.sleep-summary::after {
    content: '🌙'; position: absolute; right: 20px; top: 20px;
    font-size: 60px; opacity: 0.3;
}
.sleep-summary .label { font-size: 12px; opacity: 0.7; letter-spacing: 2px; }
.sleep-score {
    font-family: "STKaiti", serif;
    font-size: 56px; font-weight: 600; margin: 8px 0;
}
.sleep-score span { font-size: 18px; opacity: 0.6; margin-left: 4px; }
.sleep-stats { display: flex; gap: 24px; margin-top: 16px; font-size: 13px; }
.sleep-stats .stat { opacity: 0.85; }
.sleep-stats .stat strong { display: block; font-size: 18px; opacity: 1; }

.sleep-chart { height: 140px; margin-top: 12px; position: relative; }
.chart-svg { width: 100%; height: 100%; }
.chart-grid { stroke: var(--line); stroke-width: 1; }
.chart-line { fill: none; stroke: var(--jade); stroke-width: 2.5; }
.chart-area { fill: url(#sleepGrad); opacity: 0.4; }
.chart-dot { fill: var(--jade); }
.chart-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-muted); margin-top: 8px; }

.timeline {
    display: flex; flex-direction: column; gap: 0;
    position: relative; padding-left: 28px;
}
.timeline::before {
    content: ''; position: absolute; left: 6px; top: 6px; bottom: 6px;
    width: 2px; background: var(--line);
}
.timeline-item {
    position: relative; padding: 10px 0 10px 0;
    display: flex; align-items: center; gap: 12px;
}
.timeline-item::before {
    content: ''; position: absolute; left: -25px;
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--paper); border: 2px solid var(--jade-light);
}
.timeline-item.active::before { background: var(--jade); border-color: var(--jade); }
.time-tag { font-weight: 600; color: var(--ink); font-size: 14px; width: 60px; }
.time-desc { color: var(--ink-muted); font-size: 13px; }

.audio-row {
    display: flex; align-items: center; gap: 14px;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer; transition: background .2s;
}
.audio-row:hover { background: var(--cream); }
.audio-play {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--jade-soft); color: var(--jade);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
}
.audio-info { flex: 1; }
.audio-title { font-size: 14px; font-weight: 500; }
.audio-meta { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }

.card {
    background: var(--paper); border-radius: 14px; padding: 24px;
    box-shadow: var(--shadow); border: 1px solid rgba(232, 223, 208, 0.4);
}
.card-title {
    font-family: "STKaiti", serif; font-size: 18px; font-weight: 600;
    color: var(--ink); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
}
.card-title .dot { width: 4px; height: 16px; background: var(--jade); border-radius: 2px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.btn {
    background: var(--jade); color: white; border: none;
    padding: 10px 20px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
}
.btn:hover { background: var(--ink); transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--jade); border: 1px solid var(--jade); }
.btn-ghost:hover { background: var(--jade-soft); }

@media (max-width: 900px) {
    .grid-2, .sleep-form, .time-extra { grid-template-columns: 1fr; }
}
</style>
