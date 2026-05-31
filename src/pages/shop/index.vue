<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="hub">
            <!-- Hero -->
            <section class="hero">
                <div class="hero-label font-serif">YANG SHENG · 養生優選</div>
                <h1 class="font-serif">养生优选</h1>
                <p class="hero-sub">
                    一站式中医养生商城，精选食疗药膳、调理茶饮、健康器具。顺时令、辨体质，让养生融入日常。
                </p>
                <div class="hero-meta">
                    <span class="meta-item"
                        >🌿 在售商品
                        <strong>{{ products.length }}</strong></span
                    >
                    <span class="meta-item"
                        >📦 历史订单 <strong>{{ orders.length }}</strong></span
                    >
                    <span class="meta-item"
                        >🛒 购物车 <strong>{{ cartCount }}</strong></span
                    >
                </div>
            </section>

            <!-- Tabs -->
            <div class="tabs">
                <button
                    v-for="tab in tabDefs"
                    :key="tab.key"
                    class="tab"
                    :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key"
                >
                    <span class="tab-icon">{{ tab.icon }}</span>
                    <span>{{ tab.label }}</span>
                </button>
            </div>

            <!-- Panel: Shop -->
            <div v-show="activeTab === 'shop'" class="panel">
                <div class="cat-bar">
                    <span class="cat-label">分类：</span>
                    <button
                        v-for="c in catDefs"
                        :key="c.key"
                        class="cat-chip"
                        :class="{ active: currentCat === c.key }"
                        @click="currentCat = c.key"
                    >
                        {{ c.label }}
                    </button>
                    <div class="cat-search">
                        <span>🔍</span>
                        <input
                            v-model="searchKw"
                            placeholder="搜索商品名 / 功效"
                        />
                    </div>
                </div>
                <div v-if="filteredProducts.length === 0" class="empty-tip">
                    <span class="ic">🔍</span
                    >{{ loading ? "加载中..." : "未找到符合条件的商品" }}
                </div>
                <div v-else class="product-grid">
                    <div
                        v-for="p in filteredProducts"
                        :key="p.id"
                        class="product-card"
                        @click="openProduct(p)"
                    >
                        <div class="product-image">
                            <span class="product-icon">{{ p.icon }}</span>
                            <span v-if="p.sold > 2000" class="product-tag-hot"
                                >熱賣</span
                            >
                        </div>
                        <div class="product-body">
                            <div class="product-name">{{ p.name }}</div>
                            <div class="product-effect">{{ p.effect }}</div>
                            <div class="product-meta">
                                <span class="product-price"
                                    ><span class="price-cny">¥</span
                                    >{{ p.price }}</span
                                >
                                <span class="product-sales"
                                    >已售 {{ p.sold }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel: Cart -->
            <div v-show="activeTab === 'cart'" class="panel">
                <div class="yy-card">
                    <div class="yy-card-title">
                        <div class="dot"></div>
                        我的购物车
                    </div>
                    <div class="ai-sync-note">
                        🤖 本购物车已与「AI 管家」板块联通，由 AI
                        推荐加入的商品会在名称后标注「AI 推荐」徽章
                    </div>
                    <div v-if="cart.length === 0" class="empty-tip">
                        <span class="ic">🛒</span>购物车空空如也<br />
                        <button
                            class="yy-btn"
                            style="margin-top: 16px"
                            @click="activeTab = 'shop'"
                        >
                            去逛逛
                        </button>
                    </div>
                    <div v-else class="cart-list">
                        <div
                            v-for="item in cart"
                            :key="item.id"
                            class="cart-item"
                        >
                            <div class="cart-thumb">
                                {{ getProduct(item.id).icon }}
                            </div>
                            <div class="cart-item-info">
                                <div class="cart-item-name">
                                    {{ getProduct(item.id).name }}
                                    <span
                                        v-if="item.fromAi"
                                        class="cart-from-ai"
                                        >AI 推荐</span
                                    >
                                </div>
                                <div class="cart-item-meta">
                                    单价 ¥{{ getProduct(item.id).price }}
                                </div>
                            </div>
                            <div class="qty-ctrl">
                                <button
                                    class="qty-btn"
                                    @click="changeQty(item.id, -1)"
                                >
                                    −
                                </button>
                                <span class="qty-num">{{ item.qty }}</span>
                                <button
                                    class="qty-btn"
                                    @click="changeQty(item.id, 1)"
                                >
                                    +
                                </button>
                            </div>
                            <div class="cart-item-price">
                                ¥{{
                                    (
                                        getProduct(item.id).price * item.qty
                                    ).toFixed(2)
                                }}
                            </div>
                            <button
                                class="cart-rm"
                                @click="removeFromCart(item.id)"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div v-if="cart.length > 0" class="cart-summary">
                        <div>
                            <span class="cart-total-label">合计：</span>
                            <span class="cart-total-num"
                                >¥{{ cartTotal.toFixed(2) }}</span
                            >
                            <span class="cart-total-hint">不含运费</span>
                        </div>
                        <div style="display: flex; gap: 10px">
                            <button
                                class="btn btn-outline"
                                @click="activeTab = 'shop'"
                            >
                                继续购物
                            </button>
                            <button
                                class="btn btn-cinnabar btn-lg"
                                @click="openPay"
                            >
                                去结算
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel: Order -->
            <div v-show="activeTab === 'order'" class="panel">
                <div class="order-status-tabs">
                    <button
                        v-for="os in orderStatusDefs"
                        :key="os.key"
                        class="order-status-tab"
                        :class="{ active: orderFilter === os.key }"
                        @click="orderFilter = os.key"
                    >
                        {{ os.label }}
                        <span class="num">({{ orderCount(os.key) }})</span>
                    </button>
                </div>
                <div v-if="filteredOrders.length === 0" class="empty-tip">
                    <span class="ic">📦</span>该分类下暂无订单
                </div>
                <div v-else>
                    <div
                        v-for="(o, idx) in filteredOrders"
                        :key="o.no"
                        class="order-card"
                    >
                        <div class="order-head">
                            <div>
                                <span class="order-no"
                                    >订单编号：<strong>{{ o.no }}</strong></span
                                >
                                <span class="order-time">{{ o.time }}</span>
                            </div>
                            <span
                                class="order-status"
                                :class="orderStatusClass(o.status)"
                                >{{ orderStatusText(o.status) }}</span
                            >
                        </div>
                        <div class="order-body">
                            <div class="order-thumb-row">
                                <div
                                    v-for="it in o.items"
                                    :key="it.id"
                                    class="cart-thumb sm"
                                    :title="
                                        getProduct(it.id).name + ' ×' + it.qty
                                    "
                                >
                                    {{ getProduct(it.id).icon }}
                                </div>
                            </div>
                            <div class="order-info-block">
                                {{
                                    o.items
                                        .map(
                                            (it) =>
                                                getProduct(it.id).name +
                                                " ×" +
                                                it.qty,
                                        )
                                        .join("，")
                                }}
                            </div>
                        </div>
                        <div class="order-foot">
                            <span class="order-amount"
                                >共
                                <strong>{{
                                    o.items.reduce((s, it) => s + it.qty, 0)
                                }}</strong>
                                件商品&emsp;合计
                                <strong
                                    >¥{{ o.amount.toFixed(2) }}</strong
                                ></span
                            >
                            <div class="order-actions">
                                <template v-if="o.status === 'unpaid'">
                                    <button
                                        class="btn btn-outline"
                                        @click="cancelOrder(o.no)"
                                    >
                                        取消订单
                                    </button>
                                    <button
                                        class="btn btn-cinnabar"
                                        @click="openPay"
                                    >
                                        立即支付
                                    </button>
                                </template>
                                <template v-else-if="o.status === 'topay'">
                                    <button
                                        class="btn btn-outline"
                                        @click="refundOrder(o.no)"
                                    >
                                        申请退款
                                    </button>
                                    <button
                                        class="btn btn-outline"
                                        @click="remindShip(o.no)"
                                    >
                                        提醒发货
                                    </button>
                                    <button
                                        class="btn btn-outline"
                                        @click="reBuy(o.no)"
                                    >
                                        再次购买
                                    </button>
                                </template>
                                <template v-else-if="o.status === 'shipped'">
                                    <button
                                        class="btn btn-outline"
                                        @click="refundOrder(o.no)"
                                    >
                                        申请退款
                                    </button>
                                    <button
                                        class="btn btn-outline"
                                        @click="openLogistics(o.no)"
                                    >
                                        查看物流
                                    </button>
                                    <button
                                        class="btn btn-jade"
                                        @click="confirmReceipt(o.no)"
                                    >
                                        确认收货
                                    </button>
                                    <div class="more-wrap" @click.stop>
                                        <button
                                            class="btn btn-outline"
                                            @click="toggleMore(idx)"
                                        >
                                            更多 ▾
                                        </button>
                                        <div
                                            class="more-menu"
                                            :class="{
                                                show: openMoreIdx === idx,
                                            }"
                                        >
                                            <div
                                                class="more-menu-item"
                                                @click="
                                                    reBuy(o.no);
                                                    openMoreIdx = -1;
                                                "
                                            >
                                                再次拼单
                                            </div>
                                            <div
                                                class="more-menu-item"
                                                @click="
                                                    extendReceipt(o.no);
                                                    openMoreIdx = -1;
                                                "
                                            >
                                                延长收货
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <template v-else>
                                    <button
                                        class="btn btn-outline"
                                        @click="reBuy(o.no)"
                                    >
                                        再次购买
                                    </button>
                                    <button
                                        class="btn btn-outline"
                                        @click="reviewOrder(o.no)"
                                    >
                                        评价
                                    </button>
                                    <button
                                        class="btn btn-outline"
                                        @click="reBuy(o.no)"
                                    >
                                        再次拼单
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel: Service -->
            <div v-show="activeTab === 'service'" class="panel">
                <div class="service-layout">
                    <div class="agent-list">
                        <div class="agent-list-title">
                            颐养阁官方店铺 · 客服
                        </div>
                        <div
                            v-for="a in agents"
                            :key="a.id"
                            class="agent-item"
                            :class="{ active: currentAgent === a.id }"
                            @click="switchAgent(a.id)"
                        >
                            <div class="agent-avatar">
                                {{ a.avatar }}
                                <div
                                    class="agent-status-dot"
                                    :class="a.status"
                                ></div>
                            </div>
                            <div class="agent-info">
                                <div class="agent-name">{{ a.name }}</div>
                                <div class="agent-tag">
                                    {{ a.tag }} ·
                                    {{
                                        a.status === "online"
                                            ? "在线"
                                            : a.status === "busy"
                                              ? "忙碌"
                                              : "离线"
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-panel">
                        <div class="chat-header">
                            <div class="agent-avatar sm">
                                {{ currentAgentObj.avatar }}
                            </div>
                            <div>
                                <h4>客服 · {{ currentAgentObj.name }}</h4>
                                <div class="desc">
                                    {{ currentAgentObj.desc }}
                                </div>
                            </div>
                            <div class="chat-header-tip">
                                为保护用户体验，同一客服不会同时回复多用户
                            </div>
                        </div>
                        <div class="chat-body" ref="chatBodyRef">
                            <div
                                v-for="(m, mi) in currentChatHistory"
                                :key="mi"
                                class="chat-msg"
                                :class="m.from"
                            >
                                <div
                                    v-if="m.from === 'agent'"
                                    class="agent-avatar xs"
                                >
                                    {{ currentAgentObj.avatar }}
                                </div>
                                <div v-else class="user-avatar xs">我</div>
                                <div>
                                    <div class="chat-meta">
                                        {{
                                            m.from === "agent"
                                                ? currentAgentObj.name
                                                : "我"
                                        }}
                                        · {{ m.time }}
                                    </div>
                                    <div class="chat-bubble">{{ m.text }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="chat-input-row">
                            <input
                                v-model="chatInput"
                                placeholder="输入您想咨询的问题，按 Enter 发送..."
                                @keydown.enter="sendChat"
                            />
                            <button class="btn btn-jade" @click="sendChat">
                                发送
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Product Detail Modal -->
        <div
            class="modal-mask"
            :class="{ show: showPdModal }"
            @click.self="showPdModal = false"
        >
            <div class="modal" v-if="selectedProduct">
                <div class="modal-header">
                    <h3>商品详情</h3>
                    <button class="modal-close" @click="showPdModal = false">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div class="pd-grid">
                        <div class="pd-image">{{ selectedProduct.icon }}</div>
                        <div class="pd-info">
                            <h2>{{ selectedProduct.name }}</h2>
                            <div class="pd-tags">
                                <span
                                    v-for="t in selectedProduct.tags"
                                    :key="t"
                                    class="pd-tag"
                                    >{{ t }}</span
                                >
                            </div>
                            <div class="pd-price-box">
                                <span class="pd-price"
                                    ><span class="pd-price-cny">¥</span
                                    >{{ selectedProduct.price }}</span
                                >
                                <span class="pd-price-orig"
                                    >¥{{
                                        Math.round(selectedProduct.price * 1.3)
                                    }}</span
                                >
                                <span class="pd-badge-limit">限时</span>
                            </div>
                            <div class="pd-meta-row">
                                <span
                                    >库存
                                    <strong>{{
                                        selectedProduct.stock
                                    }}</strong></span
                                >
                                <span
                                    >已售
                                    <strong>{{
                                        selectedProduct.sold
                                    }}</strong></span
                                >
                                <span>配送 <strong>江浙沪次日达</strong></span>
                            </div>
                            <div class="pd-section">
                                <h4>功效</h4>
                                <p>{{ selectedProduct.effect }}</p>
                            </div>
                            <div class="pd-section">
                                <h4>商品描述</h4>
                                <p>{{ selectedProduct.desc }}</p>
                            </div>
                            <div class="pd-section">
                                <h4>购买数量</h4>
                                <div class="qty-ctrl" style="margin-top: 6px">
                                    <button
                                        class="qty-btn"
                                        @click="pdQty = Math.max(1, pdQty - 1)"
                                    >
                                        −
                                    </button>
                                    <span class="qty-num">{{ pdQty }}</span>
                                    <button class="qty-btn" @click="pdQty++">
                                        +
                                    </button>
                                </div>
                            </div>
                            <div class="pd-actions">
                                <button
                                    class="btn btn-outline"
                                    @click="addToCartFromDetail"
                                >
                                    🛒 加入购物车
                                </button>
                                <button
                                    class="btn btn-outline"
                                    @click="
                                        showPdModal = false;
                                        activeTab = 'cart';
                                    "
                                >
                                    去购物车
                                </button>
                                <button
                                    class="btn btn-cinnabar"
                                    @click="buyNow"
                                >
                                    立即购买
                                </button>
                                <button
                                    class="btn btn-outline"
                                    @click="
                                        showPdModal = false;
                                        activeTab = 'service';
                                    "
                                >
                                    💬 联系客服
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Modal -->
        <div
            class="modal-mask"
            :class="{ show: showPayModal }"
            @click.self="showPayModal = false"
        >
            <div class="modal" style="max-width: 520px">
                <div class="modal-header">
                    <h3>支付订单</h3>
                    <button class="modal-close" @click="showPayModal = false">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div class="pay-card">
                        <div
                            v-for="item in cart"
                            :key="item.id"
                            class="pay-row"
                        >
                            <span
                                >{{ getProduct(item.id).name }} ×
                                {{ item.qty }}</span
                            >
                            <span
                                >¥{{
                                    (
                                        getProduct(item.id).price * item.qty
                                    ).toFixed(2)
                                }}</span
                            >
                        </div>
                        <div class="pay-row">
                            <span>运费</span>
                            <span>¥0.00（满 88 免运）</span>
                        </div>
                        <div class="pay-row total">
                            <span>实付金额</span>
                            <span class="red">¥{{ cartTotal.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="pay-method">
                        <div class="ali-logo">支</div>
                        <div style="flex: 1">
                            <div style="font-weight: 600; color: var(--ink)">
                                支付宝支付
                            </div>
                            <div
                                style="
                                    font-size: 12px;
                                    color: var(--ink-muted);
                                    margin-top: 2px;
                                "
                            >
                                推荐使用 · 安全、便捷
                            </div>
                        </div>
                        <div style="color: var(--jade); font-size: 20px">✓</div>
                    </div>
                    <p
                        style="
                            text-align: center;
                            font-size: 13px;
                            color: var(--ink-muted);
                        "
                    >
                        请使用支付宝 APP 扫码完成支付
                    </p>
                    <div class="qr-mock"></div>
                    <p
                        style="
                            text-align: center;
                            font-size: 12px;
                            color: var(--ink-muted);
                        "
                    >
                        二维码 5 分钟内有效
                    </p>
                </div>
                <div class="modal-footer">
                    <button
                        class="btn btn-outline"
                        @click="showPayModal = false"
                    >
                        取消
                    </button>
                    <button class="btn btn-jade" @click="mockPaySuccess">
                        模拟支付成功
                    </button>
                </div>
            </div>
        </div>

        <!-- Logistics Modal -->
        <div
            class="modal-mask"
            :class="{ show: showLogisticsModal }"
            @click.self="showLogisticsModal = false"
        >
            <div
                class="modal"
                style="max-width: 620px"
                v-if="selectedOrderLogistics"
            >
                <div class="modal-header">
                    <h3>物流详情</h3>
                    <button
                        class="modal-close"
                        @click="showLogisticsModal = false"
                    >
                        ×
                    </button>
                </div>
                <div class="logistics-detail">
                    <div class="logistics-detail-header">
                        <div class="carrier">
                            <span style="font-size: 24px">🚛</span
                            ><span>顺丰速运</span>
                        </div>
                        <div class="track-no">
                            运单号：<span
                                >SF{{
                                    selectedOrderNo.replace("YYG", "")
                                }}</span
                            >
                        </div>
                    </div>
                    <div class="logistics-detail-map">
                        <div class="log-map-route"></div>
                        <div class="log-map-done"></div>
                        <div class="log-map-pin start">
                            📦
                            <div class="log-map-label">
                                {{ selectedOrderLogistics.from }}
                            </div>
                        </div>
                        <div class="log-map-pin current">
                            🚚
                            <div class="log-map-label red-label">运输中</div>
                        </div>
                        <div class="log-map-pin end">
                            🏠
                            <div class="log-map-label">
                                {{ selectedOrderLogistics.to }}
                            </div>
                        </div>
                    </div>
                    <div class="logistics-detail-steps">
                        <div
                            v-for="step in selectedOrderLogistics.steps"
                            :key="step.time"
                            class="logistics-detail-step"
                            :class="step.state"
                        >
                            {{ step.text }}
                            <span class="step-time">{{ step.time }}</span>
                        </div>
                    </div>
                    <div class="logistics-detail-foot">
                        <span>{{ selectedOrderLogistics.from }}</span>
                        <span style="color: var(--line)">━━━━━━</span>
                        <span>{{ selectedOrderLogistics.to }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirm Modal -->
        <div
            class="modal-mask"
            :class="{ show: showConfirmModal }"
            @click.self="showConfirmModal = false"
        >
            <div class="modal" style="max-width: 400px">
                <div class="modal-header">
                    <h3>{{ confirmTitle }}</h3>
                    <button
                        class="modal-close"
                        @click="showConfirmModal = false"
                    >
                        ×
                    </button>
                </div>
                <div class="modal-body" style="text-align: center">
                    <div style="font-size: 48px; margin-bottom: 12px">
                        {{ confirmIcon }}
                    </div>
                    <p
                        style="
                            font-size: 15px;
                            color: var(--ink);
                            line-height: 1.6;
                        "
                    >
                        {{ confirmMsg }}
                    </p>
                </div>
                <div
                    class="modal-footer"
                    style="justify-content: center; gap: 12px"
                >
                    <button
                        class="btn btn-outline"
                        @click="showConfirmModal = false"
                    >
                        取消
                    </button>
                    <button class="btn btn-cinnabar" @click="onConfirmOk">
                        确认
                    </button>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";

interface Product {
    id: string;
    name: string;
    cat: string;
    price: number;
    sold: number;
    stock: number;
    icon: string;
    tags: string[];
    effect: string;
    desc: string;
}
interface CartItem {
    id: string;
    qty: number;
    fromAi: boolean;
}
interface LogisticsStep {
    time: string;
    text: string;
    state: string;
}
interface Order {
    no: string;
    time: string;
    status: "unpaid" | "topay" | "shipped" | "done";
    items: { id: string; qty: number }[];
    amount: number;
    logistics?: { from: string; to: string; steps: LogisticsStep[] };
}
interface Agent {
    id: string;
    name: string;
    desc: string;
    tag: string;
    status: string;
    avatar: string;
}
interface ChatMsg {
    from: "agent" | "me";
    text: string;
    time: string;
}

// ── Static data ──────────────────────────────────────────────────────────────
const products: Product[] = [
    {
        id: "p1",
        name: "枸杞红枣养生茶",
        cat: "tea",
        price: 38,
        sold: 1287,
        stock: 520,
        icon: "🍵",
        tags: ["滋阴", "补气"],
        effect: "养肝明目、补气养血，气郁质兼阴虚体质宜",
        desc: "精选宁夏中宁枸杞与新疆若羌灰枣，每日 1 包，沸水冲泡 3 分钟即饮。",
    },
    {
        id: "p2",
        name: "四物汤药膳包",
        cat: "food",
        price: 68,
        sold: 856,
        stock: 230,
        icon: "🍲",
        tags: ["补血", "女性"],
        effect: "补血调经，适合女性月经后调理",
        desc: "当归、川芎、白芍、熟地，经典四物配方，文火慢炖 40 分钟。",
    },
    {
        id: "p3",
        name: "五黑五谷粉",
        cat: "food",
        price: 58,
        sold: 2103,
        stock: 680,
        icon: "🥣",
        tags: ["脾胃", "营养"],
        effect: "健脾养胃、补肾乌发",
        desc: "黑米、黑豆、黑芝麻、黑枣、黑桑椹，五种黑色食材精磨。",
    },
    {
        id: "p4",
        name: "艾草足浴包（30包）",
        cat: "health",
        price: 45,
        sold: 3210,
        stock: 980,
        icon: "🌿",
        tags: ["驱寒", "安神"],
        effect: "温经散寒、舒缓疲劳，睡前泡脚 15 分钟",
        desc: "纯艾草、生姜、红花，棉布袋包装，开水冲泡 5 分钟后兑入温水。",
    },
    {
        id: "p5",
        name: "桂圆红枣枸杞茶",
        cat: "tea",
        price: 42,
        sold: 912,
        stock: 340,
        icon: "🍯",
        tags: ["补血", "安神"],
        effect: "补血安神，气血不足者宜",
        desc: "桂圆肉、和田大枣、宁夏枸杞，三味配方。",
    },
    {
        id: "p6",
        name: "传统艾灸盒",
        cat: "health",
        price: 128,
        sold: 567,
        stock: 120,
        icon: "🔥",
        tags: ["温灸", "穴位"],
        effect: "温经通络、扶阳固本",
        desc: "桃木艾灸盒，配 10 根纯艾条，附穴位图。",
    },
    {
        id: "p7",
        name: "红糖姜茶（暖宫）",
        cat: "female",
        price: 35,
        sold: 4521,
        stock: 1200,
        icon: "🫖",
        tags: ["暖宫", "经期"],
        effect: "暖宫散寒，缓解痛经",
        desc: "古法熬制黑糖块 + 老姜粉，经期前 3 天饮用最佳。",
    },
    {
        id: "p8",
        name: "益母草调理颗粒",
        cat: "female",
        price: 55,
        sold: 1820,
        stock: 430,
        icon: "🌸",
        tags: ["调经", "女性"],
        effect: "活血调经，适合月经不调",
        desc: "纯天然益母草提取，独立小包装。",
    },
    {
        id: "p9",
        name: "宁夏枸杞 250g",
        cat: "herb",
        price: 48,
        sold: 6789,
        stock: 2100,
        icon: "🟥",
        tags: ["滋补", "明目"],
        effect: "滋肝明目、补肾益精",
        desc: "中宁特级头茬枸杞，无熏硫无添加。",
    },
    {
        id: "p10",
        name: "当归片 100g",
        cat: "herb",
        price: 38,
        sold: 2340,
        stock: 870,
        icon: "🌾",
        tags: ["补血", "调经"],
        effect: "补血活血、调经止痛",
        desc: "甘肃岷县当归，传统刨片工艺。",
    },
    {
        id: "p11",
        name: "紫砂养生壶",
        cat: "tool",
        price: 198,
        sold: 432,
        stock: 65,
        icon: "🫖",
        tags: ["茶具"],
        effect: "宜兴紫砂，泡茶聚香",
        desc: "宜兴原矿紫砂，全手工拉胚，容量 280ml。",
    },
    {
        id: "p12",
        name: "砭石刮痧板",
        cat: "tool",
        price: 88,
        sold: 1567,
        stock: 340,
        icon: "⚪",
        tags: ["理疗", "刮痧"],
        effect: "活血通络，肩颈保健",
        desc: "泗滨砭石，富含矿物元素。",
    },
];

const agents: Agent[] = [
    {
        id: "cs1",
        name: "小翠",
        desc: "售前 · 商品咨询 / 配送 / 退换货",
        tag: "售前客服",
        status: "online",
        avatar: "客一",
    },
    {
        id: "cs2",
        name: "阿岚",
        desc: "售后 · 退款 / 物流异常 / 投诉处理",
        tag: "售后客服",
        status: "online",
        avatar: "客二",
    },
];

const presetReplies: Record<string, string[]> = {
    cs1: [
        "您好，这边是颐养阁售前客服小翠，很高兴为您服务～",
        "请问您想了解哪款商品呢？我可以帮您查询库存、规格、配送时效。",
        "满 88 元包邮，江浙沪次日达。",
    ],
    cs2: [
        "您好，售后客服阿岚为您服务～",
        "商品有任何质量问题 7 天无理由退换，物流异常我可以帮您催件。",
    ],
};

const tabDefs = [
    { key: "shop", icon: "🏪", label: "商品浏览" },
    { key: "cart", icon: "🛒", label: "购物车" },
    { key: "order", icon: "📦", label: "我的订单" },
    { key: "service", icon: "💬", label: "客服咨询" },
];

const catDefs = [
    { key: "all", label: "全部" },
    { key: "food", label: "食疗食材类" },
    { key: "tea", label: "养生茶饮" },
    { key: "health", label: "健康调理类" },
    { key: "female", label: "女性养生专区" },
    { key: "herb", label: "中药材" },
    { key: "tool", label: "养生器具" },
];

const orderStatusDefs = [
    { key: "all", label: "全部" },
    { key: "unpaid", label: "未支付" },
    { key: "topay", label: "待发货" },
    { key: "shipped", label: "已发货" },
    { key: "done", label: "已完成" },
];

// ── Reactive state ────────────────────────────────────────────────────────────
const activeTab = ref("shop");
const currentCat = ref("all");
const searchKw = ref("");

const cart = ref<CartItem[]>([
    { id: "p4", qty: 2, fromAi: false },
    { id: "p1", qty: 1, fromAi: true },
    { id: "p9", qty: 1, fromAi: false },
]);

const orders = ref<Order[]>([
    {
        no: "YYG20260526001",
        time: "2026-05-26 10:32",
        status: "unpaid",
        items: [
            { id: "p2", qty: 1 },
            { id: "p9", qty: 1 },
        ],
        amount: 116,
    },
    {
        no: "YYG20260525012",
        time: "2026-05-25 18:14",
        status: "topay",
        items: [
            { id: "p7", qty: 2 },
            { id: "p10", qty: 1 },
        ],
        amount: 108,
    },
    {
        no: "YYG20260523008",
        time: "2026-05-23 09:45",
        status: "shipped",
        items: [
            { id: "p4", qty: 1 },
            { id: "p6", qty: 1 },
        ],
        amount: 173,
        logistics: {
            from: "杭州 · 颐养阁仓库",
            to: "上海 · 黄浦区",
            steps: [
                {
                    time: "2026-05-26 08:12",
                    text: "【上海中转】快件已到达【上海转运中心】",
                    state: "active",
                },
                {
                    time: "2026-05-25 22:38",
                    text: "【杭州中转】快件离开【杭州中转中心】发往【上海】",
                    state: "done",
                },
                {
                    time: "2026-05-25 14:20",
                    text: "【杭州集散】快件已到达【杭州中转中心】",
                    state: "done",
                },
                {
                    time: "2026-05-23 16:05",
                    text: "【已揽件】顺丰速运 已揽收",
                    state: "done",
                },
                {
                    time: "2026-05-23 11:30",
                    text: "【商家发货】颐养阁官方店铺已发货",
                    state: "done",
                },
            ],
        },
    },
    {
        no: "YYG20260518003",
        time: "2026-05-18 20:01",
        status: "done",
        items: [
            { id: "p1", qty: 2 },
            { id: "p3", qty: 1 },
        ],
        amount: 134,
    },
]);

const orderFilter = ref("all");
const currentAgent = ref("cs1");
const chatHistory = ref<Record<string, ChatMsg[]>>({
    cs1: [
        {
            from: "agent",
            text: "您好，这边是颐养阁售前客服小翠，很高兴为您服务～",
            time: "10:01",
        },
        {
            from: "me",
            text: "你好，请问枸杞红枣养生茶适合气郁体质吗？",
            time: "10:02",
        },
        {
            from: "agent",
            text: "非常适合的，枸杞滋阴、红枣补气，正好对应气郁兼阴虚体质，建议每日 1 包，连饮 4 周。",
            time: "10:02",
        },
    ],
    cs2: [
        {
            from: "agent",
            text: "您好，售后客服阿岚为您服务～若有订单问题请告知订单编号。",
            time: "09:30",
        },
    ],
});
const chatInput = ref("");
const chatBodyRef = ref<HTMLElement | null>(null);

// Modal states
const showPdModal = ref(false);
const selectedProduct = ref<Product | null>(null);
const pdQty = ref(1);
const showPayModal = ref(false);
const showLogisticsModal = ref(false);
const selectedOrderNo = ref("");
const showConfirmModal = ref(false);
const confirmTitle = ref("");
const confirmMsg = ref("");
const confirmIcon = ref("");
const confirmCallback = ref<(() => void) | null>(null);

// Toast
const toastMsg = ref("");
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

// Order more dropdown
const openMoreIdx = ref(-1);

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredProducts = computed(() =>
    products
        .filter((p) => currentCat.value === "all" || p.cat === currentCat.value)
        .filter(
            (p) =>
                !searchKw.value ||
                p.name.includes(searchKw.value) ||
                p.effect.includes(searchKw.value),
        ),
);

const cartCount = computed(() => cart.value.reduce((s, c) => s + c.qty, 0));
const cartTotal = computed(() =>
    cart.value.reduce((s, c) => s + getProduct(c.id).price * c.qty, 0),
);

const filteredOrders = computed(() =>
    orders.value.filter(
        (o) => orderFilter.value === "all" || o.status === orderFilter.value,
    ),
);

const currentAgentObj = computed(
    () => agents.find((a) => a.id === currentAgent.value)!,
);
const currentChatHistory = computed(
    () => chatHistory.value[currentAgent.value] || [],
);

const selectedOrderLogistics = computed(() => {
    if (!selectedOrderNo.value) return null;
    return (
        orders.value.find((o) => o.no === selectedOrderNo.value)?.logistics ??
        null
    );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function getProduct(id: string): Product {
    return products.find((p) => p.id === id)!;
}

function orderCount(key: string): number {
    if (key === "all") return orders.value.length;
    return orders.value.filter((o) => o.status === key).length;
}

function orderStatusText(status: string): string {
    const map: Record<string, string> = {
        unpaid: "待支付",
        topay: "待发货",
        shipped: "运输中",
        done: "已完成",
    };
    return map[status] || status;
}

function orderStatusClass(status: string): string {
    const map: Record<string, string> = {
        unpaid: "status-pay",
        topay: "status-ship",
        shipped: "status-shipped",
        done: "status-done",
    };
    return map[status] || "";
}

// ── Cart actions ──────────────────────────────────────────────────────────────
function addToCart(id: string, qty: number, fromAi: boolean) {
    const existing = cart.value.find((c) => c.id === id);
    if (existing) existing.qty += qty;
    else cart.value.push({ id, qty, fromAi });
    showToast(fromAi ? "已加入购物车（AI 推荐）" : "已加入购物车");
}

function changeQty(id: string, delta: number) {
    const item = cart.value.find((c) => c.id === id);
    if (item) item.qty = Math.max(1, item.qty + delta);
}

function removeFromCart(id: string) {
    cart.value = cart.value.filter((c) => c.id !== id);
}

// ── Product detail ────────────────────────────────────────────────────────────
function openProduct(p: Product) {
    selectedProduct.value = p;
    pdQty.value = 1;
    showPdModal.value = true;
}

function addToCartFromDetail() {
    if (!selectedProduct.value) return;
    addToCart(selectedProduct.value.id, pdQty.value, false);
    showPdModal.value = false;
}

function buyNow() {
    if (!selectedProduct.value) return;
    addToCart(selectedProduct.value.id, pdQty.value, false);
    showPdModal.value = false;
    openPay();
}

// ── Payment ───────────────────────────────────────────────────────────────────
function openPay() {
    if (cart.value.length === 0) {
        showToast("购物车为空");
        return;
    }
    showPayModal.value = true;
}

function mockPaySuccess() {
    const total = cartTotal.value;
    const no =
        "YYG" +
        new Date().toISOString().slice(0, 10).replace(/-/g, "") +
        String(Math.floor(Math.random() * 900) + 100);
    orders.value.unshift({
        no,
        time: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "topay",
        items: cart.value.map((c) => ({ id: c.id, qty: c.qty })),
        amount: total,
    });
    cart.value = [];
    showPayModal.value = false;
    showToast("支付成功，订单已生成");
    setTimeout(() => {
        activeTab.value = "order";
    }, 600);
}

// ── Order actions ─────────────────────────────────────────────────────────────
function cancelOrder(no: string) {
    showConfirm("取消订单", "确认取消该订单？取消后不可恢复。", "🗑️", () => {
        orders.value = orders.value.filter((o) => o.no !== no);
        showToast("订单已取消");
    });
}

function refundOrder(_no: string) {
    showToast("已提交退款申请，客服将在 24h 内处理");
}
function remindShip(_no: string) {
    showToast("已提醒卖家发货");
}
function extendReceipt(_no: string) {
    showToast("收货时间已延长 7 天");
}
function reviewOrder(_no: string) {
    showToast("评价功能开发中，敬请期待");
}

function confirmReceipt(no: string) {
    showConfirm(
        "确认收货",
        "确认已收到商品？确认后款项将打给卖家，请谨慎操作。",
        "📦",
        () => {
            const o = orders.value.find((x) => x.no === no);
            if (o) o.status = "done";
            showToast("已确认收货，欢迎再次光临～");
        },
    );
}

function reBuy(no: string) {
    const o = orders.value.find((x) => x.no === no);
    if (!o) return;
    o.items.forEach((it) => {
        const existing = cart.value.find((c) => c.id === it.id && !c.fromAi);
        if (existing) existing.qty += it.qty;
        else cart.value.push({ id: it.id, qty: it.qty, fromAi: false });
    });
    showToast("商品已加入购物车");
}

function openLogistics(no: string) {
    selectedOrderNo.value = no;
    showLogisticsModal.value = true;
}

function toggleMore(idx: number) {
    openMoreIdx.value = openMoreIdx.value === idx ? -1 : idx;
}

// ── Customer service ──────────────────────────────────────────────────────────
function switchAgent(id: string) {
    currentAgent.value = id;
    nextTick(scrollChatToBottom);
}

async function sendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    const now = new Date();
    const time =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");
    chatHistory.value[currentAgent.value].push({ from: "me", text, time });
    chatInput.value = "";
    await nextTick();
    scrollChatToBottom();
    setTimeout(async () => {
        const replies = presetReplies[currentAgent.value];
        chatHistory.value[currentAgent.value].push({
            from: "agent",
            text: replies[Math.floor(Math.random() * replies.length)],
            time,
        });
        await nextTick();
        scrollChatToBottom();
    }, 800);
}

function scrollChatToBottom() {
    if (chatBodyRef.value)
        chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function showConfirm(title: string, msg: string, icon: string, cb: () => void) {
    confirmTitle.value = title;
    confirmMsg.value = msg;
    confirmIcon.value = icon;
    confirmCallback.value = cb;
    showConfirmModal.value = true;
}

function onConfirmOk() {
    if (confirmCallback.value) confirmCallback.value();
    showConfirmModal.value = false;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg: string) {
    toastMsg.value = msg;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastVisible.value = false;
    }, 1800);
}

// ── API Calls ─────────────────────────────────────────────────────────────────
/** 加载商品列表 */
async function loadProducts() {
    loading.value = true;
    try {
        const response = await ApiProduct.listProducts({
            page: 1,
            size: 100, // 一次性加载所有商品
            status: 1, // 只获取上架商品
        });

        console.log("商品列表响应:", response);
        console.log("response.data:", response.data);

        // response.data 的结构是 ApiResponse<PageResult<ProductVO>>
        // 分页数据在 response.data.data 中
        const apiResponse = response.data;
        if (apiResponse && apiResponse.data && apiResponse.data.records) {
            console.log("商品记录数:", apiResponse.data.records.length);
            products.value = apiResponse.data.records.map(convertProductVO);
            console.log("转换后的商品数:", products.value.length);
        } else {
            console.warn("商品数据格式异常:", response.data);
        }
    } catch (error) {
        console.error("加载商品失败:", error);
        showToast("加载商品失败，请稍后重试");
    } finally {
        loading.value = false;
    }
}

/** 加载商品分类 */
async function loadCategories() {
    try {
        const response = await ApiProduct.getActiveCategories();

        console.log("分类列表响应:", response);
        console.log("response.data:", response.data);
        console.log(
            "Array.isArray(response.data):",
            Array.isArray(response.data),
        );

        // response.data 的结构是 ApiResponse<CategoryVO[]>
        // 真正的数组在 response.data.data 中
        const apiResponse = response.data;
        if (
            apiResponse &&
            apiResponse.data &&
            Array.isArray(apiResponse.data)
        ) {
            console.log("分类数量:", apiResponse.data.length);
            categories.value = apiResponse.data;
        } else {
            console.warn("分类数据格式异常:", response.data);
        }
    } catch (error) {
        console.error("加载分类失败:", error);
    }
}

/** 将后端 OrderVO 转换为前端 Order */
function convertOrderVO(vo: OrderVO): Order {
    // 后端订单状态映射到前端订单状态（不包含退款状态）
    const statusMap: Record<number, Order["status"]> = {
        0: "unpaid", // 待付款
        1: "topay", // 已付款（待发货）
        2: "shipped", // 已发货
        3: "done", // 已完成
        4: "cancelled", // 已取消
        // 注意：5=退款中, 6=已退款 不再映射到订单状态
    };

    // 处理退款状态
    // 注意：这里需要根据实际情况调整
    // 如果后端订单接口返回了退款状态，直接使用
    // 否则需要通过 /refunds 接口查询
    let refundStatus: number | undefined = undefined;
    let auditRemark: string | undefined = undefined;

    // 临时方案：根据订单状态推断退款状态
    // TODO: 应该调用 /refunds 接口获取准确的退款状态
    if (vo.status === 5) {
        // 订单状态为退款中，可能是 0/1/2 中的一个
        refundStatus = 0; // 默认为申请中
    } else if (vo.status === 6) {
        // 订单状态为已退款，可能是 3（完成）或 4（失败）
        // 这里需要根据实际业务逻辑判断
        refundStatus = 3; // 默认为已完成
    }

    // 如果后端返回了退款审核备注，直接使用
    // @ts-ignore - 后端可能会扩展返回此字段
    if (vo.auditRemark) {
        auditRemark = vo.auditRemark;
    }

    return {
        id: vo.id,
        no: vo.orderNo,
        time: vo.createdAt,
        // 如果订单状态是退款中或已退款，映射为对应的订单基础状态
        status:
            vo.status === 5 || vo.status === 6
                ? "shipped"
                : statusMap[vo.status] || "unpaid",
        items: vo.items.map((item) => ({
            id: `p${item.productId}`,
            qty: item.quantity,
            name: item.productName,
            price: item.price,
        })),
        amount: vo.payAmount || vo.totalAmount,
        refundStatus, // 独立的退款状态
        auditRemark, // 退款审核备注
        // 物流信息暂时不处理，后续可以根据需要添加
    };
}

/** 加载订单列表 */
async function loadOrders(status?: number) {
    orderLoading.value = true;
    try {
        const queryParams: Parameters<typeof ApiOrder.listOrders>[0] = {
            page: 1,
            size: 100, // 一次性加载所有订单
            ...(status !== undefined && { status }),
        };

        const response = await ApiOrder.listOrders(queryParams);

        console.log("订单列表响应:", response);
        const apiResponse = response.data;

        // 先清空旧数据，确保完全从后端同步
        orders.value = [];

        if (apiResponse && apiResponse.data && apiResponse.data.records) {
            console.log("订单记录数:", apiResponse.data.records.length);

            // 转换订单数据
            const convertedOrders =
                apiResponse.data.records.map(convertOrderVO);

            // 对于有退款状态的订单，调用 /refunds 接口获取真实的退款状态
            await loadRefundInfoForOrders(convertedOrders);

            orders.value = convertedOrders;
            console.log("转换后的订单数:", orders.value.length);
        } else {
            console.warn("订单数据格式异常:", response.data);
            showToast("暂无订单数据");
        }
    } catch (error) {
        console.error("加载订单失败:", error);
        showToast("加载订单失败，请稍后重试");
    } finally {
        orderLoading.value = false;
    }
}

/** 为有退款状态的订单加载真实的退款信息 */
async function loadRefundInfoForOrders(orders: Order[]) {
    try {
        // 找出所有有退款状态的订单
        const ordersWithRefund = orders.filter(
            (o) => o.refundStatus !== undefined,
        );

        if (ordersWithRefund.length === 0) return;

        console.log(
            `发现 ${ordersWithRefund.length} 个有退款状态的订单，查询退款详情...`,
        );

        // 调用 /refunds 接口获取所有退款记录
        const refundResponse = await ApiRefund.listMyRefunds({
            page: 1,
            size: 100,
        });

        const refundData = refundResponse.data;
        if (!refundData || !refundData.data || !refundData.data.records) {
            console.warn("退款数据格式异常");
            return;
        }

        const refunds = refundData.data.records;
        console.log(`获取到 ${refunds.length} 条退款记录`);

        // 建立 orderId -> refund 的映射
        const refundMap = new Map<number, any>();
        refunds.forEach((refund) => {
            refundMap.set(refund.orderId, refund);
        });

        // 更新订单的 refundStatus 和 auditRemark
        ordersWithRefund.forEach((order) => {
            const refund = refundMap.get(order.id);
            if (refund) {
                order.refundStatus = refund.status;
                order.auditRemark = refund.auditRemark;
                console.log(
                    `订单 ${order.no} 的退款状态更新为: ${refund.status} (${getRefundStatusText(refund.status)})`,
                    refund.auditRemark ? `, 原因: ${refund.auditRemark}` : "",
                );
            }
        });
    } catch (error) {
        console.error("加载退款信息失败:", error);
        // 不显示错误提示，继续使用推断的状态
    }
}

/** 手动刷新订单列表 */
async function refreshOrders() {
    showToast("正在同步最新订单状态...");
    await loadOrders();
    showToast("订单状态已更新");
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
function handleGlobalClick() {
    openMoreIdx.value = -1;
}

// 监听 tab 切换，每次切换时重新加载数据
watch(activeTab, (newTab, oldTab) => {
    console.log(`Tab 切换: ${oldTab} -> ${newTab}`);

    switch (newTab) {
        case "shop":
            // 商品页不需要重新加载，因为数据已经在初始化时加载
            console.log("切换到商品浏览页");
            break;

        case "cart":
            // 切换到购物车时，重新从后端获取最新数据
            console.log("切换到购物车页，重新加载购物车数据");
            loadCartList();
            break;

        case "order":
            // 切换到订单页时，重新从后端获取最新订单列表
            console.log("切换到订单页，重新加载订单数据");
            loadOrders();
            break;

        case "service":
            // 客服页不需要特殊处理
            console.log("切换到客服咨询页");
            break;
    }
});

onMounted(() => {
    document.addEventListener("click", handleGlobalClick);
    // 加载商品和分类数据
    loadProducts();
    loadCategories();
    // 加载购物车数据
    loadCartList();
    // 加载订单数据
    loadOrders();
});

onUnmounted(() => {
    document.removeEventListener("click", handleGlobalClick);
    if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped lang="scss">
.page-wrapper {
    min-height: 100vh;
}

.hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 40px 80px;
}

// ── Hero ──────────────────────────────────────────────────────────────────────
.hero {
    background: linear-gradient(135deg, #fdfaf3 0%, #f5ebd3 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 20px;
    padding: 36px 40px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;

    &::before {
        content: "優";
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        font-family: "STKaiti", serif;
        font-size: 200px;
        color: var(--gold);
        opacity: 0.1;
        line-height: 1;
        font-weight: 900;
        pointer-events: none;
    }
}
.hero-label {
    font-size: 13px;
    color: var(--gold);
    letter-spacing: 4px;
    margin-bottom: 8px;
}
.hero h1 {
    font-family: "STKaiti", serif;
    font-size: 38px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
}
.hero-sub {
    color: var(--ink-muted);
    font-size: 15px;
    max-width: 580px;
}
.hero-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    font-size: 13px;
    flex-wrap: wrap;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
    strong {
        color: var(--jade);
        font-weight: 600;
    }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
.tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 28px;
    background: var(--paper);
    border-radius: 14px;
    padding: 8px;
    box-shadow: var(--shadow);
}

.tab {
    background: transparent;
    border: none;
    padding: 14px 8px;
    cursor: pointer;
    border-radius: 10px;
    font-family: inherit;
    color: var(--ink-muted);
    font-size: 13px;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    .tab-icon {
        font-size: 22px;
    }
    &:hover {
        background: var(--cream);
        color: var(--ink);
    }
    &.active {
        background: linear-gradient(135deg, var(--jade), var(--jade-light));
        color: white;
        box-shadow: 0 4px 12px rgba(92, 131, 116, 0.3);
    }
}

// ── Category bar ──────────────────────────────────────────────────────────────
.cat-bar {
    background: var(--paper);
    border-radius: 14px;
    padding: 16px 20px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    margin-bottom: 20px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
}
.cat-label {
    font-size: 13px;
    color: var(--ink-muted);
    margin-right: 4px;
}
.cat-chip {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid var(--line);
    background: var(--paper-warm);
    color: var(--ink-soft);
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    &:hover {
        border-color: var(--jade-light);
        color: var(--jade);
    }
    &.active {
        background: var(--jade);
        color: white;
        border-color: var(--jade);
        box-shadow: 0 2px 6px rgba(92, 131, 116, 0.25);
    }
}
.cat-search {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--cream);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 6px 14px;
    width: 240px;
    input {
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        font-family: inherit;
        font-size: 13px;
        color: var(--ink);
        &::placeholder {
            color: var(--ink-muted);
        }
    }
}

// ── Product grid ──────────────────────────────────────────────────────────────
.product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.product-card {
    background: var(--paper);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    cursor: pointer;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-lg);
    }
}
.product-image {
    height: 160px;
    background: linear-gradient(135deg, var(--cream), var(--gold-soft));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56px;
    position: relative;
}
.product-icon {
    font-size: 56px;
    line-height: 1;
}
.product-tag-hot {
    position: absolute;
    top: 10px;
    left: 10px;
    background: var(--cinnabar);
    color: white;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-family: "STKaiti", serif;
}
.product-body {
    padding: 14px;
}
.product-name {
    font-family: "STKaiti", serif;
    font-weight: 600;
    color: var(--ink);
    font-size: 15px;
    margin-bottom: 6px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 42px;
}
.product-effect {
    font-size: 12px;
    color: var(--ink-muted);
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}
.product-price {
    color: var(--cinnabar);
    font-weight: 700;
    font-size: 18px;
    font-family: "STKaiti", serif;
}
.price-cny {
    font-size: 12px;
    margin-right: 1px;
}
.product-sales {
    font-size: 11px;
    color: var(--ink-muted);
}

// ── Cart ──────────────────────────────────────────────────────────────────────
.ai-sync-note {
    background: var(--moon-soft);
    color: var(--moon);
    border: 1px dashed #bfcfe3;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    margin-bottom: 12px;
}
.cart-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}
.cart-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--paper-warm);
}
.cart-thumb {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--cream), var(--gold-soft));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
    &.sm {
        width: 56px;
        height: 56px;
        font-size: 24px;
    }
}
.cart-item-info {
    flex: 1;
    min-width: 0;
}
.cart-item-name {
    font-family: "STKaiti", serif;
    font-weight: 600;
    color: var(--ink);
    font-size: 15px;
}
.cart-from-ai {
    display: inline-block;
    font-size: 10px;
    padding: 1px 6px;
    margin-left: 6px;
    background: var(--moon-soft);
    color: var(--moon);
    border-radius: 6px;
}
.cart-item-meta {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
}
.cart-item-price {
    font-family: "STKaiti", serif;
    color: var(--cinnabar);
    font-weight: 700;
    font-size: 16px;
    width: 80px;
    text-align: right;
}
.cart-rm {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink-muted);
    font-size: 16px;
    &:hover {
        color: var(--cinnabar);
    }
}
.cart-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    background: linear-gradient(135deg, var(--jade-soft), var(--paper-warm));
    border-radius: 12px;
    border: 1px solid var(--jade-soft);
}
.cart-total-label {
    font-size: 14px;
    color: var(--ink-muted);
}
.cart-total-num {
    font-family: "STKaiti", serif;
    color: var(--cinnabar);
    font-weight: 700;
    font-size: 28px;
    margin-left: 10px;
}
.cart-total-hint {
    font-size: 12px;
    color: var(--ink-muted);
    margin-left: 10px;
}

