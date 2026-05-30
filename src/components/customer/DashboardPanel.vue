<template>
    <div class="dashboard-panel">
        <div class="section-title font-serif">今日数据</div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
            <div class="stat-card jade">
                <div class="stat-label">接待中</div>
                <div class="stat-value">
                    {{ stats.currentSessions
                    }}<span style="font-size: 16px; color: var(--ink-muted)"
                        >/{{ stats.maxSessions }}</span
                    >
                </div>
                <div class="stat-foot">当前同时接待 / 上限</div>
            </div>
            <div class="stat-card gold">
                <div class="stat-label">排队中</div>
                <div class="stat-value">{{ stats.queueCount }}</div>
                <div class="stat-foot">全店排队人数</div>
            </div>
            <div class="stat-card cinnabar">
                <div class="stat-label">今日已接待</div>
                <div class="stat-value">{{ stats.todayServed }}</div>
                <div class="stat-foot">较昨日 +12%</div>
            </div>
            <div class="stat-card ink">
                <div class="stat-label">今日消息</div>
                <div class="stat-value">{{ stats.todayMessages }}</div>
                <div class="stat-foot">收发总数</div>
            </div>
            <div class="stat-card jade">
                <div class="stat-label">平均首响</div>
                <div class="stat-value">
                    {{ stats.avgFirstResponse
                    }}<span style="font-size: 14px">s</span>
                </div>
                <div class="stat-foot">行业 P50 = 60s</div>
            </div>
        </div>

        <!-- 待办提醒 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>⚠ 待办提醒</h3>
                <span style="font-size: 12px; color: var(--ink-muted)"
                    >超 2 分钟未回复的会话</span
                >
            </div>
            <div class="panel-card-body">
                <div v-if="loading" class="loading-state">
                    <div
                        style="
                            text-align: center;
                            padding: 20px;
                            color: var(--ink-muted);
                        "
                    >
                        加载中...
                    </div>
                </div>
                <div
                    v-else-if="urgentSessions.length === 0"
                    class="empty-state"
                >
                    <div
                        style="
                            text-align: center;
                            padding: 20px;
                            color: var(--ink-muted);
                        "
                    >
                        ✨ 暂无待办事项
                    </div>
                </div>
                <div v-else>
                    <div
                        v-for="session in urgentSessions"
                        :key="session.id"
                        class="todo-item"
                        :class="{ urgent: isUrgent(session.startedAt) }"
                    >
                        <span style="font-size: 22px">{{
                            getTodoIcon(session.sourceTag)
                        }}</span>
                        <div class="todo-text">
                            <strong>{{ session.custName }}</strong> ·
                            {{ session.source }}
                            <div
                                style="
                                    font-size: 12px;
                                    color: var(--ink-muted);
                                    margin-top: 2px;
                                "
                            >
                                "{{ session.lastMsg }}"
                            </div>
                        </div>
                        <div class="todo-time">
                            {{ formatWaitTime(session.startedAt) }}
                        </div>
                        <button
                            class="btn btn-cinnabar"
                            @click="handleReply(session.id)"
                        >
                            立即回复
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 全店客服在线情况 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>📋 全店客服在线情况</h3>
            </div>
            <div class="panel-card-body">
                <div v-if="colleaguesLoading" class="loading-state">
                    <div
                        style="
                            text-align: center;
                            padding: 20px;
                            color: var(--ink-muted);
                        "
                    >
                        加载中...
                    </div>
                </div>
                <table v-else class="queue-table">
                    <thead>
                        <tr>
                            <th>客服</th>
                            <th>职能</th>
                            <th>状态</th>
                            <th>当前接待</th>
                            <th>今日已接待</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="colleague in colleagues"
                            :key="colleague.name"
                        >
                            <td>{{ colleague.name }}</td>
                            <td>
                                <span
                                    class="tag"
                                    :class="getRoleTagClass(colleague.role)"
                                >
                                    {{ getRoleText(colleague.role) }}
                                </span>
                            </td>
                            <td>
                                <span
                                    class="status-led"
                                    :class="`led-${colleague.status}`"
                                ></span>
                                {{ getStatusText(colleague.status) }}
                            </td>
                            <td>
                                {{ colleague.currentLoad }} /
                                {{ colleague.maxLoad }}
                            </td>
                            <td>{{ colleague.todayServed }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
    ApiCustomer,
    type CustomerStats,
    type AgentColleague,
    type CustomerSession,
} from "@/network/customer";
import { ElMessage } from "element-plus";

const loading = ref(false);
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
const urgentSessions = ref<CustomerSession[]>([]);

async function loadStats() {
    try {
        const data = await ApiCustomer.getStats();
        if (data) {
            stats.value = data;
        }
    } catch (error) {
        console.error("加载统计数据失败:", error);
    }
}

