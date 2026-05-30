<template>
    <div class="history-panel">
        <div class="section-title font-serif">历史会话</div>

        <!-- 搜索筛选区 -->
        <div class="panel-card">
            <div class="filter-bar">
                <el-input
                    v-model="filters.custName"
                    placeholder="搜索客户姓名"
                    clearable
                    style="width: 200px"
                    @clear="handleSearch"
                    @keyup.enter="handleSearch"
                />
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 240px"
                    @change="handleSearch"
                />
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="handleReset">重置</el-button>
            </div>
        </div>

        <!-- 历史会话列表 -->
        <div class="panel-card">
            <div class="panel-card-body">
                <div v-if="loading" class="loading-state">
                    <div style="font-size: 48px; margin-bottom: 16px">📜</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        加载中...
                    </div>
                </div>
                <div v-else-if="historyList.length === 0" class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px">📭</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        暂无历史会话
                    </div>
                </div>
                <table v-else class="history-table">
                    <thead>
                        <tr>
                            <th>会话ID</th>
                            <th>客户</th>
                            <th>客服</th>
                            <th>开始时间</th>
                            <th>时长</th>
                            <th>消息数</th>
                            <th>评价</th>
                            <th>结束原因</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in historyList" :key="item.sessionId">
                            <td class="session-id">{{ item.sessionId }}</td>
                            <td>{{ item.custName }}</td>
                            <td>{{ item.agentName }}</td>
                            <td>{{ item.startTime }}</td>
                            <td>{{ item.duration }}</td>
                            <td>{{ item.msgCount }}</td>
                            <td>
                                <span
                                    class="rating-tag"
                                    :class="getRatingClass(item.rating)"
                                >
                                    {{ item.rating }}
                                </span>
                            </td>
                            <td>{{ getEndReasonText(item.endReason) }}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- 分页 -->
                <div v-if="total > 0" class="pagination">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :total="total"
                        :page-sizes="[10, 20, 50]"
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
const dateRange = ref<[Date, Date] | null>(null);

const filters = ref({
    custName: "",
    startDate: "",
    endDate: "",
});

async function loadHistory() {
    loading.value = true;
    try {
        const params: any = {
            page: currentPage.value,
            pageSize: pageSize.value,
        };

        if (filters.value.custName) {
            params.custName = filters.value.custName;
        }

        if (dateRange.value && dateRange.value.length === 2) {
            params.startDate = formatDate(dateRange.value[0]);
            params.endDate = formatDate(dateRange.value[1]);
        }

        const data = await ApiCustomer.getHistorySessions(
            params.page,
            params.pageSize,
            params,
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

function handleSearch() {
    currentPage.value = 1;
    loadHistory();
}

function handleReset() {
    filters.value.custName = "";
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

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getRatingClass(rating: string): string {
    const map: Record<string, string> = {
        非常满意: "rating-excellent",
        满意: "rating-good",
        一般: "rating-average",
        不满意: "rating-poor",
    };
    return map[rating] || "";
}

function getEndReasonText(reason: string): string {
    const map: Record<string, string> = {
        manual: "手动结束",
        transfer: "转接",
        timeout: "超时自动结束",
    };
    return map[reason] || reason;
}

onMounted(() => {
    loadHistory();
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

.panel-card-body {
    padding: 14px 18px;
}

.filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 18px;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 40px;
}

.history-table {
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

.session-id {
    font-family: monospace;
    font-size: 12px;
    color: var(--ink-muted);
}

.rating-tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 3px;
    font-family: "STKaiti", serif;

    &.rating-excellent {
        background: var(--jade-soft);
        color: var(--jade);
    }

    &.rating-good {
        background: #e8f5e9;
        color: #2e7d32;
    }

    &.rating-average {
        background: #fff3e0;
        color: #ef6c00;
    }

    &.rating-poor {
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