// ── Qty control ───────────────────────────────────────────────────────────────
.qty-ctrl {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
}
.qty-btn {
    background: var(--cream);
    border: none;
    width: 26px;
    height: 26px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    color: var(--ink);
    &:hover {
        background: var(--jade-soft);
    }
}
.qty-num {
    width: 36px;
    text-align: center;
    font-size: 13px;
    height: 26px;
    line-height: 26px;
    border-left: 1px solid var(--line);
    border-right: 1px solid var(--line);
    background: white;
    color: var(--ink);
    display: inline-block;
}

// ── Order list ────────────────────────────────────────────────────────────────
.order-status-tabs {
    display: flex;
    gap: 4px;
    background: var(--cream);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 20px;
}
.order-status-tab {
    padding: 8px 18px;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 7px;
    color: var(--ink-muted);
    font-family: inherit;
    font-size: 14px;
    transition: all 0.2s;
    .num {
        font-size: 12px;
        margin-left: 4px;
    }
    &.active {
        background: var(--paper);
        color: var(--cinnabar);
        font-weight: 600;
        box-shadow: var(--shadow);
    }
}
.order-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    margin-bottom: 16px;
    overflow: hidden;
}
.order-head {
    padding: 14px 20px;
    border-bottom: 1px dashed var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--paper-warm);
}
.order-no {
    font-size: 13px;
    color: var(--ink-muted);
    strong {
        color: var(--ink);
        font-family: monospace;
    }
}
.order-time {
    font-size: 12px;
    color: var(--ink-muted);
    margin-left: 12px;
}
.order-status {
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 14px;
}
.status-pay {
    color: var(--cinnabar);
}
.status-ship {
    color: var(--gold);
}
.status-shipped {
    color: var(--jade);
}
.status-done {
    color: var(--ink-muted);
}
.order-body {
    padding: 16px 20px;
    display: flex;
    gap: 14px;
    align-items: center;
}
.order-thumb-row {
    display: flex;
    gap: 8px;
    flex: 0 0 auto;
}
.order-info-block {
    font-size: 13px;
    color: var(--ink-muted);
    flex: 1;
    min-width: 0;
}
.order-foot {
    padding: 14px 20px;
    background: var(--paper-warm);
    border-top: 1px dashed var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.order-amount {
    font-family: "STKaiti", serif;
    strong {
        color: var(--cinnabar);
        font-size: 20px;
        font-weight: 700;
    }
}
.order-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    .btn {
        padding: 7px 16px;
        font-size: 13px;
    }
}

