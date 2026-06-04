<template>
    <div
        class="modal-mask"
        :class="{ show: modelValue }"
        @click.self="handleCancel"
    >
        <div class="modal">
            <div class="modal-header">
                <div>
                    <h3>确认支付</h3>
                    <div class="countdown" :class="{ urgent: countdownSecs <= 60 }">
                        <span class="cd-icon">⏱</span>
                        {{ countdownText }} 后订单将自动取消
                    </div>
                </div>
                <button class="modal-close" type="button" @click="handleCancel">
                    ×
                </button>
            </div>

            <div class="modal-body">
                <div class="pay-card">
                    <div
                        v-for="item in displayItems"
                        :key="item.name + item.qty"
                        class="pay-row"
                    >
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
                    <div class="pay-method-main">
                        <div class="pay-method-title">支付宝沙箱支付</div>
                        <div class="pay-method-sub">请使用支付宝沙箱 APP 扫码</div>
                    </div>
                    <div class="pay-check">✓</div>
                </div>

                <div class="qr-panel" :class="paymentStatus">
                    <div v-if="paymentStatus === 'creating'" class="qr-state">
                        <div class="loader"></div>
                        <strong>正在生成支付二维码</strong>
                        <span>请稍候，正在连接支付宝沙箱</span>
                    </div>

                    <div v-else-if="paymentStatus === 'error'" class="qr-state">
                        <strong>{{ errorMessage }}</strong>
                        <span>确认订单仍为待付款后可重新生成二维码</span>
                        <button class="retry-btn" type="button" @click="restartPayment">
                            重新生成二维码
                        </button>
                    </div>

                    <template v-else>
                        <p class="qr-hint">请使用支付宝沙箱 APP 扫码完成支付</p>
                        <div class="qr-frame">
                            <img
                                v-if="qrDataUrl"
                                :src="qrDataUrl"
                                alt="支付宝沙箱支付二维码"
                            />
                            <div v-else class="qr-empty">二维码生成中</div>
                        </div>
                        <p class="qr-expire">二维码 5 分钟内有效</p>
                        <div class="pay-status">
                            <span class="status-dot"></span>
                            {{ statusText }}
                        </div>
                    </template>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-outline" type="button" @click="handleCancel">
                    暂不支付
                </button>
                <button
                    class="btn btn-jade"
                    type="button"
                    :disabled="paymentStatus === 'creating'"
                    @click="checkPaymentNow"
                >
                    我已完成支付
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import QRCode from "qrcode";
import { ApiAlipay, ApiOrder } from "@/network";

interface DisplayItem {
    name: string;
    qty: number;
    price: number;
}

type PaymentStatus = "idle" | "creating" | "ready" | "checking" | "paid" | "error";

interface CachedPaymentQr {
    orderNo: string;
    outTradeNo: string;
    totalAmountFen: number;
    qrDataUrl: string;
    expiresAt: number;
}

interface Props {
    modelValue: boolean;
    displayItems: DisplayItem[];
    total: number;
    orderId: number | null;
    orderNo: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    paid: [orderId: number];
    cancelPay: [];
}>();

const COUNTDOWN_SECONDS = 600;
const POLL_INTERVAL_MS = 3000;
const QR_CACHE_TTL_MS = 5 * 60 * 1000;
const QR_CACHE_REUSE_BUFFER_MS = 10 * 1000;
const countdownSecs = ref(COUNTDOWN_SECONDS);
const paymentStatus = ref<PaymentStatus>("idle");
const qrDataUrl = ref("");
const errorMessage = ref("支付二维码生成失败");
const currentOutTradeNo = ref("");
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let requestSeq = 0;
const paymentQrCache = new Map<string, CachedPaymentQr>();
const pendingQrRequests = new Map<string, Promise<CachedPaymentQr>>();

const countdownText = computed(
    () =>
        `${Math.floor(countdownSecs.value / 60)}:${String(
            countdownSecs.value % 60,
        ).padStart(2, "0")}`,
);

const statusText = computed(() => {
    switch (paymentStatus.value) {
        case "checking":
            return "正在确认支付结果";
        case "paid":
            return "支付成功，正在同步订单";
        case "ready":
            return "等待扫码支付";
        default:
            return "";
    }
});

