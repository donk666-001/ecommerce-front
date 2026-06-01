<template>
    <div class="chat-layout">
        <!-- 左侧：会话列表 -->
        <div class="col-card session-list-card">
            <div class="session-head">
                <span
                    >接待中
                    <span class="count">{{ sessions.length }} / 5</span></span
                >
                <button class="tool-btn" @click="emit('switch-to-queue')">
                    从队列接入
                </button>
            </div>
            <div class="session-list">
                <div
                    v-for="s in sessions"
                    :key="s.id"
                    class="session-item"
                    :class="{ active: currentSessionId === s.id }"
                    @click="switchSession(s.id)"
                >
                    <div class="session-avatar">{{ s.avatar }}</div>
                    <div class="session-body">
                        <div class="session-top">
                            <div class="session-name">{{ s.custName }}</div>
                            <div class="session-time">
                                {{ formatDuration(s.startedAt) }}
                            </div>
                        </div>
                        <div>
                            <span
                                class="session-tag"
                                :class="getSourceTagClass(s.sourceTag)"
                            >
                                {{ s.source }}
                            </span>
                        </div>
                        <div class="session-msg">{{ s.lastMsg }}</div>
                    </div>
                    <div v-if="s.unread > 0" class="unread-dot">
                        {{ s.unread }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 中间：聊天区 -->
        <div class="col-card chat-center">
            <div class="chat-head">
                <div class="session-avatar">
                    {{ currentSession?.avatar || "—" }}
                </div>
                <div class="who">
                    <h4>{{ currentSession?.custName || "未选择" }}</h4>
                    <div class="meta">
                        会话开始于 {{ getTimeAgo(currentSession?.startedAt) }} ·
                        来源：{{ currentSession?.source || "—" }}
                    </div>
                </div>
                <div class="chat-head-actions">
                    <button
                        class="btn btn-cinnabar"
                        @click="showEndConfirm = true"
                    >
                        ✓ 结束接待
                    </button>
                </div>
            </div>
            <div class="chat-banner">
                🔒 该客户已锁定到您的会话 · 其他客服无法接管 · 30
                分钟无消息自动释放
            </div>
            <div class="chat-body" ref="chatBodyRef">
                <div
                    v-for="(m, idx) in currentSession?.messages || []"
                    :key="idx"
                    class="msg"
                    :class="getMessageClass(m)"
                >
                    <div v-if="m.from === 'sys'" class="msg sys">
                        {{ m.text }}
                    </div>
                    <template v-else>
                        <div class="msg-avatar">{{ getAvatar(m) }}</div>
                        <div class="msg-body">
                            <div class="msg-meta">
                                {{ getMeta(m) }} · {{ m.time }}
                            </div>
                            <div
                                v-if="m.type === 'product' && m.meta"
                                class="card-msg"
                                :class="{ 'card-link': m.meta.productId }"
                                :title="
                                    m.meta.productId ? '点击查看商品详情' : ''
                                "
                                @click="
                                    m.meta.productId &&
                                    openShopProduct(m.meta.productId)
                                "
                            >
                                <div class="ic">{{ m.meta.icon }}</div>
                                <div class="body">
                                    <div class="t">{{ m.text }}</div>
                                    <div class="s">{{ m.meta.desc }}</div>
                                    <div class="p">¥{{ m.meta.price }}</div>
                                </div>
                                <span v-if="m.meta.productId" class="card-goto"
                                    >↗</span
                                >
                            </div>
                            <div
                                v-else-if="m.type === 'order' && m.meta"
                                class="card-msg"
                                :class="{ 'card-link': m.meta.orderId }"
                                :title="
                                    m.meta.orderId ? '点击查看订单详情' : ''
                                "
                                @click="
                                    m.meta.orderId &&
                                    openShopOrder(m.meta.orderId)
                                "
                            >
                                <div class="ic">📦</div>
                                <div class="body">
                                    <div class="t">
                                        {{ m.meta.orderId || m.text }}
                                    </div>
                                    <div class="s">
                                        {{
                                            m.meta.desc
                                                ? `${m.meta.desc} · ${m.meta.status}`
                                                : m.meta.status
                                        }}
                                    </div>
                                    <div class="p">¥{{ m.meta.amount }}</div>
                                </div>
                                <span v-if="m.meta.orderId" class="card-goto"
                                    >↗</span
                                >
                            </div>
                            <div
                                v-else-if="
                                    m.type === 'image' && m.meta?.imageUrl
                                "
                                class="img-msg"
                            >
                                <img
                                    :src="m.meta.imageUrl"
                                    class="chat-img"
                                    alt="图片"
                                    @click="openFullImage(m.meta.imageUrl)"
                                />
                            </div>
                            <div v-else class="bubble">{{ m.text }}</div>
                        </div>
                    </template>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-toolbar">
                    <button class="tool-btn" @click="openProductPicker">
                        发商品
                    </button>
                    <button class="tool-btn" @click="openOrderPicker">
                        发订单
                    </button>
                    <button class="tool-btn" @click="openImagePicker">
                        图片
                    </button>
                    <input
                        ref="imageInputRef"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleImageSelect"
                    />
                    <button class="tool-btn" @click.stop="toggleEmojiPicker">
                        表情
                    </button>
                    <button class="tool-btn" @click="toggleQuickReplies">
                        常用语
                    </button>

                    <!-- 表情弹窗 -->
                    <div
                        v-show="showEmojiPicker"
                        class="emoji-picker"
                        @click.stop
                    >
                        <span
                            v-for="e in emojiList"
                            :key="e"
                            class="emoji-item"
                            @click="insertEmoji(e)"
                            >{{ e }}</span
                        >
                    </div>

                    <!-- 常用语列表 -->
                    <div v-show="showQuickReplies" class="quick-reply-list">
                        <span
                            v-for="(q, idx) in quickReplies"
                            :key="idx"
                            class="quick-reply-chip"
                            @click="useReply(q)"
                            >{{ q }}</span
                        >
                    </div>
                </div>
                <textarea
                    v-model="inputText"
                    class="chat-input"
                    placeholder="输入消息，Enter 发送，Shift+Enter 换行"
                    @keydown="handleKeydown"
                ></textarea>
                <div class="send-row">
                    <span>当前客户在线 · 已读最新消息</span>
                    <button class="send-btn" @click="sendMessage">发送</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 发商品弹窗 -->
    <Teleport to="body">
        <Transition name="mask-fade">
            <div
                v-if="showProductPicker"
                class="picker-mask"
                @click.self="showProductPicker = false"
            >
                <div class="picker-dialog">
                    <div class="picker-header">
                        <div class="picker-header-left">
                            <span class="picker-accent"></span>
                            <span class="picker-title">发送商品</span>
                        </div>
                        <button
                            class="picker-close"
                            @click="showProductPicker = false"
                        >
                            ✕
                        </button>
                    </div>
                    <div class="picker-search">
                        <input
                            v-model="productKeyword"
                            class="picker-input"
                            placeholder="搜索商品名称..."
                            @input="searchProducts"
                        />
                    </div>
                    <div class="picker-body">
                        <div v-if="productLoading" class="picker-empty">
                            搜索中…
                        </div>
                        <div
                            v-else-if="productList.length === 0"
                            class="picker-empty"
                        >
                            暂无商品
                        </div>
                        <div v-else class="picker-product-list">
                            <div
                                v-for="p in productList"
                                :key="p.id"
                                class="picker-product-item"
                                @click="sendProduct(p)"
                            >
                                <div class="ppi-icon">{{ p.icon }}</div>
                                <div class="ppi-info">
                                    <div class="ppi-name">{{ p.name }}</div>
                                    <div class="ppi-desc">{{ p.desc }}</div>
                                </div>
                                <div class="ppi-price">¥{{ p.price }}</div>
                                <button class="ppi-send">发送</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- 发订单弹窗 -->
    <Teleport to="body">
        <Transition name="mask-fade">
            <div
                v-if="showOrderPicker"
                class="picker-mask"
                @click.self="showOrderPicker = false"
            >
                <div class="picker-dialog">
                    <div class="picker-header">
                        <div class="picker-header-left">
                            <span class="picker-accent"></span>
                            <span class="picker-title">
                                发送订单
                                <span class="picker-subtitle"
                                    >·
                                    {{ currentSession?.custName }} 的订单</span
                                >
                            </span>
                        </div>
                        <button
                            class="picker-close"
                            @click="showOrderPicker = false"
                        >
                            ✕
                        </button>
                    </div>
                    <div class="picker-body">
                        <div v-if="orderLoading" class="picker-empty">
                            加载中…
                        </div>
                        <div
                            v-else-if="orderList.length === 0"
                            class="picker-empty"
                        >
                            该客户暂无订单
                        </div>
                        <div v-else class="picker-order-list">
                            <div
                                v-for="o in orderList"
                                :key="o.id"
                                class="picker-order-item"
                                @click="sendOrder(o)"
                            >
                                <div class="poi-icon">📦</div>
                                <div class="poi-info">
                                    <div class="poi-id">{{ o.id }}</div>
                                    <div class="poi-name">
                                        {{ o.productName }} · {{ o.date }}
                                    </div>
                                </div>
                                <div class="poi-right">
                                    <div class="poi-amount">
                                        ¥{{ o.amount }}
                                    </div>
                                    <div
                                        class="poi-status"
                                        :class="`poi-${getOrderStatusClass(o.status)}`"
                                    >
                                        {{ o.status }}
                                    </div>
                                </div>
                                <button class="ppi-send">发送</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- 结束接待二次确认弹窗 -->
    <Teleport to="body">
        <Transition name="mask-fade">
            <div
                v-if="showEndConfirm"
                class="end-mask"
                @click.self="showEndConfirm = false"
            >
                <div class="end-dialog">
                    <div class="end-dialog-title">确认结束接待</div>
                    <div class="end-dialog-body">
                        即将结束与
                        <strong>{{ currentSession?.custName }}</strong>
                        的会话，数据将同步到历史记录。
                    </div>
                    <div class="end-dialog-actions">
                        <button
                            class="end-cancel-btn"
                            @click="showEndConfirm = false"
                        >
                            取消
                        </button>
                        <button class="end-confirm-btn" @click="confirmEnd">
                            确认结束
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
    ApiCustomer,
    type CustomerSession,
    type CustomerMessage,
    type HistorySession,
} from "@/network/customer";
import { useQuickReplies } from "@/composables/useQuickReplies";
import { customerWS } from "@/network/customer.ws";
import { ElMessage } from "element-plus";

