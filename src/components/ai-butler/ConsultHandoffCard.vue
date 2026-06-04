<template>
    <div class="handoff-card">
        <h6>{{ title }}</h6>
        <p>{{ reason }}</p>
        <button class="handoff-btn" @click="goToConsultation">
            {{ buttonLabel }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
    content?: string | undefined;
    structuredJson?: string | undefined;
}>();

const router = useRouter();

interface HandoffAction {
    code?: string;
    label?: string;
    targetUrl?: string;
}

interface HandoffData {
    title?: string;
    description?: string;
    reason?: string;
    url?: string;
    actions?: HandoffAction[];
}

const DEFAULT_REASON =
    "此问题涉及病情判断或诊疗建议，AI 管家不作诊断，建议直接联系专业医师在线咨询。";
const DEFAULT_TARGET_URL = "/consultation?tab=m2&entry=ai-butler-medical";

const parsed = computed<HandoffData>(() => {
    if (!props.structuredJson) return {};
    try {
        return JSON.parse(props.structuredJson);
    } catch {
        return {};
    }
});

const primaryAction = computed<HandoffAction | null>(() => {
    const actions = parsed.value.actions;
    return Array.isArray(actions) && actions.length > 0
        ? (actions[0] ?? null)
        : null;
});

const title = computed(() => parsed.value.title?.trim() || "建议前往在线咨询");

const reason = computed(
    () =>
        parsed.value.description?.trim() ||
        parsed.value.reason?.trim() ||
        props.content?.trim() ||
        DEFAULT_REASON,
);

const buttonLabel = computed(
    () => primaryAction.value?.label?.trim() || "前往咨询",
);

const targetUrl = computed(
    () =>
        primaryAction.value?.targetUrl?.trim() ||
        parsed.value.url?.trim() ||
        DEFAULT_TARGET_URL,
);

function goToConsultation() {
    void router.push(targetUrl.value);
}
</script>
