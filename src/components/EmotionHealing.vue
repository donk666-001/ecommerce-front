<template>
    <div class="emotion-healing">
        <!-- 心理自评弹窗 -->
        <el-dialog
            v-model="showAssessmentDialog"
            :title="currentAssessment?.name"
            width="700px"
            :close-on-click-modal="false"
        >
            <div v-if="currentAssessment" class="assessment-content">
                <el-alert
                    :title="currentAssessment.description"
                    type="info"
                    :closable="false"
                    show-icon
                    style="margin-bottom: 20px"
                />

                <el-steps :active="assessmentStep" finish-status="success">
                    <el-step
                        v-for="(_, index) in currentAssessment.questions.slice(
                            0,
                            10
                        )"
                        :key="index"
                        :title="`第${index + 1}题`"
                    />
                </el-steps>

                <div
                    v-if="assessmentStep < currentAssessment.questions.length"
                    class="question-container"
                >
                    <h4>
                        {{ assessmentStep + 1 }}.
                        {{ currentAssessment.questions[assessmentStep]?.text }}
                    </h4>
                    <el-radio-group
                        v-model="assessmentAnswers[assessmentStep]"
                        class="answer-options"
                    >
                        <el-radio
                            v-for="option in currentAssessment.questions[
                                assessmentStep
                            ]?.options || []"
                            :key="option.value"
                            :label="option.value"
                            border
                        >
                            {{ option.label }}
                        </el-radio>
                    </el-radio-group>
                </div>

                <div v-else class="assessment-result">
                    <h4>评估结果</h4>
                    <div class="result-score">
                        <div class="score-circle">
                            <span class="score-number">{{
                                assessmentResult.score
                            }}</span>
                            <span class="score-label">总分</span>
                        </div>
                        <div class="result-level">
                            <el-tag
                                :type="getAssessmentLevelType(
                                    assessmentResult.level
                                )"
                                size="large"
                            >
                                {{ assessmentResult.level }}
                            </el-tag>
                        </div>
                    </div>
                    <div class="result-advice">
                        <p>{{ assessmentResult.advice }}</p>
                    </div>
                    <el-alert
                        title="温馨提示：本量表仅供参考，不能替代专业医疗诊断。如有严重心理问题，请及时寻求专业帮助。"
                        type="warning"
                        :closable="false"
                        show-icon
                    />
                </div>
            </div>

            <template #footer>
                <el-button
                    v-if="assessmentStep < (currentAssessment?.questions.length || 0)"
                    @click="showAssessmentDialog = false"
                >
                    取消
                </el-button>
                <el-button
                    v-if="assessmentStep > 0 && assessmentStep < (currentAssessment?.questions.length || 0)"
                    @click="assessmentStep--"
                >
                    上一题
                </el-button>
                <el-button
                    v-if="assessmentStep < (currentAssessment?.questions.length || 0)"
                    type="primary"
                    :disabled="assessmentAnswers[assessmentStep] === undefined"
                    @click="nextAssessmentStep"
                >
                    {{
                        assessmentStep ===
                        (currentAssessment?.questions.length || 0) - 1
                            ? "查看结果"
                            : "下一题"
                    }}
                </el-button>
                <el-button
                    v-if="assessmentStep >= (currentAssessment?.questions.length || 0)"
                    type="primary"
                    @click="showAssessmentDialog = false"
                >
                    关闭
                </el-button>
            </template>
        </el-dialog>

        <el-card shadow="hover">
            <template #header>
                <div class="card-header">
                    <h3>情绪疗愈</h3>
                </div>
            </template>

            <div class="content">
                <!-- 今日情绪填写 -->
                <section class="today-mood-section">
                    <h4 class="section-title">TODAY · 此刻心情</h4>
                    <div class="mood-input-card">
                        <div class="mood-selector">
                            <el-radio-group
                                v-model="todayMood.mood"
                                class="mood-options"
                            >
                                <el-radio
                                    v-for="option in moodOptions"
                                    :key="option.value"
                                    :label="option.value"
                                    class="mood-item"
                                >
                                    <div class="mood-content">
                                        <span class="mood-emoji">{{
                                            option.emoji
                                        }}</span>
                                        <span class="mood-text">{{
                                            option.label
                                        }}</span>
                                    </div>
                                </el-radio>
                            </el-radio-group>
                        </div>

                        <div class="mood-keywords">
                            <el-input
                                v-model="todayMood.keywords"
                                placeholder="添加关键词，如：平静、温暖..."
                                clearable
                            >
                                <template #prefix>
                                    <el-icon><Edit /></el-icon>
                                </template>
                            </el-input>
                        </div>

                        <div class="mood-actions">
                            <el-button
                                type="primary"
                                @click="saveTodayMood"
                            >
                                <el-icon><Check /></el-icon>
                                记录心情
                            </el-button>
                        </div>
                    </div>
                </section>

                <!-- 近14日情绪曲线 -->
                <section class="emotion-chart-section">
                    <h4 class="section-title">近14日情绪曲线</h4>
                    <div class="chart-card">
                        <div class="chart-container">
                            <svg
                                viewBox="0 0 800 300"
                                class="emotion-chart"
                            >
                                <!-- 网格线 -->
                                <g class="grid-lines">
                                    <line
                                        v-for="i in 5"
                                        :key="i"
                                        x1="50"
                                        :y1="50 + (i - 1) * 50"
                                        x2="750"
                                        :y2="50 + (i - 1) * 50"
                                        stroke="#e4e7ed"
                                        stroke-width="1"
                                    />
                                </g>

                                <!-- Y轴标签 -->
                                <g class="y-axis-labels">
                                    <text
                                        v-for="(label, i) in yLabels"
                                        :key="i"
                                        x="40"
                                        :y="60 + i * 50"
                                        text-anchor="end"
                                        class="axis-text"
                                    >
                                        {{ label }}
                                    </text>
                                </g>

                                <!-- X轴日期 -->
                                <g class="x-axis-labels">
                                    <text
                                        v-for="(date, i) in emotionHistory.map(
                                            (h) => h.date
                                        )"
                                        :key="i"
                                        :x="50 + i * 53.8"
                                        y="280"
                                        text-anchor="middle"
                                        class="axis-text"
                                    >
                                        {{ date.slice(5) }}
                                    </text>
                                </g>

                                <!-- 情绪曲线 -->
                                <polyline
                                    :points="chartPoints"
                                    fill="none"
                                    stroke="#409eff"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />

                                <!-- 数据点 -->
                                <circle
                                    v-for="(point, i) in emotionHistory"
                                    :key="i"
                                    :cx="50 + i * 53.8"
                                    :cy="getYPosition(point.score)"
                                    r="6"
                                    fill="#409eff"
                                    stroke="#fff"
                                    stroke-width="2"
                                    class="data-point"
                                >
                                    <title>{{
                                        `${point.date}: ${point.score}分`
                                    }}</title>
                                </circle>
                            </svg>
                        </div>

                        <!-- 趋势洞察 -->
                        <div class="trend-insight">
                            <el-descriptions
                                :column="2"
                                border
                                class="insight-descriptions"
                            >
                                <el-descriptions-item label="本周平均">
                                    <el-tag type="success">
                                        {{ weeklyAverage }}
                                    </el-tag>
                                </el-descriptions-item>
                                <el-descriptions-item label="情绪趋势">
                                    <span :class="trendClass">
                                        {{ trendText }}
                                    </span>
                                </el-descriptions-item>
                                <el-descriptions-item
                                    label="最佳状态"
                                    :span="2"
                                >
                                    {{ bestDay }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                    </div>
                </section>

                <!-- 调整建议 -->
                <section class="suggestion-section">
                    <h4 class="section-title">情绪调整建议</h4>
                    <el-timeline>
                        <el-timeline-item
                            v-for="(suggestion, index) in suggestions"
                            :key="index"
                            :timestamp="suggestion.time"
                            placement="top"
                        >
                            <el-card>
                                <h5>{{ suggestion.title }}</h5>
                                <p>{{ suggestion.content }}</p>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </section>

                <!-- 心理自评量表 -->
                <section class="assessment-section">
                    <h4 class="section-title">心理量表自评</h4>
                    <el-row :gutter="20">
                        <el-col
                            v-for="assessment in assessments"
                            :key="assessment.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                        >
                            <el-card
                                class="assessment-card"
                                shadow="hover"
                                @click="startAssessment(assessment)"
                            >
                                <div class="assessment-icon">
                                    <el-icon :size="40">
                                        <component
                                            :is="assessment.icon"
                                        />
                                    </el-icon>
                                </div>
                                <h5>{{ assessment.name }}</h5>
                                <p class="assessment-desc">
                                    {{ assessment.shortDesc }}
                                </p>
                                <el-button type="primary" size="small">
                                    开始测试
                                </el-button>
                            </el-card>
                        </el-col>
                    </el-row>
                </section>

                <!-- 冥想引导 -->
                <section class="meditation-section">
                    <h4 class="section-title">冥想引导</h4>
                    <el-row :gutter="20">
                        <el-col
                            v-for="meditation in meditations"
                            :key="meditation.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                        >
                            <el-card
                                class="meditation-card"
                                shadow="hover"
                            >
                                <div class="meditation-header">
                                    <el-tag
                                        :type="getMeditationTagType(
                                            meditation.type
                                        )"
                                    >
                                        {{ meditation.type }}
                                    </el-tag>
                                    <span class="meditation-duration">
                                        <el-icon><Clock /></el-icon>
                                        {{ meditation.duration }}分钟
                                    </span>
                                </div>
                                <h5>{{ meditation.title }}</h5>
                                <p class="meditation-desc">
                                    {{ meditation.description }}
                                </p>
                                <el-button
                                    type="success"
                                    size="small"
                                    @click="playMeditation(meditation)"
                                >
                                    <el-icon><VideoPlay /></el-icon>
                                    开始冥想
                                </el-button>
                            </el-card>
                        </el-col>
                    </el-row>
                </section>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    reactive,
    computed,
    onMounted,
} from "vue";
import {
    Edit,
    Check,
    Clock,
    VideoPlay,
    Document,
    Reading,
    TrendCharts,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 类型定义
interface MoodOption {
    value: number;
    label: string;
    emoji: string;
}

interface MoodRecord {
    date: string;
    mood: number;
    score: number;
    keywords?: string;
}

interface Suggestion {
    time: string;
    title: string;
    content: string;
}

interface AssessmentQuestion {
    text: string;
    options: Array<{ label: string; value: number }>;
}

interface Assessment {
    id: number;
    name: string;
    shortDesc: string;
    description: string;
    icon: any;
    questions: AssessmentQuestion[];
}

interface Meditation {
    id: number;
    title: string;
    type: string;
    duration: number;
    description: string;
}

// 今日情绪
const todayMood = reactive({
    mood: 3,
    keywords: "",
});

// 情绪选项
const moodOptions: MoodOption[] = [
    { value: 1, label: "很差", emoji: "😢" },
    { value: 2, label: "低落", emoji: "😔" },
    { value: 3, label: "平静", emoji: "😌" },
    { value: 4, label: "愉悦", emoji: "😊" },
    { value: 5, label: "极佳", emoji: "😄" },
];

// 情绪历史数据（近14天）
const emotionHistory = ref<MoodRecord[]>([]);

// 生成模拟数据
function generateMockData() {
    const history: MoodRecord[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0] || "";

        // 模拟情绪分数（3-5之间波动，逐渐上升）
        const baseScore = 3.5 + (13 - i) * 0.05;
        const randomVariation = Math.random() * 0.8 - 0.4;
        const score = Math.min(5, Math.max(1, baseScore + randomVariation));

        const keywordsList = ["平静", "温暖", "充实", "放松"];
        const randomIndex = Math.floor(Math.random() * keywordsList.length);
        const randomKeyword = keywordsList[randomIndex] || "平静";

        history.push({
            date: dateStr,
            mood: Math.round(score),
            score: parseFloat(score.toFixed(1)),
            keywords: randomKeyword,
        });
    }

    emotionHistory.value = history;
}

