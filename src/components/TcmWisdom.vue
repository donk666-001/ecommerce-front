<template>
    <div class="tcm-wisdom">
        <!-- 体质测试弹窗 -->
        <el-dialog
            v-model="showTestDialog"
            title="中医体质测试"
            width="700px"
            :close-on-click-modal="false"
        >
            <el-steps :active="currentStep" finish-status="success">
                <el-step
                    v-for="(_, index) in questions"
                    :key="index"
                    :title="`第${index + 1}题`"
                />
            </el-steps>

            <div v-if="currentStep < questions.length" class="test-content">
                <h4>{{ questions[currentStep]?.question }}</h4>
                <el-radio-group
                    v-model="answers[currentStep]"
                    class="answer-options"
                >
                    <el-radio
                        v-for="option in questions[currentStep]?.options"
                        :key="option.value"
                        :value="option.value"
                        border
                    >
                        {{ option.label }}
                    </el-radio>
                </el-radio-group>
            </div>

            <div v-else class="test-result">
                <h4>测试结果</h4>
                <div class="result-summary">
                    <div class="primary-constitution">
                        <h5>主体质</h5>
                        <el-tag size="large" type="danger">
                            {{ result.primary.name }}
                        </el-tag>
                        <div class="score">{{ result.primary.score }}分</div>
                    </div>
                    <div v-if="result.secondary" class="secondary-constitution">
                        <h5>兼体质</h5>
                        <el-tag size="large" type="warning">
                            {{ result.secondary.name }}
                        </el-tag>
                        <div class="score">{{ result.secondary.score }}分</div>
                    </div>
                </div>
                <div class="result-description">
                    <p>{{ result.description }}</p>
                </div>
            </div>

            <template #footer>
                <el-button
                    v-if="currentStep < questions.length"
                    @click="showTestDialog = false"
                >
                    取消
                </el-button>
                <el-button
                    v-if="currentStep > 0 && currentStep < questions.length"
                    @click="currentStep--"
                >
                    上一题
                </el-button>
                <el-button
                    v-if="currentStep < questions.length"
                    type="primary"
                    :disabled="
                        answers[currentStep] === undefined ||
                        !questions[currentStep]
                    "
                    @click="nextStep"
                >
                    {{
                        currentStep === questions.length - 1
                            ? "查看结果"
                            : "下一题"
                    }}
                </el-button>
                <el-button
                    v-if="currentStep >= questions.length"
                    type="primary"
                    @click="showTestDialog = false"
                >
                    关闭
                </el-button>
            </template>
        </el-dialog>

        <el-card shadow="hover">
            <template #header>
                <div class="card-header">
                    <h3>中医养生</h3>
                </div>
            </template>

            <div class="content">
                <!-- 体质测试模块 -->
                <section class="constitution-section">
                    <h4 class="section-title">我的体质</h4>
                    <div class="constitution-card">
                        <div class="constitution-info">
                            <div class="constitution-tags">
                                <el-tag size="large" type="danger">
                                    {{ currentConstitution.primary }}
                                </el-tag>
                                <el-tag
                                    v-if="currentConstitution.secondary"
                                    size="large"
                                    type="warning"
                                >
                                    {{ currentConstitution.secondary }}
                                </el-tag>
                            </div>
                            <div class="constitution-scores">
                                <div class="score-item">
                                    <span class="score-label">主体质：</span>
                                    <span class="score-value primary">
                                        {{ currentConstitution.primaryName }}
                                        {{ currentConstitution.primaryScore }}分
                                    </span>
                                </div>
                                <div
                                    v-if="currentConstitution.secondaryScore"
                                    class="score-item"
                                >
                                    <span class="score-label">兼体质：</span>
                                    <span class="score-value secondary">
                                        {{ currentConstitution.secondaryName }}
                                        {{
                                            currentConstitution.secondaryScore
                                        }}分
                                    </span>
                                </div>
                            </div>
                        </div>
                        <el-button type="primary" @click="startTest">
                            重新测试体质
                        </el-button>
                    </div>
                </section>

                <!-- 经络穴位模块 -->
                <section class="meridian-section">
                    <h4 class="section-title">经络穴位</h4>
                    <div class="meridian-container">
                        <div class="body-map">
                            <svg viewBox="0 0 400 600" class="body-svg">
                                <!-- 人体轮廓 -->
                                <ellipse
                                    cx="200"
                                    cy="60"
                                    rx="35"
                                    ry="45"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                />
                                <rect
                                    x="165"
                                    y="105"
                                    width="70"
                                    height="120"
                                    rx="10"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                />
                                <rect
                                    x="150"
                                    y="225"
                                    width="100"
                                    height="140"
                                    rx="10"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                />
                                <rect
                                    x="160"
                                    y="365"
                                    width="35"
                                    height="180"
                                    rx="5"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                />
                                <rect
                                    x="205"
                                    y="365"
                                    width="35"
                                    height="180"
                                    rx="5"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                />
                                <!-- 左臂 -->
                                <rect
                                    x="110"
                                    y="120"
                                    width="45"
                                    height="110"
                                    rx="5"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                    transform="rotate(-15 110 120)"
                                />
                                <!-- 右臂 -->
                                <rect
                                    x="245"
                                    y="120"
                                    width="45"
                                    height="110"
                                    rx="5"
                                    fill="#FFE4C4"
                                    stroke="#D2691E"
                                    stroke-width="2"
                                    transform="rotate(15 245 120)"
                                />

                                <!-- 穴位标注 -->
                                <g
                                    v-for="acupoint in acupoints"
                                    :key="acupoint.id"
                                    class="acupoint-group"
                                >
                                    <circle
                                        :cx="acupoint.x"
                                        :cy="acupoint.y"
                                        r="8"
                                        fill="#FF6B9D"
                                        stroke="#fff"
                                        stroke-width="2"
                                        class="acupoint-marker"
                                        @click="showAcupointDetail(acupoint)"
                                    />
                                    <text
                                        :x="acupoint.x"
                                        :y="acupoint.y - 12"
                                        text-anchor="middle"
                                        class="acupoint-label"
                                    >
                                        {{ acupoint.name }}
                                    </text>
                                </g>
                            </svg>
                        </div>
                        <div class="acupoint-list">
                            <h5>常用穴位</h5>
                            <el-scrollbar height="300px">
                                <div
                                    v-for="acupoint in acupoints"
                                    :key="acupoint.id"
                                    class="acupoint-item"
                                    @click="showAcupointDetail(acupoint)"
                                >
                                    <div class="acupoint-name">
                                        {{ acupoint.name }}
                                    </div>
                                    <div class="acupoint-effect">
                                        {{ acupoint.effect }}
                                    </div>
                                </div>
                            </el-scrollbar>
                        </div>
                    </div>
                </section>

                <!-- 穴位详情弹窗 -->
                <el-dialog
                    v-model="showAcupointDialog"
                    :title="selectedAcupoint?.name"
                    width="500px"
                >
                    <div v-if="selectedAcupoint" class="acupoint-detail">
                        <div class="detail-section">
                            <h5>功效主治</h5>
                            <p>{{ selectedAcupoint.indications }}</p>
                        </div>
                        <div class="detail-section">
                            <h5>按摩方法</h5>
                            <p>{{ selectedAcupoint.method }}</p>
                        </div>
                        <div class="detail-section">
                            <h5>注意事项</h5>
                            <p>{{ selectedAcupoint.caution }}</p>
                        </div>
                    </div>
                </el-dialog>

                <!-- 中医知识科普文章 -->
                <section class="articles-section">
                    <h4 class="section-title">中医知识科普</h4>
                    <el-tabs v-model="articleCategory" class="article-tabs">
                        <el-tab-pane label="阴阳五行" name="yin-yang">
                            <div class="article-list">
                                <el-card
                                    v-for="article in articles.yinYang"
                                    :key="article.id"
                                    class="article-card"
                                    shadow="hover"
                                >
                                    <template #header>
                                        <div class="article-header">
                                            <span>{{ article.title }}</span>
                                            <el-tag size="small">
                                                {{ article.category }}
                                            </el-tag>
                                        </div>
                                    </template>
                                    <div class="article-content">
                                        <p>{{ article.summary }}</p>
                                        <div class="article-meta">
                                            <span>{{ article.date }}</span>
                                            <span>{{ article.readTime }}</span>
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="四诊合参" name="diagnosis">
                            <div class="article-list">
                                <el-card
                                    v-for="article in articles.diagnosis"
                                    :key="article.id"
                                    class="article-card"
                                    shadow="hover"
                                >
                                    <template #header>
                                        <div class="article-header">
                                            <span>{{ article.title }}</span>
                                            <el-tag size="small">
                                                {{ article.category }}
                                            </el-tag>
                                        </div>
                                    </template>
                                    <div class="article-content">
                                        <p>{{ article.summary }}</p>
                                        <div class="article-meta">
                                            <span>{{ article.date }}</span>
                                            <span>{{ article.readTime }}</span>
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="四季养生" name="seasons">
                            <div class="article-list">
                                <el-card
                                    v-for="article in articles.seasons"
                                    :key="article.id"
                                    class="article-card"
                                    shadow="hover"
                                >
                                    <template #header>
                                        <div class="article-header">
                                            <span>{{ article.title }}</span>
                                            <el-tag size="small">
                                                {{ article.category }}
                                            </el-tag>
                                        </div>
                                    </template>
                                    <div class="article-content">
                                        <p>{{ article.summary }}</p>
                                        <div class="article-meta">
                                            <span>{{ article.date }}</span>
                                            <span>{{ article.readTime }}</span>
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </section>

                <!-- 中医课程推荐 -->
                <section class="courses-section">
                    <div class="section-header">
                        <h4 class="section-title">精选课程</h4>
                        <el-button link type="primary">
                            查看全部
                            <el-icon><ArrowRight /></el-icon>
                        </el-button>
                    </div>
                    <el-row :gutter="20">
                        <el-col
                            v-for="course in courses"
                            :key="course.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                            :lg="6"
                        >
                            <el-card class="course-card" shadow="hover">
                                <div class="course-image">
                                    <img
                                        :src="course.image"
                                        :alt="course.title"
                                    />
                                    <el-tag
                                        :type="
                                            getCourseStatusType(course.status)
                                        "
                                        class="course-status"
                                    >
                                        {{ getCourseStatusText(course.status) }}
                                    </el-tag>
                                </div>
                                <div class="course-info">
                                    <h5 class="course-title">
                                        {{ course.title }}
                                    </h5>
                                    <div class="course-meta">
                                        <span class="course-lessons">
                                            <el-icon><Document /></el-icon>
                                            {{ course.lessons }}节
                                        </span>
                                        <span class="course-teacher">
                                            <el-icon><User /></el-icon>
                                            {{ course.teacher }}
                                        </span>
                                    </div>
                                    <el-progress
                                        v-if="course.progress > 0"
                                        :percentage="course.progress"
                                        :stroke-width="6"
                                    />
                                    <el-button
                                        class="course-action"
                                        type="primary"
                                        size="small"
                                    >
                                        {{
                                            course.progress > 0
                                                ? "继续学习"
                                                : "开始学习"
                                        }}
                                    </el-button>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </section>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ArrowRight, Document, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 类型定义
