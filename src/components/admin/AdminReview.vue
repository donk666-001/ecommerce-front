<template>
    <div class="review-panel">
        <div class="section-header">
            <div class="section-title">
                <span class="section-dot"></span>专家审核
            </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar-card">
            <!-- 左：状态 Tab -->
            <div class="status-tabs">
                <button
                    v-for="tab in statusTabs"
                    :key="tab.value"
                    class="status-tab"
                    :class="{ active: activeStatus === tab.value }"
                    @click="
                        activeStatus = tab.value;
                        currentPage = 1;
                        loadList();
                    "
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- 中：筛选区 -->
            <div class="filter-center">
                <!-- 角色自定义下拉 -->
                <div class="filter-group">
                    <span class="filter-label">角色</span>
                    <div
                        class="custom-select"
                        :class="{ open: roleDropOpen }"
                        ref="roleDropRef"
                    >
                        <button
                            type="button"
                            class="cs-trigger"
                            @click="roleDropOpen = !roleDropOpen"
                        >
                            <span
                                :class="[
                                    'cs-text',
                                    { placeholder: !filterRole },
                                ]"
                            >
                                {{
                                    filterRole
                                        ? roleLabel(filterRole)
                                        : "全部角色"
                                }}
                            </span>
                            <svg
                                class="cs-arrow"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        <div v-if="roleDropOpen" class="cs-menu">
                            <div
                                v-for="opt in roleOptions"
                                :key="opt.value"
                                class="cs-option"
                                :class="{ active: filterRole === opt.value }"
                                @click="pickRole(opt.value)"
                            >
                                {{ opt.label }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 排序 -->
                <div class="filter-group">
                    <span class="filter-label">排序</span>
                    <div class="sort-btns">
                        <button
                            type="button"
                            class="sort-btn"
                            :class="{ active: sortOrder === 'desc' }"
                            @click="
                                sortOrder = 'desc';
                                currentPage = 1;
                                loadList();
                            "
                        >
                            最新↓
                        </button>
                        <button
                            type="button"
                            class="sort-btn"
                            :class="{ active: sortOrder === 'asc' }"
                            @click="
                                sortOrder = 'asc';
                                currentPage = 1;
                                loadList();
                            "
                        >
                            最早↑
                        </button>
                    </div>
                </div>

                <!-- 日期 -->
                <div class="filter-group">
                    <span class="filter-label">日期</span>
                    <div
                        class="date-picker"
                        :class="{ open: datePickerOpen }"
                        ref="dateDropRef"
                    >
                        <button
                            type="button"
                            class="date-trigger"
                            @click="toggleDatePicker"
                        >
                            <span class="date-icon" aria-hidden="true"></span>
                            <span
                                :class="[
                                    'date-text',
                                    { placeholder: !filterDate },
                                ]"
                            >
                                {{
                                    filterDate
                                        ? formatFilterDate(filterDate)
                                        : "全部日期"
                                }}
                            </span>
                            <span class="date-arrow" aria-hidden="true">⌄</span>
                        </button>
                        <div v-if="datePickerOpen" class="date-panel">
                            <div class="date-panel-head">
                                <button
                                    type="button"
                                    class="date-nav"
                                    title="上个月"
                                    @click="changeDateMonth(-1)"
                                >
                                    ‹
                                </button>
                                <div class="date-month-title">
                                    {{ datePanelTitle }}
                                </div>
                                <button
                                    type="button"
                                    class="date-nav"
                                    title="下个月"
                                    @click="changeDateMonth(1)"
                                >
                                    ›
                                </button>
                            </div>
                            <div class="date-week-row">
                                <span v-for="day in weekLabels" :key="day">{{
                                    day
                                }}</span>
                            </div>
                            <div class="date-grid">
                                <button
                                    v-for="day in datePanelDays"
                                    :key="day.key"
                                    type="button"
                                    class="date-cell"
                                    :class="{
                                        muted: !day.inMonth,
                                        today: day.isToday,
                                        selected: day.selected,
                                    }"
                                    @click="pickDate(day.iso)"
                                >
                                    {{ day.day }}
                                </button>
                            </div>
                            <div class="date-panel-foot">
                                <button
                                    type="button"
                                    class="date-foot-btn"
                                    @click="pickToday"
                                >
                                    今天
                                </button>
                                <button
                                    type="button"
                                    class="date-foot-btn subtle"
                                    :disabled="!filterDate"
                                    @click="clearDate"
                                >
                                    清除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    v-if="hasActiveFilters"
                    type="button"
                    class="filter-reset"
                    @click="resetFilters"
                >
                    重置筛选
                </button>
            </div>

            <!-- 右：搜索 -->
            <div class="search-input">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    v-model="keyword"
                    type="text"
                    placeholder="搜索姓名 / 用户 ID"
                    @keyup.enter="
                        currentPage = 1;
                        loadList();
                    "
                />
                <button
                    type="button"
                    class="search-clear"
                    :class="{ hidden: !keyword }"
                    :disabled="!keyword"
                    title="清除搜索"
                    @click="clearSearch"
                >
                    ×
                </button>
                <button
                    type="button"
                    class="search-btn"
                    @click="
                        currentPage = 1;
                        loadList();
                    "
                >
                    查询
                </button>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="empty-state">加载中…</div>

        <!-- Empty -->
        <div v-else-if="applications.length === 0" class="empty-state">
            暂无申请
        </div>

        <!-- Table -->
        <div v-else class="table-card">
            <table>
                <colgroup>
                    <col style="width: 140px" />
                    <col style="width: 88px" />
                    <col style="width: 116px" />
                    <col style="width: 160px" />
                    <col style="width: 100px" />
                    <col style="width: 150px" />
                    <col style="width: 96px" />
                    <col style="width: 180px" />
                </colgroup>
                <thead>
                    <tr>
                        <th>申请人</th>
                        <th>用户 ID</th>
                        <th style="text-align: center">入驻角色</th>
                        <th>个人简介</th>
                        <th style="text-align: center">证明材料</th>
                        <th style="text-align: center">提交时间</th>
                        <th style="text-align: center">状态</th>
                        <th style="text-align: center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="app in applications" :key="app.id">
                        <td>
                            <div class="applicant">
                                <div class="applicant-avatar">👤</div>
                                <span class="applicant-name">{{
                                    app.realName ?? "—"
                                }}</span>
                            </div>
                        </td>
                        <td class="cell-uid">{{ formatUserId(app.userId) }}</td>
                        <td style="text-align: center">
                            <span class="tag tag-jade">{{
                                roleLabel(app.roleType)
                            }}</span>
                        </td>
                        <td>
                            <div class="bio-text">
                                {{ truncateBio(app.bio) }}
                            </div>
                        </td>
                        <td style="text-align: center">
                            <span
                                class="file-count"
                                style="cursor: pointer"
                                @click="openDetail(app)"
                            >
                                📄 附件*{{ app.attachments?.length ?? 0 }}
                            </span>
                        </td>
                        <td class="cell-date">
                            {{ formatDate(app.createdAt) }}
                        </td>
                        <td style="text-align: center">
                            <span
                                class="tag"
                                :class="statusPillClass(app.status)"
                                >{{ statusLabel(app.status) }}</span
                            >
                        </td>
                        <td>
                            <div class="btn-group">
                                <button
                                    class="btn btn-ghost"
                                    @click="openDetail(app)"
                                >
                                    详情
                                </button>
                                <template
                                    v-if="
                                        app.status === 'SUBMITTED' ||
                                        app.status === 'REVIEWING'
                                    "
                                >
                                    <button
                                        class="btn btn-jade"
                                        @click="askApprove(app.id)"
                                    >
                                        ✓ 通过
                                    </button>
                                    <button
                                        class="btn btn-cinnabar"
                                        @click="showRejectDialog(app)"
                                    >
                                        ✕ 驳回
                                    </button>
                                </template>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="pagination">
                <div class="page-summary">
                    共 <strong>{{ total }}</strong> 条
                </div>
                <div class="page-controls">
                    <button
                        class="page-btn"
                        :disabled="currentPage <= 1"
                        @click="
                            currentPage--;
                            loadList();
                        "
                    >
                        ‹
                    </button>
                    <span
                        style="
                            font-size: 13px;
                            color: var(--ink-muted);
                            padding: 0 8px;
                        "
                        >{{ currentPage }} / {{ totalPages }}</span
                    >
                    <button
                        class="page-btn"
                        :disabled="currentPage >= totalPages"
                        @click="
                            currentPage++;
                            loadList();
                        "
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Detail modal ── -->
        <div
            v-if="detailVisible"
            class="modal-mask show"
            @click.self="detailVisible = false"
        >
            <div class="modal modal-detail">
                <div class="modal-header">
                    <h3 class="font-serif">申请详情</h3>
                    <button class="modal-close" @click="detailVisible = false">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="detailLoading" class="detail-loading">
                        加载中…
                    </div>
                    <template v-else-if="detail">
                        <div class="detail-summary">
                            <div class="detail-avatar">👤</div>
                            <div class="detail-meta">
                                <div class="detail-name">
                                    {{ detail.realName ?? "—" }}
                                </div>
                                <div class="detail-sub">
                                    <span
                                        >用户 ID：{{
                                            formatUserId(detail.userId)
                                        }}</span
                                    >
                                    <span
                                        class="tag tag-jade"
                                        style="margin-left: 8px"
                                        >{{ roleLabel(detail.roleType) }}</span
                                    >
                                    <span
                                        class="tag"
                                        :class="statusPillClass(detail.status)"
                                        style="margin-left: 6px"
                                        >{{ statusLabel(detail.status) }}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <div class="detail-info-row">
                            <div class="detail-info-item">
                                <span class="detail-info-label">邮箱</span>
                                <span class="detail-info-value">{{
                                    detail.email ?? "未填写"
                                }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label">提交时间</span>
                                <span class="detail-info-value">{{
                                    formatDate(detail.createdAt)
                                }}</span>
                            </div>
                        </div>

                        <div v-if="detail.bio" class="detail-section">
                            <div class="detail-section-label">个人简介</div>
                            <div class="detail-bio">{{ detail.bio }}</div>
                        </div>

                        <div class="detail-section">
                            <div class="detail-section-label">证明材料</div>
                            <div
                                v-if="!detail.attachments?.length"
                                style="color: var(--ink-muted); font-size: 13px"
                            >
                                无附件
                            </div>
                            <div v-else class="attachment-grid">
                                <div
                                    v-for="att in detail.attachments"
                                    :key="att.docType"
                                    class="att-item"
                                >
                                    <div class="att-label">
                                        {{ docTypeLabel(att.docType) }}
                                    </div>
                                    <img
                                        :src="`${MINIO_BASE}/${att.url}`"
                                        :alt="att.fileName"
                                        class="att-img"
                                        @click="
                                            openLightbox(
                                                `${MINIO_BASE}/${att.url}`,
                                                att.fileName,
                                            )
                                        "
                                        @error="
                                            (
                                                $event.target as HTMLImageElement
                                            ).style.display = 'none'
                                        "
                                    />
                                    <div class="att-name">
                                        {{ att.fileName }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div
                    v-if="
                        detail &&
                        ['SUBMITTED', 'REVIEWING'].includes(detail.status)
                    "
                    class="modal-footer"
                >
                    <button class="modal-btn" @click="detailVisible = false">
                        取消
                    </button>
                    <button
                        class="modal-btn primary-cinnabar"
                        @click="showRejectDialogFromDetail"
                    >
                        ✕ 驳回
                    </button>
                    <button
                        class="modal-btn primary-jade"
                        @click="askApproveFromDetail"
                    >
                        ✓ 通过
                    </button>
                </div>
                <div v-else class="modal-footer">
                    <button class="modal-btn" @click="detailVisible = false">
                        关闭
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Approve confirm dialog ── -->
        <div
            v-if="approveConfirmVisible"
            class="modal-mask show"
            @click.self="approveConfirmVisible = false"
        >
            <div class="modal" style="max-width: 420px">
                <div class="modal-header">
                    <h3 class="font-serif">确认审核通过</h3>
                    <button
                        class="modal-close"
                        @click="approveConfirmVisible = false"
                    >
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <p
                        style="
                            font-size: 14px;
                            color: var(--ink);
                            line-height: 1.7;
                            margin: 0;
                        "
                    >
                        通过后将通知用户前往签约合同，用户完成签约后才会开通专家权限，是否确认？
                    </p>
                </div>
                <div class="modal-footer">
                    <button
                        class="modal-btn"
                        @click="approveConfirmVisible = false"
                    >
                        取消
                    </button>
                    <button
                        class="modal-btn primary-jade"
                        :disabled="approving"
                        @click="confirmApprove"
                    >
                        {{ approving ? "处理中…" : "✓ 确认通过" }}
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Reject dialog ── -->
        <div
            v-if="rejectDialogVisible"
            class="modal-mask show"
            @click.self="rejectDialogVisible = false"
        >
            <div class="modal">
                <div class="modal-header">
                    <h3 class="font-serif">驳回申请</h3>
                    <button
                        class="modal-close"
                        @click="rejectDialogVisible = false"
                    >
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <label>驳回原因 *</label>
                    <textarea
                        v-model="rejectReason"
                        rows="3"
                        placeholder="请填写驳回原因"
                    ></textarea>
                    <label style="margin-top: 12px; display: block"
                        >驳回建议（可选）</label
                    >
                    <textarea
                        v-model="rejectSuggestion"
                        rows="2"
                        placeholder="给申请者的改进建议"
                    ></textarea>
                </div>
                <div class="modal-footer">
                    <button
                        class="modal-btn"
                        @click="rejectDialogVisible = false"
                    >
                        取消
                    </button>
                    <button
                        class="modal-btn primary-cinnabar"
                        :disabled="rejecting"
                        @click="confirmReject"
                    >
                        {{ rejecting ? "处理中…" : "确认驳回" }}
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Lightbox ── -->
        <div
            v-if="lightboxVisible"
            class="lightbox-mask"
            @click="lightboxVisible = false"
        >
            <button class="lightbox-close" @click="lightboxVisible = false">
                ×
            </button>
            <img
                :src="lightboxSrc"
                :alt="lightboxAlt"
                class="lightbox-img"
                @click.stop
            />
        </div>

        <!-- ── Toast notification ── -->
        <Transition name="toast">
            <div
                v-if="toast.visible"
                class="toast"
                :class="`toast-${toast.type}`"
            >
                <span class="toast-icon">{{
                    toast.type === "success" ? "✓" : "✕"
                }}</span>
                <span class="toast-msg">{{ toast.message }}</span>
                <button class="toast-close" @click="toast.visible = false">
                    ×
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ApiExpert, type AdminApplicationVO } from "@/network/expert";

const roleOptions = [
    { value: "", label: "全部角色" },
    { value: "DOCTOR", label: "执业医师" },
    { value: "NUTRITIONIST", label: "营养师" },
    { value: "REHAB", label: "康复治疗师" },
    { value: "GURU", label: "养生达人" },
];

const emit = defineEmits<{ (e: "pending-count", n: number): void }>();

const MINIO_BASE = "http://localhost:9000/mingyi-public";

const statusTabs = [
    { label: "待审核", value: "SUBMITTED" },
    { label: "已通过", value: "APPROVED" },
    { label: "已驳回", value: "REJECTED" },
    { label: "全部", value: "" },
];

const activeStatus = ref("SUBMITTED");
const keyword = ref("");
const filterRole = ref("");
const sortOrder = ref<"desc" | "asc">("desc");
const filterDate = ref("");
const roleDropOpen = ref(false);
const roleDropRef = ref<HTMLElement | null>(null);
const datePickerOpen = ref(false);
const dateDropRef = ref<HTMLElement | null>(null);
const datePanelCursor = ref(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
);
const applications = ref<AdminApplicationVO[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / pageSize)),
);
const hasActiveFilters = computed(
    () =>
        !!filterRole.value || !!filterDate.value || sortOrder.value !== "desc",
);
const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];
const datePanelTitle = computed(() => {
    const cursor = datePanelCursor.value;
    return `${cursor.getFullYear()}年${String(cursor.getMonth() + 1).padStart(2, "0")}月`;
});
const datePanelDays = computed(() => {
    const cursor = datePanelCursor.value;
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());
    const todayIso = toIsoDate(new Date());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(
            gridStart.getFullYear(),
            gridStart.getMonth(),
            gridStart.getDate() + index,
        );
        const iso = toIsoDate(date);
        return {
            key: `${iso}-${index}`,
            day: date.getDate(),
            iso,
            inMonth: date.getMonth() === month,
            isToday: iso === todayIso,
            selected: iso === filterDate.value,
        };
    });
});

