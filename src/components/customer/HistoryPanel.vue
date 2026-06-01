<template>
    <div class="history-panel">
        <div class="section-title font-serif">历史会话</div>

        <!-- 搜索筛选区 -->
        <div class="panel-card filter-card">
            <div class="filter-row">
                <el-input
                    v-model="keyword"
                    placeholder="搜索客户ID / 客户名称 / 客服ID / 客服名称（支持模糊查询）"
                    clearable
                    class="filter-input"
                    @keyup.enter="handleSearch"
                    @clear="handleSearch"
                />
                <div class="filter-date-wrap">
                    <span class="filter-label">结束日期</span>
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始"
                        end-placeholder="结束"
                        @change="handleSearch"
                    />
                </div>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="handleReset">重置</el-button>
            </div>
        </div>

        <!-- 历史会话列表 -->
        <div class="panel-card">
            <div class="panel-card-body">
                <div v-if="loading" class="loading-state">
                    <div class="state-text">加载中...</div>
                </div>
                <div v-else-if="historyList.length === 0" class="empty-state">
                    <div class="state-text">暂无历史会话</div>
                </div>
                <table v-else class="history-table">
                    <thead>
                        <tr>
                            <th>客户 ID</th>
                            <th>客户名称</th>
                            <th>客服 ID</th>
                            <th>客服名称</th>
                            <th>消息数</th>
                            <th>开始时间</th>
                            <th>结束时间</th>
                            <th>结束原因</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in historyList" :key="item.id">
                            <td class="id-cell">{{ item.custId }}</td>
                            <td>{{ item.custName }}</td>
                            <td class="id-cell">{{ item.agentId }}</td>
                            <td>{{ item.agentName }}</td>
                            <td>{{ item.msgCount }}</td>
                            <td class="time-cell">{{ item.startTime }}</td>
                            <td class="time-cell">{{ item.endTime }}</td>
                            <td>
                                <span
                                    class="reason-tag"
                                    :class="getReasonClass(item.endReason)"
                                >
                                    {{ getReasonText(item.endReason) }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="total > 0" class="pagination">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :total="total"
                        :page-sizes="[10, 20]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handlePageChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ApiCustomer, type HistorySession } from "@/network/customer";
import { ElMessage } from "element-plus";

const loading = ref(false);
const historyList = ref<HistorySession[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref("");
const dateRange = ref<[Date, Date] | null>(null);

async function loadHistory() {
    loading.value = true;
    try {
        const params: Record<string, string | number> = {};

        if (keyword.value) {
            params.keyword = keyword.value.trim();
        }

        if (dateRange.value?.length === 2) {
            params.startDate = fmt(dateRange.value[0]);
            params.endDate = fmt(dateRange.value[1]);
        }

        const data = await ApiCustomer.getHistorySessions(
            currentPage.value,
            pageSize.value,
            params as any,
        );
        historyList.value = data.records;
        total.value = data.total;
    } catch (error) {
        console.error("加载历史会话失败:", error);
        ElMessage.error("加载历史会话失败");
    } finally {
        loading.value = false;
    }
}

function fmt(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function handleSearch() {
    currentPage.value = 1;
    loadHistory();
}

function handleReset() {
    keyword.value = "";
    dateRange.value = null;
    currentPage.value = 1;
    loadHistory();
}

function handleSizeChange(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    loadHistory();
}

function handlePageChange(page: number) {
    currentPage.value = page;
    loadHistory();
}

function getReasonClass(reason: string): string {
    return reason === "timeout" ? "reason-timeout" : "reason-manual";
}

function getReasonText(reason: string): string {
    return reason === "timeout" ? "客户超时" : "手动结束";
}

function addRecord(record: HistorySession) {
    historyList.value.unshift(record);
    total.value++;
}

onMounted(() => {
    loadHistory();
});

defineExpose({ addRecord });
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

.filter-card {
    padding: 16px 20px;
    margin-bottom: 16px;
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.filter-input {
    flex: 1;
    min-width: 280px;
}

.filter-date-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.filter-label {
    font-size: 16px;
    color: var(--ink-muted);
    white-space: nowrap;
}

.panel-card-body {
    padding: 14px 18px;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 40px;
}

.state-text {
    font-size: 17px;
    color: var(--ink-muted);
}

.history-table {
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
        white-space: nowrap;
    }

    td {
        padding: 13px 16px;
        border-top: 1px solid var(--line);
        vertical-align: middle;
    }

    tr:hover td {
        background: rgba(250, 246, 238, 0.5);
    }
}

.id-cell {
    font-family: monospace;
    font-size: 15px;
    color: var(--ink-muted);
}

.time-cell {
    font-size: 15px;
    white-space: nowrap;
    color: var(--ink-light);
}

.reason-tag {
    display: inline-block;
    padding: 3px 10px;
    font-size: 15px;
    border-radius: 4px;
    font-weight: 500;

    &.reason-manual {
        background: var(--jade-soft);
        color: var(--jade);
    }

    &.reason-timeout {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
