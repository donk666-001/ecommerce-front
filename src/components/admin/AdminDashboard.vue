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
  statusItems.value[0]!.val = Math.floor(38 + Math.random() * 20) + 'ms'
  statusItems.value[1]!.val = Math.floor(18 + Math.random() * 15) + '/100'
  statusItems.value[2]!.val = (93 + Math.random() * 3).toFixed(1) + '%'
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
