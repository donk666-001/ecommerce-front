<template>
  <div class="perms-panel">

    <div class="section-header">
      <div class="section-title"><span class="section-dot"></span>权限设置</div>
    </div>

    <div class="table-card">
      <div class="toolbar-row">
        <h3 class="font-serif">账号权限管理</h3>
        <div class="search-input">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="keyword" type="text" placeholder="搜索姓名 / 用户 ID / 邮箱" @keyup.enter="onSearch" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" style="text-align:center;padding:48px;color:var(--ink-muted)">加载中…</div>

      <!-- Empty -->
      <div v-else-if="users.length === 0" style="text-align:center;padding:48px;color:var(--ink-muted)">未找到匹配的账号</div>

      <!-- Table -->
      <template v-else>
        <table>
          <thead>
            <tr>
              <th>用户名</th><th>用户 ID</th><th>邮箱</th><th>角色</th>
              <th>加入时间</th><th>状态</th><th style="text-align:right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.userId">
              <td><span class="applicant-name">{{ u.nickname }}</span></td>
              <td style="color:var(--ink-muted);font-size:13px">{{ u.displayId }}</td>
              <td>{{ u.email }}</td>
              <td>
                <select class="sel" :value="u.roleCode" @change="updateRole(u.userId, Number(($event.target as HTMLSelectElement).value))">
                  <option :value="100">管理员</option>
                  <option :value="200">专家</option>
                  <option :value="300">普通用户</option>
                </select>
              </td>
              <td style="color:var(--ink-muted);font-size:13px">{{ formatDate(u.createdAt) }}</td>
              <td>
                <span class="status-pill" :class="u.status === 1 ? 'pill-ok' : u.status === 2 ? 'pill-lock' : 'pill-no'">
                  <span class="led"></span>
                  {{ u.status === 1 ? '已启用' : u.status === 2 ? '已锁定' : '已禁用' }}
                </span>
              </td>
              <td>
                <div class="btn-group" v-if="u.status !== 2">
                  <button v-if="u.status === 1" class="btn btn-cinnabar" @click="toggleStatus(u.userId, u.status)">禁用</button>
                  <button v-else class="btn btn-jade" @click="toggleStatus(u.userId, u.status)">启用</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <div class="page-summary">共 <strong>{{ total }}</strong> 条</div>
          <div class="page-controls">
            <button class="page-btn" :disabled="currentPage <= 1" @click="onPageChange(currentPage - 1)">‹</button>
            <span style="font-size:13px;color:var(--ink-muted);padding:0 8px">{{ currentPage }} / {{ totalPages }}</span>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="onPageChange(currentPage + 1)">›</button>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiAdmin, type UserAdminVO } from '@/network/admin'

const users     = ref<UserAdminVO[]>([])
const loading   = ref(false)
const keyword   = ref('')
const currentPage = ref(1)
const pageSize    = 10
const total       = ref(0)
const totalPages  = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

onMounted(() => loadUsers())

async function loadUsers() {
  loading.value = true
  try {
    const res = await ApiAdmin.listUsers(keyword.value, currentPage.value, pageSize)
    const data = (res as any)?.data?.data
    users.value = data?.records ?? []
    total.value = data?.total   ?? 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  loadUsers()
}

function onPageChange(page: number) {
  currentPage.value = page
  loadUsers()
}

async function updateRole(userId: number, roleCode: number) {
  try {
    await ApiAdmin.updateUserRole(userId, roleCode)
    const u = users.value.find(x => x.userId === userId)
    if (u) {
      u.roleCode = roleCode
      const labels: Record<number, string> = { 100: '管理员', 200: '专家', 300: '普通用户' }
      u.roleName = labels[roleCode] ?? '普通用户'
    }
  } catch (e: any) { alert(e?.response?.data?.message ?? '操作失败') }
}

async function toggleStatus(userId: number, currentStatus: number) {
  const newStatus = currentStatus === 1 ? 0 : 1
  const label = newStatus === 0 ? '禁用' : '启用'
  if (!confirm(`确认${label}该账号？`)) return
  try {
    await ApiAdmin.updateUserStatus(userId, newStatus)
    const u = users.value.find(x => x.userId === userId)
    if (u) u.status = newStatus
  } catch (e: any) { alert(e?.response?.data?.message ?? '操作失败') }
}

function formatDate(s: string): string {
  return s ? new Date(s).toLocaleDateString('zh-CN') : '—'
}
</script>

<style scoped>
.perms-panel { padding: 24px 28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.section-title  { font-family:"STKaiti",serif; font-size:19px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:10px; }
.section-dot    { width:8px; height:8px; background:var(--cinnabar); border-radius:50%; flex-shrink:0; }
.table-card     { background:var(--paper); border-radius:14px; box-shadow:0 2px 12px rgba(60,50,30,0.06); border:1px solid rgba(232,223,208,0.5); overflow:hidden; }
.toolbar-row    { padding:16px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.toolbar-row h3 { font-family:"STKaiti",serif; font-size:17px; color:var(--ink); }
.search-input   { display:flex; align-items:center; gap:6px; background:var(--cream); border:1px solid var(--line); border-radius:8px; padding:8px 12px; width:280px; }
.search-input input { flex:1; background:transparent; border:none; outline:none; font-size:14px; color:var(--ink); font-family:inherit; }
table           { width:100%; border-collapse:collapse; font-size:14px; }
thead           { background:var(--cream); }
th              { text-align:left; font-weight:500; font-size:13px; color:var(--ink-muted); padding:12px 18px; }
td              { padding:13px 18px; border-top:1px solid var(--line); vertical-align:middle; }
tr:hover td     { background:rgba(250,246,238,0.6); }
.applicant-name { font-weight:600; color:var(--ink); font-size:14px; }
.sel            { padding:5px 8px; border:1px solid var(--line); border-radius:5px; background:white; font-family:inherit; font-size:13px; color:var(--ink); }
.status-pill    { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; font-size:12px; border-radius:5px; }
.status-pill .led { width:6px; height:6px; border-radius:50%; }
.pill-ok        { background:var(--jade-soft); color:var(--jade); }
.pill-ok .led   { background:var(--jade); }
.pill-no        { background:var(--cinnabar-soft); color:var(--cinnabar); }
.pill-no .led   { background:var(--cinnabar); }

.btn-group      { display:flex; gap:6px; justify-content:flex-end; }
.btn            { border:1px solid var(--line); background:white; padding:6px 12px; font-size:12px; border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.btn-jade       { background:var(--jade); color:white; border-color:var(--jade); }
.btn-cinnabar   { border-color:var(--cinnabar); color:var(--cinnabar); background:white; }
.btn-cinnabar:hover { background:var(--cinnabar); color:white; }
.pill-lock     { background:var(--gold-soft); color:var(--gold-deep,#A07840); }
.pill-lock .led { background:var(--gold-deep,#A07840); }
.pagination     { padding:14px 18px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.page-summary   { font-size:13px; color:var(--ink-muted); }
.page-summary strong { color:var(--ink); font-weight:600; }
.page-controls  { display:flex; align-items:center; gap:8px; }
.page-btn       { min-width:32px; height:32px; border:1px solid var(--line); background:white; border-radius:6px; cursor:pointer; font-family:inherit; font-size:14px; color:var(--ink); }
.page-btn:hover:not(:disabled) { background:var(--cream); }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
</style>
