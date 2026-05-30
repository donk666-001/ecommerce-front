<template>
    <div class="queue-panel">
        <div class="section-title font-serif">排队队列</div>
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>等待中的客户</h3>
                <span style="font-size: 12px; color: var(--ink-muted)"
                    >系统自动按 FIFO + 职能匹配分配，您也可主动接入</span
                >
            </div>
            <div
                class="panel-card-body"
                style="text-align: center; padding: 40px"
            >
                <div style="font-size: 48px; margin-bottom: 16px">⏳</div>
                <div style="font-size: 16px; color: var(--ink-muted)">
                    排队功能开发中...
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// TODO: 实现排队队列功能
</script>

<style scoped lang="scss">
.section-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;

    &::before {
        content: "";
        width: 4px;
        height: 18px;
        background: var(--cinnabar);
        border-radius: 2px;
    }
}

.panel-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
}

.panel-card-head {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 16px;
        font-weight: 600;
    }
}

.panel-card-body {
    padding: 14px 18px;
}
</style>
