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
                        v-for="r in ranges"
                        :key="r.value"
                        class="date-btn"
                        :class="{ active: activeRange === r.value }"
                        @click="setRange(r.value)"
                    >
                        {{ r.label }}
                    </button>
                </div>
            </div>
        </div>

        <!-- KPI Row 1 -->
        <div class="kpi-grid">
            <div class="kpi-card" v-for="card in kpiRow1" :key="card.id">
                <div class="kpi-top">
                    <div class="kpi-body">
                        <div class="kpi-label">{{ card.label }}</div>
                        <div class="kpi-value" :id="'kpi-' + card.id">
                            {{ card.display }}
                        </div>
                    </div>
                    <div class="kpi-icon" :class="card.color">
                        {{ card.icon }}
                    </div>
                </div>
                <div class="kpi-footer">
                    <div class="kpi-trend" :class="card.trendDir">
                        {{ card.trend }}
                    </div>
                    <svg
                        :id="'spark-' + card.id"
                        class="kpi-sparkline"
                        width="64"
                        height="24"
                    ></svg>
                </div>
            </div>
        </div>

        <!-- KPI Row 2 -->
        <div class="kpi-grid" style="margin-bottom: 20px">
            <div
                class="kpi-card compact"
                :class="{ 'alert-card': card.alert }"
                v-for="card in kpiRow2"
                :key="card.id"
            >
                <div class="kpi-top">
                    <div class="kpi-body">
                        <div class="kpi-label">{{ card.label }}</div>
                        <div class="kpi-value sm" :id="'kpi-' + card.id">
                            {{ card.display }}
                        </div>
                    </div>
                    <div class="kpi-icon" :class="card.color">
                        {{ card.icon }}
                    </div>
                </div>
                <div class="kpi-footer">
                    <div class="kpi-trend" :class="card.trendDir">
                        {{ card.trend }}
                    </div>
                    <span class="kpi-sub">{{ card.sub }}</span>
                </div>
            </div>
        </div>

        <!-- Charts Row 1: 2:1 -->
        <div class="chart-row chart-row-2-1">
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">
                        <span
                            class="chart-title-dot"
                            style="background: var(--jade)"
                        ></span
                        >用户活跃趋势
                    </div>
                    <div class="chart-legend">
                        <span
                            class="legend-dot"
                            style="background: var(--jade)"
                        ></span
                        >日活用户
                        <span
                            class="legend-dot"
                            style="background: var(--gold); margin-left: 4px"
                        ></span
                        >新增用户
                    </div>
                </div>
                <div class="chart-body">
                    <div
                        ref="chartUserTrendRef"
                        style="height: 220px; width: 100%"
                    ></div>
                </div>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">
                        <span
                            class="chart-title-dot"
                            style="background: var(--gold)"
                        ></span
                        >咨询量趋势
                    </div>
                    <div class="chart-legend">
                        <span
                            class="legend-dot"
                            style="background: var(--gold)"
                        ></span
                        >在线咨询
                        <span
                            class="legend-dot"
                            style="background: #8fa89c; margin-left: 4px"
                        ></span
                        >AI 问诊
                    </div>
                </div>
                <div class="chart-body">
                    <div
                        ref="chartConsultTrendRef"
                        style="height: 220px; width: 100%"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Geographic distribution -->
        <div class="chart-card geo-card">
            <div class="chart-header">
                <div class="chart-title">
                    <span
                        class="chart-title-dot"
                        style="background: var(--cinnabar)"
                    ></span
                    >用户地域分布
                </div>
                <div class="chart-meta">中国地图 · 用户数量</div>
            </div>
            <div class="chart-body geo-chart-body">
                <div class="geo-layout">
                    <div class="geo-map-pane">
                        <ChinaMap3D
                            :data="provinceStats"
                            :active-name="activeProvinceName"
                            class="geo-chart"
                            @hover="hoverProvinceName = $event"
                            @select="selectProvince"
                        />
                    </div>
                    <aside class="geo-rank-pane">
                        <div class="geo-rank-head">
                            <span>地域排行</span>
                            <span>TOP 12</span>
                        </div>
                        <div class="geo-rank-list">
                            <button
                                v-for="(item, index) in topProvinceStats"
                                :key="item.name"
                                type="button"
                                class="geo-rank-item"
                                :class="{
                                    active: activeProvinceName === item.name,
                                }"
                                :aria-pressed="activeProvinceName === item.name"
                                @click="selectProvince(item.name)"
                                @mouseenter="hoverProvinceName = item.name"
                                @mouseleave="hoverProvinceName = ''"
                            >
                                <div class="geo-rank-label">
                                    <span class="geo-rank-index">{{
                                        String(index + 1).padStart(2, "0")
                                    }}</span>
                                    <span class="geo-rank-name">{{
                                        item.name
                                    }}</span>
                                </div>
                                <div class="geo-rank-bar-track">
                                    <div
                                        class="geo-rank-bar-fill"
                                        :style="{
                                            width: `${(item.value / topProvinceMax) * 100}%`,
                                        }"
                                    ></div>
                                </div>
                                <div class="geo-rank-value">
                                    {{ item.value }}人
                                </div>
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>

        <!-- Bottom row -->
        <div class="dashboard-bottom-row">
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">
                        <span
                            class="chart-title-dot"
                            style="background: var(--gold)"
                        ></span
                        >热门节气专题
                    </div>
                    <div class="chart-meta">互动占比</div>
                </div>
                <div class="chart-body solar-chart-body">
                    <div ref="chartSolarRef" class="solar-chart"></div>
                </div>
            </div>

            <div class="status-strip">
                <div class="status-strip-header">
                    <div class="status-strip-title">系统运行状态</div>
                    <button class="status-strip-refresh" @click="refreshStatus">
                        刷新
                    </button>
                </div>
                <div class="status-grid">
                    <div
                        class="status-item"
                        v-for="s in statusItems"
                        :key="s.name"
                    >
                        <div class="status-item-name">{{ s.name }}</div>
                        <div class="status-item-row">
                            <span class="status-led" :class="s.status"></span>
                            <span class="status-val">{{ s.val }}</span>
                        </div>
                        <div class="status-sub">{{ s.sub }}</div>
                        <div v-if="s.bar > 0" class="status-bar-wrap">
                            <div
                                class="status-bar"
                                :class="s.status"
                                :style="{ width: s.bar + '%' }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { ApiExpert } from "@/network/expert";
