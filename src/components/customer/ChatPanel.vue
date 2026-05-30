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
                    <button class="btn" @click="emit('open-transfer')">
                        ↪ 转接
                    </button>
                    <button class="btn btn-cinnabar" @click="emit('open-end')">
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
                            >
                                <div class="ic">{{ m.meta.icon }}</div>
                                <div class="body">
                                    <div class="t">{{ m.text }}</div>
                                    <div class="s">{{ m.meta.desc }}</div>
                                    <div class="p">¥{{ m.meta.price }}</div>
                                </div>
                            </div>
                            <div
                                v-else-if="m.type === 'order' && m.meta"
                                class="card-msg"
                            >
                                <div class="ic">📦</div>
                                <div class="body">
                                    <div class="t">{{ m.text }}</div>
                                    <div class="s">{{ m.meta.status }}</div>
                                    <div class="p">¥{{ m.meta.amount }}</div>
                                </div>
                            </div>
                            <div v-else class="bubble">{{ m.text }}</div>
                        </div>
                    </template>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-toolbar">
                    <button
                        class="tool-btn"
                        @click="emit('open-product-picker')"
                    >
                        🛒 发商品
                    </button>
                    <button class="tool-btn" @click="emit('open-order-picker')">
                        📦 发订单
                    </button>
                    <button class="tool-btn">🖼 图片</button>
                    <button class="tool-btn">😊 表情</button>
                    <button class="tool-btn" @click="toggleQuickReplies">
                        ⚡ 常用语
                    </button>
                    <div v-show="showQuickReplies" class="quick-reply-list">
                        <span
                            v-for="(q, idx) in quickReplies"
                            :key="idx"
                            class="quick-reply-chip"
                            @click="useReply(q)"
                        >
                            {{ q }}
                        </span>
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

        <!-- 右侧：客户信息 -->
        <div class="col-card customer-info">
            <div class="cust-card">
                <div class="cust-head">
                    <div class="cust-avatar-big">
                        {{ currentSession?.avatar || "—" }}
                    </div>
                    <div class="cust-name">
                        {{ currentSession?.custName || "未选择" }}
                    </div>
                    <div class="cust-tags">
                        <span
                            v-for="tag in currentSession?.custTags || []"
                            :key="tag"
                            class="tag tag-jade"
                        >
                            {{ tag }}
                        </span>
                    </div>
                </div>
                <div class="cust-section">
                    <h5>基本资料</h5>
                    <div class="info-row">
                        <span>注册时间</span
                        ><span class="v">{{
                            currentSession?.custReg || "—"
                        }}</span>
                    </div>
                    <div class="info-row">
                        <span>所在地</span
                        ><span class="v">{{
                            currentSession?.custCity || "—"
                        }}</span>
                    </div>
                    <div class="info-row">
                        <span>累计消费</span
                        ><span class="v">{{
                            currentSession?.custSpent || "¥0"
                        }}</span>
                    </div>
                    <div class="info-row">
                        <span>累计订单</span
                        ><span class="v"
                            >{{ currentSession?.custOrderCount || 0 }} 单</span
                        >
                    </div>
                </div>
                <div
                    v-if="currentSession?.custCart?.length"
                    class="cust-section"
                >
                    <h5>
                        当前购物车
                        <span style="color: var(--cinnabar)"
                            >¥{{ currentSession.cartTotal }}</span
                        >
                    </h5>
                    <div
                        v-for="item in currentSession.custCart"
                        :key="item.name"
                        class="mini-product"
                    >
                        <span class="ic">{{ item.icon }}</span>
                        <div style="flex: 1">
                            {{ item.name }}
                            <span class="qty">×{{ item.qty }}</span>
                        </div>
                        <div>¥{{ item.price }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
    ApiCustomer,
    type CustomerSession,
    type CustomerMessage,
} from "@/network/customer";
import { customerWS } from "@/network/customer.ws";
import { ElMessage } from "element-plus";

interface Session extends CustomerSession {
    // 扩展类型以兼容现有代码
}

const emit = defineEmits<{
    "switch-to-queue": [];
    "open-transfer": [];
    "open-end": [];
    "open-product-picker": [];
    "open-order-picker": [];
}>();

