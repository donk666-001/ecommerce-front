<template>
    <div class="experience-sharing-module">
        <el-row :gutter="20">
            <!-- 左侧：主要内容区 -->
            <el-col :xs="24" :lg="18">
                <!-- 发布入口 -->
                <el-card class="publish-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>✍️ 分享你的养生经验</h4>
                            <el-button
                                type="primary"
                                @click="showPublishDialog = true"
                            >
                                <el-icon><Edit /></el-icon>
                                发布经验
                            </el-button>
                        </div>
                    </template>

                    <!-- 快速分类入口 -->
                    <div class="quick-categories">
                        <div
                            v-for="category in categories"
                            :key="category.value"
                            class="category-item"
                            @click="selectCategory(category.value)"
                        >
                            <el-icon><component :is="category.icon" /></el-icon>
                            <span>{{ category.label }}</span>
                        </div>
                    </div>
                </el-card>

                <!-- 经验广场 -->
                <el-card class="square-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>🌟 经验广场</h4>
                            <el-tabs
                                v-model="activeTab"
                                @tab-change="handleTabChange"
                            >
                                <el-tab-pane label="最新" name="latest" />
                                <el-tab-pane label="热门" name="hot" />
                                <el-tab-pane label="精华" name="featured" />
                                <el-tab-pane label="关注" name="following" />
                            </el-tabs>
                        </div>
                    </template>

                    <!-- 经验列表 -->
                    <div class="experience-list">
                        <div
                            v-for="item in experienceList"
                            :key="item.id"
                            class="experience-item"
                            @click="viewDetail(item)"
                        >
                            <div class="item-header">
                                <el-avatar :size="40" :src="item.author.avatar">
                                    {{ item.author.name[0] }}
                                </el-avatar>
                                <div class="author-info">
                                    <div class="author-name">
                                        {{ item.author.name }}
                                    </div>
                                    <div class="publish-time">
                                        {{ item.publishTime }}
                                    </div>
                                </div>
                                <el-tag
                                    size="small"
                                    :type="getCategoryType(item.category)"
                                >
                                    {{ item.category }}
                                </el-tag>
                            </div>

                            <div class="item-content">
                                <h5 class="item-title">{{ item.title }}</h5>
                                <p class="item-summary">{{ item.summary }}</p>
                                <div
                                    class="item-images"
                                    v-if="item.images && item.images.length > 0"
                                >
                                    <img
                                        v-for="(
                                            img, index
                                        ) in item.images.slice(0, 3)"
                                        :key="index"
                                        :src="img"
                                        alt="经验图片"
                                    />
                                </div>
                                <div class="item-tags">
                                    <el-tag
                                        v-for="tag in item.tags"
                                        :key="tag"
                                        size="small"
                                        type="info"
                                        effect="plain"
                                    >
                                        #{{ tag }}
                                    </el-tag>
                                </div>
                            </div>

                            <div class="item-footer">
                                <div class="interaction-stats">
                                    <span class="stat-item">
                                        <el-icon><Star /></el-icon>
                                        {{ item.likes }}
                                    </span>
                                    <span class="stat-item">
                                        <el-icon><ChatDotRound /></el-icon>
                                        {{ item.comments }}
                                    </span>
                                    <span class="stat-item">
                                        <el-icon><Collection /></el-icon>
                                        {{ item.collections }}
                                    </span>
                                </div>
                                <el-button
                                    text
                                    @click.stop="toggleCollect(item)"
                                >
                                    <el-icon
                                        ><component
                                            :is="
                                                item.collected
                                                    ? 'StarFilled'
                                                    : 'Star'
                                            "
                                    /></el-icon>
                                    {{ item.collected ? "已收藏" : "收藏" }}
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <el-empty
                        v-if="experienceList.length === 0"
                        description="暂无分享内容"
                    />
                </el-card>
            </el-col>

            <!-- 右侧：侧边栏 -->
            <el-col :xs="24" :lg="6">
                <!-- 创作数据看板 -->
                <el-card class="stats-card" shadow="hover">
                    <template #header>
                        <h4>📊 创作数据</h4>
                    </template>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <el-statistic
                                title="发布数"
                                :value="creatorStats.published"
                            />
                        </div>
                        <div class="stat-box">
                            <el-statistic
                                title="获赞"
                                :value="creatorStats.likes"
                            />
                        </div>
                        <div class="stat-box">
                            <el-statistic
                                title="被收藏"
                                :value="creatorStats.collections"
                            />
                        </div>
                        <div class="stat-box">
                            <el-statistic
                                title="阅读量"
                                :value="creatorStats.views"
                            />
                        </div>
                    </div>
                </el-card>

                <!-- 草稿箱 -->
                <el-card class="drafts-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>📝 草稿箱</h4>
                            <el-tag size="small">{{ drafts.length }}</el-tag>
                        </div>
                    </template>
                    <div class="draft-list">
                        <div
                            v-for="draft in drafts"
                            :key="draft.id"
                            class="draft-item"
                            @click="editDraft(draft)"
                        >
                            <div class="draft-title">
                                {{ draft.title || "未命名草稿" }}
                            </div>
                            <div class="draft-time">{{ draft.updateTime }}</div>
                            <el-button
                                text
                                type="danger"
                                size="small"
                                @click.stop="deleteDraft(draft.id)"
                            >
                                删除
                            </el-button>
                        </div>
                    </div>
                    <el-empty
                        v-if="drafts.length === 0"
                        description="暂无草稿"
                        :image-size="60"
                    />
                </el-card>

                <!-- 收藏夹管理 -->
                <el-card class="collections-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>⭐ 我的收藏</h4>
                            <el-button
                                text
                                type="primary"
                                size="small"
                                @click="showCreateGroup = true"
                            >
                                新建分组
                            </el-button>
                        </div>
                    </template>
                    <el-collapse v-model="activeGroups">
                        <el-collapse-item
                            v-for="group in collectionGroups"
                            :key="group.id"
                            :name="group.id"
                        >
                            <template #title>
                                <div class="group-title">
                                    <span>{{ group.name }}</span>
                                    <el-tag size="small">{{
                                        group.count
                                    }}</el-tag>
                                </div>
                            </template>
                            <div class="group-items">
                                <div
                                    v-for="item in group.items"
                                    :key="item.id"
                                    class="collection-item"
                                >
                                    {{ item.title }}
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </el-card>

                <!-- 热门话题 -->
                <el-card class="topics-card" shadow="hover">
                    <template #header>
                        <h4>🔥 热门话题</h4>
                    </template>
                    <div class="topic-list">
                        <div
                            v-for="topic in hotTopics"
                            :key="topic.name"
                            class="topic-item"
                        >
                            <span class="topic-name">#{{ topic.name }}</span>
                            <span class="topic-count">{{ topic.count }}篇</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 发布经验对话框 -->
        <el-dialog
            v-model="showPublishDialog"
            title="发布养生经验"
            width="800px"
            :close-on-click-modal="false"
        >
            <el-form :model="publishForm" label-width="100px">
                <el-form-item label="标题" required>
                    <el-input
                        v-model="publishForm.title"
                        placeholder="请输入标题"
                        maxlength="100"
                        show-word-limit
                    />
                </el-form-item>

                <el-form-item label="分类" required>
                    <el-select
                        v-model="publishForm.category"
                        placeholder="请选择分类"
                    >
                        <el-option
                            v-for="cat in categories"
                            :key="cat.value"
                            :label="cat.label"
                            :value="cat.value"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="话题标签">
                    <el-select
                        v-model="publishForm.tags"
                        multiple
                        filterable
                        allow-create
                        default-first-option
                        placeholder="输入或选择话题标签"
                    >
                        <el-option
                            v-for="tag in popularTags"
                            :key="tag"
                            :label="tag"
                            :value="tag"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="正文内容" required>
                    <el-input
                        v-model="publishForm.content"
                        type="textarea"
                        :rows="8"
                        placeholder="分享你的养生心得..."
                    />
                </el-form-item>

                <el-form-item label="上传图片">
                    <el-upload
                        action="#"
                        list-type="picture-card"
                        :auto-upload="false"
                        :on-change="handleImageUpload"
                        :file-list="publishForm.images"
                        multiple
                    >
                        <el-icon><Plus /></el-icon>
                    </el-upload>
                </el-form-item>

                <el-form-item label="上传视频">
                    <el-upload
                        action="#"
                        :auto-upload="false"
                        :on-change="handleVideoUpload"
                        accept="video/*"
                    >
                        <el-button type="primary">
                            <el-icon><VideoCamera /></el-icon>
                            上传视频
                        </el-button>
                    </el-upload>
                    <div v-if="publishForm.video" class="video-preview">
                        <video
                            :src="publishForm.video"
                            controls
                            style="width: 100%; max-height: 300px"
                        />
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="saveDraft">保存草稿</el-button>
                <el-button @click="showPublishDialog = false">取消</el-button>
                <el-button type="primary" @click="publishExperience"
                    >发布</el-button
                >
            </template>
        </el-dialog>

        <!-- 经验详情对话框 -->
        <el-dialog
            v-model="showDetailDialog"
            :title="currentExperience?.title"
            width="900px"
        >
            <div v-if="currentExperience" class="detail-content">
                <div class="detail-header">
                    <el-avatar
                        :size="50"
                        :src="currentExperience.author.avatar"
                    >
                        {{ currentExperience.author.name[0] }}
                    </el-avatar>
                    <div class="detail-author">
                        <div class="author-name">
                            {{ currentExperience.author.name }}
                        </div>
                        <div class="publish-info">
                            {{ currentExperience.publishTime }} ·
                            {{ currentExperience.category }}
                        </div>
                    </div>
                </div>

                <div class="detail-body">
                    <p class="detail-text">{{ currentExperience.content }}</p>
                    <div class="detail-images" v-if="currentExperience.images">
                        <img
                            v-for="(img, index) in currentExperience.images"
                            :key="index"
                            :src="img"
                            alt="详情图片"
                        />
                    </div>
                    <div class="detail-tags">
                        <el-tag
                            v-for="tag in currentExperience.tags"
                            :key="tag"
                            type="info"
                        >
                            #{{ tag }}
                        </el-tag>
                    </div>
                </div>

                <div class="detail-interactions">
                    <el-button
                        type="primary"
                        @click="likeExperience(currentExperience)"
                    >
                        <el-icon><Star /></el-icon>
                        点赞 ({{ currentExperience.likes }})
                    </el-button>
                    <el-button>
                        <el-icon><ChatDotRound /></el-icon>
                        评论 ({{ currentExperience.comments }})
                    </el-button>
                    <el-button @click="toggleCollect(currentExperience)">
                        <el-icon
                            ><component
                                :is="
                                    currentExperience.collected
                                        ? 'StarFilled'
                                        : 'Star'
                                "
                        /></el-icon>
                        {{ currentExperience.collected ? "已收藏" : "收藏" }}
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
    Edit,
    Plus,
    VideoCamera,
    Star,
    ChatDotRound,
    Collection,
    Food,
    Timer,
    Sunny,
    Calendar,
    MagicStick,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 分类定义
