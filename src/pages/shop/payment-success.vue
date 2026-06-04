<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="success-shell">
            <section class="success-panel" :class="verifyStatus">
                <div class="status-mark" aria-hidden="true">
                    {{ statusIcon }}
                </div>

                <div class="success-copy">
                    <h1>{{ titleText }}</h1>
                    <p>{{ descriptionText }}</p>
                </div>

                <dl class="payment-meta">
                    <div v-if="orderNo">
                        <dt>订单号</dt>
                        <dd>{{ orderNo }}</dd>
                    </div>
                    <div v-if="outTradeNo">
                        <dt>支付宝交易号</dt>
                        <dd>{{ outTradeNo }}</dd>
                    </div>
                    <div>
                        <dt>状态</dt>
                        <dd>{{ statusLabel }}</dd>
                    </div>
                </dl>

                <div class="actions">
                    <button
                        class="btn btn-primary"
                        type="button"
                        @click="viewOrders"
                    >
                        查看订单
                    </button>
                    <button
                        class="btn btn-outline"
                        type="button"
                        @click="continueShop"
                    >
                        继续逛逛
                    </button>
                    <button
                        v-if="verifyStatus !== 'success'"
                        class="btn btn-plain"
                        type="button"
                        :disabled="verifyStatus === 'checking'"
                        @click="verifyPayment"
                    >
                        重新确认
                    </button>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import { ApiAlipay, ApiOrder } from "@/network";

type VerifyStatus = "checking" | "success" | "pending" | "error";

const route = useRoute();
const router = useRouter();
const verifyStatus = ref<VerifyStatus>("checking");
const syncMessage = ref("");

const orderId = computed(() => toSingleQuery(route.query.order_id));
const orderNo = computed(() => toSingleQuery(route.query.order_no));
const outTradeNo = computed(() => toSingleQuery(route.query.out_trade_no));
const manualConfirm = computed(() => toSingleQuery(route.query.manual) === "1");

const titleText = computed(() => {
    switch (verifyStatus.value) {
        case "success":
            return "支付成功";
        case "pending":
            return "支付结果确认中";
        case "error":
            return "支付状态确认失败";
        default:
            return "正在确认支付结果";
    }
});

const descriptionText = computed(() => {
    switch (verifyStatus.value) {
        case "success":
            return "订单已更新为已支付，可以在订单列表查看后续发货进度。";
        case "pending":
            return "支付宝已返回结果，订单状态仍在同步。稍后刷新订单列表即可查看。";
        case "error":
            return syncMessage.value || "暂时无法确认订单状态，请稍后重试。";
        default:
            return "正在向支付服务同步交易结果，请稍候。";
    }
});

const statusLabel = computed(() => {
    switch (verifyStatus.value) {
        case "success":
            return "已支付";
        case "pending":
            return "同步中";
        case "error":
            return "确认失败";
        default:
            return "确认中";
    }
});

const statusIcon = computed(() => {
    switch (verifyStatus.value) {
        case "success":
            return "✓";
        case "error":
            return "!";
        default:
            return "...";
    }
});

onMounted(() => {
    void verifyPayment();
});

async function verifyPayment() {
    verifyStatus.value = "checking";
    syncMessage.value = "";

    try {
        if (orderId.value) {
            const paid = await verifyOrderStatus();
            if (paid || manualConfirm.value) return;
        }

        if (outTradeNo.value) {
            const syncResponse = await ApiAlipay.toSuccess(outTradeNo.value);
            if (isAlipayPaidResponse(syncResponse.data)) {
                verifyStatus.value = "success";
                return;
            }

            if (!isApiSuccess(syncResponse.data.code)) {
                syncMessage.value =
                    syncResponse.data.message || "支付服务尚未确认该交易。";
                verifyStatus.value = "pending";
                return;
            }

            syncMessage.value =
                syncResponse.data.data || "支付服务正在确认该交易。";
        }

        if (orderId.value) return;

        verifyStatus.value = outTradeNo.value ? "pending" : "error";
        if (!outTradeNo.value) {
            syncMessage.value = "缺少支付宝交易号，无法确认支付结果。";
        }
    } catch (error) {
        console.error("确认支付宝支付结果失败", error);
        verifyStatus.value = "error";
        syncMessage.value = "支付服务暂时不可用，请稍后在订单列表刷新状态。";
    }
}

