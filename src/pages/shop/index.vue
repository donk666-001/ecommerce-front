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
      <ProductList
        v-show="activeTab === 'shop'"
        :products="products"
        :categories="categories"
        v-model:current-cat="currentCat"
        v-model:search-kw="searchKw"
        :loading="loading"
        @open-product="openProduct"
      />

      <!-- Panel: Cart -->
      <CartPanel
        v-show="activeTab === 'cart'"
        :cart-items="cartItems"
        :cart-total="cartTotal"
        :get-product-icon="getProductIcon"
        @go-to-shop="activeTab = 'shop'"
        @change-qty="changeQty"
        @remove-from-cart="removeFromCart"
        @open-pay="openPay"
      />

      <!-- Panel: Order -->
      <OrderList
        v-show="activeTab === 'order'"
        :orders="filteredOrders"
        v-model:order-filter="orderFilter"
        :order-loading="orderLoading"
        :open-more-idx="openMoreIdx"
        :get-product="getProduct"
        :order-count="orderCount"
        @refresh-orders="refreshOrders"
        @cancel-order="cancelOrder"
        @pay-order="payOrder"
        @open-refund-modal="openRefundModal"
        @remind-ship="remindShip"
        @re-buy="reBuy"
        @confirm-receipt="confirmReceipt"
        @open-logistics="openLogistics"
        @review-order="reviewOrder"
        @toggle-more="toggleMore"
        @extend-receipt="extendReceipt"
      />

      <!-- Panel: Service -->
      <CustomerService
        v-show="activeTab === 'service'"
        :agents="agents"
        v-model:current-agent="currentAgent"
        :chat-history="chatHistory"
        v-model:chat-input="chatInput"
        @send-chat="sendChat"
      />
    </main>

    <!-- Product Detail Modal -->
    <ProductDetailModal
      v-model="showPdModal"
      :product="selectedProduct"
      v-model:quantity="pdQty"
      @add-to-cart="addToCartFromDetail"
      @go-to-cart="
        showPdModal = false;
        activeTab = 'cart';
      "
      @buy-now="buyNow"
      @contact-service="
        showPdModal = false;
        activeTab = 'service';
      "
    />

    <!-- Payment Modal -->
    <PaymentModal
      v-model="showPayModal"
      :cart-items="cartItems"
      :cart-total="cartTotal"
      @confirm-pay="mockPaySuccess"
    />

    <!-- Logistics Modal -->
    <LogisticsModal
      v-model="showLogisticsModal"
      :logistics-detail="currentLogisticsDetail"
    />

    <!-- Refund Application Modal -->
    <RefundModal
      v-model="showRefundModal"
      :form-data="refundForm"
      :submitting="refundSubmitting"
      @submit="submitRefund"
    />

    <!-- Toast -->
    <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch, reactive } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import {
  ProductList,
  CartPanel,
  OrderList,
  CustomerService,
  ProductDetailModal,
  PaymentModal,
  LogisticsModal,
  RefundModal,
} from "@/components/shop";
import {
  ApiProduct,
  type ProductVO,
  type CategoryVO,
  type CartItemVO,
  type CartSummaryVO,
} from "@/network/product";
import { ApiOrder, type OrderVO } from "@/network/order";
import { ApiRefund, type ApplyRefundDTO } from "@/network/refund";
import { ApiLogistics } from "@/network";

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
interface LogisticsStep {
  time: string;
  text: string;
  state: string;
}
/** 前端订单展示数据结构（由后端 OrderVO 转换而来） */
interface Order {
  id: number; // 订单ID
  no: string; // 订单号
  time: string; // 创建时间
  status: "unpaid" | "topay" | "shipped" | "done" | "cancelled"; // 订单状态（不含退款状态）
  items: { id: string; qty: number; name: string; price: number }[]; // 订单项
  amount: number; // 订单总金额
  logistics?: { from: string; to: string; steps: LogisticsStep[] }; // 物流信息（可选）
  refundStatus?: number; // 退款状态（独立）：0=申请中, 1=审核通过, 2=退款中, 3=已完成, 4=已拒绝
  auditRemark?: string; // 退款审核备注（退款失败时显示原因）
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
// 客服数据（保持静态）
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

// ── Reactive state ────────────────────────────────────────────────────────────
const activeTab = ref("shop");
const currentCat = ref("all");
const searchKw = ref("");

// 商品列表（从后端获取）
const products = ref<Product[]>([]);
const categories = ref<CategoryVO[]>([]);
const loading = ref(false);

// 购物车（从后端获取）
const cartItems = ref<CartItemVO[]>([]);
const cartLoading = ref(false);
const cartSummary = ref<CartSummaryVO | null>(null); // 购物车汇总信息

// 订单列表（从后端获取）
const orders = ref<Order[]>([]);
const orderLoading = ref(false);

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

// Refund modal states
const showRefundModal = ref(false);
const refundForm = reactive({
  orderId: 0,
  orderNo: "",
  orderAmount: 0,
  refundType: 1, // 1=仅退款, 2=退货退款
  refundAmount: 0,
  reason: "",
  description: "",
});
const refundSubmitting = ref(false);

// Logistics detail state
const currentLogisticsDetail = ref<any>(null);

// Toast
const toastMsg = ref("");
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

// Order more dropdown
const openMoreIdx = ref(-1);

// ── Computed ──────────────────────────────────────────────────────────────────
const cartCount = computed(
  () =>
    cartSummary.value?.totalQuantity ??
    cartItems.value.reduce((s, c) => s + c.quantity, 0),
);
const cartTotal = computed(
  () =>
    cartSummary.value?.totalPrice ??
    cartItems.value.reduce((s, c) => s + c.price * c.quantity, 0),
);

const filteredOrders = computed(() => {
  const filter = orderFilter.value;

  // 如果是退款相关的筛选,基于 refundStatus 字段
  if (filter === "refunding") {
    // 退款中:refundStatus 为 0, 1, 2(申请中、审核通过、退款中)
    return orders.value.filter(
      (o) =>
        o.refundStatus !== undefined &&
        [0, 1, 2].includes(o.refundStatus),
    );
  }
  if (filter === "refunded") {
    // 已退款:refundStatus 为 3(退款已完成)
    return orders.value.filter((o) => o.refundStatus === 3);
  }
  if (filter === "rejected") {
    // 退款失败:refundStatus 为 4(退款被拒绝)
    return orders.value.filter((o) => o.refundStatus === 4);
  }

  // 其他情况(全部、未支付、待发货、已发货、已完成、已取消)
  // 只显示没有退款状态的订单
  if (filter === "all") {
    return orders.value.filter((o) => o.refundStatus === undefined);
  }

  // 基于订单状态筛选,同时排除有退款状态的订单
  return orders.value.filter(
    (o) => o.refundStatus === undefined && o.status === filter,
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
/** 将后端 ProductVO 转换为前端 Product */
function convertProductVO(vo: ProductVO): Product {
  // 使用后端返回的 categoryName 作为分类
  const cat = vo.categoryName || "all";

  // 从 tags 字符串中提取标签数组
  const tags = vo.tags ? vo.tags.split(",") : [];

  // 使用 emoji 映射（根据中文分类名）
  const iconMap: Record<string, string> = {
    食疗食材类: "🍲",
    养生茶饮: "🍵",
    健康调理类: "🌿",
    女性养生专区: "🌸",
    中药材: "🟥",
    养生器具: "⚪",
  };

  return {
    id: `p${vo.id}`,
    name: vo.name,
    cat,
    price: vo.discountPrice,
    sold: vo.soldCount,
    stock: vo.stock,
    icon: iconMap[cat] || "📦",
    tags,
    effect: vo.efficacy || "",
    desc: vo.description || "",
  };
}

function getProduct(id: string): Product {
  const product = products.value.find((p) => p.id === id);
  if (!product) {
    console.warn(`商品不存在: ${id}`);
    // 返回一个默认商品对象，避免渲染错误
    return {
      id,
      name: "未知商品",
      cat: "all",
      price: 0,
      sold: 0,
      stock: 0,
      icon: "❓",
      tags: [],
      effect: "",
      desc: "",
    };
  }
  return product;
}

/** 根据 productId 获取商品图标 */
function getProductIcon(productId: number): string {
  const product = products.value.find((p) => p.id === `p${productId}`);
  return product ? product.icon : "📦";
}

function orderCount(key: string): number {
  if (key === "all") {
    // 全部：只显示没有退款状态的订单
    return orders.value.filter((o) => o.refundStatus === undefined).length;
  }

  // 如果是退款相关的筛选，基于 refundStatus 字段
  if (key === "refunding") {
    return orders.value.filter(
      (o) =>
        o.refundStatus !== undefined &&
        [0, 1, 2].includes(o.refundStatus),
    ).length;
  }
  if (key === "refunded") {
    return orders.value.filter((o) => o.refundStatus === 3).length;
  }
  if (key === "rejected") {
    return orders.value.filter((o) => o.refundStatus === 4).length;
  }

  // 其他情况基于订单状态统计，同时排除有退款状态的订单
  return orders.value.filter(
    (o) => o.refundStatus === undefined && o.status === key,
  ).length;
}



/** 获取退款状态文本 */
function getRefundStatusText(status?: number): string {
  if (status === undefined) return "";
  const map: Record<number, string> = {
    0: "退款申请中",
    1: "审核通过",
    2: "退款中",
    3: "退款已完成",
    4: "退款失败",
  };
  return map[status] || "未知";
}



// ── Cart actions ──────────────────────────────────────────────────────────────
/** 加载购物车列表 */
async function loadCartList() {
  cartLoading.value = true;
  try {
    const response = await ApiProduct.getCartDetail();
    const apiResponse = response.data;
    if (apiResponse && apiResponse.data) {
      // 后端返回的是 CartSummaryVO 结构
      cartSummary.value = apiResponse.data;
      cartItems.value = apiResponse.data.items;
      console.log("购物车商品数:", cartItems.value.length);
      console.log("选中商品总数:", apiResponse.data.totalQuantity);
      console.log("选中商品总金额:", apiResponse.data.totalPrice);
    }
  } catch (error) {
    console.error("加载购物车失败:", error);
    showToast("加载购物车失败，请重试");
  } finally {
    cartLoading.value = false;
  }
}

/** 添加商品到购物车 */
async function addToCart(productId: number, qty: number) {
  try {
    await ApiProduct.addToCart({ productId, quantity: qty });
    showToast("已加入购物车");
    // 重新加载购物车列表（获取最新数据）
    await loadCartList();
  } catch (error) {
    console.error("加入购物车失败:", error);
    showToast("加入购物车失败，请重试");
  }
}

/** 更新购物车项数量 */
async function changeQty(cartItemId: number, delta: number) {
  const item = cartItems.value.find((c) => c.id === cartItemId);
  if (!item) return;

  const newQty = Math.max(1, item.quantity + delta);
  try {
    // 使用新的 API 方法名和参数格式
    await ApiProduct.updateCartItemQuantity(cartItemId, newQty);
    // 重新加载以获取最新的汇总信息
    await loadCartList();
  } catch (error) {
    console.error("更新购物车失败:", error);
    showToast("更新购物车失败，请重试");
  }
}

/** 从购物车移除 */
async function removeFromCart(cartItemId: number) {
  try {
    await ApiProduct.removeCartItem(cartItemId);
    showToast("已从购物车移除");
    // 重新加载以获取最新的汇总信息
    await loadCartList();
  } catch (error) {
    console.error("移除购物车项失败:", error);
    showToast("移除失败，请重试");
  }
}

// ── Product detail ────────────────────────────────────────────────────────────
function openProduct(p: Product) {
  selectedProduct.value = p;
  pdQty.value = 1;
  showPdModal.value = true;
}

function addToCartFromDetail() {
  if (!selectedProduct.value) return;
  // 从 id "p1" 中提取数字 1
  const productId = parseInt(selectedProduct.value.id.replace("p", ""));
  addToCart(productId, pdQty.value);
  showPdModal.value = false;
}

function buyNow() {
  if (!selectedProduct.value) return;
  const productId = parseInt(selectedProduct.value.id.replace("p", ""));
  addToCart(productId, pdQty.value);
  showPdModal.value = false;
  openPay();
}

// ── Payment ───────────────────────────────────────────────────────────────────
function openPay() {
  if (cartItems.value.length === 0) {
    showToast("购物车为空");
    return;
  }
  showPayModal.value = true;
}

/** 模拟支付成功（实际应调用后端创建订单接口） */
async function mockPaySuccess() {
  if (cartItems.value.length === 0) {
    showToast("购物车为空");
    return;
  }

  try {
    // 获取选中的购物车项 ID 列表
    const cartIds = cartItems.value.map((item) => item.id);

    // TODO: 这里需要用户填写收货信息，暂时使用默认值
    // 实际应该弹出表单让用户输入收货地址、姓名、电话
    const orderData = {
      cartIds,
      receiverName: "张三", // 应该从用户资料或表单中获取
      receiverPhone: "13800138000", // 应该从用户资料或表单中获取
      receiverAddress: "北京市朝阳区xxx街道xxx号", // 应该从用户资料或表单中获取
      remark: "请尽快发货",
    };

    // 调用后端创建订单接口
    const response = await ApiOrder.createOrder(orderData);
    const apiResponse = response.data;

    if (apiResponse && apiResponse.data) {
      console.log("订单创建成功:", apiResponse.data);
      showToast("支付成功，订单已生成");

      // 清空购物车
      cartItems.value = [];
      cartSummary.value = null;

      showPayModal.value = false;

      // 重新加载订单列表并切换到订单页
      await loadOrders();
      setTimeout(() => {
        activeTab.value = "order";
      }, 600);
    }
  } catch (error) {
    console.error("创建订单失败:", error);
    showToast("创建订单失败，请重试");
  }
}

// ── Order actions ─────────────────────────────────────────────────────────────
/** 取消订单 */
async function cancelOrder(no: string) {
  const order = orders.value.find((o) => o.no === no);
  if (!order) return;

  showConfirm(
    "取消订单",
    "确认取消该订单？取消后不可恢复。",
    "🗑️",
    async () => {
      try {
        await ApiOrder.cancelOrder(order.id, "用户主动取消");
        showToast("订单已取消");
        // 重新加载订单列表
        await loadOrders();
      } catch (error) {
        console.error("取消订单失败:", error);
        showToast("取消订单失败，请重试");
      }
    },
  );
}

/** 支付订单（对待支付订单进行支付） */
async function payOrder(no: string) {
  const order = orders.value.find((o) => o.no === no);
  if (!order) return;

  showConfirm(
    "确认支付",
    `确认支付订单 ${no}，金额 ¥${order.amount.toFixed(2)}？`,
    "💳",
    async () => {
      try {
        // 调用后端模拟支付接口
        await ApiOrder.simulatePay(order.id);
        showToast("支付成功！");
        // 重新加载订单列表以更新状态
        await loadOrders();
      } catch (error) {
        console.error("支付失败:", error);
        showToast("支付失败，请重试");
      }
    },
  );
}

/** 申请退款 - 打开模态框 */
function openRefundModal(no: string) {
  const order = orders.value.find((o) => o.no === no);
  if (!order) return;

  refundForm.orderId = order.id;
  refundForm.orderNo = order.no;
  refundForm.orderAmount = order.amount;
  refundForm.refundType = 1; // 默认仅退款
  refundForm.refundAmount = order.amount; // 默认全额退款
  refundForm.reason = "";
  refundForm.description = "";
  showRefundModal.value = true;
}

/** 提交退款申请 */
async function submitRefund() {
  // 表单验证
  if (!refundForm.reason.trim()) {
    showToast("请填写退款原因");
    return;
  }
  if (refundForm.refundAmount <= 0) {
    showToast("退款金额必须大于0");
    return;
  }
  if (refundForm.refundAmount > refundForm.orderAmount) {
    showToast("退款金额不能超过订单金额");
    return;
  }

  refundSubmitting.value = true;
  try {
    const trimmedDescription = refundForm.description.trim();
    const refundData: ApplyRefundDTO = {
      refundType: refundForm.refundType,
      refundAmount: refundForm.refundAmount,
      reason: refundForm.reason.trim(),
      ...(trimmedDescription && { description: trimmedDescription }),
    };

    await ApiRefund.applyRefund(refundForm.orderId, refundData);
    showToast("退款申请已提交，客服将在 24h 内处理");
    showRefundModal.value = false;

    // 重新加载订单列表以获取最新状态
    await loadOrders();
  } catch (error) {
    console.error("申请退款失败:", error);
    showToast("申请退款失败，请重试");
  } finally {
    refundSubmitting.value = false;
  }
}

/** 提醒发货 */
function remindShip(_no: string) {
  showToast("已提醒卖家发货");
}

/** 延长收货 */
function extendReceipt(_no: string) {
  showToast("收货时间已延长 7 天");
}

/** 评价订单 */
function reviewOrder(_no: string) {
  showToast("评价功能开发中，敬请期待");
}

/** 确认收货 */
async function confirmReceipt(no: string) {
  const order = orders.value.find((x) => x.no === no);
  if (!order) return;

  showConfirm(
    "确认收货",
    "确认已收到商品？确认后款项将打给卖家，请谨慎操作。",
    "📦",
    async () => {
      try {
        // 使用物流 API 的确认收货接口
        await ApiLogistics.confirmReceipt(order.id);
        showToast("已确认收货，欢迎再次光临～");
        // 重新加载订单列表
        await loadOrders();
      } catch (error) {
        console.error("确认收货失败:", error);
        showToast("确认收货失败，请重试");
      }
    },
  );
}

/** 再次购买 */
function reBuy(no: string) {
  const o = orders.value.find((x) => x.no === no);
  if (!o) return;
  o.items.forEach((it) => {
    // 从 id "p1" 中提取数字 1
    const productId = parseInt(it.id.replace("p", ""));
    addToCart(productId, it.qty);
  });
  showToast("商品已加入购物车");
}

/** 查看物流 */
async function openLogistics(no: string) {
  const order = orders.value.find((o) => o.no === no);
  if (!order) return;

  try {
    // 调用后端接口获取物流信息
    const response = await ApiLogistics.getOrderLogistics(order.id);
    const apiResponse = response.data;

    if (apiResponse && apiResponse.data) {
      const logistics = apiResponse.data;
      console.log("物流信息:", logistics);

      // 存储物流详情数据
      currentLogisticsDetail.value = logistics;
      selectedOrderNo.value = no;

      // 显示物流模态框
      showLogisticsModal.value = true;
    } else {
      showToast("暂无物流信息");
    }
  } catch (error) {
    console.error("查询物流失败:", error);
    showToast("查询物流失败，请重试");
  }
}

function toggleMore(idx: number) {
  openMoreIdx.value = openMoreIdx.value === idx ? -1 : idx;
}

// ── Customer service ──────────────────────────────────────────────────────────
async function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  const now = new Date();
  const time =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  // 确保聊天历史数组存在
  const agentId = currentAgent.value;
  if (!chatHistory.value[agentId]) {
    chatHistory.value[agentId] = [];
  }

  chatHistory.value[agentId].push({ from: "me", text, time });
  chatInput.value = "";
  await nextTick();
  scrollChatToBottom();
  setTimeout(async () => {
    const replies = presetReplies[agentId] || [];
    if (!chatHistory.value[agentId]) {
      chatHistory.value[agentId] = [];
    }
    if (replies.length > 0) {
      const randomIndex = Math.floor(Math.random() * replies.length);
      const replyText = replies[randomIndex];
      if (replyText) {
        chatHistory.value[agentId].push({
          from: "agent",
          text: replyText,
          time,
        });
      }
    }
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

  // 如果后端返回了退款审核备注,直接使用
  if ((vo as any).auditRemark) {
    auditRemark = (vo as any).auditRemark as string;
  }

  const order: Order = {
    id: vo.id,
    no: vo.orderNo,
    time: vo.createdAt,
    // 如果订单状态是退款中或已退款,映射为对应的订单基础状态
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
  };

  // 只有在有值时才添加可选属性
  if (refundStatus !== undefined) {
    order.refundStatus = refundStatus;
  }
  if (auditRemark !== undefined) {
    order.auditRemark = auditRemark;
  }

  return order;
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

.order-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px !important;
  font-size: 13px !important;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:not(:disabled):hover svg {
    transform: rotate(180deg);
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
.order-status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.refund-status-badge {
  font-family: "STKaiti", serif;
  font-weight: 600;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-dark);
  border: 1px solid rgba(212, 175, 55, 0.3);
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
.status-cancelled {
  color: var(--ink-light);
}
.status-refunding {
  color: var(--gold);
  animation: pulse 2s ease-in-out infinite;
}
.status-approved {
  color: var(--jade);
}
.status-processing {
  color: var(--cinnabar);
}
.status-refunded {
  color: var(--jade);
}
.status-rejected {
  color: var(--cinnabar);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
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

.refund-status-tip,
.refund-completed-tip,
.refund-rejected-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 13px;

  .tip-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .tip-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tip-text {
    color: var(--ink);
    font-weight: 500;
  }

  .tip-reason {
    color: var(--cinnabar);
    font-size: 12px;
    font-weight: 600;
  }
}

.refund-status-tip {
  background: linear-gradient(
      135deg,
      rgba(212, 175, 55, 0.1),
      rgba(212, 175, 55, 0.05)
  );
  border: 1px solid rgba(212, 175, 55, 0.3);

  .tip-text {
    color: var(--gold-dark);
  }
}

.refund-completed-tip {
  background: linear-gradient(
      135deg,
      rgba(93, 173, 126, 0.1),
      rgba(93, 173, 126, 0.05)
  );
  border: 1px solid rgba(93, 173, 126, 0.3);

  .tip-text {
    color: var(--jade-dark);
  }
}

.refund-rejected-tip {
  background: linear-gradient(
      135deg,
      rgba(214, 69, 65, 0.1),
      rgba(214, 69, 65, 0.05)
  );
  border: 1px solid rgba(214, 69, 65, 0.3);

  .tip-text {
    color: var(--cinnabar);
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
  .step-content {
    margin-bottom: 4px;
    line-height: 1.6;
  }
  .step-location {
    font-size: 13px;
    color: var(--ink-muted);
    margin-bottom: 4px;
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

// Empty logistics state
.empty-logistics {
  text-align: center;
  padding: 48px 24px;
  color: var(--ink-muted);
  p {
    margin: 8px 0;
    font-size: 14px;
  }
  .hint {
    font-size: 12px;
    opacity: 0.7;
  }
}

// Logistics status styles
.track-status {
  margin-top: 8px;
  font-size: 14px;
  span {
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 12px;
    display: inline-block;
    &.status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    &.status-shipped {
      background: #dbeafe;
      color: #1e40af;
    }
    &.status-transit {
      background: #e0e7ff;
      color: #3730a3;
    }
    &.status-signed {
      background: #d1fae5;
      color: #065f46;
    }
  }
}

// Refund modal
.refund-order-info {
  background: var(--paper-warm);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  .label {
    color: var(--ink-muted);
  }
  .value {
    color: var(--ink);
    font-weight: 500;
    &.highlight {
      color: var(--cinnabar);
      font-weight: 700;
      font-size: 18px;
    }
  }
}

.refund-form {
  .form-group {
    margin-bottom: 18px;
  }
  .form-label {
    display: block;
    font-size: 14px;
    color: var(--ink);
    font-weight: 600;
    margin-bottom: 8px;
    &.required::after {
      content: " *";
      color: var(--cinnabar);
    }
  }
  .radio-group {
    display: flex;
    gap: 20px;
  }
  .radio-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 14px;
    color: var(--ink);
    input[type="radio"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--jade);
    }
  }
  .input-with-prefix {
    display: flex;
    align-items: center;
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
    &:focus-within {
      border-color: var(--jade);
    }
    .prefix {
      padding: 0 12px;
      background: var(--paper-warm);
      color: var(--ink-muted);
      font-weight: 600;
      font-size: 14px;
      border-right: 1px solid var(--line);
    }
    input {
      flex: 1;
      border: none;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }
  }
  .form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--ink-muted);
  }
  .form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    background: white;
    cursor: pointer;
    &:focus {
      border-color: var(--jade);
    }
  }
  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    resize: vertical;
    transition: border-color 0.2s;
    &:focus {
      border-color: var(--jade);
    }
  }
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
