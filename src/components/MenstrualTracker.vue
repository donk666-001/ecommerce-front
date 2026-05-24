<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1fr 1.3fr;">
            <div class="cycle-card">
                <div class="cycle-ring">
                    <svg viewBox="0 0 200 200">
                        <circle class="cycle-bg" cx="100" cy="100" r="80" />
                        <circle class="cycle-fg" cx="100" cy="100" r="80" />
                    </svg>
                    <div class="cycle-num">
                        <div class="big">10</div>
                        <div class="label">DAYS LEFT</div>
                    </div>
                </div>
                <div style="font-size: 14px; color: var(--ink); font-weight: 600;">距下次月经</div>
                <div class="cycle-phase">黄体期 · 第 18 天</div>
                <div style="margin-top: 16px; font-size: 13px; color: var(--ink-muted); line-height: 1.6;">本阶段易乏力、情绪起伏，建议慢节奏生活，多食温性食物。</div>
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0;"><span class="dot"></span>5 月 · 周期日历</div>
                    <div style="font-size: 12px; color: var(--ink-muted);">‹  2026年5月  ›</div>
                </div>
                <div class="calendar">
                    <div class="cal-head">日</div><div class="cal-head">一</div><div class="cal-head">二</div><div class="cal-head">三</div><div class="cal-head">四</div><div class="cal-head">五</div><div class="cal-head">六</div>
                    <div v-for="day in calDays" :key="day.key" class="cal-day" :class="day.cls">{{ day.text }}</div>
                </div>
                <div style="display:flex; gap: 18px; margin-top: 12px; font-size: 12px; color: var(--ink-muted);">
                    <span>● <span style="color:var(--pink);">经期</span></span>
                    <span>● <span style="color:#7896A8;">排卵期</span></span>
                    <span>● <span style="color:var(--pink);">预测经期</span></span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <div class="card-title"><span class="dot"></span>今日身体记录</div>
            <div class="symptom-grid">
                <div v-for="s in symptoms" :key="s.name" class="symptom" :class="{ on: s.on }" @click="s.on = !s.on">
                    <span class="emoji">{{ s.emoji }}</span>{{ s.name }}
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <div class="card-title"><span class="dot"></span>黄体期养生方案</div>
            <div class="grid-3">
                <div class="tip-row">
                    <span class="icon">🍲</span>
                    <div class="text"><strong>温补脾胃</strong><br>红枣桂圆粥、当归乌鸡汤</div>
                </div>
                <div class="tip-row">
                    <span class="icon">🧘</span>
                    <div class="text"><strong>舒缓运动</strong><br>瑜伽婴儿式、八段锦慢练</div>
                </div>
                <div class="tip-row">
                    <span class="icon">🦶</span>
                    <div class="text"><strong>泡脚配方</strong><br>艾叶 + 生姜 + 红花，30 分钟</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

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

const calDays = [
    { key: "d1", text: "26", cls: "muted" }, { key: "d2", text: "27", cls: "muted" }, { key: "d3", text: "28", cls: "muted" }, { key: "d4", text: "29", cls: "muted" }, { key: "d5", text: "30", cls: "muted" }, { key: "d6", text: "1", cls: "" }, { key: "d7", text: "2", cls: "period" },
    { key: "d8", text: "3", cls: "period" }, { key: "d9", text: "4", cls: "period" }, { key: "d10", text: "5", cls: "period" }, { key: "d11", text: "6", cls: "period" }, { key: "d12", text: "7", cls: "period" }, { key: "d13", text: "8", cls: "" }, { key: "d14", text: "9", cls: "" },
    { key: "d15", text: "10", cls: "" }, { key: "d16", text: "11", cls: "" }, { key: "d17", text: "12", cls: "" }, { key: "d18", text: "13", cls: "" }, { key: "d19", text: "14", cls: "" }, { key: "d20", text: "15", cls: "ovul" }, { key: "d21", text: "16", cls: "ovul" },
    { key: "d22", text: "17", cls: "ovul" }, { key: "d23", text: "18", cls: "ovul" }, { key: "d24", text: "19", cls: "today" }, { key: "d25", text: "20", cls: "" }, { key: "d26", text: "21", cls: "" }, { key: "d27", text: "22", cls: "" }, { key: "d28", text: "23", cls: "" },
    { key: "d29", text: "24", cls: "" }, { key: "d30", text: "25", cls: "" }, { key: "d31", text: "26", cls: "" }, { key: "d32", text: "27", cls: "" }, { key: "d33", text: "28", cls: "" }, { key: "d34", text: "29", cls: "predict" }, { key: "d35", text: "30", cls: "predict" },
    { key: "d36", text: "31", cls: "predict" }, { key: "d37", text: "1", cls: "muted" }, { key: "d38", text: "2", cls: "muted" }, { key: "d39", text: "3", cls: "muted" }, { key: "d40", text: "4", cls: "muted" }, { key: "d41", text: "5", cls: "muted" }, { key: "d42", text: "6", cls: "muted" },
];
</script>

<style scoped lang="scss">
.cycle-card {
    background: linear-gradient(135deg, var(--pink-soft) 0%, #FFF 100%);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
}
.cycle-ring {
    width: 180px; height: 180px;
    margin: 0 auto 16px;
    position: relative;
}
.cycle-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.cycle-ring circle { fill: none; stroke-width: 10; }
.cycle-bg { stroke: var(--pink-soft); }
.cycle-fg {
    stroke: var(--pink);
    stroke-linecap: round;
    stroke-dasharray: 502;
    stroke-dashoffset: 200;
}
.cycle-num {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
}
.cycle-num .big {
    font-family: "STKaiti", serif;
    font-size: 48px; font-weight: 600; color: var(--pink);
}
.cycle-num .label { font-size: 12px; color: var(--ink-muted); letter-spacing: 2px; }
.cycle-phase {
    display: inline-block;
    padding: 6px 16px;
    background: var(--pink);
    color: white;
    border-radius: 14px;
    font-size: 13px;
    margin-top: 8px;
}

.calendar {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 4px; margin-top: 12px;
}
.cal-head {
    text-align: center; font-size: 11px;
    color: var(--ink-muted); padding: 6px 0; font-weight: 600;
}
.cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 13px; border-radius: 8px;
    color: var(--ink); cursor: pointer; transition: all .2s;
}
.cal-day:hover { background: var(--cream); }
.cal-day.muted { color: var(--line); }
.cal-day.period { background: var(--pink); color: white; font-weight: 600; }
.cal-day.predict { background: var(--pink-soft); color: var(--pink); }
.cal-day.ovul { background: #C4D8E0; color: var(--moon); font-weight: 600; }
.cal-day.today { box-shadow: 0 0 0 2px var(--ink); }

.symptom-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.symptom {
    padding: 10px 8px; text-align: center; border-radius: 10px;
    background: var(--cream); font-size: 12px; cursor: pointer;
    border: 1px solid transparent; transition: all .2s;
}
.symptom:hover { border-color: var(--pink); }
.symptom.on { background: var(--pink-soft); border-color: var(--pink); color: var(--pink); }
.symptom .emoji { font-size: 22px; display: block; margin-bottom: 4px; }

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
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

.tip-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px; background: var(--paper-warm);
    border-radius: 10px; border-left: 3px solid var(--jade);
}
.tip-row .icon { font-size: 20px; }
.tip-row .text { font-size: 14px; color: var(--ink); line-height: 1.6; }
.tip-row .text strong { color: var(--jade); }

@media (max-width: 900px) {
    .grid-2, .grid-3, .symptom-grid { grid-template-columns: 1fr 1fr; }
}
</style>
