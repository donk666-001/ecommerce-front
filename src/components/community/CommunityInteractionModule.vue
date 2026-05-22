<template>
    <div class="community-interaction-module">
        <el-row :gutter="20">
            <!-- 左侧：动态信息流 -->
            <el-col :xs="24" :lg="18">
                <!-- 发布入口 -->
                <el-card class="publish-card" shadow="hover">
                    <div class="publish-area">
                        <el-avatar :size="40">我</el-avatar>
                        <el-input
                            v-model="postContent"
                            type="textarea"
                            :rows="3"
                            placeholder="分享你的健康心得、打卡记录或生活感悟..."
                            resize="none"
                        />
                        <div class="publish-actions">
                            <div class="publish-tools">
                                <el-button text @click="triggerImageUpload">
                                    <el-icon><Picture /></el-icon>
                                    图片
                                </el-button>
                                <el-button text @click="insertTopic">
                                    <el-icon>#</el-icon>
                                    话题
                                </el-button>
                                <el-button text @click="insertMention">
                                    <el-icon>@</el-icon>
                                    @提及
                                </el-button>
                            </div>
                            <el-button
                                type="primary"
                                :disabled="!postContent.trim()"
                                @click="publishPost"
                            >
                                发布
                            </el-button>
                        </div>
                    </div>
                </el-card>

                <!-- 信息流Tab切换 -->
                <el-tabs v-model="feedType" class="feed-tabs">
                    <el-tab-pane label="推荐" name="recommend">
                        <div class="feed-list">
                            <div
                                v-for="post in recommendPosts"
                                :key="post.id"
                                class="post-item"
                            >
                                <PostCard
                                    :post="post"
                                    @like="handleLike"
                                    @comment="handleComment"
                                    @collect="handleCollect"
                                    @share="handleShare"
                                    @follow="handleFollow"
                                />
                            </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="关注" name="following">
                        <div class="feed-list">
                            <div
                                v-for="post in followingPosts"
                                :key="post.id"
                                class="post-item"
                            >
                                <PostCard
                                    :post="post"
                                    @like="handleLike"
                                    @comment="handleComment"
                                    @collect="handleCollect"
                                    @share="handleShare"
                                    @follow="handleFollow"
                                />
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-col>

            <!-- 右侧：消息通知 + 关注列表 -->
            <el-col :xs="24" :lg="6">
                <!-- 消息通知中心 -->
                <el-card class="notification-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>🔔 消息通知</h4>
                            <el-badge
                                :value="totalUnreadCount"
                                :hidden="totalUnreadCount === 0"
                            />
                        </div>
                    </template>

                    <el-tabs
                        v-model="notificationTab"
                        class="notification-tabs"
                    >
                        <el-tab-pane name="likes">
                            <template #label>
                                <span>
                                    赞
                                    <el-badge
                                        :value="unreadCounts.likes"
                                        :hidden="unreadCounts.likes === 0"
                                        size="small"
                                    />
                                </span>
                            </template>
                            <div class="notification-list">
                                <div
                                    v-for="notif in notifications.likes"
                                    :key="notif.id"
                                    class="notif-item"
                                    :class="{ unread: !notif.read }"
                                    @click="markAsRead(notif, 'likes')"
                                >
                                    <el-avatar :size="32">{{
                                        notif.user.nickname.charAt(0)
                                    }}</el-avatar>
                                    <div class="notif-content">
                                        <p>
                                            <strong>{{
                                                notif.user.nickname
                                            }}</strong>
                                            {{ notif.action }}
                                        </p>
                                        <span class="notif-time">{{
                                            notif.time
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane name="comments">
                            <template #label>
                                <span>
                                    评论
                                    <el-badge
                                        :value="unreadCounts.comments"
                                        :hidden="unreadCounts.comments === 0"
                                        size="small"
                                    />
                                </span>
                            </template>
                            <div class="notification-list">
                                <div
                                    v-for="notif in notifications.comments"
                                    :key="notif.id"
                                    class="notif-item"
                                    :class="{ unread: !notif.read }"
                                    @click="markAsRead(notif, 'comments')"
                                >
                                    <el-avatar :size="32">{{
                                        notif.user.nickname.charAt(0)
                                    }}</el-avatar>
                                    <div class="notif-content">
                                        <p>
                                            <strong>{{
                                                notif.user.nickname
                                            }}</strong>
                                            {{ notif.action }}
                                        </p>
                                        <span class="notif-time">{{
                                            notif.time
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane name="follows">
                            <template #label>
                                <span>
                                    关注
                                    <el-badge
                                        :value="unreadCounts.follows"
                                        :hidden="unreadCounts.follows === 0"
                                        size="small"
                                    />
                                </span>
                            </template>
                            <div class="notification-list">
                                <div
                                    v-for="notif in notifications.follows"
                                    :key="notif.id"
                                    class="notif-item"
                                    :class="{ unread: !notif.read }"
                                    @click="markAsRead(notif, 'follows')"
                                >
                                    <el-avatar :size="32">{{
                                        notif.user.nickname.charAt(0)
                                    }}</el-avatar>
                                    <div class="notif-content">
                                        <p>
                                            <strong>{{
                                                notif.user.nickname
                                            }}</strong>
                                            {{ notif.action }}
                                        </p>
                                        <el-button
                                            size="small"
                                            type="primary"
                                            text
                                        >
                                            回关
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane name="system">
                            <template #label>
                                <span>
                                    系统
                                    <el-badge
                                        :value="unreadCounts.system"
                                        :hidden="unreadCounts.system === 0"
                                        size="small"
                                    />
                                </span>
                            </template>
                            <div class="notification-list">
                                <div
                                    v-for="notif in notifications.system"
                                    :key="notif.id"
                                    class="notif-item system-notif"
                                    :class="{ unread: !notif.read }"
                                    @click="markAsRead(notif, 'system')"
                                >
                                    <el-icon class="system-icon"
                                        ><Bell
                                    /></el-icon>
                                    <div class="notif-content">
                                        <p>{{ notif.action }}</p>
                                        <span class="notif-time">{{
                                            notif.time
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>

                <!-- 关注列表 -->
                <el-card class="following-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h4>我的关注</h4>
                            <el-button
                                text
                                size="small"
                                @click="showFollowingList"
                            >
                                查看全部
                            </el-button>
                        </div>
                    </template>

                    <div class="following-list">
                        <div
                            v-for="user in followingUsers.slice(0, 5)"
                            :key="user.id"
                            class="following-item"
                        >
                            <el-avatar :size="36">{{
                                user.nickname.charAt(0)
                            }}</el-avatar>
                            <div class="user-info">
                                <div class="nickname">{{ user.nickname }}</div>
                                <div class="bio">{{ user.bio }}</div>
                            </div>
                            <el-button
                                size="small"
                                text
                                @click="openPrivateChat(user)"
                            >
                                <el-icon><ChatDotRound /></el-icon>
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 私信对话框 -->
        <el-drawer
            v-model="chatDrawerVisible"
            :title="`与 ${currentChatUser?.nickname || ''} 聊天`"
            size="400px"
        >
            <div class="chat-container">
                <div class="chat-messages" ref="chatMessagesRef">
                    <div
                        v-for="msg in chatMessages"
                        :key="msg.id"
                        class="message"
                        :class="{ 'message-self': msg.isSelf }"
                    >
                        <el-avatar v-if="!msg.isSelf" :size="32">
                            {{ msg.sender.nickname.charAt(0) }}
                        </el-avatar>
                        <div class="message-content">
                            <div class="message-bubble">{{ msg.content }}</div>
                            <span class="message-time">{{ msg.time }}</span>
                        </div>
                        <el-avatar v-if="msg.isSelf" :size="32">我</el-avatar>
                    </div>
                </div>
                <div class="chat-input">
                    <el-input
                        v-model="chatInput"
                        placeholder="输入消息..."
                        @keyup.enter="sendMessage"
                    >
                        <template #append>
                            <el-button @click="sendMessage">
                                <el-icon><Promotion /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </div>
        </el-drawer>

        <!-- 评论对话框 -->
        <el-dialog
            v-model="commentDialogVisible"
            title="发表评论"
            width="600px"
        >
            <div class="comment-section">
                <div class="original-post">
                    <p>{{ currentPost?.content }}</p>
                </div>
                <el-divider />
                <div class="comment-list">
                    <div
                        v-for="comment in currentComments"
                        :key="comment.id"
                        class="comment-item"
                    >
                        <CommentItem
                            :comment="comment"
                            @reply="handleReplyComment"
                            @like-comment="handleLikeComment"
                        />
                    </div>
                </div>
                <el-divider />
                <div class="comment-input-area">
                    <el-input
                        v-model="newComment"
                        type="textarea"
                        :rows="3"
                        placeholder="写下你的评论..."
                    />
                    <div class="comment-actions">
                        <span class="char-count"
                            >{{ newComment.length }}/500</span
                        >
                        <el-button
                            type="primary"
                            :disabled="!newComment.trim()"
                            @click="submitComment"
                        >
                            发表评论
                        </el-button>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import {
    Picture,
    Bell,
    ChatDotRound,
    Promotion,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PostCard from "./PostCard.vue";
import CommentItem from "./CommentItem.vue";

// 发布内容
const postContent = ref("");

// 信息流类型
const feedType = ref("recommend");

// 通知Tab
const notificationTab = ref("likes");

// 私信抽屉
const chatDrawerVisible = ref(false);
const currentChatUser = ref<any>(null);
const chatInput = ref("");
const chatMessagesRef = ref<HTMLElement | null>(null);

// 评论对话框
const commentDialogVisible = ref(false);
const currentPost = ref<any>(null);
const newComment = ref("");

// 模拟数据 - 推荐动态
interface User {
    id: number;
    nickname: string;
    bio: string;
    avatar?: string;
}

interface Comment {
    id: number;
    user: User;
    content: string;
    time: string;
    likes: number;
    liked: boolean;
    replies: Comment[];
}

interface Post {
    id: number;
    user: User;
    content: string;
    images?: string[];
    time: string;
    likes: number;
    comments: number;
    collects: number;
    shares: number;
    liked: boolean;
    collected: boolean;
    topic?: string;
    mentions?: string[];
}

const recommendPosts = ref<Post[]>([
    {
        id: 1,
        user: { id: 2, nickname: "健康小达人", bio: "分享健康生活经验" },
        content:
            "今天完成了30天早起挑战！从最初的痛苦到现在的自然醒来，真的感受到了坚持的力量。#早起挑战 #健康生活",
        images: ["https://via.placeholder.com/300x200"],
        time: "2小时前",
        likes: 156,
        comments: 23,
        collects: 45,
        shares: 12,
        liked: false,
        collected: false,
        topic: "早起挑战",
        mentions: [],
    },
    {
        id: 2,
        user: { id: 3, nickname: "运动狂人", bio: "每天运动一小时" },
        content:
            "晨跑10公里打卡！今天的配速比昨天快了30秒，继续加油！@健康小达人 一起跑步吗？",
        time: "3小时前",
        likes: 89,
        comments: 15,
        collects: 20,
        shares: 8,
        liked: true,
        collected: false,
        mentions: ["健康小达人"],
    },
]);

const followingPosts = ref<Post[]>([
    {
        id: 3,
        user: { id: 4, nickname: "冥想爱好者", bio: "平静内心，寻找自我" },
        content:
            "今天的冥想练习让我感受到内心的平静。推荐大家试试15分钟的正念冥想。#冥想 #心理健康",
        time: "1小时前",
        likes: 67,
        comments: 10,
        collects: 30,
        shares: 5,
        liked: false,
        collected: true,
        topic: "冥想",
    },
]);

// 关注用户列表
const followingUsers = ref<User[]>([
    { id: 2, nickname: "健康小达人", bio: "分享健康生活经验" },
    { id: 3, nickname: "运动狂人", bio: "每天运动一小时" },
    { id: 4, nickname: "冥想爱好者", bio: "平静内心，寻找自我" },
    { id: 5, nickname: "减脂勇士", bio: "科学减脂中" },
    { id: 6, nickname: "养生专家", bio: "传统养生倡导者" },
]);

// 通知数据
interface Notification {
    id: number;
    user: User;
    action: string;
    time: string;
    read: boolean;
}

const notifications = ref<{
    likes: Notification[];
    comments: Notification[];
    follows: Notification[];
    system: Notification[];
}>({
    likes: [
        {
            id: 1,
            user: { id: 2, nickname: "健康小达人", bio: "" },
            action: "赞了你的动态",
            time: "5分钟前",
            read: false,
        },
        {
            id: 2,
            user: { id: 3, nickname: "运动狂人", bio: "" },
            action: "赞了你的评论",
            time: "1小时前",
            read: false,
        },
    ],
    comments: [
        {
            id: 3,
            user: { id: 4, nickname: "冥想爱好者", bio: "" },
            action: "评论了你的动态：说得好！",
            time: "10分钟前",
            read: false,
        },
    ],
    follows: [
        {
            id: 4,
            user: { id: 5, nickname: "减脂勇士", bio: "" },
            action: "关注了你",
            time: "30分钟前",
            read: false,
        },
    ],
    system: [
        {
            id: 5,
            user: { id: 0, nickname: "系统", bio: "" },
            action: "恭喜你完成7天连续打卡，获得'坚持之星'徽章！",
            time: "2小时前",
            read: false,
        },
    ],
});

const unreadCounts = computed(() => ({
    likes: notifications.value.likes.filter((n) => !n.read).length,
    comments: notifications.value.comments.filter((n) => !n.read).length,
    follows: notifications.value.follows.filter((n) => !n.read).length,
    system: notifications.value.system.filter((n) => !n.read).length,
}));

const totalUnreadCount = computed(() => {
    return (
        unreadCounts.value.likes +
        unreadCounts.value.comments +
        unreadCounts.value.follows +
        unreadCounts.value.system
    );
});

// 当前评论列表
const currentComments = ref<Comment[]>([
    {
        id: 1,
        user: { id: 2, nickname: "健康小达人", bio: "" },
        content: "太棒了！向你学习",
        time: "1小时前",
        likes: 5,
        liked: false,
        replies: [
            {
                id: 2,
                user: { id: 1, nickname: "我", bio: "" },
                content: "谢谢支持！一起加油",
                time: "30分钟前",
                likes: 2,
                liked: false,
                replies: [],
            },
        ],
    },
]);

// 私信消息
const chatMessages = ref<
    Array<{
        id: number;
        sender: User;
        content: string;
        time: string;
        isSelf: boolean;
    }>
>([
    {
        id: 1,
        sender: { id: 2, nickname: "健康小达人", bio: "" },
        content: "你好！看到你的打卡记录很励志",
        time: "10:30",
        isSelf: false,
    },
    {
        id: 2,
        sender: { id: 1, nickname: "我", bio: "" },
        content: "谢谢！一起坚持",
        time: "10:32",
        isSelf: true,
    },
]);

// 发布动态
function publishPost() {
    if (!postContent.value.trim()) {
        ElMessage.warning("请输入内容");
        return;
    }

    const newPost: Post = {
        id: Date.now(),
        user: { id: 1, nickname: "我", bio: "" },
        content: postContent.value,
        time: "刚刚",
        likes: 0,
        comments: 0,
        collects: 0,
        shares: 0,
        liked: false,
        collected: false,
    };

    // 检测话题
    const topicMatch = postContent.value.match(/#([^#]+)#/);
    if (topicMatch) {
        newPost.topic = topicMatch[1];
    }

    // 检测@提及
    const mentionMatches = postContent.value.match(/@([^\s]+)/g);
    if (mentionMatches) {
        newPost.mentions = mentionMatches.map((m) => m.substring(1));
    }

    recommendPosts.value.unshift(newPost);
    postContent.value = "";
    ElMessage.success("发布成功！");
}

// 触发图片上传
function triggerImageUpload() {
    ElMessage.info("图片上传功能开发中...");
}

// 插入话题
function insertTopic() {
    postContent.value += " #话题# ";
}

// 插入@提及
function insertMention() {
    postContent.value += " @用户 ";
}

// 点赞
function handleLike(postId: number) {
    const post = [...recommendPosts.value, ...followingPosts.value].find(
        (p) => p.id === postId,
    );
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        ElMessage.success(post.liked ? "点赞成功" : "已取消点赞");
    }
}

// 评论
function handleComment(postId: number) {
    const post = [...recommendPosts.value, ...followingPosts.value].find(
        (p) => p.id === postId,
    );
    if (post) {
        currentPost.value = post;
        commentDialogVisible.value = true;
    }
}

// 收藏
function handleCollect(postId: number) {
    const post = [...recommendPosts.value, ...followingPosts.value].find(
        (p) => p.id === postId,
    );
    if (post) {
        post.collected = !post.collected;
        post.collects += post.collected ? 1 : -1;
        ElMessage.success(post.collected ? "收藏成功" : "已取消收藏");
    }
}

// 分享
function handleShare(postId: number) {
    ElMessage.success("分享功能开发中...");
}

// 关注/取关
function handleFollow(userId: number) {
    const user = followingUsers.value.find((u) => u.id === userId);
    if (user) {
        ElMessage.success(`已关注 ${user.nickname}`);
    }
}

// 标记为已读
function markAsRead(notif: Notification, type: string) {
    notif.read = true;
    ElMessage.info("跳转到相关内容");
}

// 显示关注列表
function showFollowingList() {
    ElMessage.info("查看完整关注列表");
}

// 打开私信
function openPrivateChat(user: User) {
    currentChatUser.value = user;
    chatDrawerVisible.value = true;
}

// 发送消息
async function sendMessage() {
    if (!chatInput.value.trim()) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    chatMessages.value.push({
        id: Date.now(),
        sender: { id: 1, nickname: "我", bio: "" },
        content: chatInput.value,
        time,
        isSelf: true,
    });

    chatInput.value = "";

    await nextTick();
    if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
}

// 提交评论
function submitComment() {
    if (!newComment.value.trim()) return;

    const comment: Comment = {
        id: Date.now(),
        user: { id: 1, nickname: "我", bio: "" },
        content: newComment.value,
        time: "刚刚",
        likes: 0,
        liked: false,
        replies: [],
    };

    currentComments.value.push(comment);
    newComment.value = "";
    ElMessage.success("评论成功");
}

// 回复评论
function handleReplyComment(comment: Comment) {
    newComment.value = `回复 @${comment.user.nickname}: `;
}

// 点赞评论
function handleLikeComment(commentId: number) {
    const comment = findComment(currentComments.value, commentId);
    if (comment) {
        comment.liked = !comment.liked;
        comment.likes += comment.liked ? 1 : -1;
    }
}

// 递归查找评论
function findComment(comments: Comment[], id: number): Comment | null {
    for (const comment of comments) {
        if (comment.id === id) return comment;
        const found = findComment(comment.replies, id);
        if (found) return found;
    }
    return null;
}
</script>

<style scoped lang="scss">
.community-interaction-module {
    padding: 20px 0;

    // 发布卡片
    .publish-card {
        margin-bottom: 20px;

        .publish-area {
            display: flex;
            gap: 15px;

            .el-textarea {
                flex: 1;
            }

            .publish-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;

                .publish-tools {
                    display: flex;
                    gap: 10px;
                }
            }
        }
    }

    // 信息流
    .feed-tabs {
        :deep(.el-tabs__header) {
            margin-bottom: 20px;
        }

        .feed-list {
            .post-item {
                margin-bottom: 20px;
            }
        }
    }

    // 通知卡片
    .notification-card {
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

        .notification-tabs {
            :deep(.el-tabs__header) {
                margin-bottom: 15px;
            }

            .notification-list {
                max-height: 400px;
                overflow-y: auto;

                .notif-item {
                    display: flex;
                    gap: 10px;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        background-color: #f5f7fa;
                    }

                    &.unread {
                        background-color: #ecf5ff;
                    }

                    &.system-notif {
                        .system-icon {
                            font-size: 32px;
                            color: #409eff;
                        }
                    }

                    .notif-content {
                        flex: 1;

                        p {
                            margin: 0 0 5px 0;
                            font-size: 14px;
                            color: #333;

                            strong {
                                color: #409eff;
                            }
                        }

                        .notif-time {
                            font-size: 12px;
                            color: #999;
                        }
                    }
                }
            }
        }
    }

    // 关注列表
    .following-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h4 {
                margin: 0;
                color: #333;
            }
        }

        .following-list {
            .following-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;

                &:last-child {
                    border-bottom: none;
                }

                .user-info {
                    flex: 1;

                    .nickname {
                        font-size: 14px;
                        font-weight: 600;
                        color: #333;
                    }

                    .bio {
                        font-size: 12px;
                        color: #999;
                    }
                }
            }
        }
    }

    // 私信容器
    .chat-container {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 100px);

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;

            .message {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;

                &.message-self {
                    flex-direction: row-reverse;

                    .message-content {
                        align-items: flex-end;

                        .message-bubble {
                            background-color: #409eff;
                            color: white;
                        }
                    }
                }

                .message-content {
                    display: flex;
                    flex-direction: column;
                    max-width: 70%;

                    .message-bubble {
                        background-color: #f5f7fa;
                        padding: 10px 15px;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #333;
                    }

                    .message-time {
                        font-size: 12px;
                        color: #999;
                        margin-top: 5px;
                    }
                }
            }
        }

        .chat-input {
            padding: 15px;
            border-top: 1px solid #e4e7ed;
        }
    }

    // 评论区
    .comment-section {
        .original-post {
            padding: 15px;
            background-color: #f5f7fa;
            border-radius: 8px;
            margin-bottom: 15px;

            p {
                margin: 0;
                color: #666;
            }
        }

        .comment-list {
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 15px;

            .comment-item {
                margin-bottom: 15px;
            }
        }

        .comment-input-area {
            .char-count {
                font-size: 12px;
                color: #999;
                margin-right: 10px;
            }

            .comment-actions {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-top: 10px;
            }
        }
    }
}
</style>