const categories = [
    { value: "食疗药膳", label: "食疗药膳", icon: Food },
    { value: "作息调理", label: "作息调理", icon: Timer },
    { value: "运动养生", label: "运动养生", icon: "TrendCharts" },
    { value: "情志疏导", label: "情志疏导", icon: Sunny },
    { value: "节气养生", label: "节气养生", icon: Calendar },
    { value: "中医妙招", label: "中医妙招", icon: MagicStick },
];

// 发布表单
const showPublishDialog = ref(false);
const publishForm = ref({
    title: "",
    category: "",
    tags: [] as string[],
    content: "",
    images: [] as any[],
    video: "",
});

// 热门话题标签
const popularTags = ref([
    "春季养生",
    "养肝护肝",
    "失眠调理",
    "减肥食谱",
    "瑜伽练习",
    "冥想入门",
    "二十四节气",
    "穴位按摩",
]);

// 当前激活的Tab
const activeTab = ref("latest");

// 经验列表
const experienceList = ref([
    {
        id: 1,
        title: "立夏时节，这样养心最有效",
        summary:
            "立夏之后，气温逐渐升高，心火旺盛。推荐几款养心茶饮和食疗方...",
        content: "详细内容...",
        category: "节气养生",
        tags: ["立夏", "养心", "节气"],
        images: ["/images/experience/1.jpg", "/images/experience/2.jpg"],
        author: {
            name: "养生达人",
            avatar: "",
        },
        publishTime: "2小时前",
        likes: 128,
        comments: 23,
        collections: 45,
        collected: false,
    },
    {
        id: 2,
        title: "我的30天冥想打卡记录",
        summary: "坚持冥想30天，睡眠质量明显改善，焦虑感减轻了很多...",
        content: "详细内容...",
        category: "情志疏导",
        tags: ["冥想", "心理健康", "打卡"],
        images: ["/images/experience/3.jpg"],
        author: {
            name: "静心居士",
            avatar: "",
        },
        publishTime: "5小时前",
        likes: 256,
        comments: 67,
        collections: 89,
        collected: true,
    },
    {
        id: 3,
        title: "简单易学的八段锦教程",
        summary: "八段锦是传统养生功法，每天练习15分钟，强身健体...",
        content: "详细内容...",
        category: "运动养生",
        tags: ["八段锦", "运动", "健身"],
        images: [],
        author: {
            name: "太极师傅",
            avatar: "",
        },
        publishTime: "1天前",
        likes: 512,
        comments: 128,
        collections: 234,
        collected: false,
    },
]);