interface Question {
    question: string;
    options: Array<{ label: string; value: number }>;
}

interface ConstitutionResult {
    primary: { name: string; score: number };
    secondary?: { name: string; score: number };
    description: string;
}

interface Acupoint {
    id: number;
    name: string;
    x: number;
    y: number;
    effect: string;
    indications: string;
    method: string;
    caution: string;
}

interface Course {
    id: number;
    title: string;
    image: string;
    lessons: number;
    teacher: string;
    status: "not-started" | "in-progress" | "completed";
    progress: number;
}

// 体质测试相关
const showTestDialog = ref(false);
const currentStep = ref(0);
const answers = ref<number[]>([]);

// 体质测试题库（示例题目）
const questions: Question[] = [
    {
        question: "您是否经常感到手脚心发热？",
        options: [
            { label: "没有", value: 0 },
            { label: "很少", value: 1 },
            { label: "有时", value: 2 },
            { label: "经常", value: 3 },
            { label: "总是", value: 4 },
        ],
    },
    {
        question: "您是否容易口干咽燥？",
        options: [
            { label: "没有", value: 0 },
            { label: "很少", value: 1 },
            { label: "有时", value: 2 },
            { label: "经常", value: 3 },
            { label: "总是", value: 4 },
        ],
    },
    {
        question: "您是否容易情绪抑郁或焦虑？",
        options: [
            { label: "没有", value: 0 },
            { label: "很少", value: 1 },
            { label: "有时", value: 2 },
            { label: "经常", value: 3 },
            { label: "总是", value: 4 },
        ],
    },
    {
        question: "您是否容易疲劳乏力？",
        options: [
            { label: "没有", value: 0 },
            { label: "很少", value: 1 },
            { label: "有时", value: 2 },
            { label: "经常", value: 3 },
            { label: "总是", value: 4 },
        ],
    },
    {
        question: "您是否怕冷，手脚冰凉？",
        options: [
            { label: "没有", value: 0 },
            { label: "很少", value: 1 },
            { label: "有时", value: 2 },
            { label: "经常", value: 3 },
            { label: "总是", value: 4 },
        ],
    },
];

