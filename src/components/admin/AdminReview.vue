<template>
  <div class="review-panel">

    <div class="section-header">
      <div class="section-title"><span class="section-dot"></span>专家审核</div>
    </div>

    <!-- Status filter tabs -->
    <div class="toolbar-card">
      <div class="status-tabs">
        <button
          v-for="tab in statusTabs" :key="tab.value"
          class="status-tab" :class="{ active: activeStatus === tab.value }"
          @click="activeStatus = tab.value; currentPage = 1; loadList()"
        >{{ tab.label }}</button>
      </div>
      <div class="search-input" style="margin-left:auto">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="keyword" type="text" placeholder="搜索姓名 / 用户 ID" @input="currentPage = 1; loadList()" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">加载中…</div>

    <!-- Empty -->
    <div v-else-if="applications.length === 0" class="empty-state">暂无申请</div>

    <!-- Table -->
    <div v-else class="table-card">
      <table>
        <thead>
          <tr>
            <th>申请人</th><th>用户 ID</th><th>入驻角色</th>
            <th>个人简介</th><th>证明材料</th>
            <th>提交时间</th><th>状态</th><th style="text-align:right">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="app in applications" :key="app.id">
            <tr>
              <td>
                <div class="applicant">
                  <div class="applicant-avatar">👤</div>
                  <span class="applicant-name">{{ app.realName ?? '—' }}</span>
                </div>
              </td>
              <td style="color:var(--ink-muted);font-size:13px">{{ app.userId }}</td>
              <td><span class="tag tag-jade">{{ roleLabel(app.roleType) }}</span></td>
              <td><div class="bio-text">{{ app.bio ?? '—' }}</div></td>
              <td>
                <span class="file-count" style="cursor:pointer" @click="toggleDetail(app.id)">
                  📄 查看附件
                </span>
              </td>
              <td style="color:var(--ink-muted);font-size:13px;white-space:nowrap">{{ formatDate(app.createdAt) }}</td>
              <td><span class="tag" :class="statusPillClass(app.status)">{{ statusLabel(app.status) }}</span></td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-ghost" @click="toggleDetail(app.id)">详情</button>
                  <template v-if="app.status === 'SUBMITTED' || app.status === 'REVIEWING'">
                    <button class="btn btn-jade" @click="handleApprove(app.id)">✓ 通过</button>
                    <button class="btn btn-cinnabar" @click="showRejectDialog(app)">✕ 驳回</button>
                  </template>
                </div>
              </td>
            </tr>
            <!-- Expanded detail row -->
            <tr v-if="expandedId === app.id">
              <td colspan="8" style="padding:0;background:var(--paper-warm)">
                <div style="padding:16px 20px">
                  <div v-if="detailLoading" style="color:var(--ink-muted)">加载中…</div>
                  <template v-else-if="detail">
                    <div style="margin-bottom:10px;font-size:13px;color:var(--ink-muted)">手机号：{{ detail.phone ?? '未填写' }}</div>
                    <div class="attachment-grid">
                      <div v-for="att in detail.attachments" :key="att.docType" class="att-item">
                        <div class="att-label">{{ docTypeLabel(att.docType) }}</div>
                        <img
                          :src="`${MINIO_BASE}/${att.url}`" :alt="att.fileName"
                          class="att-img"
                          @error="($event.target as HTMLImageElement).style.display='none'"
                        />
                        <div class="att-name">{{ att.fileName }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <div class="page-summary">共 <strong>{{ total }}</strong> 条</div>
        <div class="page-controls">
          <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--; loadList()">‹</button>
          <span style="font-size:13px;color:var(--ink-muted);padding:0 8px">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++; loadList()">›</button>
        </div>
      </div>
    </div>

    <!-- Reject dialog -->
    <div v-if="rejectDialogVisible" class="modal-mask show" @click.self="rejectDialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="font-serif">驳回申请</h3>
          <button class="modal-close" @click="rejectDialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <label>驳回原因 *</label>
          <textarea v-model="rejectReason" rows="3" placeholder="请填写驳回原因"></textarea>
          <label style="margin-top:12px;display:block">驳回建议（可选）</label>
          <textarea v-model="rejectSuggestion" rows="2" placeholder="给申请者的改进建议"></textarea>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="rejectDialogVisible = false">取消</button>
          <button class="modal-btn primary-cinnabar" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiExpert, type AdminApplicationVO } from '@/network/expert'

const emit = defineEmits<{ (e: 'pending-count', n: number): void }>()

const MINIO_BASE = 'http://localhost:9000/mingyi-public'

