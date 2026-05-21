<template>
    <div class="community-page">
        <!-- 顶部导航栏 -->
        <HeaderLayout />

        <!-- 顶部Hero区 - 关键指标 -->
        <section class="hero-section">
            <el-row :gutter="20" class="metrics-row">
                <el-col :xs="12" :sm="6">
                    <el-card class="metric-card" shadow="hover">
                        <div class="metric-content">
                            <div class="metric-icon checkin">
                                <el-icon><CircleCheck /></el-icon>
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">
                                    {{ todayCheckin.current }}/{{
                                        todayCheckin.total
                                    }}
                                </div>
                                <div class="metric-label">今日打卡</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="12" :sm="6">
                    <el-card class="metric-card" shadow="hover">
                        <div class="metric-content">
                            <div class="metric-icon streak">
                                <el-icon><TrendCharts /></el-icon>
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">
                                    {{ streakDays }} 天
                                </div>
                                <div class="metric-label">连续打卡</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="12" :sm="6">
                    <el-card class="metric-card" shadow="hover">
                        <div class="metric-content">
                            <div class="metric-icon friends">
                                <el-icon><User /></el-icon>
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">
                                    {{ friendsCount }} 位
                                </div>
                                <div class="metric-label">社区好友</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :xs="12" :sm="6">
                    <el-card class="metric-card" shadow="hover">
                        <div class="metric-content">
                            <div class="metric-icon challenge">
                                <el-icon><Trophy /></el-icon>
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">
                                    {{ challengesCount }} 个
                                </div>
                                <div class="metric-label">进行中挑战</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </section>

        <!-- 模块Tab切换 -->
        <section class="modules-section">
            <el-tabs
                v-model="activeModule"
                class="module-tabs"
                @tab-change="handleModuleChange"
            >
                <el-tab-pane label="每日打卡" name="checkin">
                    <DailyCheckinModule />
                </el-tab-pane>
                <el-tab-pane label="饮食作息" name="lifestyle">
                    <LifestyleModule />
                </el-tab-pane>
                <el-tab-pane label="经验分享" name="sharing">
                    <ExperienceSharingModule />
                </el-tab-pane>
                <el-tab-pane label="社区互动" name="interaction">
                    <CommunityInteractionModule />
                </el-tab-pane>
                <el-tab-pane label="健康挑战" name="challenge">
                    <HealthChallengeModule />
                </el-tab-pane>
            </el-tabs>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
    CircleCheck,
    TrendCharts,
    User,
    Trophy,
} from "@element-plus/icons-vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import DailyCheckinModule from "@/components/community/DailyCheckinModule.vue";
import LifestyleModule from "@/components/community/LifestyleModule.vue";
import ExperienceSharingModule from "@/components/community/ExperienceSharingModule.vue";
import CommunityInteractionModule from "@/components/community/CommunityInteractionModule.vue";
import HealthChallengeModule from "@/components/community/HealthChallengeModule.vue";

// 关键指标数据
const todayCheckin = ref({
    current: 5,
    total: 6,
});

const streakDays = ref(28);
const friendsCount = ref(156);
const challengesCount = ref(2);

// 当前激活的模块
const activeModule = ref("checkin");

// 处理模块切换
function handleModuleChange(moduleName: string) {
    console.log("切换到模块:", moduleName);
}
</script>

<style scoped lang="scss">
.community-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

// Hero区域 - 关键指标
.hero-section {
    margin-bottom: 30px;

    .metrics-row {
        .metric-card {
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
            }

            :deep(.el-card__body) {
                padding: 20px;
            }

            .metric-content {
                display: flex;
                align-items: center;
                gap: 15px;

                .metric-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;

                    &.checkin {
                        background: linear-gradient(
                            135deg,
                            #667eea 0%,
                            #764ba2 100%
                        );
                    }

                    &.streak {
                        background: linear-gradient(
                            135deg,
                            #f093fb 0%,
                            #f5576c 100%
                        );
                    }

                    &.friends {
                        background: linear-gradient(
                            135deg,
                            #4facfe 0%,
                            #00f2fe 100%
                        );
                    }

                    &.challenge {
                        background: linear-gradient(
                            135deg,
                            #fa709a 0%,
                            #fee140 100%
                        );
                    }
                }

                .metric-info {
                    flex: 1;

                    .metric-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 5px;
                    }

                    .metric-label {
                        font-size: 14px;
                        color: #999;
                    }
                }
            }
        }
    }
}

// 模块区域
.modules-section {
    :deep(.module-tabs) {
        .el-tabs__header {
            margin-bottom: 20px;
        }

        .el-tabs__item {
            font-size: 16px;
            font-weight: 500;
            padding: 0 25px;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .community-page {
        padding: 10px;
    }

    .hero-section {
        .metrics-row {
            .metric-card {
                margin-bottom: 10px;

                .metric-content {
                    .metric-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                    }

                    .metric-info {
                        .metric-value {
                            font-size: 20px;
                        }
                    }
                }
            }
        }
    }
}
</style>
