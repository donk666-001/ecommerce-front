<template>
    <div class="tools-panel">
        <div class="section-title font-serif">商品 / 订单速查</div>

        <!-- 搜索标签切换 -->
        <div class="panel-card">
            <div class="search-tabs">
                <button
                    class="tab-btn"
                    :class="{ active: searchType === 'product' }"
                    @click="searchType = 'product'"
                >
                    🛒 商品搜索
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: searchType === 'order' }"
                    @click="searchType = 'order'"
                >
                    📦 订单查询
                </button>
            </div>
        </div>

        <!-- 商品搜索 -->
        <div v-if="searchType === 'product'" class="panel-card">
            <div class="search-bar">
                <el-input
                    v-model="productKeyword"
                    placeholder="输入商品名称关键词"
                    clearable
                    style="flex: 1"
                    @clear="handleProductSearch"
                    @keyup.enter="handleProductSearch"
                >
                    <template #append>
                        <el-button @click="handleProductSearch">搜索</el-button>
                    </template>
                </el-input>
            </div>
            <div class="panel-card-body">
                <div v-if="productLoading" class="loading-state">
                    <div style="font-size: 48px; margin-bottom: 16px">🔍</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        搜索中...
                    </div>
                </div>
                <div v-else-if="products.length === 0" class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px">📭</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        暂无搜索结果
                    </div>
                </div>
                <div v-else class="product-grid">
                    <div
                        v-for="item in products"
                        :key="item.id"
                        class="product-card"
                    >
                        <div class="product-icon">{{ item.icon }}</div>
                        <div class="product-info">
                            <div class="product-name">{{ item.name }}</div>
                            <div class="product-desc">{{ item.desc }}</div>
                            <div class="product-price">¥{{ item.price }}</div>
                        </div>
                        <button class="btn-send" @click="sendProduct(item)">
                            发送
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 订单查询 -->
        <div v-if="searchType === 'order'" class="panel-card">
            <div class="search-bar">
                <el-input
                    v-model="orderKeyword"
                    placeholder="输入订单号或客户姓名"
                    clearable
                    style="flex: 1"
                    @clear="handleOrderSearch"
                    @keyup.enter="handleOrderSearch"
                >
                    <template #append>
                        <el-button @click="handleOrderSearch">查询</el-button>
                    </template>
                </el-input>
            </div>
            <div class="panel-card-body">
                <div v-if="orderLoading" class="loading-state">
                    <div style="font-size: 48px; margin-bottom: 16px">🔍</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        查询中...
                    </div>
                </div>
                <div v-else-if="orders.length === 0" class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px">📭</div>
                    <div style="font-size: 16px; color: var(--ink-muted)">
                        暂无搜索结果
                    </div>
                </div>
                <table v-else class="order-table">
                    <thead>
                        <tr>
                            <th>订单号</th>
                            <th>客户</th>
                            <th>金额</th>
                            <th>状态</th>
                            <th>下单日期</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in orders" :key="item.id">
                            <td class="order-id">{{ item.id }}</td>
                            <td>{{ item.custName }}</td>
                            <td>¥{{ item.amount }}</td>
                            <td>
                                <span
                                    class="status-tag"
                                    :class="getStatusClass(item.status)"
                                >
                                    {{ item.status }}
                                </span>
                            </td>
                            <td>{{ item.date }}</td>
                            <td>
                                <button
                                    class="btn-send"
                                    @click="sendOrder(item)"
                                >
                                    发送
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
import { ref } from "vue";
import { ApiCustomer } from "@/network/customer";
import { ElMessage } from "element-plus";

const searchType = ref<"product" | "order">("product");

// 商品搜索
const productKeyword = ref("");
const productLoading = ref(false);
const products = ref<
    Array<{
        id: string;
        name: string;
        icon: string;
        price: number;
        desc: string;
    }>
>([]);

async function handleProductSearch() {
    productLoading.value = true;
    try {
        const data = await ApiCustomer.searchProducts(productKeyword.value);
        products.value = data;
    } catch (error) {
        console.error("搜索商品失败:", error);
        ElMessage.error("搜索商品失败");
    } finally {
        productLoading.value = false;
    }
}

function sendProduct(product: any) {
    // TODO: 实现发送商品到当前会话
    ElMessage.success(`已发送商品: ${product.name}`);
    console.log("发送商品:", product);
}

// 订单查询
const orderKeyword = ref("");
const orderLoading = ref(false);
const orders = ref<
    Array<{
        id: string;
        custName: string;
        amount: number;
        status: string;
        date: string;
    }>
>([]);

async function handleOrderSearch() {
    orderLoading.value = true;
    try {
        const data = await ApiCustomer.searchOrders(orderKeyword.value);
        orders.value = data;
    } catch (error) {
        console.error("查询订单失败:", error);
        ElMessage.error("查询订单失败");
    } finally {
        orderLoading.value = false;
    }
}

function sendOrder(order: any) {
    // TODO: 实现发送订单到当前会话
    ElMessage.success(`已发送订单: ${order.id}`);
    console.log("发送订单:", order);
}

function getStatusClass(status: string): string {
    const map: Record<string, string> = {
        待付款: "status-pending",
        已发货: "status-shipped",
        运输中: "status-transit",
        已签收: "status-delivered",
    };
    return map[status] || "";
}
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

.search-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--line);
}

.tab-btn {
    flex: 1;
    padding: 14px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--ink-light);

    &:hover {
        background: var(--cream);
        color: var(--jade);
    }

    &.active {
        color: var(--jade);
        font-weight: 600;
        border-bottom-color: var(--jade);
        background: var(--jade-soft);
    }
}

.search-bar {
    padding: 14px 18px;
    display: flex;
    gap: 12px;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 40px;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
}

.product-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--paper-warm);
    transition: all 0.2s;

    &:hover {
        border-color: var(--jade);
        box-shadow: var(--shadow);
    }
}

.product-icon {
    width: 56px;
    height: 56px;
    background: var(--cream);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
}

.product-info {
    flex: 1;
    min-width: 0;
}

.product-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
}

.product-desc {
    font-size: 12px;
    color: var(--ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-price {
    font-size: 16px;
    color: var(--cinnabar);
    font-family: "STKaiti", serif;
    font-weight: 600;
    margin-top: 6px;
}

.btn-send {
    align-self: center;
    padding: 6px 14px;
    background: var(--jade);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &:hover {
        background: #4a9e7a;
    }
}

.order-table {
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

.order-id {
    font-family: monospace;
    font-size: 12px;
    color: var(--ink-muted);
}

.status-tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 3px;
    font-family: "STKaiti", serif;

    &.status-pending {
        background: #fff3e0;
        color: #ef6c00;
    }

    &.status-shipped {
        background: #e3f2fd;
        color: #1565c0;
    }

    &.status-transit {
        background: var(--gold-soft);
        color: var(--gold);
    }

    &.status-delivered {
        background: var(--jade-soft);
        color: var(--jade);
    }
}
</style>
