<template>
    <div class="refund-panel">
        <div class="section-header">
            <div class="section-title">
                <span class="section-dot"></span>退款审核
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-label">待审核</div>
                <div class="stat-value pending">{{ stats.pending }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">审核通过</div>
                <div class="stat-value approved">{{ stats.approved }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">已拒绝</div>
                <div class="stat-value rejected">{{ stats.rejected }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">退款中</div>
                <div class="stat-value processing">{{ stats.processing }}</div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="filter-group">
                <label class="filter-label">状态筛选</label>
                <select v-model.number="filterStatus" @change="loadRefunds">
                    <option :value="undefined">全部状态</option>
                    <option :value="0">申请中</option>
                    <option :value="1">审核通过</option>
                    <option :value="2">退款中</option>
                    <option :value="3">已完成</option>
                    <option :value="4">已拒绝</option>
                </select>
            </div>
            <button
                class="btn-refresh"
                @click="loadRefunds"
                :disabled="loading"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                刷新
            </button>
        </div>

        <!-- Refund List -->
        <div v-if="loading" class="loading-state">加载中...</div>
        <div v-else-if="refunds.length === 0" class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-text">暂无退款记录</div>
        </div>
        <div v-else class="refund-list">
            <div v-for="refund in refunds" :key="refund.id" class="refund-card">
                <div class="refund-header">
                    <div class="refund-info">
                        <div class="refund-no">
                            <span class="label">退款单号：</span>
                            <span class="value">{{ refund.refundNo }}</span>
                        </div>
                        <div class="refund-order">
                            <span class="label">订单ID：</span>
                            <span class="value">#{{ refund.orderId }}</span>
                        </div>
                    </div>
                    <span
                        class="status-badge"
                        :class="getStatusClass(refund.status)"
                    >
                        {{ getStatusText(refund.status) }}
                    </span>
                </div>

                <div class="refund-body">
                    <div class="refund-detail-row">
                        <div class="detail-item">
                            <span class="detail-label">用户ID</span>
                            <span class="detail-value"
                                >#{{ refund.userId }}</span
                            >
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">退款类型</span>
                            <span class="detail-value">{{
                                getRefundTypeText(refund.refundType)
                            }}</span>
                        </div>
                        <div class="detail-item highlight">
                            <span class="detail-label">退款金额</span>
                            <span class="detail-value amount"
                                >¥{{ refund.refundAmount.toFixed(2) }}</span
                            >
                        </div>
                    </div>

                    <div class="refund-reason">
                        <div class="reason-label">退款原因</div>
                        <div class="reason-text">{{ refund.reason }}</div>
                        <div v-if="refund.description" class="reason-desc">
                            <strong>补充说明：</strong>{{ refund.description }}
                        </div>
                    </div>

                    <div class="refund-meta">
                        <div class="meta-item">
                            <span class="meta-label">申请时间：</span>
                            <span class="meta-value">{{
                                formatDateTime(refund.createdAt)
                            }}</span>
                        </div>
                        <div v-if="refund.auditTime" class="meta-item">
                            <span class="meta-label">审核时间：</span>
                            <span class="meta-value">{{
                                formatDateTime(refund.auditTime)
                            }}</span>
                        </div>
                    </div>

                    <div v-if="refund.auditRemark" class="audit-remark">
                        <div class="remark-label">审核备注</div>
                        <div class="remark-text">{{ refund.auditRemark }}</div>
                    </div>
                </div>

                <div v-if="refund.status === 0" class="refund-actions">
                    <button
                        class="action-btn reject"
                        @click="openRejectDialog(refund)"
                    >
                        ✕ 拒绝
                    </button>
                    <button
                        class="action-btn approve"
                        @click="openApproveDialog(refund)"
                    >
                        ✓ 通过
                    </button>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
            <button
                class="page-btn"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
            >
                ‹ 上一页
            </button>
            <span class="page-info"
                >第 {{ currentPage }} / {{ totalPages }} 页</span
            >
            <button
                class="page-btn"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
            >
                下一页 ›
            </button>
        </div>

        <!-- Approve Dialog -->
        <div
            v-if="approveDialogVisible"
            class="modal-mask show"
            @click.self="closeApproveDialog"
        >
            <div class="modal" style="max-width: 480px">
                <div class="modal-header">
                    <h3>确认通过退款</h3>
                    <button class="modal-close" @click="closeApproveDialog">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <p class="confirm-text">
                        确认通过退款申请
                        <strong>{{ currentRefund?.refundNo }}</strong
                        >？ <br />退款金额：<span class="amount"
                            >¥{{ currentRefund?.refundAmount.toFixed(2) }}</span
                        >
                    </p>
                    <div class="form-group">
                        <label class="form-label">审核备注（可选）</label>
                        <textarea
                            v-model="approveRemark"
                            rows="3"
                            placeholder="请输入审核备注..."
                            class="form-textarea"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" @click="closeApproveDialog">
                        取消
                    </button>
                    <button
                        class="modal-btn primary-jade"
                        @click="confirmApprove"
                        :disabled="auditing"
                    >
                        {{ auditing ? "处理中..." : "✓ 确认通过" }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Reject Dialog -->
        <div
            v-if="rejectDialogVisible"
            class="modal-mask show"
            @click.self="closeRejectDialog"
        >
            <div class="modal" style="max-width: 480px">
                <div class="modal-header">
                    <h3>拒绝退款申请</h3>
                    <button class="modal-close" @click="closeRejectDialog">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <p class="confirm-text">
                        确认拒绝退款申请
                        <strong>{{ currentRefund?.refundNo }}</strong
                        >？
                    </p>
                    <div class="form-group required">
                        <label class="form-label"
                            >拒绝原因
                            <span class="required-mark">*</span></label
                        >
                        <textarea
                            v-model="rejectReason"
                            rows="4"
                            placeholder="请详细说明拒绝原因，将展示给用户..."
                            class="form-textarea"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" @click="closeRejectDialog">
                        取消
                    </button>
                    <button
                        class="modal-btn primary-cinnabar"
                        @click="confirmReject"
                        :disabled="auditing || !rejectReason.trim()"
                    >
                        {{ auditing ? "处理中..." : "✕ 确认拒绝" }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <div class="toast" :class="{ show: toast.visible, [toast.type]: true }">
            {{ toast.message }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ApiRefundAdmin, type RefundVO } from "@/network/refund";

// State
const loading = ref(false);
const auditing = ref(false);
const refunds = ref<RefundVO[]>([]);
const filterStatus = ref<number | undefined>(undefined);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const stats = reactive({
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
});

// Dialog state
const approveDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const currentRefund = ref<RefundVO | null>(null);
const approveRemark = ref("");
const rejectReason = ref("");

// Toast
const toast = reactive({
    visible: false,
    type: "success" as "success" | "error",
    message: "",
});
let toastTimer: number | null = null;

const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize.value)),
);

// Helpers
function showToast(type: "success" | "error", message: string) {
    toast.type = type;
    toast.message = message;
    toast.visible = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.visible = false;
    }, 3000);
}

