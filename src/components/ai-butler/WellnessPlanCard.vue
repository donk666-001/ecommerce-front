<template>
    <div v-if="plan" class="artifact-plan">
        <div class="artifact-head">
            <span class="seal">{{ plan.days ?? 7 }} 天计划</span>
            <h5>{{ plan.title ?? "个性化养生方案" }}</h5>
            <div class="meta">{{ plan.goal ?? "" }}</div>
        </div>
        <div class="plan-dims">
            <div
                v-for="(dim, i) in plan.dimensions"
                :key="i"
                class="plan-dim"
                :class="dim.type"
            >
                <div class="dim-head">
                    <div class="ico">{{ dim.icon ?? "🌿" }}</div>
                    {{ dim.label }}
                </div>
                <div v-for="(item, j) in dim.items" :key="j" class="row">
                    <span class="t">{{ item.label }}</span>
                    <span class="c">{{ item.value }}</span>
                </div>
            </div>
        </div>
        <p class="disclaimer-small">仅供日常养生参考，不替代专业医疗建议。</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    structuredJson?: string | undefined;
}>();

interface PlanItem {
    label: string;
    value: string;
}
interface PlanDimension {
    type?: string;
    icon?: string;
    label: string;
    items: PlanItem[];
}
interface WellnessPlan {
    days?: number;
    title?: string;
    goal?: string;
    dimensions?: PlanDimension[];
}

const plan = computed<WellnessPlan | null>(() => {
    if (!props.structuredJson) return null;
    try {
        const parsed = JSON.parse(props.structuredJson);
        return parsed.plan ?? parsed ?? null;
    } catch {
        return null;
    }
});
</script>

<style scoped lang="scss">
.disclaimer-small {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 12px;
    text-align: right;
}
</style>
