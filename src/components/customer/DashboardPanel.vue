<template>
    <div class="dashboard-panel">
        <div class="section-title font-serif">今日数据</div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
            <div class="stat-card jade">
                <div class="stat-label">接待中</div>
                <div class="stat-value">
                    {{ chatCount }}<span class="stat-denom">/{{ stats.maxSessions }}</span>
                </div>
                <div class="stat-foot">当前同时接待 / 上限</div>
            </div>
            <div class="stat-card gold">
                <div class="stat-label">排队中</div>
                <div class="stat-value">{{ queueCount }}</div>
                <div class="stat-foot">全店排队人数</div>
            </div>
            <div class="stat-card cinnabar">
                <div class="stat-label">今日已接待</div>
                <div class="stat-value">{{ stats.todayServed }}</div>
                <div class="stat-foot">每 30 秒更新</div>
            </div>
            <div class="stat-card ink">
                <div class="stat-label">今日消息</div>
                <div class="stat-value">{{ stats.todayMessages }}</div>
                <div class="stat-foot">收发总数</div>
            </div>
        </div>

        <!-- 全店客服在线情况 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>全店客服在线情况</h3>
                <span class="refresh-hint">每 30 秒自动更新</span>
            </div>
            <div class="panel-card-body">
                <div v-if="colleaguesLoading && colleagues.length === 0" class="loading-state">
                    加载中...
                </div>
                <table v-else class="queue-table">
                    <thead>
                        <tr>
                            <th>客服</th>
                            <th>状态</th>
                            <th>当前接待</th>
                            <th>今日已接待</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="c in displayColleagues" :key="c.name">
                            <td>{{ c.name }}</td>
                            <td>
                                <span class="status-led" :class="`led-${c.status}`"></span>
                                {{ getStatusText(c.status) }}
                            </td>
                            <td>{{ c.currentLoad }} / {{ c.maxLoad }}</td>
                            <td>{{ c.todayServed }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ApiCustomer, type CustomerStats, type AgentColleague } from "@/network/customer";

const props = defineProps<{
    chatCount: number;
    queueCount: number;
    agentName: string;
    agentStatus: "online" | "break" | "off";
}>();

// 识别"自己"那行：名字匹配 OR mock 数据里的（我）标记
function isSelf(c: AgentColleague): boolean {
    return c.name.includes("（我）") ||
        (!!props.agentName && c.name.includes(props.agentName));
}

const POLL_INTERVAL = 30_000;

const colleaguesLoading = ref(false);
const stats = ref<CustomerStats>({
    currentSessions: 0,
    maxSessions: 5,
    queueCount: 0,
    todayServed: 0,
    todayMessages: 0,
    avgFirstResponse: 0,
});
const colleagues = ref<AgentColleague[]>([]);

// 实时合并：自己那行用 prop 覆盖状态/接待数/今日已接待
const displayColleagues = computed(() =>
    colleagues.value.map((c) =>
        isSelf(c)
            ? {
                  ...c,
                  status: props.agentStatus,
                  currentLoad: props.chatCount,
                  todayServed: stats.value.todayServed,
              }
            : c,
    ),
);

async function loadStats() {
    try {
        const data = await ApiCustomer.getStats();
        if (data) stats.value = data;
    } catch (e) {
        console.error("加载统计数据失败:", e);
    }
}

async function loadColleagues() {
    colleaguesLoading.value = true;
    try {
        colleagues.value = await ApiCustomer.getColleagues();
    } catch (e) {
        console.error("加载客服列表失败:", e);
    } finally {
        colleaguesLoading.value = false;
    }
}

function getStatusText(status: string): string {
    const map: Record<string, string> = { online: "接待中", break: "小休", off: "下班" };
    return map[status] || status;
}

let pollTimer: ReturnType<typeof setInterval>;

onMounted(() => {
    loadStats();
    loadColleagues();
    pollTimer = setInterval(() => {
        loadStats();
        loadColleagues();
    }, POLL_INTERVAL);
});

onUnmounted(() => clearInterval(pollTimer));
</script>

<style scoped lang="scss">
.section-title {
    font-family: "STKaiti", serif;
    font-size: 23px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;

    &::before {
        content: "";
        width: 4px;
        height: 18px;
        background: var(--cinnabar);
        border-radius: 2px;
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 22px;
}

.stat-card {
    background: var(--paper);
    border-radius: 12px;
    padding: 20px 18px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: transform 0.22s ease, box-shadow 0.22s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 28px rgba(60, 50, 30, 0.13);
    }

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
    }

    &.jade::before  { background: var(--jade); }
    &.gold::before  { background: var(--gold); }
    &.cinnabar::before { background: var(--cinnabar); }
    &.ink::before   { background: var(--ink-light); }
}

.stat-label {
    font-size: 17px;
    color: var(--ink-muted);
}

.stat-value {
    font-family: "STKaiti", serif;
    font-size: 30px;
    font-weight: 700;
    margin-top: 6px;
    color: var(--ink);
}

.stat-denom {
    font-size: 18px;
    color: var(--ink-muted);
    font-weight: 400;
}

.stat-foot {
    font-size: 14px;
    color: var(--ink-muted);
    margin-top: 6px;
}

.panel-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    margin-bottom: 16px;
}

.panel-card-head {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 19px;
        font-weight: 600;
    }
}

.refresh-hint {
    font-size: 13px;
    color: var(--ink-muted);
}

.panel-card-body {
    padding: 14px 18px;
}

.loading-state {
    text-align: center;
    padding: 20px;
    color: var(--ink-muted);
    font-size: 15px;
}

.queue-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 17px;

    thead { background: var(--cream); }

    th {
        text-align: left;
        font-weight: 500;
        font-size: 17px;
        color: var(--ink-muted);
        padding: 12px 16px;
    }

    td {
        padding: 14px 16px;
        border-top: 1px solid var(--line);
        vertical-align: middle;
    }

    tr:hover td { background: rgba(250, 246, 238, 0.5); }
}

.status-led {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;

    &.led-online {
        background: #2eae6f;
        box-shadow: 0 0 6px rgba(46, 174, 111, 0.6);
    }

    &.led-break { background: #999; }
    &.led-off   { background: #555; }
}
</style>
