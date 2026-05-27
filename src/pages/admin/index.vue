<template>
    <div class="admin-page">
        <header class="admin-header">
            <div class="admin-header-inner">
                <h2 class="font-serif">⚕️ 专家认证审核后台</h2>
                <button class="btn btn-ghost btn-sm" @click="$router.push('/')">← 返回首页</button>
            </div>
        </header>

        <main class="admin-body">
            <!-- 状态筛选 -->
            <div class="status-tabs">
                <button v-for="tab in statusTabs" :key="tab.value"
                        class="s-tab" :class="{ active: activeStatus === tab.value }"
                        @click="activeStatus = tab.value; currentPage = 1; loadList()">
                    {{ tab.label }}
                </button>
            </div>

            <!-- 加载中 -->
            <div v-if="loading" style="text-align:center; padding:60px; color:var(--ink-muted);">
                加载中...
            </div>

            <!-- 空状态 -->
            <div v-else-if="applications.length === 0"
                 style="text-align:center; padding:60px; color:var(--ink-muted);">
                暂无申请
            </div>

            <!-- 申请列表 -->
            <div v-else class="app-list">
                <div v-for="app in applications" :key="app.id" class="app-row">
                    <div class="app-main" @click="toggleDetail(app.id)">
                        <div class="app-info">
                            <span class="app-name">{{ app.realName ?? '—' }}</span>
                            <span class="app-role pill" :class="rolePillClass(app.roleType)">{{ roleLabel(app.roleType) }}</span>
                            <span class="app-status pill" :class="statusPillClass(app.status)">{{ statusLabel(app.status) }}</span>
                        </div>
                        <div class="app-meta">
                            <span>用户 ID：{{ app.userId }}</span>
                            <span>手机：{{ app.phone ?? '加载详情可见' }}</span>
                            <span>提交：{{ formatDate(app.createdAt) }}</span>
                        </div>
                        <div class="app-bio">{{ app.bio ?? '—' }}</div>
                    </div>

                    <!-- 展开详情 -->
                    <div v-if="expandedId === app.id" class="app-detail">
                        <div v-if="detailLoading" style="padding:12px; color:var(--ink-muted);">加载中...</div>
                        <template v-else-if="detail">
                            <div style="margin-bottom:12px;">
                                <strong>手机号：</strong>{{ detail.phone ?? '未填写' }}
                            </div>
                            <!-- 附件图片 -->
                            <div class="attachment-grid">
                                <div v-for="att in detail.attachments" :key="att.docType" class="att-item">
                                    <div class="att-label">{{ docTypeLabel(att.docType) }}</div>
                                    <img :src="`${MINIO_BASE}/${att.url}`" :alt="att.fileName"
                                         class="att-img"
                                         @error="($event.target as HTMLImageElement).style.display = 'none'" />
                                    <div class="att-name">{{ att.fileName }}</div>
                                </div>
                            </div>

                            <!-- 操作按钮（仅 SUBMITTED/REVIEWING 可操作） -->
                            <div v-if="detail.status === 'SUBMITTED' || detail.status === 'REVIEWING'"
                                 class="review-actions">
                                <button class="btn" @click="handleApprove(detail.id)">✅ 通过</button>
                                <button class="btn btn-cinnabar" @click="showRejectDialog(detail)">❌ 驳回</button>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
                <button class="btn btn-ghost btn-sm" :disabled="currentPage <= 1"
                        @click="currentPage--; loadList()">上一页</button>
                <span style="padding:0 16px;">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
                <button class="btn btn-ghost btn-sm" :disabled="currentPage >= totalPages"
                        @click="currentPage++; loadList()">下一页</button>
            </div>
        </main>

        <!-- 驳回弹窗 -->
        <div v-if="rejectDialogVisible" class="dialog-overlay" @click.self="rejectDialogVisible = false">
            <div class="dialog">
                <h3 class="font-serif" style="margin-bottom:16px;">驳回申请</h3>
                <label style="font-size:13px; color:var(--ink-muted);">驳回原因 *</label>
                <textarea v-model="rejectReason" rows="3" placeholder="请填写驳回原因"
                          style="width:100%; margin:6px 0 12px; padding:8px 12px; border:1px solid var(--gold-soft); border-radius:8px; font-family:inherit; box-sizing:border-box; resize:none;"></textarea>
                <label style="font-size:13px; color:var(--ink-muted);">驳回建议（可选）</label>
                <textarea v-model="rejectSuggestion" rows="2" placeholder="给申请者的改进建议"
                          style="width:100%; margin:6px 0 16px; padding:8px 12px; border:1px solid var(--gold-soft); border-radius:8px; font-family:inherit; box-sizing:border-box; resize:none;"></textarea>
                <div style="display:flex; gap:12px; justify-content:flex-end;">
                    <button class="btn btn-ghost" @click="rejectDialogVisible = false">取消</button>
                    <button class="btn btn-cinnabar" @click="confirmReject">确认驳回</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ApiExpert, type AdminApplicationVO } from '@/network/expert';

const MINIO_BASE = 'http://localhost:9000/mingyi-public';