// 当前体质信息
const currentConstitution = reactive({
    primary: "阴虚",
    primaryName: "阴虚",
    primaryScore: 68,
    secondary: "气郁",
    secondaryName: "气郁",
    secondaryScore: 52,
});

// 测试结果
const result = ref<ConstitutionResult>({
    primary: { name: "", score: 0 },
    description: "",
});

// 经络穴位数据
const acupoints: Acupoint[] = [
    {
        id: 1,
        name: "顺中",
        x: 200,
        y: 150,
        effect: "宁心安神",
        indications: "心悸、失眠、焦虑、胸闷",
        method: "用拇指指腹按压3-5分钟，力度适中，每日2-3次",
        caution: "孕妇慎用，饭后半小时内不宜按摩",
    },
    {
        id: 2,
        name: "内关",
        x: 130,
        y: 200,
        effect: "和胃定胸",
        indications: "胃痛、恶心、呕吐、胸闷、心悸",
        method: "用拇指按压手腕内侧，每次3-5分钟，有酸胀感为宜",
        caution: "皮肤破损处不宜按摩",
    },
    {
        id: 3,
        name: "足三里",
        x: 175,
        y: 450,
        effect: "健脾养胃",
        indications: "消化不良、腹胀、腹泻、疲劳",
        method: "用拇指或中指按压，每次5-10分钟，力度由轻到重",
        caution: "空腹时不宜强力按压",
    },
    {
        id: 4,
        name: "三阴交",
        x: 225,
        y: 480,
        effect: "调理气血",
        indications: "月经不调、痛经、失眠、头晕",
        method: "用拇指指腹揉按，每次3-5分钟，早晚各一次",
        caution: "孕妇禁用",
    },
    {
        id: 5,
        name: "百会",
        x: 200,
        y: 30,
        effect: "升阳举陷",
        indications: "头痛、眩晕、失眠、健忘",
        method: "用中指指腹轻轻按揉，每次3-5分钟",
        caution: "头部外伤者禁用",
    },
];

