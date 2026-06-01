<template>
    <div class="panel">
        <div class="order-header-actions">
            <div class="order-status-tabs">
                <button
                    v-for="os in orderStatusDefs"
                    :key="os.key"
                    class="order-status-tab"
                    :class="{ active: orderFilter === os.key }"
                    @click="$emit('update:orderFilter', os.key)"
                >
                    {{ os.label }}
                    <span class="num">({{ orderCount(os.key) }})</span>
                </button>
            </div>
            <button
                class="btn btn-outline btn-sm refresh-btn"
                @click="$emit('refreshOrders')"
                :disabled="orderLoading"
                title="点击同步最新订单状态（如管理员发货后）"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    style="width: 16px; height: 16px"
                >
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path
                        d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                    />
                </svg>
                <span>{{ orderLoading ? "同步中..." : "同步状态" }}</span>
            </button>
        </div>
        <div v-if="filteredOrders.length === 0" class="empty-tip">
            <span class="ic">📦</span>该分类下暂无订单
        </div>
        <div v-else>
            <div
                v-for="(o, idx) in filteredOrders"
                :key="o.no"
                class="order-card"
            >
                <div class="order-head">
                    <div>
                        <span class="order-no"
                            >订单编号：<strong>{{ o.no }}</strong></span
                        >
                        <span class="order-time">{{ o.time }}</span>
                    </div>
                    <div class="order-status-group">
                        <span
                            class="order-status"
                            :class="orderStatusClass(o.status)"
                            >{{ orderStatusText(o.status) }}</span
                        >
                        <!-- 独立显示退款状态 -->
                        <span
                            v-if="o.refundStatus !== undefined"
                            class="refund-status-badge"
                            :class="getRefundStatusClass(o.refundStatus)"
                        >
                            {{ getRefundStatusText(o.refundStatus) }}
                        </span>
                    </div>
                </div>
                <div class="order-body">
                    <div class="order-thumb-row">
                        <div
                            v-for="it in o.items"
                            :key="it.id"
                            class="cart-thumb sm"
                            :title="getProduct(it.id).name + ' ×' + it.qty"
                        >
                            {{ getProduct(it.id).icon }}
                        </div>
                    </div>
                    <div class="order-info-block">
                        {{
                            o.items
                                .map(
                                    (it) =>
                                        getProduct(it.id).name + " ×" + it.qty,
                                )
                                .join("，")
                        }}
                    </div>
                </div>
                <div class="order-foot">
                    <span class="order-amount">
                        共<strong>{{
                            o.items.reduce((s, it) => s + it.qty, 0)
                        }}</strong>
                        件商品&emsp;合计<strong
                            >¥{{ o.amount.toFixed(2) }}</strong
                        >
                    </span>
                    <div class="order-actions">
                        <template v-if="o.status === 'unpaid'">
                            <button
                                class="btn btn-outline"
                                @click="$emit('cancelOrder', o.no)"
                            >
                                取消订单
                            </button>
                            <button
                                class="btn btn-cinnabar"
                                @click="$emit('payOrder', o.no)"
                            >
                                立即支付
                            </button>
                        </template>
                        <template v-else-if="o.status === 'topay'">
                            <button
                                class="btn btn-outline"
                                @click="$emit('openRefundModal', o.no)"
                            >
                                申请退款
                            </button>
                            <button
                                class="btn btn-outline"
                                @click="$emit('remindShip', o.no)"
                            >
                                提醒发货
                            </button>
                            <button
                                class="btn btn-outline"
                                @click="$emit('reBuy', o.no)"
                            >
                                再次购买
                            </button>
                        </template>
                        <template v-else-if="o.status === 'shipped'">
                            <!-- 根据退款状态显示不同按钮 -->
                            <template v-if="o.refundStatus === undefined">
                                <!-- 无退款 -->
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('openRefundModal', o.no)"
                                >
                                    申请退款
                                </button>
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('openLogistics', o.no)"
                                >
                                    查看物流
                                </button>
                                <button
                                    class="btn btn-jade"
                                    @click="$emit('confirmReceipt', o.no)"
                                >
                                    确认收货
                                </button>
                                <div class="more-wrap" @click.stop>
                                    <button
                                        class="btn btn-outline"
                                        @click="$emit('toggleMore', idx)"
                                    >
                                        更多 ▾
                                    </button>
                                    <div
                                        class="more-menu"
                                        :class="{ show: openMoreIdx === idx }"
                                    >
                                        <div
                                            class="more-menu-item"
                                            @click="handleReBuyAndClose(o.no)"
                                        >
                                            再次拼单
                                        </div>
                                        <div
                                            class="more-menu-item"
                                            @click="
                                                handleExtendReceiptAndClose(
                                                    o.no,
                                                )
                                            "
                                        >
                                            延长收货
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template
                                v-else-if="[0, 1, 2].includes(o.refundStatus)"
                            >
                                <!-- 退款申请中、审核通过、退款中 -->
                                <div class="refund-status-tip">
                                    <span class="tip-icon">⏳</span>
                                    <span class="tip-text">
                                        {{
                                            getRefundStatusText(o.refundStatus)
                                        }}，客服将在 24h 内处理
                                    </span>
                                </div>
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('openLogistics', o.no)"
                                >
                                    查看物流
                                </button>
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('reBuy', o.no)"
                                >
                                    再次购买
                                </button>
                            </template>
                            <template v-else-if="o.refundStatus === 3">
                                <!-- 退款已完成 -->
                                <div class="refund-completed-tip">
                                    <span class="tip-icon">✅</span>
                                    <span class="tip-text"
                                        >退款已完成，款项将原路返回</span
                                    >
                                </div>
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('reBuy', o.no)"
                                >
                                    再次购买
                                </button>
                            </template>
                            <template v-else-if="o.refundStatus === 4">
                                <!-- 退款失败 -->
                                <div class="refund-rejected-tip">
                                    <span class="tip-icon">❌</span>
                                    <div class="tip-content">
                                        <span class="tip-text"
                                            >退款申请已被拒绝</span
                                        >
                                        <span
                                            v-if="o.auditRemark"
                                            class="tip-reason"
                                        >
                                            原因：{{ o.auditRemark }}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('openRefundModal', o.no)"
                                >
                                    重新申请退款
                                </button>
                                <button
                                    class="btn btn-outline"
                                    @click="$emit('openLogistics', o.no)"
                                >
                                    查看物流
                                </button>
                                <button
                                    class="btn btn-jade"
                                    @click="$emit('confirmReceipt', o.no)"
                                >
                                    确认收货
                                </button>
                            </template>
                        </template>
                        <template v-else>
                            <button
                                class="btn btn-outline"
                                @click="$emit('reBuy', o.no)"
                            >
                                再次购买
                            </button>
                            <button
                                class="btn btn-outline"
                                @click="$emit('reviewOrder', o.no)"
                            >
                                评价
                            </button>
                            <button
                                class="btn btn-outline"
                                @click="$emit('reBuy', o.no)"
                            >
                                再次拼单
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface LogisticsStep {
    time: string;
    text: string;
    state: string;
}

