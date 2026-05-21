<template>
    <div class="personalized-recommendation">
        <el-card shadow="hover">
            <template #header>
                <div class="card-header">
                    <h3>个性推荐</h3>
                </div>
            </template>

            <div class="content">
                <!-- 用户画像 -->
                <section class="user-profile-section">
                    <h4 class="section-title">您的养生画像</h4>
                    <div class="profile-tags">
                        <el-tag
                            v-for="tag in userProfileTags"
                            :key="tag.type"
                            :type="getTagType(tag.type)"
                            effect="plain"
                            size="large"
                            class="profile-tag"
                        >
                            <el-icon v-if="tag.icon" class="tag-icon">
                                <component :is="tag.icon" />
                            </el-icon>
                            {{ tag.label }}
                        </el-tag>
                        <el-empty
                            v-if="userProfileTags.length === 0"
                            description="完善个人信息以获得更精准的推荐"
                            :image-size="80"
                        />
                    </div>
                </section>

                <!-- 智能推荐瀑布流 -->
                <section class="recommendation-section">
                    <h4 class="section-title">今日精选推荐</h4>
                    <el-row :gutter="20" class="recommendation-grid">
                        <el-col
                            v-for="item in recommendations"
                            :key="item.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                            :lg="6"
                        >
                            <el-card
                                class="recommendation-card"
                                shadow="hover"
                                @click="handleRecommendationClick(item)"
                            >
                                <div class="card-image">
                                    <img
                                        :src="item.image"
                                        :alt="item.title"
                                        @error="
                                            handleImageError($event, item.title)
                                        "
                                    />
                                    <el-tag
                                        :type="getItemTypeTag(item.type)"
                                        size="small"
                                        class="type-tag"
                                    >
                                        {{ item.type }}
                                    </el-tag>
                                </div>
                                <div class="card-content">
                                    <h5 class="item-title">{{ item.title }}</h5>
                                    <p class="item-description">
                                        {{ item.description }}
                                    </p>
                                    <div class="reason-section">
                                        <el-icon class="reason-icon">
                                            <InfoFilled />
                                        </el-icon>
                                        <span class="reason-label">
                                            推荐理由：
                                        </span>
                                        <span class="reason-text">
                                            {{ item.reason }}
                                        </span>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>

                    <el-empty
                        v-if="recommendations.length === 0"
                        description="暂无推荐内容"
                        :image-size="100"
                    />
                </section>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
    InfoFilled,
    Food,
    Document,
    VideoPlay,
    Moon,
    Sunny,
    User,
    Timer,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 类型定义
interface UserProfileTag {
    type: string;
    label: string;
    icon?: any;
}

interface RecommendationItem {
    id: number;
    title: string;
    type: "食谱" | "文章" | "冥想" | "视频";
    image: string;
    description: string;
    reason: string;
    link?: string;
}

interface UserData {
    constitution?: string; // 体质
    solarTerm?: string; // 节气
    menstrualPhase?: string; // 经期阶段
    sleepType?: string; // 睡眠类型
    preferences?: string[]; // 偏好
}

// 模拟用户数据（实际应从各模块获取）
const userData = ref<UserData>({
    constitution: "阴虚体质",
    solarTerm: "立夏",
    menstrualPhase: "黄体期",
    sleepType: "浅睡型",
    preferences: [
        "阴虚",
        "气郁",
        "立夏",
        "睡眠改善",
        "经期养护",
        "冥想",
        "食疗",
    ],
});

// 用户画像标签
const userProfileTags = computed<UserProfileTag[]>(() => {
    const tags: UserProfileTag[] = [];

    if (userData.value.constitution) {
        tags.push({
            type: "constitution",
            label: userData.value.constitution,
            icon: User,
        });
    }

    if (userData.value.solarTerm) {
        tags.push({
            type: "solarTerm",
            label: userData.value.solarTerm,
            icon: Sunny,
        });
    }

    if (userData.value.menstrualPhase) {
        tags.push({
            type: "menstrual",
            label: userData.value.menstrualPhase,
            icon: Timer,
        });
    }

    if (userData.value.sleepType) {
        tags.push({
            type: "sleep",
            label: userData.value.sleepType,
            icon: Moon,
        });
    }

    return tags;
});