// Detail modal
const detailVisible = ref(false);
const detail = ref<AdminApplicationVO | null>(null);
const detailLoading = ref(false);

// Lightbox
const lightboxVisible = ref(false);
const lightboxSrc = ref("");
const lightboxAlt = ref("");

// Approve confirm
const approveConfirmVisible = ref(false);
const approving = ref(false);
let approveTargetId = 0;

// Reject dialog
const rejectDialogVisible = ref(false);
const rejecting = ref(false);
const rejectReason = ref("");
const rejectSuggestion = ref("");
let rejectTargetId = 0;

// Toast
const toast = reactive({
    visible: false,
    type: "success" as "success" | "error",
    message: "",
});
let toastTimer = 0;

function showToast(type: "success" | "error", message: string) {
    toast.type = type;
    toast.message = message;
    toast.visible = true;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.visible = false;
    }, 4500);
}

onMounted(() => {
    loadList();
    window.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocClick);
});
onUnmounted(() => {
    window.removeEventListener("keydown", onKeydown);
    document.removeEventListener("click", onDocClick);
    clearTimeout(toastTimer);
});

function onDocClick(e: MouseEvent) {
    if (roleDropRef.value && !roleDropRef.value.contains(e.target as Node)) {
        roleDropOpen.value = false;
    }
    if (dateDropRef.value && !dateDropRef.value.contains(e.target as Node)) {
        datePickerOpen.value = false;
    }
}

