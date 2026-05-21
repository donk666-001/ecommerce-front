<template>
    <div class="daily-checkin-module">
        <!-- 打卡进度和连续天数 -->
        <el-row :gutter="20" class="top-section">
            <el-col :xs="24" :md="16">
                <el-card class="checkin-progress-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>今日打卡清单</h4>
                            <el-button
                                type="primary"
                                size="small"
                                @click="completeAllCheckins"
                            >
                                <el-icon><CircleCheck /></el-icon>
                                一键完成
                            </el-button>
                        </div>
                    </template>

                    <!-- 打卡项列表（支持滑动） -->
                    <div class="checkin-list-container">
                        <el-scrollbar>
                            <div class="checkin-grid">
                                <div
                                    v-for="item in checkinItems"
                                    :key="item.id"
                                    class="checkin-item"
                                    :class="{ completed: item.completed }"
                                >
                                    <el-checkbox
                                        v-model="item.completed"
                                        @change="handleCheckinChange(item)"
                                    >
                                        <div class="item-content">
                                            <div class="item-icon">
                                                {{ item.icon }}
                                            </div>
                                            <div class="item-info">
                                                <div class="item-name">
                                                    {{ item.name }}
                                                </div>
                                                <div
                                                    class="item-target"
                                                    v-if="item.target"
                                                >
                                                    目标: {{ item.target }}
                                                </div>
                                            </div>
                                        </div>
                                    </el-checkbox>
                                </div>

                                <!-- 添加自定义打卡项按钮 -->
                                <div
                                    class="checkin-item add-item"
                                    @click="showAddDialog = true"
                                >
                                    <el-icon><Plus /></el-icon>
                                    <span>添加打卡项</span>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>

                    <!-- 打卡心情记录 -->
                    <div class="mood-section">
                        <span class="mood-label">今日心情：</span>
                        <el-radio-group v-model="todayMood" size="small">
                            <el-radio-button value="tired"
                                >😫 疲惫</el-radio-button
                            >
                            <el-radio-button value="normal"
                                >😐 平常</el-radio-button
                            >
                            <el-radio-button value="relaxed"
                                >😊 轻松</el-radio-button
                            >
                            <el-radio-button value="energetic"
                                >🤩 元气满满</el-radio-button
                            >
                        </el-radio-group>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :md="8">
                <!-- 连续打卡天数 -->
                <el-card class="streak-card" shadow="hover">
                    <div class="streak-content">
                        <div class="streak-icon">
                            <el-icon><TrendCharts /></el-icon>
                        </div>
                        <div class="streak-info">
                            <div class="streak-days">{{ streakDays }}</div>
                            <div class="streak-label">连续打卡天数</div>
                        </div>
                    </div>
                    <el-progress
                        :percentage="streakProgress"
                        :color="streakColor"
                        :stroke-width="8"
                        :show-text="false"
                    />
                    <div class="streak-milestone">
                        <el-tag size="small" type="warning">
                            距离下一个里程碑还差
                            {{ nextMilestone - streakDays }} 天
                        </el-tag>
                    </div>
                </el-card>

                <!-- 补签卡 -->
                <el-card class="resign-card" shadow="hover">
                    <div class="resign-content">
                        <el-icon class="resign-icon"><Calendar /></el-icon>
                        <div class="resign-info">
                            <div class="resign-count">
                                补签卡 × {{ resignCardsCount }}
                            </div>
                            <el-button
                                type="warning"
                                size="small"
                                :disabled="resignCardsCount === 0"
                                @click="handleResign"
                            >
                                补打卡
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 打卡日历热力图 -->
        <el-card class="calendar-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <h4>打卡日历</h4>
                    <el-button type="primary" text @click="viewHistory">
                        查看历史统计
                    </el-button>
                </div>
            </template>
            <div class="calendar-heatmap">
                <el-calendar v-model="calendarDate">
                    <template #date-cell="{ data }">
                        <div
                            class="calendar-day"
                            :class="getCheckinIntensityClass(data.day)"
                        >
                            {{ data.day.split("-").slice(2).join("-") }}
                        </div>
                    </template>
                </el-calendar>
            </div>
        </el-card>

        <!-- 连续里程碑 -->
        <el-card class="milestone-card" shadow="hover">
            <template #header>
                <h4>连续打卡里程碑</h4>
            </template>
            <div class="milestones">
                <div
                    v-for="milestone in milestones"
                    :key="milestone.days"
                    class="milestone-item"
                    :class="{ achieved: streakDays >= milestone.days }"
                >
                    <div class="milestone-badge">
                        <el-icon v-if="streakDays >= milestone.days"
                            ><Medal
                        /></el-icon>
                        <el-icon v-else><Lock /></el-icon>
                    </div>
                    <div class="milestone-info">
                        <div class="milestone-days">{{ milestone.days }}天</div>
                        <div class="milestone-name">{{ milestone.name }}</div>
                    </div>
                    <el-progress
                        v-if="streakDays < milestone.days"
                        :percentage="
                            Math.min(100, (streakDays / milestone.days) * 100)
                        "
                        :stroke-width="6"
                    />
                </div>
            </div>
        </el-card>

        <!-- 分享海报按钮 -->
        <div class="share-section">
            <el-button type="success" size="large" @click="generatePoster">
                <el-icon><Share /></el-icon>
                生成打卡海报分享
            </el-button>
        </div>

        <!-- 添加打卡项对话框 -->
        <el-dialog v-model="showAddDialog" title="添加打卡项" width="500px">
            <el-form :model="newCheckinItem" label-width="100px">
                <el-form-item label="选择模板">
                    <el-select
                        v-model="newCheckinItem.template"
                        placeholder="请选择"
                    >
                        <el-option label="早起" value="early-rise" />
                        <el-option label="喝水" value="water" />
                        <el-option label="运动" value="exercise" />
                        <el-option label="冥想" value="meditation" />
                        <el-option label="阅读" value="reading" />
                        <el-option label="早睡" value="early-sleep" />
                    </el-select>
                </el-form-item>
                <el-form-item label="目标值">
                    <el-input
                        v-model="newCheckinItem.target"
                        placeholder="如：8杯水、30分钟"
                    />
                </el-form-item>
                <el-form-item label="时间窗">
                    <el-time-picker
                        v-model="newCheckinItem.timeRange"
                        is-range
                        range-separator="至"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="addCheckinItem"
                    >确定</el-button
                >
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
    CircleCheck,
    Plus,
    TrendCharts,
    Calendar,
    Medal,
    Lock,
    Share,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 打卡项类型