interface Session extends CustomerSession {
    // 扩展类型以兼容现有代码
}

const props = defineProps<{ agentName?: string; agentId?: string }>();

const emit = defineEmits<{
    "switch-to-queue": [];
    "count-update": [count: number];
    "session-ended": [record: HistorySession];
}>();

const sessions = ref<Session[]>([]);
const currentSessionId = ref("");
const inputText = ref("");
const showQuickReplies = ref(false);
const showEmojiPicker = ref(false);
const showEndConfirm = ref(false);
const chatBodyRef = ref<HTMLElement>();
const imageInputRef = ref<HTMLInputElement>();
const loading = ref(false);

// 发商品
const showProductPicker = ref(false);
const productKeyword = ref("");
const productList = ref<
    Array<{
        id: string;
        name: string;
        icon: string;
        price: number;
        desc: string;
    }>
>([]);
const productLoading = ref(false);

// 发订单
const showOrderPicker = ref(false);
const orderList = ref<
    Array<{
        id: string;
        productName: string;
        custName: string;
        amount: number;
        status: string;
        date: string;
    }>
>([]);
const orderLoading = ref(false);

// 表情
const emojiList = [
    "😊",
    "😂",
    "🥺",
    "😍",
    "😭",
    "😅",
    "😉",
    "🤔",
    "😎",
    "🥳",
    "😆",
    "😋",
    "😜",
    "😇",
    "🤩",
    "😢",
    "😡",
    "😤",
    "🤗",
    "😴",
    "👍",
    "👎",
    "👏",
    "🙌",
    "🙏",
    "💪",
    "🤝",
    "❤️",
    "💕",
    "💔",
    "🎉",
    "✨",
    "🌸",
    "🍀",
    "⭐",
    "🔥",
    "💯",
    "🎊",
    "🌺",
    "🎁",
];

