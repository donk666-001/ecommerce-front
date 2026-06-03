<template>
    <div class="msg-row" :class="{ me: isUser, full: isFullWidth }">
        <div class="msg-avatar" :class="isUser ? 'user' : 'ai'">
            <img
                v-if="showUserAvatarImage"
                :src="userAvatar"
                alt="用户头像"
                class="msg-avatar-img"
                @error="handleUserAvatarError"
            />
            <template v-else>
                {{ isUser ? userInitial : aiAvatarText }}
            </template>
        </div>
        <div class="bubble-wrap">
            <span v-if="!isUser" class="bub-tag" :class="tagClass">
                {{ tagText }}
            </span>
            <div class="bubble" :class="isUser ? 'bub-me' : 'bub-ai'">
                <template v-if="isTextType">
                    <template v-if="isThinking">
                        <span
                            class="thinking-text"
                            :aria-label="thinkingContent"
                        >
                            <span class="thinking-label">{{
                                thinkingLabel
                            }}</span>
                            <span
                                v-if="thinkingDots.length"
                                class="thinking-dots"
                                aria-hidden="true"
                            >
                                <span
                                    v-for="(dot, index) in thinkingDots"
                                    :key="`${dot}-${index}`"
                                    class="thinking-dot"
                                    :style="{
                                        animationDelay: `${index * 0.16}s`,
                                    }"
                                >
                                    {{ dot }}
                                </span>
                            </span>
                        </span>
                    </template>
                    <template v-else>
                        <span
                            class="msg-text"
                            v-for="(line, index) in contentLines"
                            :key="index"
                        >
                            {{ line
                            }}<br v-if="index < contentLines.length - 1" />
                        </span>
                        <span v-if="isStreaming" class="cursor">▍</span>
                    </template>
                    <!-- 轻症/严重非急症：TEXT 下方追加咨询卡片 -->
                    <ConsultHandoffCard
                        v-if="hasHandoff"
                        :structured-json="handoffJson"
                    />
                </template>

                <SleepAnalysisCard
                    v-else-if="contentType === 'SLEEP_ANALYSIS'"
                    :structured-json="structuredJson"
                />
                <WellnessPlanCard
                    v-else-if="contentType === 'WELLNESS_PLAN'"
                    :structured-json="structuredJson"
                />

                <!-- 急症：EmergencyCard（拨打 120） -->
                <EmergencyCard
                    v-else-if="contentType === 'EMERGENCY'"
                    :structured-json="structuredJson"
                />

                <CitationList
                    v-if="hasCitations"
                    :structured-json="structuredJson"
                />
                <ConsultHandoffCard
                    v-else-if="contentType === 'HANDOFF'"
                    :content="content"
                    :structured-json="structuredJson"
                />

                <template v-else-if="contentType === 'ERROR'">
                    <span class="error-text"
                        >{{ errorPrefix }}
                        {{ content || defaultErrorText }}</span
                    >
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import SleepAnalysisCard from "./SleepAnalysisCard.vue";
import WellnessPlanCard from "./WellnessPlanCard.vue";
import CitationList from "./CitationList.vue";
import ConsultHandoffCard from "./ConsultHandoffCard.vue";
import EmergencyCard from "./EmergencyCard.vue";

const props = defineProps<{
    role: "USER" | "ASSISTANT" | "SYSTEM";
    contentType?: string | undefined;
    content?: string | undefined;
    structuredJson?: string | undefined;
    isStreaming?: boolean | undefined;
    isThinking?: boolean | undefined;
    userInitial?: string | undefined;
    userAvatar?: string | undefined;
}>();

const THINKING_PLACEHOLDER = "思考中........";
const aiAvatarText = "智";
const errorPrefix = "⚠️";
const defaultErrorText = "请求处理失败，请重试";

const userAvatarLoadFailed = ref(false);

const isUser = computed(() => props.role === "USER");
const isTextType = computed(
    () => !props.contentType || props.contentType === "TEXT",
);
const showUserAvatarImage = computed(
    () =>
        isUser.value &&
        Boolean(props.userAvatar) &&
        !userAvatarLoadFailed.value,
);
const isThinking = computed(
    () =>
        !isUser.value &&
        Boolean(props.isThinking) &&
        props.contentType !== "ERROR",
);
watch(
    () => props.userAvatar,
    () => {
        userAvatarLoadFailed.value = false;
    },
);
const hasCitations = computed(() => {
    if (!props.structuredJson) return false;
    try {
        const parsed = JSON.parse(props.structuredJson);
        return Array.isArray(parsed.citations) && parsed.citations.length > 0;
    } catch {
        return false;
    }
});

/** structuredJson 中是否包含 handoff 对象（轻症/严重非急症路径写入） */
const hasHandoff = computed(() => {
    if (!props.structuredJson) return false;
    try {
        const parsed = JSON.parse(props.structuredJson);
        return !!parsed?.handoff;
    } catch {
        return false;
    }
});

/** 提取 structuredJson.handoff 子对象并序列化，供 ConsultHandoffCard 解析 */
const handoffJson = computed<string | undefined>(() => {
    if (!props.structuredJson) return undefined;
    try {
        const parsed = JSON.parse(props.structuredJson);
        const handoff = parsed?.handoff;
        return handoff ? JSON.stringify(handoff) : undefined;
    } catch {
        return undefined;
    }
});

const isFullWidth = computed(() =>
    ["SLEEP_ANALYSIS", "WELLNESS_PLAN"].includes(props.contentType ?? ""),
);

