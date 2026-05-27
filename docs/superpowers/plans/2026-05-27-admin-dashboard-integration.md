# Admin Dashboard Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `管理员.html` into a Vue 3 component tree at `/admin`, replacing the existing minimal expert-review page while keeping all real API calls intact.

**Architecture:** `src/pages/admin/index.vue` is a layout shell (sidebar + topbar + `v-show` tab switching). Four child components under `src/components/admin/` handle each panel. ECharts installed as an npm package and dynamically imported only inside `AdminDashboard.vue` so it is tree-split into its own chunk by Vite.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, ECharts 5 (dynamic import), pnpm, Vite, unplugin-vue-router (file-based — no router changes needed)

---

## File map

| Action | Path |
|--------|------|
| Create | `src/components/admin/AdminDashboard.vue` |
| Create | `src/components/admin/AdminReview.vue` |
| Create | `src/components/admin/AdminPermissions.vue` |
| Create | `src/components/admin/AdminAgents.vue` |
| Rewrite | `src/pages/admin/index.vue` |

---

## Task 1 — Install ECharts

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] **Install the package**

```bash
cd E:\springcloud_project\e-commerce-front
pnpm add echarts
```

Expected output ends with: `Done in …`

- [ ] **Verify the import resolves**

```bash
node -e "import('echarts').then(m => console.log('ok', Object.keys(m).length))"
```

Expected: `ok <number>`  *(run from the project root so node_modules is found)*

- [ ] **Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add echarts dependency"
```

---

## Task 2 — AdminDashboard.vue

**Files:**
- Create: `src/components/admin/AdminDashboard.vue`

- [ ] **Create the file**

`src/components/admin/AdminDashboard.vue`:

```vue
<template>
  <div ref="dashboardRef" class="dashboard">

    <!-- Section header -->
    <div class="section-header">
      <div class="section-title">
        <span class="section-dot"></span>数据看板
      </div>
      <div class="header-right">
        <span class="section-meta">{{ todayDate }}</span>
        <div class="date-range">
          <button
            v-for="r in ranges" :key="r.value"
            class="date-btn" :class="{ active: activeRange === r.value }"
            @click="setRange(r.value)"
          >{{ r.label }}</button>
        </div>
      </div>
    </div>

    <!-- KPI Row 1 -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="card in kpiRow1" :key="card.id">
        <div class="kpi-top">
          <div class="kpi-body">
            <div class="kpi-label">{{ card.label }}</div>
            <div class="kpi-value" :id="'kpi-' + card.id">{{ card.display }}</div>
          </div>
          <div class="kpi-icon" :class="card.color">{{ card.icon }}</div>
        </div>
        <div class="kpi-footer">
          <div class="kpi-trend" :class="card.trendDir">{{ card.trend }}</div>
          <svg :id="'spark-' + card.id" class="kpi-sparkline" width="64" height="24"></svg>
        </div>
      </div>
    </div>

    <!-- KPI Row 2 -->
    <div class="kpi-grid" style="margin-bottom:20px">
      <div
        class="kpi-card compact" :class="{ 'alert-card': card.alert }"
        v-for="card in kpiRow2" :key="card.id"
      >
        <div class="kpi-top">
          <div class="kpi-body">
            <div class="kpi-label">{{ card.label }}</div>
            <div class="kpi-value sm" :id="'kpi-' + card.id">{{ card.display }}</div>
          </div>
          <div class="kpi-icon" :class="card.color">{{ card.icon }}</div>
        </div>
        <div class="kpi-footer">
          <div class="kpi-trend" :class="card.trendDir">{{ card.trend }}</div>
          <span class="kpi-sub">{{ card.sub }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Row 1: 2:1 -->
    <div class="chart-row chart-row-2-1">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <span class="chart-title-dot" style="background:var(--jade)"></span>用户活跃趋势
          </div>
          <div class="chart-legend">
            <span class="legend-dot" style="background:var(--jade)"></span>日活用户
            <span class="legend-dot" style="background:var(--gold);margin-left:4px"></span>新增用户
          </div>
        </div>
        <div class="chart-body"><div ref="chartUserTrendRef" style="height:220px;width:100%"></div></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <span class="chart-title-dot" style="background:var(--gold)"></span>咨询量趋势
          </div>
          <div class="chart-legend">
            <span class="legend-dot" style="background:var(--gold)"></span>在线咨询
            <span class="legend-dot" style="background:#8FA89C;margin-left:4px"></span>AI 问诊
          </div>
        </div>
        <div class="chart-body"><div ref="chartConsultTrendRef" style="height:220px;width:100%"></div></div>
      </div>
    </div>

    <!-- Charts Row 2: 5:7 -->
    <div class="chart-row chart-row-1-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <span class="chart-title-dot" style="background:var(--cinnabar)"></span>用户地域分布
          </div>
          <div class="chart-meta">前 12 省份</div>
        </div>
        <div class="chart-body"><div ref="chartGeoRef" style="height:240px;width:100%"></div></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <span class="chart-title-dot" style="background:var(--gold)"></span>热门节气专题
          </div>
          <div class="chart-meta">互动占比</div>
        </div>
        <div class="chart-body"><div ref="chartSolarRef" style="height:240px;width:100%"></div></div>
      </div>
    </div>

    <!-- System status -->
    <div class="status-strip">
      <div class="status-strip-header">
        <div class="status-strip-title">系统运行状态</div>
        <button class="status-strip-refresh" @click="refreshStatus">刷新</button>
      </div>
      <div class="status-grid">
        <div class="status-item" v-for="s in statusItems" :key="s.name">
          <div class="status-item-name">{{ s.name }}</div>
          <div class="status-item-row">
            <span class="status-led" :class="s.status"></span>
            <span class="status-val">{{ s.val }}</span>
          </div>
          <div class="status-sub">{{ s.sub }}</div>
          <div v-if="s.bar > 0" class="status-bar-wrap">
            <div class="status-bar" :class="s.status" :style="{ width: s.bar + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

// ── Template refs ──────────────────────────────────────────────────────────
const dashboardRef       = ref<HTMLElement | null>(null)
const chartUserTrendRef  = ref<HTMLElement | null>(null)
const chartConsultTrendRef = ref<HTMLElement | null>(null)
const chartGeoRef        = ref<HTMLElement | null>(null)
const chartSolarRef      = ref<HTMLElement | null>(null)

// ── Date display ───────────────────────────────────────────────────────────
const todayDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
})