.more-wrap {
    position: relative;
    display: inline-block;
}
.more-menu {
    display: none;
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 6px;
    background: white;
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    min-width: 130px;
    z-index: 200;
    overflow: hidden;
    &.show {
        display: block;
    }
}
.more-menu-item {
    padding: 10px 16px;
    font-size: 13px;
    cursor: pointer;
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
    transition: background 0.15s;
    &:last-child {
        border-bottom: none;
    }
    &:hover {
        background: var(--cream);
        color: var(--cinnabar);
    }
}

// ── Customer service ──────────────────────────────────────────────────────────
.service-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 16px;
    min-height: 540px;
}
.agent-list {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    padding: 12px;
    overflow: auto;
}
.agent-list-title {
    font-family: "STKaiti", serif;
    font-size: 14px;
    color: var(--ink-muted);
    padding: 4px 10px 10px;
    border-bottom: 1px solid var(--line);
}
.agent-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 4px;
    transition: background 0.2s;
    &:hover {
        background: var(--cream);
    }
    &.active {
        background: var(--jade-soft);
    }
}
.agent-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 14px;
    position: relative;
    flex-shrink: 0;
    &.sm {
        width: 40px;
        height: 40px;
        font-size: 14px;
    }
    &.xs {
        width: 32px;
        height: 32px;
        font-size: 11px;
    }
}
.agent-status-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--jade-light);
    border: 2px solid var(--paper);
    &.busy {
        background: var(--gold);
    }
    &.off {
        background: var(--ink-muted);
    }
}
.agent-info {
    flex: 1;
    min-width: 0;
}
.agent-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--ink);
}
.agent-tag {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 1px;
}

