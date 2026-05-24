<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1fr 1.2fr;">
            <div class="mood-picker">
                <div style="font-size: 12px; color: var(--ink-muted); letter-spacing: 2px;">TODAY · 此刻心情</div>
                <div class="mood-row">
                    <div v-for="m in moods" :key="m.emoji" class="mood-emoji" :class="{ selected: selectedMood === m.emoji }" @click="selectedMood = m.emoji">{{ m.emoji }}</div>
                </div>
                <div class="mood-labels">
                    <span v-for="m in moods" :key="m.label">{{ m.label }}</span>
                </div>
                <div style="background: var(--paper); border-radius: 10px; padding: 12px; margin-top: 16px;">
                    <div style="font-size: 13px; color: var(--ink-muted); margin-bottom: 8px;">用关键词形容此刻：</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        <span class="mood-tag filled">平静</span>
                        <span class="mood-tag filled">温暖</span>
                        <span class="mood-tag add">+ 添加</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0;"><span class="dot"></span>近 14 日情绪曲线</div>
                    <div style="font-size: 12px; color: var(--ink-muted);">本周平均 <strong style="color: var(--gold);">愉悦 · 4.1</strong></div>
                </div>
                <div class="mood-trend">
                    <svg viewBox="0 0 700 120" preserveAspectRatio="none" style="width:100%; height:100%;">
                        <defs>
                            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#C9A55C" stop-opacity="0.5"/>
                                <stop offset="100%" stop-color="#C9A55C" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 20 70 L 70 60 L 120 80 L 170 50 L 220 60 L 270 90 L 320 70 L 370 40 L 420 50 L 470 30 L 520 45 L 570 25 L 620 35 L 670 30 L 670 120 L 20 120 Z" fill="url(#moodGrad)"/>
                        <path d="M 20 70 L 70 60 L 120 80 L 170 50 L 220 60 L 270 90 L 320 70 L 370 40 L 420 50 L 470 30 L 520 45 L 570 25 L 620 35 L 670 30" fill="none" stroke="#C9A55C" stroke-width="2.5"/>
                    </svg>
                </div>
                <div style="margin-top: 12px; padding: 10px; background: var(--gold-soft); border-radius: 8px; font-size: 13px; color: var(--ink);">
                    <strong style="color: var(--gold);">💡 趋势洞察：</strong>近 3 天情绪稳步上扬，正念冥想似乎对你很有效，建议保持。
                </div>
            </div>
        </div>

        <div class="grid-2" style="margin-top: 20px;">
            <div class="card">
                <div class="card-title"><span class="dot"></span>冥想引导</div>
                <div v-for="med in meditations" :key="med.title" class="meditation-row">
                    <div class="med-icon">{{ med.emoji }}</div>
                    <div class="med-info"><div class="med-title">{{ med.title }}</div><div class="med-dur">{{ med.dur }}</div></div>
                </div>
            </div>
            <div class="card">
                <div class="card-title"><span class="dot"></span>心理量表自评</div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div v-for="survey in surveys" :key="survey.name" class="survey-card">
                        <div class="survey-name">{{ survey.name }}</div>
                        <div class="survey-desc">{{ survey.desc }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const moods = [
    { emoji: "😔", label: "很差" },
    { emoji: "😐", label: "低落" },
    { emoji: "🙂", label: "平静" },
    { emoji: "😊", label: "愉悦" },
    { emoji: "🥰", label: "极佳" },
];
const selectedMood = ref("🙂");

const meditations = [
    { emoji: "🌬️", title: "焦虑舒缓 · 478 呼吸", dur: "10 分钟 · 入门" },
    { emoji: "🌸", title: "正念扫描身体", dur: "15 分钟 · 进阶" },
    { emoji: "🌅", title: "晨间唤醒冥想", dur: "5 分钟 · 入门" },
];

const surveys = [
    { name: "SAS · 焦虑自评量表", desc: "20 题 · 约 5 分钟 · 上次评分 41 分（轻度）" },
    { name: "SDS · 抑郁自评量表", desc: "20 题 · 约 5 分钟 · 尚未测试" },
    { name: "PSS · 压力知觉量表", desc: "14 题 · 约 3 分钟 · 上次评分 18 分（中等）" },
];
</script>

<style scoped lang="scss">
.mood-picker {
    background: linear-gradient(135deg, #F0E5F4 0%, #FDF8FF 100%);
    border-radius: 16px;
    padding: 28px;
}
.mood-row {
    display: flex; justify-content: space-around;
    margin: 16px 0;
}
.mood-emoji {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    background: var(--paper);
    border-radius: 50%;
    cursor: pointer;
    transition: transform .2s;
    border: 2px solid transparent;
}
.mood-emoji:hover { transform: scale(1.1); }
.mood-emoji.selected { border-color: var(--gold); background: var(--gold-soft); }
.mood-labels {
    display: flex; justify-content: space-around;
    font-size: 11px; color: var(--ink-muted);
}
.mood-labels span { width: 56px; text-align: center; }
.mood-tag {
    padding: 4px 12px; border-radius: 12px; font-size: 12px;
}
.mood-tag.filled { background: var(--gold); color: white; }
.mood-tag.add { background: var(--cream); color: var(--ink-muted); border: 1px solid var(--line); cursor: pointer; }
.mood-trend { height: 120px; margin-top: 12px; }

.meditation-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px;
    background: linear-gradient(90deg, var(--moon-soft), transparent);
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer; transition: all .2s;
}
.meditation-row:hover { transform: translateX(4px); }
.med-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--moon); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
}
.med-info { flex: 1; }
.med-title { font-size: 14px; font-weight: 600; }
.med-dur { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }

.survey-card {
    padding: 16px; border-radius: 12px;
    background: var(--paper-warm); border: 1px solid var(--line);
    cursor: pointer; transition: all .2s;
}
.survey-card:hover { border-color: var(--gold); }
.survey-name { font-weight: 600; margin-bottom: 4px; }
.survey-desc { font-size: 12px; color: var(--ink-muted); }

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

@media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