import { ApiAdmin } from "@/network/admin";
import ChinaMap3D from "./ChinaMap3D.vue";

// ── Template refs ──────────────────────────────────────────────────────────
const dashboardRef = ref<HTMLElement | null>(null);
const chartUserTrendRef = ref<HTMLElement | null>(null);
const chartConsultTrendRef = ref<HTMLElement | null>(null);
const chartSolarRef = ref<HTMLElement | null>(null);

// ── Date display ───────────────────────────────────────────────────────────
const todayDate = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
});

// ── Date range ─────────────────────────────────────────────────────────────
const ranges = [
    { label: "近 7 天", value: 7 },
    { label: "近 30 天", value: 30 },
    { label: "近 3 月", value: 90 },
];
const activeRange = ref(7);
function setRange(v: number) {
    activeRange.value = v;
}

// ── KPI data ───────────────────────────────────────────────────────────────
const kpiRow1 = ref([
    {
        id: "users",
        label: "平台总用户数",
        display: "…",
        color: "jade",
        icon: "👥",
        trend: "↑ +12 今日新增",
        trendDir: "up",
    },
    {
        id: "consult",
        label: "在线咨询（今日）",
        display: "1,256",
        color: "gold",
        icon: "💬",
        trend: "↑ +8.4% 较昨日",
        trendDir: "up",
    },
    {
        id: "ai",
        label: "AI 问诊调用（今日）",
        display: "3,842",
        color: "slate",
        icon: "🤖",
        trend: "↑ +324 较昨日",
        trendDir: "up",
    },
    {
        id: "revenue",
        label: "平台收益（本月）",
        display: "¥18.6万",
        color: "gold",
        icon: "💰",
        trend: "↑ +12.3% 较上月",
        trendDir: "up",
    },
]);
const kpiRow2 = ref([
    {
        id: "experts",
        label: "专家入驻总数",
        display: "…",
        color: "jade",
        icon: "👨‍⚕️",
        trend: "加载中…",
        trendDir: "up",
        sub: "",
        alert: false,
    },
    {
        id: "pending",
        label: "待审核专家",
        display: "…",
        color: "cinnabar",
        icon: "📝",
        trend: "加载中…",
        trendDir: "warn",
        sub: "",
        alert: false,
    },
    {
        id: "content",
        label: "内容发布（本月）",
        display: "3,420",
        color: "jade",
        icon: "📚",
        trend: "↑ +48 本周",
        trendDir: "up",
        sub: "节气专题 12 个",
        alert: false,
    },
    {
        id: "newusers",
        label: "今日新增用户",
        display: "…",
        color: "gold",
        icon: "✨",
        trend: "加载中…",
        trendDir: "up",
        sub: "",
        alert: false,
    },
]);

