# Admin Dashboard Integration Design
**Date:** 2026-05-27  
**Status:** Approved

## Goal

Integrate `管理员.html` (the new admin dashboard UI) into the Vue 3 frontend project as a proper component tree. Admins log in through the existing login page and are routed to `/admin` where they see the full dashboard.

## File Structure

```
src/
├── pages/
│   └── admin/
│       └── index.vue               ← layout shell: sidebar, topbar, tab switching
├── components/
│   └── admin/
│       ├── AdminDashboard.vue      ← KPI cards, ECharts charts, system status (mock data)
│       ├── AdminReview.vue         ← expert review with real API (migrated from old admin/index.vue)
│       ├── AdminPermissions.vue    ← account permission management (mock data)
│       └── AdminAgents.vue         ← customer service management (mock data)
```

## Auth Flow

No changes to router or user store. Existing guard already handles everything:

1. Visit `/admin` → guard checks `userStore.G_LoginInfo.isLogin`
2. Not logged in → redirect to `/login?redirect=/admin`
3. After login → login page reads `?redirect` param → `router.push('/admin')`
4. Guard checks `userStore.G_UserInfo.privileges.split(',').includes('100')`
5. Passes → `admin/index.vue` renders

## Component Responsibilities

### `admin/index.vue` (layout shell)
- Renders sidebar navigation with 4 nav items
- Renders topbar with breadcrumb, notification icon, admin info, logout button
- Holds `activeTab: ref<string>('dashboard')`
- Switches between panel components using `v-show` (not `v-if`)
- Logout: calls `userStore.logout()` then `router.push('/login')`
- Reads admin display name from `userStore.G_LoginInfo.nickName`

### `AdminDashboard.vue`
- 8 KPI cards in two rows (4+4), mock data
- 4 ECharts charts: user activity trend, consultation trend, geographic distribution, solar term donut
- Inline SVG sparklines for each primary KPI card
- System status strip with 6 service indicators
- Date range selector (7/30/90 days) — triggers chart re-render
- `onMounted` → `initCharts()`
- `watch(activeRange)` → `destroyCharts()` → `initCharts()`
- `onUnmounted` → `destroyCharts()`
- Window resize handled via `ResizeObserver` on the chart container

### `AdminReview.vue`
- Migrated 1:1 from current `src/pages/admin/index.vue`
- Real API: `ApiExpert.adminListApplications()` / `adminGetApplication()` / `adminReviewApplication()`
- Status filter tabs: SUBMITTED / REVIEWING / APPROVED / REJECTED / all
- Expandable row detail with attachment images
- Approve / reject with confirm dialog
- Pagination

### `AdminPermissions.vue`
- Local `ref([...])` array of account objects (mock data)
- Table: name, user ID, phone, role selector, status, enable/disable action
- Role update mutates local array
- Disable modal with optional auto-restore datetime
- Auto-restore interval check (30s)

### `AdminAgents.vue`
- Local `ref([...])` array of agent objects (mock data)
- Table: agent info, role tag, load, status LED, today stats
- Add/edit modal with form fields
- Delete confirmation modal
- Toggle online/offline status

## ECharts Setup

- Install: `npm install echarts`
- Import in `AdminDashboard.vue` only: `import * as echarts from 'echarts'`
- Chart instances stored in a local object `const charts: Record<string, echarts.ECharts> = {}`
- Initialization deferred to `onMounted` (DOM must exist)
- Charts use template refs (`ref<HTMLElement | null>(null)`) for each container div
- ResizeObserver watches the dashboard container div; calls `chart.resize()` on each instance
- All chart config uses brand palette constants matching the existing CSS variables

## Styling

- `admin/index.vue` uses `<style scoped>` for layout shell styles
- Each panel component uses `<style scoped>` with the same CSS variable names already defined globally
- No new global CSS variables introduced
- Design tokens match `管理员.html`: `--jade`, `--gold`, `--cinnabar`, `--cream`, `--ink`, etc.

## Not in Scope

- Real API connections for dashboard KPIs, permissions, or agents
- WebSocket live updates for system status
- Export/download features
- Mobile responsive admin (admin is desktop-only)