// 客服回复后等待客户消息的起始时间（客户5分钟无回复自动结束）
const waitingForCustomerSince = new Map<string, number>();
let customerTimeoutInterval: ReturnType<typeof setInterval>;

const { quickReplies } = useQuickReplies();

const currentSession = computed(() =>
    sessions.value.find((s) => s.id === currentSessionId.value),
);

async function loadSessions() {
    loading.value = true;
    try {
        const data = await ApiCustomer.getSessions();
        sessions.value = data as any;
        if (data.length > 0 && !currentSessionId.value) {
            currentSessionId.value = data[0]?.id || "";
        }
        emit("count-update", sessions.value.length);
    } catch (error) {
        console.error("加载会话列表失败:", error);
        ElMessage.error("加载会话列表失败");
    } finally {
        loading.value = false;
    }
}

function switchSession(id: string) {
    currentSessionId.value = id;
    const s = sessions.value.find((x) => x.id === id);
    if (s) s.unread = 0;
}

function selectSession(id: string) {
    currentSessionId.value = id;
    const s = sessions.value.find((x) => x.id === id);
    if (s) s.unread = 0;
}

function formatDuration(startedAt: string): string {
    const minutes = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 60000,
    );
    return `${minutes}m`;
}

function getTimeAgo(dateStr?: string): string {
    if (!dateStr) return "—";
    const minutes = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 60000,
    );
    return `${minutes}分钟前`;
}