// ── System status ──────────────────────────────────────────────────────────
const statusItems = ref([
    { name: "API 网关", status: "ok", val: "43ms", sub: "响应延迟", bar: 0 },
    { name: "数据库", status: "ok", val: "23/100", sub: "连接数", bar: 23 },
    { name: "Redis 缓存", status: "ok", val: "94.2%", sub: "命中率", bar: 94 },
    {
        name: "AI 问诊服务",
        status: "ok",
        val: "3,842",
        sub: "今日调用",
        bar: 0,
    },
    { name: "WebSocket", status: "ok", val: "47", sub: "在线连接", bar: 0 },
    { name: "CDN", status: "warn", val: "1.2 MB/s", sub: "带宽占用", bar: 62 },
]);
function refreshStatus() {
    statusItems.value[0]!.val = Math.floor(38 + Math.random() * 20) + "ms";
    statusItems.value[1]!.val = Math.floor(18 + Math.random() * 15) + "/100";
    statusItems.value[2]!.val = (93 + Math.random() * 3).toFixed(1) + "%";
}

// ── Geographic data ────────────────────────────────────────────────────────
const provinceStats = [
    { name: "广东", value: 168, coord: [113.3, 23.1] },
    { name: "浙江", value: 142, coord: [120.2, 30.3] },
    { name: "江苏", value: 128, coord: [118.8, 32.1] },
    { name: "北京", value: 115, coord: [116.4, 39.9] },
    { name: "上海", value: 98, coord: [121.5, 31.2] },
    { name: "四川", value: 87, coord: [104.1, 30.7] },
    { name: "山东", value: 82, coord: [117.0, 36.7] },
    { name: "湖南", value: 76, coord: [112.9, 28.2] },
    { name: "湖北", value: 65, coord: [114.3, 30.6] },
    { name: "河南", value: 58, coord: [113.6, 34.7] },
    { name: "福建", value: 54, coord: [119.3, 26.1] },
    { name: "辽宁", value: 48, coord: [123.4, 41.8] },
    { name: "云南", value: 43, coord: [102.7, 25.0] },
    { name: "贵州", value: 38, coord: [106.7, 26.6] },
    { name: "海南", value: 35, coord: [110.2, 20.0] },
    { name: "吉林", value: 34, coord: [125.3, 43.9] },
    { name: "新疆", value: 32, coord: [87.6, 43.8] },
    { name: "黑龙江", value: 29, coord: [126.6, 45.8] },
    { name: "内蒙古", value: 27, coord: [111.7, 40.8] },
    { name: "甘肃", value: 25, coord: [103.8, 36.1] },
    { name: "台湾", value: 21, coord: [121.0, 23.7] },
    { name: "安徽", value: 20, coord: [117.3, 31.8] },
    { name: "江西", value: 19, coord: [115.9, 28.7] },
    { name: "重庆", value: 18, coord: [106.5, 29.6] },
    { name: "陕西", value: 17, coord: [108.9, 34.3] },
    { name: "香港", value: 16, coord: [114.2, 22.3] },
    { name: "宁夏", value: 15, coord: [106.3, 38.5] },
    { name: "河北", value: 14, coord: [114.5, 38.0] },
    { name: "山西", value: 13, coord: [112.5, 37.9] },
    { name: "西藏", value: 12, coord: [91.1, 29.7] },
    { name: "青海", value: 10, coord: [101.8, 36.6] },
    { name: "澳门", value: 8, coord: [113.6, 22.2] },
    { name: "天津", value: 7, coord: [117.2, 39.1] },
    { name: "广西", value: 6, coord: [108.3, 22.8] },
] as const;

const topProvinceStats = computed(() =>
    [...provinceStats].sort((a, b) => b.value - a.value).slice(0, 12),
);
const topProvinceMax = computed(() => topProvinceStats.value[0]?.value ?? 1);
const selectedProvinceName = ref("");
const hoverProvinceName = ref("");
const activeProvinceName = computed(
    () => hoverProvinceName.value || selectedProvinceName.value,
);
function selectProvince(name: string) {
    selectedProvinceName.value = name;
}
const solarData = [
    { name: "立夏·消暑养心", value: 3420, color: "#C9A55C" },
    { name: "小满·祛湿调体", value: 2870, color: "#5C8374" },
    { name: "谷雨·春末护肝", value: 2210, color: "#8FA89C" },
    { name: "清明·疏肝解郁", value: 1980, color: "#A07840" },
    { name: "春分·调和阴阳", value: 1650, color: "#4A565A" },
    { name: "惊蛰·春季祛寒", value: 1240, color: "#D4B896" },
] as const;