const showAcupointDialog = ref(false);
const selectedAcupoint = ref<Acupoint | null>(null);

// 文章分类
const articleCategory = ref("yin-yang");

// 中医知识文章数据
const articles = reactive({
    yinYang: [
        {
            id: 1,
            title: "阴阳学说的基本概念",
            category: "阴阳五行",
            summary: "阴阳是中医理论的核心，代表着事物对立统一的两个方面...",
            date: "2024-01-15",
            readTime: "8分钟",
        },
        {
            id: 2,
            title: "五行相生相克原理",
            category: "阴阳五行",
            summary:
                "木火土金水五行之间存在相生相克的关系，维持着人体的平衡...",
            date: "2024-01-18",
            readTime: "10分钟",
        },
    ],
    diagnosis: [
        {
            id: 3,
            title: "望诊：观察面色与舌象",
            category: "四诊合参",
            summary: "通过观察患者的面色、舌苔等外在表现来判断身体状况...",
            date: "2024-01-20",
            readTime: "12分钟",
        },
        {
            id: 4,
            title: "闻诊与问诊技巧",
            category: "四诊合参",
            summary: "通过听声音、嗅气味以及询问病史来全面了解病情...",
            date: "2024-01-22",
            readTime: "9分钟",
        },
    ],
    seasons: [
        {
            id: 5,
            title: "春季养肝指南",
            category: "四季养生",
            summary: "春季对应肝脏，应注重疏肝理气，保持心情舒畅...",
            date: "2024-01-25",
            readTime: "7分钟",
        },
        {
            id: 6,
            title: "夏季养心要点",
            category: "四季养生",
            summary: "夏季炎热，应注意清热解暑，保护心脏功能...",
            date: "2024-01-28",
            readTime: "8分钟",
        },
    ],
});