function getStatusText(status: number): string {
    const map: Record<number, string> = {
        0: "申请中",
        1: "审核通过",
        2: "退款中",
        3: "已完成",
        4: "已拒绝",
    };
    return map[status] || "未知";
}

function getStatusClass(status: number): string {
    const map: Record<number, string> = {
        0: "status-pending",
        1: "status-approved",
        2: "status-processing",
        3: "status-completed",
        4: "status-rejected",
    };
    return map[status] || "";
}

function getRefundTypeText(type: number): string {
    return type === 1 ? "仅退款" : "退货退款";
}

function formatDateTime(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Actions
async function loadRefunds() {
    loading.value = true;
    try {
        const response = await ApiRefundAdmin.listAllRefunds({
            status: filterStatus.value,
            page: currentPage.value,
            size: pageSize.value,
        });

        const apiResponse = response.data;
        if (apiResponse && apiResponse.data) {
            refunds.value = apiResponse.data.records;
            total.value = apiResponse.data.total;

            // Update stats
            updateStats();
        }
    } catch (error) {
        console.error("加载退款列表失败:", error);
        showToast("error", "加载退款列表失败");
    } finally {
        loading.value = false;
    }
}

function updateStats() {
    // Calculate stats from current data or fetch separately
    stats.pending = refunds.value.filter((r) => r.status === 0).length;
    stats.approved = refunds.value.filter((r) => r.status === 1).length;
    stats.rejected = refunds.value.filter((r) => r.status === 4).length;
    stats.processing = refunds.value.filter((r) => r.status === 2).length;
}

function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    loadRefunds();
}

function openApproveDialog(refund: RefundVO) {
    currentRefund.value = refund;
    approveRemark.value = "";
    approveDialogVisible.value = true;
}

function closeApproveDialog() {
    approveDialogVisible.value = false;
    currentRefund.value = null;
    approveRemark.value = "";
}

function openRejectDialog(refund: RefundVO) {
    currentRefund.value = refund;
    rejectReason.value = "";
    rejectDialogVisible.value = true;
}

function closeRejectDialog() {
    rejectDialogVisible.value = false;
    currentRefund.value = null;
    rejectReason.value = "";
}

