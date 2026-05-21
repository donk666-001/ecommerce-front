<template>
    <div class="health-challenge-module">
        <!-- 顶部Tab切换 -->
        <el-tabs v-model="activeTab" class="challenge-tabs">
            <!-- 挑战广场 -->
            <el-tab-pane label="挑战广场" name="square">
                <div class="challenge-square">
                    <!-- 分类筛选 -->
                    <div class="filter-section">
                        <el-radio-group v-model="selectedCategory" size="large">
                            <el-radio-button value="all">全部</el-radio-button>
                            <el-radio-button value="routine">作息</el-radio-button>
                            <el-radio-button value="diet">饮食</el-radio-button>
                            <el-radio-button value="exercise">运动</el-radio-button>
                            <el-radio-button value="emotion">情志</el-radio-button>
                            <el-radio-button value="fat-loss">减脂</el-radio-button>
                        </el-radio-group>
                    </div>

                    <!-- 挑战列表 -->
                    <el-row :gutter="20" class="challenge-list">
                        <el-col
                            v-for="challenge in filteredChallenges"
                            :key="challenge.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                            :lg="6"
                        >
                            <el-card
                                class="challenge-card"
                                shadow="hover"
                                @click="showChallengeDetail(challenge)"
                            >
                                <div class="challenge-cover">
                                    <el-tag
                                        :type="getCategoryType(challenge.category)"
                                        size="small"
                                        class="category-tag"
                                    >
                                        {{ getCategoryName(challenge.category) }}
                                    </el-tag>
                                    <div class="challenge-icon">{{ challenge.icon }}</div>
                                </div>
                                <div class="challenge-info">
                                    <h4>{{ challenge.title }}</h4>
                                    <p class="challenge-desc">{{ challenge.description }}</p>
                                    <div class="challenge-meta">
                                        <div class="meta-item">
                                            <el-icon><User /></el-icon>
                                            <span>{{ challenge.participants }}人参与</span>
                                        </div>
                                        <div class="meta-item">
                                            <el-icon><Clock /></el-icon>
                                            <span>{{ challenge.days }}天</span>
                                        </div>
                                    </div>
                                    <div class="challenge-reward">
                                        <el-tag size="small" type="warning">
                                            <el-icon><Trophy /></el-icon>
                                            {{ challenge.reward }}
                                        </el-tag>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>

            <!-- 我的挑战 -->
            <el-tab-pane label="我的挑战" name="my">
                <div class="my-challenges">
                    <el-empty
                        v-if="joinedChallenges.length === 0"
                        description="暂无参与中的挑战，快去挑战广场报名吧！"
                    />
                    <el-row v-else :gutter="20" class="challenge-list">
                        <el-col
                            v-for="challenge in joinedChallenges"
                            :key="challenge.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                        >
                            <el-card class="my-challenge-card" shadow="hover">
                                <div class="challenge-header">
                                    <div class="challenge-title">
                                        <span class="icon">{{ challenge.icon }}</span>
                                        <h4>{{ challenge.title }}</h4>
                                    </div>
                                    <el-tag
                                        :type="getChallengeStatusType(challenge.status)"
                                        size="small"
                                    >
                                        {{ getChallengeStatusText(challenge.status) }}
                                    </el-tag>
                                </div>

                                <!-- 进度条 -->
                                <div class="progress-section">
                                    <div class="progress-info">
                                        <span>第 {{ challenge.currentDay }}/{{ challenge.days }} 天</span>
                                        <span>完成率 {{ challenge.completionRate }}%</span>
                                    </div>
                                    <el-progress
                                        :percentage="challenge.completionRate"
                                        :color="getProgressColor(challenge.completionRate)"
                                    />
                                </div>

                                <!-- 今日打卡 -->
                                <div class="today-checkin" v-if="challenge.status === 'ongoing'">
                                    <el-checkbox
                                        v-model="challenge.todayChecked"
                                        @change="handleChallengeCheckin(challenge)"
                                    >
                                        今日打卡
                                    </el-checkbox>
                                </div>

                                <!-- 操作按钮 -->
                                <div class="action-buttons">
                                    <el-button
                                        v-if="challenge.status === 'upcoming'"
                                        type="primary"
                                        size="small"
                                        @click="joinChallenge(challenge)"
                                    >
                                        立即报名
                                    </el-button>
                                    <el-button
                                        v-if="challenge.status === 'ongoing'"
                                        type="danger"
                                        size="small"
                                        @click="quitChallenge(challenge)"
                                    >
                                        退出挑战
                                    </el-button>
                                    <el-button
                                        v-if="challenge.status === 'completed'"
                                        type="success"
                                        size="small"
                                        @click="shareAchievement(challenge)"
                                    >
                                        <el-icon><Share /></el-icon>
                                        分享成果
                                    </el-button>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>

            <!-- 排行榜 -->
            <el-tab-pane label="排行榜" name="leaderboard">
                <div class="leaderboard-section">
                    <el-radio-group v-model="leaderboardType" size="large" class="leaderboard-tabs">
                        <el-radio-button value="total">总榜</el-radio-button>
                        <el-radio-button value="friends">好友榜</el-radio-button>
                    </el-radio-group>

                    <el-table :data="leaderboardData" style="width: 100%" stripe>
                        <el-table-column label="排名" width="80">
                            <template #default="{ $index }">
                                <div class="rank-badge" :class="getRankClass($index + 1)">
                                    {{ $index + 1 }}
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="nickname" label="用户" min-width="150">
                            <template #default="{ row }">
                                <div class="user-info">
                                    <el-avatar :size="32">{{ row.nickname.charAt(0) }}</el-avatar>
                                    <span>{{ row.nickname }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="completionRate" label="完成率" width="120">
                            <template #default="{ row }">
                                <el-progress
                                    :percentage="row.completionRate"
                                    :stroke-width="8"
                                    :show-text="false"
                                />
                                <span>{{ row.completionRate }}%</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="completedDays" label="完成天数" width="100" />
                        <el-table-column prop="streakDays" label="连续天数" width="100" />
                    </el-table>
                </div>
            </el-tab-pane>

            <!-- 徽章墙 -->
            <el-tab-pane label="徽章墙" name="badges">
                <div class="badge-wall">
                    <div class="badge-stats">
                        <el-statistic title="已点亮徽章" :value="unlockedBadgesCount">
                            <template #suffix>/ {{ badges.length }}</template>
                        </el-statistic>
                    </div>
                    <el-row :gutter="20" class="badge-grid">
                        <el-col
                            v-for="badge in badges"
                            :key="badge.id"
                            :xs="12"
                            :sm="8"
                            :md="6"
                            :lg="4"
                        >
                            <div class="badge-item" :class="{ unlocked: badge.unlocked }">
                                <div class="badge-icon">
                                    <el-icon v-if="badge.unlocked" :size="40">
                                        <component :is="badge.icon" />
                                    </el-icon>
                                    <el-icon v-else :size="40"><Lock /></el-icon>
                                </div>
                                <div class="badge-info">
                                    <h5>{{ badge.name }}</h5>
                                    <p class="badge-condition">{{ badge.condition }}</p>
                                    <el-tag
                                        v-if="badge.unlocked"
                                        size="small"
                                        type="success"
                                    >
                                        已点亮
                                    </el-tag>
                                    <el-tag v-else size="small" type="info">未解锁</el-tag>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>

            <!-- 组队挑战 -->
            <el-tab-pane label="组队挑战" name="team">
                <div class="team-challenge">
                    <el-alert
                        title="组队挑战说明"
                        type="info"
                        description="邀请好友一起参与挑战，团队完成率共同计算，互相监督，更容易坚持！"
                        show-icon
                        :closable="false"
                        class="team-intro"
                    />

                    <el-row :gutter="20">
                        <el-col :xs="24" :md="16">
                            <el-card class="team-list-card" shadow="hover">
                                <template #header>
                                    <div class="card-header">
                                        <h4>我的战队</h4>
                                        <el-button type="primary" size="small" @click="createTeam">
                                            <el-icon><Plus /></el-icon>
                                            创建战队
                                        </el-button>
                                    </div>
                                </template>

                                <el-empty v-if="teams.length === 0" description="暂未加入任何战队" />

                                <div v-else class="team-items">
                                    <div
                                        v-for="team in teams"
                                        :key="team.id"
                                        class="team-item"
                                    >
                                        <div class="team-header">
                                            <h5>{{ team.name }}</h5>
                                            <el-tag size="small">{{ team.members.length }}/5人</el-tag>
                                        </div>
                                        <div class="team-progress">
                                            <div class="progress-label">
                                                <span>团队完成率</span>
                                                <span>{{ team.completionRate }}%</span>
                                            </div>
                                            <el-progress
                                                :percentage="team.completionRate"
                                                :color="'#409eff'"
                                            />
                                        </div>
                                        <div class="team-members">
                                            <el-avatar-group :max="3">
                                                <el-avatar
                                                    v-for="member in team.members"
                                                    :key="member.id"
                                                    :size="28"
                                                >
                                                    {{ member.nickname.charAt(0) }}
                                                </el-avatar>
                                            </el-avatar-group>
                                        </div>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>

                        <el-col :xs="24" :md="8">
                            <el-card class="invite-card" shadow="hover">
                                <template #header>
                                    <h4>邀请好友</h4>
                                </template>
                                <div class="invite-content">
                                    <el-input
                                        v-model="inviteCode"
                                        placeholder="输入邀请码加入战队"
                                        readonly
                                    >
                                        <template #append>
                                            <el-button @click="copyInviteCode">
                                                <el-icon><CopyDocument /></el-icon>
                                            </el-button>
                                        </template>
                                    </el-input>
                                    <el-divider />n                                    <div class="quick-invite">
                                        <p>快速邀请：</p>
                                        <el-button
                                            v-for="friend in availableFriends"
                                            :key="friend.id"
                                            size="small"
                                            @click="inviteFriend(friend)"
                                        >
                                            {{ friend.nickname }}
                                        </el-button>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>

            <!-- 官方活动 -->
            <el-tab-pane label="官方活动" name="official">
                <div class="official-activities">
                    <el-row :gutter="20">
                        <el-col
                            v-for="activity in officialActivities"
                            :key="activity.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                        >
                            <el-card class="activity-card" shadow="hover">
                                <div class="activity-banner" :style="{ background: activity.color }">
                                    <el-tag type="danger" size="small" class="activity-type-tag">
                                        {{ activity.type }}
                                    </el-tag>
                                    <div class="activity-icon">{{ activity.icon }}</div>
                                </div>
                                <div class="activity-info">
                                    <h4>{{ activity.title }}</h4>
                                    <p>{{ activity.description }}</p>
                                    <div class="activity-time">
                                        <el-icon><Clock /></el-icon>
                                        <span>{{ activity.timeRange }}</span>
                                    </div>
                                    <el-button
                                        type="primary"
                                        class="join-btn"
                                        @click="joinActivity(activity)"
                                    >
                                        立即参与
                                    </el-button>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>
        </el-tabs>

        <!-- 挑战详情对话框 -->
        <el-dialog
            v-model="detailDialogVisible"
            :title="selectedChallenge?.title || '挑战详情'"
            width="700px"
        >
            <div v-if="selectedChallenge" class="challenge-detail">
                <div class="detail-header">
                    <div class="detail-icon">{{ selectedChallenge.icon }}</div>
                    <div class="detail-title">
                        <h3>{{ selectedChallenge.title }}</h3>
                        <el-tag :type="getCategoryType(selectedChallenge.category)">
                            {{ getCategoryName(selectedChallenge.category) }}
                        </el-tag>
                    </div>
                </div>

                <el-descriptions :column="2" border>
                    <el-descriptions-item label="挑战周期">
                        {{ selectedChallenge.days }} 天
                    </el-descriptions-item>
                    <el-descriptions-item label="参与人数">
                        {{ selectedChallenge.participants }} 人
                    </el-descriptions-item>
                    <el-descriptions-item label="开始时间">
                        {{ selectedChallenge.startDate }}
                    </el-descriptions-item>
                    <el-descriptions-item label="结束时间">
                        {{ selectedChallenge.endDate }}
                    </el-descriptions-item>
                </el-descriptions>

                <div class="detail-section">
                    <h4>挑战规则</h4>
                    <p>{{ selectedChallenge.rules }}</p>
                </div>

                <div class="detail-section">
                    <h4>打卡要求</h4>
                    <ul>
                        <li v-for="(req, index) in selectedChallenge.checkinRequirements"
                            :key="index">
                            {{ req }}
                        </li>
                    </ul>
                </div>

                <div class="detail-section">
                    <h4>完成奖励</h4>
                    <div class="rewards">
                        <el-tag size="large" type="warning">
                            <el-icon><Trophy /></el-icon>
                            {{ selectedChallenge.reward }}
                        </el-tag>
                        <el-badge
                            v-if="selectedChallenge.badge"
                            :value="selectedChallenge.badge"
                            type="success"
                            class="reward-badge"
                        />
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="detailDialogVisible = false">关闭</el-button>
                <el-button
                    v-if="selectedChallenge && !selectedChallenge.joined"
                    type="primary"
                    @click="joinChallengeFromDetail"
                >
                    立即报名
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
    User,
    Clock,
    Trophy,
    Share,
    Lock,
    Plus,
    CopyDocument,
    Medal,
    Timer,
    Star,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

// Tab切换
const activeTab = ref("square");

// 分类筛选
const selectedCategory = ref("all");

// 挑战数据类型
interface Challenge {
    id: number;
    title: string;
    icon: string;
    category: string;
    description: string;
    days: number;
    participants: number;
    reward: string;
    badge?: string;
    rules: string;
    checkinRequirements: string[];
    startDate: string;
    endDate: string;
    status?: "upcoming" | "ongoing" | "completed";
    currentDay?: number;
    completionRate?: number;
    todayChecked?: boolean;
    joined?: boolean;
}

// 挑战列表数据（硬编码）
const challenges = ref<Challenge[]>([
    {
        id: 1,
        title: "21天早起挑战",
        icon: "🌅",
        category: "routine",
        description: "每天7点前起床，养成早起好习惯",
        days: 21,
        participants: 1256,
        reward: "早起达人称号 + 100元气积分",
        badge: "早起达人",
        rules: "连续21天在7:00前打卡起床，中途不得中断",
        checkinRequirements: [
            "每天早上7:00前完成打卡",
            "上传起床照片或截图",
            "可关联睡眠数据验证",
        ],
        startDate: "2026-05-25",
        endDate: "2026-06-14",
        joined: false,
    },
    {
        id: 2,
        title: "7天减糖挑战",
        icon: "🥗",
        category: "diet",
        description: "戒掉添加糖，健康饮食从现在开始",
        days: 7,
        participants: 892,
        reward: "健康饮食家 + 50元气积分",
        badge: "减糖先锋",
        rules: "7天内不摄入任何添加糖，包括饮料、甜点等",
        checkinRequirements: [
            "每日三餐拍照记录",
            "标注食物成分",
            "记录饮水量",
        ],
        startDate: "2026-05-22",
        endDate: "2026-05-28",
        joined: true,
        status: "ongoing",
        currentDay: 3,
        completionRate: 43,
        todayChecked: false,
    },
    {
        id: 3,
        title: "30天跑步挑战",
        icon: "🏃",
        category: "exercise",
        description: "每天跑步3公里，塑造健康体魄",
        days: 30,
        participants: 2341,
        reward: "跑步健将 + 200元气积分 + 运动优惠券",
        badge: "跑步健将",
        rules: "每天跑步不少于3公里，需上传运动轨迹",
        checkinRequirements: [
            "使用运动APP记录轨迹",
            "截图上传跑步数据",
            "标注跑步时长和配速",
        ],
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        status: "upcoming",
        joined: false,
    },
    {
        id: 4,
        title: "14天冥想挑战",
        icon: "🧘",
        category: "emotion",
        description: "每天冥想15分钟，平静心灵",
        days: 14,
        participants: 567,
        reward: "心灵导师 + 80元气积分",
        badge: "冥想大师",
        rules: "每天冥想不少于15分钟，记录感受",
        checkinRequirements: [
            "使用冥想APP计时",
            "记录冥想前后心情",
            "可选：分享冥想感悟",
        ],
        startDate: "2026-05-20",
        endDate: "2026-06-02",
        joined: true,
        status: "ongoing",
        currentDay: 10,
        completionRate: 71,
        todayChecked: true,
    },
    {
        id: 5,
        title: "30天减脂挑战",
        icon: "💪",
        category: "fat-loss",
        description: "科学减脂，目标减重5kg",
        days: 30,
        participants: 3456,
        reward: "减脂达人 + 300元气积分 + 健身卡优惠券",
        badge: "减脂王者",
        rules: "30天内减重5kg，每周称重记录",
        checkinRequirements: [
            "每日记录体重变化",
            "上传饮食照片",
            "记录运动消耗",
            "每周测量围度",
        ],
        startDate: "2026-05-15",
        endDate: "2026-06-13",
        joined: true,
        status: "ongoing",
        currentDay: 15,
        completionRate: 50,
        todayChecked: false,
    },
    {
        id: 6,
        title: "早睡养生挑战",
        icon: "🌙",
        category: "routine",
        description: "每晚23点前入睡，养肝护肾",
        days: 14,
        participants: 1890,
        reward: "养生专家 + 100元气积分",
        badge: "早睡达人",
        rules: "连续14天在23:00前入睡",
        checkinRequirements: [
            "晚上23:00前打卡睡觉",
            "可关联睡眠监测数据",
            "早上汇报睡眠质量",
        ],
        startDate: "2026-05-28",
        endDate: "2026-06-10",
        status: "upcoming",
        joined: false,
    },
]);

// 已参与的挑战
const joinedChallenges = computed(() => {
    return challenges.value.filter((c) => c.joined);
});

// 过滤后的挑战列表
const filteredChallenges = computed(() => {
    if (selectedCategory.value === "all") {
        return challenges.value;
    }
    return challenges.value.filter((c) => c.category === selectedCategory.value);
});

// 挑战详情
const detailDialogVisible = ref(false);
const selectedChallenge = ref<Challenge | null>(null);

// 排行榜类型
const leaderboardType = ref("total");

// 排行榜数据（硬编码）
const leaderboardData = ref([
    { nickname: "健康小达人", completionRate: 95, completedDays: 57, streakDays: 28 },
    { nickname: "运动狂人", completionRate: 92, completedDays: 55, streakDays: 25 },
    { nickname: "早起鸟儿", completionRate: 88, completedDays: 52, streakDays: 21 },
    { nickname: "冥想爱好者", completionRate: 85, completedDays: 51, streakDays: 18 },
    { nickname: "减脂勇士", completionRate: 82, completedDays: 49, streakDays: 15 },
    { nickname: "养生专家", completionRate: 78, completedDays: 46, streakDays: 12 },
    { nickname: "跑步健将", completionRate: 75, completedDays: 45, streakDays: 10 },
    { nickname: "饮食管家", completionRate: 72, completedDays: 43, streakDays: 8 },
]);

// 徽章数据（硬编码）
const badges = ref([
    { id: 1, name: "早起达人", icon: "Timer", condition: "完成21天早起挑战", unlocked: true },
    { id: 2, name: "减糖先锋", icon: "Star", condition: "完成7天减糖挑战", unlocked: true },
    { id: 3, name: "跑步健将", icon: "Trophy", condition: "完成30天跑步挑战", unlocked: false },
    { id: 4, name: "冥想大师", icon: "Medal", condition: "完成14天冥想挑战", unlocked: false },
    { id: 5, name: "减脂王者", icon: "Trophy", condition: "完成30天减脂挑战", unlocked: false },
    { id: 6, name: "早睡达人", icon: "Timer", condition: "完成14天早睡挑战", unlocked: false },
    { id: 7, name: "百日毅力", icon: "Medal", condition: "连续打卡100天", unlocked: false },
    { id: 8, name: "团队领袖", icon: "Star", condition: "创建并带领团队完成挑战", unlocked: false },
]);

const unlockedBadgesCount = computed(() => {
    return badges.value.filter((b) => b.unlocked).length;
});

// 战队数据（硬编码）
interface Team {
    id: number;
    name: string;
    members: { id: number; nickname: string }[];
    completionRate: number;
}

const teams = ref<Team[]>([
    {
        id: 1,
        name: "早起小分队",
        members: [
            { id: 1, nickname: "我" },
            { id: 2, nickname: "小明" },
            { id: 3, nickname: "小红" },
            { id: 4, nickname: "小刚" },
        ],
        completionRate: 75,
    },
]);

const inviteCode = ref("HEALTH2026XYZ");

const availableFriends = ref([
    { id: 5, nickname: "小李" },
    { id: 6, nickname: "小王" },
    { id: 7, nickname: "小张" },
]);

// 官方活动数据（硬编码）
interface Activity {
    id: number;
    title: string;
    icon: string;
    type: string;
    description: string;
    timeRange: string;
    color: string;
}

const officialActivities = ref<Activity[]>([
    {
        id: 1,
        title: "立夏养生挑战",
        icon: "☀️",
        type: "节气活动",
        description: "顺应节气，夏季养心，参与养生打卡赢好礼",
        timeRange: "2026-05-05 ~ 2026-05-20",
        color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
        id: 2,
        title: "品牌联名·健身月",
        icon: "🏋️",
        type: "品牌联名",
        description: "与知名品牌合作，完成健身挑战赢取品牌优惠券",
        timeRange: "2026-06-01 ~ 2026-06-30",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
        id: 3,
        title: "端午安康挑战",
        icon: "🎋",
        type: "节日活动",
        description: "端午节特别活动，传统养生与现代健康结合",
        timeRange: "2026-06-10 ~ 2026-06-25",
        color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
]);

// 获取分类名称
function getCategoryName(category: string): string {
    const map: Record<string, string> = {
        routine: "作息",
        diet: "饮食",
        exercise: "运动",
        emotion: "情志",
        "fat-loss": "减脂",
    };
    return map[category] || category;
}

// 获取分类标签类型
function getCategoryType(category: string): string {
    const map: Record<string, string> = {
        routine: "success",
        diet: "warning",
        exercise: "primary",
        emotion: "danger",
        "fat-loss": "info",
    };
    return map[category] || "";
}

// 显示挑战详情
function showChallengeDetail(challenge: Challenge) {
    selectedChallenge.value = challenge;
    detailDialogVisible.value = true;
}

// 从详情页报名
function joinChallengeFromDetail() {
    if (selectedChallenge.value) {
        joinChallenge(selectedChallenge.value);
        detailDialogVisible.value = false;
    }
}

// 报名挑战
function joinChallenge(challenge: Challenge) {
    ElMessageBox.confirm(`确定要报名「${challenge.title}」吗？`, "报名确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
    })
        .then(() => {
            challenge.joined = true;
            challenge.status = "upcoming";
            challenge.currentDay = 0;
            challenge.completionRate = 0;
            challenge.todayChecked = false;
            ElMessage.success("报名成功！挑战开始前会提醒您");
        })
        .catch(() => {});
}

// 退出挑战
function quitChallenge(challenge: Challenge) {
    ElMessageBox.confirm(`确定要退出「${challenge.title}」吗？退出后将无法恢复`, "退出确认", {
        confirmButtonText: "确定退出",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(() => {
            challenge.joined = false;
            challenge.status = undefined;
            ElMessage.info("已退出挑战");
        })
        .catch(() => {});
}

// 挑战打卡
function handleChallengeCheckin(challenge: Challenge) {
    if (challenge.todayChecked) {
        ElMessage.success("打卡成功！继续加油！");
        // 模拟更新进度
        challenge.currentDay = (challenge.currentDay || 0) + 1;
        challenge.completionRate = Math.round(
            ((challenge.currentDay || 0) / challenge.days) * 100
        );
    }
}

// 获取挑战状态类型
function getChallengeStatusType(status?: string): string {
    const map: Record<string, string> = {
        upcoming: "warning",
        ongoing: "success",
        completed: "info",
    };
    return map[status || ""] || "";
}

// 获取挑战状态文本
function getChallengeStatusText(status?: string): string {
    const map: Record<string, string> = {
        upcoming: "即将开始",
        ongoing: "进行中",
        completed: "已完成",
    };
    return map[status || ""] || "";
}

// 获取进度条颜色
function getProgressColor(rate: number): string {
    if (rate >= 80) return "#67c23a";
    if (rate >= 50) return "#409eff";
    if (rate >= 30) return "#e6a23c";
    return "#f56c6c";
}

// 分享成果
function shareAchievement(challenge: Challenge) {
    ElMessage.success(`正在生成「${challenge.title}」的成就海报...`);
    // 实际项目中可以使用 html2canvas 生成海报
}

// 获取排名样式类
function getRankClass(rank: number): string {
    if (rank === 1) return "rank-first";
    if (rank === 2) return "rank-second";
    if (rank === 3) return "rank-third";
    return "rank-normal";
}

// 创建战队
function createTeam() {
    ElMessage.info("创建战队功能开发中...");
}

// 复制邀请码
function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode.value);
    ElMessage.success("邀请码已复制到剪贴板");
}

// 邀请好友
function inviteFriend(friend: { id: number; nickname: string }) {
    ElMessage.success(`已向 ${friend.nickname} 发送邀请`);
}

// 参与活动
function joinActivity(activity: Activity) {
    ElMessage.success(`已报名「${activity.title}」，活动开始前会提醒您`);
}
</script>

<style scoped lang="scss">
.health-challenge-module {
    padding: 20px 0;

    .challenge-tabs {
        :deep(.el-tabs__header) {
            margin-bottom: 30px;
        }

        :deep(.el-tabs__item) {
            font-size: 16px;
            font-weight: 500;
            padding: 0 30px;
        }
    }

    // 挑战广场
    .challenge-square {
        .filter-section {
            margin-bottom: 30px;
            text-align: center;
        }

        .challenge-list {
            .challenge-card {
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 20px;

                &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
                }

                :deep(.el-card__body) {
                    padding: 0;
                }

                .challenge-cover {
                    height: 120px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    border-radius: 4px 4px 0 0;

                    .category-tag {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                    }

                    .challenge-icon {
                        font-size: 48px;
                    }
                }

                .challenge-info {
                    padding: 15px;

                    h4 {
                        margin: 0 0 10px 0;
                        font-size: 16px;
                        color: #333;
                    }

                    .challenge-desc {
                        font-size: 13px;
                        color: #666;
                        margin-bottom: 12px;
                        min-height: 36px;
                    }

                    .challenge-meta {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 10px;

                        .meta-item {
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            font-size: 12px;
                            color: #999;

                            .el-icon {
                                font-size: 14px;
                            }
                        }
                    }

                    .challenge-reward {
                        .el-tag {
                            .el-icon {
                                margin-right: 4px;
                            }
                        }
                    }
                }
            }
        }
    }

    // 我的挑战
    .my-challenges {
        .my-challenge-card {
            margin-bottom: 20px;

            .challenge-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;

                .challenge-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .icon {
                        font-size: 24px;
                    }

                    h4 {
                        margin: 0;
                        font-size: 16px;
                        color: #333;
                    }
                }
            }

            .progress-section {
                margin-bottom: 15px;

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: #666;
                }
            }

            .today-checkin {
                margin-bottom: 15px;
                padding: 10px;
                background-color: #f5f7fa;
                border-radius: 4px;
            }

            .action-buttons {
                text-align: right;
            }
        }
    }

    // 排行榜
    .leaderboard-section {
        .leaderboard-tabs {
            margin-bottom: 20px;
            text-align: center;
        }

        .rank-badge {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;

            &.rank-first {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #333;
            }

            &.rank-second {
                background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
                color: #333;
            }

            &.rank-third {
                background: linear-gradient(135deg, #cd7f32 0%, #d4a574 100%);
                color: #333;
            }

            &.rank-normal {
                background-color: #e4e7ed;
                color: #666;
            }
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }

    // 徽章墙
    .badge-wall {
        .badge-stats {
            text-align: center;
            margin-bottom: 30px;
        }

        .badge-grid {
            .badge-item {
                border: 2px solid #e4e7ed;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
                margin-bottom: 20px;

                &.unlocked {
                    border-color: #67c23a;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%);
                }

                &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .badge-icon {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 15px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f5f7fa;

                    .unlocked & {
                        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
                        color: white;
                    }
                }

                .badge-info {
                    h5 {
                        margin: 0 0 8px 0;
                        font-size: 14px;
                        color: #333;
                    }

                    .badge-condition {
                        font-size: 12px;
                        color: #999;
                        margin-bottom: 10px;
                        min-height: 32px;
                    }
                }
            }
        }
    }

    // 组队挑战
    .team-challenge {
        .team-intro {
            margin-bottom: 20px;
        }

        .team-list-card {
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                h4 {
                    margin: 0;
                    color: #333;
                }
            }

            .team-items {
                .team-item {
                    padding: 15px;
                    border: 1px solid #e4e7ed;
                    border-radius: 8px;
                    margin-bottom: 15px;

                    .team-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;

                        h5 {
                            margin: 0;
                            font-size: 16px;
                            color: #333;
                        }
                    }

                    .team-progress {
                        margin-bottom: 12px;

                        .progress-label {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 8px;
                            font-size: 13px;
                            color: #666;
                        }
                    }

                    .team-members {
                        display: flex;
                        justify-content: flex-end;
                    }
                }
            }
        }

        .invite-card {
            .invite-content {
                .quick-invite {
                    p {
                        margin-bottom: 10px;
                        color: #666;
                        font-size: 14px;
                    }

                    .el-button {
                        margin-right: 8px;
                        margin-bottom: 8px;
                    }
                }
            }
        }
    }

    // 官方活动
    .official-activities {
        .activity-card {
            margin-bottom: 20px;
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
            }

            :deep(.el-card__body) {
                padding: 0;
            }

            .activity-banner {
                height: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                border-radius: 4px 4px 0 0;

                .activity-type-tag {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                }

                .activity-icon {
                    font-size: 56px;
                }
            }

            .activity-info {
                padding: 20px;

                h4 {
                    margin: 0 0 10px 0;
                    font-size: 16px;
                    color: #333;
                }

                p {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 12px;
                    min-height: 36px;
                }

                .activity-time {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: #999;
                    margin-bottom: 15px;

                    .el-icon {
                        font-size: 14px;
                    }
                }

                .join-btn {
                    width: 100%;
                }
            }
        }
    }

    // 挑战详情
    .challenge-detail {
        .detail-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;

            .detail-icon {
                font-size: 56px;
            }

            .detail-title {
                h3 {
                    margin: 0 0 10px 0;
                    font-size: 20px;
                    color: #333;
                }
            }
        }

        .detail-section {
            margin-top: 20px;

            h4 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #333;
                border-left: 4px solid #409eff;
                padding-left: 10px;
            }

            p {
                font-size: 14px;
                color: #666;
                line-height: 1.6;
            }

            ul {
                margin: 0;
                padding-left: 20px;

                li {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.8;
                }
            }

            .rewards {
                display: flex;
                gap: 15px;
                align-items: center;

                .el-tag {
                    .el-icon {
                        margin-right: 5px;
                    }
                }

                .reward-badge {
                    :deep(.el-badge__content) {
                        font-size: 12px;
                    }
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .health-challenge-module {
        .challenge-square {
            .challenge-list {
                .challenge-card {
                    margin-bottom: 15px;
                }
            }
        }

        .my-challenges {
            .my-challenge-card {
                margin-bottom: 15px;
            }
        }

        .badge-wall {
            .badge-grid {
                .badge-item {
                    margin-bottom: 15px;
                }
            }
        }

        .official-activities {
            .activity-card {
                margin-bottom: 15px;
            }
        }
    }
}
</style>
