<template>
    <div class="tools-panel">
        <div class="section-title font-serif">商品 / 订单速查</div>

        <!-- 搜索标签切换 -->
        <div class="panel-card tab-card">
            <button
                class="tab-btn"
                :class="{ active: searchType === 'product' }"
                @click="searchType = 'product'"
            >
                商品搜索
            </button>
            <button
                class="tab-btn"
                :class="{ active: searchType === 'order' }"
                @click="searchType = 'order'"
            >
                订单查询
            </button>
        </div>

        <!-- 商品搜索 -->
        <div v-if="searchType === 'product'" class="panel-card">
            <div class="search-bar">
                <el-input
                    v-model="productKeyword"
                    placeholder="输入商品名称"
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
                    <div class="state-text">搜索中...</div>
                </div>
                <div v-else-if="products.length === 0" class="empty-state">
                    <div class="state-text">暂无搜索结果</div>
                </div>
                <div v-else class="product-grid">
                    <div
                        v-for="item in paginatedProducts"
                        :key="item.id"
                        class="product-card"
                    >
                        <div class="product-info">
                            <div class="product-name">{{ item.name }}</div>
                            <div class="product-desc">{{ item.desc }}</div>
                            <div class="product-price">¥{{ item.price }}</div>
                        </div>
                        <button
                            class="detail-btn"
                            @click="openShopProduct(item.id)"
                        >
                            详情
                        </button>
                    </div>
                </div>
                <div v-if="products.length > 0" class="pagination">
                    <el-pagination
                        v-model:current-page="productPage"
                        v-model:page-size="productPageSize"
                        :total="products.length"
                        :page-sizes="[10, 20]"
                        layout="total, sizes, prev, pager, next"
                        @size-change="productPage = 1"
                        @current-change="() => {}"
                    />
                </div>
            </div>
        </div>

        <!-- 订单查询 -->
        <div v-if="searchType === 'order'" class="panel-card">
            <div class="search-bar">
                <el-input
                    v-model="orderKeyword"
                    placeholder="输入订单编号或商品名称"
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
                    <div class="state-text">查询中...</div>
                </div>
                <div v-else-if="orders.length === 0" class="empty-state">
                    <div class="state-text">暂无搜索结果</div>
                </div>
                <table v-else class="order-table">
                    <thead>
                        <tr>
                            <th>订单号</th>
                            <th>商品名称</th>
                            <th>客户</th>
                            <th>金额</th>
                            <th>状态</th>
                            <th>下单日期</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in paginatedOrders"
                            :key="item.id"
                            class="order-row"
                        >
                            <td class="order-id">{{ item.id }}</td>
                            <td>{{ item.productName }}</td>
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
                                    class="detail-btn"
                                    @click="openShopOrder(item.id)"
                                >
                                    详情
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="orders.length > 0" class="pagination">
                    <el-pagination
                        v-model:current-page="orderPage"
                        v-model:page-size="orderPageSize"
                        :total="orders.length"
                        :page-sizes="[10, 20]"
                        layout="total, sizes, prev, pager, next"
                        @size-change="orderPage = 1"
                        @current-change="() => {}"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ApiCustomer } from "@/network/customer";
import { ElMessage } from "element-plus";

const searchType = ref<"product" | "order">("product");

// ── 商品搜索 ──
const productKeyword = ref("");
const productLoading = ref(false);
const productPage = ref(1);
const productPageSize = ref(10);
const products = ref<
    Array<{
        id: string;
        name: string;
        icon: string;
        price: number;
        desc: string;
    }>
>([]);

const paginatedProducts = computed(() => {
    const start = (productPage.value - 1) * productPageSize.value;
    return products.value.slice(start, start + productPageSize.value);
});

async function handleProductSearch() {
    productLoading.value = true;
    productPage.value = 1;
    try {
        products.value = await ApiCustomer.searchProducts(productKeyword.value);
    } catch (error) {
        console.error("搜索商品失败:", error);
        ElMessage.error("搜索商品失败");
    } finally {
        productLoading.value = false;
    }
}

// ── 订单查询 ──
const orderKeyword = ref("");
const orderLoading = ref(false);
const orderPage = ref(1);
const orderPageSize = ref(10);
const orders = ref<
    Array<{
        id: string;
        productName: string;
        custName: string;
        amount: number;
        status: string;
        date: string;
    }>
>([]);

const paginatedOrders = computed(() => {
    const start = (orderPage.value - 1) * orderPageSize.value;
    return orders.value.slice(start, start + orderPageSize.value);
});

async function handleOrderSearch() {
    orderLoading.value = true;
    orderPage.value = 1;
    try {
        orders.value = (await ApiCustomer.searchOrders(
            orderKeyword.value,
        )) as any;
    } catch (error) {
        console.error("查询订单失败:", error);
        ElMessage.error("查询订单失败");
    } finally {
        orderLoading.value = false;
    }
}

function openShopProduct(productId: string) {
    window.open(`/shop?open=${productId}`, "_blank");
}

function openShopOrder(orderId: string) {
    window.open(`/shop?order=${orderId}`, "_blank");
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

watch(productKeyword, (val) => {
    if (!val) handleProductSearch();
});
watch(orderKeyword, (val) => {
    if (!val) handleOrderSearch();
});

onMounted(() => {
    handleProductSearch();
    handleOrderSearch();
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

.tab-card {
    display: flex;
    margin-bottom: 14px;
    overflow: hidden;
}

.tab-btn {
    flex: 1;
    padding: 14px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 17px;
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
    border-bottom: 1px solid var(--line);
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

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
}

.product-card {
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--paper-warm);
    transition: border-color 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: flex-end;
    gap: 12px;

    &:hover {
        border-color: var(--jade);
        box-shadow: var(--shadow);
    }
}

.product-info {
    flex: 1;
    min-width: 0;
}

.product-name {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 4px;
}

.product-desc {
    font-size: 15px;
    color: var(--ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-price {
    font-size: 18px;
    color: var(--cinnabar);
    font-family: "STKaiti", serif;
    font-weight: 600;
    margin-top: 6px;
}

.order-table {
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
        padding: 13px 16px;
        border-top: 1px solid var(--line);
        vertical-align: middle;
    }

    tr:hover td {
        background: rgba(250, 246, 238, 0.5);
    }
}

.order-row {
    &:hover td {
        background: var(--jade-soft);
    }
}

.order-id {
    font-family: monospace;
    font-size: 15px;
    color: var(--ink-muted);
}

.detail-btn {
    padding: 4px 12px;
    border: 1px solid var(--jade);
    border-radius: 6px;
    background: transparent;
    color: var(--jade);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s;

    &:hover {
        background: var(--jade);
        color: #fff;
    }
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.status-tag {
    display: inline-block;
    padding: 3px 9px;
    font-size: 15px;
    border-radius: 3px;

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