// 课程数据
const courses: Course[] = [
    {
        id: 1,
        title: "八段锦入门",
        image: "https://via.placeholder.com/300x200?text=八段锦",
        lessons: 12,
        teacher: "王老师",
        status: "in-progress",
        progress: 25,
    },
    {
        id: 2,
        title: "阴阳五行精讲",
        image: "https://via.placeholder.com/300x200?text=阴阳五行",
        lessons: 8,
        teacher: "李教授",
        status: "not-started",
        progress: 0,
    },
    {
        id: 3,
        title: "经络穴位基础",
        image: "https://via.placeholder.com/300x200?text=经络穴位",
        lessons: 15,
        teacher: "张医师",
        status: "in-progress",
        progress: 60,
    },
    {
        id: 4,
        title: "四季养生之道",
        image: "https://via.placeholder.com/300x200?text=四季养生",
        lessons: 10,
        teacher: "陈老师",
        status: "completed",
        progress: 100,
    },
];

// 工具函数
function startTest() {
    currentStep.value = 0;
    answers.value = [];
    showTestDialog.value = true;
}

function nextStep() {
    if (currentStep.value < questions.length - 1) {
        currentStep.value++;
    } else {
        calculateResult();
        currentStep.value++;
    }
}

function calculateResult() {
    // 简化的体质计算逻辑（实际应根据中医体质分类标准）
    const yinXuScore = ((answers.value[0] ?? 0) + (answers.value[1] ?? 0)) * 10;
    const qiYuScore = (answers.value[2] ?? 0) * 13;

    result.value = {
        primary: {
            name: yinXuScore > qiYuScore ? "阴虚" : "气郁",
            score: Math.max(yinXuScore, qiYuScore),
        },
        description:
            yinXuScore > qiYuScore
                ? "阴虚体质主要表现为体内阴液不足，容易出现口干、手足心热等症状。建议多食用滋阴润燥的食物，如银耳、百合、梨等。"
                : "气郁体质主要表现为情绪不畅，容易抑郁焦虑。建议保持心情愉悦，适当运动，可饮用玫瑰花茶疏肝解郁。",
    };

    // 只有在有兼体质时才添加 secondary 属性
    if (yinXuScore !== qiYuScore) {
        result.value.secondary = {
            name: yinXuScore > qiYuScore ? "气郁" : "阴虚",
            score: Math.min(yinXuScore, qiYuScore),
        };
    }

    // 更新当前体质显示
    currentConstitution.primary = result.value.primary.name;
    currentConstitution.primaryName = result.value.primary.name;
    currentConstitution.primaryScore = result.value.primary.score;

    if (result.value.secondary) {
        currentConstitution.secondary = result.value.secondary.name;
        currentConstitution.secondaryName = result.value.secondary.name;
        currentConstitution.secondaryScore = result.value.secondary.score;
    }

    ElMessage.success("测试完成！");
}

function showAcupointDetail(acupoint: Acupoint) {
    selectedAcupoint.value = acupoint;
    showAcupointDialog.value = true;
}

function getCourseStatusType(
    status: Course["status"],
): "" | "success" | "warning" | "info" {
    const types: Record<Course["status"], "" | "success" | "warning" | "info"> =
        {
            "not-started": "info",
            "in-progress": "warning",
            completed: "success",
        };
    return types[status];
}

function getCourseStatusText(status: Course["status"]): string {
    const texts = {
        "not-started": "未开始",
        "in-progress": "学习中",
        completed: "已完成",
    };
    return texts[status] || "";
}
</script>

