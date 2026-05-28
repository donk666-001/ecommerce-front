<template>
  <div class="perms-panel">

    <!-- Toast -->
    <Transition name="toast-slide">
      <div v-if="toast.visible" class="toast" :class="toast.type === 'ok' ? 'toast-ok' : 'toast-err'">
        <svg v-if="toast.type === 'ok'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Confirm Dialog -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="dialog.visible" class="dialog-overlay" @click.self="cancelDialog">
          <div class="dialog-box">
            <div class="dialog-title">{{ dialog.title }}</div>
            <div class="dialog-body">{{ dialog.message }}</div>
            <div class="dialog-footer">
              <button class="btn btn-ghost-sm" :disabled="dialog.loading" @click="cancelDialog">取消</button>
              <button class="btn" :class="dialog.confirmClass" :disabled="dialog.loading" @click="runDialog">
                {{ dialog.loading ? '执行中…' : dialog.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Role dropdown portal (outside table to avoid overflow:hidden clipping) -->
    <Teleport to="body">
      <div
        v-if="openDropdownUserId !== null && currentOpenUser"
        class="ap-role-menu"
        :style="menuStyle"
        @click.stop
      >
        <button
          v-for="[code, label] in ROLE_ENTRIES"
          :key="code"
          class="ap-role-option"
          :class="{ 'ap-role-selected': currentOpenUser.roleCode === code }"
          @click="selectRole(currentOpenUser, code)"
        >
          <span class="ap-role-dot" :style="{ background: ROLE_COLORS[code] }"></span>
          <span class="ap-role-opt-label">{{ label }}</span>
          <svg v-if="currentOpenUser.roleCode === code" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto;flex-shrink:0;color:var(--jade,#2E8B57)"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </Teleport>

    <div class="section-header">
      <div class="section-title"><span class="section-dot"></span>权限设置</div>
    </div>

    <div class="toolbar-card">
      <div class="status-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="status-tab"
          :class="{ active: activeStatus === tab.value }"
          @click="activeStatus = tab.value; currentPage = 1; loadUsers()"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="filter-center">
        <div class="filter-group">
          <span class="filter-label">角色</span>
          <div class="custom-select" :class="{ open: roleDropOpen }" ref="roleDropRef">
            <button type="button" class="cs-trigger" @click="roleDropOpen = !roleDropOpen">
              <span :class="['cs-text', { placeholder: !filterRole }]">
                {{ filterRole ? roleFilterLabel(filterRole) : '全部角色' }}
              </span>
              <svg class="cs-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
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

        <div class="filter-group">
          <span class="filter-label">排序</span>
          <div class="sort-btns">
            <button type="button" class="sort-btn" :class="{ active: sortOrder === 'desc' }" @click="sortOrder='desc';currentPage=1;loadUsers()">最新↓</button>
            <button type="button" class="sort-btn" :class="{ active: sortOrder === 'asc' }" @click="sortOrder='asc';currentPage=1;loadUsers()">最早↑</button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">日期</span>
          <div class="date-picker" :class="{ open: datePickerOpen }" ref="dateDropRef">
            <button type="button" class="date-trigger" @click="toggleDatePicker">
              <span class="date-icon" aria-hidden="true"></span>
              <span :class="['date-text', { placeholder: !filterDate }]">
                {{ filterDate ? formatFilterDate(filterDate) : '全部日期' }}
              </span>
              <span class="date-arrow" aria-hidden="true">⌄</span>
            </button>
            <div v-if="datePickerOpen" class="date-panel">
              <div class="date-panel-head">
                <button type="button" class="date-nav" title="上个月" @click="changeDateMonth(-1)">‹</button>
                <div class="date-month-title">{{ datePanelTitle }}</div>
                <button type="button" class="date-nav" title="下个月" @click="changeDateMonth(1)">›</button>
              </div>
              <div class="date-week-row">
                <span v-for="day in weekLabels" :key="day">{{ day }}</span>
              </div>
              <div class="date-grid">
                <button
                  v-for="day in datePanelDays"
                  :key="day.key"
                  type="button"
                  class="date-cell"
                  :class="{ muted: !day.inMonth, today: day.isToday, selected: day.selected }"
                  @click="pickDate(day.iso)"
                >
                  {{ day.day }}
                </button>
              </div>
              <div class="date-panel-foot">
                <button type="button" class="date-foot-btn" @click="pickToday">今天</button>
                <button type="button" class="date-foot-btn subtle" :disabled="!filterDate" @click="clearDate">清除</button>
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

      <div class="search-input">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="keyword" type="text" placeholder="搜索姓名 / 用户 ID / 邮箱" @keyup.enter="currentPage=1;loadUsers()" />
        <button
          type="button"
          class="search-clear"
          :class="{ hidden: !keyword }"
          :disabled="!keyword"
          title="清除搜索"
          @click="clearSearch"
        >×</button>
        <button type="button" class="search-btn" @click="currentPage=1;loadUsers()">查询</button>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" style="text-align:center;padding:48px;color:var(--ink-muted)">加载中…</div>

      <div v-else-if="users.length === 0" style="text-align:center;padding:48px;color:var(--ink-muted)">
        暂无账号数据
      </div>

      <template v-else>
        <table>
          <thead>
            <tr>
              <th>用户名</th><th>用户 ID</th><th>邮箱</th><th>角色</th>
              <th>加入时间</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.userId" :class="{ 'row-self': isSelf(u) }">
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <span class="applicant-name">{{ u.nickname }}</span>
                  <span v-if="isSelf(u)" class="self-badge">本账号</span>
                </div>
              </td>
              <td style="color:var(--ink-muted);font-size:13px">{{ u.displayId }}</td>
              <td>{{ u.email }}</td>
              <td>
                <!-- Custom role dropdown trigger -->
                <div class="ap-role-select" @click.stop>
                  <button
                    class="ap-role-trigger"
                    :class="{ 'ap-open': openDropdownUserId === u.userId }"
                    :disabled="isSelf(u)"
                    :title="isSelf(u) ? '不能修改自己的角色' : '点击修改角色'"
                    @click="toggleDropdown(u.userId, $event)"
                  >
                    <span class="ap-role-dot" :style="{ background: ROLE_COLORS[u.roleCode] }"></span>
                    <span class="ap-role-name">{{ ROLE_LABELS[u.roleCode] ?? '未知' }}</span>
                    <svg class="ap-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </td>
              <td style="color:var(--ink-muted);font-size:13px">{{ formatDate(u.createdAt) }}</td>
              <td>
                <span class="status-pill" :class="u.status === 1 ? 'pill-ok' : u.status === 2 ? 'pill-lock' : 'pill-no'">
                  <span class="led"></span>
                  {{ u.status === 1 ? '已启用' : u.status === 2 ? '已锁定' : '已禁用' }}
                </span>
              </td>
              <td>
                <template v-if="isSelf(u)"></template>
                <div v-else-if="u.status !== 2" class="btn-group">
                  <button v-if="u.status === 1" class="btn btn-cinnabar" @click="confirmToggleStatus(u)">禁用</button>
                  <button v-else class="btn btn-jade" @click="confirmToggleStatus(u)">启用</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ApiAdmin, type UserAdminVO } from '@/network/admin'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const currentUserId = computed(() => userStore.G_LoginInfo.id)

const statusTabs = [
  { label: '全部', value: '' },
  { label: '已启用', value: '1' },
  { label: '已禁用', value: '0' },
]
const roleOptions = [
  { value: '', label: '全部角色' },
  { value: '100', label: '管理员' },
  { value: '200', label: '专家' },
  { value: '300', label: '普通用户' },
]

const users       = ref<UserAdminVO[]>([])
const loading     = ref(false)
const activeStatus = ref('')
const keyword     = ref('')
const filterRole  = ref('')
const sortOrder   = ref<'desc' | 'asc'>('desc')
const filterDate  = ref('')
const roleDropOpen = ref(false)
const roleDropRef  = ref<HTMLElement | null>(null)
const datePickerOpen = ref(false)
const dateDropRef = ref<HTMLElement | null>(null)
const datePanelCursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const currentPage = ref(1)
const pageSize    = 10
const total       = ref(0)
const totalPages  = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const hasActiveFilters = computed(() =>
  !!filterRole.value || !!filterDate.value || sortOrder.value !== 'desc'
)
const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const datePanelTitle = computed(() => {
  const cursor = datePanelCursor.value
  return `${cursor.getFullYear()}年${String(cursor.getMonth() + 1).padStart(2, '0')}月`
})
const datePanelDays = computed(() => {
  const cursor = datePanelCursor.value
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstDay.getDay())
  const todayIso = toIsoDate(new Date())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
    const iso = toIsoDate(date)
    return {
      key: `${iso}-${index}`,
      day: date.getDate(),
      iso,
      inMonth: date.getMonth() === month,
      isToday: iso === todayIso,
      selected: iso === filterDate.value,
    }
  })
})