// ── Date range ─────────────────────────────────────────────────────────────
const ranges = [
  { label: '近 7 天', value: 7 },
  { label: '近 30 天', value: 30 },
  { label: '近 3 月', value: 90 },
]
const activeRange = ref(7)
function setRange(v: number) { activeRange.value = v }

// ── KPI data ───────────────────────────────────────────────────────────────
const kpiRow1 = [
  { id: 'users',   label: '平台总用户数',     display: '12,880', color: 'jade',    icon: '👥', trend: '↑ +12 今日新增',   trendDir: 'up' },
  { id: 'consult', label: '在线咨询（今日）',  display: '1,256',  color: 'gold',    icon: '💬', trend: '↑ +8.4% 较昨日',  trendDir: 'up' },
  { id: 'ai',      label: 'AI 问诊调用（今日）', display: '3,842', color: 'slate',  icon: '🤖', trend: '↑ +324 较昨日',   trendDir: 'up' },
  { id: 'revenue', label: '平台收益（本月）',  display: '¥18.6万', color: 'gold',   icon: '💰', trend: '↑ +12.3% 较上月', trendDir: 'up' },
]
const kpiRow2 = [
  { id: 'experts',  label: '专家入驻总数',    display: '286',   color: 'jade',     icon: '👨‍⚕️', trend: '↑ +1 较昨日',    trendDir: 'up',   sub: '已认证 271 位', alert: false },
  { id: 'pending',  label: '待审核专家',      display: '8',     color: 'cinnabar', icon: '📝', trend: '⚠ 需及时处理',  trendDir: 'warn', sub: '',             alert: true  },
  { id: 'content',  label: '内容发布（本月）', display: '3,420', color: 'jade',     icon: '📚', trend: '↑ +48 本周',    trendDir: 'up',   sub: '节气专题 12 个', alert: false },
  { id: 'newusers', label: '今日新增用户',    display: '12',    color: 'gold',     icon: '✨', trend: '↓ -3 较昨日',   trendDir: 'down', sub: '本周 +84 位',  alert: false },
]

// ── System status ──────────────────────────────────────────────────────────
const statusItems = ref([
  { name: 'API 网关',    status: 'ok',   val: '43ms',    sub: '响应延迟', bar: 0  },
  { name: '数据库',      status: 'ok',   val: '23/100',  sub: '连接数',   bar: 23 },
  { name: 'Redis 缓存',  status: 'ok',   val: '94.2%',   sub: '命中率',   bar: 94 },
  { name: 'AI 问诊服务', status: 'ok',   val: '3,842',   sub: '今日调用', bar: 0  },
  { name: 'WebSocket',   status: 'ok',   val: '47',      sub: '在线连接', bar: 0  },
  { name: 'CDN',         status: 'warn', val: '1.2 MB/s', sub: '带宽占用', bar: 62 },
])
function refreshStatus() {
  statusItems.value[0].val = Math.floor(38 + Math.random() * 20) + 'ms'
  statusItems.value[1].val = Math.floor(18 + Math.random() * 15) + '/100'
  statusItems.value[2].val = (93 + Math.random() * 3).toFixed(1) + '%'
}

// ── ECharts helpers ────────────────────────────────────────────────────────
const charts: Record<string, any> = {}
let ro: ResizeObserver | null = null

function seeded(base: number, noise: number, len: number): number[] {
  const arr: number[] = []
  let val = base
  for (let i = 0; i < len; i++) {
    val += (Math.random() - 0.45) * noise
    val = Math.max(base * 0.6, Math.min(base * 1.5, val))
    arr.push(Math.round(val))
  }
  return arr
}

function makeDates(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  })
}

function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.dispose() } catch { /* */ } })
  Object.keys(charts).forEach(k => delete charts[k])
}