function startCountdown() {
    countdownSecs.value = COUNTDOWN_SECONDS;
    stopCountdown();
    countdownTimer = setInterval(() => {
        countdownSecs.value--;
        if (countdownSecs.value <= 0) {
            stopCountdown();
            stopPolling();
            emit("cancelPay");
            emit("update:modelValue", false);
        }
    }, 1000);
}

function stopCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
        void checkPaymentStatus(false);
    }, POLL_INTERVAL_MS);
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

function resetPaymentState() {
    requestSeq++;
    qrDataUrl.value = "";
    currentOutTradeNo.value = "";
    errorMessage.value = "支付二维码生成失败";
    paymentStatus.value = "idle";
    stopPolling();
}

function handleCancel() {
    resetPaymentState();
    stopCountdown();
    emit("cancelPay");
    emit("update:modelValue", false);
}

function restartPayment() {
    void createAlipayOrder();
}

function checkPaymentNow() {
    void checkPaymentStatus(true);
}

async function createAlipayOrder() {
    if (!props.orderId || !props.orderNo || props.total <= 0) {
        paymentStatus.value = "error";
        errorMessage.value = "订单信息不完整，无法创建支付二维码";
        return;
    }

    const totalAmountFen = Math.max(1, Math.round(props.total * 100));
    const cacheKey = buildQrCacheKey(props.orderNo, totalAmountFen);
    const seq = ++requestSeq;
    errorMessage.value = "支付二维码生成失败";
    stopPolling();

    const cachedQr = getReusableQr(cacheKey);
    if (cachedQr) {
        applyPaymentQr(cachedQr);
        return;
    }

    paymentStatus.value = "creating";
    qrDataUrl.value = "";

    try {
        const outTradeNo = buildOutTradeNo(props.orderNo);
        const qr = await getOrCreatePaymentQr(cacheKey, {
            businessOrderNo: props.orderNo,
            outTradeNo,
            subject: buildSubject(),
            totalAmountFen,
            body: buildBody(),
            qrPay: true,
        });
        if (seq !== requestSeq) return;
        applyPaymentQr(qr);
    } catch (error) {
        console.error("创建支付宝支付订单失败", error);
        if (seq !== requestSeq) return;
        paymentStatus.value = "error";
        errorMessage.value =
            error instanceof Error ? error.message : "支付二维码生成失败";
    }
}

async function checkPaymentStatus(manual: boolean) {
    if (!props.orderId || paymentStatus.value === "paid") return;
    if (paymentStatus.value !== "ready" && paymentStatus.value !== "checking") {
        return;
    }

    const previousStatus = paymentStatus.value;
    paymentStatus.value = "checking";
    try {
        const response = await ApiOrder.getOrderById(props.orderId);
        const order = response.data?.data;
        if (isPaidOrderStatus(order?.status)) {
            paymentStatus.value = "paid";
            clearPaymentQrCache(props.orderNo);
            stopPolling();
            stopCountdown();
            emit("paid", props.orderId);
            emit("update:modelValue", false);
            return;
        }
        paymentStatus.value = "ready";
        if (manual) {
            errorMessage.value = "暂未查询到支付成功，请稍后再试";
        }
    } catch (error) {
        console.error("查询支付状态失败", error);
        paymentStatus.value = previousStatus === "checking" ? "ready" : previousStatus;
        if (manual) {
            paymentStatus.value = "error";
            errorMessage.value = "支付状态查询失败，请稍后重试";
        }
    }
}

function buildSubject() {
    const first = props.displayItems[0];
    if (!first) return `养生阁订单 ${props.orderNo}`;
    return props.displayItems.length > 1
        ? `${first.name} 等 ${props.displayItems.length} 件商品`
        : first.name;
}

function buildBody() {
    return props.displayItems
        .map((item) => `${item.name} × ${item.qty}`)
        .join("；");
}

function buildOutTradeNo(orderNo: string) {
    const safeOrderNo = orderNo.replace(/[^\dA-Za-z_-]/g, "");
    return `${safeOrderNo}-${Date.now()}`;
}

function buildQrCacheKey(orderNo: string, totalAmountFen: number) {
    return `${orderNo}::${totalAmountFen}`;
}

function getReusableQr(cacheKey: string) {
    const cached = paymentQrCache.get(cacheKey);
    if (!cached) return null;

    if (cached.expiresAt <= Date.now() + QR_CACHE_REUSE_BUFFER_MS) {
        paymentQrCache.delete(cacheKey);
        return null;
    }

    return cached;
}