// 图表相关
const yLabels = ["5", "4", "3", "2", "1"];

const chartPoints = computed(() => {
    if (emotionHistory.value.length === 0) {
        return '';
    }
    return emotionHistory.value
        .map((record, index) => {
            const x = 50 + index * 53.8;
            const y = getYPosition(record.score);
            return `${x},${y}`;
        })
        .join(" ");
});

function getYPosition(score: number): number {
    // 分数1-5映射到Y坐标250-50
    return 250 - (score - 1) * 50;
}

// 趋势洞察
const weeklyAverage = computed(() => {
    const last7Days = emotionHistory.value.slice(-7);
    if (last7Days.length === 0) {
        return '0.0';
    }
    const sum = last7Days.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / last7Days.length).toFixed(1);
});

const trendText = computed(() => {
    if (emotionHistory.value.length < 3) {
        return "➡️ 数据不足";
    }
    
    const last3Days = emotionHistory.value.slice(-3);
    if (last3Days.length < 3) return "➡️ 数据不足";

    const firstHalf = last3Days[0]?.score || 0;
    const secondHalf = last3Days[2]?.score || 0;

    if (secondHalf > firstHalf + 0.3) {
        return "📈 稳步上扬";
    } else if (secondHalf < firstHalf - 0.3) {
        return "📉 有所下降";
    } else {
        return "➡️ 基本平稳";
    }
});