async function confirmApprove() {
    if (!currentRefund.value) return;

    auditing.value = true;
    try {
        await ApiRefundAdmin.auditRefund(currentRefund.value.id, {
            approved: true,
            remark: approveRemark.value || undefined,
        });

        showToast("success", "已通过退款申请");
        closeApproveDialog();
        loadRefunds();
    } catch (error) {
        console.error("审核失败:", error);
        showToast("error", "审核失败，请重试");
    } finally {
        auditing.value = false;
    }
}

async function confirmReject() {
    if (!currentRefund.value || !rejectReason.value.trim()) return;

    auditing.value = true;
    try {
        await ApiRefundAdmin.auditRefund(currentRefund.value.id, {
            approved: false,
            remark: rejectReason.value.trim(),
        });

        showToast("success", "已拒绝退款申请");
        closeRejectDialog();
        loadRefunds();
    } catch (error) {
        console.error("审核失败:", error);
        showToast("error", "审核失败，请重试");
    } finally {
        auditing.value = false;
    }
}

onMounted(() => {
    loadRefunds();
});
</script>

<style scoped>
.refund-panel {
    padding: 24px;
}

.section-header {
    margin-bottom: 24px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 700;
    color: var(--ink, #2c3639);
}

.section-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--cinnabar, #b33c2c);
}

/* Stats Row */
.stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    border: 1px solid rgba(232, 223, 208, 0.8);
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 2px 8px rgba(60, 50, 30, 0.04);
}