// ── Role constants ────────────────────────────────────────────────────────
const ROLE_LABELS: Record<number, string> = { 100: '管理员', 200: '专家', 300: '普通用户' }
const ROLE_COLORS: Record<number, string> = {
  100: 'var(--cinnabar, #C0392B)',
  200: 'var(--jade, #2E8B57)',
  300: '#9E8E7E',
}
const ROLE_ENTRIES: [number, string][] = [[100, '管理员'], [200, '专家'], [300, '普通用户']]

// ── Role dropdown ─────────────────────────────────────────────────────────
const openDropdownUserId = ref<number | null>(null)
const dropdownPos = ref({ top: 0, left: 0, width: 0 })
const currentOpenUser = computed(() =>
  users.value.find(u => u.userId === openDropdownUserId.value) ?? null
)
const menuStyle = computed(() => ({
  position: 'fixed' as const,
  top: dropdownPos.value.top + 'px',
  left: dropdownPos.value.left + 'px',
  minWidth: Math.max(dropdownPos.value.width, 140) + 'px',
  zIndex: 4000,
}))

function toggleDropdown(userId: number, event: MouseEvent) {
  if (openDropdownUserId.value === userId) {
    openDropdownUserId.value = null
    return
  }
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  dropdownPos.value = { top: rect.bottom + 6, left: rect.left, width: rect.width }
  openDropdownUserId.value = userId
}