const statusTabs = [
    { label: '待审核', value: 'SUBMITTED' },
    { label: '审核中', value: 'REVIEWING' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
    { label: '全部',   value: '' },
];

const activeStatus = ref('SUBMITTED');
const applications = ref<AdminApplicationVO[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 20;
const total = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

const expandedId = ref<number | null>(null);
const detail = ref<AdminApplicationVO | null>(null);
const detailLoading = ref(false);

const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const rejectSuggestion = ref('');
let rejectTargetId = 0;

onMounted(() => loadList());

async function loadList() {
    loading.value = true;
    try {
        const res = await ApiExpert.adminListApplications(activeStatus.value || undefined, currentPage.value, pageSize);
        const data = (res as any)?.data?.data;
        applications.value = data?.records ?? [];
        total.value = data?.total ?? 0;
    } finally {
        loading.value = false;
    }
}

async function toggleDetail(id: number) {
    if (expandedId.value === id) {
        expandedId.value = null;
        detail.value = null;
        return;
    }
    expandedId.value = id;
    detail.value = null;
    detailLoading.value = true;
    try {
        const res = await ApiExpert.adminGetApplication(id);
        detail.value = (res as any)?.data?.data ?? null;
    } finally {
        detailLoading.value = false;
    }
}

async function handleApprove(appId: number) {
    if (!confirm('确认审核通过？通过后将自动创建专家账号并升级用户权限。')) return;
    try {
        await ApiExpert.adminReviewApplication(appId, 'APPROVE');
        alert('已通过！');
        expandedId.value = null;
        await loadList();
    } catch (e: any) {
        alert(e?.response?.data?.message ?? '操作失败');
    }
}

function showRejectDialog(app: AdminApplicationVO) {
    rejectTargetId = app.id;
    rejectReason.value = '';
    rejectSuggestion.value = '';
    rejectDialogVisible.value = true;
}

async function confirmReject() {
    if (!rejectReason.value.trim()) { alert('请填写驳回原因'); return; }
    try {
        await ApiExpert.adminReviewApplication(rejectTargetId, 'REJECT',
            rejectReason.value.trim(), rejectSuggestion.value.trim() || undefined);
        rejectDialogVisible.value = false;
        expandedId.value = null;
        await loadList();
    } catch (e: any) {
        alert(e?.response?.data?.message ?? '操作失败');
    }
}

// 工具函数
function roleLabel(r: string) {
    return { DOCTOR: '执业医师', NUTRITIONIST: '营养师', REHAB: '康复治疗师', GURU: '养生达人' }[r] ?? r;
}
function statusLabel(s: string) {
    return { SUBMITTED: '待审核', REVIEWING: '审核中', APPROVED: '已通过',
             REJECTED: '已驳回', WITHDRAWN: '已撤回', SIGNED: '已签约', ACTIVATED: '已开通' }[s] ?? s;
}
function rolePillClass(r: string) {
    return { DOCTOR: 'pill-jade', NUTRITIONIST: 'pill-gold', REHAB: 'pill-moon', GURU: 'pill-cinnabar' }[r] ?? '';
}
function statusPillClass(s: string) {
    return { SUBMITTED: 'pill-gold', REVIEWING: 'pill-gold', APPROVED: 'pill-jade',
             REJECTED: 'pill-cinnabar', WITHDRAWN: 'pill-gray' }[s] ?? '';
}
function docTypeLabel(d: string) {
    return { id_card_front: '身份证人像面', id_card_back: '身份证国徽面',
             medical_license: '医师资格证', practice_cert: '执业医师证',
             title_cert: '职称证明', nutrition_cert: '营养师资质证',
             rehab_cert: '康复治疗师执业证', other_cert: '其他资质' }[d] ?? d;
}
function formatDate(s: string) {
    return s ? new Date(s).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
}
</script>

<style scoped lang="scss">
.admin-page { min-height: 100vh; background: var(--cream, #FDFAF3); }
.admin-header { background: var(--paper, white); border-bottom: 1px solid var(--gold-soft, #e8d5a3); padding: 0 40px; }
.admin-header-inner { max-width: 1200px; margin: 0 auto; padding: 20px 0; display: flex; align-items: center; justify-content: space-between; }
.admin-body { max-width: 1200px; margin: 0 auto; padding: 32px 40px; }
.status-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.s-tab { padding: 8px 20px; border-radius: 20px; border: 1px solid var(--gold-soft, #e8d5a3); background: white; cursor: pointer; font-family: inherit; font-size: 13px; transition: all .2s; }
.s-tab.active { background: var(--jade, #5c8374); color: white; border-color: var(--jade, #5c8374); }
.app-list { display: flex; flex-direction: column; gap: 12px; }
.app-row { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.06); border: 1px solid rgba(232,223,208,.4); overflow: hidden; }
.app-main { padding: 16px 20px; cursor: pointer; transition: background .2s; }
.app-main:hover { background: var(--cream, #fdfaf3); }
.app-info { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.app-name { font-weight: 600; font-size: 15px; }
.app-meta { font-size: 12px; color: var(--ink-muted, #6b7280); display: flex; gap: 16px; margin-bottom: 4px; }
.app-bio { font-size: 13px; color: var(--ink-muted); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 600px; }
.app-detail { padding: 16px 20px; border-top: 1px solid var(--gold-soft, #e8d5a3); background: #fdfaf3; }
.attachment-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.att-item { width: 140px; }
.att-label { font-size: 11px; color: var(--ink-muted); margin-bottom: 4px; }
.att-img { width: 140px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid var(--gold-soft); display: block; }
.att-name { font-size: 11px; color: var(--ink-muted); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.review-actions { display: flex; gap: 12px; margin-top: 12px; }
.pagination { display: flex; align-items: center; justify-content: center; margin-top: 24px; }
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog { background: white; border-radius: 14px; padding: 28px; width: 440px; max-width: 90vw; }
</style>
