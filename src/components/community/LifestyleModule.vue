<template>
    <div class="lifestyle-module">
        <el-row :gutter="20">
            <!-- 左侧：三餐记录 + 饮水追踪 -->
            <el-col :xs="24" :lg="16">
                <!-- 三餐+加餐记录 -->
                <el-card class="meal-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>🍽️ 今日饮食记录</h4>
                            <el-tag type="success"
                                >总热量: {{ totalCalories }} kcal</el-tag
                            >
                        </div>
                    </template>

                    <div class="meal-list">
                        <div
                            v-for="meal in meals"
                            :key="meal.type"
                            class="meal-item"
                        >
                            <div class="meal-header">
                                <el-icon class="meal-icon"
                                    ><component :is="meal.icon"
                                /></el-icon>
                                <span class="meal-name">{{ meal.name }}</span>
                                <el-tag size="small" v-if="meal.calories">
                                    {{ meal.calories }} kcal
                                </el-tag>
                            </div>

                            <div class="meal-content" v-if="meal.recorded">
                                <div class="meal-image" v-if="meal.image">
                                    <img :src="meal.image" alt="餐食照片" />
                                </div>
                                <p class="meal-description">
                                    {{ meal.description }}
                                </p>
                                <div class="meal-tags">
                                    <el-tag
                                        v-for="tag in meal.tags"
                                        :key="tag"
                                        size="small"
                                        type="info"
                                    >
                                        {{ tag }}
                                    </el-tag>
                                </div>
                            </div>

                            <el-button
                                v-else
                                type="primary"
                                text
                                @click="openMealDialog(meal)"
                            >
                                <el-icon><Edit /></el-icon>
                                记录{{ meal.name }}
                            </el-button>
                        </div>
                    </div>
                </el-card>

                <!-- 饮水追踪 -->
                <el-card class="water-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>💧 饮水追踪</h4>
                            <el-tag type="primary">
                                {{ waterIntake.current }} /
                                {{ waterIntake.target }} ml
                            </el-tag>
                        </div>
                    </template>

                    <div class="water-progress">
                        <el-progress
                            :percentage="waterPercentage"
                            :color="waterColor"
                            :stroke-width="20"
                        />
                        <div class="water-remaining">
                            还差
                            <strong>{{
                                waterIntake.target - waterIntake.current
                            }}</strong>
                            ml 达到目标
                        </div>
                    </div>

                    <div class="water-cups">
                        <div
                            v-for="(cup, index) in waterCups"
                            :key="index"
                            class="water-cup"
                            :class="{ filled: cup.filled }"
                            @click="toggleWaterCup(index)"
                        >
                            <el-icon v-if="cup.filled"><Check /></el-icon>
                            <span class="cup-label">{{ cup.label }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 右侧：作息记录 + 健康小结 -->
            <el-col :xs="24" :lg="8">
                <!-- 作息记录 -->
                <el-card class="schedule-card" shadow="hover">
                    <template #header>
                        <h4>⏰ 作息记录</h4>
                    </template>

                    <div class="schedule-checkins">
                        <div class="checkin-item">
                            <span class="checkin-label">起床时间</span>
                            <el-button
                                :type="schedule.wakeUp ? 'success' : 'primary'"
                                @click="recordWakeUp"
                            >
                                {{ schedule.wakeUp || "打卡" }}
                            </el-button>
                        </div>
                        <div class="checkin-item">
                            <span class="checkin-label">入睡时间</span>
                            <el-button
                                :type="schedule.sleep ? 'success' : 'primary'"
                                @click="recordSleep"
                            >
                                {{ schedule.sleep || "打卡" }}
                            </el-button>
                        </div>
                    </div>

                    <div class="schedule-status">
                        <h5>今日状态</h5>
                        <el-checkbox-group v-model="schedule.statusTags">
                            <el-checkbox value="on-time">按时作息</el-checkbox>
                            <el-checkbox value="late-night"
                                >略有熬夜</el-checkbox
                            >
                            <el-checkbox value="sedentary"
                                >久坐过多</el-checkbox
                            >
                            <el-checkbox value="nap">午间小憩</el-checkbox>
                            <el-checkbox value="eye-fatigue"
                                >用眼疲劳</el-checkbox
                            >
                        </el-checkbox-group>
                    </div>
                </el-card>

                <!-- 每日健康小结 -->
                <el-card class="summary-card" shadow="hover">
                    <template #header>
                        <h4>📊 今日健康小结</h4>
                    </template>

                    <div class="summary-content">
                        <!-- 热量环 -->
                        <div class="calorie-ring">
                            <el-progress
                                type="dashboard"
                                :percentage="caloriePercentage"
                                :color="calorieColor"
                                :width="120"
                            >
                                <template #default="{ percentage }">
                                    <span class="percentage-value"
                                        >{{ percentage }}%</span
                                    >
                                    <span class="percentage-label"
                                        >热量达标</span
                                    >
                                </template>
                            </el-progress>
                        </div>

                        <!-- 营养分布 -->
                        <div class="nutrition-bars">
                            <h5>营养分布</h5>
                            <div class="nutrition-item">
                                <span class="nutrition-label">蛋白质</span>
                                <el-progress
                                    :percentage="nutrition.protein"
                                    :color="'#67c23a'"
                                    :stroke-width="8"
                                />
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">碳水化合物</span>
                                <el-progress
                                    :percentage="nutrition.carbs"
                                    :color="'#e6a23c'"
                                    :stroke-width="8"
                                />
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">脂肪</span>
                                <el-progress
                                    :percentage="nutrition.fat"
                                    :color="'#f56c6c'"
                                    :stroke-width="8"
                                />
                            </div>
                        </div>

                        <!-- 健康建议 -->
                        <div class="health-tips">
                            <h5>💡 健康建议</h5>
                            <ul>
                                <li
                                    v-for="(tip, index) in healthTips"
                                    :key="index"
                                >
                                    {{ tip }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 记录饮食对话框 -->
        <el-dialog
            v-model="showMealDialog"
            :title="`记录${currentMeal?.name}`"
            width="600px"
        >
            <el-form :model="mealForm" label-width="100px">
                <el-form-item label="餐食照片">
                    <el-upload
                        class="meal-upload"
                        action="#"
                        :auto-upload="false"
                        :on-change="handleImageUpload"
                        :show-file-list="false"
                    >
                        <img
                            v-if="mealForm.image"
                            :src="mealForm.image"
                            class="uploaded-image"
                        />
                        <el-icon v-else class="upload-icon"><Plus /></el-icon>
                    </el-upload>
                </el-form-item>

                <el-form-item label="菜单描述">
                    <el-input
                        v-model="mealForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="描述今天的餐食内容..."
                    />
                </el-form-item>

                <el-form-item label="热量 (kcal)">
                    <el-input-number
                        v-model="mealForm.calories"
                        :min="0"
                        :max="3000"
                    />
                </el-form-item>

                <el-form-item label="标签">
                    <el-select
                        v-model="mealForm.tags"
                        multiple
                        placeholder="选择标签"
                    >
                        <el-option label="茶饮" value="茶饮" />
                        <el-option label="清淡" value="清淡" />
                        <el-option label="油腻" value="油腻" />
                        <el-option label="素食" value="素食" />
                        <el-option label="高蛋白" value="高蛋白" />
                        <el-option label="低卡" value="低卡" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="showMealDialog = false">取消</el-button>
                <el-button type="primary" @click="saveMealRecord"
                    >保存</el-button
                >
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from "vue";
import {
    Edit,
    Plus,
    Check,
    Sunny,
    Moon,
    Coffee,
    Food,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 餐食类型
interface Meal {
    type: string;
    name: string;
    icon: any;
    recorded: boolean;
    image?: string;
    description?: string;
    calories?: number;
    tags: string[];
}

// 餐食数据
const meals = ref<Meal[]>([
    { type: "breakfast", name: "早餐", icon: markRaw(Sunny), recorded: false, tags: [] },
    { type: "lunch", name: "午餐", icon: markRaw(Food), recorded: false, tags: [] },
    { type: "dinner", name: "晚餐", icon: markRaw(Moon), recorded: false, tags: [] },
    {
        type: "snack",
        name: "加餐/茶饮",
        icon: markRaw(Coffee),
        recorded: false,
        tags: [],
    },
]);

// 当前编辑的餐食
const currentMeal = ref<Meal | null>(null);
const showMealDialog = ref(false);
const mealForm = ref({
    image: "",
    description: "",
    calories: 0,
    tags: [] as string[],
});

// 饮水数据
const waterIntake = ref({
    current: 900,
    target: 2000,
});

const waterCups = ref([
    { label: "200ml", filled: true },
    { label: "400ml", filled: true },
    { label: "600ml", filled: true },
    { label: "800ml", filled: false },
    { label: "1000ml", filled: false },
    { label: "1200ml", filled: false },
    { label: "1400ml", filled: false },
    { label: "1600ml", filled: false },
    { label: "1800ml", filled: false },
    { label: "2000ml", filled: false },
]);

// 作息数据
const schedule = ref({
    wakeUp: "",
    sleep: "",
    statusTags: ["on-time", "nap"],
});

// 营养数据
const nutrition = ref({
    protein: 65,
    carbs: 70,
    fat: 45,
});

// 计算属性
const totalCalories = computed(() => {
    return meals.value.reduce((sum, meal) => sum + (meal.calories || 0), 0);
});

const waterPercentage = computed(() => {
    return Math.min(
        100,
        (waterIntake.value.current / waterIntake.value.target) * 100,
    );
});

const waterColor = computed(() => {
    if (waterPercentage.value >= 100) return "#67c23a";
    if (waterPercentage.value >= 70) return "#409eff";
    return "#e6a23c";
});

const caloriePercentage = computed(() => {
    const target = 2000; // 目标热量
    return Math.min(100, (totalCalories.value / target) * 100);
});

const calorieColor = computed(() => {
    if (caloriePercentage.value <= 80) return "#67c23a";
    if (caloriePercentage.value <= 100) return "#e6a23c";
    return "#f56c6c";
});

const healthTips = computed(() => {
    const tips: string[] = [];

    if (totalCalories.value < 1200) {
        tips.push("今日摄入热量偏低，建议适当增加营养摄入");
    } else if (totalCalories.value > 2500) {
        tips.push("今日摄入热量偏高，建议控制饮食并增加运动");
    }

    if (waterIntake.value.current < waterIntake.value.target * 0.5) {
        tips.push("饮水量不足，记得多喝水哦");
    }

    if (!schedule.value.wakeUp || !schedule.value.sleep) {
        tips.push("别忘了记录作息时间");
    }

    if (schedule.value.statusTags.includes("late-night")) {
        tips.push("昨晚熬夜了，今天早点休息");
    }

    if (schedule.value.statusTags.includes("sedentary")) {
        tips.push("久坐伤身，起来活动一下吧");
    }

    if (tips.length === 0) {
        tips.push("今日状态良好，继续保持！");
    }

    return tips;
});

// 打开餐食记录对话框
function openMealDialog(meal: Meal) {
    currentMeal.value = meal;
    mealForm.value = {
        image: meal.image || "",
        description: meal.description || "",
        calories: meal.calories || 0,
        tags: [...meal.tags],
    };
    showMealDialog.value = true;
}

// 处理图片上传
function handleImageUpload(file: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
        mealForm.value.image = e.target?.result as string;
    };
    reader.readAsDataURL(file.raw);
}

// 保存餐食记录
function saveMealRecord() {
    if (currentMeal.value) {
        currentMeal.value.recorded = true;
        currentMeal.value.image = mealForm.value.image;
        currentMeal.value.description = mealForm.value.description;
        currentMeal.value.calories = mealForm.value.calories;
        currentMeal.value.tags = mealForm.value.tags;

        ElMessage.success(`${currentMeal.value.name}记录成功！`);
        showMealDialog.value = false;
    }
}

// 切换水杯状态
function toggleWaterCup(index: number) {
    const cup = waterCups.value[index];
    if (!cup) return;

    // 如果点击的是已填充的杯子，取消该杯及之后的所有杯子
    if (cup.filled) {
        for (let i = index; i < waterCups.value.length; i++) {
            const targetCup = waterCups.value[i];
            if (targetCup) {
                targetCup.filled = false;
            }
        }
    } else {
        // 如果点击的是未填充的杯子，填充该杯及之前的所有杯子
        for (let i = 0; i <= index; i++) {
            const targetCup = waterCups.value[i];
            if (targetCup) {
                targetCup.filled = true;
            }
        }
    }

    // 计算当前饮水量
    const filledCount = waterCups.value.filter((cup) => cup.filled).length;
    waterIntake.value.current = filledCount * 200;
}

// 记录起床时间
function recordWakeUp() {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    schedule.value.wakeUp = time;
    ElMessage.success(`已记录起床时间：${time}`);
}

// 记录入睡时间
function recordSleep() {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    schedule.value.sleep = time;
    ElMessage.success(`已记录入睡时间：${time}`);
}
</script>

<style scoped lang="scss">
.lifestyle-module {
    padding: 20px 0;

    // 餐食卡片
    .meal-card {
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

        .meal-list {
            .meal-item {
                padding: 15px;
                border: 1px solid #e4e7ed;
                border-radius: 8px;
                margin-bottom: 15px;
                transition: all 0.3s ease;

                &:hover {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .meal-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;

                    .meal-icon {
                        font-size: 20px;
                        color: #409eff;
                    }

                    .meal-name {
                        font-weight: 600;
                        color: #333;
                        flex: 1;
                    }
                }

                .meal-content {
                    .meal-image {
                        width: 100%;
                        max-height: 200px;
                        overflow: hidden;
                        border-radius: 8px;
                        margin-bottom: 10px;

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    }

                    .meal-description {
                        margin: 10px 0;
                        color: #606266;
                        line-height: 1.6;
                    }

                    .meal-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                }
            }
        }
    }

    // 饮水卡片
    .water-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
                color: #333;
            }
        }

        .water-progress {
            margin-bottom: 20px;

            .water-remaining {
                margin-top: 10px;
                text-align: center;
                color: #606266;
                font-size: 14px;

                strong {
                    color: #409eff;
                    font-size: 16px;
                }
            }
        }

        .water-cups {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;

            .water-cup {
                aspect-ratio: 1;
                border: 2px solid #dcdfe6;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                background-color: #fff;

                &:hover {
                    border-color: #409eff;
                    transform: scale(1.05);
                }

                &.filled {
                    background-color: #ecf5ff;
                    border-color: #409eff;
                    color: #409eff;
                }

                .el-icon {
                    font-size: 20px;
                    margin-bottom: 4px;
                }

                .cup-label {
                    font-size: 12px;
                    color: #909399;
                }

                &.filled .cup-label {
                    color: #409eff;
                    font-weight: 600;
                }
            }
        }
    }

    // 作息卡片
    .schedule-card {
        margin-bottom: 20px;

        :deep(.el-card__header) {
            h4 {
                margin: 0;
                color: #333;
            }
        }

        .schedule-checkins {
            margin-bottom: 20px;

            .checkin-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding: 10px;
                background-color: #f5f7fa;
                border-radius: 8px;

                .checkin-label {
                    font-weight: 600;
                    color: #606266;
                }
            }
        }

        .schedule-status {
            h5 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 14px;
            }

            :deep(.el-checkbox-group) {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        }
    }

    // 健康小结卡片
    .summary-card {
        :deep(.el-card__header) {
            h4 {
                margin: 0;
                color: #333;
            }
        }

        .summary-content {
            .calorie-ring {
                text-align: center;
                margin-bottom: 20px;

                .percentage-value {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }

                .percentage-label {
                    display: block;
                    font-size: 12px;
                    color: #909399;
                }
            }

            .nutrition-bars {
                margin-bottom: 20px;

                h5 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 14px;
                }

                .nutrition-item {
                    margin-bottom: 12px;

                    .nutrition-label {
                        display: block;
                        font-size: 13px;
                        color: #606266;
                        margin-bottom: 5px;
                    }
                }
            }

            .health-tips {
                h5 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 14px;
                }

                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;

                    li {
                        padding: 8px 12px;
                        margin-bottom: 8px;
                        background-color: #f0f9ff;
                        border-left: 3px solid #409eff;
                        border-radius: 4px;
                        color: #606266;
                        font-size: 13px;
                        line-height: 1.6;
                    }
                }
            }
        }
    }
}

// 上传样式
.meal-upload {
    width: 100%;
    height: 150px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        border-color: #409eff;
    }

    .uploaded-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .upload-icon {
        font-size: 40px;
        color: #c0c4cc;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .lifestyle-module {
        .water-card {
            .water-cups {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    }
}
</style>