interface Order {
    id: number;
    no: string;
    time: string;
    status: "unpaid" | "topay" | "shipped" | "done" | "cancelled";
    items: { id: string; qty: number; name: string; price: number }[];
    amount: number;
    logistics?: { from: string; to: string; steps: LogisticsStep[] };
    refundStatus?: number;
    auditRemark?: string;
}

interface Product {
    id: string;
    name: string;
    cat: string;
    price: number;
    sold: number;
    stock: number;
    icon: string;
    tags: string[];
    effect: string;
    desc: string;
}

interface Props {
    orders: Order[];
    orderFilter: string;
    orderLoading: boolean;
    openMoreIdx: number;
    getProduct: (id: string) => Product;
    orderCount: (key: string) => number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:orderFilter": [value: string];
    refreshOrders: [];
    cancelOrder: [no: string];
    payOrder: [no: string];
    openRefundModal: [no: string];
    remindShip: [no: string];
    reBuy: [no: string];
    confirmReceipt: [no: string];
    openLogistics: [no: string];
    reviewOrder: [no: string];
    toggleMore: [idx: number];
    extendReceipt: [no: string];
}>();

const orderStatusDefs = [
    { key: "all", label: "全部" },
    { key: "unpaid", label: "未支付" },
    { key: "topay", label: "待发货" },
    { key: "shipped", label: "已发货" },
    { key: "done", label: "已完成" },
    { key: "refunding", label: "退款中" },
    { key: "refunded", label: "已退款" },
    { key: "rejected", label: "退款失败" },
];

