<template>
  <div class="admin-app">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-seal font-serif">颐</div>
        <div>
          <div class="sidebar-title font-serif">颐养阁</div>
          <div class="sidebar-sub">管理后台</div>
        </div>
      </div>

      <nav class="nav">
        <div class="nav-section">运营</div>
        <button class="nav-item" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
          <span>数据看板</span>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
          <span>专家审核</span>
          <span v-if="pendingCount > 0" class="nav-badge">{{ pendingCount }}</span>
        </button>

        <div class="nav-section">系统</div>
        <button class="nav-item" :class="{ active: activeTab === 'permissions' }" @click="activeTab = 'permissions'">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          <span>权限设置</span>
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'agents' }" @click="activeTab = 'agents'">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>客服管理</span>
        </button>
      </nav>

      <div class="sidebar-footer">顺应天时 · 颐养天年</div>
    </aside>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <div class="breadcrumb">
          颐养阁 <span class="sep">›</span>
          <span class="current">{{ breadcrumbMap[activeTab] }}</span>
        </div>
        <div class="topbar-actions">
          <div class="admin-info">
            <div class="admin-avatar font-serif">管</div>
            <span class="admin-name">{{ nickName }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            退出
          </button>
        </div>
      </header>

      <main class="content">
        <AdminDashboard   v-show="activeTab === 'dashboard'" />
        <AdminReview      v-show="activeTab === 'review'"      @pending-count="pendingCount = $event" />
        <AdminPermissions v-show="activeTab === 'permissions'" />
        <AdminAgents      v-show="activeTab === 'agents'" />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import AdminDashboard   from '@/components/admin/AdminDashboard.vue'
import AdminReview      from '@/components/admin/AdminReview.vue'
import AdminPermissions from '@/components/admin/AdminPermissions.vue'
import AdminAgents      from '@/components/admin/AdminAgents.vue'

const router    = useRouter()
const userStore = useUserStore()

const activeTab    = ref('dashboard')
const pendingCount = ref(0)

const breadcrumbMap: Record<string, string> = {
  dashboard:   '数据看板',
  review:      '专家审核',
  permissions: '权限设置',
  agents:      '客服管理',
}

const nickName = computed(() => userStore.G_LoginInfo.nickName || '管理员')

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Layout */
.admin-app { display: flex; min-height: 100vh; background: var(--cream, #FAF6EE); }

/* Sidebar */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: linear-gradient(180deg, #EAF1E4 0%, #D5E3D0 100%);
  border-right: 1px solid rgba(92,131,116,0.18);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}
.sidebar-header {
  height: 64px; display: flex; align-items: center; gap: 12px;
  padding: 0 20px; border-bottom: 1px solid rgba(92,131,116,0.15); flex-shrink: 0;
}
.logo-seal  { width:42px; height:42px; background:var(--cinnabar,#B33C2C); color:white; display:flex; align-items:center; justify-content:center; border-radius:10px; font-size:20px; font-weight:700; box-shadow:0 3px 10px rgba(179,60,44,0.28); flex-shrink:0; }
.sidebar-title { font-size:18px; font-weight:600; color:var(--ink,#2C3639); }
.sidebar-sub   { font-size:11px; color:var(--ink-muted,#6B7C7A); margin-top:1px; letter-spacing:0.5px; }

.nav           { flex:1; padding:12px 10px; }
.nav-section   { font-size:11px; color:var(--ink-muted,#6B7C7A); letter-spacing:1px; text-transform:uppercase; padding:12px 10px 6px; font-weight:500; }
.nav-item      { width:100%; background:transparent; border:none; padding:10px 12px; display:flex; align-items:center; gap:10px; font-family:inherit; font-size:14px; color:var(--ink-light,#4A565A); cursor:pointer; border-radius:9px; transition:background 0.18s,color 0.18s; text-align:left; margin-bottom:2px; }
.nav-item:hover { background:rgba(255,255,255,0.5); color:#456660; }
.nav-item.active { background:rgba(255,255,255,0.82); color:var(--cinnabar,#B33C2C); font-weight:600; box-shadow:0 2px 12px rgba(60,50,30,0.06); }
.nav-icon      { width:18px; height:18px; flex-shrink:0; }
.nav-badge     { margin-left:auto; background:var(--cinnabar,#B33C2C); color:white; font-size:11px; padding:1px 7px; border-radius:9px; font-weight:700; line-height:18px; }
.sidebar-footer { padding:14px 16px; border-top:1px solid rgba(92,131,116,0.15); font-size:11px; color:var(--ink-muted,#6B7C7A); text-align:center; font-family:"STKaiti",serif; letter-spacing:1px; flex-shrink:0; }

/* Main */
.main    { flex:1; display:flex; flex-direction:column; min-width:0; }
.topbar  { height:64px; background:rgba(255,255,255,0.92); backdrop-filter:blur(12px); border-bottom:1px solid var(--line,#E8DFD0); padding:0 28px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; }
.breadcrumb  { font-size:14px; color:var(--ink-muted,#6B7C7A); display:flex; align-items:center; gap:8px; }
.breadcrumb .sep     { opacity:0.5; }
.breadcrumb .current { color:var(--ink,#2C3639); font-weight:500; }
.topbar-actions { display:flex; align-items:center; gap:16px; }
.admin-info  { display:flex; align-items:center; gap:9px; font-size:13px; }
.admin-avatar { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,var(--jade,#5C8374),#456660); color:white; font-size:15px; font-weight:600; display:flex; align-items:center; justify-content:center; }
.admin-name  { color:var(--ink,#2C3639); font-weight:500; }
.logout-btn  { background:transparent; border:none; color:var(--ink-muted,#6B7C7A); cursor:pointer; font-size:13px; display:flex; align-items:center; gap:4px; font-family:inherit; padding:6px 10px; border-radius:7px; transition:all 0.15s; }
.logout-btn:hover { background:var(--cinnabar-soft,#FAE5E0); color:var(--cinnabar,#B33C2C); }

.content { flex:1; overflow:auto; }

/* Responsive */
@media (max-width: 1024px) {
  .sidebar { width: 200px; }
}
@media (max-width: 768px) {
  .sidebar { display: none; }
}
</style>