.chat-panel {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    display: flex;
    flex-direction: column;
}
.chat-header {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    gap: 10px;
    h4 {
        font-family: "STKaiti", serif;
        font-size: 16px;
        color: var(--ink);
    }
    .desc {
        font-size: 12px;
        color: var(--ink-muted);
    }
}
.chat-header-tip {
    margin-left: auto;
    font-size: 11px;
    color: var(--ink-muted);
}
.chat-body {
    flex: 1;
    padding: 16px 18px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--paper-warm);
    min-height: 380px;
}
.chat-msg {
    display: flex;
    gap: 10px;
    max-width: 75%;
    &.me {
        align-self: flex-end;
        flex-direction: row-reverse;
    }
}
.chat-bubble {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;
    .agent & {
        background: white;
        border: 1px solid var(--line);
        border-top-left-radius: 4px;
        color: var(--ink);
    }
    .me & {
        background: var(--jade);
        color: white;
        border-top-right-radius: 4px;
    }
}
.chat-meta {
    font-size: 11px;
    color: var(--ink-muted);
    padding: 0 6px;
}
.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--jade));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 11px;
    flex-shrink: 0;
    &.xs {
        width: 32px;
        height: 32px;
    }
}
.chat-input-row {
    padding: 12px 14px;
    border-top: 1px solid var(--line);
    display: flex;
    gap: 10px;
    input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--line);
        border-radius: 10px;
        font-family: inherit;
        font-size: 13px;
        outline: none;
        color: var(--ink);
        &:focus {
            border-color: var(--jade);
        }
    }
}