function pickRole(val: string) {
    filterRole.value = val;
    roleDropOpen.value = false;
    currentPage.value = 1;
    loadList();
}

function resetFilters() {
    filterRole.value = "";
    filterDate.value = "";
    sortOrder.value = "desc";
    datePickerOpen.value = false;
    currentPage.value = 1;
    loadList();
}

function clearSearch() {
    keyword.value = "";
    currentPage.value = 1;
    loadList();
}

function toggleDatePicker() {
    datePickerOpen.value = !datePickerOpen.value;
    if (datePickerOpen.value) {
        const baseDate = filterDate.value
            ? parseIsoDate(filterDate.value)
            : new Date();
        datePanelCursor.value = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            1,
        );
    }
}

function changeDateMonth(offset: number) {
    const cursor = datePanelCursor.value;
    datePanelCursor.value = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + offset,
        1,
    );
}

function pickDate(iso: string) {
    filterDate.value = iso;
    datePickerOpen.value = false;
    currentPage.value = 1;
    loadList();
}

function pickToday() {
    pickDate(toIsoDate(new Date()));
}

function clearDate() {
    if (!filterDate.value) return;
    filterDate.value = "";
    datePickerOpen.value = false;
    currentPage.value = 1;
    loadList();
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        if (datePickerOpen.value) {
            datePickerOpen.value = false;
            return;
        }
        if (lightboxVisible.value) {
            lightboxVisible.value = false;
            return;
        }
        if (detailVisible.value) {
            detailVisible.value = false;
            return;
        }
        if (approveConfirmVisible.value) {
            approveConfirmVisible.value = false;
            return;
        }
        if (rejectDialogVisible.value) {
            rejectDialogVisible.value = false;
        }
    }
}

