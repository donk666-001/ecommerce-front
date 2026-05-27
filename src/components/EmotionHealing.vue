<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1fr 1.2fr">
            <div class="mood-picker">
                <div
                    style="
                        font-size: 12px;
                        color: var(--ink-muted);
                        letter-spacing: 2px;
                    "
                >
                    TODAY · 此刻心情
                </div>
                <div class="mood-row">
                    <div
                        v-for="m in moods"
                        :key="m.emoji"
                        class="mood-emoji"
                        :class="{ selected: selectedMood === m.emoji }"
                        @click="selectedMood = m.emoji"
                    >
                        {{ m.emoji }}
                    </div>
                </div>
                <div class="mood-labels">
                    <span v-for="m in moods" :key="m.label">{{ m.label }}</span>
                </div>
                <div
                    style="
                        background: var(--paper);
                        border-radius: 10px;
                        padding: 12px;
                        margin-top: 16px;
                    "
                >
                    <div
                        style="
                            font-size: 13px;
                            color: var(--ink-muted);
                            margin-bottom: 8px;
                        "
                    >
                        用关键词形容此刻：
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px">
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
                            @keydown.enter="addKeyword"
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
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0">
                        <span class="dot"></span>近 14 日情绪曲线
                    </div>
                    <div style="font-size: 12px; color: var(--ink-muted)">
                        本周平均
                        <strong style="color: var(--gold)">愉悦 · 4.1</strong>
                    </div>
                </div>
                <div class="mood-trend">
                    <svg
                        viewBox="0 0 700 120"
                        preserveAspectRatio="none"
                        style="width: 100%; height: 100%"
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
                            d="M 20 70 L 70 60 L 120 80 L 170 50 L 220 60 L 270 90 L 320 70 L 370 40 L 420 50 L 470 30 L 520 45 L 570 25 L 620 35 L 670 30 L 670 120 L 20 120 Z"
                            fill="url(#moodGrad)"
                        />
                        <path
                            d="M 20 70 L 70 60 L 120 80 L 170 50 L 220 60 L 270 90 L 320 70 L 370 40 L 420 50 L 470 30 L 520 45 L 570 25 L 620 35 L 670 30"
                            fill="none"
                            stroke="#C9A55C"
                            stroke-width="2.5"
                        />
                    </svg>
                </div>
                <div
                    style="
                        margin-top: 12px;
                        padding: 10px;
                        background: var(--gold-soft);
                        border-radius: 8px;
                        font-size: 13px;
                        color: var(--ink);
                    "
                >
                    <strong style="color: var(--gold)">💡 趋势洞察：</strong>近
                    3 天情绪稳步上扬，正念冥想似乎对你很有效，建议保持。
                </div>
            </div>
        </div>

        <div class="grid-2" style="margin-top: 20px">
            <div class="card">
                <div class="card-title"><span class="dot"></span>冥想引导</div>
                <button
                    v-for="med in meditations"
                    :key="med.title"
                    class="meditation-row"
                    :class="{ active: activeMeditation === med.title }"
                    type="button"
                    @click="
                        activeMeditation =
                            activeMeditation === med.title ? '' : med.title
                    "
                >
                    <div class="med-icon">{{ med.emoji }}</div>
                    <div class="med-info">
                        <div class="med-title">{{ med.title }}</div>
                        <div class="med-dur">{{ med.dur }}</div>
                    </div>
                    <div class="play-state">
                        {{ activeMeditation === med.title ? "暂停" : "开始" }}
                    </div>
                </button>
            </div>
            <div class="card">
                <div class="card-title">
                    <span class="dot"></span>心理量表自评
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px">
                    <button
                        v-for="survey in surveys"
                        :key="survey.name"
                        class="survey-card"
                        type="button"
                        @click="selectedSurvey = survey"
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
                    @click.self="selectedSurvey = null"
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
                            @click="selectedSurvey = null"
                        >
                            ×
                        </button>
                        <h3 id="survey-title">{{ selectedSurvey.name }}</h3>
                        <p>{{ selectedSurvey.desc }}</p>
                        <div class="survey-questions">
                            <label
                                v-for="question in surveyQuestions"
                                :key="question"
                            >
                                <span>{{ question }}</span>
                                <input
                                    v-model.number="surveyScore"
                                    type="range"
                                    min="1"
                                    max="5"
                                />
                            </label>
                        </div>
                        <div class="survey-result">
                            当前估算：{{ surveyResult }}
                        </div>
                        <button
                            class="btn"
                            type="button"
                            @click="selectedSurvey = null"
                        >
                            保存结果
                        </button>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const moods = [
    { emoji: "😔", label: "很差" },
    { emoji: "😐", label: "低落" },
    { emoji: "🙂", label: "平静" },
    { emoji: "😊", label: "愉悦" },
    { emoji: "🥰", label: "极佳" },
];
const selectedMood = ref("🙂");
const moodKeywords = ref(["平静", "温暖"]);
const showKeywordInput = ref(false);
const keywordInput = ref("");
const activeMeditation = ref("");

const meditations = [
    { emoji: "🌬️", title: "焦虑舒缓 · 478 呼吸", dur: "10 分钟 · 入门" },
    { emoji: "🌸", title: "正念扫描身体", dur: "15 分钟 · 进阶" },
    { emoji: "🌅", title: "晨间唤醒冥想", dur: "5 分钟 · 入门" },
];

const surveys = [
    {
        name: "SAS · 焦虑自评量表",
        desc: "20 题 · 约 5 分钟 · 上次评分 41 分（轻度）",
    },
    { name: "SDS · 抑郁自评量表", desc: "20 题 · 约 5 分钟 · 尚未测试" },
    {
        name: "PSS · 压力知觉量表",
        desc: "14 题 · 约 3 分钟 · 上次评分 18 分（中等）",
    },
];
const selectedSurvey = ref<(typeof surveys)[number] | null>(null);
const surveyScore = ref(3);
const surveyQuestions = ["过去一周容易紧张", "睡前思绪较多", "白天能量不足"];
const surveyResult = computed(() =>
    surveyScore.value <= 2
        ? "状态平稳"
        : surveyScore.value <= 4
          ? "轻度波动"
          : "建议增加放松练习",
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
</script>

<style scoped lang="scss">
.mood-picker {
    background: linear-gradient(135deg, #f0e5f4 0%, #fdf8ff 100%);
    border-radius: 16px;
    padding: 28px;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.45);
    animation: cardRise 0.28s ease both;
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
    transition: transform 0.2s;
    border: 2px solid transparent;
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
.mood-trend {
    height: 120px;
    margin-top: 12px;
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
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    width: min(460px, 100%);
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
.survey-questions {
    display: grid;
    gap: 12px;
}
.survey-questions label {
    display: grid;
    gap: 6px;
    color: var(--ink);
    font-size: 13px;
}
.survey-result {
    margin: 16px 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--gold-soft);
    color: var(--gold-deep);
    font-size: 13px;
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
    .grid-2 {
        grid-template-columns: 1fr;
    }
}
</style>
