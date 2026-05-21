<template>
    <div class="menstrual-tracker">
        <!-- 首次使用引导 -->
        <el-dialog
            v-model="showSetupDialog"
            title="经期管理初始化"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form :model="setupForm" label-width="120px">
                <el-form-item label="上次月经开始日期">
                    <el-date-picker
                        v-model="setupForm.lastPeriodStart"
                        type="date"
                        placeholder="选择日期"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="平均周期天数">
                    <el-input-number
                        v-model="setupForm.cycleLength"
                        :min="21"
                        :max="35"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="经期持续天数">
                    <el-input-number
                        v-model="setupForm.periodDuration"
                        :min="3"
                        :max="7"
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showSetupDialog = false">取消</el-button>
                <el-button type="primary" @click="completeSetup"
                    >完成设置</el-button
                >
            </template>
        </el-dialog>

        <el-card shadow="hover">
            <template #header>
                <div class="card-header">
                    <h3>经期管理</h3>
                    <el-button size="small" @click="showSetupDialog = true">
                        重新设置
                    </el-button>
                </div>
            </template>

            <div class="content">
                <!-- 经期倒计时 -->
                <section class="countdown-section">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <div class="countdown-card">
                                <div class="countdown-number">
                                    {{ countdownDays }}
                                </div>
                                <div class="countdown-label">距下次月经</div>
                                <div class="countdown-unit">DAYS LEFT</div>
                            </div>
                        </el-col>
                        <el-col :span="12">
                            <div class="phase-card">
                                <el-tag
                                    :type="getPhaseTagType(currentPhase)"
                                    size="large"
                                >
                                    {{ currentPhaseName }}
                                </el-tag>
                                <div class="phase-day">
                                    第 {{ currentPhaseDay }} 天
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </section>

                <!-- 月历视图 -->
                <section class="calendar-section">
                    <h4 class="section-title">周期日历</h4>
                    <div class="calendar-container">
                        <div class="calendar-header">
                            <el-button size="small" @click="changeMonth(-1)">
                                <el-icon><ArrowLeft /></el-icon>
                            </el-button>
                            <span class="current-month">
                                {{ currentYear }}年{{ currentMonth }}月
                            </span>
                            <el-button size="small" @click="changeMonth(1)">
                                <el-icon><ArrowRight /></el-icon>
                            </el-button>
                        </div>
                        <div class="calendar-grid">
                            <!-- 星期标题 -->
                            <div
                                v-for="day in weekDays"
                                :key="day"
                                class="weekday-cell"
                            >
                                {{ day }}
                            </div>
                            <!-- 日期格子 -->
                            <div
                                v-for="date in calendarDates"
                                :key="date.dateStr"
                                class="date-cell"
                                :class="getDateClasses(date)"
                                @click="handleDateClick(date)"
                            >
                                <div class="date-number">{{ date.day }}</div>
                                <div
                                    v-if="date.hasRecord"
                                    class="record-indicator"
                                >
                                    ●
                                </div>
                            </div>
                        </div>
                        <!-- 图例 -->
                        <div class="calendar-legend">
                            <div class="legend-item">
                                <span class="legend-color period-filled"></span>
                                <span>经期</span>
                            </div>
                            <div class="legend-item">
                                <span
                                    class="legend-color period-predicted"
                                ></span>
                                <span>预测经期</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color ovulation"></span>
                                <span>排卵期</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color today"></span>
                                <span>今天</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 症状追踪 -->
                <section class="symptoms-section">
                    <h4 class="section-title">今日身体记录</h4>
                    <div class="symptoms-container">
                        <el-checkbox-group
                            v-model="selectedSymptoms"
                            class="symptoms-grid"
                        >
                            <el-checkbox
                                v-for="symptom in symptomOptions"
                                :key="symptom.value"
                                :value="symptom.value"
                                class="symptom-item"
                                @change="
                                    handleSymptomChange(symptom.value, $event)
                                "
                            >
                                <span class="symptom-emoji">{{
                                    symptom.emoji
                                }}</span>
                                <span class="symptom-name">{{
                                    symptom.name
                                }}</span>
                            </el-checkbox>
                        </el-checkbox-group>

                        <!-- 症状评分弹窗 -->
                        <el-dialog
                            v-model="showRatingDialog"
                            title="症状程度评分"
                            width="400px"
                        >
                            <div class="rating-content">
                                <p>{{ currentRatingSymptom?.name }}</p>
                                <el-rate
                                    v-model="currentRating"
                                    :max="3"
                                    show-text
                                    :texts="['轻度', '中度', '重度']"
                                />
                            </div>
                            <template #footer>
                                <el-button @click="showRatingDialog = false">
                                    取消
                                </el-button>
                                <el-button
                                    type="primary"
                                    @click="confirmRating"
                                >
                                    确认
                                </el-button>
                            </template>
                        </el-dialog>
                    </div>
                </section>

                <!-- 养生方案 -->
                <section class="wellness-section">
                    <h4 class="section-title">
                        {{ currentPhaseName }}养生方案
                    </h4>
                    <div class="wellness-container">
                        <el-steps direction="vertical" :active="3">
                            <el-step
                                title="饮食建议"
                                :description="wellnessPlan.diet"
                            >
                                <template #icon>
                                    <el-icon><Food /></el-icon>
                                </template>
                            </el-step>
                            <el-step
                                title="运动推荐"
                                :description="wellnessPlan.exercise"
                            >
                                <template #icon>
                                    <el-icon><Operation /></el-icon>
                                </template>
                            </el-step>
                            <el-step
                                title="调理方法"
                                :description="wellnessPlan.treatment"
                            >
                                <template #icon>
                                    <el-icon><FirstAidKit /></el-icon>
                                </template>
                            </el-step>
                        </el-steps>
                    </div>
                </section>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
    ArrowLeft,
    ArrowRight,
    Food,
    Operation,
    FirstAidKit,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 类型定义
