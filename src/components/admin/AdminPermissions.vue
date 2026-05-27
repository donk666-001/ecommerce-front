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
          <input v-model="keyword" type="text" placeholder="搜索姓名 / 手机号 / 用户 ID" />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>姓名</th><th>用户 ID</th><th>手机号</th><th>角色</th>
            <th>加入时间</th><th>状态</th><th style="text-align:right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="7" style="text-align:center;padding:48px;color:var(--ink-muted)">未找到匹配的账号</td>
          </tr>
          <tr v-for="a in filtered" :key="a.id">
            <td><span class="applicant-name">{{ a.name }}</span></td>
            <td style="color:var(--ink-muted);font-size:13px">{{ a.id }}</td>
            <td>{{ a.phone }}</td>
            <td>
              <select class="sel" :value="a.role" @change="updateRole(a.id, ($event.target as HTMLSelectElement).value)">
                <option value="admin">管理员</option>
                <option value="expert">专家</option>
                <option value="user">普通用户</option>
              </select>
            </td>
            <td style="color:var(--ink-muted);font-size:13px">{{ a.joinedAt }}</td>
            <td>
              <span class="status-pill" :class="a.enabled ? 'pill-ok' : 'pill-no'">
                <span class="led"></span>
                {{ a.enabled ? '已启用' : '已禁用' }}
              </span>
              <div v-if="!a.enabled && a.disabledUntil" class="auto-restore">自动恢复：{{ a.disabledUntil }}</div>
            </td>
            <td>
              <div class="btn-group">
                <button v-if="a.enabled"  class="btn btn-cinnabar" @click="openDisable(a.id)">禁用</button>
                <button v-else            class="btn btn-jade"     @click="enableAccount(a.id)">启用</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Disable modal -->
    <div v-if="disableModal" class="modal-mask show" @click.self="disableModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="font-serif">禁用账号</h3>
          <button class="modal-close" @click="disableModal = false">×</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:14px">即将禁用：<strong>{{ disableTarget?.name }}</strong></p>
          <label>自动启用时间（留空则永久禁用）</label>
          <input v-model="disableUntil" type="datetime-local" />
          <p style="font-size:12px;color:var(--ink-muted);margin-top:8px">到达指定时间后系统将自动重新启用该账号。</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="disableModal = false">取消</button>
          <button class="modal-btn primary-cinnabar" @click="confirmDisable">确认禁用</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Account {
  id: string; name: string; phone: string; role: string
  enabled: boolean; joinedAt: string; disabledUntil?: string
}

const accounts = ref<Account[]>([
  { id:'U10001', name:'小雅',    phone:'138****8888', role:'user',   enabled:true,  joinedAt:'2026-01-12' },
  { id:'U10002', name:'王淑华',  phone:'139****6532', role:'expert', enabled:true,  joinedAt:'2025-08-03' },
  { id:'U10003', name:'李明德',  phone:'137****1245', role:'expert', enabled:true,  joinedAt:'2025-09-21' },
  { id:'U10004', name:'系统管理员', phone:'186****0001', role:'admin', enabled:true, joinedAt:'2025-06-01' },
  { id:'U10005', name:'张三',    phone:'135****7788', role:'user',   enabled:false, joinedAt:'2026-03-14' },
  { id:'U10006', name:'陈雅琴',  phone:'136****1100', role:'expert', enabled:true,  joinedAt:'2025-10-12' },
  { id:'U10007', name:'李四',    phone:'134****2233', role:'user',   enabled:true,  joinedAt:'2026-04-02' },
  { id:'U10008', name:'王五',    phone:'133****3344', role:'user',   enabled:true,  joinedAt:'2026-04-20' },
  { id:'U10009', name:'赵六',    phone:'132****4455', role:'user',   enabled:false, joinedAt:'2026-05-01', disabledUntil:'2026-06-01 00:00' },
])

const keyword = ref('')
const filtered = computed(() =>
  accounts.value.filter(a =>
    !keyword.value || a.name.includes(keyword.value) || a.phone.includes(keyword.value) || a.id.includes(keyword.value),
  ),
)

function updateRole(id: string, role: string) {
  const a = accounts.value.find(x => x.id === id)
  if (a) a.role = role
}

const disableModal  = ref(false)
const disableUntil  = ref('')
const disableTarget = ref<Account | null>(null)

function openDisable(id: string) {
  disableTarget.value = accounts.value.find(a => a.id === id) ?? null
  disableUntil.value  = ''
  disableModal.value  = true
}
function confirmDisable() {
  if (!disableTarget.value) return
  disableTarget.value.enabled      = false
  disableTarget.value.disabledUntil = disableUntil.value ? disableUntil.value.replace('T', ' ') : undefined
  disableModal.value = false
}
function enableAccount(id: string) {
  const a = accounts.value.find(x => x.id === id)
  if (a) { a.enabled = true; delete a.disabledUntil }
}

// Auto-restore check
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()
    accounts.value.forEach(a => {
      if (!a.enabled && a.disabledUntil && new Date(a.disabledUntil.replace(' ', 'T')) <= now) {
        a.enabled = true; delete a.disabledUntil
      }
    })
  }, 30_000)
})
onUnmounted(() => clearInterval(timer))
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
.auto-restore   { font-size:11px; color:var(--ink-muted); margin-top:3px; }
.btn-group      { display:flex; gap:6px; justify-content:flex-end; }
.btn            { border:1px solid var(--line); background:white; padding:6px 12px; font-size:12px; border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.btn-jade       { background:var(--jade); color:white; border-color:var(--jade); }
.btn-cinnabar   { border-color:var(--cinnabar); color:var(--cinnabar); background:white; }
.btn-cinnabar:hover { background:var(--cinnabar); color:white; }
.modal-mask     { display:none; position:fixed; inset:0; background:rgba(44,54,57,0.42); backdrop-filter:blur(3px); z-index:1000; justify-content:center; align-items:center; padding:20px; }
.modal-mask.show { display:flex; }
.modal          { background:white; border-radius:14px; max-width:480px; width:100%; box-shadow:0 8px 28px rgba(60,50,30,0.12); }
.modal-header   { padding:16px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.modal-header h3 { font-family:"STKaiti",serif; font-size:18px; color:var(--ink); }
.modal-close    { background:transparent; border:none; cursor:pointer; color:var(--ink-muted); font-size:22px; }
.modal-body     { padding:20px; }
.modal-body label { font-size:13px; color:var(--ink-muted); display:block; margin-bottom:6px; }
.modal-body input { width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:7px; font-family:inherit; font-size:14px; color:var(--ink); outline:none; box-sizing:border-box; }
.modal-body input:focus { border-color:var(--jade); }
.modal-footer   { padding:14px 20px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:8px; }
.modal-btn      { padding:8px 20px; border-radius:7px; font-size:14px; border:1px solid var(--line); background:white; color:var(--ink); cursor:pointer; font-family:inherit; }
.modal-btn.primary-cinnabar { background:var(--cinnabar); color:white; border-color:var(--cinnabar); }
</style>