async function initCharts() {
  destroyCharts()
  const echarts = await import('echarts')
  const days  = activeRange.value
  const dates = makeDates(days)
  const labelInterval = days <= 7 ? 0 : Math.floor(days / 7) - 1

  const tooltipBase = {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#E8DFD0',
    borderWidth: 1,
    textStyle: { color: '#2C3639', fontSize: 13 },
    extraCssText: 'box-shadow:0 4px 18px rgba(60,50,30,0.1);border-radius:9px;',
  }
  const xAxisBase = (interval: number) => ({
    type: 'category' as const,
    data: dates,
    axisLine: { lineStyle: { color: '#E8DFD0' } },
    axisTick: { show: false },
    axisLabel: { color: '#6B7C7A', fontSize: 11, interval },
  })

  // User activity
  if (chartUserTrendRef.value) {
    const c = echarts.init(chartUserTrendRef.value)
    charts.userTrend = c
    c.setOption({
      grid: { top: 20, right: 20, bottom: 32, left: 48 },
      tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { lineStyle: { color: '#E8DFD0' } } },
      xAxis: xAxisBase(labelInterval),
      yAxis: [
        { type: 'value', splitLine: { lineStyle: { color: '#FAF6EE' } }, axisLabel: { color: '#6B7C7A', fontSize: 11 } },
        { type: 'value', splitLine: { show: false }, axisLabel: { color: '#6B7C7A', fontSize: 11 } },
      ],
      series: [
        {
          name: '日活用户', type: 'line', data: seeded(320, 40, days), smooth: true, yAxisIndex: 0,
          lineStyle: { color: '#5C8374', width: 2.5 }, itemStyle: { color: '#5C8374' },
          symbol: 'circle', symbolSize: 5, showSymbol: false,
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(92,131,116,0.2)' }, { offset: 1, color: 'rgba(92,131,116,0.02)' },
          ]) },
        },
        {
          name: '新增用户', type: 'bar', data: seeded(12, 5, days), yAxisIndex: 1,
          barMaxWidth: 8, barMinHeight: 3,
          itemStyle: { color: '#C9A55C', borderRadius: [3, 3, 0, 0] },
        },
      ],
    })
  }

  // Consultation trend
  if (chartConsultTrendRef.value) {
    const c = echarts.init(chartConsultTrendRef.value)
    charts.consultTrend = c
    c.setOption({
      grid: { top: 20, right: 20, bottom: 32, left: 52 },
      tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { lineStyle: { color: '#E8DFD0' } } },
      xAxis: xAxisBase(labelInterval),
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#FAF6EE' } }, axisLabel: { color: '#6B7C7A', fontSize: 11 } },
      series: [
        {
          name: '在线咨询', type: 'line', data: seeded(1200, 150, days), smooth: true,
          lineStyle: { color: '#C9A55C', width: 2.5 }, itemStyle: { color: '#C9A55C' },
          symbol: 'circle', symbolSize: 5, showSymbol: false,
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(201,165,92,0.25)' }, { offset: 1, color: 'rgba(201,165,92,0.02)' },
          ]) },
        },
        {
          name: 'AI 问诊', type: 'line', data: seeded(3500, 400, days), smooth: true,
          lineStyle: { color: '#8FA89C', width: 2, type: 'dashed' }, itemStyle: { color: '#8FA89C' },
          symbol: 'circle', symbolSize: 4, showSymbol: false,
        },
      ],
    })
  }

  // Geographic
  if (chartGeoRef.value) {
    const provinces = [
      ['新疆', 32], ['贵州', 38], ['云南', 43], ['湖北', 65], ['四川', 87],
      ['河南', 58], ['湖南', 76], ['上海', 98], ['北京', 115], ['浙江', 142], ['江苏', 128], ['广东', 168],
    ] as [string, number][]
    const c = echarts.init(chartGeoRef.value)
    charts.geo = c
    c.setOption({
      grid: { top: 8, right: 70, bottom: 8, left: 56, containLabel: false },
      tooltip: { ...tooltipBase, trigger: 'axis', axisPointer: { type: 'none' } },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#FAF6EE' } }, axisLabel: { color: '#6B7C7A', fontSize: 11 }, position: 'top' },
      yAxis: { type: 'category', data: provinces.map(p => p[0]), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#6B7C7A', fontSize: 12 } },
      series: [{
        name: '用户数', type: 'bar', data: provinces.map(p => p[1]), barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (params: any) => `oklch(${Math.round(52 + (params.value / 168) * 12)}% 0.063 157)`,
        },
        label: { show: true, position: 'right', color: '#6B7C7A', fontSize: 11, formatter: '{c}人' },
      }],
    })
  }

  // Solar term donut
  if (chartSolarRef.value) {
    const solarData = [
      { name: '立夏·消暑养心', value: 3420, color: '#C9A55C' },
      { name: '小满·祛湿调体', value: 2870, color: '#5C8374' },
      { name: '谷雨·春末护肝', value: 2210, color: '#8FA89C' },
      { name: '清明·疏肝解郁', value: 1980, color: '#A07840' },
      { name: '春分·调和阴阳', value: 1650, color: '#4A565A' },
      { name: '惊蛰·春季祛寒', value: 1240, color: '#D4B896' },
    ]
    const c = echarts.init(chartSolarRef.value)
    charts.solar = c
    c.setOption({
      tooltip: { ...tooltipBase, trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
      legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#6B7C7A', fontSize: 12 }, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 10 },
      series: [{
        name: '节气专题', type: 'pie', radius: ['42%', '68%'], center: ['36%', '52%'],
        avoidLabelOverlap: false, label: { show: false },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 600, color: '#2C3639', formatter: '{b}\n{c}次' }, scaleSize: 6 },
        data: solarData.map(d => ({ name: d.name, value: d.value, itemStyle: { color: d.color, borderWidth: 2, borderColor: '#fff' } })),
      }],
    })
  }
}