<style scoped lang="scss">
.tcm-wisdom {
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

    // 体质测试区域
    .constitution-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .constitution-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;

            .constitution-info {
                flex: 1;

                .constitution-tags {
                    margin-bottom: 15px;

                    .el-tag {
                        margin-right: 10px;
                        font-size: 16px;
                        padding: 8px 16px;
                    }
                }

                .constitution-scores {
                    .score-item {
                        margin-bottom: 8px;
                        font-size: 14px;

                        .score-label {
                            opacity: 0.9;
                        }

                        .score-value {
                            font-weight: bold;

                            &.primary {
                                color: #ffd700;
                            }

                            &.secondary {
                                color: #ffa500;
                            }
                        }
                    }
                }
            }

            .el-button {
                background-color: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
                color: white;

                &:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }
            }
        }

        .test-content {
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

        .test-result {
            padding: 20px 0;

            h4 {
                font-size: 20px;
                color: #333;
                margin-bottom: 20px;
                text-align: center;
            }

            .result-summary {
                display: flex;
                justify-content: space-around;
                margin-bottom: 20px;

                .primary-constitution,
                .secondary-constitution {
                    text-align: center;

                    h5 {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 10px;
                    }

                    .el-tag {
                        font-size: 18px;
                        padding: 10px 20px;
                        margin-bottom: 10px;
                    }

                    .score {
                        font-size: 24px;
                        font-weight: bold;
                        color: #409eff;
                    }
                }
            }

            .result-description {
                background-color: #f5f7fa;
                padding: 15px;
                border-radius: 8px;

                p {
                    margin: 0;
                    line-height: 1.8;
                    color: #606266;
                }
            }
        }
    }

    // 经络穴位区域
    .meridian-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .meridian-container {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
        }

        .body-map {
            background-color: #f5f7fa;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;

            .body-svg {
                max-width: 100%;
                height: auto;

                .acupoint-marker {
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        fill: #ff4081;
                    }
                }

                .acupoint-label {
                    font-size: 12px;
                    fill: #333;
                    font-weight: bold;
                }
            }
        }

        .acupoint-list {
            h5 {
                font-size: 16px;
                color: #333;
                margin-bottom: 15px;
            }

            .acupoint-item {
                padding: 12px;
                border: 1px solid #e4e7ed;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    border-color: #409eff;
                    background-color: #ecf5ff;
                }

                .acupoint-name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 5px;
                }

                .acupoint-effect {
                    font-size: 14px;
                    color: #606266;
                }
            }
        }

        .acupoint-detail {
            .detail-section {
                margin-bottom: 20px;

                h5 {
                    font-size: 16px;
                    color: #409eff;
                    margin-bottom: 10px;
                }

                p {
                    margin: 0;
                    line-height: 1.8;
                    color: #606266;
                }
            }
        }
    }

    // 文章区域
    .articles-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .article-tabs {
            :deep(.el-tabs__header) {
                margin-bottom: 20px;
            }
        }

        .article-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .article-card {
            cursor: pointer;
            transition: transform 0.3s ease;

            &:hover {
                transform: translateY(-5px);
            }

            .article-header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                span {
                    font-weight: bold;
                    color: #333;
                }
            }

            .article-content {
                p {
                    margin: 0 0 10px 0;
                    color: #606266;
                    line-height: 1.6;
                }

                .article-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }

    // 课程区域
    .courses-section {
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .section-title {
                font-size: 18px;
                color: #333;
                margin: 0;
            }
        }

        .course-card {
            margin-bottom: 20px;
            cursor: pointer;
            transition: transform 0.3s ease;

            &:hover {
                transform: translateY(-5px);
            }

            .course-image {
                position: relative;
                height: 150px;
                overflow: hidden;
                border-radius: 8px 8px 0 0;
                margin: -20px -20px 15px -20px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .course-status {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                }
            }

            .course-info {
                .course-title {
                    font-size: 16px;
                    color: #333;
                    margin: 0 0 10px 0;
                }

                .course-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: #909399;

                    span {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                }

                .course-action {
                    width: 100%;
                    margin-top: 10px;
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .tcm-wisdom {
        .constitution-section {
            .constitution-card {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
        }

        .meridian-section {
            .meridian-container {
                grid-template-columns: 1fr;
            }
        }

        .articles-section {
            .article-list {
                grid-template-columns: 1fr;
            }
        }
    }
}
</style>
