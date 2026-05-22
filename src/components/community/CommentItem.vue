<template>
    <div class="comment-item">
        <div class="comment-header">
            <el-avatar :size="32">{{
                comment.user.nickname.charAt(0)
            }}</el-avatar>
            <div class="comment-info">
                <div class="user-row">
                    <span class="nickname">{{ comment.user.nickname }}</span>
                    <span v-if="isAuthor" class="author-badge">作者</span>
                    <span class="time">{{ comment.time }}</span>
                </div>
                <p class="content">{{ comment.content }}</p>
            </div>
        </div>

        <div class="comment-actions">
            <el-button
                size="small"
                text
                @click="$emit('likeComment', comment.id)"
            >
                <el-icon :class="{ liked: comment.liked }"><Star /></el-icon>
                <span>{{ comment.likes || "点赞" }}</span>
            </el-button>
            <el-button size="small" text @click="$emit('reply', comment)">
                <el-icon><ChatLineRound /></el-icon>
                回复
            </el-button>
        </div>

        <!-- 递归显示回复 -->
        <div
            v-if="comment.replies && comment.replies.length > 0"
            class="replies"
        >
            <CommentItem
                v-for="reply in comment.replies"
                :key="reply.id"
                :comment="reply"
                @reply="$emit('reply', $event)"
                @like-comment="$emit('likeComment', $event)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Star, ChatLineRound } from "@element-plus/icons-vue";

interface Comment {
    id: number;
    user: {
        id: number;
        nickname: string;
        bio: string;
    };
    content: string;
    time: string;
    likes: number;
    liked: boolean;
    replies: Comment[];
}

const props = defineProps<{
    comment: Comment;
}>();

defineEmits<{
    reply: [comment: Comment];
    likeComment: [commentId: number];
}>();

const isAuthor = computed(() => props.comment.user.nickname === "我");
</script>

<style scoped lang="scss">
.comment-item {
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
        background-color: #f9fafb;
    }

    .comment-header {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;

        .comment-info {
            flex: 1;

            .user-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 5px;

                .nickname {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                .author-badge {
                    padding: 2px 6px;
                    background-color: #409eff;
                    color: white;
                    font-size: 11px;
                    border-radius: 4px;
                }

                .time {
                    font-size: 12px;
                    color: #999;
                }
            }

            .content {
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
                color: #666;
            }
        }
    }

    .comment-actions {
        display: flex;
        gap: 15px;
        margin-left: 42px;
        margin-bottom: 10px;

        .el-button {
            padding: 5px 10px;

            .el-icon {
                margin-right: 4px;

                &.liked {
                    color: #e6a23c;
                }
            }
        }
    }

    .replies {
        margin-left: 42px;
        padding-left: 15px;
        border-left: 2px solid #e4e7ed;

        .comment-item {
            margin-top: 10px;
        }
    }
}
</style>