async function loadList() {
    loading.value = true;
    try {
        const kw = keyword.value.trim();
        const res = await ApiExpert.adminListApplications(
            activeStatus.value || undefined,
            currentPage.value,
            pageSize,
            kw || undefined,
            filterRole.value || undefined,
            sortOrder.value,
            filterDate.value || undefined,
        );
        const raw = (res as any)?.data?.data;
        // 兼容两种后端返回格式：分页对象 { records, total } 或直接数组
        if (Array.isArray(raw)) {
            applications.value = raw;
            total.value = raw.length;
        } else {
            applications.value = raw?.records ?? [];
            total.value = raw?.total ?? 0;
        }

        // 同步侧边栏待审核数量
        const pendingRes = await ApiExpert.adminListApplications(
            "SUBMITTED",
            1,
            1,
        );
        const pendingRaw = (pendingRes as any)?.data?.data;
        const pendingTotal = Array.isArray(pendingRaw)
            ? pendingRaw.length
            : (pendingRaw?.total ?? 0);
        emit("pending-count", pendingTotal);
    } finally {
        loading.value = false;
    }
}

async function openDetail(app: AdminApplicationVO) {
    detail.value = null;
    detailLoading.value = true;
    detailVisible.value = true;
    try {
        const res = await ApiExpert.adminGetApplication(app.id);
        detail.value = (res as any)?.data?.data ?? null;
    } finally {
        detailLoading.value = false;
    }
}