// 草稿箱
const drafts = ref([
    {
        id: 1,
        title: "夏季养生小贴士",
        updateTime: "2024-01-20 15:30",
    },
    {
        id: 2,
        title: "",
        updateTime: "2024-01-19 10:20",
    },
]);

// 收藏分组
const activeGroups = ref([]);
const collectionGroups = ref([
    {
        id: 1,
        name: "我的食疗方",
        count: 12,
        items: [
            { id: 1, title: "莲子百合粥" },
            { id: 2, title: "银耳红枣汤" },
        ],
    },
    {
        id: 2,
        name: "运动教程",
        count: 8,
        items: [{ id: 3, title: "八段锦教程" }],
    },
    {
        id: 3,
        name: "默认收藏",
        count: 25,
        items: [],
    },
]);

// 热门话题
const hotTopics = ref([
    { name: "春季养生", count: 1234 },
    { name: "养肝护肝", count: 892 },
    { name: "失眠调理", count: 756 },
    { name: "减肥食谱", count: 623 },
    { name: "瑜伽练习", count: 445 },
]);

// 创作数据统计
const creatorStats = ref({
    published: 15,
    likes: 2345,
    collections: 567,
    views: 12890,
});

// 当前查看的经验
const currentExperience = ref<any>(null);
const showDetailDialog = ref(false);
const showCreateGroup = ref(false);