function getSourceTagClass(tag: string): string {
    const map: Record<string, string> = {
        product: "tag-product",
        order: "tag-order",
        general: "",
    };
    return map[tag] || "";
}

function getMessageClass(m: CustomerMessage): string {
    return m.from === "me" ? "me" : m.from === "customer" ? "customer" : "";
}

function getAvatar(m: CustomerMessage): string {
    const myAvatar = (props.agentName || "我").slice(-1);
    return m.from === "me" ? myAvatar : currentSession.value?.avatar || "客";
}

function getMeta(m: CustomerMessage): string {
    return m.from === "me"
        ? props.agentName || "我"
        : currentSession.value?.custName || "客户";
}

async function confirmEnd() {
    if (!currentSession.value) return;
    try {
        const success = await ApiCustomer.endSession(currentSession.value.id);
        if (success) {
            endSession(currentSession.value, "manual");
            showEndConfirm.value = false;
            ElMessage.success("会话已结束");
        } else {
            ElMessage.error("操作失败");
        }
    } catch (error) {
        console.error("结束会话失败:", error);
        ElMessage.error("操作失败");
    }
}

function endSession(session: Session, reason: "manual" | "timeout") {
    const record = buildHistoryRecord(session, reason);
    emit("session-ended", record);
    waitingForCustomerSince.delete(session.id);
    sessions.value = sessions.value.filter((s) => s.id !== session.id);
    if (currentSessionId.value === session.id) {
        currentSessionId.value = sessions.value[0]?.id || "";
    }
    emit("count-update", sessions.value.length);
}

