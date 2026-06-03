<template>
    <div v-if="data" class="artifact-plan">
        <div class="artifact-head">
            <span class="seal">睡眠分析</span>
            <h5>最近 {{ data.days || 7 }} 天睡眠报告</h5>
            <div class="meta">覆盖 {{ data.coveredDays ?? "—" }} 天</div>
        </div>
        <div class="plan-dims">
            <div class="plan-dim sleep">
                <div class="dim-head">
                    <div class="ico">🌙</div>
                    睡眠质量
                </div>
                <div class="row">
                    <span class="t">平均时长</span
                    ><span class="c">{{
                        formatMinutes(data.averageSleepMinutes)
                    }}</span>
                </div>
                <div class="row">
                    <span class="t">平均质量</span
                    ><span class="c">{{
                        data.averageQuality?.toFixed(1) ?? "—"
                    }}</span>
                </div>
                <div class="row">
                    <span class="t">深睡比例</span
                    ><span class="c">{{ formatPct(data.deepRatio) }}</span>
                </div>
                <div class="row">
                    <span class="t">REM 比例</span
                    ><span class="c">{{ formatPct(data.remRatio) }}</span>
                </div>
                <div class="row">
                    <span class="t">趋势</span
                    ><span class="c">{{ data.trend ?? "—" }}</span>
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

interface SleepData {
    days?: number;
    coveredDays?: number;
    averageSleepMinutes?: number;
    averageQuality?: number;
    deepRatio?: number;
    remRatio?: number;
    awakeCount?: number;
    trend?: string;
}

const data = computed<SleepData | null>(() => {
    if (!props.structuredJson) return null;
    try {
        const parsed = JSON.parse(props.structuredJson);
        return parsed.sleepSummary ?? parsed ?? null;
    } catch {
        return null;
    }
});

function formatMinutes(min?: number): string {
    if (!min) return "—";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function formatPct(ratio?: number): string {
    if (ratio == null) return "—";
    return `${(ratio * 100).toFixed(1)}%`;
}
</script>

<style scoped lang="scss">
.disclaimer-small {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 12px;
    text-align: right;
}
</style>
