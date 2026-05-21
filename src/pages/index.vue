<template>
    <div class="home-page">
        <!-- 顶部导航栏 -->
        <HeaderLayout />

        <!-- 主体内容区 -->
        <main class="main-content">
            <div class="container">
                <!-- 养生智库介绍 -->
                <section class="intro-section">
                    <h1 class="intro-title">顺应节气、调和阴阳、记录身心</h1>
                    <p class="intro-description">
                        集二十四节气养生、睡眠作息、女性健康、中医智慧、情绪疗愈与个性化推荐于一体。
                    </p>
                </section>

                <!-- 今日信息模块 -->
                <section class="today-info">
                    <el-row :gutter="20">
                        <el-col :xs="24" :sm="12" :md="6">
                            <el-card class="info-card">
                                <template #header>
                                    <div class="card-header">
                                        <span>今日节气</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    <h3>立夏・第 3 日</h3>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="6">
                            <el-card
                                class="info-card clickable"
                                @click="switchTab('sleep')"
                            >
                                <template #header>
                                    <div class="card-header">
                                        <span>昨夜睡眠</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    <h3>7h 42min</h3>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="6">
                            <el-card
                                class="info-card clickable"
                                @click="switchTab('menstrual')"
                            >
                                <template #header>
                                    <div class="card-header">
                                        <span>经期阶段</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    <h3>黄体期 D18</h3>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :xs="24" :sm="12" :md="6">
                            <el-card class="info-card">
                                <template #header>
                                    <div class="card-header">
                                        <span>体质</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    <h3>阴虚兼气郁</h3>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </section>

                <!-- 功能模块导航 -->
                <section class="module-nav">
                    <el-tabs
                        v-model="activeTab"
                        class="module-tabs"
                        @tab-change="handleTabChange"
                    >
                        <el-tab-pane label="节气养生" name="solar-term">
                            <SolarTermKnowledge />
                        </el-tab-pane>
                        <el-tab-pane label="睡眠作息" name="sleep">
                            <SleepTracker />
                        </el-tab-pane>
                        <el-tab-pane label="经期管理" name="menstrual">
                            <MenstrualTracker />
                        </el-tab-pane>
                        <el-tab-pane label="中医养生" name="tcm">
                            <TcmWisdom />
                        </el-tab-pane>
                        <el-tab-pane label="情绪疗愈" name="emotion">
                            <EmotionHealing />
                        </el-tab-pane>
                        <el-tab-pane label="个性推荐" name="recommendation">
                            <PersonalizedRecommendation />
                        </el-tab-pane>
                    </el-tabs>
                </section>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import SolarTermKnowledge from "@/components/SolarTermKnowledge.vue";
import SleepTracker from "@/components/SleepTracker.vue";
import MenstrualTracker from "@/components/MenstrualTracker.vue";
import TcmWisdom from "@/components/TcmWisdom.vue";
import EmotionHealing from "@/components/EmotionHealing.vue";
import PersonalizedRecommendation from "@/components/PersonalizedRecommendation.vue";

const activeTab = ref("solar-term");

// 切换标签页
const handleTabChange = (tabName: string) => {
    console.log("切换到:", tabName);
    // 可以在这里添加额外的逻辑，比如埋点、数据加载等
};

// 通过卡片点击切换标签
const switchTab = (tabName: string) => {
    activeTab.value = tabName;
};
</script>

<style scoped lang="scss">
.home-page {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.main-content {
    padding: 20px 0;

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
}

.intro-section {
    text-align: center;
    margin-bottom: 30px;
    padding: 30px 0;

    .intro-title {
        font-size: 28px;
        color: #333;
        margin-bottom: 15px;
    }

    .intro-description {
        font-size: 16px;
        color: #666;
        line-height: 1.6;
    }
}

.today-info {
    margin-bottom: 30px;

    .info-card {
        height: 100%;
        transition: transform 0.3s ease;

        &:hover {
            transform: translateY(-5px);
        }

        &.clickable {
            cursor: pointer;

            &:hover {
                box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
            }
        }

        .card-header {
            font-weight: bold;
            color: #409eff;
        }

        .card-content {
            h3 {
                margin: 0;
                color: #333;
                font-size: 18px;
            }
        }
    }
}

.module-nav {
    margin-top: 30px;

    .module-tabs {
        :deep(.el-tabs__header) {
            margin-bottom: 20px;
        }

        :deep(.el-tabs__item) {
            font-size: 16px;
            font-weight: 500;
            padding: 0 20px;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .header {
        .container {
            flex-direction: column;
            height: auto;
            padding: 10px;
        }

        .nav-menu {
            margin: 10px 0;
            width: 100%;
        }

        .search-box {
            width: 100%;
            margin-top: 10px;
        }
    }

    .intro-section {
        .intro-title {
            font-size: 24px;
        }

        .intro-description {
            font-size: 14px;
        }
    }
}
</style>
