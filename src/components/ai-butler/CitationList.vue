<template>
    <div v-if="items.length" class="artifact-citations">
        <div v-for="(item, i) in items" :key="i" class="citation-card">
            <div class="ico">📜</div>
            <div class="info">
                <h6>{{ item.title }}</h6>
                <div class="meta">
                    {{ item.sourceType }} · {{ item.tags?.join("、") }}
                </div>
            </div>
            <div class="arrow">›</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    structuredJson?: string | undefined;
}>();

interface Citation {
    sourceType?: string;
    sourceId?: number | string;
    title?: string;
    excerpt?: string;
    tags?: string[];
}

const items = computed<Citation[]>(() => {
    if (!props.structuredJson) return [];
    try {
        const parsed = JSON.parse(props.structuredJson);
        return Array.isArray(parsed.citations) ? parsed.citations : [];
    } catch {
        return [];
    }
});
</script>