// ── Buttons ───────────────────────────────────────────────────────────────────
.btn {
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.btn-jade {
    background: var(--jade);
    color: white;
    &:hover {
        background: #4a6f60;
    }
}
.btn-cinnabar {
    background: var(--cinnabar);
    color: white;
    &:hover {
        background: #962f22;
    }
}
.btn-outline {
    border: 1px solid var(--line);
    background: white;
    color: var(--ink);
    &:hover {
        border-color: var(--jade);
        color: var(--jade);
    }
}
.btn-lg {
    padding: 12px 28px;
    font-size: 15px;
}

// ── Modals ────────────────────────────────────────────────────────────────────
.modal-mask {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44, 54, 57, 0.5);
    backdrop-filter: blur(3px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    padding: 20px;
    &.show {
        display: flex;
    }
}
.modal {
    background: white;
    border-radius: 14px;
    max-width: 720px;
    width: 100%;
    box-shadow: var(--shadow-lg);
    max-height: 90vh;
    overflow: auto;
}
.modal-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 {
        font-family: "STKaiti", serif;
        font-size: 18px;
        color: var(--ink);
    }
}
.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 22px;
    color: var(--ink-muted);
    &:hover {
        color: var(--ink);
    }
}
.modal-body {
    padding: 22px;
}
.modal-footer {
    padding: 14px 22px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

// Product detail modal
.pd-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
}
.pd-image {
    background: linear-gradient(135deg, var(--cream), var(--gold-soft));
    border-radius: 12px;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 110px;
}
.pd-info h2 {
    font-family: "STKaiti", serif;
    font-size: 22px;
    color: var(--ink);
    margin-bottom: 6px;
}
.pd-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}
.pd-tag {
    padding: 3px 10px;
    background: var(--jade-soft);
    color: var(--jade);
    font-size: 11px;
    border-radius: 6px;
    font-family: "STKaiti", serif;
}
.pd-price-box {
    background: linear-gradient(
        135deg,
        var(--cinnabar-soft),
        var(--paper-warm)
    );
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 16px;
    display: flex;
    align-items: baseline;
    gap: 8px;
}
.pd-price {
    font-family: "STKaiti", serif;
    color: var(--cinnabar);
    font-weight: 700;
    font-size: 32px;
}
.pd-price-cny {
    font-size: 16px;
    margin-right: 2px;
}
.pd-price-orig {
    font-size: 13px;
    color: var(--ink-muted);
    text-decoration: line-through;
}
.pd-badge-limit {
    font-size: 11px;
    background: var(--cinnabar);
    color: white;
    padding: 2px 6px;
    border-radius: 6px;
}
.pd-meta-row {
    display: flex;
    gap: 18px;
    margin-bottom: 18px;
    font-size: 13px;
    color: var(--ink-muted);
    strong {
        color: var(--ink);
    }
}
.pd-section {
    padding: 12px 0;
    border-top: 1px dashed var(--line);
    font-size: 13px;
    color: var(--ink-soft);
    h4 {
        font-family: "STKaiti", serif;
        color: var(--ink);
        margin-bottom: 6px;
        font-size: 14px;
    }
}
.pd-actions {
    margin-top: 16px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
}

