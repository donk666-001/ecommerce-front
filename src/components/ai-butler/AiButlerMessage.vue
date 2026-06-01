<template>
    <div class="msg-row" :class="{ me: isUser, full: isFullWidth }">
        <div class="msg-avatar" :class="isUser ? 'user' : 'ai'">
            {{ isUser ? userInitial : aiAvatarText }}
        </div>
        <div class="bubble-wrap">
            <span v-if="!isUser" class="bub-tag" :class="tagClass">
                {{ tagText }}
            </span>
            <div class="bubble" :class="isUser ? 'bub-me' : 'bub-ai'">
                <template v-if="isTextType">
                    <template v-if="isThinking">
                        <span class="thinking-text">{{ thinkingContent }}</span>
                    </template>
                    <template v-else>
                        <span class="msg-text" v-for="(line, index) in contentLines" :key="index">
                            {{ line }}<br v-if="index < contentLines.length - 1" />
                        </span>
                        <span v-if="isStreaming" class="cursor">▍</span>
                    </template>
                    <!-- 轻症/严重非急症：TEXT 下方追加咨询卡片 -->
                    <ConsultHandoffCard v-if="hasHandoff" :structured-json="handoffJson" />
                </template>

                <SleepAnalysisCard v-else-if="contentType === 'SLEEP_ANALYSIS'" :structured-json="structuredJson" />
                <WellnessPlanCard v-else-if="contentType === 'WELLNESS_PLAN'" :structured-json="structuredJson" />

                <!-- 急症：EmergencyCard（拨打 120） -->
                <EmergencyCard v-else-if="contentType === 'EMERGENCY'" :structured-json="structuredJson" />

                <CitationList v-if="hasCitations" :structured-json="structuredJson" />
                <ConsultHandoffCard
                    v-else-if="contentType === 'HANDOFF'"
                    :content="content"
                    :structured-json="structuredJson"
                />

                <template v-else-if="contentType === 'ERROR'">
                    <span class="error-text">{{ errorPrefix }} {{ content || defaultErrorText }}</span>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
}>();

const THINKING_PLACEHOLDER = "思考中........";
const aiAvatarText = "智";
const errorPrefix = "⚠️";
const defaultErrorText = "请求处理失败，请重试";

const isUser = computed(() => props.role === "USER");
const isTextType = computed(() =>
    !props.contentType || props.contentType === "TEXT",
);
const isThinking = computed(() =>
    !isUser.value && Boolean(props.isThinking) && props.contentType !== "ERROR",
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
        .replace(/```[\w-]*\r?\n?/g, "")
        .replace(/```/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .split("\n")
        .map((line) => {
            const normalizedLine = line
                .replace(/^\s{0,3}#{1,6}\s*/u, "")
                .replace(/^\s*>\s?/u, "")
                .replace(/^\s*(?:[-*+]|(?:\d+\.))\s+/u, "");

            return /^\s*[-*_]{3,}\s*$/u.test(normalizedLine) ? "" : normalizedLine;
        })
        .join("\n")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

const displayContent = computed(() => {
    const rawContent = props.content ?? "";
    if (isUser.value || props.contentType === "ERROR") return rawContent;
    return stripMarkdownForDisplay(rawContent);
});

const contentLines = computed(() =>
    displayContent.value.split("\n"),
);

const thinkingContent = computed(() =>
    props.content?.trim() || THINKING_PLACEHOLDER,
);

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
</script>

<style scoped lang="scss">
.cursor {
    display: inline-block;
    animation: blink 1s step-start infinite;
    margin-left: 2px;
    color: var(--jade);
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

.msg-text {
    white-space: pre-wrap;
    word-break: break-word;
}

.thinking-text {
    color: #b8b8b8;
    white-space: pre-wrap;
    word-break: break-word;
}

.error-text { color: var(--cinnabar); }
.tag-gold { background: var(--gold-soft) !important; color: var(--gold-deep) !important; }
.tag-cinnabar { background: var(--cinnabar-soft) !important; color: var(--cinnabar) !important; }
.tag-error { background: var(--cinnabar-soft) !important; color: var(--cinnabar) !important; }
</style>