// 过滤订单
const filteredOrders = computed(() => {
    const filter = props.orderFilter;

    // 如果是退款相关的筛选，基于 refundStatus 字段
    if (filter === "refunding") {
        return props.orders.filter(
            (o) =>
                o.refundStatus !== undefined &&
                [0, 1, 2].includes(o.refundStatus),
        );
    }
    if (filter === "refunded") {
        return props.orders.filter((o) => o.refundStatus === 3);
    }
    if (filter === "rejected") {
        return props.orders.filter((o) => o.refundStatus === 4);
    }

    // 其他情况（全部、未支付、待发货、已发货、已完成、已取消）
    // 只显示没有退款状态的订单
    if (filter === "all") {
        return props.orders.filter((o) => o.refundStatus === undefined);
    }

    // 基于订单状态筛选，同时排除有退款状态的订单
    return props.orders.filter(
        (o) => o.refundStatus === undefined && o.status === filter,
    );
});

function orderStatusText(status: string): string {
    const map: Record<string, string> = {
        unpaid: "待支付",
        topay: "待发货",
        shipped: "运输中",
        done: "已完成",
        cancelled: "已取消",
    };
    return map[status] || status;
}

function orderStatusClass(status: string): string {
    const map: Record<string, string> = {
        unpaid: "status-pay",
        topay: "status-ship",
        shipped: "status-shipped",
        done: "status-done",
        cancelled: "status-cancelled",
    };
    return map[status] || "";
}

function getRefundStatusText(status?: number): string {
    if (status === undefined) return "";
    const map: Record<number, string> = {
        0: "退款申请中",
        1: "审核通过",
        2: "退款中",
        3: "退款已完成",
        4: "退款失败",
    };
    return map[status] || "未知";
}

function getRefundStatusClass(status?: number): string {
    if (status === undefined) return "";
    const classMap: Record<number, string> = {
        0: "status-refunding",
        1: "status-approved",
        2: "status-processing",
        3: "status-refunded",
        4: "status-rejected",
    };
    return classMap[status] || "";
}

function handleReBuyAndClose(no: string) {
    emit("reBuy", no);
    emit("toggleMore", -1);
}

function handleExtendReceiptAndClose(no: string) {
    emit("extendReceipt", no);
    emit("toggleMore", -1);
}
</script>

<style scoped lang="scss">
.panel {
    // panel 样式由父组件提供
}

.order-header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.order-status-tabs {
    display: flex;
    gap: 4px;
    background: var(--cream);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 20px;
}

.order-status-tab {
    padding: 8px 18px;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 7px;
    color: var(--ink-muted);
    font-family: inherit;
    font-size: 14px;
    transition: all 0.2s;

    .num {
        font-size: 12px;
        margin-left: 4px;
    }

    &.active {
        background: var(--paper);
        color: var(--cinnabar);
        font-weight: 600;
        box-shadow: var(--shadow);
    }
}

.refresh-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px !important;
    font-size: 13px !important;
    white-space: nowrap;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg {
        transition: transform 0.3s ease;
    }

    &:not(:disabled):hover svg {
        transform: rotate(180deg);
    }
}

.empty-tip {
    text-align: center;
    padding: 60px 20px;
    color: var(--ink-muted);
    font-size: 14px;

    .ic {
        font-size: 56px;
        opacity: 0.5;
        margin-bottom: 12px;
        display: block;
    }
}

.order-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    margin-bottom: 16px;
    overflow: hidden;
}

.order-head {
    padding: 14px 20px;
    border-bottom: 1px dashed var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--paper-warm);
}