interface CheckinItem {
    id: number;
    name: string;
    icon: string;
    target?: string;
    completed: boolean;
    timeRange?: [Date, Date];
}

// 打卡项数据
const checkinItems = ref<CheckinItem[]>([
    { id: 1, name: "早起", icon: "🌅", target: "7:00前", completed: true },
    { id: 2, name: "喝水", icon: "💧", target: "8杯", completed: true },
    { id: 3, name: "运动", icon: "🏃", target: "30分钟", completed: true },
    { id: 4, name: "冥想", icon: "🧘", target: "15分钟", completed: true },
    { id: 5, name: "阅读", icon: "📚", target: "20页", completed: true },
    { id: 6, name: "早睡", icon: "🌙", target: "23:00前", completed: false },
]);

// 连续打卡天数
const streakDays = ref(28);

// 补签卡数量
const resignCardsCount = ref(3);

// 今日心情
const todayMood = ref("normal");

// 日历日期
const calendarDate = ref(new Date());

// 添加打卡项对话框
const showAddDialog = ref(false);
const newCheckinItem = ref({
    template: "",
    target: "",
    timeRange: null as [Date, Date] | null,
});

// 计算属性
const streakProgress = computed(() => {
    const nextMilestoneValue = nextMilestone.value;
    return Math.min(100, (streakDays.value / nextMilestoneValue) * 100);
});

const streakColor = computed(() => {
    if (streakDays.value >= 30) return "#67c23a";
    if (streakDays.value >= 21) return "#409eff";
    if (streakDays.value >= 7) return "#e6a23c";
    return "#f56c6c";
});

const nextMilestone = computed(() => {
    const milestones_list = [7, 21, 30, 100];
    for (const m of milestones_list) {
        if (streakDays.value < m) return m;
    }
    return 100;
});

const milestones = ref([
    { days: 7, name: "初成·一周坚持" },
    { days: 21, name: "习惯·三周养成" },
    { days: 30, name: "而立·月度成就" },
    { days: 100, name: "百日·卓越毅力" },
]);

// 处理打卡变化
function handleCheckinChange(item: CheckinItem) {
    if (item.completed) {
        ElMessage.success(`已完成：${item.name}`);
    }
}

// 一键完成所有打卡
function completeAllCheckins() {
    checkinItems.value.forEach((item) => {
        item.completed = true;
    });
    ElMessage.success("今日打卡全部完成！太棒了！");
}

// 获取打卡强度样式类
function getCheckinIntensityClass(date: string) {
    // 模拟数据：根据日期返回不同的强度等级
    const parts = date.split("-");
    const day = parts[2] ? parseInt(parts[2]) : 0;
    if (day % 7 === 0) return "intensity-high";
    if (day % 3 === 0) return "intensity-medium";
    if (day % 2 === 0) return "intensity-low";
    return "intensity-none";
}

// 补打卡
function handleResign() {
    if (resignCardsCount.value > 0) {
        resignCardsCount.value--;
        ElMessage.success("补打卡成功！");
    }
}

// 查看历史记录
function viewHistory() {
    ElMessage.info("查看历史统计功能开发中...");
}

// 生成海报
function generatePoster() {
    ElMessage.success("正在生成打卡海报...");
    // 实际项目中可以使用 html2canvas 等库生成图片
}

