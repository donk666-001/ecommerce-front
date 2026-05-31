<template>
    <div class="admin-refund">
        <!-- 顶部操作栏 -->
        <div class="panel-header">
            <h3 class="panel-title font-serif">退款审核</h3>
            <div class="panel-actions">
                <button
                    class="btn btn-outline"
                    @click="showFilterForm = !showFilterForm"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    {{ showFilterForm ? "隐藏筛选" : "高级筛选" }}
                </button>
                <button
                    class="btn btn-outline"
                    @click="handleRefresh"
                    :disabled="loading"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        :class="{ rotating: loading }"
                    >
                        <path d="M23 4v6h-6M1 20v-6h6" />
                        <path
                            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                        />
                    </svg>
                    刷新
                </button>
            </div>
        </div>

        <!-- 统计卡片 -->
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

        <!-- 筛选表单 -->
        <Transition name="slide-down">
            <div v-if="showFilterForm" class="filter-form-container">
                <div class="filter-form">
                    <div class="form-row">
                        <div class="form-item">
                            <label>退款单号</label>
                            <input
                                v-model.trim="filterForm.refundNo"
                                type="text"
                                placeholder="请输入退款单号"
                            />
                        </div>
                        <div class="form-item">
                            <label>订单ID</label>
                            <input
                                v-model.number="filterForm.orderId"
                                type="number"
                                placeholder="请输入订单ID"
                            />
                        </div>
                        <div class="form-item">
                            <label>退款状态</label>
                            <select v-model.number="filterForm.status">
                                <option :value="undefined">全部状态</option>
                                <option :value="0">申请中</option>
                                <option :value="1">审核通过</option>
                                <option :value="2">退款中</option>
                                <option :value="3">已完成</option>
                                <option :value="4">已拒绝</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary" @click="handleSearch">
                            搜索
                        </button>
                        <button class="btn btn-outline" @click="handleReset">
                            重置
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- 退款列表 -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>加载中...</p>
        </div>

        <div v-else-if="refunds.length === 0" class="empty-state">
            <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
            >
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
            <p>暂无退款记录</p>
        </div>

        <div v-else class="refund-table-wrap">
            <table class="refund-table">
                <thead>
                    <tr>
                        <th>退款单号</th>
                        <th>订单ID</th>
                        <th>用户ID</th>
                        <th>退款类型</th>
                        <th>退款金额</th>
                        <th>状态</th>
                        <th>申请时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in refunds" :key="item.id">
                        <td>{{ item.refundNo }}</td>
                        <td>{{ item.orderId }}</td>
                        <td>{{ item.userId }}</td>
                        <td>{{ getRefundTypeText(item.refundType) }}</td>
                        <td class="amount-cell">
                            ¥{{ item.refundAmount.toFixed(2) }}
                        </td>
                        <td>
                            <span
                                :class="[
                                    'status-badge',
                                    getStatusClass(item.status),
                                ]"
                            >
                                {{ getStatusText(item.status) }}
                            </span>
                        </td>
                        <td>{{ formatDateTime(item.createdAt) }}</td>
                        <td>
                            <div class="action-buttons">
                                <button
                                    v-if="item.status === 0"
                                    class="btn-link approve"
                                    @click="openApproveDialog(item)"
                                >
                                    通过
                                </button>
                                <button
                                    v-if="item.status === 0"
                                    class="btn-link reject"
                                    @click="openRejectDialog(item)"
                                >
                                    拒绝
                                </button>
                                <button
                                    v-else
                                    class="btn-link"
                                    @click="viewDetails(item)"
                                >
                                    查看详情
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 分页控件 -->
            <div class="pagination">
                <div class="pagination-info">
                    共 {{ pagination.total }} 条，第 {{ pagination.current }} /
                    {{ totalPages }} 页
                </div>
                <div class="pagination-controls">
                    <button
                        class="btn-page"
                        :disabled="pagination.current === 1"
                        @click="handlePageChange(pagination.current - 1)"
                    >
                        上一页
                    </button>
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        class="btn-page"
                        :class="{ active: page === pagination.current }"
                        @click="handlePageChange(page)"
                    >
                        {{ page }}
                    </button>
                    <button
                        class="btn-page"
                        :disabled="pagination.current === totalPages"
                        @click="handlePageChange(pagination.current + 1)"
                    >
                        下一页
                    </button>
                    <select
                        v-model.number="pagination.size"
                        class="page-size-select"
                        @change="handlePageSizeChange"
                    >
                        <option :value="10">10条/页</option>
                        <option :value="20">20条/页</option>
                        <option :value="50">50条/页</option>
                        <option :value="100">100条/页</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 查看详情模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="detailDialogVisible"
                    class="modal-mask"
                    @click.self="closeDetailDialog"
                >
                    <div class="modal-content modal-large">
                        <div class="modal-header">
                            <h3 class="font-serif">退款详情</h3>
                            <button
                                class="modal-close"
                                @click="closeDetailDialog"
                            >
                                ×
                            </button>
                        </div>
                        <div class="modal-body">
                            <!-- 基本信息 -->
                            <div class="refund-info-section">
                                <h4>基本信息</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">退款单号：</span>
                                        <span class="value">{{
                                            currentRefund?.refundNo
                                        }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">订单ID：</span>
                                        <span class="value">{{
                                            currentRefund?.orderId
                                        }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">用户ID：</span>
                                        <span class="value">{{
                                            currentRefund?.userId
                                        }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">退款类型：</span>
                                        <span class="value">{{
                                            getRefundTypeText(
                                                currentRefund?.refundType || 0,
                                            )
                                        }}</span>
                                    </div>
                                    <div class="info-item highlight">
                                        <span class="label">退款金额：</span>
                                        <span class="value amount"
                                            >¥{{
                                                currentRefund?.refundAmount.toFixed(
                                                    2,
                                                )
                                            }}</span
                                        >
                                    </div>
                                    <div class="info-item">
                                        <span class="label">状态：</span>
                                        <span
                                            :class="[
                                                'status-badge',
                                                getStatusClass(
                                                    currentRefund?.status || 0,
                                                ),
                                            ]"
                                        >
                                            {{
                                                getStatusText(
                                                    currentRefund?.status || 0,
                                                )
                                            }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- 退款原因 -->
                            <div class="refund-info-section">
                                <h4>退款原因</h4>
                                <div class="reason-content">
                                    <p class="reason-text">
                                        {{ currentRefund?.reason }}
                                    </p>
                                    <p
                                        v-if="currentRefund?.description"
                                        class="reason-desc"
                                    >
                                        <strong>补充说明：</strong
                                        >{{ currentRefund.description }}
                                    </p>
                                </div>
                            </div>

                            <!-- 时间信息 -->
                            <div class="refund-info-section">
                                <h4>时间信息</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">申请时间：</span>
                                        <span class="value">{{
                                            formatDateTime(
                                                currentRefund?.createdAt || "",
                                            )
                                        }}</span>
                                    </div>
                                    <div
                                        v-if="currentRefund?.auditTime"
                                        class="info-item"
                                    >
                                        <span class="label">审核时间：</span>
                                        <span class="value">{{
                                            formatDateTime(
                                                currentRefund.auditTime,
                                            )
                                        }}</span>
                                    </div>
                                    <div
                                        v-if="currentRefund?.refundTime"
                                        class="info-item"
                                    >
                                        <span class="label">退款时间：</span>
                                        <span class="value">{{
                                            formatDateTime(
                                                currentRefund.refundTime,
                                            )
                                        }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 审核信息 -->
                            <div
                                v-if="currentRefund?.auditRemark"
                                class="refund-info-section"
                            >
                                <h4>审核备注</h4>
                                <div class="audit-remark-box">
                                    {{ currentRefund.auditRemark }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button
                                class="btn btn-primary"
                                @click="closeDetailDialog"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

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
const showFilterForm = ref(false);
const refunds = ref<RefundVO[]>([]);

// 筛选表单
const filterForm = reactive({
    refundNo: "",
    orderId: undefined as number | undefined,
    status: undefined as number | undefined,
});

// 分页配置
const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
});

// 计算总页数
const totalPages = computed(() =>
    Math.ceil(pagination.total / pagination.size),
);

// 计算可见的页码
const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});

const stats = reactive({
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
});

// Dialog state
const approveDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const detailDialogVisible = ref(false);
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

// Helpers
function showToast(message: string, type: "success" | "error" = "success") {
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
        console.log("========== 开始加载退款列表 ==========");
        console.log("筛选条件:", filterForm);
        console.log("分页参数:", pagination);

        // 构建请求参数，只在值存在时添加
        const params: Parameters<typeof ApiRefundAdmin.listAllRefunds>[0] = {
            page: pagination.current,
            size: pagination.size,
        };

        if (filterForm.status !== undefined) {
            params.status = filterForm.status;
        }
        if (filterForm.refundNo) {
            params.refundNo = filterForm.refundNo;
        }
        if (filterForm.orderId !== undefined) {
            params.orderId = filterForm.orderId;
        }

        const response = await ApiRefundAdmin.listAllRefunds(params);

        console.log("✅ 退款列表查询成功！");
        console.log("Code:", response.data.code);
        console.log("Message:", response.data.message);

        const apiResponse = response.data;
        if (apiResponse && apiResponse.code === 200 && apiResponse.data) {
            refunds.value = apiResponse.data.records || [];
            pagination.total = apiResponse.data.total || 0;

            console.log(
                "✅ 找到退款记录，共",
                pagination.total,
                "条，当前页",
                refunds.value.length,
                "条",
            );

            // Update stats
            updateStats();

            if (refunds.value.length > 0) {
                showToast(`找到 ${pagination.total} 条退款记录`, "success");
            } else {
                showToast("未找到相关退款记录", "error");
            }
        } else {
            console.log("❌ 退款列表查询返回错误:", apiResponse.message);
            refunds.value = [];
            pagination.total = 0;
            showToast(apiResponse.message || "加载失败", "error");
        }
    } catch (error) {
        console.error("❌ 加载退款列表失败:", error);
        refunds.value = [];
        pagination.total = 0;
        showToast("加载退款列表失败", "error");
    } finally {
        loading.value = false;
        console.log("========== 加载结束 ==========\n");
    }
}

