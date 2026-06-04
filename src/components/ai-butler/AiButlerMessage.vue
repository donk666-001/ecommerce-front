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
                        <ProductRecommendationCard
                            v-if="hasProductRecommendations"
                            :content="displayContent"
                            :structured-json="structuredJson"
                        />
                        <template v-else>
                            <span
                                v-for="(line, index) in contentLines"
                                :key="index"
                                class="msg-text"
                            >
                                {{ line
                                }}<br v-if="index < contentLines.length - 1" />
                            </span>
                            <span v-if="isStreaming" class="cursor">▋</span>
                        </template>
                    </template>

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
                    <span class="error-text">
                        {{ errorPrefix }} {{ content || defaultErrorText }}
                    </span>
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
import ProductRecommendationCard from "./ProductRecommendationCard.vue";
import { hasProductRecommendationItems } from "./productRecommendation";

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
    () =>
        !props.contentType ||
        props.contentType === "TEXT" ||
        props.contentType === "PRODUCT_RECOMMENDATION",
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

const parsedStructuredJson = computed<Record<string, unknown> | null>(() => {
    if (!props.structuredJson) return null;

    try {
        return JSON.parse(props.structuredJson) as Record<string, unknown>;
    } catch {
        return null;
    }
});

const hasCitations = computed(() => {
    const parsed = parsedStructuredJson.value;
    return Boolean(
        parsed &&
            Array.isArray((parsed as { citations?: unknown[] }).citations) &&
            (parsed as { citations?: unknown[] }).citations!.length > 0,
    );
});

const hasHandoff = computed(() => {
    const parsed = parsedStructuredJson.value;
    return Boolean(parsed && (parsed as { handoff?: unknown }).handoff);
});

const handoffJson = computed<string | undefined>(() => {
    const parsed = parsedStructuredJson.value;
    if (!parsed) return undefined;

    const handoff = (parsed as { handoff?: unknown }).handoff;
    return handoff ? JSON.stringify(handoff) : undefined;
});

const hasProductRecommendations = computed(() =>
    hasProductRecommendationItems(parsedStructuredJson.value),
);

const isFullWidth = computed(
    () =>
        ["SLEEP_ANALYSIS", "WELLNESS_PLAN", "PRODUCT_RECOMMENDATION"].includes(
            props.contentType ?? "",
        ) || hasProductRecommendations.value,
);

function stripMarkdownForDisplay(content: string): string {
    return content
        .replace(/([。！；])\s+(\d+)\.\s/g, "$1\n$2. ")
        .replace(/```[\w-]*\r?\n?/g, "")
        .replace(/```/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .split("\n")
        .map((line) => {
            let normalizedLine = line
                .replace(/^\s{0,3}#{1,6}\s*/u, "")
                .replace(/^\s*>\s?/u, "")
                .replace(/^\s*(?:[-*+]|(?:\d+\.))\s+/u, "");

            if (/^\s*\|?[\s:-]+\|[\s|:-]+\s*$/u.test(normalizedLine)) {
                return "";
            }

            if (/^\s*\|.+\|\s*$/u.test(normalizedLine)) {
                normalizedLine = normalizedLine
                    .replace(/^\s*\|\s*/u, "")
                    .replace(/\s*\|\s*$/u, "")
                    .replace(/\s*\|\s*/gu, "  ");
            }

            if (/^\s*[-*_]{3,}\s*$/u.test(normalizedLine)) {
                return "";
            }

            return normalizedLine;
        })
        .join("\n")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/(?<!\w)_(.+?)_(?!\w)/g, "$1")
        .replace(/~~(.+?)~~/g, "$1")
        .replace(/\r\n/g, "\n")
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
        dots: Array.from(match[2] ?? ""),
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
        case "PRODUCT_RECOMMENDATION":
            return "AI 管家 · 商品推荐";
        case "ERROR":
            return "AI 管家 · 系统提示";
        default:
            if (hasProductRecommendations.value) {
                return "AI 管家 · 商品推荐";
            }
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
        case "ERROR":
            return "tag-error";
        case "PRODUCT_RECOMMENDATION":
            return "tag-product";
        default:
            return hasProductRecommendations.value ? "tag-product" : "";
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

.tag-product {
    background: rgba(226, 187, 83, 0.18) !important;
    color: #8c6420 !important;
}
</style>