function closeTableRoleDropdown() {
  openDropdownUserId.value = null
}

function closeAllDropdowns() {
  openDropdownUserId.value = null
  roleDropOpen.value = false
  datePickerOpen.value = false
}

function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  openDropdownUserId.value = null
  if (roleDropRef.value && !roleDropRef.value.contains(target)) {
    roleDropOpen.value = false
  }
  if (dateDropRef.value && !dateDropRef.value.contains(target)) {
    datePickerOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeAllDropdowns()
}

function selectRole(u: UserAdminVO, newRoleCode: number) {
  closeAllDropdowns()
  if (newRoleCode === u.roleCode) return

  showConfirm({
    title: '修改角色权限',
    message: `确定将 "${u.nickname}" 的角色修改为【${ROLE_LABELS[newRoleCode]}】吗？`,
    confirmLabel: '确认修改',
    confirmClass: 'btn-confirm-primary',
    onConfirm: async () => {
      await ApiAdmin.updateUserRole(u.userId, newRoleCode)
      u.roleCode = newRoleCode
      u.roleName = ROLE_LABELS[newRoleCode] ?? '普通用户'
      showToast(`已将 "${u.nickname}" 的角色修改为【${ROLE_LABELS[newRoleCode]}】`)
    },
  })
}

function pickRole(val: string) {
  filterRole.value = val
  roleDropOpen.value = false
  currentPage.value = 1
  loadUsers()
}

function roleFilterLabel(roleCode: string) {
  return roleOptions.find(opt => opt.value === roleCode)?.label ?? roleCode
}

function resetFilters() {
  filterRole.value = ''
  filterDate.value = ''
  sortOrder.value = 'desc'
  datePickerOpen.value = false
  currentPage.value = 1
  loadUsers()
}

function clearSearch() {
  keyword.value = ''
  currentPage.value = 1
  loadUsers()
}

function toggleDatePicker() {
  datePickerOpen.value = !datePickerOpen.value
  if (datePickerOpen.value) {
    const baseDate = filterDate.value ? parseIsoDate(filterDate.value) : new Date()
    datePanelCursor.value = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  }
}

function changeDateMonth(offset: number) {
  const cursor = datePanelCursor.value
  datePanelCursor.value = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1)
}

function pickDate(iso: string) {
  filterDate.value = iso
  datePickerOpen.value = false
  currentPage.value = 1
  loadUsers()
}