// ── Sparklines ─────────────────────────────────────────────────────────────
function drawSparkline(id: string, data: number[], color: string) {
  const svg = document.getElementById(id)
  if (!svg) return
  const [w, h, pad] = [64, 24, 2]
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((v - min) / range) * (h - 2 * pad)
    return `${x},${y}`
  })
  const line = 'M' + pts.join('L')
  svg.innerHTML = `<defs><linearGradient id="sg${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient></defs>
  <path d="${line}L${w - pad},${h - pad}L${pad},${h - pad}Z" fill="url(#sg${id})"/>
  <path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
}

function initSparklines() {
  drawSparkline('spark-users',   [210, 225, 218, 240, 232, 248, 256], '#5C8374')
  drawSparkline('spark-consult', [980, 1020, 1060, 1100, 1150, 1200, 1256], '#C9A55C')
  drawSparkline('spark-ai',      [2800, 3100, 3200, 3400, 3500, 3700, 3842], '#4A565A')
  drawSparkline('spark-revenue', [14.2, 15.1, 15.8, 16.4, 17.0, 17.8, 18.6], '#C9A55C')
}

// ── Counter animation ──────────────────────────────────────────────────────
function animateCounter(el: Element | null, target: number, dur = 1200) {
  if (!el) return
  const t0 = performance.now()
  const isFloat = target % 1 !== 0
  const tick = (now: number) => {
    const ease = 1 - Math.pow(1 - Math.min((now - t0) / dur, 1), 3)
    el.textContent = isFloat
      ? (target * ease).toFixed(1)
      : Math.floor(target * ease).toLocaleString('zh-CN')
    if (ease < 1) requestAnimationFrame(tick)
    else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString('zh-CN')
  }
  requestAnimationFrame(tick)
}

function initCounters() {
  ;([
    ['kpi-users', 12880], ['kpi-consult', 1256], ['kpi-ai', 3842],
    ['kpi-experts', 286], ['kpi-pending', 8], ['kpi-content', 3420], ['kpi-newusers', 12],
  ] as [string, number][]).forEach(([id, v]) => animateCounter(document.getElementById(id), v))

  const revEl = document.getElementById('kpi-revenue')
  if (revEl) {
    const t0 = performance.now()
    const tick = (now: number) => {
      const e = 1 - Math.pow(1 - Math.min((now - t0) / 1200, 1), 3)
      revEl.textContent = '¥' + (18.6 * e).toFixed(1) + '万'
      if (e < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
watch(activeRange, initCharts)

onMounted(async () => {
  initSparklines()
  initCounters()
  await initCharts()
  ro = new ResizeObserver(() => Object.values(charts).forEach(c => { try { c.resize() } catch { /* */ } }))
  if (dashboardRef.value) ro.observe(dashboardRef.value)
})

onUnmounted(() => {
  ro?.disconnect()
  destroyCharts()
})
</script>

<style scoped>
.dashboard { padding: 24px 28px; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.section-title  { font-family: "STKaiti", serif; font-size: 19px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 10px; }
.section-dot    { width: 8px; height: 8px; background: var(--cinnabar); border-radius: 50%; flex-shrink: 0; }
.header-right   { display: flex; align-items: center; gap: 12px; }
.section-meta   { font-size: 13px; color: var(--ink-muted); }

.date-range  { display: inline-flex; gap: 2px; background: var(--cream); border: 1px solid var(--line); border-radius: 9px; padding: 3px; }
.date-btn    { background: transparent; border: none; padding: 5px 14px; border-radius: 7px; font-size: 13px; color: var(--ink-muted); cursor: pointer; font-family: inherit; transition: all 0.15s; }
.date-btn.active   { background: white; color: var(--jade); font-weight: 600; box-shadow: 0 2px 8px rgba(60,50,30,0.07); }
.date-btn:not(.active):hover { color: var(--ink); }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
.kpi-card  { background: var(--paper); border-radius: 14px; padding: 18px 20px; box-shadow: 0 2px 12px rgba(60,50,30,0.06); border: 1px solid rgba(232,223,208,0.6); transition: box-shadow 0.2s, transform 0.2s; }
.kpi-card:hover { box-shadow: 0 4px 18px rgba(60,50,30,0.09); transform: translateY(-1px); }
.kpi-card.compact { padding: 14px 18px; }
.kpi-card.alert-card { background: linear-gradient(135deg, #fff9f8, #fff3f0); border-color: rgba(179,60,44,0.15); }
.kpi-card.alert-card .kpi-value { color: var(--cinnabar); }

.kpi-top    { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.kpi-body   { flex: 1; }
.kpi-icon   { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.kpi-icon.jade     { background: var(--jade-soft); }
.kpi-icon.gold     { background: var(--gold-soft); }
.kpi-icon.cinnabar { background: var(--cinnabar-soft); }
.kpi-icon.slate    { background: #EAEDF0; }

.kpi-label  { font-size: 12px; color: var(--ink-muted); margin-bottom: 6px; }
.kpi-value  { font-family: "STKaiti", serif; font-size: 28px; font-weight: 700; color: var(--ink); line-height: 1; }
.kpi-value.sm { font-size: 22px; }
.kpi-footer { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--ink-muted); }
.kpi-trend  { display: flex; align-items: center; gap: 3px; font-weight: 500; }
.kpi-trend.up   { color: var(--jade); }
.kpi-trend.down { color: var(--cinnabar); }
.kpi-trend.warn { color: var(--gold-deep, #A07840); }
.kpi-sparkline  { flex-shrink: 0; }
.kpi-sub        { font-size: 11px; color: var(--ink-muted); }

.chart-row       { display: grid; gap: 14px; margin-bottom: 20px; }
.chart-row-2-1   { grid-template-columns: 2fr 1fr; }
.chart-row-1-2   { grid-template-columns: 5fr 7fr; }
.chart-card      { background: var(--paper); border-radius: 14px; box-shadow: 0 2px 12px rgba(60,50,30,0.06); border: 1px solid rgba(232,223,208,0.6); overflow: hidden; }
.chart-header    { padding: 16px 20px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(232,223,208,0.5); }
.chart-title     { font-family: "STKaiti", serif; font-size: 15px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 7px; }
.chart-title-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.chart-meta      { font-size: 12px; color: var(--ink-muted); }
.chart-legend    { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-muted); }
.legend-dot      { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.chart-body      { padding: 4px 8px 8px; }

.status-strip        { background: var(--paper); border-radius: 14px; box-shadow: 0 2px 12px rgba(60,50,30,0.06); border: 1px solid rgba(232,223,208,0.6); overflow: hidden; margin-bottom: 24px; }
.status-strip-header { padding: 14px 20px; border-bottom: 1px solid rgba(232,223,208,0.5); display: flex; align-items: center; justify-content: space-between; }
.status-strip-title  { font-family: "STKaiti", serif; font-size: 15px; font-weight: 600; color: var(--ink); }
.status-strip-refresh { background: transparent; border: none; cursor: pointer; font-family: inherit; font-size: 12px; color: var(--ink-muted); padding: 5px 10px; border-radius: 7px; transition: all 0.15s; }
.status-strip-refresh:hover { background: var(--cream); color: var(--jade); }
.status-grid     { display: grid; grid-template-columns: repeat(6, 1fr); }
.status-item     { padding: 14px 16px; border-right: 1px solid rgba(232,223,208,0.5); transition: background 0.15s; }
.status-item:last-child { border-right: none; }
.status-item:hover { background: var(--cream); }
.status-item-name { font-size: 12px; color: var(--ink-muted); margin-bottom: 7px; }
.status-item-row  { display: flex; align-items: center; gap: 6px; }
.status-led  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.status-led.ok   { background: var(--jade); box-shadow: 0 0 6px rgba(92,131,116,0.5); }
.status-led.warn { background: var(--gold); box-shadow: 0 0 6px rgba(201,165,92,0.5); }
.status-led.err  { background: var(--cinnabar); box-shadow: 0 0 6px rgba(179,60,44,0.5); }
.status-val  { font-size: 14px; font-weight: 600; color: var(--ink); }
.status-sub  { font-size: 11px; color: var(--ink-muted); margin-top: 3px; }
.status-bar-wrap { background: var(--cream); border-radius: 3px; height: 5px; margin-top: 7px; overflow: hidden; }
.status-bar  { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.status-bar.ok   { background: var(--jade); }
.status-bar.warn { background: var(--gold); }
.status-bar.err  { background: var(--cinnabar); }

@media (max-width: 1280px) {
  .status-grid { grid-template-columns: repeat(3, 1fr); }
  .status-item:nth-child(3) { border-right: none; }
  .status-item:nth-child(4) { border-top: 1px solid rgba(232,223,208,0.5); }
  .status-item:nth-child(5) { border-top: 1px solid rgba(232,223,208,0.5); }
  .status-item:nth-child(6) { border-top: 1px solid rgba(232,223,208,0.5); }
}
@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-row-2-1, .chart-row-1-2 { grid-template-columns: 1fr; }
}
</style>
```

