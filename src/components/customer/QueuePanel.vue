<template>
    <div class="queue-panel">
        <div class="section-title font-serif">排队队列</div>

        <div class="panel-card">
            <div class="panel-card-head">
                <h3>等待中的客户</h3>
                <span class="head-note"
                    >系统自动按 FIFO 分配，您也可主动接入</span
                >
            </div>
            <div class="panel-card-body">
                <div v-if="loading" class="loading-state">
                    <div class="state-icon">…</div>
                    <div class="state-text">加载中...</div>
                </div>
                <div v-else-if="queueList.length === 0" class="empty-state">
                    <div class="state-text">暂无排队客户</div>
                </div>
                <table v-else class="queue-table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>客户</th>
                            <th>来源</th>
                            <th>首条消息</th>
                            <th>等待时长</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(item, index) in paginatedList"
                            :key="item.bridgeId ?? item.queueNum"
                        >
                            <td class="queue-num">
                                {{ (currentPage - 1) * pageSize + index + 1 }}
                            </td>
                            <td>{{ item.custName }}</td>
                            <td>
                                <a class="source-link">{{ item.source }}</a>
                            </td>
                            <td class="first-msg">{{ item.firstMsg }}</td>
                            <td>
                                <span
                                    class="wait-time"
                                    :class="{
                                        overtime: isOvertime(item.startedAt),
                                    }"
                                >
                                    {{ formatWaitTime(item.startedAt) }}
                                </span>
                            </td>
                            <td>
                                <button
                                    class="btn btn-jade"
                                    @click="handleAccept(item)"
                                >
                                    接入
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="queueList.length > 0" class="pagination">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :total="queueList.length"
                        :page-sizes="[10, 20]"
                        layout="total, sizes, prev, pager, next"
                        @size-change="currentPage = 1"
                        @current-change="() => {}"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
    ApiCustomer,
    type QueuedCustomer,
    type CustomerSession,
} from "@/network/customer";
import { ElMessage } from "element-plus";
import {
    bridgeSessions,
    bridgeAgentAccept,
} from "@/network/chatBridge";

interface QueueItem extends QueuedCustomer {
    bridgeId?: string;
}

const emit = defineEmits<{
    "switch-to-chat": [session: CustomerSession];
    "count-update": [count: number];
}>();

const loading = ref(false);
const queueList = ref<QueuedCustomer[]>([]);
const now = ref(Date.now());
const currentPage = ref(1);
const pageSize = ref(10);

// 桥中的真实排队（来自商城端）排在前面
const mergedQueueList = computed<QueueItem[]>(() => [
    ...bridgeSessions
        .filter((s) => s.status === "queued")
        .map((s, i) => ({
            queueNum: -(i + 1),
            custName: s.custName,
            source: s.source,
            sourceTag: "general" as const,
            firstMsg: s.firstMsg,
            startedAt: s.startedAt,
            roleType: "presale" as const,
            bridgeId: s.id,
        })),
    ...queueList.value.map((q) => ({ ...q, bridgeId: undefined })),
]);

const paginatedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return mergedQueueList.value.slice(start, start + pageSize.value);
});

let timerInterval: ReturnType<typeof setInterval>;
let queuePollInterval: ReturnType<typeof setInterval>;

function formatWaitTime(startedAt: string): string {
    const ms = now.value - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function isOvertime(startedAt: string): boolean {
    return now.value - new Date(startedAt).getTime() > 5 * 60 * 1000;
}

async function loadQueue() {
    loading.value = true;
    try {
        const data = await ApiCustomer.getQueueList();
        queueList.value = data;
    } catch (error) {
        console.error("加载排队队列失败:", error);
        ElMessage.error("加载排队队列失败");
    } finally {
        loading.value = false;
    }
}

async function handleAccept(item: QueueItem) {
    if (item.bridgeId) {
        // 来自商城端的真实排队
        const bridgeSession = bridgeAgentAccept(item.bridgeId);
        if (!bridgeSession) {
            ElMessage.error("接入失败");
            return;
        }
        const t = new Date();
        const time = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
        const session: CustomerSession = {
            id: bridgeSession.id,
            custId: bridgeSession.custId,
            custName: bridgeSession.custName,
            avatar: bridgeSession.custName.slice(-1),
            source: bridgeSession.source,
            sourceTag: "general",
            startedAt: bridgeSession.startedAt,
            unread: bridgeSession.messages.filter(
                (m) => m.from === "customer",
            ).length,
            lastMsg: bridgeSession.firstMsg,
            custTags: [],
            custCity: "",
            custReg: "",
            custSpent: "¥0",
            custOrderCount: 0,
            custCart: [],
            cartTotal: 0,
            messages: [
                { from: "sys", text: `会话开始 · ${time}`, time: "" },
                ...bridgeSession.messages.map((m) => ({
                    from:
                        m.from === "customer"
                            ? ("customer" as const)
                            : ("me" as const),
                    text: m.text,
                    time: m.time,
                })),
            ],
        };
        ElMessage.success("已成功接入，正在跳转接待中...");
        emit("switch-to-chat", session);
    } else {
        // 原有 mock 排队
        try {
            const session = await ApiCustomer.acceptFromQueue(item.queueNum);
            if (session) {
                ElMessage.success("已成功接入，正在跳转接待中...");
                queueList.value = queueList.value.filter(
                    (q) => q.queueNum !== item.queueNum,
                );
                emit("switch-to-chat", session);
            } else {
                ElMessage.error("接入失败");
            }
        } catch (error) {
            console.error("接入客户失败:", error);
            ElMessage.error("接入客户失败");
        }
    }
}

watch(
    () => mergedQueueList.value.length,
    (count) => emit("count-update", count),
);

onMounted(() => {
    loadQueue();
    timerInterval = setInterval(() => {
        now.value = Date.now();
    }, 1000);
    queuePollInterval = setInterval(loadQueue, 8000);
});

onUnmounted(() => {
    clearInterval(timerInterval);
    clearInterval(queuePollInterval);
});
</script>

<style scoped lang="scss">
.section-title {
    font-family: "STKaiti", serif;
    font-size: 22px;
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

.panel-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
}

.panel-card-head {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 18px;
        font-weight: 600;
    }
}

.head-note {
    font-size: 15px;
    color: var(--ink-muted);
}

.panel-card-body {
    padding: 14px 18px;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 40px;
}

.state-icon {
    font-size: 34px;
    margin-bottom: 12px;
    color: var(--ink-muted);
}

.state-text {
    font-size: 17px;
    color: var(--ink-muted);
}

.queue-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 17px;

    thead {
        background: var(--cream);
    }

    th {
        text-align: left;
        font-weight: 500;
        font-size: 16px;
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

.queue-num {
    color: var(--ink-muted);
    font-size: 16px;
}

.source-link {
    color: #4a7c6f;
    font-size: 16px;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
        color: var(--jade);
    }
}

.first-msg {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ink-light);
}

.wait-time {
    color: var(--ink-light);
    font-variant-numeric: tabular-nums;
    font-weight: 600;

    &.overtime {
        color: var(--cinnabar);
        font-weight: 700;
    }
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.btn {
    border: 1px solid var(--line);
    background: white;
    padding: 6px 16px;
    font-size: 16px;
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;

    &:hover {
        border-color: var(--ink-muted);
    }

    &.btn-jade {
        border-color: var(--jade);
        color: var(--jade);

        &:hover {
            background: var(--jade);
            color: white;
        }
    }
}
</style>