function buildHistoryRecord(
    session: Session,
    reason: "manual" | "timeout",
): HistorySession {
    const now = new Date();
    const start = new Date(session.startedAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return {
        id: `${session.id}_${now.getTime()}`,
        custId: session.custId,
        custName: session.custName,
        agentId: props.agentId || "CS001",
        agentName: props.agentName || "客服",
        msgCount: session.messages.filter((m) => m.from !== "sys").length,
        startTime: fmt(start),
        endTime: fmt(now),
        endReason: reason,
    };
}

// 客服发消息后开始等待客户回复（5分钟无回复自动结束）
function markWaitingForCustomer(sessionId: string) {
    waitingForCustomerSince.set(sessionId, Date.now());
}

// 客户发消息，重置等待计时
function markCustomerReplied(sessionId: string) {
    waitingForCustomerSince.delete(sessionId);
}

function checkCustomerTimeouts() {
    const TIMEOUT = 5 * 60 * 1000;
    const now = Date.now();
    const timedOut = sessions.value.filter((s) => {
        const since = waitingForCustomerSince.get(s.id);
        return since !== undefined && now - since > TIMEOUT;
    });
    timedOut.forEach((s) => {
        endSession(s, "timeout");
        ElMessage.info(`${s.custName} 超过5分钟未回复，会话已自动结束`);
    });
}

function injectSession(session: CustomerSession) {
    sessions.value.unshift(session as any);
    currentSessionId.value = session.id;
    emit("count-update", sessions.value.length);
}

function toggleQuickReplies() {
    showQuickReplies.value = !showQuickReplies.value;
}

function useReply(text: string) {
    inputText.value = text;
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const text = inputText.value.trim();
    if (!text || !currentSession.value) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    try {
        const success = await ApiCustomer.sendMessage(
            currentSession.value.id,
            text,
        );
        if (success) {
            currentSession.value.messages.push({ from: "me", text, time });
            currentSession.value.lastMsg = text;
            markWaitingForCustomer(currentSession.value.id);
            inputText.value = "";

            // 通过WebSocket发送消息
            customerWS.send({
                type: "send_message",
                sessionId: currentSession.value.id,
                message: { text, time },
            });
        } else {
            ElMessage.error("发送失败");
        }
    } catch (error) {
        console.error("发送消息失败:", error);
        ElMessage.error("发送消息失败");
    }
}

// WebSocket消息处理
function handleWSMessage(data: any) {
    console.log("[ChatPanel] 收到WS消息:", data);

    switch (data.type) {
        case "new_message":
            // 收到新消息
            const session = sessions.value.find((s) => s.id === data.sessionId);
            if (session) {
                session.messages.push(data.message);
                session.lastMsg = data.message.text;
                if (data.message.from === "customer") {
                    markCustomerReplied(data.sessionId);
                }
                if (currentSessionId.value !== data.sessionId) {
                    session.unread++;
                }
            }
            break;

        case "session_assigned":
            // 分配新会话
            ElMessage.info(`新会话分配: ${data.session.custName}`);
            loadSessions();
            break;
    }
}

watch(
    () => sessions.value.length,
    (count) => emit("count-update", count),
);

watch(currentSessionId, () => {
    setTimeout(() => {
        if (chatBodyRef.value) {
            chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
        }
    }, 100);
});

const closePopups = () => {
    showEmojiPicker.value = false;
};

onMounted(async () => {
    await loadSessions();
    await customerWS.connect();
    customerWS.onMessage(handleWSMessage);
    customerTimeoutInterval = setInterval(checkCustomerTimeouts, 30 * 1000);
    document.addEventListener("click", closePopups);
});

onUnmounted(() => {
    clearInterval(customerTimeoutInterval);
    document.removeEventListener("click", closePopups);
});

function scrollToBottom() {
    setTimeout(() => {
        if (chatBodyRef.value)
            chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }, 50);
}

// ── 发商品 ──
async function openProductPicker() {
    if (!currentSession.value) {
        ElMessage.warning("请先选择一个会话");
        return;
    }
    showProductPicker.value = true;
    productKeyword.value = "";
    await searchProducts();
}

async function searchProducts() {
    productLoading.value = true;
    try {
        productList.value = await ApiCustomer.searchProducts(
            productKeyword.value,
        );
    } finally {
        productLoading.value = false;
    }
}

async function sendProduct(p: (typeof productList.value)[0]) {
    if (!currentSession.value) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const ok = await ApiCustomer.sendMessage(
        currentSession.value.id,
        `[商品] ${p.name}`,
    );
    if (ok) {
        currentSession.value.messages.push({
            from: "me",
            text: p.name,
            time,
            type: "product",
            meta: {
                icon: p.icon,
                desc: p.desc,
                price: p.price,
                productId: p.id,
            },
        });
        currentSession.value.lastMsg = `[商品] ${p.name}`;
        markWaitingForCustomer(currentSession.value.id);
        showProductPicker.value = false;
        scrollToBottom();
    }
}

// ── 发订单 ──
async function openOrderPicker() {
    if (!currentSession.value) {
        ElMessage.warning("请先选择一个会话");
        return;
    }
    showOrderPicker.value = true;
    orderLoading.value = true;
    try {
        const custName = currentSession.value.custName;
        orderList.value = (await ApiCustomer.searchOrders(custName)) as any;
    } finally {
        orderLoading.value = false;
    }
}

async function sendOrder(o: (typeof orderList.value)[0]) {
    if (!currentSession.value) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const ok = await ApiCustomer.sendMessage(
        currentSession.value.id,
        `[订单] ${o.id}`,
    );
    if (ok) {
        currentSession.value.messages.push({
            from: "me",
            text: o.id,
            time,
            type: "order",
            meta: {
                orderId: o.id,
                desc: o.productName,
                status: o.status,
                amount: o.amount,
            },
        });
        currentSession.value.lastMsg = `[订单] ${o.id}`;
        markWaitingForCustomer(currentSession.value.id);
        showOrderPicker.value = false;
        scrollToBottom();
    }
}

function getOrderStatusClass(status: string) {
    const map: Record<string, string> = {
        待付款: "pending",
        已发货: "shipped",
        运输中: "transit",
        已签收: "delivered",
    };
    return map[status] || "";
}

// ── 表情 ──
function toggleEmojiPicker() {
    showEmojiPicker.value = !showEmojiPicker.value;
    if (showEmojiPicker.value) showQuickReplies.value = false;
}

function insertEmoji(emoji: string) {
    inputText.value += emoji;
    showEmojiPicker.value = false;
}

function openShopProduct(productId: string) {
    window.open(`/shop?open=${productId}`, "_blank");
}

function openShopOrder(orderId: string) {
    window.open(`/shop?order=${orderId}`, "_blank");
}

function openImagePicker() {
    if (!currentSession.value) {
        ElMessage.warning("请先选择一个会话");
        return;
    }
    imageInputRef.value?.click();
}

function openFullImage(url: string) {
    window.open(url, "_blank");
}

function handleImageSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !currentSession.value) return;

    const imageUrl = URL.createObjectURL(file);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    currentSession.value.messages.push({
        from: "me",
        text: file.name,
        time,
        type: "image",
        meta: { imageUrl },
    });
    currentSession.value.lastMsg = "[图片]";
    markWaitingForCustomer(currentSession.value.id);

    // 重置 input，允许重复选同一文件
    input.value = "";

    setTimeout(() => {
        if (chatBodyRef.value) {
            chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
        }
    }, 50);
}