async function getOrCreatePaymentQr(
    cacheKey: string,
    payload: Parameters<typeof ApiAlipay.createOrder>[0],
) {
    const pendingRequest = pendingQrRequests.get(cacheKey);
    if (pendingRequest) return pendingRequest;

    const request = requestPaymentQr(cacheKey, payload).finally(() => {
        pendingQrRequests.delete(cacheKey);
    });
    pendingQrRequests.set(cacheKey, request);
    return request;
}

async function requestPaymentQr(
    cacheKey: string,
    payload: Parameters<typeof ApiAlipay.createOrder>[0],
) {
    const response = await ApiAlipay.createOrder(payload);
    const result = response.data;
    if (!isApiSuccess(result.code) || !result.data) {
        throw new Error(result.message || "支付宝创建订单失败");
    }

    const qrContent =
        result.data.qrCode || result.data.payUrl || result.data.orderStr;
    if (!qrContent) throw new Error("后端未返回 qrCode");

    const qr: CachedPaymentQr = {
        orderNo: payload.businessOrderNo,
        outTradeNo: result.data.outTradeNo || payload.outTradeNo,
        totalAmountFen: payload.totalAmountFen,
        qrDataUrl: await QRCode.toDataURL(qrContent, {
            width: 260,
            margin: 1,
            color: {
                dark: "#2c3639",
                light: "#ffffff",
            },
            errorCorrectionLevel: "M",
        }),
        expiresAt: Date.now() + QR_CACHE_TTL_MS,
    };

    paymentQrCache.set(cacheKey, qr);
    return qr;
}

function applyPaymentQr(qr: CachedPaymentQr) {
    currentOutTradeNo.value = qr.outTradeNo;
    qrDataUrl.value = qr.qrDataUrl;
    paymentStatus.value = "ready";
    startPolling();
}

function clearPaymentQrCache(orderNo: string) {
    for (const [cacheKey, cached] of paymentQrCache) {
        if (cached.orderNo === orderNo) {
            paymentQrCache.delete(cacheKey);
        }
    }
}

function isApiSuccess(code: number) {
    return code === 0 || code === 200;
}

function isPaidOrderStatus(status: number | undefined) {
    return status === 1 || status === 2 || status === 3;
}

watch(
    () => props.modelValue,
    (visible) => {
        if (visible) {
            startCountdown();
            void createAlipayOrder();
        } else {
            resetPaymentState();
            stopCountdown();
        }
    },
);

onUnmounted(() => {
    resetPaymentState();
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
    max-width: 560px;
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

.cd-icon {
    font-size: 13px;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
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
    gap: 16px;
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

.pay-method-main {
    flex: 1;
    min-width: 0;
}

.pay-method-title {
    font-weight: 600;
    color: var(--ink);
}

.pay-method-sub {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
}

.pay-check {
    color: var(--jade);
    font-size: 20px;
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

.qr-panel {
    min-height: 308px;
    text-align: center;
}

.qr-state {
    min-height: 300px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 10px;
    padding: 20px;
    border: 1px dashed var(--line);
    border-radius: 12px;
    color: var(--ink-muted);

    strong {
        color: var(--ink);
        font-size: 15px;
    }
}

.loader {
    width: 34px;
    height: 34px;
    border: 3px solid var(--jade-soft);
    border-top-color: var(--jade);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.qr-hint {
    text-align: center;
    font-size: 13px;
    color: var(--ink-muted);
    margin-bottom: 10px;
}

.qr-frame {
    width: 220px;
    height: 220px;
    margin: 10px auto;
    display: grid;
    place-items: center;
    border: 4px solid var(--ink);
    border-radius: 10px;
    background: white;

    img {
        width: 200px;
        height: 200px;
        display: block;
    }
}

.qr-empty {
    font-size: 13px;
    color: var(--ink-muted);
}

.qr-expire {
    text-align: center;
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 8px;
}

.pay-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-top: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--paper-warm);
    color: var(--jade);
    font-size: 12px;
    font-weight: 600;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--jade);
}

.retry-btn {
    border: 1px solid var(--jade);
    background: white;
    color: var(--jade);
    border-radius: 999px;
    padding: 8px 14px;
    cursor: pointer;
    font-family: inherit;
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

    &:disabled {
        cursor: wait;
        opacity: 0.62;
    }

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

        &:hover:not(:disabled) {
            background: #4a6f60;
        }
    }
}
</style>
