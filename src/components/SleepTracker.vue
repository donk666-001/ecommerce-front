<template>
    <div class="sleep-tracker">
        <!-- 记录睡眠卡 -->
        <section class="record-card-section">
            <el-card class="record-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <h3>记录睡眠</h3>
                    </div>
                </template>

                <el-form
                    :model="sleepForm"
                    label-width="100px"
                    class="sleep-form"
                >
                    <!-- 日期选择 -->
                    <el-form-item label="日期">
                        <el-select
                            v-model="sleepForm.date"
                            placeholder="选择日期"
                            class="full-width"
                        >
                            <el-option
                                label="昨夜·2026年5月18日"
                                value="2026-05-18"
                            />
                            <el-option
                                label="前夜·2026年5月17日"
                                value="2026-05-17"
                            />
                            <el-option
                                label="2026年5月16日"
                                value="2026-05-16"
                            />
                        </el-select>
                    </el-form-item>

                    <!-- 入睡时间 -->
                    <el-form-item label="入睡时间">
                        <el-time-picker
                            v-model="sleepForm.bedTime"
                            format="HH:mm"
                            value-format="HH:mm"
                            placeholder="选择时间"
                            class="full-width"
                            @change="calculateSleepDuration"
                        />
                    </el-form-item>

                    <!-- 起床时间 -->
                    <el-form-item label="起床时间">
                        <el-time-picker
                            v-model="sleepForm.wakeTime"
                            format="HH:mm"
                            value-format="HH:mm"
                            placeholder="选择时间"
                            class="full-width"
                            @change="calculateSleepDuration"
                        />
                    </el-form-item>

                    <!-- 睡眠时长（自动计算） -->
                    <el-form-item label="睡眠时长">
                        <div class="duration-display">
                            <span class="duration-value">{{
                                sleepForm.duration || "未计算"
                            }}</span>
                        </div>
                    </el-form-item>

                    <!-- 睡眠质量（5星评分） -->
                    <el-form-item label="睡眠质量">
                        <el-rate
                            v-model="sleepForm.quality"
                            :max="5"
                            show-text
                            :texts="['很差', '较差', '一般', '较好', '很好']"
                        />
                    </el-form-item>

                    <!-- 夜醒次数（单选chip） -->
                    <el-form-item label="夜醒次数">
                        <div class="chip-group">
                            <el-tag
                                v-for="option in wakeUpOptions"
                                :key="option.value"
                                :type="
                                    sleepForm.wakeUpCount === option.value
                                        ? 'primary'
                                        : 'info'
                                "
                                :effect="
                                    sleepForm.wakeUpCount === option.value
                                        ? 'dark'
                                        : 'plain'
                                "
                                class="chip-item"
                                @click="selectWakeUpCount(option.value)"
                            >
                                {{ option.label }}
                            </el-tag>
                        </div>
                    </el-form-item>

                    <!-- 睡眠状态（多选chip） -->
                    <el-form-item label="睡眠状态">
                        <div class="chip-group">
                            <el-tag
                                v-for="status in sleepStatusOptions"
                                :key="status.value"
                                :type="
                                    sleepForm.status.includes(status.value)
                                        ? 'success'
                                        : 'info'
                                "
                                :effect="
                                    sleepForm.status.includes(status.value)
                                        ? 'dark'
                                        : 'plain'
                                "
                                class="chip-item"
                                @click="toggleSleepStatus(status.value)"
                            >
                                {{ status.label }}
                            </el-tag>
                        </div>
                    </el-form-item>

                    <!-- 保存按钮 -->
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="saveSleepRecord"
                            class="save-btn"
                        >
                            保存记录
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </section>

        <!-- 昨夜睡眠总结卡 -->
        <section class="summary-card-section">
            <el-card class="summary-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <h3>昨夜睡眠总结</h3>
                    </div>
                </template>

                <div class="summary-content">
                    <div class="summary-item">
                        <span class="label">睡眠时长：</span>
                        <span class="value">{{
                            lastNightSummary.duration || "7小时42分钟"
                        }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">自评星级：</span>
                        <el-rate
                            v-model="lastNightSummary.rating"
                            disabled
                            :max="5"
                            size="small"
                        />
                        <span class="rating-score"
                            >{{ lastNightSummary.score || 80 }}分</span
                        >
                    </div>
                    <div class="summary-item">
                        <span class="label">入睡时间：</span>
                        <span class="value">{{
                            lastNightSummary.bedTime || "23:18"
                        }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">起床时间：</span>
                        <span class="value">{{
                            lastNightSummary.wakeTime || "07:00"
                        }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">夜醒次数：</span>
                        <span class="value">{{
                            lastNightSummary.wakeUpCount || "1次"
                        }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">睡眠状态：</span>
                        <div class="status-tags">
                            <el-tag
                                v-for="status in lastNightSummary.status"
                                :key="status"
                                size="small"
                                class="status-tag"
                            >
                                {{ status }}
                            </el-tag>
                        </div>
                    </div>
                </div>
            </el-card>
        </section>

        <!-- 今日作息时间建议 -->
        <section class="schedule-section">
            <el-card class="schedule-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <h3>今日作息时间建议</h3>
                    </div>
                </template>

                <div class="timeline-container">
                    <div
                        v-for="(item, index) in todaySchedule"
                        :key="index"
                        class="timeline-item"
                        :class="{ completed: item.completed }"
                    >
                        <div class="timeline-node">
                            <div
                                class="node-dot"
                                :class="{ active: item.completed }"
                            ></div>
                            <div
                                class="node-line"
                                v-if="index < todaySchedule.length - 1"
                            ></div>
                        </div>
                        <div class="timeline-content">
                            <div class="time-label">{{ item.time }}</div>
                            <div class="content-text">{{ item.content }}</div>
                        </div>
                    </div>
                </div>
            </el-card>
        </section>

        <!-- 近7日睡眠趋势图 -->
        <section class="trend-section">
            <el-card class="trend-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <h3>近7日睡眠趋势</h3>
                        <div class="trend-stats">
                            <span
                                >平均{{ trendStats.avgDuration }} · 较上周{{
                                    trendStats.comparison
                                }}</span
                            >
                        </div>
                    </div>
                </template>

                <div class="chart-container">
                    <svg
                        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                        class="trend-chart"
                    >
                        <!-- 网格线 -->
                        <g class="grid-lines">
                            <line
                                v-for="i in 5"
                                :key="i"
                                :x1="paddingLeft"
                                :y1="
                                    paddingTop +
                                    ((chartHeight -
                                        paddingTop -
                                        paddingBottom) *
                                        (i - 1)) /
                                        4
                                "
                                :x2="chartWidth - paddingRight"
                                :y2="
                                    paddingTop +
                                    ((chartHeight -
                                        paddingTop -
                                        paddingBottom) *
                                        (i - 1)) /
                                        4
                                "
                                stroke="#e0e0e0"
                                stroke-width="1"
                            />
                        </g>

                        <!-- Y轴标签 -->
                        <g class="y-axis-labels">
                            <text
                                v-for="i in 5"
                                :key="i"
                                :x="paddingLeft - 10"
                                :y="
                                    paddingTop +
                                    ((chartHeight -
                                        paddingTop -
                                        paddingBottom) *
                                        (i - 1)) /
                                        4 +
                                    5
                                "
                                text-anchor="end"
                                font-size="12"
                                fill="#999"
                            >
                                {{ 4 + (5 - i) * 2 }}h
                            </text>
                        </g>

                        <!-- X轴标签 -->
                        <g class="x-axis-labels">
                            <text
                                v-for="(item, index) in trendData"
                                :key="index"
                                :x="
                                    paddingLeft +
                                    ((chartWidth - paddingLeft - paddingRight) *
                                        index) /
                                        (trendData.length - 1)
                                "
                                :y="chartHeight - paddingBottom + 20"
                                text-anchor="middle"
                                font-size="12"
                                fill="#999"
                            >
                                {{ item.date }}
                            </text>
                        </g>

                        <!-- 折线 -->
                        <polyline
                            :points="linePoints"
                            fill="none"
                            stroke="#409eff"
                            stroke-width="2"
                            stroke-linejoin="round"
                        />

                        <!-- 数据点 -->
                        <circle
                            v-for="(item, index) in trendData"
                            :key="index"
                            :cx="
                                paddingLeft +
                                ((chartWidth - paddingLeft - paddingRight) *
                                    index) /
                                    (trendData.length - 1)
                            "
                            :cy="
                                paddingTop +
                                (chartHeight - paddingTop - paddingBottom) *
                                    (1 - (item.duration - 4) / 8)
                            "
                            r="4"
                            fill="#409eff"
                            stroke="#fff"
                            stroke-width="2"
                        />
                    </svg>
                </div>
            </el-card>
        </section>

        <!-- 助眠音律库 -->
        <section class="audio-section">
            <el-card class="audio-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <h3>助眠音律库</h3>
                    </div>
                </template>

                <div class="audio-grid">
                    <el-row :gutter="20">
                        <el-col
                            v-for="audio in audioLibrary"
                            :key="audio.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                            :lg="4"
                        >
                            <div
                                class="audio-item"
                                :class="{
                                    playing: currentPlaying === audio.id,
                                }"
                            >
                                <div class="audio-icon">
                                    <el-icon :size="32">
                                        <component :is="audio.icon" />
                                    </el-icon>
                                </div>
                                <div class="audio-info">
                                    <h4>{{ audio.title }}</h4>
                                    <p class="audio-type">{{ audio.type }}</p>
                                    <p class="audio-duration">
                                        {{ audio.duration }}
                                    </p>
                                </div>
                                <el-button
                                    :type="
                                        currentPlaying === audio.id
                                            ? 'primary'
                                            : ''
                                    "
                                    :icon="
                                        currentPlaying === audio.id
                                            ? 'VideoPause'
                                            : 'VideoPlay'
                                    "
                                    circle
                                    class="play-btn"
                                    @click="toggleAudio(audio)"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef } from "vue";
import {
    VideoPlay,
    VideoPause,
    Moon,
    Cloudy,
    Sunny,
    Drizzling,
    Star,
    Umbrella,
} from "@element-plus/icons-vue";

// 定义数据类型
interface SleepForm {
    date: string;
    bedTime: string;
    wakeTime: string;
    duration: string;
    quality: number;
    wakeUpCount: string;
    status: string[];
}

interface LastNightSummary {
    duration: string;
    rating: number;
    score: number;
    bedTime: string;
    wakeTime: string;
    wakeUpCount: string;
    status: string[];
}

interface ScheduleItem {
    time: string;
    content: string;
    completed: boolean;
}

interface TrendDataItem {
    date: string;
    duration: number;
}

interface AudioItem {
    id: number;
    title: string;
    type: string;
    duration: string;
    icon: any;
}

// 表单数据
const sleepForm = ref<SleepForm>({
    date: "2026-05-18",
    bedTime: "",
    wakeTime: "",
    duration: "",
    quality: 4,
    wakeUpCount: "1次",
    status: ["入睡快"],
});

// 夜醒次数选项
const wakeUpOptions = [
    { label: "0次", value: "0次" },
    { label: "1次", value: "1次" },
    { label: "2次", value: "2次" },
    { label: "3+次", value: "3+次" },
];

// 睡眠状态选项
const sleepStatusOptions = [
    { label: "入睡快", value: "入睡快" },
    { label: "入睡慢", value: "入睡慢" },
    { label: "多梦", value: "多梦" },
    { label: "易醒", value: "易醒" },
    { label: "早醒", value: "早醒" },
    { label: "沉睡", value: "沉睡" },
    { label: "磨牙", value: "磨牙" },
];

// 昨夜睡眠总结
const lastNightSummary = ref<LastNightSummary>({
    duration: "7小时42分钟",
    rating: 4,
    score: 80,
    bedTime: "23:18",
    wakeTime: "07:00",
    wakeUpCount: "1次",
    status: ["入睡快", "沉睡"],
});

// 今日作息建议
const todaySchedule = ref<ScheduleItem[]>([
    { time: "06:30", content: "寅时未起床，温水一杯", completed: true },
    { time: "07:00", content: "卯时起床，舒展筋骨", completed: true },
    { time: "07:30", content: "早餐宜温，养胃健脾", completed: false },
    { time: "09:00", content: "巳时工作，精力充沛", completed: false },
    { time: "12:00", content: "午时小憩，养心补阴", completed: false },
    { time: "15:00", content: "申时运动，适度为宜", completed: false },
    { time: "18:00", content: "酉时晚餐，清淡为主", completed: false },
    { time: "21:00", content: "亥时准备，放松身心", completed: false },
    { time: "23:00", content: "子时入睡，养肝补血", completed: false },
]);

// 近7日睡眠趋势数据
const trendData = ref<TrendDataItem[]>([
    { date: "5/12", duration: 7.2 },
    { date: "5/13", duration: 7.5 },
    { date: "5/14", duration: 6.8 },
    { date: "5/15", duration: 7.3 },
    { date: "5/16", duration: 7.6 },
    { date: "5/17", duration: 7.4 },
    { date: "5/18", duration: 7.7 },
]);

// 图表配置
const chartWidth = 600;
const chartHeight = 300;
const paddingLeft = 50;
const paddingRight = 20;
const paddingTop = 20;
const paddingBottom = 40;

// 计算折线点
const linePoints = computed(() => {
    return trendData.value
        .map((item, index) => {
            const x =
                paddingLeft +
                ((chartWidth - paddingLeft - paddingRight) * index) /
                    (trendData.value.length - 1);
            const y =
                paddingTop +
                (chartHeight - paddingTop - paddingBottom) *
                    (1 - (item.duration - 4) / 8);
            return `${x},${y}`;
        })
        .join(" ");
});

// 趋势统计
const trendStats = computed(() => {
    const avg =
        trendData.value.reduce((sum, item) => sum + item.duration, 0) /
        trendData.value.length;
    const avgHours = Math.floor(avg);
    const avgMinutes = Math.round((avg - avgHours) * 60);
    return {
        avgDuration: `${avgHours}h${avgMinutes}min`,
        comparison: "+12分钟",
    };
});

// 助眠音律库
const audioLibrary = shallowRef<AudioItem[]>([
    {
        id: 1,
        title: "竹林夜雨",
        type: "自然音",
        duration: "30:00",
        icon: Drizzling,
    },
    {
        id: 2,
        title: "深海蓝调",
        type: "环境音",
        duration: "45:00",
        icon: Cloudy,
    },
    {
        id: 3,
        title: "山林清风",
        type: "自然音",
        duration: "60:00",
        icon: Umbrella,
    },
    { id: 4, title: "月光曲", type: "轻音乐", duration: "40:00", icon: Moon },
    {
        id: 5,
        title: "晨曦微露",
        type: "自然音",
        duration: "35:00",
        icon: Sunny,
    },
    { id: 6, title: "雪落无声", type: "环境音", duration: "50:00", icon: Star },
]);

// 当前播放的音频
const currentPlaying = ref<number | null>(null);
const audioPlayer = ref<HTMLAudioElement | null>(null);

// 计算睡眠时长
const calculateSleepDuration = () => {
    if (!sleepForm.value.bedTime || !sleepForm.value.wakeTime) {
        sleepForm.value.duration = "";
        return;
    }

    const [bedHour, bedMinute] = sleepForm.value.bedTime.split(":").map(Number);
    const [wakeHour, wakeMinute] = sleepForm.value.wakeTime
        .split(":")
        .map(Number);

    let bedMinutes = bedHour * 60 + bedMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;

    // 跨午夜处理
    if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60;
    }

    const diffMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    sleepForm.value.duration = `${hours}小时${minutes}分钟`;
};

// 选择夜醒次数
const selectWakeUpCount = (value: string) => {
    sleepForm.value.wakeUpCount = value;
};

// 切换睡眠状态
const toggleSleepStatus = (value: string) => {
    const index = sleepForm.value.status.indexOf(value);
    if (index > -1) {
        sleepForm.value.status.splice(index, 1);
    } else {
        sleepForm.value.status.push(value);
    }
};

// 保存睡眠记录
const saveSleepRecord = async () => {
    // 计算评分（星数 * 20）
    const score = sleepForm.value.quality * 20;

    // 更新昨夜睡眠总结
    lastNightSummary.value = {
        duration: sleepForm.value.duration,
        rating: sleepForm.value.quality,
        score: score,
        bedTime: sleepForm.value.bedTime,
        wakeTime: sleepForm.value.wakeTime,
        wakeUpCount: sleepForm.value.wakeUpCount,
        status: [...sleepForm.value.status],
    };

    // 模拟API调用
    try {
        // const response = await fetch('/api/sleep-logs', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(sleepForm.value)
        // })

        console.log("睡眠记录已保存:", sleepForm.value);
        console.log("评分:", score);

        // 显示成功提示
        // ElMessage.success('睡眠记录保存成功')
    } catch (error) {
        console.error("保存失败:", error);
        // ElMessage.error('保存失败，请重试')
    }
};

// 切换音频播放
const toggleAudio = (audio: AudioItem) => {
    if (currentPlaying.value === audio.id) {
        // 暂停当前播放
        if (audioPlayer.value) {
            audioPlayer.value.pause();
            audioPlayer.value = null;
        }
        currentPlaying.value = null;
    } else {
        // 停止之前的音频
        if (audioPlayer.value) {
            audioPlayer.value.pause();
        }

        // 播放新音频
        currentPlaying.value = audio.id;

        // 创建新的音频播放器
        // 注意：这里使用占位路径，实际使用时需要替换为真实音频路径
        const audioPath = `/audio/${getAudioFileName(audio.id)}.mp3`;
        audioPlayer.value = new Audio(audioPath);
        audioPlayer.value.loop = true;

        audioPlayer.value
            .play()
            .then(() => {
                console.log(`开始播放: ${audio.title}`);
            })
            .catch((err) => {
                console.error("播放失败:", err);
                // 如果音频文件不存在，仅显示提示
                console.log(`模拟播放: ${audio.title}（音频文件尚未添加）`);
            });
    }
};

// 获取音频文件名
const getAudioFileName = (id: number): string => {
    const fileMap: Record<number, string> = {
        1: "bamboo-rain",
        2: "deep-sea",
        3: "forest-breeze",
        4: "moonlight",
        5: "dawn-light",
        6: "silent-snow",
    };
    return fileMap[id] || "bamboo-rain";
};

// 组件挂载时的初始化
onMounted(() => {
    // 可以在这里加载用户的历史数据
    console.log("睡眠追踪组件已加载");
});

// 组件卸载时清理
onUnmounted(() => {
    if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value = null;
    }
});
</script>