// 获取分类类型
function getCategoryType(category: string): string {
    const types: Record<string, string> = {
        食疗药膳: "success",
        作息调理: "primary",
        运动养生: "warning",
        情志疏导: "danger",
        节气养生: "info",
        中医妙招: "",
    };
    return types[category] || "";
}

// 选择分类
function selectCategory(category: string) {
    publishForm.value.category = category;
    showPublishDialog.value = true;
}

// 处理Tab切换
function handleTabChange(tab: string) {
    console.log("切换到:", tab);
    // 实际项目中这里应该加载对应数据
    ElMessage.info(`加载${tab}内容`);
}

// 查看详情
function viewDetail(item: any) {
    currentExperience.value = item;
    showDetailDialog.value = true;
}

// 切换收藏状态
function toggleCollect(item: any) {
    item.collected = !item.collected;
    if (item.collected) {
        item.collections++;
        ElMessage.success("收藏成功");
    } else {
        item.collections--;
        ElMessage.info("取消收藏");
    }
}

// 点赞
function likeExperience(item: any) {
    item.likes++;
    ElMessage.success("点赞成功");
}

// 处理图片上传
function handleImageUpload(_file: any, fileList: any[]) {
    publishForm.value.images = fileList;
}

// 处理视频上传
function handleVideoUpload(file: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
        publishForm.value.video = e.target?.result as string;
    };
    reader.readAsDataURL(file.raw);
}

// 保存草稿
function saveDraft() {
    const draft = {
        id: Date.now(),
        title: publishForm.value.title,
        updateTime: new Date().toLocaleString("zh-CN"),
    };
    drafts.value.unshift(draft);
    ElMessage.success("草稿已保存");
    showPublishDialog.value = false;
}

// 编辑草稿
function editDraft(draft: any) {
    publishForm.value.title = draft.title || "";
    showPublishDialog.value = true;
    // 删除该草稿
    deleteDraft(draft.id);
}

// 删除草稿
function deleteDraft(id: number) {
    ElMessageBox.confirm("确定要删除这个草稿吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        drafts.value = drafts.value.filter((d) => d.id !== id);
        ElMessage.success("删除成功");
    });
}

// 发布经验
function publishExperience() {
    if (
        !publishForm.value.title ||
        !publishForm.value.category ||
        !publishForm.value.content
    ) {
        ElMessage.warning("请填写必填项");
        return;
    }

    const newExperience = {
        id: Date.now(),
        title: publishForm.value.title,
        summary: publishForm.value.content.substring(0, 100) + "...",
        content: publishForm.value.content,
        category: publishForm.value.category,
        tags: publishForm.value.tags,
        images: publishForm.value.images.map((f) => f.url || ""),
        author: {
            name: "我",
            avatar: "",
        },
        publishTime: "刚刚",
        likes: 0,
        comments: 0,
        collections: 0,
        collected: false,
    };

    experienceList.value.unshift(newExperience);
    creatorStats.value.published++;

    ElMessage.success("发布成功！");
    showPublishDialog.value = false;

    // 重置表单
    publishForm.value = {
        title: "",
        category: "",
        tags: [],
        content: "",
        images: [],
        video: "",
    };
}
</script>