async function loadColleagues() {
    colleaguesLoading.value = true;
    try {
        const data = await ApiCustomer.getColleagues();
        colleagues.value = data;
    } catch (error) {
        console.error("加载客服列表失败:", error);
    } finally {
        colleaguesLoading.value = false;
    }
}

async function loadUrgentSessions() {
    loading.value = true;
    try {
        const sessions = await ApiCustomer.getSessions();
        // 筛选出超过2分钟未回复的会话
        urgentSessions.value = sessions.filter((session) => {
            const waitTime = Date.now() - new Date(session.startedAt).getTime();
            return waitTime > 2 * 60 * 1000; // 2分钟
        });
    } catch (error) {
        console.error("加载会话列表失败:", error);
    } finally {
        loading.value = false;
    }
}

function handleReply(sessionId: string) {
    // TODO: 跳转到聊天面板并选中该会话
    ElMessage.success("正在切换到会话...");
    console.log("切换到会话:", sessionId);
}

function isUrgent(startedAt: string): boolean {
    const waitTime = Date.now() - new Date(startedAt).getTime();
    return waitTime > 3 * 60 * 1000; // 3分钟以上为紧急
}

function formatWaitTime(startedAt: string): string {
    const waitTime = Date.now() - new Date(startedAt).getTime();
    const minutes = Math.floor(waitTime / 60000);
    const seconds = Math.floor((waitTime % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getTodoIcon(sourceTag: string): string {
    const map: Record<string, string> = {
        product: "🔥",
        order: "📦",
        general: "💬",
    };
    return map[sourceTag] || "💬";
}

function getRoleTagClass(role: string): string {
    const map: Record<string, string> = {
        presale: "tag-jade",
        aftersale: "tag-cinnabar",
    };
    return map[role] || "";
}

function getRoleText(role: string): string {
    const map: Record<string, string> = {
        presale: "售前",
        aftersale: "售后",
    };
    return map[role] || role;
}

function getStatusText(status: string): string {
    const map: Record<string, string> = {
        online: "接待中",
        break: "小休",
        off: "下班",
    };
    return map[status] || status;
}

onMounted(() => {
    loadStats();
    loadColleagues();
    loadUrgentSessions();
});
</script>

<style scoped lang="scss">
.section-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
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
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 22px;
}

.stat-card {
    background: var(--paper);
    border-radius: 12px;
    padding: 18px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
    }

    &.jade::before {
        background: var(--jade);
    }
    &.gold::before {
        background: var(--gold);
    }
    &.cinnabar::before {
        background: var(--cinnabar);
    }
    &.ink::before {
        background: var(--ink-light);
    }
}

.stat-label {
    font-size: 13px;
    color: var(--ink-muted);
}

.stat-value {
    font-family: "STKaiti", serif;
    font-size: 26px;
    font-weight: 700;
    margin-top: 6px;
}

.stat-foot {
    font-size: 11px;
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
        font-size: 16px;
        font-weight: 600;
    }
}

.panel-card-body {
    padding: 14px 18px;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    margin-bottom: 10px;
    background: var(--paper-warm);

    &:last-child {
        margin-bottom: 0;
    }

    &.urgent {
        border-color: var(--cinnabar);
        background: var(--cinnabar-soft);
    }
}

.todo-text {
    flex: 1;
    font-size: 14px;
}

.todo-time {
    font-size: 12px;
    color: var(--cinnabar);
    font-weight: 600;
}

.queue-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    thead {
        background: var(--cream);
    }

    th {
        text-align: left;
        font-weight: 500;
        font-size: 13px;
        color: var(--ink-muted);
        padding: 12px 16px;
    }

    td {
        padding: 14px 16px;
        border-top: 1px solid var(--line);
        vertical-align: middle;
    }

    tr:hover td {
        background: rgba(250, 246, 238, 0.5);
    }
}

.tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 3px;
    font-family: "STKaiti", serif;

    &.tag-jade {
        background: var(--jade-soft);
        color: var(--jade);
    }

    &.tag-cinnabar {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }
}

.status-led {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;

    &.led-online {
        background: #2eae6f;
        box-shadow: 0 0 6px rgba(46, 174, 111, 0.6);
    }

    &.led-break {
        background: #999;
    }
}

.btn {
    border: 1px solid var(--line);
    background: white;
    padding: 6px 14px;
    font-size: 13px;
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &:hover {
        border-color: var(--ink-muted);
    }

    &.btn-cinnabar {
        border-color: var(--cinnabar);
        color: var(--cinnabar);

        &:hover {
            background: var(--cinnabar);
            color: white;
        }
    }
}
</style>