const trendClass = computed(() => {
    if (trendText.value.includes("上扬")) return "trend-up";
    if (trendText.value.includes("下降")) return "trend-down";
    return "trend-stable";
});

const bestDay = computed(() => {
    if (emotionHistory.value.length === 0) {
        return '暂无数据';
    }
    const best = emotionHistory.value.reduce((prev, current) =>
        prev.score > current.score ? prev : current
    );
    return `${best.date}（${best.score}分）`;
});

// 调整建议
const suggestions = ref<Suggestion[]>([
    {
        time: "2024-01-28",
        title: "深呼吸练习",
        content:
            "当感到焦虑时，尝试4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒。重复4次可有效缓解紧张情绪。",
    },
    {
        time: "2024-01-27",
        title: "正念冥想",
        content:
            "每天花10分钟进行正念冥想，专注于当下感受，不加评判地观察自己的情绪变化。",
    },
    {
        time: "2024-01-26",
        title: "运动释放",
        content:
            "适度的有氧运动可以促进内啡肽分泌，改善情绪。建议每天快走或慢跑30分钟。",
    },
]);

// 心理自评量表
const assessments: Assessment[] = [
    {
        id: 1,
        name: "SAS焦虑自评量表",
        shortDesc: "评估焦虑程度",
        description:
            "SAS（Self-Rating Anxiety Scale）由Zung于1971年编制，包含20个项目，用于评定焦虑患者的主观感受。",
        icon: TrendCharts,
        questions: generateSASQuestions(),
    },
    {
        id: 2,
        name: "SDS抑郁自评量表",
        shortDesc: "评估抑郁程度",
        description:
            "SDS（Self-Rating Depression Scale）由Zung于1965年编制，包含20个项目，适用于具有抑郁症状的成年人。",
        icon: Document,
        questions: generateSDSQuestions(),
    },
    {
        id: 3,
        name: "PSS压力知觉量表",
        shortDesc: "评估压力水平",
        description:
            "PSS（Perceived Stress Scale）由Cohen等人于1983年编制，用于测量个体感知到的压力程度。",
        icon: Reading,
        questions: generatePSSQuestions(),
    },
];