defineExpose({ loadSessions, selectSession, injectSession });
</script>

<style scoped lang="scss">
.chat-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 14px;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
}

.col-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.session-head {
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 17px;

    .count {
        color: var(--cinnabar);
        font-weight: 600;
    }
}

.tool-btn {
    background: transparent;
    border: 1px solid var(--line);
    padding: 4px 10px;
    font-size: 17px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--ink-light);
    font-family: inherit;

    &:hover {
        border-color: var(--jade);
        color: var(--jade);
    }
}

.session-list {
    flex: 1;
    overflow-y: auto;
}

.session-item {
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    display: flex;
    gap: 10px;
    transition: background 0.15s;

    &:hover {
        background: var(--cream);
    }

    &.active {
        background: var(--jade-soft);
        border-left: 3px solid var(--jade);
        padding-left: 11px;
    }
}

.session-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--jade-pale);
    color: var(--jade);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "STKaiti", serif;
    font-weight: 600;
    flex-shrink: 0;
}

.session-body {
    flex: 1;
    min-width: 0;
}

.session-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.session-name {
    font-size: 17px;
    font-weight: 600;
}

.session-time {
    font-size: 17px;
    color: var(--ink-muted);
}

.session-msg {
    font-size: 17px;
    color: var(--ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 4px;
}

.session-tag {
    display: inline-block;
    font-size: 12px;
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

.unread-dot {
    background: var(--cinnabar);
    color: white;
    font-size: 12px;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    font-weight: 700;
}

.chat-head {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    gap: 12px;

    .who {
        flex: 1;

        h4 {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }

        .meta {
            font-size: 17px;
            color: var(--ink-muted);
        }
    }
}

.chat-head-actions {
    display: flex;
    gap: 8px;
}

.btn {
    border: 1px solid var(--line);
    background: white;
    padding: 6px 14px;
    font-size: 17px;
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

.chat-banner {
    padding: 8px 18px;
    background: var(--jade-soft);
    color: var(--jade);
    font-size: 17px;
    border-bottom: 1px solid var(--line);
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: var(--paper-warm);
}

.msg {
    display: flex;
    gap: 10px;
    max-width: 70%;

    &.me {
        align-self: flex-end;
        flex-direction: row-reverse;
    }

    &.sys {
        align-self: center;
        font-size: 17px;
        color: var(--ink-muted);
        background: rgba(0, 0, 0, 0.04);
        padding: 4px 12px;
        border-radius: 10px;
        max-width: none;
    }
}

.msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 17px;
    background: var(--jade-pale);
    color: var(--jade);
}

.me .msg-avatar {
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    color: white;
}

.msg-body {
    min-width: 0;
}

.msg-meta {
    font-size: 17px;
    color: var(--ink-muted);
    margin-bottom: 4px;
    padding: 0 4px;
}

.me .msg-meta {
    text-align: right;
}

.bubble {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 17px;
    line-height: 1.5;
    word-break: break-word;
}

.customer .bubble {
    background: white;
    border: 1px solid var(--line);
    border-top-left-radius: 4px;
}

.me .bubble {
    background: var(--jade);
    color: white;
    border-top-right-radius: 4px;
}

.card-msg {
    background: white;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    gap: 10px;
    width: 240px;
    position: relative;

    &.card-link {
        cursor: pointer;
        transition:
            border-color 0.15s,
            box-shadow 0.15s;

        &:hover {
            border-color: var(--jade);
            box-shadow: 0 2px 10px rgba(92, 131, 116, 0.18);
        }
    }

    .ic {
        width: 48px;
        height: 48px;
        background: var(--cream);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        flex-shrink: 0;
    }

    .card-goto {
        position: absolute;
        top: 6px;
        right: 8px;
        font-size: 12px;
        color: var(--jade);
        opacity: 0.6;
    }

    .body {
        flex: 1;
        min-width: 0;

        .t {
            font-size: 17px;
            font-weight: 600;
        }

        .s {
            font-size: 17px;
            color: var(--ink-muted);
            margin-top: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .p {
            font-size: 17px;
            color: var(--cinnabar);
            font-family: "STKaiti", serif;
            font-weight: 600;
            margin-top: 4px;
        }
    }
}

.chat-input-area {
    border-top: 1px solid var(--line);
    padding: 10px 14px;
    background: white;
}

.chat-toolbar {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
    flex-wrap: wrap;
    position: relative;
}

.quick-reply-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    margin-top: 4px;
}

.quick-reply-chip {
    background: var(--cream);
    border: 1px solid var(--line);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 17px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        border-color: var(--jade);
        background: var(--jade-soft);
    }
}

.chat-input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 17px;
    resize: none;
    height: 70px;
    font-family: inherit;
    outline: none;
    background: var(--paper-warm);

    &:focus {
        border-color: var(--jade);
        background: white;
    }
}