const statusTabs = [
  { label: '待审核', value: 'SUBMITTED' },
  { label: '审核中', value: 'REVIEWING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '全部',   value: '' },
]

const activeStatus    = ref('SUBMITTED')
const keyword         = ref('')
const applications    = ref<AdminApplicationVO[]>([])
const loading         = ref(false)
const currentPage     = ref(1)
const pageSize        = 20
const total           = ref(0)
const totalPages      = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

const expandedId      = ref<number | null>(null)
const detail          = ref<AdminApplicationVO | null>(null)
const detailLoading   = ref(false)

const rejectDialogVisible = ref(false)
const rejectReason        = ref('')
const rejectSuggestion    = ref('')
let rejectTargetId        = 0

onMounted(loadList)

async function loadList() {
  loading.value = true
  try {
    const res = await ApiExpert.adminListApplications(activeStatus.value || undefined, currentPage.value, pageSize)
    const data = (res as any)?.data?.data
    applications.value = data?.records ?? []
    total.value        = data?.total   ?? 0
    // emit pending count for sidebar badge
    const pendingRes = await ApiExpert.adminListApplications('SUBMITTED', 1, 1)
    emit('pending-count', (pendingRes as any)?.data?.data?.total ?? 0)
  } finally {
    loading.value = false
  }
}

async function toggleDetail(id: number) {
  if (expandedId.value === id) { expandedId.value = null; detail.value = null; return }
  expandedId.value = id; detail.value = null; detailLoading.value = true
  try {
    const res = await ApiExpert.adminGetApplication(id)
    detail.value = (res as any)?.data?.data ?? null
  } finally { detailLoading.value = false }
}

async function handleApprove(appId: number) {
  if (!confirm('确认审核通过？通过后将自动创建专家账号并升级用户权限。')) return
  try {
    await ApiExpert.adminReviewApplication(appId, 'APPROVE')
    alert('已通过！')
    expandedId.value = null
    await loadList()
  } catch (e: any) { alert(e?.response?.data?.message ?? '操作失败') }
}

function showRejectDialog(app: AdminApplicationVO) {
  rejectTargetId = app.id
  rejectReason.value = ''; rejectSuggestion.value = ''
  rejectDialogVisible.value = true
}

async function confirmReject() {
  if (!rejectReason.value.trim()) { alert('请填写驳回原因'); return }
  try {
    await ApiExpert.adminReviewApplication(
      rejectTargetId, 'REJECT',
      rejectReason.value.trim(), rejectSuggestion.value.trim() || undefined,
    )
    rejectDialogVisible.value = false
    expandedId.value = null
    await loadList()
  } catch (e: any) { alert(e?.response?.data?.message ?? '操作失败') }
}

// Utility labels
function roleLabel(r: string)   { return ({ DOCTOR:'执业医师', NUTRITIONIST:'营养师', REHAB:'康复治疗师', GURU:'养生达人' } as any)[r] ?? r }
function statusLabel(s: string) { return ({ SUBMITTED:'待审核', REVIEWING:'审核中', APPROVED:'已通过', REJECTED:'已驳回', WITHDRAWN:'已撤回', SIGNED:'已签约', ACTIVATED:'已开通' } as any)[s] ?? s }
function statusPillClass(s: string) { return ({ SUBMITTED:'tag-gold', REVIEWING:'tag-gold', APPROVED:'tag-jade', REJECTED:'tag-cinnabar' } as any)[s] ?? '' }
function docTypeLabel(d: string) { return ({ id_card_front:'身份证人像面', id_card_back:'身份证国徽面', medical_license:'医师资格证', practice_cert:'执业医师证', title_cert:'职称证明', nutrition_cert:'营养师资质证', rehab_cert:'康复治疗师执业证', other_cert:'其他资质' } as any)[d] ?? d }
function formatDate(s: string)  { return s ? new Date(s).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—' }
</script>

<style scoped>
.review-panel { padding: 24px 28px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title  { font-family:"STKaiti",serif; font-size:19px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:10px; }
.section-dot    { width:8px; height:8px; background:var(--cinnabar); border-radius:50%; flex-shrink:0; }
.empty-state    { text-align:center; padding:60px; color:var(--ink-muted); }
.toolbar-card   { background:var(--paper); border-radius:14px; padding:14px; box-shadow:0 2px 12px rgba(60,50,30,0.06); border:1px solid rgba(232,223,208,0.5); margin-bottom:16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.status-tabs    { display:inline-flex; background:var(--cream); border-radius:10px; padding:4px; }
.status-tab     { background:transparent; border:none; padding:7px 16px; font-size:14px; color:var(--ink-muted); border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.status-tab.active { background:var(--paper); color:var(--cinnabar); font-weight:600; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
.search-input   { display:flex; align-items:center; gap:6px; background:var(--cream); border:1px solid var(--line); border-radius:8px; padding:8px 12px; width:280px; }
.search-input input { flex:1; background:transparent; border:none; outline:none; font-size:14px; color:var(--ink); font-family:inherit; }
.table-card     { background:var(--paper); border-radius:14px; box-shadow:0 2px 12px rgba(60,50,30,0.06); border:1px solid rgba(232,223,208,0.5); overflow:hidden; }
table           { width:100%; border-collapse:collapse; font-size:14px; }
thead           { background:var(--cream); }
th              { text-align:left; font-weight:500; font-size:13px; color:var(--ink-muted); padding:12px 18px; }
td              { padding:13px 18px; border-top:1px solid var(--line); vertical-align:middle; }
tr:hover td     { background:rgba(250,246,238,0.6); }
.applicant      { display:flex; align-items:center; gap:10px; }
.applicant-avatar { width:36px; height:36px; border-radius:9px; background:var(--cream); display:flex; align-items:center; justify-content:center; font-size:18px; }
.applicant-name { font-weight:600; color:var(--ink); font-size:14px; }
.bio-text       { color:var(--ink); font-size:14px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; max-width:280px; }
.file-count     { color:var(--ink); font-size:13px; display:inline-flex; align-items:center; gap:4px; }
.tag            { display:inline-block; padding:3px 10px; font-size:12px; border-radius:5px; }
.tag-jade       { background:var(--jade-soft); color:var(--jade); }
.tag-gold       { background:var(--gold-soft); color:var(--gold-deep,#A07840); }
.tag-cinnabar   { background:var(--cinnabar-soft); color:var(--cinnabar); }
.btn-group      { display:flex; gap:6px; justify-content:flex-end; align-items:center; }
.btn            { border:1px solid var(--line); background:white; padding:6px 12px; font-size:12px; border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; display:inline-flex; align-items:center; gap:4px; }
.btn-jade       { background:var(--jade); color:white; border-color:var(--jade); }
.btn-jade:hover { background:#456660; border-color:#456660; }
.btn-cinnabar   { border-color:var(--cinnabar); color:var(--cinnabar); background:white; }
.btn-cinnabar:hover { background:var(--cinnabar); color:white; }
.btn-ghost      { color:var(--ink-muted); }
.pagination     { padding:14px 18px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.page-summary   { font-size:13px; color:var(--ink-muted); }
.page-summary strong { color:var(--ink); font-weight:600; }
.page-controls  { display:flex; align-items:center; gap:8px; }
.page-btn       { min-width:32px; height:32px; border:1px solid var(--line); background:white; border-radius:6px; cursor:pointer; font-family:inherit; font-size:14px; color:var(--ink); }
.page-btn:hover:not(:disabled) { background:var(--cream); }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.attachment-grid { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:12px; }
.att-item { width:140px; }
.att-label { font-size:11px; color:var(--ink-muted); margin-bottom:4px; }
.att-img   { width:140px; height:90px; object-fit:cover; border-radius:6px; border:1px solid var(--line); display:block; }
.att-name  { font-size:11px; color:var(--ink-muted); margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Modal */
.modal-mask  { display:none; position:fixed; inset:0; background:rgba(44,54,57,0.42); backdrop-filter:blur(3px); z-index:1000; justify-content:center; align-items:center; padding:20px; }
.modal-mask.show { display:flex; }
.modal       { background:white; border-radius:14px; max-width:480px; width:100%; box-shadow:0 8px 28px rgba(60,50,30,0.12); max-height:90vh; overflow:auto; }
.modal-header { padding:16px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.modal-header h3 { font-family:"STKaiti",serif; font-size:18px; color:var(--ink); }
.modal-close { background:transparent; border:none; cursor:pointer; color:var(--ink-muted); font-size:22px; }
.modal-body  { padding:20px; }
.modal-body label { font-size:13px; color:var(--ink-muted); display:block; margin-bottom:6px; }
.modal-body textarea { width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:7px; font-family:inherit; font-size:14px; color:var(--ink); outline:none; resize:vertical; box-sizing:border-box; }
.modal-body textarea:focus { border-color:var(--jade); }
.modal-footer { padding:14px 20px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:8px; }
.modal-btn   { padding:8px 20px; border-radius:7px; font-size:14px; border:1px solid var(--line); background:white; color:var(--ink); cursor:pointer; font-family:inherit; transition:all 0.15s; }
.modal-btn.primary-cinnabar { background:var(--cinnabar); color:white; border-color:var(--cinnabar); }
</style>