.order-no {
    font-size: 13px;
    color: var(--ink-muted);

    strong {
        color: var(--ink);
        font-family: monospace;
    }
}

.order-time {
    font-size: 12px;
    color: var(--ink-muted);
    margin-left: 12px;
}

.order-status {
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 14px;
}

.order-status-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.refund-status-badge {
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 12px;
    background: rgba(212, 175, 55, 0.1);
    color: var(--gold-dark);
    border: 1px solid rgba(212, 175, 55, 0.3);
}

.status-pay {
    color: var(--cinnabar);
}

.status-ship {
    color: var(--gold);
}

.status-shipped {
    color: var(--jade);
}

.status-done {
    color: var(--ink-muted);
}

.status-cancelled {
    color: var(--ink-light);
}

.status-refunding {
    color: var(--gold);
    animation: pulse 2s ease-in-out infinite;
}

.status-approved {
    color: var(--jade);
}

.status-processing {
    color: var(--cinnabar);
}

.status-refunded {
    color: var(--jade);
}

.status-rejected {
    color: var(--cinnabar);
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

.order-body {
    padding: 16px 20px;
    display: flex;
    gap: 14px;
    align-items: center;
}

.order-thumb-row {
    display: flex;
    gap: 8px;
    flex: 0 0 auto;
}

.cart-thumb {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--cream), var(--gold-soft));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;

    &.sm {
        width: 56px;
        height: 56px;
        font-size: 24px;
    }
}

.order-info-block {
    font-size: 13px;
    color: var(--ink-muted);
    flex: 1;
    min-width: 0;
}

.order-foot {
    padding: 14px 20px;
    background: var(--paper-warm);
    border-top: 1px dashed var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-amount {
    font-family: "STKaiti", serif;

    strong {
        color: var(--cinnabar);
        font-size: 20px;
        font-weight: 700;
    }
}

.order-actions {
    display: flex;
    gap: 8px;
    align-items: center;

    .btn {
        padding: 7px 16px;
        font-size: 13px;
    }
}

.refund-status-tip,
.refund-completed-tip,
.refund-rejected-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 13px;

    .tip-icon {
        font-size: 16px;
        flex-shrink: 0;
    }

    .tip-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .tip-text {
        color: var(--ink);
        font-weight: 500;
    }

    .tip-reason {
        color: var(--cinnabar);
        font-size: 12px;
        font-weight: 600;
    }
}

.refund-status-tip {
    background: linear-gradient(
        135deg,
        rgba(212, 175, 55, 0.1),
        rgba(212, 175, 55, 0.05)
    );
    border: 1px solid rgba(212, 175, 55, 0.3);

    .tip-text {
        color: var(--gold-dark);
    }
}

.refund-completed-tip {
    background: linear-gradient(
        135deg,
        rgba(93, 173, 126, 0.1),
        rgba(93, 173, 126, 0.05)
    );
    border: 1px solid rgba(93, 173, 126, 0.3);

    .tip-text {
        color: var(--jade-dark);
    }
}

.refund-rejected-tip {
    background: linear-gradient(
        135deg,
        rgba(214, 69, 65, 0.1),
        rgba(214, 69, 65, 0.05)
    );
    border: 1px solid rgba(214, 69, 65, 0.3);

    .tip-text {
        color: var(--cinnabar);
    }
}

.more-wrap {
    position: relative;
    display: inline-block;
}

.more-menu {
    display: none;
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 6px;
    background: white;
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    min-width: 130px;
    z-index: 200;
    overflow: hidden;

    &.show {
        display: block;
    }
}

.more-menu-item {
    padding: 10px 16px;
    font-size: 13px;
    cursor: pointer;
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
    transition: background 0.15s;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: var(--cream);
        color: var(--cinnabar);
    }
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

    &-cinnabar {
        background: var(--cinnabar);
        color: white;

        &:hover {
            background: #962f22;
        }
    }

    &-jade {
        background: var(--jade);
        color: white;

        &:hover {
            background: #4a6f60;
        }
    }

    &-sm {
        padding: 8px 14px;
        font-size: 13px;
    }
}
</style>