// 生成SAS问题（简化版，实际应为20题）
function generateSASQuestions(): AssessmentQuestion[] {
    return [
        {
            text: "我觉得比平时容易紧张和着急",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我无缘无故地感到害怕",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我容易心里烦乱或觉得惊恐",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我觉得我可能将要发疯",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我感到心跳加快",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
    ];
}

// 生成SDS问题（简化版）
function generateSDSQuestions(): AssessmentQuestion[] {
    return [
        {
            text: "我觉得闷闷不乐，情绪低沉",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我觉得一天中早晨最好",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我一阵阵哭出来或觉得想哭",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我晚上睡眠不好",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
        {
            text: "我吃得跟平常一样多",
            options: [
                { label: "没有或很少时间", value: 1 },
                { label: "小部分时间", value: 2 },
                { label: "相当多时间", value: 3 },
                { label: "绝大部分或全部时间", value: 4 },
            ],
        },
    ];
}

// 生成PSS问题（简化版）
function generatePSSQuestions(): AssessmentQuestion[] {
    return [
        {
            text: "在过去一个月中，你因意外发生的事而心烦意乱的次数？",
            options: [
                { label: "从不", value: 0 },
                { label: "几乎从不", value: 1 },
                { label: "有时", value: 2 },
                { label: " fairly often", value: 3 },
                { label: "非常频繁", value: 4 },
            ],
        },
        {
            text: "在过去一个月中，你感到无法控制生活中重要事情的程度？",
            options: [
                { label: "从不", value: 0 },
                { label: "几乎从不", value: 1 },
                { label: "有时", value: 2 },
                { label: " fairly often", value: 3 },
                { label: "非常频繁", value: 4 },
            ],
        },
        {
            text: "在过去一个月中，你感到紧张或有压力的频率？",
            options: [
                { label: "从不", value: 0 },
                { label: "几乎从不", value: 1 },
                { label: "有时", value: 2 },
                { label: " fairly often", value: 3 },
                { label: "非常频繁", value: 4 },
            ],
        },
        {
            text: "在过去一个月中，你能够有效处理烦人问题的信心程度？",
            options: [
                { label: "从不", value: 4 },
                { label: "几乎从不", value: 3 },
                { label: "有时", value: 2 },
                { label: " fairly often", value: 1 },
                { label: "非常频繁", value: 0 },
            ],
        },
        {
            text: "在过去一个月中，你对生活中发生的事情感到满意的频率？",
            options: [
                { label: "从不", value: 4 },
                { label: "几乎从不", value: 3 },
                { label: "有时", value: 2 },
                { label: " fairly often", value: 1 },
                { label: "非常频繁", value: 0 },
            ],
        },
    ];
}

const showAssessmentDialog = ref(false);
const currentAssessment = ref<Assessment | null>(null);
const assessmentStep = ref(0);
const assessmentAnswers = ref<number[]>([]);
const assessmentResult = reactive({
    score: 0,
    level: "",
    advice: "",
});

// 冥想音频
const meditations: Meditation[] = [
    {
        id: 1,
        title: "焦虑舒缓·478呼吸",
        type: "呼吸训练",
        duration: 5,
        description:
            "通过4-7-8呼吸技巧，快速缓解焦虑情绪，恢复内心平静。",
    },
    {
        id: 2,
        title: "正念扫描身体",
        type: "身体扫描",
        duration: 15,
        description:
            "从头到脚逐步觉察身体各部位的感受，释放累积的紧张感。",
    },
    {
        id: 3,
        title: "晨间唤醒冥想",
        type: "清晨冥想",
        duration: 10,
        description:
            "以温和的方式开启新的一天，培养积极的心态和充沛的能量。",
    },
];

// 事件处理
function saveTodayMood() {
    const today = new Date().toISOString().split("T")[0] || "";
    const existingIndex = emotionHistory.value.findIndex(
        (r) => r.date === today
    );

    const newRecord: MoodRecord = {
        date: today,
        mood: todayMood.mood,
        score: todayMood.mood,
    };

    // 只有在有关键词时才添加该属性
    if (todayMood.keywords) {
        newRecord.keywords = todayMood.keywords;
    }

    if (existingIndex >= 0) {
        emotionHistory.value[existingIndex] = newRecord;
    } else {
        emotionHistory.value.push(newRecord);
    }

    ElMessage.success("今日心情已记录！");
    todayMood.keywords = "";
}

function startAssessment(assessment: Assessment) {
    currentAssessment.value = assessment;
    assessmentStep.value = 0;
    assessmentAnswers.value = [];
    assessmentResult.score = 0;
    assessmentResult.level = "";
    assessmentResult.advice = "";
    showAssessmentDialog.value = true;
}

function nextAssessmentStep() {
    if (
        currentAssessment.value &&
        assessmentStep.value < currentAssessment.value.questions.length - 1
    ) {
        assessmentStep.value++;
    } else {
        calculateAssessmentResult();
        assessmentStep.value++;
    }
}

function calculateAssessmentResult() {
    if (!currentAssessment.value) return;

    const totalScore = assessmentAnswers.value.reduce(
        (sum, answer) => sum + answer,
        0
    );
    const maxScore = currentAssessment.value.questions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    assessmentResult.score = totalScore;

    // 根据量表类型判断等级
    if (currentAssessment.value.name.includes("SAS")) {
        if (percentage < 50) {
            assessmentResult.level = "正常";
            assessmentResult.advice =
                "您的焦虑水平在正常范围内。继续保持良好的心态和生活习惯。";
        } else if (percentage < 60) {
            assessmentResult.level = "轻度焦虑";
            assessmentResult.advice =
                "存在轻度焦虑，建议适当放松，进行深呼吸练习或冥想。如持续困扰，可寻求心理咨询。";
        } else if (percentage < 70) {
            assessmentResult.level = "中度焦虑";
            assessmentResult.advice =
                "存在中度焦虑，建议寻求专业心理咨询师帮助，学习压力管理技巧。";
        } else {
            assessmentResult.level = "重度焦虑";
            assessmentResult.advice =
                "存在重度焦虑，强烈建议尽快寻求精神科医生或心理治疗师的专业帮助。";
        }
    } else if (currentAssessment.value.name.includes("SDS")) {
        if (percentage < 50) {
            assessmentResult.level = "正常";
            assessmentResult.advice =
                "您的抑郁水平在正常范围内。继续保持积极的生活态度。";
        } else if (percentage < 60) {
            assessmentResult.level = "轻度抑郁";
            assessmentResult.advice =
                "存在轻度抑郁情绪，建议增加社交活动，保持规律作息。如持续两周以上，请咨询专业人士。";
        } else if (percentage < 70) {
            assessmentResult.level = "中度抑郁";
            assessmentResult.advice =
                "存在中度抑郁，建议寻求心理咨询师帮助，必要时配合药物治疗。";
        } else {
            assessmentResult.level = "重度抑郁";
            assessmentResult.advice =
                "存在重度抑郁，请立即寻求精神科医生的专业帮助，可能需要药物治疗和心理治疗结合。";
        }
    } else {
        if (percentage < 25) {
            assessmentResult.level = "低压力";
            assessmentResult.advice =
                "您的压力水平较低，状态良好。继续保持平衡的生活方式。";
        } else if (percentage < 50) {
            assessmentResult.level = "中等压力";
            assessmentResult.advice =
                "存在一定压力，建议学习时间管理技巧，适当放松和休息。";
        } else if (percentage < 75) {
            assessmentResult.level = "较高压力";
            assessmentResult.advice =
                "压力水平较高，建议调整生活方式，寻求社会支持，必要时咨询专业人士。";
        } else {
            assessmentResult.level = "高压力";
            assessmentResult.advice =
                "压力水平很高，建议立即采取措施减压，如休假、运动、冥想等，并寻求专业帮助。";
        }
    }
}

function getAssessmentLevelType(level: string): string {
    if (level.includes("正常") || level.includes("低")) return "success";
    if (level.includes("轻度") || level.includes("中等")) return "warning";
    return "danger";
}

function playMeditation(meditation: Meditation) {
    ElMessage.info(`正在播放：${meditation.title}`);
    // 实际项目中这里应该调用音频播放器
}

function getMeditationTagType(type: string): string {
    const types: Record<string, string> = {
        呼吸训练: "success",
        身体扫描: "warning",
        清晨冥想: "primary",
    };
    return types[type] || "";
}

// 生命周期
onMounted(() => {
    generateMockData();
});
</script>

<style scoped lang="scss">
.emotion-healing {
    margin-bottom: 30px;

    .card-header {
        h3 {
            margin: 0;
            color: #333;
        }
    }

    .content {
        padding: 20px 0;
    }

    // 今日情绪区域
    .today-mood-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .mood-input-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 25px;
            color: white;

            .mood-selector {
                margin-bottom: 20px;

                .mood-options {
                    display: flex;
                    justify-content: space-around;
                    flex-wrap: wrap;
                    gap: 10px;

                    .mood-item {
                        :deep(.el-radio__label) {
                            padding: 10px 15px;
                            background-color: rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            transition: all 0.3s ease;

                            &:hover {
                                background-color: rgba(255, 255, 255, 0.2);
                            }
                        }

                        :deep(.el-radio.is-checked) {
                            .el-radio__label {
                                background-color: rgba(255, 255, 255, 0.3);
                            }
                        }

                        .mood-content {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 5px;

                            .mood-emoji {
                                font-size: 32px;
                            }

                            .mood-text {
                                font-size: 14px;
                            }
                        }
                    }
                }
            }

            .mood-keywords {
                margin-bottom: 20px;

                :deep(.el-input) {
                    .el-input__wrapper {
                        background-color: rgba(255, 255, 255, 0.9);
                    }
                }
            }

            .mood-actions {
                text-align: center;

                .el-button {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.3);
                    color: white;

                    &:hover {
                        background-color: rgba(255, 255, 255, 0.3);
                    }
                }
            }
        }
    }

    // 情绪曲线区域
    .emotion-chart-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .chart-card {
            border: 1px solid #e4e7ed;
            border-radius: 12px;
            overflow: hidden;
        }

        .chart-container {
            background-color: #f5f7fa;
            padding: 20px;

            .emotion-chart {
                width: 100%;
                height: auto;

                .axis-text {
                    font-size: 12px;
                    fill: #909399;
                }

                .data-point {
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        filter: brightness(1.2);
                    }
                }
            }
        }

        .trend-insight {
            padding: 20px;
            background-color: #fff;

            .insight-descriptions {
                :deep(.el-descriptions__label) {
                    font-weight: bold;
                }
            }

            .trend-up {
                color: #67c23a;
                font-weight: bold;
            }

            .trend-down {
                color: #f56c6c;
                font-weight: bold;
            }

            .trend-stable {
                color: #909399;
                font-weight: bold;
            }
        }
    }

    // 调整建议区域
    .suggestion-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        :deep(.el-timeline-item__timestamp) {
            color: #909399;
            font-size: 14px;
        }

        :deep(.el-card) {
            h5 {
                margin: 0 0 10px 0;
                color: #409eff;
            }

            p {
                margin: 0;
                line-height: 1.6;
                color: #606266;
            }
        }
    }

    // 心理自评区域
    .assessment-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .assessment-card {
            margin-bottom: 20px;
            text-align: center;
            cursor: pointer;
            transition: transform 0.3s ease;

            &:hover {
                transform: translateY(-5px);
            }

            .assessment-icon {
                margin-bottom: 15px;
                color: #409eff;
            }

            h5 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #333;
            }

            .assessment-desc {
                margin: 0 0 15px 0;
                font-size: 14px;
                color: #909399;
                min-height: 40px;
            }
        }

        .assessment-content {
            .question-container {
                padding: 20px 0;

                h4 {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }

                .answer-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;

                    :deep(.el-radio.is-bordered) {
                        width: 100%;
                        margin: 0;
                        padding: 12px 15px;
                    }
                }
            }

            .assessment-result {
                padding: 20px 0;
                text-align: center;

                h4 {
                    font-size: 20px;
                    color: #333;
                    margin-bottom: 20px;
                }

                .result-score {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 30px;
                    margin-bottom: 20px;

                    .score-circle {
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        background: linear-gradient(
                            135deg,
                            #667eea 0%,
                            #764ba2 100%
                        );
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        color: white;

                        .score-number {
                            font-size: 36px;
                            font-weight: bold;
                        }

                        .score-label {
                            font-size: 14px;
                            opacity: 0.9;
                        }
                    }

                    .result-level {
                        .el-tag {
                            font-size: 18px;
                            padding: 10px 20px;
                        }
                    }
                }

                .result-advice {
                    background-color: #f5f7fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;

                    p {
                        margin: 0;
                        line-height: 1.8;
                        color: #606266;
                    }
                }
            }
        }
    }

    // 冥想引导区域
    .meditation-section {
        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .meditation-card {
            margin-bottom: 20px;
            transition: transform 0.3s ease;

            &:hover {
                transform: translateY(-5px);
            }

            .meditation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;

                .meditation-duration {
                    font-size: 14px;
                    color: #909399;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
            }

            h5 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #333;
            }

            .meditation-desc {
                margin: 0 0 15px 0;
                font-size: 14px;
                color: #606266;
                line-height: 1.6;
                min-height: 40px;
            }

            .el-button {
                width: 100%;
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .emotion-healing {
        .today-mood-section {
            .mood-input-card {
                .mood-options {
                    flex-direction: column;

                    .mood-item {
                        width: 100%;
                    }
                }
            }
        }

        .assessment-section,
        .meditation-section {
            :deep(.el-col) {
                margin-bottom: 15px;
            }
        }
    }
}
</style>