interface PeriodRecord {
    startDate: string;
    endDate?: string;
    symptoms: Record<string, number>; // 症状名称 -> 程度(1-3)
}

interface SetupFormData {
    lastPeriodStart: Date | null;
    cycleLength: number;
    periodDuration: number;
}

interface CalendarDate {
    date: Date;
    day: number;
    dateStr: string;
    isCurrentMonth: boolean;
    hasRecord: boolean;
}

interface SymptomOption {
    value: string;
    name: string;
    emoji: string;
}

interface WellnessPlan {
    diet: string;
    exercise: string;
    treatment: string;
}

// 状态数据
const showSetupDialog = ref(false);
const setupForm = ref<SetupFormData>({
    lastPeriodStart: null,
    cycleLength: 28,
    periodDuration: 5,
});

const periodRecords = ref<PeriodRecord[]>([]);
const selectedSymptoms = ref<string[]>([]);
const showRatingDialog = ref(false);
const currentRatingSymptom = ref<SymptomOption | null>(null);
const currentRating = ref(0);

const currentDate = new Date();
const currentYear = ref(currentDate.getFullYear());
const currentMonth = ref(currentDate.getMonth() + 1);

// 症状选项
const symptomOptions: SymptomOption[] = [
    { value: "cramp", name: "痛经", emoji: "😣" },
    { value: "bloating", name: "胀痛", emoji: "😫" },
    { value: "sleepy", name: "嗜睡", emoji: "😴" },
    { value: "appetite", name: "食欲增", emoji: "😋" },
    { value: "irritable", name: "烦躁", emoji: "😤" },
    { value: "edema", name: "水肿", emoji: "💧" },
    { value: "headache", name: "头痛", emoji: "🤕" },
    { value: "acne", name: "痤疮", emoji: "😟" },
];