// Payment modal
.pay-card {
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 18px;
    margin-bottom: 14px;
}
.pay-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 14px;
}
.pay-row.total {
    border-top: 1px dashed var(--line);
    margin-top: 10px;
    padding-top: 10px;
    font-family: "STKaiti", serif;
    font-size: 16px;
    .red {
        color: var(--cinnabar);
        font-size: 22px;
        font-weight: 700;
    }
}
.pay-method {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border: 2px solid var(--jade);
    background: var(--jade-soft);
    border-radius: 10px;
    margin-bottom: 14px;
}
.ali-logo {
    width: 44px;
    height: 44px;
    background: #1677ff;
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 22px;
}
.qr-mock {
    width: 200px;
    height: 200px;
    margin: 14px auto;
    background:
        linear-gradient(45deg, var(--ink) 25%, transparent 25%) 0 0 / 12px 12px,
        linear-gradient(-45deg, var(--ink) 25%, transparent 25%) 0 6px / 12px
            12px,
        linear-gradient(45deg, transparent 75%, var(--ink) 75%) 6px -6px / 12px
            12px,
        linear-gradient(-45deg, transparent 75%, var(--ink) 75%) -6px 0 / 12px
            12px,
        white;
    border: 4px solid var(--ink);
    border-radius: 8px;
}