function updateStats() {
    // Calculate stats from current data or fetch separately
    stats.pending = refunds.value.filter((r) => r.status === 0).length;
    stats.approved = refunds.value.filter((r) => r.status === 1).length;
    stats.rejected = refunds.value.filter((r) => r.status === 4).length;
    stats.processing = refunds.value.filter((r) => r.status === 2).length;
}

// 搜索处理
function handleSearch() {
    pagination.current = 1; // 重置到第一页
    loadRefunds();
}

// 重置搜索
function handleReset() {
    filterForm.refundNo = "";
    filterForm.orderId = undefined;
    filterForm.status = undefined;
    pagination.current = 1;
    loadRefunds();
}

// 刷新按钮处理
function handleRefresh() {
    loadRefunds();
}

// 页码变化
function handlePageChange(page: number) {
    if (page < 1 || page > totalPages.value) return;
    pagination.current = page;
    loadRefunds();
}

// 每页条数变化
function handlePageSizeChange() {
    pagination.current = 1; // 重置到第一页
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

function viewDetails(item: RefundVO) {
    currentRefund.value = item;
    detailDialogVisible.value = true;
}

function closeDetailDialog() {
    detailDialogVisible.value = false;
    currentRefund.value = null;
}

onMounted(() => {
    loadRefunds();
});
</script>

<style scoped>
.admin-refund {
    padding: 24px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.panel-title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
}

.panel-actions {
    display: flex;
    gap: 12px;
}

/* 统计卡片 */
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

/* 筛选表单 */
.filter-form-container {
    margin-bottom: 24px;
}

.filter-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-item label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.form-item input,
.form-item select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.form-item input:focus,
.form-item select:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px solid #bfdbfe;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-outline {
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
}