.send-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
    font-size: 17px;
    color: var(--ink-muted);
}

.send-btn {
    background: var(--cinnabar);
    color: white;
    border: none;
    padding: 6px 18px;
    font-size: 17px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;

    &:hover {
        background: #9c3325;
    }
}

/* 结束接待确认弹窗 */
.end-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9000;
}

.end-dialog {
    background: white;
    border-radius: 16px;
    padding: 28px 32px;
    width: 360px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.end-dialog-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 12px;
}

.end-dialog-body {
    font-size: 17px;
    color: var(--ink-light);
    line-height: 1.7;
    margin-bottom: 24px;

    strong {
        color: var(--ink);
    }
}

.end-dialog-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.end-cancel-btn,
.end-confirm-btn {
    padding: 8px 22px;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
}

.end-cancel-btn {
    border: 1px solid var(--line);
    background: white;
    color: var(--ink-muted);

    &:hover {
        border-color: var(--ink-muted);
        color: var(--ink);
    }
}

.end-confirm-btn {
    border: none;
    background: var(--cinnabar);
    color: white;
    font-weight: 600;

    &:hover {
        background: #9c3325;
    }
}

.mask-fade-enter-active,
.mask-fade-leave-active {
    transition: opacity 0.2s ease;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
    opacity: 0;
}