function openLightbox(src: string, alt: string) {
    lightboxSrc.value = src;
    lightboxAlt.value = alt;
    lightboxVisible.value = true;
}

// Approve flow
function askApprove(appId: number) {
    approveTargetId = appId;
    approveConfirmVisible.value = true;
}

function askApproveFromDetail() {
    if (!detail.value) return;
    detailVisible.value = false;
    askApprove(detail.value.id);
}

async function confirmApprove() {
    approving.value = true;
    try {
        const res = await ApiExpert.adminReviewApplication(
            approveTargetId,
            "APPROVE",
        );
        ensureSuccess(res);
        approveConfirmVisible.value = false;
        showToast("success", "审核已通过，已通知用户前往签约");
        await loadList();
    } catch (e: any) {
        approveConfirmVisible.value = false;
        const msg =
            e?.response?.data?.message ?? e?.message ?? "操作失败，请重试";
        showToast("error", msg);
    } finally {
        approving.value = false;
    }
}

// Reject flow
function showRejectDialog(app: AdminApplicationVO) {
    rejectTargetId = app.id;
    rejectReason.value = "";
    rejectSuggestion.value = "";
    rejectDialogVisible.value = true;
}

function showRejectDialogFromDetail() {
    if (!detail.value) return;
    detailVisible.value = false;
    showRejectDialog(detail.value);
}

async function confirmReject() {
    if (!rejectReason.value.trim()) {
        showToast("error", "请填写驳回原因");
        return;
    }
    rejecting.value = true;
    try {
        const res = await ApiExpert.adminReviewApplication(
            rejectTargetId,
            "REJECT",
            rejectReason.value.trim(),
            rejectSuggestion.value.trim() || undefined,
        );
        ensureSuccess(res);
        rejectDialogVisible.value = false;
        showToast("success", "申请已驳回");
        await loadList();
    } catch (e: any) {
        const msg =
            e?.response?.data?.message ?? e?.message ?? "操作失败，请重试";
        showToast("error", msg);
    } finally {
        rejecting.value = false;
    }
}