<style scoped lang="scss">
.sleep-tracker {
    .record-card-section,
    .summary-card-section,
    .schedule-section,
    .trend-section,
    .audio-section {
        margin-bottom: 30px;
    }

    .card-header {
        h3 {
            margin: 0;
            color: #333;
        }
    }

    // 记录睡眠卡样式
    .record-card {
        .sleep-form {
            .full-width {
                width: 100%;
            }

            .duration-display {
                .duration-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #409eff;
                }
            }

            .chip-group {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;

                .chip-item {
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        transform: translateY(-2px);
                    }
                }
            }

            .save-btn {
                width: 100%;
                max-width: 200px;
            }
        }
    }

    // 睡眠总结卡样式
    .summary-card {
        .summary-content {
            .summary-item {
                display: flex;
                align-items: center;
                margin-bottom: 15px;

                .label {
                    min-width: 100px;
                    color: #666;
                    font-weight: 500;
                }

                .value {
                    color: #333;
                    font-weight: bold;
                }

                .rating-score {
                    margin-left: 10px;
                    color: #409eff;
                    font-weight: bold;
                }

                .status-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;

                    .status-tag {
                        margin: 0;
                    }
                }
            }
        }
    }

    // 时间轴样式
    .schedule-card {
        .timeline-container {
            padding: 20px 0;

            .timeline-item {
                display: flex;
                margin-bottom: 20px;
                position: relative;

                &.completed {
                    .timeline-node {
                        .node-dot {
                            background-color: #67c23a;
                            border-color: #67c23a;
                        }
                    }

                    .timeline-content {
                        .time-label {
                            color: #67c23a;
                        }

                        .content-text {
                            color: #333;
                        }
                    }
                }

                .timeline-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-right: 15px;
                    position: relative;

                    .node-dot {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        border: 2px solid #dcdfe6;
                        background-color: #fff;
                        z-index: 2;
                        transition: all 0.3s ease;

                        &.active {
                            background-color: #67c23a;
                            border-color: #67c23a;
                        }
                    }

                    .node-line {
                        width: 2px;
                        height: 40px;
                        background-color: #e4e7ed;
                        margin-top: 5px;
                    }
                }

                .timeline-content {
                    flex: 1;

                    .time-label {
                        font-weight: bold;
                        color: #909399;
                        margin-bottom: 5px;
                    }

                    .content-text {
                        color: #606266;
                        line-height: 1.5;
                    }
                }
            }
        }
    }

    // 趋势图样式
    .trend-card {
        .trend-stats {
            span {
                color: #999;
                font-size: 14px;
            }
        }

        .chart-container {
            width: 100%;
            overflow-x: auto;

            .trend-chart {
                width: 100%;
                min-width: 500px;
                height: auto;
            }
        }
    }

    // 音频库样式
    .audio-card {
        .audio-grid {
            .audio-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 1px solid #ebeef5;
                border-radius: 8px;
                margin-bottom: 15px;
                transition: all 0.3s ease;

                &:hover {
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }

                &.playing {
                    border-color: #409eff;
                    background-color: #f0f9ff;
                }

                .audio-icon {
                    margin-right: 15px;
                    color: #409eff;
                }

                .audio-info {
                    flex: 1;

                    h4 {
                        margin: 0 0 5px 0;
                        color: #333;
                        font-size: 16px;
                    }

                    .audio-type {
                        margin: 0 0 3px 0;
                        color: #999;
                        font-size: 12px;
                    }

                    .audio-duration {
                        margin: 0;
                        color: #666;
                        font-size: 12px;
                    }
                }

                .play-btn {
                    margin-left: 10px;
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .sleep-tracker {
        .record-card {
            .sleep-form {
                .chip-group {
                    .chip-item {
                        font-size: 12px;
                        padding: 5px 10px;
                    }
                }
            }
        }

        .schedule-card {
            .timeline-container {
                .timeline-item {
                    .timeline-content {
                        .time-label {
                            font-size: 14px;
                        }

                        .content-text {
                            font-size: 14px;
                        }
                    }
                }
            }
        }

        .audio-card {
            .audio-grid {
                .audio-item {
                    flex-direction: column;
                    text-align: center;

                    .audio-icon {
                        margin-right: 0;
                        margin-bottom: 10px;
                    }

                    .audio-info {
                        margin-bottom: 10px;
                    }

                    .play-btn {
                        margin-left: 0;
                    }
                }
            }
        }
    }
}
</style>