- [ ] **Commit**

```bash
git add src/components/admin/AdminDashboard.vue
git commit -m "feat(admin): add AdminDashboard component with ECharts and KPI cards"
```

---

## Task 3 — AdminReview.vue

**Files:**
- Create: `src/components/admin/AdminReview.vue`
- This is a direct migration of `src/pages/admin/index.vue` logic; the real API calls are preserved unchanged.

- [ ] **Create the file**

`src/components/admin/AdminReview.vue`:

```vue
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

/* Modal (re-used classes without global scope) */
.modal-mask  { display:none; position:fixed; inset:0; background:rgba(44,54,57,0.42); backdrop-filter:blur(3px); z-index:1000; justify-content:center; align-items:center; padding:20px; }
.modal-mask.show { display:flex; }
.modal       { background:white; border-radius:14px; max-width:480px; width:100%; box-shadow:0 8px 28px rgba(60,50,30,0.12); max-height:90vh; overflow:auto; }
.modal-header { padding:16px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.modal-header h3 { font-family:"STKaiti",serif; font-size:18px; color:var(--ink); }
.modal-close { background:transparent; border:none; cursor:pointer; color:var(--ink-muted); font-size:22px; }
.modal-body  { padding:20px; }
.modal-body label { font-size:13px; color:var(--ink-muted); display:block; margin-bottom:6px; }
.modal-body textarea { width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:7px; font-family:inherit; font-size:14px; color:var(--ink); outline:none; resize:vertical; }
.modal-body textarea:focus { border-color:var(--jade); }
.modal-footer { padding:14px 20px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:8px; }
.modal-btn   { padding:8px 20px; border-radius:7px; font-size:14px; border:1px solid var(--line); background:white; color:var(--ink); cursor:pointer; font-family:inherit; transition:all 0.15s; }
.modal-btn.primary-cinnabar { background:var(--cinnabar); color:white; border-color:var(--cinnabar); }
</style>
```

- [ ] **Commit**

```bash
git add src/components/admin/AdminReview.vue
git commit -m "feat(admin): add AdminReview component (migrated real API calls)"
```

---

## Task 4 — AdminPermissions.vue

**Files:**
- Create: `src/components/admin/AdminPermissions.vue`

- [ ] **Create the file**

`src/components/admin/AdminPermissions.vue`:

```vue
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
.modal-body input { width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:7px; font-family:inherit; font-size:14px; color:var(--ink); outline:none; }
.modal-body input:focus { border-color:var(--jade); }
.modal-footer   { padding:14px 20px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:8px; }
.modal-btn      { padding:8px 20px; border-radius:7px; font-size:14px; border:1px solid var(--line); background:white; color:var(--ink); cursor:pointer; font-family:inherit; }
.modal-btn.primary-cinnabar { background:var(--cinnabar); color:white; border-color:var(--cinnabar); }
</style>
```

- [ ] **Commit**

```bash
git add src/components/admin/AdminPermissions.vue
git commit -m "feat(admin): add AdminPermissions component"
```

---

## Task 5 — AdminAgents.vue

**Files:**
- Create: `src/components/admin/AdminAgents.vue`

- [ ] **Create the file**

`src/components/admin/AdminAgents.vue`:

```vue
<template>
  <div class="agents-panel">

    <div class="section-header">
      <div class="section-title"><span class="section-dot"></span>客服管理</div>
    </div>

    <div class="toolbar-card">
      <div class="status-tabs">
        <button
          v-for="f in filters" :key="f.value"
          class="status-tab" :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >{{ f.label }} <span class="count">({{ filterCount(f.value) }})</span></button>
      </div>
      <div class="search-input" style="margin-left:auto">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="keyword" type="text" placeholder="搜索工号 / 姓名" />
      </div>
      <button class="btn btn-jade" style="margin-left:8px" @click="openEdit(null)">+ 新增客服</button>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>客服</th><th>工号</th><th>职能</th><th>接待上限</th>
            <th>在线状态</th><th>今日接待</th><th>今日消息</th>
            <th>加入时间</th><th style="text-align:right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="9" style="text-align:center;padding:48px;color:var(--ink-muted)">暂无客服数据</td>
          </tr>
          <tr v-for="a in filtered" :key="a.account">
            <td>
              <div class="applicant">
                <div class="applicant-avatar">{{ a.name[0] }}</div>
                <span class="applicant-name">{{ a.name }}</span>
              </div>
            </td>
            <td style="color:var(--ink-muted)">{{ a.account }}</td>
            <td><span class="tag" :class="a.role === 'presale' ? 'tag-jade' : 'tag-cinnabar'">{{ a.role === 'presale' ? '售前客服' : '售后客服' }}</span></td>
            <td>{{ a.currentLoad }} / {{ a.maxLoad }}</td>
            <td>
              <span class="status-pill" :class="a.status === 'online' ? 'pill-ok' : 'pill-no'">
                <span class="led" :class="ledClass(a.status)"></span>
                {{ statusLabel(a.status) }}
              </span>
            </td>
            <td>{{ a.todayServed }}</td>
            <td>{{ a.todayMsgs }}</td>
            <td style="color:var(--ink-muted);font-size:13px">{{ a.joinedAt }}</td>
            <td>
              <div class="btn-group">
                <button class="btn btn-ghost"     @click="openEdit(a.account)">编辑</button>
                <button class="btn btn-gold"      @click="toggleStatus(a.account)">{{ a.status === 'off' ? '启用' : '下线' }}</button>
                <button class="btn btn-cinnabar"  @click="openDeleteModal(a.account)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit / Add modal -->
    <div v-if="editModal" class="modal-mask show" @click.self="editModal = false">
      <div class="modal wide">
        <div class="modal-header">
          <h3 class="font-serif">{{ editingAccount ? '编辑客服' : '新增客服' }}</h3>
          <button class="modal-close" @click="editModal = false">×</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div>
              <label>工号</label>
              <input v-model="form.account" type="text" placeholder="如 CS006" :disabled="!!editingAccount" />
            </div>
            <div><label>姓名</label><input v-model="form.name" type="text" placeholder="客服姓名" /></div>
            <div><label>登录密码</label><input v-model="form.pwd" type="password" :placeholder="editingAccount ? '留空则不修改密码' : '设置登录密码'" /></div>
            <div>
              <label>职能角色</label>
              <select v-model="form.role" class="sel" style="width:100%;padding:10px 12px;font-size:14px">
                <option value="presale">售前客服</option>
                <option value="aftersale">售后客服</option>
              </select>
            </div>
            <div><label>同时接待上限</label><input v-model.number="form.maxLoad" type="number" min="1" max="10" /></div>
            <div><label>工作时段</label><input v-model="form.workHours" type="text" placeholder="09:00-18:00" /></div>
          </div>
          <div style="margin-top:14px">
            <label>自动欢迎语</label>
            <textarea v-model="form.welcome" rows="3" placeholder="客户进入会话时的自动欢迎语"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="editModal = false">取消</button>
          <button class="modal-btn primary-jade" @click="saveAgent">保存</button>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div v-if="deleteModal" class="modal-mask show" @click.self="deleteModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="font-serif">删除客服账号</h3>
          <button class="modal-close" @click="deleteModal = false">×</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:14px">确认删除客服账号：<strong>{{ deleteTargetName }}</strong>？</p>
          <p style="font-size:12px;color:var(--cinnabar)">删除后该客服将无法登录，历史会话记录保留。</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="deleteModal = false">取消</button>
          <button class="modal-btn primary-cinnabar" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Agent {
  account: string; name: string; role: string; maxLoad: number
  currentLoad: number; status: string; todayServed: number
  todayMsgs: number; joinedAt: string; welcome: string; workHours: string
}

const agents = ref<Agent[]>([
  { account:'CS001', name:'小翠', role:'presale',  maxLoad:5, currentLoad:3, status:'online', todayServed:28, todayMsgs:412, joinedAt:'2026-01-12', welcome:'您好，这边是颐养阁售前客服小翠，很高兴为您服务～', workHours:'09:00-18:00' },
  { account:'CS002', name:'阿岚', role:'aftersale', maxLoad:5, currentLoad:2, status:'online', todayServed:19, todayMsgs:286, joinedAt:'2026-02-08', welcome:'您好，售后客服阿岚为您服务～', workHours:'10:00-19:00' },
  { account:'CS003', name:'暮雨', role:'presale',  maxLoad:5, currentLoad:0, status:'break',  todayServed:15, todayMsgs:198, joinedAt:'2026-03-15', welcome:'您好，这边是颐养阁售前客服暮雨，很高兴为您服务～', workHours:'09:00-18:00' },
  { account:'CS004', name:'青霜', role:'aftersale', maxLoad:5, currentLoad:0, status:'off',   todayServed:0,  todayMsgs:0,   joinedAt:'2026-05-01', welcome:'您好，售后客服青霜为您服务～', workHours:'13:00-22:00' },
  { account:'CS005', name:'松风', role:'presale',  maxLoad:8, currentLoad:0, status:'online', todayServed:8,  todayMsgs:65,  joinedAt:'2026-05-20', welcome:'您好，这边是颐养阁售前客服松风，很高兴为您服务～', workHours:'09:00-18:00' },
])

const activeFilter = ref('all')
const keyword      = ref('')

const filters = [
  { label: '全部', value: 'all' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
]

function filterCount(f: string) {
  if (f === 'all') return agents.value.length
  if (f === 'online') return agents.value.filter(a => a.status === 'online').length
  return agents.value.filter(a => a.status === 'off').length
}

const filtered = computed(() =>
  agents.value.filter(a => {
    const matchFilter = activeFilter.value === 'all'
      || (activeFilter.value === 'online' && a.status === 'online')
      || (activeFilter.value === 'offline' && a.status === 'off')
    const matchKw = !keyword.value || a.name.includes(keyword.value) || a.account.includes(keyword.value)
    return matchFilter && matchKw
  }),
)

function statusLabel(s: string) { return ({ online:'在线', break:'小休', off:'离线' } as any)[s] ?? s }
function ledClass(s: string)    { return ({ online:'led-online', break:'led-busy', off:'led-off' } as any)[s] ?? '' }

function toggleStatus(account: string) {
  const a = agents.value.find(x => x.account === account)
  if (!a) return
  if (a.status === 'off') { a.status = 'online'; a.currentLoad = 0 }
  else {
    if (a.currentLoad > 0 && !confirm(`该客服当前有 ${a.currentLoad} 个进行中的会话，强制下线将释放会话锁。确认？`)) return
    a.status = 'off'; a.currentLoad = 0
  }
}

// Edit / add
const editModal      = ref(false)
const editingAccount = ref<string | null>(null)
const form = ref({ account:'', name:'', pwd:'', role:'presale', maxLoad:5, workHours:'09:00-18:00', welcome:'您好，这边是颐养阁官方客服，很高兴为您服务～' })

function openEdit(account: string | null) {
  editingAccount.value = account
  if (account) {
    const a = agents.value.find(x => x.account === account)!
    form.value = { account:a.account, name:a.name, pwd:'', role:a.role, maxLoad:a.maxLoad, workHours:a.workHours, welcome:a.welcome }
  } else {
    form.value = { account:'', name:'', pwd:'', role:'presale', maxLoad:5, workHours:'09:00-18:00', welcome:'您好，这边是颐养阁官方客服，很高兴为您服务～' }
  }
  editModal.value = true
}

function saveAgent() {
  if (!form.value.account || !form.value.name) { alert('工号和姓名不能为空'); return }
  if (editingAccount.value) {
    const a = agents.value.find(x => x.account === editingAccount.value)
    if (a) Object.assign(a, { name:form.value.name, role:form.value.role, maxLoad:form.value.maxLoad, workHours:form.value.workHours, welcome:form.value.welcome })
  } else {
    if (agents.value.find(x => x.account === form.value.account)) { alert('工号已存在'); return }
    agents.value.push({ account:form.value.account, name:form.value.name, role:form.value.role, maxLoad:form.value.maxLoad, currentLoad:0, status:'off', todayServed:0, todayMsgs:0, joinedAt:new Date().toISOString().slice(0,10), welcome:form.value.welcome, workHours:form.value.workHours })
  }
  editModal.value = false
}

// Delete
const deleteModal      = ref(false)
const deleteTargetAcct = ref('')
const deleteTargetName = ref('')

function openDeleteModal(account: string) {
  const a = agents.value.find(x => x.account === account)!
  deleteTargetAcct.value = account
  deleteTargetName.value = `${a.name}（${a.account}）`
  deleteModal.value = true
}
function confirmDelete() {
  agents.value = agents.value.filter(a => a.account !== deleteTargetAcct.value)
  deleteModal.value = false
}
</script>

<style scoped>
.agents-panel { padding: 24px 28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.section-title  { font-family:"STKaiti",serif; font-size:19px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:10px; }
.section-dot    { width:8px; height:8px; background:var(--cinnabar); border-radius:50%; flex-shrink:0; }
.toolbar-card   { background:var(--paper); border-radius:14px; padding:14px; box-shadow:0 2px 12px rgba(60,50,30,0.06); border:1px solid rgba(232,223,208,0.5); margin-bottom:16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.status-tabs    { display:inline-flex; background:var(--cream); border-radius:10px; padding:4px; }
.status-tab     { background:transparent; border:none; padding:7px 16px; font-size:14px; color:var(--ink-muted); border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.status-tab.active { background:var(--paper); color:var(--cinnabar); font-weight:600; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
.count          { font-size:12px; color:var(--ink-muted); }
.search-input   { display:flex; align-items:center; gap:6px; background:var(--cream); border:1px solid var(--line); border-radius:8px; padding:8px 12px; width:240px; }
.search-input input { flex:1; background:transparent; border:none; outline:none; font-size:14px; color:var(--ink); font-family:inherit; }
.table-card     { background:var(--paper); border-radius:14px; box-shadow:0 2px 12px rgba(60,50,30,0.06); border:1px solid rgba(232,223,208,0.5); overflow:hidden; }
table           { width:100%; border-collapse:collapse; font-size:14px; }
thead           { background:var(--cream); }
th              { text-align:left; font-weight:500; font-size:13px; color:var(--ink-muted); padding:12px 18px; }
td              { padding:13px 18px; border-top:1px solid var(--line); vertical-align:middle; }
tr:hover td     { background:rgba(250,246,238,0.6); }
.applicant      { display:flex; align-items:center; gap:10px; }
.applicant-avatar { width:36px; height:36px; border-radius:9px; background:var(--cream); display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:600; color:var(--ink-muted); }
.applicant-name { font-weight:600; color:var(--ink); font-size:14px; }
.tag            { display:inline-block; padding:3px 10px; font-size:12px; border-radius:5px; }
.tag-jade       { background:var(--jade-soft); color:var(--jade); }
.tag-cinnabar   { background:var(--cinnabar-soft); color:var(--cinnabar); }
.status-pill    { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; font-size:12px; border-radius:5px; }
.status-pill .led { width:6px; height:6px; border-radius:50%; }
.pill-ok        { background:var(--jade-soft); color:var(--jade); }
.pill-ok .led   { background:var(--jade); }
.pill-no        { background:#f0f0f0; color:var(--ink-muted); }
.pill-no .led   { background:#ccc; }
.led-online     { background:var(--jade) !important; box-shadow:0 0 5px rgba(92,131,116,0.5); }
.led-busy       { background:var(--gold) !important; }
.led-off        { background:#ccc !important; }
.btn-group      { display:flex; gap:6px; justify-content:flex-end; }
.btn            { border:1px solid var(--line); background:white; padding:6px 12px; font-size:12px; border-radius:7px; cursor:pointer; font-family:inherit; transition:all 0.15s; display:inline-flex; align-items:center; }
.btn-jade       { background:var(--jade); color:white; border-color:var(--jade); }
.btn-cinnabar   { border-color:var(--cinnabar); color:var(--cinnabar); background:white; }
.btn-cinnabar:hover { background:var(--cinnabar); color:white; }
.btn-gold       { border-color:var(--gold); color:var(--gold-deep,#A07840); background:white; }
.btn-gold:hover { background:var(--gold); color:white; }
.btn-ghost      { color:var(--ink-muted); }
.sel            { padding:5px 8px; border:1px solid var(--line); border-radius:5px; background:white; font-family:inherit; font-size:13px; color:var(--ink); }
.modal-mask     { display:none; position:fixed; inset:0; background:rgba(44,54,57,0.42); backdrop-filter:blur(3px); z-index:1000; justify-content:center; align-items:center; padding:20px; }
.modal-mask.show { display:flex; }
.modal          { background:white; border-radius:14px; max-width:480px; width:100%; box-shadow:0 8px 28px rgba(60,50,30,0.12); max-height:90vh; overflow:auto; }
.modal.wide     { max-width:640px; }
.modal-header   { padding:16px 20px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
.modal-header h3 { font-family:"STKaiti",serif; font-size:18px; color:var(--ink); }
.modal-close    { background:transparent; border:none; cursor:pointer; color:var(--ink-muted); font-size:22px; }
.modal-body     { padding:20px; }
.modal-body label { font-size:13px; color:var(--ink-muted); display:block; margin-bottom:6px; }
.modal-body input, .modal-body textarea, .modal-body select { width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:7px; font-family:inherit; font-size:14px; color:var(--ink); outline:none; }
.modal-body input:focus, .modal-body textarea:focus { border-color:var(--jade); }
.modal-body textarea { resize:vertical; }
.modal-footer   { padding:14px 20px; border-top:1px solid var(--line); display:flex; justify-content:flex-end; gap:8px; }
.modal-btn      { padding:8px 20px; border-radius:7px; font-size:14px; border:1px solid var(--line); background:white; color:var(--ink); cursor:pointer; font-family:inherit; }
.modal-btn.primary-jade { background:var(--jade); color:white; border-color:var(--jade); }
.modal-btn.primary-cinnabar { background:var(--cinnabar); color:white; border-color:var(--cinnabar); }
</style>
```