function pickToday() {
  pickDate(toIsoDate(new Date()))
}

function clearDate() {
  if (!filterDate.value) return
  filterDate.value = ''
  datePickerOpen.value = false
  currentPage.value = 1
  loadUsers()
}

// ── Toast ─────────────────────────────────────────────────────────────────
const toast = ref({ visible: false, message: '', type: 'ok' as 'ok' | 'err' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'ok' | 'err' = 'ok') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { visible: true, message, type }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
}

// ── Confirm Dialog ────────────────────────────────────────────────────────
const dialog = ref({
  visible: false, title: '', message: '',
  confirmLabel: '确认', confirmClass: 'btn-confirm-danger',
  loading: false, onConfirm: async () => {},
})

function showConfirm(opts: {
  title: string; message: string; confirmLabel?: string
  confirmClass?: string; onConfirm: () => Promise<void>
}) {
  dialog.value = {
    visible: true, loading: false,
    confirmLabel: opts.confirmLabel ?? '确认',
    confirmClass: opts.confirmClass ?? 'btn-confirm-danger',
    title: opts.title, message: opts.message, onConfirm: opts.onConfirm,
  }
}

function cancelDialog() {
  if (dialog.value.loading) return
  dialog.value.visible = false
}

async function runDialog() {
  dialog.value.loading = true
  try {
    await dialog.value.onConfirm()
    dialog.value.visible = false
  } catch (e: any) {
    dialog.value.loading = false
    showToast(e?.response?.data?.message ?? '操作失败，请稍后重试', 'err')
  }
}

// ── Self-guard ────────────────────────────────────────────────────────────
function isSelf(u: UserAdminVO): boolean {
  return u.userId === currentUserId.value
}

// ── Data ──────────────────────────────────────────────────────────────────
onMounted(() => {
  loadUsers()
  document.addEventListener('click', onDocClick)
  document.addEventListener('scroll', closeTableRoleDropdown, true)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('scroll', closeTableRoleDropdown, true)
  document.removeEventListener('keydown', onKeydown)
  if (toastTimer) clearTimeout(toastTimer)
})