// 添加打卡项
function addCheckinItem() {
    if (!newCheckinItem.value.template) {
        ElMessage.warning("请选择打卡模板");
        return;
    }

    const templateMap: Record<string, { name: string; icon: string }> = {
        "early-rise": { name: "早起", icon: "🌅" },
        water: { name: "喝水", icon: "💧" },
        exercise: { name: "运动", icon: "🏃" },
        meditation: { name: "冥想", icon: "🧘" },
        reading: { name: "阅读", icon: "📚" },
        "early-sleep": { name: "早睡", icon: "🌙" },
    };

    const template = templateMap[newCheckinItem.value.template];
    if (template) {
        const newItem: CheckinItem = {
            id: Date.now(),
            name: template.name,
            icon: template.icon,
            completed: false,
        };

        // 只在有值时才添加可选属性
        if (newCheckinItem.value.target) {
            newItem.target = newCheckinItem.value.target;
        }
        if (newCheckinItem.value.timeRange) {
            newItem.timeRange = newCheckinItem.value.timeRange;
        }

        checkinItems.value.push(newItem);
        ElMessage.success("添加成功！");
        showAddDialog.value = false;
        newCheckinItem.value = {
            template: "",
            target: "",
            timeRange: null,
        };
    }
}
</script>

<style scoped lang="scss">
.daily-checkin-module {
    .top-section {
        margin-bottom: 20px;
    }

    // 打卡进度卡片
    .checkin-progress-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
                color: #333;
            }
        }

        .checkin-list-container {
            max-height: 300px;

            .checkin-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
                padding: 10px 0;

                .checkin-item {
                    border: 2px solid #e4e7ed;
                    border-radius: 8px;
                    padding: 12px;
                    transition: all 0.3s ease;

                    &:hover {
                        border-color: #409eff;
                        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
                    }

                    &.completed {
                        border-color: #67c23a;
                        background-color: #f0f9ff;
                    }

                    &.add-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: #909399;
                        min-height: 80px;

                        &:hover {
                            color: #409eff;
                            border-color: #409eff;
                        }

                        .el-icon {
                            font-size: 24px;
                            margin-bottom: 8px;
                        }
                    }

                    :deep(.el-checkbox) {
                        width: 100%;

                        .el-checkbox__label {
                            width: 100%;
                        }
                    }

                    .item-content {
                        display: flex;
                        align-items: center;
                        gap: 10px;

                        .item-icon {
                            font-size: 24px;
                        }

                        .item-info {
                            flex: 1;

                            .item-name {
                                font-weight: 600;
                                color: #333;
                                margin-bottom: 4px;
                            }

                            .item-target {
                                font-size: 12px;
                                color: #909399;
                            }
                        }
                    }
                }
            }
        }

        .mood-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e4e7ed;

            .mood-label {
                font-weight: 600;
                color: #606266;
                margin-right: 10px;
            }
        }
    }

    // 连续打卡卡片
    .streak-card {
        margin-bottom: 20px;

        .streak-content {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;

            .streak-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
            }

            .streak-info {
                .streak-days {
                    font-size: 28px;
                    font-weight: bold;
                    color: #333;
                }

                .streak-label {
                    font-size: 14px;
                    color: #909399;
                }
            }
        }

        .streak-milestone {
            margin-top: 10px;
            text-align: center;
        }
    }

    // 补签卡
    .resign-card {
        .resign-content {
            display: flex;
            align-items: center;
            gap: 15px;

            .resign-icon {
                font-size: 32px;
                color: #e6a23c;
            }

            .resign-info {
                flex: 1;

                .resign-count {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                }
            }
        }
    }

    // 日历卡片
    .calendar-card {
        margin-bottom: 20px;

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
                color: #333;
            }
        }

        .calendar-heatmap {
            :deep(.el-calendar) {
                .el-calendar-day {
                    padding: 0;
                }
            }

            .calendar-day {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.3s ease;

                &.intensity-none {
                    background-color: #f5f7fa;
                }

                &.intensity-low {
                    background-color: #d4e9ff;
                }

                &.intensity-medium {
                    background-color: #8cc5ff;
                }

                &.intensity-high {
                    background-color: #409eff;
                    color: white;
                }
            }
        }
    }

    // 里程碑卡片
    .milestone-card {
        margin-bottom: 20px;

        :deep(.el-card__header) {
            h4 {
                margin: 0;
                color: #333;
            }
        }

        .milestones {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;

            .milestone-item {
                padding: 15px;
                border: 2px solid #e4e7ed;
                border-radius: 8px;
                transition: all 0.3s ease;

                &.achieved {
                    border-color: #67c23a;
                    background-color: #f0f9ff;
                }

                .milestone-badge {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    margin-bottom: 10px;

                    .el-icon {
                        color: #e6a23c;
                    }
                }

                &.achieved .milestone-badge {
                    background-color: #fef0f0;
                }

                .milestone-info {
                    margin-bottom: 10px;

                    .milestone-days {
                        font-size: 18px;
                        font-weight: bold;
                        color: #333;
                    }

                    .milestone-name {
                        font-size: 14px;
                        color: #606266;
                    }
                }
            }
        }
    }

    // 分享区域
    .share-section {
        text-align: center;
        padding: 20px 0;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .daily-checkin-module {
        .checkin-progress-card {
            .checkin-list-container {
                .checkin-grid {
                    grid-template-columns: 1fr;
                }
            }
        }

        .milestone-card {
            .milestones {
                grid-template-columns: 1fr;
            }
        }
    }
}
</style>