.stat-label {
    font-size: 13px;
    color: var(--ink-muted, #6b7c7a);
    margin-bottom: 8px;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    &.pending {
        color: #f59e0b;
    }
    &.approved {
        color: var(--jade, #5c8374);
    }
    &.rejected {
        color: var(--cinnabar, #b33c2c);
    }
    &.processing {
        color: #3b82f6;
    }
}

/* Filter Bar */
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding: 14px 18px;
    background: white;
    border: 1px solid rgba(232, 223, 208, 0.8);
    border-radius: 10px;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filter-label {
    font-size: 13px;
    color: var(--ink-muted, #6b7c7a);
    font-weight: 600;
}

.filter-group select {
    padding: 6px 12px;
    border: 1px solid rgba(216, 202, 183, 0.9);
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
}

.filter-group select:focus {
    border-color: var(--jade, #5c8374);
}

.btn-refresh {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--cream, #faf6ee);
    border: 1px solid rgba(232, 223, 208, 0.9);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink, #2c3639);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
    background: white;
    border-color: var(--jade, #5c8374);
}

.btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--ink-muted, #6b7c7a);
}

.empty-icon {
    font-size: 56px;
    margin-bottom: 12px;
    opacity: 0.5;
}

.empty-text {
    font-size: 14px;
}

/* Refund List */
.refund-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.refund-card {
    background: white;
    border: 1px solid rgba(232, 223, 208, 0.8);
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s;
}

.refund-card:hover {
    box-shadow: 0 4px 16px rgba(60, 50, 30, 0.08);
}

.refund-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(180deg, #fdfbf5 0%, #f8f2e7 100%);
    border-bottom: 1px solid rgba(232, 223, 208, 0.7);
}

.refund-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.refund-no,
.refund-order {
    font-size: 13px;
    .label {
        color: var(--ink-muted, #6b7c7a);
    }
    .value {
        color: var(--ink, #2c3639);
        font-weight: 600;
        font-family: monospace;
    }
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    &.status-pending {
        background: #fef3c7;
        color: #d97706;
    }
    &.status-approved {
        background: #d1fae5;
        color: #059669;
    }
    &.status-rejected {
        background: #fee2e2;
        color: #dc2626;
    }
    &.status-processing {
        background: #dbeafe;
        color: #2563eb;
    }
    &.status-completed {
        background: #e5e7eb;
        color: #6b7280;
    }
}

.refund-body {
    padding: 20px;
}

.refund-detail-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
}

.detail-item {
    .detail-label {
        display: block;
        font-size: 12px;
        color: var(--ink-muted, #6b7c7a);
        margin-bottom: 4px;
    }
    .detail-value {
        font-size: 14px;
        color: var(--ink, #2c3639);
        font-weight: 500;
    }
    &.highlight .detail-value.amount {
        color: var(--cinnabar, #b33c2c);
        font-size: 18px;
        font-weight: 700;
    }
}

.refund-reason {
    margin-bottom: 16px;
    padding: 14px;
    background: var(--paper-warm, #faf6ee);
    border-radius: 8px;
}

.reason-label {
    font-size: 12px;
    color: var(--ink-muted, #6b7c7a);
    margin-bottom: 6px;
    font-weight: 600;
}

.reason-text {
    font-size: 14px;
    color: var(--ink, #2c3639);
    line-height: 1.6;
    margin-bottom: 8px;
}

.reason-desc {
    font-size: 13px;
    color: var(--ink-muted, #6b7c7a);
    line-height: 1.5;
}

.refund-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.meta-item {
    font-size: 12px;
    .meta-label {
        color: var(--ink-muted, #6b7c7a);
    }
    .meta-value {
        color: var(--ink, #2c3639);
    }
}

.audit-remark {
    padding: 12px;
    background: #f3f4f6;
    border-radius: 8px;
    border-left: 3px solid var(--jade, #5c8374);
}

.remark-label {
    font-size: 12px;
    color: var(--ink-muted, #6b7c7a);
    margin-bottom: 4px;
    font-weight: 600;
}

.remark-text {
    font-size: 13px;
    color: var(--ink, #2c3639);
    line-height: 1.5;
}

.refund-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid rgba(232, 223, 208, 0.7);
    background: #fafafa;
}

.action-btn {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    &.reject {
        background: white;
        border: 1px solid var(--cinnabar, #b33c2c);
        color: var(--cinnabar, #b33c2c);
    }
    &.reject:hover {
        background: var(--cinnabar-soft, #fae5e0);
    }
    &.approve {
        background: var(--jade, #5c8374);
        color: white;
    }
    &.approve:hover {
        background: #4a6e61;
    }
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    padding: 16px;
}

.page-btn {
    padding: 8px 16px;
    background: white;
    border: 1px solid rgba(232, 223, 208, 0.9);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink, #2c3639);
    cursor: pointer;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    border-color: var(--jade, #5c8374);
    background: var(--cream, #faf6ee);
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-info {
    font-size: 13px;
    color: var(--ink-muted, #6b7c7a);
}

/* Modal Styles */
.modal-mask {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.38);
    backdrop-filter: blur(7px);
}

.modal {
    width: min(540px, 100%);
    max-height: calc(100vh - 48px);
    overflow: hidden;
    border-radius: 18px;
    background: var(--paper, #fffef9);
    border: 1px solid rgba(232, 223, 208, 0.96);
    box-shadow:
        0 28px 70px rgba(44, 54, 57, 0.26),
        0 8px 22px rgba(60, 50, 30, 0.12);
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 24px 18px;
    background: linear-gradient(180deg, #fdfbf5 0%, #f8f2e7 100%);
    border-bottom: 1px solid rgba(232, 223, 208, 0.78);
}

.modal-header h3 {
    margin: 0;
    color: var(--ink, #2c3639);
    font-size: 20px;
    font-weight: 700;
}

.modal-close {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(232, 223, 208, 0.9);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.72);
    color: var(--ink-muted, #6b7c7a);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.16s;
}

.modal-close:hover {
    background: white;
    color: var(--cinnabar, #b33c2c);
}

.modal-body {
    padding: 22px 24px;
    overflow: auto;
}

.confirm-text {
    font-size: 14px;
    color: var(--ink, #2c3639);
    line-height: 1.7;
    margin: 0 0 18px;
    .amount {
        color: var(--cinnabar, #b33c2c);
        font-weight: 700;
        font-size: 18px;
    }
}

.form-group {
    margin-top: 16px;
    &.required .form-textarea {
        border-color: rgba(179, 60, 44, 0.3);
    }
}

.form-label {
    display: block;
    font-size: 13px;
    color: var(--ink, #2c3639);
    font-weight: 600;
    margin-bottom: 8px;
}

.required-mark {
    color: var(--cinnabar, #b33c2c);
}

.form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(216, 202, 183, 0.9);
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    resize: vertical;
    transition: all 0.2s;
}

.form-textarea:focus {
    border-color: var(--jade, #5c8374);
    box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.14);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px 22px;
    border-top: 1px solid rgba(232, 223, 208, 0.78);
    background: #fffefa;
}

.modal-btn {
    min-width: 92px;
    height: 40px;
    border: 1px solid rgba(216, 202, 183, 0.9);
    border-radius: 11px;
    background: #fffef9;
    color: var(--ink-light, #4a565a);
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s;
}

.modal-btn:hover:not(:disabled) {
    background: white;
    border-color: rgba(92, 131, 116, 0.42);
}

.modal-btn.primary-jade {
    border-color: var(--jade, #5c8374);
    background: var(--jade, #5c8374);
    color: white;
}

.modal-btn.primary-jade:hover:not(:disabled) {
    background: #4a6e61;
    border-color: #4a6e61;
}

.modal-btn.primary-cinnabar {
    border-color: var(--cinnabar, #b33c2c);
    background: var(--cinnabar, #b33c2c);
    color: white;
}

.modal-btn.primary-cinnabar:hover:not(:disabled) {
    background: #a23427;
    border-color: #a23427;
}

.modal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Toast */
.toast {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    z-index: 2000;
    opacity: 0;
    transition: all 0.3s;
    pointer-events: none;
    &.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    &.success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
    }
    &.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
    }
}
</style>