const sessions = ref<Session[]>([]);
const currentSessionId = ref("");
const inputText = ref("");
const showQuickReplies = ref(false);
const chatBodyRef = ref<HTMLElement>();
const loading = ref(false);

const quickReplies = [
    "满 88 元包邮，江浙沪次日达",
    "质量问题 7 天无理由退换",
    "具体可看商品详情页的功效说明",
    "建议您先做一次体质测试再选购",
    "这款适合气血不足、手脚冰凉的朋友",
];

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
    return m.from === "me" ? "翠" : currentSession.value?.avatar || "客";
}

function getMeta(m: CustomerMessage): string {
    return m.from === "me" ? "我" : currentSession.value?.custName || "客户";
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

                // 如果当前不是这个会话，增加未读数
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

watch(currentSessionId, () => {
    setTimeout(() => {
        if (chatBodyRef.value) {
            chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
        }
    }, 100);
});

onMounted(async () => {
    await loadSessions();

    // 连接WebSocket
    await customerWS.connect();

    // 注册消息处理器
    customerWS.onMessage(handleWSMessage);
});

onUnmounted(() => {
    // 组件卸载时不断开连接，由页面级别管理
});
</script>

<style scoped lang="scss">
.chat-layout {
    display: grid;
    grid-template-columns: 260px 1fr 280px;
    gap: 14px;
    height: calc(100vh - 64px - 48px);
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
    font-size: 13px;

    .count {
        color: var(--cinnabar);
        font-weight: 600;
    }
}

.tool-btn {
    background: transparent;
    border: 1px solid var(--line);
    padding: 4px 10px;
    font-size: 12px;
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
    font-size: 14px;
    font-weight: 600;
}

.session-time {
    font-size: 11px;
    color: var(--ink-muted);
}

.session-msg {
    font-size: 12px;
    color: var(--ink-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 4px;
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

.unread-dot {
    background: var(--cinnabar);
    color: white;
    font-size: 10px;
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
            font-size: 16px;
            font-weight: 600;
            margin: 0;
        }

        .meta {
            font-size: 12px;
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

.chat-banner {
    padding: 8px 18px;
    background: var(--jade-soft);
    color: var(--jade);
    font-size: 12px;
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
        font-size: 11px;
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
    font-size: 13px;
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
    font-size: 11px;
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
    font-size: 14px;
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

    .ic {
        width: 48px;
        height: 48px;
        background: var(--cream);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
    }

    .body {
        flex: 1;
        min-width: 0;

        .t {
            font-size: 13px;
            font-weight: 600;
        }

        .s {
            font-size: 11px;
            color: var(--ink-muted);
            margin-top: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .p {
            font-size: 14px;
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
    font-size: 13px;
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
    font-size: 14px;
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
    font-size: 11px;
    color: var(--ink-muted);
}

.send-btn {
    background: var(--cinnabar);
    color: white;
    border: none;
    padding: 6px 18px;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;

    &:hover {
        background: #9c3325;
    }
}

.cust-card {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.cust-head {
    text-align: center;
    padding-bottom: 14px;
    border-bottom: 1px dashed var(--line);
    margin-bottom: 14px;
}

.cust-avatar-big {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--jade-pale);
    color: var(--jade);
    font-family: "STKaiti", serif;
    font-weight: 700;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
}

.cust-name {
    font-family: "STKaiti", serif;
    font-size: 16px;
    font-weight: 600;
}

.cust-tags {
    margin-top: 6px;
}

.tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 3px;
    font-family: "STKaiti", serif;
    margin: 0 2px;

    &.tag-jade {
        background: var(--jade-soft);
        color: var(--jade);
    }
}

.cust-section {
    margin-bottom: 16px;

    h5 {
        font-family: "STKaiti", serif;
        font-size: 13px;
        font-weight: 600;
        color: var(--ink-muted);
        margin-bottom: 8px;
    }
}

.info-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 4px 0;
    color: var(--ink-light);

    .v {
        color: var(--ink);
        font-weight: 500;
    }
}

.mini-product {
    display: flex;
    gap: 8px;
    padding: 6px;
    background: var(--paper-warm);
    border-radius: 6px;
    margin-bottom: 6px;
    align-items: center;
    font-size: 12px;

    .ic {
        font-size: 18px;
    }

    .qty {
        color: var(--cinnabar);
        font-weight: 600;
    }
}
</style>
