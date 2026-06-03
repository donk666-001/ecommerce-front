<template>
    <div
        class="modal-mask"
        :class="{ show: modelValue }"
        @click.self="handleCancel"
    >
        <div class="modal" style="max-width: 520px">
            <div class="modal-header">
                <div>
                    <h3>确认支付</h3>
                    <div class="countdown" :class="{ urgent: countdownSecs <= 60 }">
                        <span class="cd-icon">⏱</span>
                        {{ Math.floor(countdownSecs / 60) }}:{{ String(countdownSecs % 60).padStart(2, '0') }}
                        后订单将自动取消
                    </div>
                </div>
                <button class="modal-close" @click="handleCancel">×</button>
            </div>
            <div class="modal-body">
                <div class="pay-card">
                    <div v-for="item in displayItems" :key="item.name + item.qty" class="pay-row">
                        <span>{{ item.name }} × {{ item.qty }}</span>
                        <span>¥{{ (item.price * item.qty).toFixed(2) }}</span>
                    </div>
                    <div class="pay-row">
                        <span>运费</span>
                        <span>¥0.00（满 88 免运）</span>
                    </div>
                    <div class="pay-row total">
                        <span>实付金额</span>
                        <span class="red">¥{{ total.toFixed(2) }}</span>
                    </div>
                </div>
                <div class="pay-method">
                    <div class="ali-logo">支</div>
                    <div style="flex: 1">
                        <div style="font-weight: 600; color: var(--ink)">支付宝支付</div>
                        <div style="font-size: 12px; color: var(--ink-muted); margin-top: 2px">
                            推荐使用 · 安全、便捷
                        </div>
                    </div>
                    <div style="color: var(--jade); font-size: 20px">✓</div>
                </div>
                <p style="text-align: center; font-size: 13px; color: var(--ink-muted)">
                    请使用支付宝 APP 扫码完成支付
                </p>
                <div class="qr-mock"></div>
                <p style="text-align: center; font-size: 12px; color: var(--ink-muted)">
                    二维码 5 分钟内有效
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" @click="handleCancel">暂不支付</button>
                <button class="btn btn-jade" @click="$emit('confirmPay')">模拟支付成功</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

interface DisplayItem {
    name: string;
    qty: number;
    price: number;
}

interface Props {
    modelValue: boolean;
    displayItems: DisplayItem[];
    total: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    confirmPay: [];
    cancelPay: [];
}>();

const COUNTDOWN_SECONDS = 600; // 10分钟
const countdownSecs = ref(COUNTDOWN_SECONDS);
let timer: ReturnType<typeof setInterval> | null = null;

function startCountdown() {
    countdownSecs.value = COUNTDOWN_SECONDS;
    stopCountdown();
    timer = setInterval(() => {
        countdownSecs.value--;
        if (countdownSecs.value <= 0) {
            stopCountdown();
            emit("cancelPay");
            emit("update:modelValue", false);
        }
    }, 1000);
}

function stopCountdown() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function handleCancel() {
    stopCountdown();
    emit("cancelPay");
    emit("update:modelValue", false);
}

watch(
    () => props.modelValue,
    (v) => {
        if (v) {
            startCountdown();
        } else {
            stopCountdown();
        }
    },
);

onUnmounted(() => {
    stopCountdown();
});
</script>

<style scoped lang="scss">
.modal-mask {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44, 54, 57, 0.5);
    backdrop-filter: blur(3px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    padding: 20px;

    &.show {
        display: flex;
    }
}

.modal {
    background: white;
    border-radius: 14px;
    max-width: 520px;
    width: 100%;
    box-shadow: var(--shadow-lg);
    max-height: 90vh;
    overflow: auto;
}

.modal-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 18px;
        color: var(--ink);
        margin-bottom: 4px;
    }
}

.countdown {
    font-size: 12px;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 4px;

    &.urgent {
        color: var(--cinnabar);
        font-weight: 600;
        animation: pulse 1s infinite;
    }
}
.cd-icon { font-size: 13px; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 22px;
    color: var(--ink-muted);
    line-height: 1;

    &:hover {
        color: var(--ink);
    }
}

.modal-body {
    padding: 22px;
}

.modal-footer {
    padding: 14px 22px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.pay-card {
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 14px;
}

.pay-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 14px;

    &.total {
        border-top: 1px dashed var(--line);
        margin-top: 10px;
        padding-top: 10px;
        font-family: "STKaiti", serif;
        font-size: 16px;

        .red {
            color: var(--cinnabar);
            font-size: 22px;
            font-weight: 700;
        }
    }
}

.pay-method {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border: 2px solid var(--jade);
    background: var(--jade-soft);
    border-radius: 10px;
    margin-bottom: 14px;
}

.ali-logo {
    width: 44px;
    height: 44px;
    background: #1677ff;
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 22px;
}

.qr-mock {
    width: 200px;
    height: 200px;
    margin: 14px auto;
    background:
        linear-gradient(45deg, var(--ink) 25%, transparent 25%) 0 0 / 12px 12px,
        linear-gradient(-45deg, var(--ink) 25%, transparent 25%) 0 6px / 12px 12px,
        linear-gradient(45deg, transparent 75%, var(--ink) 75%) 6px -6px / 12px 12px,
        linear-gradient(-45deg, transparent 75%, var(--ink) 75%) -6px 0 / 12px 12px,
        white;
    border: 4px solid var(--ink);
    border-radius: 8px;
}

.btn {
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &-outline {
        border: 1px solid var(--line);
        background: white;
        color: var(--ink);

        &:hover {
            border-color: var(--jade);
            color: var(--jade);
        }
    }

    &-jade {
        background: var(--jade);
        color: white;

        &:hover {
            background: #4a6f60;
        }
    }
}
</style>