function formatUserId(id: number | null | undefined) {
    return id != null ? "U" + String(id).padStart(5, "0") : "—";
}
function truncateBio(text: string | null | undefined) {
    if (!text) return "—";
    return text.length > 20 ? text.slice(0, 20) + "…" : text;
}
function roleLabel(r: string) {
    return (
        (
            {
                DOCTOR: "执业医师",
                NUTRITIONIST: "营养师",
                REHAB: "康复治疗师",
                GURU: "养生达人",
            } as any
        )[r] ?? r
    );
}
function statusLabel(s: string) {
    return (
        (
            {
                SUBMITTED: "待审核",
                REVIEWING: "审核中",
                APPROVED: "已通过",
                REJECTED: "已驳回",
                WITHDRAWN: "已撤回",
                SIGNED: "已签约",
                ACTIVATED: "已开通",
            } as any
        )[s] ?? s
    );
}
function statusPillClass(s: string) {
    return (
        (
            {
                SUBMITTED: "tag-gold",
                REVIEWING: "tag-gold",
                APPROVED: "tag-jade",
                SIGNED: "tag-jade",
                ACTIVATED: "tag-jade",
                REJECTED: "tag-cinnabar",
                WITHDRAWN: "tag-cinnabar",
            } as any
        )[s] ?? ""
    );
}
function docTypeLabel(d: string) {
    return (
        (
            {
                id_card_front: "身份证人像面",
                id_card_back: "身份证国徽面",
                medical_license: "医师资格证",
                practice_cert: "执业医师证",
                title_cert: "职称证明",
                nutrition_cert: "营养师资质证",
                rehab_cert: "康复治疗师执业证",
                other_cert: "其他资质",
            } as any
        )[d] ?? d
    );
}
function parseIsoDate(iso: string) {
    const parts = iso.split("-").map(Number);
    const year = parts[0] ?? new Date().getFullYear();
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    return new Date(year, month - 1, day);
}
function toIsoDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function formatFilterDate(iso: string) {
    const date = parseIsoDate(iso);
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日`;
}
function formatDate(s: string) {
    return s
        ? new Date(s).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";
}
function ensureSuccess(res: any) {
    const body = res?.data;
    if (body?.code != null && body.code !== 200) {
        throw new Error(body.message || "Operation failed");
    }
}
</script>

<style scoped>
.review-panel {
    padding: 24px 28px;
}
.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}
.section-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 10px;
}
.section-dot {
    width: 8px;
    height: 8px;
    background: var(--cinnabar);
    border-radius: 50%;
    flex-shrink: 0;
}
.empty-state {
    text-align: center;
    padding: 60px;
    color: var(--ink-muted);
}
.toolbar-card {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.96),
        var(--paper)
    );
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 8px 26px rgba(60, 50, 30, 0.07);
    border: 1px solid rgba(232, 223, 208, 0.72);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}
.status-tabs {
    display: inline-flex;
    background: var(--cream);
    border-radius: 10px;
    padding: 4px;
    flex-shrink: 0;
}
.status-tab {
    background: transparent;
    border: none;
    padding: 7px 16px;
    font-size: 14px;
    color: var(--ink-muted);
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
}
.status-tab.active {
    background: var(--paper);
    color: var(--cinnabar);
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

/* 筛选区居中 */
.filter-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(250, 246, 238, 0.72);
    border: 1px solid rgba(232, 223, 208, 0.72);
    border-radius: 12px;
    padding: 5px 7px 5px 10px;
    transition:
        border-color 0.18s,
        box-shadow 0.18s,
        background 0.18s;
}
.filter-group:hover {
    background: var(--paper);
    border-color: rgba(92, 131, 116, 0.36);
    box-shadow: 0 4px 12px rgba(60, 50, 30, 0.05);
}
.filter-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-muted);
    white-space: nowrap;
    letter-spacing: 0.02em;
}

/* 自定义角色下拉 */
.custom-select {
    position: relative;
}
.cs-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--paper);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    color: var(--ink);
    font-family: inherit;
    cursor: pointer;
    min-width: 112px;
    transition:
        border-color 0.15s,
        box-shadow 0.15s,
        background 0.15s;
}
.cs-trigger:hover {
    border-color: rgba(92, 131, 116, 0.38);
}
.custom-select.open .cs-trigger {
    border-color: var(--jade);
    box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.12);
    background: white;
}
.cs-text {
    flex: 1;
    text-align: left;
}
.cs-text.placeholder {
    color: #999;
}
.cs-arrow {
    flex-shrink: 0;
    color: var(--ink-muted);
    transition: transform 0.2s;
}
.custom-select.open .cs-arrow {
    transform: rotate(180deg);
}
.cs-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 100%;
    background: white;
    border-radius: 12px;
    box-shadow:
        0 12px 30px rgba(60, 50, 30, 0.16),
        0 2px 8px rgba(60, 50, 30, 0.08);
    border: 1px solid rgba(232, 223, 208, 0.9);
    z-index: 500;
    padding: 6px;
}
.cs-option {
    padding: 8px 14px;
    font-size: 13px;
    color: var(--ink);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s;
    white-space: nowrap;
}
.cs-option:hover {
    background: var(--cream);
}
.cs-option.active {
    color: var(--cinnabar);
    font-weight: 600;
    background: var(--cinnabar-soft, #fae5e0);
}

/* 排序 */
.sort-btns {
    display: inline-flex;
    background: var(--paper);
    border-radius: 8px;
    padding: 3px;
    border: 1px solid transparent;
}
.sort-btn {
    background: transparent;
    border: none;
    padding: 5px 12px;
    font-size: 13px;
    color: var(--ink-muted);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
}
.sort-btn.active {
    background: var(--paper);
    color: var(--cinnabar);
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

/* 日期 */
.date-picker {
    position: relative;
}
.date-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 148px;
    background: var(--paper);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    color: var(--ink);
    font-family: inherit;
    cursor: pointer;
    transition:
        border-color 0.15s,
        box-shadow 0.15s,
        background 0.15s;
}
.date-trigger:hover {
    border-color: rgba(92, 131, 116, 0.38);
}
.date-picker.open .date-trigger {
    border-color: var(--jade);
    background: white;
    box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.12);
}
.date-icon {
    width: 15px;
    height: 15px;
    border: 1.6px solid var(--jade);
    border-radius: 4px;
    position: relative;
    flex-shrink: 0;
    box-sizing: border-box;
    opacity: 0.85;
}
.date-icon::before {
    content: "";
    position: absolute;
    left: 2px;
    right: 2px;
    top: 4px;
    border-top: 1.6px solid var(--jade);
}
.date-icon::after {
    content: "";
    position: absolute;
    left: 3px;
    top: -3px;
    width: 7px;
    height: 4px;
    border-left: 1.6px solid var(--jade);
    border-right: 1.6px solid var(--jade);
}
.date-text {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}
.date-text.placeholder {
    color: #999;
}
.date-arrow {
    color: var(--ink-muted);
    font-size: 14px;
    line-height: 1;
    transition: transform 0.18s;
    transform-origin: center;
}
.date-picker.open .date-arrow {
    transform: rotate(180deg);
}
.date-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 284px;
    background: white;
    border: 1px solid rgba(232, 223, 208, 0.95);
    border-radius: 14px;
    box-shadow:
        0 16px 36px rgba(60, 50, 30, 0.16),
        0 2px 8px rgba(60, 50, 30, 0.08);
    z-index: 560;
    padding: 12px;
}
.date-panel::before {
    content: "";
    position: absolute;
    top: -6px;
    right: 24px;
    width: 10px;
    height: 10px;
    background: white;
    border-left: 1px solid rgba(232, 223, 208, 0.95);
    border-top: 1px solid rgba(232, 223, 208, 0.95);
    transform: rotate(45deg);
}
.date-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 2px 2px 10px;
}
.date-month-title {
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
}
.date-nav {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: var(--cream);
    color: var(--ink);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
        background 0.15s,
        color 0.15s,
        transform 0.15s;
}
.date-nav:hover {
    background: var(--jade);
    color: white;
    transform: translateY(-1px);
}
.date-week-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 6px;
    padding: 0 2px;
}
.date-week-row span {
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-muted);
}
.date-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}
.date-cell {
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--ink);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    transition:
        background 0.14s,
        color 0.14s,
        box-shadow 0.14s,
        transform 0.14s;
}
.date-cell:hover {
    background: var(--cream);
    transform: translateY(-1px);
}
.date-cell.muted {
    color: #b8afa3;
}
.date-cell.today {
    color: var(--cinnabar);
    font-weight: 700;
    box-shadow: inset 0 0 0 1px rgba(179, 60, 44, 0.28);
}
.date-cell.selected {
    background: var(--jade);
    color: white;
    font-weight: 700;
    box-shadow: 0 6px 14px rgba(92, 131, 116, 0.22);
}
.date-cell.selected.today {
    color: white;
    box-shadow: 0 6px 14px rgba(92, 131, 116, 0.22);
}
.date-panel-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-top: 1px solid rgba(232, 223, 208, 0.72);
    margin-top: 10px;
    padding-top: 10px;
}
.date-foot-btn {
    flex: 1;
    border: 1px solid rgba(92, 131, 116, 0.24);
    background: rgba(92, 131, 116, 0.09);
    color: var(--jade);
    border-radius: 8px;
    height: 32px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
}
.date-foot-btn:hover:not(:disabled) {
    background: var(--jade);
    color: white;
    box-shadow: 0 5px 12px rgba(92, 131, 116, 0.16);
}
.date-foot-btn.subtle {
    border-color: rgba(179, 60, 44, 0.18);
    background: rgba(179, 60, 44, 0.08);
    color: var(--cinnabar);
}
.date-foot-btn.subtle:hover:not(:disabled) {
    background: var(--cinnabar);
    color: white;
    box-shadow: 0 5px 12px rgba(179, 60, 44, 0.16);
}
.date-foot-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
.search-clear {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(44, 54, 57, 0.12);
    border: none;
    color: var(--ink-muted);
    font-size: 15px;
    cursor: pointer;
    padding: 0;
    border-radius: 50%;
    line-height: 1;
    transition: all 0.15s;
    flex-shrink: 0;
}
.search-clear:hover {
    color: white;
    background: var(--cinnabar);
}
.filter-reset {
    border: 1px solid rgba(179, 60, 44, 0.22);
    background: var(--cinnabar-soft, #fae5e0);
    color: var(--cinnabar);
    border-radius: 999px;
    padding: 7px 13px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.18s;
    white-space: nowrap;
}
.filter-reset:hover {
    background: var(--cinnabar);
    color: white;
    box-shadow: 0 4px 12px rgba(179, 60, 44, 0.18);
}

/* 搜索 */
.search-input {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 304px;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.9);
    border-radius: 999px;
    padding: 7px 8px 7px 13px;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(60, 50, 30, 0.05);
    transition:
        border-color 0.18s,
        box-shadow 0.18s,
        background 0.18s;
    box-sizing: border-box;
}
.search-input:focus-within {
    border-color: var(--jade);
    box-shadow:
        0 0 0 3px rgba(92, 131, 116, 0.12),
        0 8px 20px rgba(60, 50, 30, 0.08);
    background: white;
}
.search-input svg {
    color: var(--jade);
    flex-shrink: 0;
}
.search-input input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: var(--ink);
    font-family: inherit;
}
.search-input input::placeholder {
    color: #aaa;
}
.search-btn {
    background: var(--cinnabar);
    color: white;
    border: none;
    border-radius: 999px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition:
        background 0.15s,
        transform 0.15s,
        box-shadow 0.15s;
}
.search-btn:hover {
    background: #a03020;
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(179, 60, 44, 0.22);
}
.search-clear.hidden {
    visibility: hidden;
    pointer-events: none;
}
.table-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    border: 1px solid rgba(232, 223, 208, 0.5);
    overflow: hidden;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    table-layout: fixed;
}
thead {
    background: var(--cream);
}
th {
    text-align: left;
    font-weight: 500;
    font-size: 13px;
    color: var(--ink-muted);
    padding: 12px 16px;
    white-space: nowrap;
    overflow: hidden;
}
td {
    padding: 13px 14px;
    border-top: 1px solid var(--line);
    vertical-align: middle;
    overflow: hidden;
}
tr:hover td {
    background: rgba(250, 246, 238, 0.6);
}
.cell-uid {
    color: var(--ink-muted);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
.cell-date {
    color: var(--ink-muted);
    font-size: 12px;
    white-space: nowrap;
    text-align: center;
}
.applicant {
    display: flex;
    align-items: center;
    gap: 10px;
}
.applicant-avatar {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}
.applicant-name {
    font-weight: 600;
    color: var(--ink);
    font-size: 14px;
}
.bio-text {
    color: var(--ink);
    font-size: 14px;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.file-count {
    color: var(--ink);
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.tag {
    display: inline-block;
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 5px;
}
.tag-jade {
    background: var(--jade-soft);
    color: var(--jade);
}
.tag-gold {
    background: var(--gold-soft);
    color: var(--gold-deep, #a07840);
}
.tag-cinnabar {
    background: var(--cinnabar-soft);
    color: var(--cinnabar);
}
.btn-group {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
}
.btn {
    border: 1px solid var(--line);
    background: white;
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.btn-jade {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
}
.btn-jade:hover {
    background: #456660;
    border-color: #456660;
}
.btn-cinnabar {
    border-color: var(--cinnabar);
    color: var(--cinnabar);
    background: white;
}
.btn-cinnabar:hover {
    background: var(--cinnabar);
    color: white;
}
.btn-ghost {
    color: var(--ink-muted);
}
.pagination {
    padding: 14px 18px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.page-summary {
    font-size: 13px;
    color: var(--ink-muted);
}
.page-summary strong {
    color: var(--ink);
    font-weight: 600;
}
.page-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}
.page-btn {
    min-width: 32px;
    height: 32px;
    border: 1px solid var(--line);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    color: var(--ink);
}
.page-btn:hover:not(:disabled) {
    background: var(--cream);
}
.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* ── Modal base ── */
.modal-mask {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44, 54, 57, 0.42);
    backdrop-filter: blur(3px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
.modal-mask.show {
    display: flex;
}
.modal {
    background: white;
    border-radius: 14px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 8px 28px rgba(60, 50, 30, 0.12);
    max-height: 90vh;
    overflow: auto;
}
.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.modal-header h3 {
    font-family: "STKaiti", serif;
    font-size: 18px;
    color: var(--ink);
}
.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink-muted);
    font-size: 22px;
}
.modal-body {
    padding: 20px;
}
.modal-body label {
    font-size: 13px;
    color: var(--ink-muted);
    display: block;
    margin-bottom: 6px;
}
.modal-body textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 7px;
    font-family: inherit;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    resize: vertical;
    box-sizing: border-box;
}
.modal-body textarea:focus {
    border-color: var(--jade);
}
.modal-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
.modal-btn {
    padding: 8px 20px;
    border-radius: 7px;
    font-size: 14px;
    border: 1px solid var(--line);
    background: white;
    color: var(--ink);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
}
.modal-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}
.modal-btn.primary-cinnabar {
    background: var(--cinnabar);
    color: white;
    border-color: var(--cinnabar);
}
.modal-btn.primary-jade {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
}

/* ── Detail modal ── */
.modal-detail {
    max-width: 640px;
}
.detail-loading {
    text-align: center;
    padding: 40px;
    color: var(--ink-muted);
}
.detail-summary {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
}
.detail-avatar {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
}
.detail-name {
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 6px;
}
.detail-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 13px;
    color: var(--ink-muted);
}
.detail-info-row {
    display: flex;
    gap: 24px;
    background: var(--cream);
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
}
.detail-info-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.detail-info-label {
    font-size: 11px;
    color: var(--ink-muted);
}
.detail-info-value {
    font-size: 14px;
    color: var(--ink);
    font-weight: 500;
}
.detail-section {
    margin-bottom: 16px;
}
.detail-section-label {
    font-size: 12px;
    color: var(--ink-muted);
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.detail-bio {
    font-size: 14px;
    color: var(--ink);
    line-height: 1.7;
    background: var(--cream);
    border-radius: 8px;
    padding: 12px 14px;
}

/* ── Attachment grid ── */
.attachment-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.att-item {
    width: 148px;
}
.att-label {
    font-size: 11px;
    color: var(--ink-muted);
    margin-bottom: 4px;
}
.att-img {
    width: 148px;
    height: 96px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--line);
    display: block;
    cursor: zoom-in;
    transition:
        opacity 0.15s,
        box-shadow 0.15s;
}
.att-img:hover {
    opacity: 0.88;
    box-shadow: 0 2px 10px rgba(60, 50, 30, 0.18);
}
.att-name {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Lightbox ── */
.lightbox-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.82);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
}
.lightbox-img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 6px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
    cursor: default;
    object-fit: contain;
}
.lightbox-close {
    position: absolute;
    top: 20px;
    right: 24px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    font-size: 28px;
    cursor: pointer;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
}
.lightbox-close:hover {
    background: rgba(255, 255, 255, 0.28);
}

/* ── Toast ── */
.toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
    z-index: 3000;
    min-width: 260px;
    max-width: 480px;
}
.toast-success {
    background: #2d5a4f;
    color: white;
}
.toast-error {
    background: #8b2020;
    color: white;
}
.toast-icon {
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;
}
.toast-msg {
    flex: 1;
    line-height: 1.45;
}
.toast-close {
    background: transparent;
    border: none;
    color: inherit;
    font-size: 18px;
    cursor: pointer;
    opacity: 0.7;
    flex-shrink: 0;
    padding: 0;
}
.toast-close:hover {
    opacity: 1;
}
.toast-enter-active,
.toast-leave-active {
    transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
}
</style>