/* ── 表情弹窗 ── */
.emoji-picker {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 0;
    background: white;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    width: 300px;
    z-index: 200;
    box-shadow: 0 6px 24px rgba(30, 25, 15, 0.14);
}

.emoji-item {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s;

    &:hover {
        background: var(--cream);
    }
}

/* ── 发商品 / 发订单 公共弹窗 ── */
.picker-mask {
    position: fixed;
    inset: 0;
    background: rgba(30, 25, 15, 0.36);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9000;
    backdrop-filter: blur(2px);
}

.picker-dialog {
    background: var(--paper);
    border-radius: 18px;
    width: 520px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(30, 25, 15, 0.18);
}

.picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(135deg, var(--jade-pale), #eef5ec);
    flex-shrink: 0;
}

.picker-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.picker-accent {
    width: 4px;
    height: 18px;
    background: var(--jade);
    border-radius: 2px;
    flex-shrink: 0;
}

.picker-title {
    font-family: "STKaiti", serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
}

.picker-subtitle {
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    color: var(--ink-muted);
}

.picker-close {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    color: var(--ink-muted);
    transition: all 0.15s;

    &:hover {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }
}

.picker-search {
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
}

.picker-input {
    width: 100%;
    border: 1.5px solid var(--line);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 15px;
    font-family: inherit;
    outline: none;
    background: white;
    box-sizing: border-box;
    transition: border-color 0.15s;

    &:focus {
        border-color: var(--jade);
    }

    &::placeholder {
        color: var(--ink-muted);
    }
}

.picker-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
}

.picker-empty {
    text-align: center;
    padding: 40px;
    font-size: 15px;
    color: var(--ink-muted);
}

/* 商品列表 */
.picker-product-list {
    display: flex;
    flex-direction: column;
}

.picker-product-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.14s;

    &:hover {
        background: var(--jade-soft);

        .ppi-send {
            opacity: 1;
        }
    }
}

.ppi-icon {
    width: 44px;
    height: 44px;
    background: var(--cream);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
}

.ppi-info {
    flex: 1;
    min-width: 0;
}

.ppi-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
}

.ppi-desc {
    font-size: 13px;
    color: var(--ink-muted);
    margin-top: 2px;
}

.ppi-price {
    font-size: 16px;
    color: var(--cinnabar);
    font-family: "STKaiti", serif;
    font-weight: 600;
    flex-shrink: 0;
}

.ppi-send {
    padding: 6px 14px;
    background: var(--jade);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.14s;
    flex-shrink: 0;
}

/* 订单列表 */
.picker-order-list {
    display: flex;
    flex-direction: column;
}

.picker-order-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 1px solid var(--line);
    transition: background 0.14s;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: var(--jade-soft);

        .ppi-send {
            opacity: 1;
        }
    }
}

.poi-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.poi-info {
    flex: 1;
    min-width: 0;
}

.poi-id {
    font-size: 14px;
    font-family: monospace;
    color: var(--ink);
    font-weight: 600;
}

.poi-name {
    font-size: 13px;
    color: var(--ink-muted);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.poi-right {
    text-align: right;
    flex-shrink: 0;
}

.poi-amount {
    font-size: 16px;
    color: var(--cinnabar);
    font-family: "STKaiti", serif;
    font-weight: 600;
}

.poi-status {
    font-size: 12px;
    margin-top: 2px;
    padding: 1px 6px;
    border-radius: 3px;
    display: inline-block;

    &.poi-pending {
        background: #fff3e0;
        color: #ef6c00;
    }
    &.poi-shipped {
        background: #e3f2fd;
        color: #1565c0;
    }
    &.poi-transit {
        background: var(--gold-soft);
        color: var(--gold);
    }
    &.poi-delivered {
        background: var(--jade-soft);
        color: var(--jade);
    }
}

.img-msg {
    max-width: 240px;
}

.chat-img {
    max-width: 240px;
    max-height: 200px;
    border-radius: 8px;
    display: block;
    cursor: pointer;
    border: 1px solid var(--line);
    transition: opacity 0.15s;

    &:hover {
        opacity: 0.88;
    }
}
</style>
