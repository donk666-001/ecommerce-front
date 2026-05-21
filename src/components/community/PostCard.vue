<template>
    <el-card class="post-card" shadow="hover">
        <div class="post-header">
            <el-avatar :size="40">{{ post.user.nickname.charAt(0) }}</el-avatar>
            <div class="user-info">
                <div class="nickname-row">
                    <span class="nickname">{{ post.user.nickname }}</span>
                    <el-button
                        v-if="!isCurrentUser"
                        size="small"
                        :type="isFollowing ? 'default' : 'primary'"
                        text
                        @click="$emit('follow', post.user.id)"
                    >
                        {{ isFollowing ? "已关注" : "+ 关注" }}
                    </el-button>
                </div>
                <div class="bio">{{ post.user.bio }}</div>
            </div>
            <div class="post-time">{{ post.time }}</div>
        </div>

        <div class="post-content">
            <p>{{ post.content }}</p>
            <div v-if="post.topic" class="post-topic">
                <el-tag size="small" type="info">#{{ post.topic }}</el-tag>
            </div>
            <div v-if="post.mentions && post.mentions.length > 0" class="post-mentions">
                <el-tag
                    v-for="mention in post.mentions"
                    :key="mention"
                    size="small"
                    type="warning"
                >
                    @{{ mention }}
                </el-tag>
            </div>
        </div>

        <div v-if="post.images && post.images.length > 0" class="post-images">
            <el-image
                v-for="(img, index) in post.images"
                :key="index"
                :src="img"
                :preview-src-list="post.images"
                fit="cover"
                class="post-image"
            />
        </div>

        <div class="post-actions">
            <el-button
                :type="post.liked ? 'primary' : ''"
                text
                @click="$emit('like', post.id)"
            >
                <el-icon><Star /></el-icon>
                <span>{{ post.likes }}</span>
            </el-button>
            <el-button text @click="$emit('comment', post.id)">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ post.comments }}</span>
            </el-button>
            <el-button
                :type="post.collected ? 'warning' : ''"
                text
                @click="$emit('collect', post.id)"
            >
                <el-icon><Collection /></el-icon>
                <span>{{ post.collects }}</span>
            </el-button>
            <el-button text @click="$emit('share', post.id)">
                <el-icon><Share /></el-icon>
                <span>{{ post.shares }}</span>
            </el-button>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Star, ChatDotRound, Collection, Share } from "@element-plus/icons-vue";

interface User {
    id: number;
    nickname: string;
    bio: string;
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

const props = defineProps<{
    post: Post;
}>();

defineEmits<{
    like: [postId: number];
    comment: [postId: number];
    collect: [postId: number];
    share: [postId: number];
    follow: [userId: number];
}>();

const isCurrentUser = computed(() => props.post.user.nickname === "我");
const isFollowing = computed(() => Math.random() > 0.5); // 模拟关注状态
</script>

<style scoped lang="scss">
.post-card {
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .post-header {
        display: flex;
        gap: 12px;
        margin-bottom: 15px;

        .user-info {
            flex: 1;

            .nickname-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;

                .nickname {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                }
            }

            .bio {
                font-size: 13px;
                color: #999;
            }
        }

        .post-time {
            font-size: 12px;
            color: #999;
        }
    }

    .post-content {
        margin-bottom: 15px;

        p {
            margin: 0 0 10px 0;
            font-size: 15px;
            line-height: 1.6;
            color: #333;
        }

        .post-topic,
        .post-mentions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
    }

    .post-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        margin-bottom: 15px;

        .post-image {
            width: 100%;
            height: 150px;
            border-radius: 8px;
            cursor: pointer;
        }
    }

    .post-actions {
        display: flex;
        justify-content: space-around;
        padding-top: 15px;
        border-top: 1px solid #f0f0f0;

        .el-button {
            flex: 1;
            justify-content: center;

            .el-icon {
                margin-right: 5px;
            }
        }
    }
}
</style>