- [ ] **Commit**

```bash
git add src/components/admin/AdminAgents.vue
git commit -m "feat(admin): add AdminAgents component"
```

---

## Task 6 — Rewrite admin/index.vue as layout shell

**Files:**
- Rewrite: `src/pages/admin/index.vue`

- [ ] **Replace the file entirely**

`src/pages/admin/index.vue`:

```vue
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
```

- [ ] **Verify the dev server compiles without errors**

```bash
pnpm dev
```

Open `http://localhost:5173`. Log in as an admin (privilege code `100`). Expected:
- Redirects to `/admin`
- Sidebar renders with 4 nav items
- Clicking **数据看板** shows KPI cards, sparklines, and 4 ECharts charts
- Clicking **专家审核** shows the review table (calls real API)
- Clicking **权限设置** shows the permissions table
- Clicking **客服管理** shows the agents table with add/edit/delete modals
- **退出** button calls logout and navigates to `/login`

- [ ] **Verify type-check passes**

```bash
pnpm type-check
```

Expected: exits with no errors (or only pre-existing unrelated errors).

- [ ] **Commit**

```bash
git add src/pages/admin/index.vue
git commit -m "feat(admin): rewrite admin/index.vue as layout shell, wire up all panels"
```

---

## Self-review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| Layout shell: sidebar + topbar + v-show switching | Task 6 |
| AdminDashboard with KPI cards, sparklines, ECharts, system status | Task 2 |
| Date range selector → chart re-render | Task 2 (`watch(activeRange, initCharts)`) |
| AdminReview with real API calls, emits pending-count | Task 3 |
| AdminPermissions mock data + disable/enable | Task 4 |
| AdminAgents mock data + add/edit/delete | Task 5 |
| ECharts as npm package + dynamic import | Task 1 + Task 2 |
| ResizeObserver on dashboard container | Task 2 |
| Logout via userStore.logout() → /login | Task 6 |
| Admin name from userStore.G_LoginInfo.nickName | Task 6 |
| No router.ts changes needed | ✅ confirmed — file-based routing handles /admin |
| No changes to login page | ✅ confirmed — existing redirect=param flow unchanged |

**No gaps found.**