// 推荐数据
const recommendations = ref<RecommendationItem[]>([
    {
        id: 1,
        title: "立夏养阴·冰糖银耳莲子羹",
        type: "食谱",
        image: "/images/recipes/silver-fungus-soup.jpg",
        description: "滋阴润燥，清心安神，适合夏季养生",
        reason: "基于您的阴虚体质和立夏节气推荐",
    },
    {
        id: 2,
        title: "浅睡型·深度入眠引导 20 分钟",
        type: "冥想",
        image: "/images/meditation/deep-sleep.jpg",
        description: "专业引导语配合舒缓音乐，助您快速进入深度睡眠",
        reason: "昨夜深睡仅23%·推荐改善睡眠质量",
    },
    {
        id: 3,
        title: "黄体期养护·当归红枣茶",
        type: "食谱",
        image: "/images/recipes/angelica-tea.jpg",
        description: "温补气血，缓解经期不适",
        reason: "当前处于黄体期·需温补气血",
    },
    {
        id: 4,
        title: "阴虚体质调理指南",
        type: "文章",
        image: "/images/articles/yin-deficiency.jpg",
        description: "全面了解阴虚体质的特征、成因及调理方法",
        reason: "根据您的阴虚体质定制",
    },
    {
        id: 5,
        title: "立夏时节·养心静坐法",
        type: "视频",
        image: "/images/videos/summer-meditation.jpg",
        description: "传统中医养生功法，夏季养心必备",
        reason: "立夏节气·宜养心安神",
    },
    {
        id: 6,
        title: "气郁体质·疏肝解郁茶",
        type: "食谱",
        image: "/images/recipes/liver-soothing-tea.jpg",
        description: "玫瑰花、陈皮搭配，疏肝理气",
        reason: "基于您的气郁体质倾向推荐",
    },
]);

// 获取标签类型
function getTagType(type: string): string {
    const types: Record<string, string> = {
        constitution: "primary",
        solarTerm: "success",
        menstrual: "warning",
        sleep: "info",
    };
    return types[type] || "";
}

// 获取内容类型标签
function getItemTypeTag(type: string): string {
    const types: Record<string, string> = {
        食谱: "success",
        文章: "primary",
        冥想: "warning",
        视频: "danger",
    };
    return types[type] || "";
}

// 处理图片加载错误
function handleImageError(event: Event, title: string) {
    const target = event.target as HTMLImageElement;
    event.preventDefault();
    event.stopPropagation();

    // 创建占位div
    const placeholder = document.createElement("div");
    placeholder.style.width = "100%";
    placeholder.style.height = "100%";
    placeholder.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    placeholder.style.display = "flex";
    placeholder.style.alignItems = "center";
    placeholder.style.justifyContent = "center";
    placeholder.style.color = "white";
    placeholder.style.fontSize = "14px";
    placeholder.style.borderRadius = "4px";
    placeholder.textContent = title;

    if (target.parentNode) {
        target.parentNode.replaceChild(placeholder, target);
    }
}

// 处理推荐项点击
function handleRecommendationClick(item: RecommendationItem) {
    ElMessage.info(`正在打开：${item.title}`);
    // 实际项目中这里应该跳转到详情页或打开弹窗
    console.log("推荐项点击:", item);
}

// 生命周期
onMounted(() => {
    // 实际项目中这里应该从各个模块获取用户数据
    console.log("用户数据:", userData.value);
    console.log("用户画像标签:", userProfileTags.value);
});
</script>

<style scoped lang="scss">
.personalized-recommendation {
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

    // 用户画像区域
    .user-profile-section {
        margin-bottom: 40px;

        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
            padding-left: 10px;
            border-left: 4px solid #409eff;
        }

        .profile-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .profile-tag {
                padding: 10px 16px;
                font-size: 15px;
                border-radius: 20px;

                .tag-icon {
                    margin-right: 6px;
                    vertical-align: middle;
                }
            }
        }
    }

    // 推荐区域
    .recommendation-section {
        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
            padding-left: 10px;
            border-left: 4px solid #67c23a;
        }

        .recommendation-grid {
            .recommendation-card {
                margin-bottom: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                height: 100%;

                &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .card-image {
                    position: relative;
                    width: 100%;
                    height: 160px;
                    overflow: hidden;
                    border-radius: 4px;
                    margin-bottom: 12px;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }

                    &:hover img {
                        transform: scale(1.05);
                    }

                    .type-tag {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        font-weight: bold;
                    }
                }

                .card-content {
                    .item-title {
                        margin: 0 0 8px 0;
                        font-size: 16px;
                        color: #333;
                        font-weight: 600;
                        line-height: 1.4;
                    }

                    .item-description {
                        margin: 0 0 12px 0;
                        font-size: 14px;
                        color: #666;
                        line-height: 1.6;
                        min-height: 40px;
                    }

                    .reason-section {
                        display: flex;
                        align-items: flex-start;
                        padding: 10px;
                        background-color: #f0f9ff;
                        border-radius: 6px;
                        border-left: 3px solid #409eff;

                        .reason-icon {
                            color: #409eff;
                            margin-right: 6px;
                            margin-top: 2px;
                            flex-shrink: 0;
                        }

                        .reason-label {
                            font-size: 13px;
                            color: #409eff;
                            font-weight: 600;
                            margin-right: 4px;
                            flex-shrink: 0;
                        }

                        .reason-text {
                            font-size: 13px;
                            color: #606266;
                            line-height: 1.5;
                            flex: 1;
                        }
                    }
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .personalized-recommendation {
        .user-profile-section {
            .profile-tags {
                .profile-tag {
                    font-size: 13px;
                    padding: 8px 12px;
                }
            }
        }

        .recommendation-section {
            .recommendation-grid {
                .recommendation-card {
                    .card-image {
                        height: 140px;
                    }
                }
            }
        }
    }
}
</style>