async function loadUsers() {
  loading.value = true
  try {
    const kw = keyword.value.trim()
    const res = await ApiAdmin.listUsers(
      kw || undefined,
      currentPage.value,
      pageSize,
      activeStatus.value || undefined,
      filterRole.value || undefined,
      sortOrder.value,
      filterDate.value || undefined,
    )
    const data = (res as any)?.data?.data
    users.value = data?.records ?? []
    total.value = data?.total   ?? 0
  } finally {
    loading.value = false
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  loadUsers()
}

// ── Status toggle ─────────────────────────────────────────────────────────
function confirmToggleStatus(u: UserAdminVO) {
  const willDisable = u.status === 1
  showConfirm({
    title: willDisable ? '禁用账号' : '启用账号',
    message: willDisable
      ? `确定禁用 "${u.nickname}" 的账号吗？禁用后该用户将无法登录系统。`
      : `确定启用 "${u.nickname}" 的账号吗？`,
    confirmLabel: willDisable ? '确认禁用' : '确认启用',
    confirmClass: willDisable ? 'btn-confirm-danger' : 'btn-confirm-primary',
    onConfirm: async () => {
      const newStatus = willDisable ? 0 : 1
      await ApiAdmin.updateUserStatus(u.userId, newStatus)
      u.status = newStatus
      showToast(willDisable ? `已禁用 "${u.nickname}" 的账号` : `已启用 "${u.nickname}" 的账号`)
    },
  })
}

function formatDate(s: string): string {
  return s ? new Date(s).toLocaleDateString('zh-CN') : '—'
}

function parseIsoDate(iso: string) {
  const parts = iso.split('-').map(Number)
  const year = parts[0] ?? new Date().getFullYear()
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatFilterDate(iso: string) {
  const date = parseIsoDate(iso)
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
}
</script>

<style scoped>
.perms-panel { padding: 24px 28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.section-title  { font-family:"STKaiti",serif; font-size:19px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:10px; }
.section-dot    { width:8px; height:8px; background:var(--cinnabar); border-radius:50%; flex-shrink:0; }
.table-card     { background:var(--paper); border-radius:14px; box-shadow:0 2px 12px rgba(60,50,30,0.06); border:1px solid rgba(232,223,208,0.5); overflow:hidden; }
.toolbar-card   { background:linear-gradient(180deg, rgba(255,255,255,0.96), var(--paper)); border-radius:16px; padding:14px 16px; box-shadow:0 8px 26px rgba(60,50,30,0.07); border:1px solid rgba(232,223,208,0.72); margin-bottom:16px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.status-tabs    { display:inline-flex; background:var(--cream); border-radius:10px; padding:4px; flex-shrink:0; }
.status-tab     { background:transparent; border:none; padding:7px 16px; font-size:14px; color:var(--ink-muted); border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap; }
.status-tab.active { background:var(--paper); color:var(--cinnabar); font-weight:600; box-shadow:0 1px 4px rgba(0,0,0,0.07); }

.filter-center  { flex:1; display:flex; justify-content:center; align-items:center; gap:12px; flex-wrap:wrap; }
.filter-group   { display:flex; align-items:center; gap:8px; background:rgba(250,246,238,0.72); border:1px solid rgba(232,223,208,0.72); border-radius:12px; padding:5px 7px 5px 10px; transition:border-color .18s, box-shadow .18s, background .18s; }
.filter-group:hover { background:var(--paper); border-color:rgba(92,131,116,0.36); box-shadow:0 4px 12px rgba(60,50,30,0.05); }
.filter-label   { font-size:12px; font-weight:700; color:var(--ink-muted); white-space:nowrap; letter-spacing:.02em; }

.custom-select          { position:relative; }
.cs-trigger             { display:flex; align-items:center; gap:8px; background:var(--paper); border:1px solid transparent; border-radius:8px; padding:6px 10px; font-size:13px; color:var(--ink); font-family:inherit; cursor:pointer; min-width:112px; transition:border-color 0.15s, box-shadow 0.15s, background .15s; }
.cs-trigger:hover       { border-color:rgba(92,131,116,0.38); }
.custom-select.open .cs-trigger { border-color:var(--jade); box-shadow:0 0 0 3px rgba(92,131,116,0.12); background:white; }
.cs-text                { flex:1; text-align:left; }
.cs-text.placeholder    { color:#999; }
.cs-arrow               { flex-shrink:0; color:var(--ink-muted); transition:transform 0.2s; }
.custom-select.open .cs-arrow { transform:rotate(180deg); }
.cs-menu                { position:absolute; top:calc(100% + 8px); left:0; min-width:100%; background:white; border-radius:12px; box-shadow:0 12px 30px rgba(60,50,30,0.16), 0 2px 8px rgba(60,50,30,0.08); border:1px solid rgba(232,223,208,0.9); z-index:500; padding:6px; }
.cs-option              { padding:8px 14px; font-size:13px; color:var(--ink); border-radius:8px; cursor:pointer; transition:background 0.12s; white-space:nowrap; }
.cs-option:hover        { background:var(--cream); }
.cs-option.active       { color:var(--cinnabar); font-weight:600; background:var(--cinnabar-soft,#FAE5E0); }

.sort-btns      { display:inline-flex; background:var(--paper); border-radius:8px; padding:3px; border:1px solid transparent; }
.sort-btn       { background:transparent; border:none; padding:5px 12px; font-size:13px; color:var(--ink-muted); border-radius:6px; cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap; }
.sort-btn.active { background:var(--paper); color:var(--cinnabar); font-weight:600; box-shadow:0 1px 4px rgba(0,0,0,0.07); }

.date-picker    { position:relative; }
.date-trigger   { display:flex; align-items:center; gap:8px; min-width:148px; background:var(--paper); border:1px solid transparent; border-radius:8px; padding:6px 10px; font-size:13px; color:var(--ink); font-family:inherit; cursor:pointer; transition:border-color 0.15s, box-shadow .15s, background .15s; }
.date-trigger:hover { border-color:rgba(92,131,116,0.38); }
.date-picker.open .date-trigger { border-color:var(--jade); background:white; box-shadow:0 0 0 3px rgba(92,131,116,0.12); }
.date-icon      { width:15px; height:15px; border:1.6px solid var(--jade); border-radius:4px; position:relative; flex-shrink:0; box-sizing:border-box; opacity:.85; }
.date-icon::before { content:""; position:absolute; left:2px; right:2px; top:4px; border-top:1.6px solid var(--jade); }
.date-icon::after  { content:""; position:absolute; left:3px; top:-3px; width:7px; height:4px; border-left:1.6px solid var(--jade); border-right:1.6px solid var(--jade); }
.date-text      { flex:1; text-align:left; white-space:nowrap; font-variant-numeric:tabular-nums; }
.date-text.placeholder { color:#999; }
.date-arrow     { color:var(--ink-muted); font-size:14px; line-height:1; transition:transform .18s; transform-origin:center; }
.date-picker.open .date-arrow { transform:rotate(180deg); }
.date-panel     { position:absolute; top:calc(100% + 8px); right:0; width:284px; background:white; border:1px solid rgba(232,223,208,0.95); border-radius:14px; box-shadow:0 16px 36px rgba(60,50,30,0.16), 0 2px 8px rgba(60,50,30,0.08); z-index:560; padding:12px; }
.date-panel::before { content:""; position:absolute; top:-6px; right:24px; width:10px; height:10px; background:white; border-left:1px solid rgba(232,223,208,0.95); border-top:1px solid rgba(232,223,208,0.95); transform:rotate(45deg); }
.date-panel-head { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:2px 2px 10px; }
.date-month-title { flex:1; text-align:center; font-size:14px; font-weight:700; color:var(--ink); font-variant-numeric:tabular-nums; }
.date-nav       { width:30px; height:30px; border:none; border-radius:8px; background:var(--cream); color:var(--ink); font-size:22px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s, color .15s, transform .15s; }
.date-nav:hover { background:var(--jade); color:white; transform:translateY(-1px); }
.date-week-row  { display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; margin-bottom:6px; padding:0 2px; }
.date-week-row span { text-align:center; font-size:11px; font-weight:700; color:var(--ink-muted); }
.date-grid      { display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; }
.date-cell      { height:32px; border:none; border-radius:8px; background:transparent; color:var(--ink); font-size:13px; font-family:inherit; cursor:pointer; font-variant-numeric:tabular-nums; transition:background .14s, color .14s, box-shadow .14s, transform .14s; }
.date-cell:hover { background:var(--cream); transform:translateY(-1px); }
.date-cell.muted { color:#b8afa3; }
.date-cell.today { color:var(--cinnabar); font-weight:700; box-shadow:inset 0 0 0 1px rgba(179,60,44,0.28); }
.date-cell.selected { background:var(--jade); color:white; font-weight:700; box-shadow:0 6px 14px rgba(92,131,116,0.22); }
.date-cell.selected.today { color:white; box-shadow:0 6px 14px rgba(92,131,116,0.22); }
.date-panel-foot { display:flex; align-items:center; justify-content:space-between; gap:8px; border-top:1px solid rgba(232,223,208,0.72); margin-top:10px; padding-top:10px; }
.date-foot-btn  { flex:1; border:1px solid rgba(92,131,116,0.24); background:rgba(92,131,116,0.09); color:var(--jade); border-radius:8px; height:32px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:all .15s; }
.date-foot-btn:hover:not(:disabled) { background:var(--jade); color:white; box-shadow:0 5px 12px rgba(92,131,116,0.16); }
.date-foot-btn.subtle { border-color:rgba(179,60,44,0.18); background:rgba(179,60,44,0.08); color:var(--cinnabar); }
.date-foot-btn.subtle:hover:not(:disabled) { background:var(--cinnabar); color:white; box-shadow:0 5px 12px rgba(179,60,44,0.16); }
.date-foot-btn:disabled { opacity:.45; cursor:not-allowed; }
.filter-reset   { border:1px solid rgba(179,60,44,0.22); background:var(--cinnabar-soft,#FAE5E0); color:var(--cinnabar); border-radius:999px; padding:7px 13px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .18s; white-space:nowrap; }
.filter-reset:hover { background:var(--cinnabar); color:white; box-shadow:0 4px 12px rgba(179,60,44,0.18); }

.search-input   { display:flex; align-items:center; gap:8px; width:304px; background:var(--paper); border:1px solid rgba(232,223,208,0.9); border-radius:999px; padding:7px 8px 7px 13px; flex-shrink:0; box-shadow:0 4px 14px rgba(60,50,30,0.05); transition:border-color .18s, box-shadow .18s, background .18s; box-sizing:border-box; }
.search-input:focus-within { border-color:var(--jade); box-shadow:0 0 0 3px rgba(92,131,116,0.12), 0 8px 20px rgba(60,50,30,0.08); background:white; }
.search-input svg { color:var(--jade); flex-shrink:0; }
.search-input input { flex:1; min-width:0; background:transparent; border:none; outline:none; font-size:14px; color:var(--ink); font-family:inherit; }
.search-input input::placeholder { color:#aaa; }
.search-clear { width:22px; height:22px; display:flex; align-items:center; justify-content:center; background:rgba(44,54,57,0.12); border:none; color:var(--ink-muted); font-size:15px; cursor:pointer; padding:0; border-radius:50%; line-height:1; transition:all 0.15s; flex-shrink:0; }
.search-clear:hover { color:white; background:var(--cinnabar); }
.search-clear.hidden { visibility:hidden; pointer-events:none; }
.search-btn     { background:var(--cinnabar); color:white; border:none; border-radius:999px; padding:7px 14px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; white-space:nowrap; transition:background 0.15s, transform .15s, box-shadow .15s; }
.search-btn:hover { background:#a03020; transform:translateY(-1px); box-shadow:0 5px 12px rgba(179,60,44,0.22); }

table           { width:100%; border-collapse:collapse; font-size:14px; }
thead           { background:var(--cream); }
th              { text-align:left; font-weight:500; font-size:13px; color:var(--ink-muted); padding:12px 18px; }
td              { padding:13px 18px; border-top:1px solid var(--line); vertical-align:middle; }
th:nth-child(n+4), td:nth-child(n+4) { text-align:center; }
tr:hover td     { background:rgba(250,246,238,0.6); }
.row-self td    { background:rgba(250,246,238,0.35); }
.applicant-name { font-weight:600; color:var(--ink); font-size:14px; }
.self-badge     { display:inline-block; padding:2px 7px; font-size:11px; border-radius:4px; background:rgba(160,120,64,0.1); color:var(--gold-deep,#A07840); border:1px solid rgba(160,120,64,0.2); }

/* ── Role select trigger ── */
.ap-role-select { display:inline-block; }
.ap-role-trigger {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 9px 5px 8px;
  border: 1px solid var(--line); border-radius: 7px;
  background: white; cursor: pointer; font-family: inherit;
  font-size: 13px; color: var(--ink);
  transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
  white-space: nowrap; user-select: none;
}
.ap-role-trigger:hover:not(:disabled) {
  background: var(--cream);
  border-color: rgba(120,100,70,0.35);
}
.ap-role-trigger.ap-open {
  background: var(--cream);
  border-color: rgba(120,100,70,0.45);
  box-shadow: 0 0 0 3px rgba(120,100,70,0.08);
}
.ap-role-trigger:disabled { opacity:0.55; cursor:not-allowed; }
.ap-role-dot  { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
.ap-role-name { font-size:13px; }
.ap-chevron   {
  flex-shrink:0; color:var(--ink-muted);
  transition: transform 0.15s ease-out;
}
.ap-role-trigger.ap-open .ap-chevron { transform:rotate(180deg); }

.status-pill    { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; font-size:12px; border-radius:5px; }
.status-pill .led { width:6px; height:6px; border-radius:50%; }
.pill-ok  { background:var(--jade-soft); color:var(--jade); }
.pill-ok .led { background:var(--jade); }
.pill-no  { background:var(--cinnabar-soft); color:var(--cinnabar); }
.pill-no .led { background:var(--cinnabar); }
.pill-lock { background:var(--gold-soft); color:var(--gold-deep,#A07840); }
.pill-lock .led { background:var(--gold-deep,#A07840); }

.btn-group      { display:flex; gap:6px; justify-content:center; }
.btn            { border:1px solid var(--line); background:white; padding:6px 12px; font-size:12px; border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.btn-jade       { background:var(--jade); color:white; border-color:var(--jade); }
.btn-cinnabar   { border-color:var(--cinnabar); color:var(--cinnabar); background:white; }
.btn-cinnabar:hover { background:var(--cinnabar); color:white; }
.btn-ghost-sm   { border:1px solid var(--line); background:white; color:var(--ink-muted); padding:7px 16px; font-size:13px; border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.btn-ghost-sm:hover { background:var(--cream); }

.pagination     { padding:14px 18px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.page-summary   { font-size:13px; color:var(--ink-muted); }
.page-summary strong { color:var(--ink); font-weight:600; }
.page-controls  { display:flex; align-items:center; gap:8px; }
.page-btn       { min-width:32px; height:32px; border:1px solid var(--line); background:white; border-radius:6px; cursor:pointer; font-family:inherit; font-size:14px; color:var(--ink); }
.page-btn:hover:not(:disabled) { background:var(--cream); }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }

/* ── Confirm Dialog ── */
.dialog-overlay {
  position:fixed; inset:0; z-index:2000;
  background:rgba(40,30,20,0.42);
  display:flex; align-items:center; justify-content:center;
  backdrop-filter:blur(2px);
}
.dialog-box {
  background:var(--paper,#fffef9); border-radius:14px;
  box-shadow:0 8px 40px rgba(40,30,20,0.18);
  border:1px solid rgba(232,223,208,0.6);
  padding:28px 32px; max-width:400px; width:90%;
}
.dialog-title {
  font-family:"STKaiti",serif; font-size:17px; font-weight:600;
  color:var(--ink); margin-bottom:12px;
}
.dialog-body  { font-size:14px; color:var(--ink-muted); line-height:1.7; margin-bottom:24px; }
.dialog-footer { display:flex; justify-content:flex-end; gap:10px; }
.btn-confirm-danger {
  background:var(--cinnabar,#C0392B); color:white;
  border:none; padding:7px 20px; font-size:13px;
  border-radius:7px; cursor:pointer; font-family:inherit; transition:opacity 0.15s;
}
.btn-confirm-danger:hover:not(:disabled) { opacity:0.88; }
.btn-confirm-danger:disabled { opacity:0.5; cursor:not-allowed; }
.btn-confirm-primary {
  background:var(--jade,#2E8B57); color:white;
  border:none; padding:7px 20px; font-size:13px;
  border-radius:7px; cursor:pointer; font-family:inherit; transition:opacity 0.15s;
}
.btn-confirm-primary:hover:not(:disabled) { opacity:0.88; }
.btn-confirm-primary:disabled { opacity:0.5; cursor:not-allowed; }

/* ── Toast ── */
.toast {
  position:fixed; top:24px; left:50%; transform:translateX(-50%);
  z-index:3000; display:flex; align-items:center; gap:8px;
  padding:10px 20px; border-radius:10px; font-size:14px;
  box-shadow:0 4px 20px rgba(40,30,20,0.14);
  white-space:nowrap; pointer-events:none;
}
.toast-ok  { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
.toast-err { background:#fff1f2; color:#9f1239; border:1px solid #fecdd3; }

/* ── Transitions ── */
.toast-slide-enter-active, .toast-slide-leave-active { transition:opacity 0.22s, transform 0.22s; }
.toast-slide-enter-from { opacity:0; transform:translateX(-50%) translateY(-10px); }
.toast-slide-leave-to   { opacity:0; transform:translateX(-50%) translateY(-10px); }
.dialog-fade-enter-active, .dialog-fade-leave-active { transition:opacity 0.18s; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity:0; }
</style>

<!-- Portal styles: not scoped — needed for Teleport'd elements outside this component's DOM -->
<style>
.ap-role-menu {
  background: var(--paper, #fffef9);
  border: 1px solid rgba(200,185,160,0.55);
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(40,30,20,0.13), 0 1px 4px rgba(40,30,20,0.06);
  overflow: hidden;
  animation: apMenuIn 0.14s ease-out;
}
@keyframes apMenuIn {
  from { opacity: 0; transform: translateY(-5px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ap-role-option {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 9px 14px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; color: var(--ink, #3A2E20);
  text-align: left; transition: background 0.1s;
}
.ap-role-option:hover { background: var(--cream, #FAF6EE); }
.ap-role-option.ap-role-selected { font-weight: 600; }
.ap-role-option .ap-role-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.ap-role-option .ap-role-opt-label { flex: 1; }

/* Separator lines between options */
.ap-role-option + .ap-role-option {
  border-top: 1px solid rgba(200,185,160,0.25);
}
</style>