// 星期标题
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 计算属性：经期阶段
const currentPhase = computed(() => {
    if (!setupForm.value.lastPeriodStart) return "unknown";

    const lastStart = new Date(setupForm.value.lastPeriodStart);
    const today = new Date();
    const diffDays = Math.floor(
        (today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const cycleDay = (diffDays % setupForm.value.cycleLength) + 1;

    if (cycleDay <= setupForm.value.periodDuration) {
        return "menstrual"; // 经期
    } else if (cycleDay <= 13) {
        return "follicular"; // 卵泡期
    } else if (cycleDay <= 16) {
        return "ovulation"; // 排卵期
    } else {
        return "luteal"; // 黄体期
    }
});

const currentPhaseName = computed(() => {
    const phaseNames: Record<string, string> = {
        menstrual: "经期",
        follicular: "卵泡期",
        ovulation: "排卵期",
        luteal: "黄体期",
        unknown: "未知",
    };
    return phaseNames[currentPhase.value] || "未知";
});

const currentPhaseDay = computed(() => {
    if (!setupForm.value.lastPeriodStart) return 0;

    const lastStart = new Date(setupForm.value.lastPeriodStart);
    const today = new Date();
    const diffDays = Math.floor(
        (today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    return (diffDays % setupForm.value.cycleLength) + 1;
});

// 计算下次月经倒计时
const countdownDays = computed(() => {
    if (!setupForm.value.lastPeriodStart) return 0;

    const lastStart = new Date(setupForm.value.lastPeriodStart);
    const today = new Date();
    const diffDays = Math.floor(
        (today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysSinceLastPeriod = diffDays % setupForm.value.cycleLength;
    return setupForm.value.cycleLength - daysSinceLastPeriod;
});

// 生成日历数据
const calendarDates = computed(() => {
    const dates: CalendarDate[] = [];
    const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
    const lastDay = new Date(currentYear.value, currentMonth.value, 0);
    const startPadding = firstDay.getDay(); // 月初需要填充的天数

    // 上月填充
    for (let i = 0; i < startPadding; i++) {
        const date = new Date(firstDay);
        date.setDate(date.getDate() - startPadding + i);
        dates.push({
            date,
            day: date.getDate(),
            dateStr: formatDate(date),
            isCurrentMonth: false,
            hasRecord: hasRecordOnDate(date),
        });
    }

    // 当月日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear.value, currentMonth.value - 1, day);
        dates.push({
            date,
            day,
            dateStr: formatDate(date),
            isCurrentMonth: true,
            hasRecord: hasRecordOnDate(date),
        });
    }

    // 下月填充（补齐6行）
    const remainingCells = 42 - dates.length; // 6行 x 7列
    for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(lastDay);
        date.setDate(date.getDate() + i);
        dates.push({
            date,
            day: date.getDate(),
            dateStr: formatDate(date),
            isCurrentMonth: false,
            hasRecord: hasRecordOnDate(date),
        });
    }

    return dates;
});

// 养生方案
const wellnessPlan = computed<WellnessPlan>(() => {
    const plans: Record<string, WellnessPlan> = {
        menstrual: {
            diet: "温补气血，多喝红糖姜茶、红枣桂圆汤",
            exercise: "避免剧烈运动，可进行轻柔瑜伽或散步",
            treatment: "注意保暖，可使用暖宝宝缓解不适",
        },
        follicular: {
            diet: "补充蛋白质和维生素，多吃豆制品、绿叶蔬菜",
            exercise: "适合有氧运动，如慢跑、游泳、健身",
            treatment: "保持心情愉悦，规律作息",
        },
        ovulation: {
            diet: "清淡饮食，多吃新鲜水果蔬菜，补充水分",
            exercise: "适度运动，避免过度劳累",
            treatment: "注意休息，保持良好的卫生习惯",
        },
        luteal: {
            diet: "温补脾胃，少吃生冷食物，多喝温开水",
            exercise: "舒缓运动，如太极、八段锦、泡脚",
            treatment: "泡脚配方：艾叶+生姜，每晚15-20分钟",
        },
        unknown: {
            diet: "均衡饮食，注意营养搭配",
            exercise: "适量运动，保持身体健康",
            treatment: "规律作息，保持良好心态",
        },
    };
    return plans[currentPhase.value] || plans.unknown;
});

// 工具函数
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

function isInPeriod(date: Date): boolean {
    const dateStr = formatDate(date);
    return periodRecords.value.some((record) => {
        const start = record.startDate;
        const end = record.endDate || start;
        return dateStr >= start && dateStr <= end;
    });
}

function isPredictedPeriod(date: Date): boolean {
    if (!setupForm.value.lastPeriodStart) return false;

    const lastStart = new Date(setupForm.value.lastPeriodStart);
    const nextPeriodStart = new Date(lastStart);
    nextPeriodStart.setDate(
        nextPeriodStart.getDate() + setupForm.value.cycleLength,
    );

    const predictedEnd = new Date(nextPeriodStart);
    predictedEnd.setDate(
        predictedEnd.getDate() + setupForm.value.periodDuration - 1,
    );

    const dateStr = formatDate(date);
    const startStr = formatDate(nextPeriodStart);
    const endStr = formatDate(predictedEnd);

    return dateStr >= startStr && dateStr <= endStr;
}

function isInOvulation(date: Date): boolean {
    if (!setupForm.value.lastPeriodStart) return false;

    const lastStart = new Date(setupForm.value.lastPeriodStart);
    const ovulationStart = new Date(lastStart);
    ovulationStart.setDate(ovulationStart.getDate() + 13); // 排卵日前2天

    const ovulationEnd = new Date(lastStart);
    ovulationEnd.setDate(ovulationEnd.getDate() + 16); // 排卵日后1天

    const dateStr = formatDate(date);
    const startStr = formatDate(ovulationStart);
    const endStr = formatDate(ovulationEnd);

    return dateStr >= startStr && dateStr <= endStr;
}

function hasRecordOnDate(date: Date): boolean {
    const dateStr = formatDate(date);
    return periodRecords.value.some(
        (record) => record.startDate === dateStr || record.endDate === dateStr,
    );
}

function getDateClasses(date: CalendarDate): string[] {
    const classes: string[] = [];

    if (!date.isCurrentMonth) {
        classes.push("other-month");
    }

    if (isToday(date.date)) {
        classes.push("today");
    }

    if (isInPeriod(date.date)) {
        classes.push("period-filled");
    } else if (isPredictedPeriod(date.date)) {
        classes.push("period-predicted");
    } else if (isInOvulation(date.date)) {
        classes.push("ovulation");
    }

    return classes;
}

function getPhaseTagType(phase: string): "primary" | "success" | "info" | "warning" | "danger" {
    const types: Record<string, "primary" | "success" | "info" | "warning" | "danger"> = {
        menstrual: "danger",
        follicular: "success",
        ovulation: "warning",
        luteal: "info",
        unknown: "info",
    };
    return types[phase] || "info";
}

// 事件处理
function changeMonth(delta: number) {
    let newMonth = currentMonth.value + delta;
    let newYear = currentYear.value;

    if (newMonth > 12) {
        newMonth = 1;
        newYear++;
    } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
    }

    currentMonth.value = newMonth;
    currentYear.value = newYear;
}

function handleDateClick(date: CalendarDate) {
    const dateStr = date.dateStr;
    const existingRecord = periodRecords.value.find(
        (r) => r.startDate === dateStr || r.endDate === dateStr,
    );

    if (existingRecord) {
        ElMessage.info(`已选择日期：${dateStr}`);
    } else {
        // 添加新记录
        periodRecords.value.push({
            startDate: dateStr,
            endDate: dateStr,
            symptoms: {},
        });
        ElMessage.success(`已记录日期：${dateStr}`);
    }
}

function handleSymptomChange(
    value: string,
    checked: boolean | string | number,
) {
    if (checked) {
        const symptom = symptomOptions.find((s) => s.value === value);
        if (symptom) {
            currentRatingSymptom.value = symptom;
            currentRating.value = 0;
            showRatingDialog.value = true;
        }
    }
}

function confirmRating() {
    if (currentRatingSymptom.value && currentRating.value > 0) {
        ElMessage.success(
            `已记录：${currentRatingSymptom.value.name} - ${
                ["", "轻度", "中度", "重度"][currentRating.value]
            }`,
        );
        showRatingDialog.value = false;
    } else {
        ElMessage.warning("请选择评分等级");
    }
}

function completeSetup() {
    if (!setupForm.value.lastPeriodStart) {
        ElMessage.warning("请选择上次月经开始日期");
        return;
    }

    ElMessage.success("设置完成！");
    showSetupDialog.value = false;
}

// 生命周期
onMounted(() => {
    // 检查是否有历史数据，如果没有则显示设置对话框
    if (!setupForm.value.lastPeriodStart) {
        showSetupDialog.value = true;
    }
});
</script>

<style scoped lang="scss">
.menstrual-tracker {
    margin-bottom: 30px;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            color: #333;
        }
    }

    .content {
        padding: 20px 0;
    }

    // 倒计时区域
    .countdown-section {
        margin-bottom: 30px;

        .countdown-card {
            background: linear-gradient(135deg, #ff6b9d 0%, #ff8fb0 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            color: white;

            .countdown-number {
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .countdown-label {
                font-size: 16px;
                margin-bottom: 5px;
            }

            .countdown-unit {
                font-size: 14px;
                opacity: 0.9;
            }
        }

        .phase-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            color: white;

            .el-tag {
                font-size: 18px;
                padding: 10px 20px;
                margin-bottom: 15px;
            }

            .phase-day {
                font-size: 16px;
                opacity: 0.9;
            }
        }
    }

    // 日历区域
    .calendar-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .calendar-container {
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            overflow: hidden;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background-color: #f5f7fa;
            border-bottom: 1px solid #e4e7ed;

            .current-month {
                font-size: 16px;
                font-weight: 500;
                color: #333;
            }
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background-color: #e4e7ed;
        }

        .weekday-cell {
            background-color: #f5f7fa;
            padding: 10px;
            text-align: center;
            font-weight: 500;
            color: #606266;
        }

        .date-cell {
            background-color: #fff;
            min-height: 80px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;

            &:hover {
                background-color: #f5f7fa;
            }

            &.other-month {
                color: #c0c4cc;
                background-color: #fafafa;
            }

            &.today {
                border: 2px solid #409eff;
            }

            &.period-filled {
                background-color: #ffe0e9;

                .date-number {
                    color: #ff6b9d;
                    font-weight: bold;
                }
            }

            &.period-predicted {
                border: 2px dashed #ff6b9d;
                background-color: #fff5f8;
            }

            &.ovulation {
                background-color: #e3f2fd;

                .date-number {
                    color: #2196f3;
                    font-weight: bold;
                }
            }

            .date-number {
                font-size: 14px;
                color: #333;
            }

            .record-indicator {
                position: absolute;
                bottom: 5px;
                right: 5px;
                color: #ff6b9d;
                font-size: 12px;
            }
        }

        .calendar-legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 15px;
            background-color: #f5f7fa;
            border-top: 1px solid #e4e7ed;

            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #606266;

                .legend-color {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;

                    &.period-filled {
                        background-color: #ffe0e9;
                    }

                    &.period-predicted {
                        border: 2px dashed #ff6b9d;
                        background-color: transparent;
                    }

                    &.ovulation {
                        background-color: #e3f2fd;
                    }

                    &.today {
                        border: 2px solid #409eff;
                        background-color: transparent;
                    }
                }
            }
        }
    }

    // 症状区域
    .symptoms-section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .symptoms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
        }

        .symptom-item {
            :deep(.el-checkbox__label) {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                border: 2px solid #e4e7ed;
                border-radius: 8px;
                transition: all 0.3s ease;
                width: 100%;

                &:hover {
                    border-color: #ff6b9d;
                    background-color: #fff5f8;
                }
            }

            :deep(.el-checkbox.is-checked) {
                .el-checkbox__label {
                    border-color: #ff6b9d;
                    background-color: #ffe0e9;
                }
            }

            .symptom-emoji {
                font-size: 32px;
                margin-bottom: 8px;
            }

            .symptom-name {
                font-size: 14px;
                color: #606266;
            }
        }

        .rating-content {
            text-align: center;
            padding: 20px;

            p {
                font-size: 18px;
                margin-bottom: 20px;
                color: #333;
            }
        }
    }

    // 养生方案区域
    .wellness-section {
        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
        }

        .wellness-container {
            :deep(.el-steps) {
                max-width: 600px;
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .menstrual-tracker {
        .countdown-section {
            .countdown-card,
            .phase-card {
                padding: 20px;

                .countdown-number {
                    font-size: 36px;
                }
            }
        }

        .calendar-section {
            .date-cell {
                min-height: 60px;
                padding: 5px;

                .date-number {
                    font-size: 12px;
                }
            }
        }

        .symptoms-section {
            .symptoms-grid {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            }
        }
    }
}
</style>