<style scoped lang="scss">
.experience-sharing-module {
    padding: 20px 0;

    // 发布卡片
    .publish-card {
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

        .quick-categories {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;

            .category-item {
                padding: 15px;
                border: 2px solid #e4e7ed;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    border-color: #409eff;
                    background-color: #ecf5ff;
                    transform: translateY(-2px);
                }

                .el-icon {
                    font-size: 24px;
                    color: #409eff;
                    margin-bottom: 8px;
                }

                span {
                    display: block;
                    font-size: 14px;
                    color: #606266;
                }
            }
        }
    }

    // 经验广场卡片
    .square-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
                color: #333;
            }
        }

        .experience-list {
            .experience-item {
                padding: 20px;
                border-bottom: 1px solid #e4e7ed;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #f5f7fa;
                }

                &:last-child {
                    border-bottom: none;
                }

                .item-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 15px;

                    .author-info {
                        flex: 1;

                        .author-name {
                            font-weight: 600;
                            color: #333;
                            font-size: 14px;
                        }

                        .publish-time {
                            font-size: 12px;
                            color: #909399;
                        }
                    }
                }

                .item-content {
                    .item-title {
                        margin: 0 0 10px 0;
                        font-size: 18px;
                        color: #333;
                        font-weight: 600;
                    }

                    .item-summary {
                        margin: 0 0 15px 0;
                        color: #606266;
                        line-height: 1.6;
                    }

                    .item-images {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                        margin-bottom: 15px;

                        img {
                            width: 100%;
                            height: 120px;
                            object-fit: cover;
                            border-radius: 8px;
                        }
                    }

                    .item-tags {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                }

                .item-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #f0f0f0;

                    .interaction-stats {
                        display: flex;
                        gap: 20px;

                        .stat-item {
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            color: #909399;
                            font-size: 14px;

                            .el-icon {
                                font-size: 16px;
                            }
                        }
                    }
                }
            }
        }
    }

    // 统计数据卡片
    .stats-card {
        margin-bottom: 20px;

        :deep(.el-card__header) {
            h4 {
                margin: 0;
                color: #333;
            }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;

            .stat-box {
                text-align: center;
                padding: 15px;
                background-color: #f5f7fa;
                border-radius: 8px;
            }
        }
    }

    // 草稿箱卡片
    .drafts-card {
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

        .draft-list {
            .draft-item {
                padding: 12px;
                border-bottom: 1px solid #e4e7ed;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #f5f7fa;
                }

                &:last-child {
                    border-bottom: none;
                }

                .draft-title {
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 5px;
                }

                .draft-time {
                    font-size: 12px;
                    color: #909399;
                    margin-bottom: 5px;
                }
            }
        }
    }

    // 收藏夹卡片
    .collections-card {
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

        .group-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .group-items {
            .collection-item {
                padding: 8px 12px;
                font-size: 13px;
                color: #606266;
                cursor: pointer;

                &:hover {
                    color: #409eff;
                }
            }
        }
    }

    // 热门话题卡片
    .topics-card {
        :deep(.el-card__header) {
            h4 {
                margin: 0;
                color: #333;
            }
        }

        .topic-list {
            .topic-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;

                &:last-child {
                    border-bottom: none;
                }

                &:hover .topic-name {
                    color: #409eff;
                }

                .topic-name {
                    font-size: 14px;
                    color: #606266;
                    transition: color 0.3s ease;
                }

                .topic-count {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }
}

// 详情对话框样式
.detail-content {
    .detail-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e4e7ed;

        .detail-author {
            .author-name {
                font-weight: 600;
                color: #333;
                font-size: 16px;
            }

            .publish-info {
                font-size: 13px;
                color: #909399;
                margin-top: 5px;
            }
        }
    }

    .detail-body {
        .detail-text {
            font-size: 15px;
            line-height: 1.8;
            color: #606266;
            margin-bottom: 20px;
        }

        .detail-images {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;

            img {
                width: 100%;
                border-radius: 8px;
            }
        }

        .detail-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
    }

    .detail-interactions {
        display: flex;
        gap: 15px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e4e7ed;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .experience-sharing-module {
        .publish-card {
            .quick-categories {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        .square-card {
            .experience-list {
                .experience-item {
                    .item-images {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            }
        }

        .stats-card {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    }
}
</style>