// Logistics modal
.logistics-detail-header {
    padding: 20px 24px;
    background: var(--moon-soft);
    border-bottom: 1px solid #dce3ef;
    .carrier {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
    }
    .track-no {
        font-size: 12px;
        color: var(--ink-muted);
        font-family: monospace;
    }
}
.logistics-detail-map {
    margin: 20px 24px;
    height: 140px;
    background: linear-gradient(135deg, #dce9f4 0%, #c6d8eb 100%);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.35) 1px,
                transparent 1px
            );
        background-size: 28px 28px;
    }
}
.log-map-route {
    position: absolute;
    top: 50%;
    left: 12%;
    right: 12%;
    height: 3px;
    background: rgba(179, 60, 44, 0.2);
    border-radius: 2px;
}
.log-map-done {
    position: absolute;
    top: 50%;
    left: 12%;
    height: 3px;
    background: var(--cinnabar);
    border-radius: 2px;
    width: 50%;
}
.log-map-pin {
    position: absolute;
    transform: translate(-50%, -100%);
    font-size: 26px;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
    &.start {
        top: 50%;
        left: 12%;
    }
    &.current {
        top: 50%;
        left: 62%;
    }
    &.end {
        top: 50%;
        left: 88%;
        opacity: 0.45;
    }
}
.log-map-label {
    position: absolute;
    top: 130%;
    transform: translateX(-50%);
    font-size: 10px;
    color: var(--moon);
    white-space: nowrap;
    font-weight: 500;
}
.red-label {
    color: var(--cinnabar) !important;
    font-weight: 600 !important;
}
.logistics-detail-steps {
    padding: 0 24px 20px;
}
.logistics-detail-step {
    position: relative;
    padding: 14px 0 14px 28px;
    border-left: 2px solid var(--line);
    font-size: 14px;
    color: var(--ink);
    &:last-child {
        border-left-color: transparent;
    }
    &::before {
        content: "";
        position: absolute;
        left: -8px;
        top: 16px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--paper);
        border: 2px solid var(--line);
    }
    &.done::before {
        background: var(--jade);
        border-color: var(--jade);
    }
    &.active {
        color: var(--cinnabar);
        font-weight: 600;
        &::before {
            background: var(--cinnabar);
            border-color: var(--cinnabar);
            box-shadow: 0 0 0 5px rgba(179, 60, 44, 0.12);
        }
    }
    .step-time {
        color: var(--ink-muted);
        font-size: 12px;
        display: block;
        margin-top: 3px;
    }
}
.logistics-detail-foot {
    padding: 14px 24px;
    background: var(--paper-warm);
    border-top: 1px solid var(--line);
    font-size: 13px;
    color: var(--ink-muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
.toast {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(44, 54, 57, 0.92);
    color: white;
    padding: 12px 22px;
    border-radius: 24px;
    font-size: 13px;
    z-index: 2000;
    opacity: 0;
    transition:
        opacity 0.3s,
        transform 0.3s;
    pointer-events: none;
    &.show {
        opacity: 1;
        transform: translateX(-50%) translateY(-6px);
    }
}

// ── Empty state ───────────────────────────────────────────────────────────────
.empty-tip {
    text-align: center;
    padding: 60px 20px;
    color: var(--ink-muted);
    font-size: 14px;
    .ic {
        font-size: 56px;
        opacity: 0.5;
        margin-bottom: 12px;
        display: block;
    }
}

// ── Responsive ────────────────────────────────────────────────────────────────
@media (max-width: 900px) {
    .hub {
        padding: 20px 16px 60px;
    }
    .hero {
        padding: 24px 20px;
        &::before {
            display: none;
        }
    }
    .product-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .tabs {
        grid-template-columns: repeat(2, 1fr);
    }
    .service-layout {
        grid-template-columns: 1fr;
    }
    .pd-grid {
        grid-template-columns: 1fr;
    }
    .cat-search {
        display: none;
    }
}
</style>
