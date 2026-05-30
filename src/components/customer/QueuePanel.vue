<template>
    <div class="queue-panel">
        <div class="section-title font-serif">排队队列</div>
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>等待中的客户</h3>
                <span style="font-size: 12px; color: var(--ink-muted)"
                    >系统自动按 FIFO + 职能匹配分配，您也可主动接入</span
                >
            </div>
            <div class="panel-card-body">
                <div v-if="loading" class="loading-state">
                    <div style="font-size: 48px; margin-bottom: 16px">⏳</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        加载中...
                    </div>
                </div>
                <div v-else-if="queueList.length === 0" class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px">✨</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        暂无排队客户
                    </div>
                </div>
                <table v-else class="queue-table">
                    <thead>
                        <tr>
                            <th>排队号</th>
                            <th>客户</th>
                            <th>来源</th>
                            <th>首条消息</th>
                            <th>等待时长</th>
                            <th>职能</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in queueList" :key="item.queueNum">
                            <td>
                                <span class="queue-num"
                                    >#{{ item.queueNum }}</span
                                >
                            </td>
                            <td>{{ item.custName }}</td>
                            <td>
                                <span
                                    class="session-tag"
                                    :class="getSourceTagClass(item.sourceTag)"
                                >
                                    {{ item.source }}
                                </span>
                            </td>
                            <td class="first-msg">{{ item.firstMsg }}</td>
                            <td>
                                <span class="wait-time">{{
                                    item.waitTime
                                }}</span>
                            </td>
                            <td>
                                <span
                                    class="tag"
                                    :class="getRoleTagClass(item.roleType)"
                                >
                                    {{ getRoleText(item.roleType) }}
                                </span>
                            </td>
                            <td>
                                <button
                                    class="btn btn-jade"
                                    @click="handleAccept(item.queueNum)"
                                >
                                    接入
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ApiCustomer, type QueuedCustomer } from "@/network/customer";
import { ElMessage } from "element-plus";

const loading = ref(false);
const queueList = ref<QueuedCustomer[]>([]);

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

async function handleAccept(queueNum: number) {
    try {
        const success = await ApiCustomer.acceptFromQueue(queueNum);
        if (success) {
            ElMessage.success(`已成功接入排队客户 #${queueNum}`);
            // 重新加载队列
            await loadQueue();
        } else {
            ElMessage.error("接入失败");
        }
    } catch (error) {
        console.error("接入客户失败:", error);
        ElMessage.error("接入客户失败");
    }
}

function getSourceTagClass(tag: string): string {
    const map: Record<string, string> = {
        product: "tag-product",
        order: "tag-order",
    };
    return map[tag] || "";
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

onMounted(() => {
    loadQueue();
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
        font-size: 16px;
        font-weight: 600;
    }
}

.panel-card-body {
    padding: 14px 18px;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 40px;
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

.queue-num {
    display: inline-block;
    padding: 2px 8px;
    background: var(--gold-soft);
    color: var(--gold);
    border-radius: 4px;
    font-weight: 600;
    font-family: "STKaiti", serif;
}

.session-tag {
    display: inline-block;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    margin-right: 4px;
    background: var(--gold-soft);
    color: var(--gold);
    font-family: "STKaiti", serif;

    &.tag-order {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }

    &.tag-product {
        background: var(--jade-soft);
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
    color: var(--cinnabar);
    font-weight: 600;
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