function stripMarkdownForDisplay(content: string): string {
    return content
        // 行内编号列表：在序号前插入换行（AI 常输出在同一行）
        .replace(/([。！？])\s+(\d+)\.\s/g, "$1\n$2. ")
        // 代码块
        .replace(/```[\w-]*\r?\n?/g, "")
        .replace(/```/g, "")
        // 行内代码
        .replace(/`([^`]+)`/g, "$1")
        // 图片 ![alt](url)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
        // 链接 [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        // 按行处理
        .split("\n")
        .map((line) => {
            let normalizedLine = line
                // 标题
                .replace(/^\s{0,3}#{1,6}\s*/u, "")
                // 引用
                .replace(/^\s*>\s?/u, "")
                // 列表标记（无序 + 有序）
                .replace(/^\s*(?:[-*+]|(?:\d+\.))\s+/u, "");

            // 表格分隔行（|---|---|）
            if (/^\s*\|?[\s:-]+\|[\s|:-]+\s*$/u.test(normalizedLine)) {
                return "";
            }
            // 表格行：移除首尾管道符并替换中间管道符为空格
            if (/^\s*\|.+\|\s*$/u.test(normalizedLine)) {
                normalizedLine = normalizedLine
                    .replace(/^\s*\|\s*/u, "")
                    .replace(/\s*\|\s*$/u, "")
                    .replace(/\s*\|\s*/gu, "  ");
            }
            // 水平线
            if (/^\s*[-*_]{3,}\s*$/u.test(normalizedLine)) {
                return "";
            }
            return normalizedLine;
        })
        .join("\n")
        // 粗体（双星号/双下划线，必须在斜体之前处理）
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        // 斜体（单星号/单下划线）
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/(?<!\w)_(.+?)_(?!\w)/g, "$1")
        // 删除线
        .replace(/~~(.+?)~~/g, "$1")
        // 换行符统一
        .replace(/\r\n/g, "\n")
        // 压缩多余空行
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

const displayContent = computed(() => {
    const rawContent = props.content ?? "";
    if (isUser.value || props.contentType === "ERROR") return rawContent;
    return stripMarkdownForDisplay(rawContent);
});

const contentLines = computed(() => displayContent.value.split("\n"));

const thinkingContent = computed(
    () => props.content?.trim() || THINKING_PLACEHOLDER,
);

const thinkingParts = computed(() => {
    const normalized = thinkingContent.value;
    const match = normalized.match(/^(.*?)([.。…]+)$/u);
    if (!match || !match[1]) {
        return {
            label: normalized,
            dots: [] as string[],
        };
    }
    return {
        label: match[1],
        dots: Array.from(match[2]),
    };
});

const thinkingLabel = computed(() => thinkingParts.value.label);

const thinkingDots = computed(() => thinkingParts.value.dots);

const tagText = computed(() => {
    switch (props.contentType) {
        case "SLEEP_ANALYSIS":
            return "AI 管家 · 睡眠分析";
        case "WELLNESS_PLAN":
            return "AI 管家 · 制定计划";
        case "HANDOFF":
            return "AI 管家 · 转专家";
        case "EMERGENCY":
            return "AI 管家 · 紧急提示";
        case "ERROR":
            return "AI 管家 · 系统提示";
        default:
            return "AI 管家 · 养生建议";
    }
});

const tagClass = computed(() => {
    switch (props.contentType) {
        case "WELLNESS_PLAN":
            return "tag-gold";
        case "HANDOFF":
            return "tag-cinnabar";
        case "EMERGENCY":
            return "tag-error";
        case "ERROR":
            return "tag-error";
        default:
            return "";
    }
});

function handleUserAvatarError() {
    userAvatarLoadFailed.value = true;
}
</script>

<style scoped lang="scss">
.cursor {
    display: inline-block;
    animation: blink 1s step-start infinite;
    margin-left: 2px;
    color: var(--jade);
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

.msg-text {
    white-space: pre-wrap;
    word-break: break-word;
}

.thinking-text {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 1px;
    white-space: pre-wrap;
    word-break: break-word;
}

.thinking-label {
    color: transparent;
    background: linear-gradient(
        110deg,
        rgba(142, 151, 155, 0.45) 0%,
        rgba(197, 203, 206, 0.98) 45%,
        rgba(142, 151, 155, 0.48) 100%
    );
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation:
        thinking-shimmer 1.8s ease-in-out infinite,
        thinking-breathe 1.8s ease-in-out infinite;
}

.thinking-dots {
    display: inline-flex;
}

.thinking-dot {
    color: #b8b8b8;
    animation: thinking-dot 1.1s ease-in-out infinite;
}

@keyframes thinking-shimmer {
    0% {
        background-position: 120% 50%;
    }
    100% {
        background-position: -120% 50%;
    }
}

@keyframes thinking-breathe {
    0%,
    100% {
        opacity: 0.55;
        filter: drop-shadow(0 0 0 rgba(210, 216, 218, 0));
    }
    50% {
        opacity: 1;
        filter: drop-shadow(0 0 8px rgba(210, 216, 218, 0.32));
    }
}

@keyframes thinking-dot {
    0%,
    100% {
        opacity: 0.25;
        transform: translateY(0);
    }
    50% {
        opacity: 1;
        transform: translateY(-1px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .thinking-label,
    .thinking-dot {
        animation: none;
    }

    .thinking-label {
        color: #b8b8b8;
        background: none;
    }
}

.msg-avatar-img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: inherit;
}

.error-text {
    color: var(--cinnabar);
}
.tag-gold {
    background: var(--gold-soft) !important;
    color: var(--gold-deep) !important;
}
.tag-cinnabar {
    background: var(--cinnabar-soft) !important;
    color: var(--cinnabar) !important;
}
.tag-error {
    background: var(--cinnabar-soft) !important;
    color: var(--cinnabar) !important;
}
</style>