// ── ECharts helpers ────────────────────────────────────────────────────────
const charts: Record<string, any> = {};
let ro: ResizeObserver | null = null;

function seeded(base: number, noise: number, len: number): number[] {
    const arr: number[] = [];
    let val = base;
    for (let i = 0; i < len; i++) {
        val += (Math.random() - 0.45) * noise;
        val = Math.max(base * 0.6, Math.min(base * 1.5, val));
        arr.push(Math.round(val));
    }
    return arr;
}

function makeDates(days: number): string[] {
    return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    });
}

function destroyCharts() {
    Object.values(charts).forEach((c) => {
        try {
            c.dispose();
        } catch {
            /* */
        }
    });
    Object.keys(charts).forEach((k) => delete charts[k]);
}

async function initCharts() {
    destroyCharts();
    const echarts = await import("echarts");
    const days = activeRange.value;
    const dates = makeDates(days);
    const labelInterval = days <= 7 ? 0 : Math.floor(days / 7) - 1;

    const tooltipBase = {
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#E8DFD0",
        borderWidth: 1,
        textStyle: { color: "#2C3639", fontSize: 13 },
        extraCssText:
            "box-shadow:0 4px 18px rgba(60,50,30,0.1);border-radius:9px;",
    };
    const xAxisBase = (interval: number) => ({
        type: "category" as const,
        data: dates,
        axisLine: { lineStyle: { color: "#E8DFD0" } },
        axisTick: { show: false },
        axisLabel: { color: "#6B7C7A", fontSize: 11, interval },
    });

    // User activity
    if (chartUserTrendRef.value) {
        const c = echarts.init(chartUserTrendRef.value);
        charts.userTrend = c;
        c.setOption({
            grid: { top: 20, right: 20, bottom: 32, left: 48 },
            tooltip: {
                ...tooltipBase,
                trigger: "axis",
                axisPointer: { lineStyle: { color: "#E8DFD0" } },
            },
            xAxis: xAxisBase(labelInterval),
            yAxis: [
                {
                    type: "value",
                    splitLine: { lineStyle: { color: "#FAF6EE" } },
                    axisLabel: { color: "#6B7C7A", fontSize: 11 },
                },
                {
                    type: "value",
                    splitLine: { show: false },
                    axisLabel: { color: "#6B7C7A", fontSize: 11 },
                },
            ],
            series: [
                {
                    name: "日活用户",
                    type: "line",
                    data: seeded(320, 40, days),
                    smooth: true,
                    yAxisIndex: 0,
                    lineStyle: { color: "#5C8374", width: 2.5 },
                    itemStyle: { color: "#5C8374" },
                    symbol: "circle",
                    symbolSize: 5,
                    showSymbol: false,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(92,131,116,0.2)" },
                            { offset: 1, color: "rgba(92,131,116,0.02)" },
                        ]),
                    },
                },
                {
                    name: "新增用户",
                    type: "bar",
                    data: seeded(12, 5, days),
                    yAxisIndex: 1,
                    barMaxWidth: 8,
                    barMinHeight: 3,
                    itemStyle: { color: "#C9A55C", borderRadius: [3, 3, 0, 0] },
                },
            ],
        });
    }

    // Consultation trend
    if (chartConsultTrendRef.value) {
        const c = echarts.init(chartConsultTrendRef.value);
        charts.consultTrend = c;
        c.setOption({
            grid: { top: 20, right: 20, bottom: 32, left: 52 },
            tooltip: {
                ...tooltipBase,
                trigger: "axis",
                axisPointer: { lineStyle: { color: "#E8DFD0" } },
            },
            xAxis: xAxisBase(labelInterval),
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { color: "#FAF6EE" } },
                axisLabel: { color: "#6B7C7A", fontSize: 11 },
            },
            series: [
                {
                    name: "在线咨询",
                    type: "line",
                    data: seeded(1200, 150, days),
                    smooth: true,
                    lineStyle: { color: "#C9A55C", width: 2.5 },
                    itemStyle: { color: "#C9A55C" },
                    symbol: "circle",
                    symbolSize: 5,
                    showSymbol: false,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(201,165,92,0.25)" },
                            { offset: 1, color: "rgba(201,165,92,0.02)" },
                        ]),
                    },
                },
                {
                    name: "AI 问诊",
                    type: "line",
                    data: seeded(3500, 400, days),
                    smooth: true,
                    lineStyle: { color: "#8FA89C", width: 2, type: "dashed" },
                    itemStyle: { color: "#8FA89C" },
                    symbol: "circle",
                    symbolSize: 4,
                    showSymbol: false,
                },
            ],
        });
    }

    // Solar term donut
    if (chartSolarRef.value) {
        const c = echarts.init(chartSolarRef.value);
        charts.solar = c;
        c.setOption({
            baseOption: {
                tooltip: {
                    ...tooltipBase,
                    trigger: "item",
                    formatter: "{b}: {c}次 ({d}%)",
                },
                legend: {
                    orient: "vertical",
                    right: "6%",
                    top: "middle",
                    icon: "circle",
                    itemWidth: 11,
                    itemHeight: 11,
                    itemGap: 16,
                    textStyle: {
                        color: "#596D68",
                        fontSize: 14,
                        lineHeight: 18,
                    },
                },
                series: [
                    {
                        name: "节气专题",
                        type: "pie",
                        radius: ["48%", "78%"],
                        center: ["34%", "52%"],
                        avoidLabelOverlap: false,
                        label: { show: false },
                        emphasis: {
                            scaleSize: 8,
                            label: {
                                show: true,
                                fontSize: 15,
                                fontWeight: 600,
                                color: "#2C3639",
                                formatter: "{b}\n{c}次",
                            },
                        },
                        data: solarData.map((d) => ({
                            name: d.name,
                            value: d.value,
                            itemStyle: {
                                color: d.color,
                                borderWidth: 3,
                                borderColor: "#fff",
                            },
                        })),
                    },
                ],
            },
            media: [
                {
                    query: { maxWidth: 520 },
                    option: {
                        legend: {
                            orient: "horizontal",
                            left: "center",
                            right: "auto",
                            bottom: 2,
                            itemGap: 12,
                            textStyle: { fontSize: 12, lineHeight: 16 },
                        },
                        series: [
                            { radius: ["42%", "68%"], center: ["50%", "42%"] },
                        ],
                    },
                },
                {
                    query: { minWidth: 521, maxWidth: 660 },
                    option: {
                        legend: {
                            right: "3%",
                            itemGap: 12,
                            textStyle: { fontSize: 13, lineHeight: 17 },
                        },
                        series: [
                            { radius: ["45%", "73%"], center: ["33%", "52%"] },
                        ],
                    },
                },
            ],
        });
    }
}