.btn-outline:hover {
    background: #f9fafb;
}

.btn-outline:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.loading-container {
    text-align: center;
    padding: 60px 20px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #9ca3af;
}

.empty-state svg {
    opacity: 0.3;
    margin-bottom: 16px;
}

.refund-table-wrap {
    overflow-x: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.refund-table {
    width: 100%;
    border-collapse: collapse;
}

.refund-table th,
.refund-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.refund-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

.refund-table td {
    font-size: 14px;
    color: #4b5563;
}

.amount-cell {
    color: var(--cinnabar, #b33c2c);
    font-weight: 600;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
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

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn-link {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
    padding: 4px 8px;
}

.btn-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.btn-link.approve {
    color: #059669;
}

.btn-link.approve:hover {
    color: #047857;
    text-decoration: underline;
}

.btn-link.reject {
    color: #dc2626;
}

.btn-link.reject:hover {
    color: #b91c1c;
    text-decoration: underline;
}

/* Modal */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-large {
    max-width: 800px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    line-height: 1;
}

.modal-close:hover {
    color: #374151;
}

.modal-body {
    padding: 24px;
}

/* Refund Info Section */
.refund-info-section {
    margin-bottom: 24px;
}

.refund-info-section:last-child {
    margin-bottom: 0;
}

.refund-info-section h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f3f4f6;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.info-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f9fafb;
    border-radius: 6px;
    .label {
        font-size: 14px;
        color: #6b7280;
        min-width: 80px;
    }
    .value {
        font-size: 14px;
        color: #1f2937;
        font-weight: 500;
    }
    &.highlight .value.amount {
        color: var(--cinnabar, #b33c2c);
        font-size: 18px;
        font-weight: 700;
    }
}

.reason-content {
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    .reason-text {
        font-size: 14px;
        color: #1f2937;
        line-height: 1.6;
        margin-bottom: 8px;
    }
    .reason-desc {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.5;
    }
}

.audit-remark-box {
    padding: 16px;
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    border-radius: 6px;
    font-size: 14px;
    color: #92400e;
    line-height: 1.6;
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

/* 分页 */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    background: white;
}

.pagination-info {
    font-size: 14px;
    color: #6b7280;
}

.pagination-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.btn-page {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
}

.btn-page.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-size-select {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}

.page-size-select:focus {
    outline: none;
    border-color: #3b82f6;
}

/* Slide Down Transition */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
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
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.95);
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
