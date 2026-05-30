<template>
    <div class="chat-panel">
        <div class="section-title font-serif">接待中</div>
        <div class="panel-card">
            <div
                class="panel-card-body"
                style="text-align: center; padding: 60px"
            >
                <div style="font-size: 48px; margin-bottom: 16px">💬</div>
                <div style="font-size: 16px; color: var(--ink-muted)">
                    聊天功能开发中...
                </div>
                <div
                    style="
                        font-size: 13px;
                        color: var(--ink-muted);
                        margin-top: 8px;
                    "
                >
                    请参考客服-原型.html实现完整的三栏聊天界面
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// TODO: 实现完整的聊天功能（会话列表、聊天区、客户信息）
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

.panel-card-body {
    padding: 14px 18px;
}
</style>