// ── Sparklines ─────────────────────────────────────────────────────────────
function drawSparkline(id: string, data: number[], color: string) {
    const svg = document.getElementById(id);
    if (!svg) return;
    const [w, h, pad] = [64, 24, 2];
    const min = Math.min(...data),
        max = Math.max(...data),
        range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((v - min) / range) * (h - 2 * pad);
        return `${x},${y}`;
    });
    const line = "M" + pts.join("L");
    svg.innerHTML = `<defs><linearGradient id="sg${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient></defs>
  <path d="${line}L${w - pad},${h - pad}L${pad},${h - pad}Z" fill="url(#sg${id})"/>
  <path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function initSparklines() {
    drawSparkline(
        "spark-users",
        [210, 225, 218, 240, 232, 248, 256],
        "#5C8374",
    );
    drawSparkline(
        "spark-consult",
        [980, 1020, 1060, 1100, 1150, 1200, 1256],
        "#C9A55C",
    );
    drawSparkline(
        "spark-ai",
        [2800, 3100, 3200, 3400, 3500, 3700, 3842],
        "#4A565A",
    );
    drawSparkline(
        "spark-revenue",
        [14.2, 15.1, 15.8, 16.4, 17.0, 17.8, 18.6],
        "#C9A55C",
    );
}

// ── Counter animation ──────────────────────────────────────────────────────
function animateCounter(el: Element | null, target: number, dur = 1200) {
    if (!el) return;
    const t0 = performance.now();
    const isFloat = target % 1 !== 0;
    const tick = (now: number) => {
        const ease = 1 - Math.pow(1 - Math.min((now - t0) / dur, 1), 3);
        el.textContent = isFloat
            ? (target * ease).toFixed(1)
            : Math.floor(target * ease).toLocaleString("zh-CN");
        if (ease < 1) requestAnimationFrame(tick);
        else
            el.textContent = isFloat
                ? target.toFixed(1)
                : target.toLocaleString("zh-CN");
    };
    requestAnimationFrame(tick);
}

function initCounters() {
    (
        [
            ["kpi-consult", 1256],
            ["kpi-ai", 3842],
            ["kpi-content", 3420],
        ] as [string, number][]
    ).forEach(([id, v]) => animateCounter(document.getElementById(id), v));

    const revEl = document.getElementById("kpi-revenue");
    if (revEl) {
        const t0 = performance.now();
        const tick = (now: number) => {
            const e = 1 - Math.pow(1 - Math.min((now - t0) / 1200, 1), 3);
            revEl.textContent = "¥" + (18.6 * e).toFixed(1) + "万";
            if (e < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
watch(activeRange, initCharts);

onMounted(async () => {
    initSparklines();
    initCounters();
    await initCharts();
    ro = new ResizeObserver(() =>
        Object.values(charts).forEach((c) => {
            try {
                c.resize();
            } catch {
                /* */
            }
        }),
    );
    if (dashboardRef.value) ro.observe(dashboardRef.value);

    // 并行拉取三项动态数据
    await Promise.allSettled([
        ApiAdmin.getUserStats().then((res) => {
            const raw = (res as any)?.data?.data as {
                total: number;
                todayNew: number;
                yesterdayNew: number;
            };
            const total = raw?.total ?? 0;
            const todayNew = raw?.todayNew ?? 0;
            const yesterdayNew = raw?.yesterdayNew ?? 0;
            // 平台总用户数卡片
            const usersCard = kpiRow1.value.find((c) => c.id === "users")!;
            usersCard.display = total.toLocaleString("zh-CN");
            usersCard.trend =
                todayNew > 0 ? `↑ +${todayNew} 今日新增` : "今日暂无新增";
            usersCard.trendDir = todayNew > 0 ? "up" : "down";
            animateCounter(document.getElementById("kpi-users"), total);
            // 今日新增用户卡片
            const newCard = kpiRow2.value.find((c) => c.id === "newusers")!;
            newCard.display = String(todayNew);
            const diff = todayNew - yesterdayNew;
            if (diff > 0) {
                newCard.trend = `↑ +${diff} 较昨日`;
                newCard.trendDir = "up";
            } else if (diff < 0) {
                newCard.trend = `↓ ${diff} 较昨日`;
                newCard.trendDir = "down";
            } else {
                newCard.trend = "与昨日持平";
                newCard.trendDir = "up";
            }
            animateCounter(document.getElementById("kpi-newusers"), todayNew);
        }),
        ApiExpert.adminGetStats().then((res) => {
            const raw = (res as any)?.data?.data as {
                total: number;
                todayNew: number;
            };
            const total = raw?.total ?? 0;
            const todayNew = raw?.todayNew ?? 0;
            const card = kpiRow2.value.find((c) => c.id === "experts")!;
            card.display = String(total);
            card.trend =
                todayNew > 0 ? `↑ +${todayNew} 今日新增` : "今日暂无新增";
            card.trendDir = todayNew > 0 ? "up" : "down";
            animateCounter(document.getElementById("kpi-experts"), total);
        }),
        ApiExpert.adminListApplications("SUBMITTED", 1, 1).then((res) => {
            const raw = (res as any)?.data?.data;
            const count = Array.isArray(raw) ? raw.length : (raw?.total ?? 0);
            const card = kpiRow2.value.find((c) => c.id === "pending")!;
            card.display = String(count);
            card.trend = count > 0 ? "⚠ 需及时处理" : "暂无待审核";
            card.alert = count > 0;
            animateCounter(document.getElementById("kpi-pending"), count);
        }),
    ]);
});

onUnmounted(() => {
    ro?.disconnect();
    destroyCharts();
});
</script>

<style scoped>
.dashboard {
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
.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}
.section-meta {
    font-size: 13px;
    color: var(--ink-muted);
}

.date-range {
    display: inline-flex;
    gap: 2px;
    background: var(--cream);
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 3px;
}
.date-btn {
    background: transparent;
    border: none;
    padding: 5px 14px;
    border-radius: 7px;
    font-size: 13px;
    color: var(--ink-muted);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
}
.date-btn.active {
    background: white;
    color: var(--jade);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(60, 50, 30, 0.07);
}
.date-btn:not(.active):hover {
    color: var(--ink);
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 14px;
}
.kpi-card {
    background: var(--paper);
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    border: 1px solid rgba(232, 223, 208, 0.6);
    transition:
        box-shadow 0.2s,
        transform 0.2s;
}
.kpi-card:hover {
    box-shadow: 0 4px 18px rgba(60, 50, 30, 0.09);
    transform: translateY(-1px);
}
.kpi-card.compact {
    padding: 14px 18px;
}
.kpi-card.alert-card {
    background: linear-gradient(135deg, #fff9f8, #fff3f0);
    border-color: rgba(179, 60, 44, 0.15);
}
.kpi-card.alert-card .kpi-value {
    color: var(--cinnabar);
}

.kpi-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}
.kpi-body {
    flex: 1;
}
.kpi-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}
.kpi-icon.jade {
    background: var(--jade-soft);
}
.kpi-icon.gold {
    background: var(--gold-soft);
}
.kpi-icon.cinnabar {
    background: var(--cinnabar-soft);
}
.kpi-icon.slate {
    background: #eaedf0;
}

.kpi-label {
    font-size: 12px;
    color: var(--ink-muted);
    margin-bottom: 6px;
}
.kpi-value {
    font-family: "STKaiti", serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1;
}
.kpi-value.sm {
    font-size: 22px;
}
.kpi-footer {
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--ink-muted);
}
.kpi-trend {
    display: flex;
    align-items: center;
    gap: 3px;
    font-weight: 500;
}
.kpi-trend.up {
    color: var(--jade);
}
.kpi-trend.down {
    color: var(--cinnabar);
}
.kpi-trend.warn {
    color: var(--gold-deep, #a07840);
}
.kpi-sparkline {
    flex-shrink: 0;
}
.kpi-sub {
    font-size: 11px;
    color: var(--ink-muted);
}

.chart-row {
    display: grid;
    gap: 14px;
    margin-bottom: 20px;
}
.chart-row-2-1 {
    grid-template-columns: 2fr 1fr;
}
.chart-row-1-2 {
    grid-template-columns: 5fr 7fr;
}
.chart-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    border: 1px solid rgba(232, 223, 208, 0.6);
    overflow: hidden;
}
.chart-header {
    padding: 16px 20px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(232, 223, 208, 0.5);
}
.chart-title {
    font-family: "STKaiti", serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 7px;
}
.chart-title-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}
.chart-meta {
    font-size: 12px;
    color: var(--ink-muted);
}
.chart-legend {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--ink-muted);
}
.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.chart-body {
    padding: 4px 8px 8px;
}
.geo-card {
    margin-bottom: 20px;
}
.geo-chart-body {
    padding: 14px 18px 18px;
}
.geo-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.75fr) 320px;
    gap: 18px;
    align-items: stretch;
}
.geo-map-pane {
    min-width: 0;
    min-height: 440px;
    border: 1px solid rgba(232, 223, 208, 0.58);
    border-radius: 12px;
    background:
        radial-gradient(
            circle at 18% 22%,
            rgba(201, 165, 92, 0.08),
            transparent 34%
        ),
        linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.96) 0%,
            rgba(250, 246, 238, 0.82) 100%
        );
}
.geo-chart {
    height: 440px;
    width: 100%;
}
.geo-rank-pane {
    border: 1px solid rgba(232, 223, 208, 0.58);
    border-radius: 12px;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.96) 0%,
        rgba(250, 246, 238, 0.82) 100%
    );
    padding: 14px 14px 12px;
    display: flex;
    flex-direction: column;
    min-height: 440px;
}
.geo-rank-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--ink);
    font-size: 13px;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.68);
}
.geo-rank-head span:last-child {
    color: var(--ink-muted);
    font-size: 11px;
    font-weight: 500;
}
.geo-rank-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 12px;
}
.geo-rank-item {
    display: grid;
    grid-template-columns: 78px minmax(0, 1fr) 58px;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 5px 6px;
    margin: -5px -6px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition:
        background 0.16s ease,
        border-color 0.16s ease,
        box-shadow 0.16s ease,
        transform 0.16s ease;
}
.geo-rank-item:hover,
.geo-rank-item.active {
    background: rgba(92, 131, 116, 0.08);
    border-color: rgba(92, 131, 116, 0.18);
    box-shadow: 0 4px 12px rgba(60, 50, 30, 0.06);
}
.geo-rank-item.active {
    transform: translateX(2px);
}
.geo-rank-item:focus-visible {
    outline: 2px solid rgba(92, 131, 116, 0.38);
    outline-offset: 2px;
}
.geo-rank-label {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.geo-rank-index {
    width: 24px;
    height: 24px;
    border-radius: 7px;
    background: rgba(92, 131, 116, 0.1);
    color: var(--jade);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}
.geo-rank-name {
    color: var(--ink);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}
.geo-rank-item.active .geo-rank-name,
.geo-rank-item.active .geo-rank-value {
    color: var(--jade);
    font-weight: 800;
}
.geo-rank-item.active .geo-rank-index {
    background: var(--jade);
    color: white;
    box-shadow: 0 4px 10px rgba(92, 131, 116, 0.24);
}
.geo-rank-bar-track {
    height: 10px;
    border-radius: 999px;
    background: #eef3ee;
    overflow: hidden;
}
.geo-rank-bar-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #88a99a 0%, #5c8374 100%);
}
.geo-rank-item.active .geo-rank-bar-fill {
    background: linear-gradient(90deg, #c9a55c 0%, #b33c2c 100%);
}
.geo-rank-value {
    color: var(--ink-muted);
    font-size: 12px;
    text-align: right;
    white-space: nowrap;
}
.dashboard-bottom-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(440px, 1fr);
    gap: 14px;
    align-items: stretch;
    margin-bottom: 24px;
}
.dashboard-bottom-row .chart-card,
.dashboard-bottom-row .status-strip {
    min-height: 294px;
    margin-bottom: 0;
}
.dashboard-bottom-row .status-strip {
    order: 1;
}
.dashboard-bottom-row .chart-card {
    order: 2;
}
.dashboard-bottom-row .status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.dashboard-bottom-row .status-item {
    min-height: 80px;
    border-top: 1px solid rgba(232, 223, 208, 0.5);
}
.dashboard-bottom-row .status-item:nth-child(1),
.dashboard-bottom-row .status-item:nth-child(2) {
    border-top: none;
}
.dashboard-bottom-row .status-item:nth-child(even) {
    border-right: none;
}
.solar-chart-body {
    padding: 10px 14px 14px;
}
.solar-chart {
    width: 100%;
    height: clamp(292px, 22vw, 340px);
    min-height: 292px;
}

.status-strip {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    border: 1px solid rgba(232, 223, 208, 0.6);
    overflow: hidden;
    margin-bottom: 24px;
}
.status-strip-header {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.5);
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.status-strip-title {
    font-family: "STKaiti", serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
}
.status-strip-refresh {
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    color: var(--ink-muted);
    padding: 5px 10px;
    border-radius: 7px;
    transition: all 0.15s;
}
.status-strip-refresh:hover {
    background: var(--cream);
    color: var(--jade);
}
.status-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
}
.status-item {
    padding: 14px 16px;
    border-right: 1px solid rgba(232, 223, 208, 0.5);
    transition: background 0.15s;
}
.status-item:last-child {
    border-right: none;
}
.status-item:hover {
    background: var(--cream);
}
.status-item-name {
    font-size: 12px;
    color: var(--ink-muted);
    margin-bottom: 7px;
}
.status-item-row {
    display: flex;
    align-items: center;
    gap: 6px;
}
.status-led {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}
.status-led.ok {
    background: var(--jade);
    box-shadow: 0 0 6px rgba(92, 131, 116, 0.5);
}
.status-led.warn {
    background: var(--gold);
    box-shadow: 0 0 6px rgba(201, 165, 92, 0.5);
}
.status-led.err {
    background: var(--cinnabar);
    box-shadow: 0 0 6px rgba(179, 60, 44, 0.5);
}
.status-val {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
}
.status-sub {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 3px;
}
.status-bar-wrap {
    background: var(--cream);
    border-radius: 3px;
    height: 5px;
    margin-top: 7px;
    overflow: hidden;
}
.status-bar {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
}
.status-bar.ok {
    background: var(--jade);
}
.status-bar.warn {
    background: var(--gold);
}
.status-bar.err {
    background: var(--cinnabar);
}

@media (max-width: 1280px) {
    .status-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .status-item:nth-child(3) {
        border-right: none;
    }
    .status-item:nth-child(4) {
        border-top: 1px solid rgba(232, 223, 208, 0.5);
    }
    .status-item:nth-child(5) {
        border-top: 1px solid rgba(232, 223, 208, 0.5);
    }
    .status-item:nth-child(6) {
        border-top: 1px solid rgba(232, 223, 208, 0.5);
    }
}
@media (max-width: 1024px) {
    .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .chart-row-2-1,
    .chart-row-1-2,
    .dashboard-bottom-row {
        grid-template-columns: 1fr;
    }
    .geo-layout {
        grid-template-columns: 1fr;
    }
    .geo-map-pane,
    .geo-rank-pane,
    .geo-chart {
        min-height: 0;
        height: 360px;
    }
    .geo-rank-pane {
        height: auto;
    }
    .solar-chart {
        height: 300px;
    }
    .dashboard-bottom-row .status-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .dashboard-bottom-row .status-item:nth-child(2),
    .dashboard-bottom-row .status-item:nth-child(4) {
        border-right: 1px solid rgba(232, 223, 208, 0.5);
    }
    .dashboard-bottom-row .status-item:nth-child(3) {
        border-right: none;
    }
    .dashboard-bottom-row .status-item:nth-child(4),
    .dashboard-bottom-row .status-item:nth-child(5),
    .dashboard-bottom-row .status-item:nth-child(6) {
        border-top: 1px solid rgba(232, 223, 208, 0.5);
    }
}
</style>