async function verifyOrderStatus() {
    const orderResponse = await ApiOrder.getOrderById(Number(orderId.value));
    const order = orderResponse.data?.data;
    const paid = isPaidOrderStatus(order?.status);
    verifyStatus.value = paid ? "success" : "pending";
    if (!paid && manualConfirm.value) {
        syncMessage.value = "已收到手动完成支付操作，订单状态仍在同步。";
    }
    return paid;
}

function viewOrders() {
    void router.push({ path: "/shop", query: { tab: "order" } });
}

function continueShop() {
    void router.push("/shop");
}

function toSingleQuery(value: unknown) {
    if (Array.isArray(value)) return value[0] ?? "";
    return typeof value === "string" ? value : "";
}

function isApiSuccess(code: number) {
    return code === 0 || code === 200;
}

function isAlipayPaidResponse(result: { code: number; data?: string }) {
    const message = result.data ?? "";
    return (
        isApiSuccess(result.code) &&
        (/支付成功|已支付|TRADE_SUCCESS|TRADE_FINISHED/i.test(message) ||
            message.length === 0)
    );
}

function isPaidOrderStatus(status: number | undefined) {
    return status === 1 || status === 2 || status === 3;
}
</script>

<style scoped lang="scss">
.page-wrapper {
    min-height: 100vh;
    background: var(--cream, #f8f4ea);
}

.success-shell {
    width: min(720px, calc(100% - 32px));
    margin: 0 auto;
    padding: 72px 0 96px;
}

.success-panel {
    background: var(--paper, #fffef9);
    border: 1px solid var(--line, #eadfcf);
    border-radius: 12px;
    padding: 34px;
    color: var(--ink, #26302e);
}

.status-mark {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--jade-soft, #e8f1ec);
    color: var(--jade, #5c8374);
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 20px;
}

.success-panel.pending .status-mark,
.success-panel.checking .status-mark {
    background: var(--gold-soft, #f5ead0);
    color: var(--gold-dark, #8a6b2f);
}

.success-panel.error .status-mark {
    background: var(--cinnabar-soft, #f8e1dc);
    color: var(--cinnabar, #a94432);
}

.success-copy h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--ink, #26302e);
}

.success-copy p {
    margin: 10px 0 0;
    max-width: 58ch;
    color: var(--ink-muted, #65716e);
    line-height: 1.7;
}

.payment-meta {
    margin: 26px 0 0;
    display: grid;
    gap: 12px;
    padding: 18px;
    border-radius: 10px;
    background: var(--paper-warm, #fbf6ed);
}

.payment-meta div {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    gap: 16px;
}

.payment-meta dt {
    color: var(--ink-muted, #65716e);
    font-size: 13px;
}

.payment-meta dd {
    margin: 0;
    color: var(--ink, #26302e);
    font-size: 13px;
    word-break: break-all;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 28px;
}

.btn {
    min-height: 40px;
    border-radius: 8px;
    padding: 0 18px;
    border: 1px solid transparent;
    font: inherit;
    cursor: pointer;
    transition:
        background 0.18s ease,
        border-color 0.18s ease,
        color 0.18s ease;
}

.btn:disabled {
    cursor: wait;
    opacity: 0.62;
}

.btn-primary {
    background: var(--jade, #5c8374);
    color: white;
}

.btn-primary:hover {
    background: var(--jade-dark, #44675c);
}

.btn-outline {
    background: white;
    border-color: var(--line, #eadfcf);
    color: var(--ink, #26302e);
}

.btn-outline:hover {
    border-color: var(--jade, #5c8374);
    color: var(--jade, #5c8374);
}

.btn-plain {
    background: transparent;
    color: var(--ink-muted, #65716e);
}

.btn-plain:hover:not(:disabled) {
    color: var(--ink, #26302e);
}

@media (max-width: 560px) {
    .success-shell {
        width: min(100% - 24px, 720px);
        padding: 36px 0 64px;
    }

    .success-panel {
        padding: 24px;
    }

    .payment-meta div {
        grid-template-columns: 1fr;
        gap: 4px;
    }

    .actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
