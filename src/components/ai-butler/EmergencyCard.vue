<template>
    <div class="emergency-card">
        <h6>{{ title }}</h6>
        <p>{{ description }}</p>
        <a :href="`tel:${phone}`" class="emergency-btn">{{ buttonLabel }}</a>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    structuredJson?: string | undefined;
}>();

interface EmergencyAction {
    code?: string;
    label?: string;
    phone?: string;
}

interface EmergencyData {
    title?: string;
    description?: string;
    actions?: EmergencyAction[];
}

const DEFAULT_TITLE = "紧急情况，请立即就医";
const DEFAULT_DESC =
    "您描述的情况可能是紧急医疗状况，请立即拨打 120 或前往最近急诊科。AI 管家无法处理紧急情况，请优先保障人身安全。";
const DEFAULT_LABEL = "拨打 120";
const DEFAULT_PHONE = "120";

const parsed = computed<EmergencyData>(() => {
    if (!props.structuredJson) return {};
    try {
        return JSON.parse(props.structuredJson);
    } catch {
        return {};
    }
});

const primaryAction = computed<EmergencyAction | null>(() => {
    const actions = parsed.value.actions;
    return Array.isArray(actions) && actions.length > 0 ? actions[0] : null;
});

const title = computed(() => parsed.value.title?.trim() || DEFAULT_TITLE);
const description = computed(
    () => parsed.value.description?.trim() || DEFAULT_DESC,
);
const buttonLabel = computed(
    () => primaryAction.value?.label?.trim() || DEFAULT_LABEL,
);
const phone = computed(
    () => primaryAction.value?.phone?.trim() || DEFAULT_PHONE,
);
</script>

<style scoped lang="scss">
.emergency-card {
    background: var(--cinnabar-soft, #fff0f0);
    border: 1px solid var(--cinnabar, #e53935);
    border-radius: 8px;
    padding: 12px;

    h6 {
        color: var(--cinnabar, #e53935);
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 6px;
    }

    p {
        color: #555;
        font-size: 13px;
        margin: 0 0 10px;
        line-height: 1.5;
    }

    .emergency-btn {
        display: inline-block;
        background: var(--cinnabar, #e53935);
        color: white;
        border-radius: 6px;
        padding: 6px 16px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            opacity: 0.9;
        }
    }
}
</style>
