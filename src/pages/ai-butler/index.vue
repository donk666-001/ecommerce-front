<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="hub">
            <section class="hero">
                <div class="hero-text">
                    <div class="hero-label">
                        AI WELLNESS STEWARD · 私人养生 AI 助理
                    </div>
                    <h1 class="font-serif">AI 管家</h1>
                    <p class="hero-sub">
                        {{ greetingName }}，{{ currentSolarTermName }}快乐。
                        <strong style="color: var(--jade)"
                            >答养生疑问、做个性化计划、分析睡眠数据</strong
                        >
                        都可以在这一段对话里完成。
                    </p>
                </div>
                <div class="hero-meta">
                    <span class="meta-item"
                        >今日对话 <strong>已开启</strong></span
                    >
                    <span class="meta-item"
                        >节气 <strong>{{ currentSolarTermName }}</strong></span
                    >
                </div>
            </section>

            <div class="chat-app">
                <aside class="side">
                    <div class="side-top">
                        <button
                            class="new-chat-btn"
                            :disabled="isCreatingSession"
                            @click="newChat"
                        >
                            {{
                                isCreatingSession ? "创建中..." : "+ 开启新对话"
                            }}
                        </button>
                    </div>

                    <div class="side-main">
                        <div class="side-title side-title--compact">
                            历史对话
                        </div>
                        <div class="history-list">
                            <div
                                v-for="session in sessions"
                                :key="session.sessionId"
                                class="history-item"
                                :class="{
                                    active:
                                        currentSessionId === session.sessionId,
                                }"
                                @click="switchSession(session.sessionId)"
                            >
                                <div class="history-line">
                                    <h6>{{ session.title }}</h6>
                                    <div class="history-actions">
                                        <span class="history-time">{{
                                            formatTime(session.lastMessageAt)
                                        }}</span>
                                        <button
                                            class="history-delete-btn"
                                            type="button"
                                            :disabled="
                                                isBusy || isDeletingSession
                                            "
                                            @click.stop="
                                                openDeleteSessionDialog(
                                                    session.sessionId,
                                                )
                                            "
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                                <div class="history-sub">
                                    {{ formatDate(session.lastMessageAt) }}
                                </div>
                            </div>
                            <div
                                v-if="!sessions.length && !isLoadingSessions"
                                class="history-empty"
                            >
                                暂无历史对话
                            </div>
                        </div>
                    </div>
                </aside>

                <div class="main">
                    <div class="chat-body" ref="chatBodyEl">
                        <div v-if="!currentSessionId" class="welcome-state">
                            <div class="welcome-icon">智</div>
                            <p>
                                点击“开启新对话”或选择历史对话，开始与 AI
                                管家交流。
                            </p>
                        </div>

                        <AiButlerMessage
                            v-for="(msg, index) in messages"
                            :key="
                                msg.messageId ??
                                msg.tempId ??
                                msg.requestId ??
                                `${msg.role}-${index}`
                            "
                            :role="msg.role"
                            :content-type="msg.contentType"
                            :content="msg.content"
                            :structured-json="msg.structuredJson"
                            :is-streaming="msg.isStreaming"
                            :is-thinking="msg.isThinking"
                            :user-initial="userInitial"
                            :user-avatar="userAvatar"
                        />
                    </div>

                    <div class="quick-prompts">
                        <button
                            class="quick-prompt"
                            @click="send('给我做一份这个月的养生计划')"
                        >
                            <span class="tagico">🌿</span> 做一份本月计划
                        </button>
                        <button
                            class="quick-prompt"
                            @click="send('帮我分析最近 7 天睡眠')"
                        >
                            <span class="tagico">🌙</span> 睡眠分析
                        </button>
                        <button
                            class="quick-prompt"
                            @click="send('夏季失眠怎么调理')"
                        >
                            <span class="tagico">💬</span> 失眠调理
                        </button>
                        <button
                            class="quick-prompt"
                            @click="send('八段锦哪一式护肝')"
                        >
                            <span class="tagico">🍃</span> 八段锦护肝
                        </button>
                        <button
                            class="quick-prompt"
                            @click="send('根据我的体质推荐养生食材')"
                        >
                            <span class="tagico">🥗</span> 体质食材推荐
                        </button>
                        <button
                            class="quick-prompt quick-prompt--coming-soon"
                            type="button"
                            @click="showProductRecommendationComingSoon"
                        >
                            <span class="tagico">🛍️</span>
                            商品推荐
                            <span class="quick-prompt__badge">开发中</span>
                        </button>
                    </div>

                    <div class="chat-input-wrap">
                        <div class="chat-input-row">
                            <input
                                type="text"
                                v-model="chatInput"
                                :placeholder="inputPlaceholder"
                                :disabled="isBusy || !currentSessionId"
                                @keydown.enter="send()"
                            />
                            <button
                                v-if="isBusy"
                                class="send-btn stop-btn"
                                @click="stopGeneration"
                            >
                                停止
                            </button>
                            <button
                                v-else
                                class="send-btn"
                                :disabled="
                                    !currentSessionId || !chatInput.trim()
                                "
                                @click="send()"
                            >
                                发送
                            </button>
                        </div>
                        <div class="disclaimer">
                            AI 生成内容，仅供参考。涉及诊断 /
                            用药请咨询专业医师。
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div
            v-if="deleteDialogVisible"
            class="session-dialog-overlay"
            @click.self="closeDeleteSessionDialog"
        >
            <div
                class="session-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-session-title"
            >
                <div class="session-dialog__glow"></div>
                <div class="session-dialog__header">
                    <div class="session-dialog__eyebrow">历史会话管理</div>
                    <button
                        class="session-dialog__close"
                        type="button"
                        :disabled="isDeletingSession"
                        aria-label="关闭删除弹窗"
                        @click="closeDeleteSessionDialog"
                    >
                        ×
                    </button>
                </div>
                <div class="session-dialog__body">
                    <h3 id="delete-session-title" class="session-dialog__title">
                        确认删除这段对话吗？
                    </h3>
                    <p class="session-dialog__desc">
                        删除后这条历史会话将不会再显示，你仍可以继续使用其他会话。
                    </p>
                    <div class="session-dialog__session-card">
                        <span class="session-dialog__session-label"
                            >即将删除</span
                        >
                        <strong class="session-dialog__session-title">{{
                            deleteSessionDialogTitle
                        }}</strong>
                    </div>
                </div>
                <div class="session-dialog__actions">
                    <button
                        class="session-dialog__btn session-dialog__btn--ghost"
                        type="button"
                        :disabled="isDeletingSession"
                        @click="closeDeleteSessionDialog"
                    >
                        取消
                    </button>
                    <button
                        class="session-dialog__btn session-dialog__btn--danger"
                        type="button"
                        :disabled="isDeletingSession"
                        @click="confirmDeleteSession"
                    >
                        {{ isDeletingSession ? "删除中..." : "确认删除" }}
                    </button>
                </div>
            </div>
        </div>

        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import AiButlerMessage from "@/components/ai-butler/AiButlerMessage.vue";
import { ApiSeasonalHealth, ApiAiButler } from "@/network";
import type { AiButlerSessionVO, AiButlerMessageVO } from "@/network";
import { useAiButlerStream } from "@/composables/useAiButlerStream";
import type { SseCallbacks } from "@/composables/useAiButlerStream";
import { useUserStore } from "@/store/user";

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鍐呴儴娑堟伅绫诲瀷 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

interface ChatMessage {
    messageId?: number | undefined;
    tempId?: string; // 鏈垎閰?messageId 鍓嶇殑涓存椂 ID
    requestId?: string | undefined;
    role: "USER" | "ASSISTANT";
    contentType: string;
    status: string;
    content: string;
    structuredJson?: string | undefined;
    isStreaming?: boolean | undefined;
    isThinking?: boolean | undefined;
}

interface PendingStreamState {
    sessionId: number;
    requestId: string;
    lastEventSeq: number;
}

interface StreamDisplayState {
    startedAt: number;
    hasRevealed: boolean;
    revealTimer: ReturnType<typeof setTimeout> | null;
}

const ACTIVE_SESSION_STORAGE_KEY = "ai-butler-active-session";
const PENDING_STREAM_STORAGE_KEY = "ai-butler-pending-stream";
const THINKING_PLACEHOLDER = "\u601D\u8003\u4E2D........";
const THINKING_MIN_DURATION_MS = 600;

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鐘舵€?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const userStore = useUserStore();
const chatInput = ref("");
const messages = ref<ChatMessage[]>([]);
const sessions = ref<AiButlerSessionVO[]>([]);
const currentSessionId = ref<number | null>(null);
const chatBodyEl = ref<HTMLElement | null>(null);
const currentSolarTermName = ref("立夏");
const isLoadingSessions = ref(false);
const isCreatingSession = ref(false);
const isRecoveringStream = ref(false);
const activeRequestId = ref<string | null>(null);
const deleteDialogVisible = ref(false);
const pendingDeleteSessionId = ref<number | null>(null);
const pendingDeleteSessionTitle = ref("");
const isDeletingSession = ref(false);
const hiddenStreamBuffers = new Map<string, string>();
const streamDisplayStates = new Map<string, StreamDisplayState>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const { isStreaming, lastEventSeq, startStream, reconnect, cancelStream } =
    useAiButlerStream();

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 璁＄畻灞炴€?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const greetingName = computed(
    () =>
        userStore.G_LoginInfo.nickName ||
        userStore.G_LoginInfo.account ||
        "\u670B\u53CB",
);

const userInitial = computed(() =>
    (userStore.G_LoginInfo.nickName || "\u6211").charAt(0),
);

const userAvatar = computed(() => userStore.G_UserInfo.avatar || "");

const isBusy = computed(() => isStreaming.value || isRecoveringStream.value);

const deleteSessionDialogTitle = computed(
    () => pendingDeleteSessionTitle.value || "该会话",
);

const inputPlaceholder = computed(() => {
    if (isRecoveringStream.value)
        return "\u7F51\u7EDC\u6062\u590D\u540E\u5C06\u7EE7\u7EED\u8F93\u51FA...";
    if (!currentSessionId.value)
        return "\u8BF7\u5148\u5F00\u542F\u4E00\u6BB5\u65B0\u5BF9\u8BDD";
    if (isStreaming.value) return "AI \u7BA1\u5BB6\u6B63\u5728\u56DE\u590D...";
    return "\u95EE\u517B\u751F\u95EE\u9898 / \u8BA9 AI \u505A\u8BA1\u5212 / \u5206\u6790\u7761\u7720 \u2014 \u90FD\u5728\u8FD9\u91CC\u8BF4";
});

function showProductRecommendationComingSoon() {
    toast("商城正在开发中，商品推荐即将上线");
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ Toast 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const toastVisible = ref(false);
const toastMsg = ref("");
let toastTimer: ReturnType<typeof setTimeout>;
function toast(msg: string) {
    toastMsg.value = msg;
    toastVisible.value = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastVisible.value = false;
    }, 1800);
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 婊氬姩 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function scrollDown() {
    void nextTick(() => {
        if (chatBodyEl.value)
            chatBodyEl.value.scrollTop = chatBodyEl.value.scrollHeight;
    });
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鏍煎紡鍖栨椂闂?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function formatTime(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatDate(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "今天";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "昨天";
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 浼氳瘽绠＄悊 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function getStoredActiveSessionId(): number | null {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const sessionId = Number(raw);
    return Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null;
}

function storeActiveSessionId(sessionId: number | null): void {
    if (typeof window === "undefined") return;
    if (sessionId == null) {
        window.sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        return;
    }
    window.sessionStorage.setItem(
        ACTIVE_SESSION_STORAGE_KEY,
        String(sessionId),
    );
}

function getPendingStreamState(): PendingStreamState | null {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(PENDING_STREAM_STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<PendingStreamState>;
        if (!parsed.requestId || typeof parsed.sessionId !== "number")
            return null;
        return {
            sessionId: parsed.sessionId,
            requestId: parsed.requestId,
            lastEventSeq: Number(parsed.lastEventSeq) || 0,
        };
    } catch {
        return null;
    }
}

function storePendingStreamState(state: PendingStreamState): void {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
        PENDING_STREAM_STORAGE_KEY,
        JSON.stringify(state),
    );
}

function clearPendingStreamState(requestId?: string | null): void {
    if (typeof window === "undefined") return;
    const pending = getPendingStreamState();
    if (requestId && pending?.requestId && pending.requestId !== requestId)
        return;
    window.sessionStorage.removeItem(PENDING_STREAM_STORAGE_KEY);
}

function rememberPendingStream(sessionId: number, requestId: string): void {
    storePendingStreamState({
        sessionId,
        requestId,
        lastEventSeq: lastEventSeq.value,
    });
}

function clearReconnectTimer(): void {
    if (!reconnectTimer) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
}

function syncPendingStreamState(requestId: string): void {
    if (!currentSessionId.value) return;
    rememberPendingStream(currentSessionId.value, requestId);
}

function finishPendingStream(requestId?: string | null): void {
    clearReconnectTimer();
    isRecoveringStream.value = false;
    if (!requestId || activeRequestId.value === requestId) {
        activeRequestId.value = null;
    }
    clearBufferedStreamState(requestId);
    clearStreamDisplayState(requestId);
    clearPendingStreamState(requestId);
}

function createRequestId(): string {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }
    return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function bufferStreamDelta(
    requestId: string,
    delta: string,
    replaced?: boolean,
): void {
    if (replaced) {
        hiddenStreamBuffers.set(requestId, delta);
        return;
    }

    const currentBuffer = hiddenStreamBuffers.get(requestId) ?? "";
    hiddenStreamBuffers.set(requestId, `${currentBuffer}${delta}`);
}

function getBufferedStreamContent(requestId: string): string {
    return hiddenStreamBuffers.get(requestId) ?? "";
}

function hasBufferedStreamContent(requestId: string): boolean {
    return hiddenStreamBuffers.has(requestId);
}

function clearBufferedStreamState(requestId?: string | null): void {
    if (!requestId) return;
    hiddenStreamBuffers.delete(requestId);
}

function getOrCreateStreamDisplayState(requestId: string): StreamDisplayState {
    const existing = streamDisplayStates.get(requestId);
    if (existing) return existing;

    const state: StreamDisplayState = {
        startedAt: Date.now(),
        hasRevealed: false,
        revealTimer: null,
    };

    state.revealTimer = setTimeout(() => {
        const latestState = streamDisplayStates.get(requestId);
        if (!latestState || latestState.hasRevealed) return;
        latestState.revealTimer = null;
        if (!hasBufferedStreamContent(requestId)) return;
        syncStreamingMessageContent(requestId);
        scrollDown();
    }, THINKING_MIN_DURATION_MS);

    streamDisplayStates.set(requestId, state);
    return state;
}

function clearStreamDisplayState(requestId?: string | null): void {
    if (!requestId) return;
    const state = streamDisplayStates.get(requestId);
    if (state?.revealTimer) {
        clearTimeout(state.revealTimer);
    }
    streamDisplayStates.delete(requestId);
}

function clearAllStreamDisplayStates(): void {
    for (const requestId of streamDisplayStates.keys()) {
        clearStreamDisplayState(requestId);
    }
}

async function loadSessions() {
    isLoadingSessions.value = true;
    try {
        const res = await ApiAiButler.listSessions();
        // 缁熶竴澶勭悊 axios 鍝嶅簲鏍煎紡
        const data = (res as unknown as { data: { data: AiButlerSessionVO[] } })
            .data?.data;
        sessions.value = Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("加载会话列表失败", e);
    } finally {
        isLoadingSessions.value = false;
    }
}

async function newChat() {
    if (isCreatingSession.value || isBusy.value) return;
    isCreatingSession.value = true;
    try {
        const res = await ApiAiButler.createSession();
        const newSession = (
            res as unknown as { data: { data: AiButlerSessionVO } }
        ).data?.data;
        if (newSession) {
            sessions.value.unshift(newSession);
            await switchSession(newSession.sessionId);
        }
    } catch (e) {
        console.error("创建会话失败", e);
        toast("创建会话失败，请重试");
    } finally {
        isCreatingSession.value = false;
    }
}

function clearCurrentSessionSelection(): void {
    currentSessionId.value = null;
    messages.value = [];
    chatInput.value = "";
    storeActiveSessionId(null);
    clearPendingStreamState();
    activeRequestId.value = null;
    isRecoveringStream.value = false;
    clearAllStreamDisplayStates();
}

function openDeleteSessionDialog(sessionId: number): void {
    if (isBusy.value) {
        toast("当前正在生成，请稍后再删除会话");
        return;
    }

    const targetSession = sessions.value.find(
        (session) => session.sessionId === sessionId,
    );
    if (!targetSession) return;

    pendingDeleteSessionId.value = sessionId;
    pendingDeleteSessionTitle.value = targetSession.title || "该会话";
    deleteDialogVisible.value = true;
}

function closeDeleteSessionDialog(): void {
    if (isDeletingSession.value) return;
    deleteDialogVisible.value = false;
    pendingDeleteSessionId.value = null;
    pendingDeleteSessionTitle.value = "";
}

async function confirmDeleteSession() {
    const sessionId = pendingDeleteSessionId.value;
    if (!sessionId || isDeletingSession.value) return;

    try {
        isDeletingSession.value = true;
        await ApiAiButler.deleteSession(sessionId);
        deleteDialogVisible.value = false;

        const remainingSessions = sessions.value.filter(
            (session) => session.sessionId !== sessionId,
        );
        sessions.value = remainingSessions;

        if (currentSessionId.value === sessionId) {
            const nextSessionId = remainingSessions[0]?.sessionId;
            if (nextSessionId) {
                await switchSession(nextSessionId);
            } else {
                clearCurrentSessionSelection();
            }
        }

        toast("历史会话已删除");
    } catch (error) {
        console.error("删除会话失败", error);
        toast("删除会话失败，请重试");
    } finally {
        isDeletingSession.value = false;
        pendingDeleteSessionId.value = null;
        pendingDeleteSessionTitle.value = "";
    }
}

async function switchSession(sessionId: number) {
    if (isBusy.value) {
        toast(
            "\u5F53\u524D\u6B63\u5728\u751F\u6210\uFF0C\u8BF7\u7B49\u5F85\u5B8C\u6210\u6216\u505C\u6B62\u540E\u518D\u5207\u6362",
        );
        return;
    }
    currentSessionId.value = sessionId;
    storeActiveSessionId(sessionId);
    messages.value = [];
    await loadMessages(sessionId);
    scrollDown();
}

function mapChatMessage(message: AiButlerMessageVO): ChatMessage {
    return {
        messageId: message.messageId,
        requestId: message.requestId,
        role: message.role === "USER" ? "USER" : "ASSISTANT",
        contentType: message.contentType || "TEXT",
        status: message.status,
        content: message.content || "",
        structuredJson: message.structuredJson,
        isStreaming: false,
        isThinking: false,
    };
}

function findStreamingMessage(requestId: string): ChatMessage | undefined {
    return messages.value.find(
        (message) =>
            message.requestId === requestId && message.role === "ASSISTANT",
    );
}

function ensureStreamingMessage(
    requestId: string,
    messageId?: number,
): ChatMessage {
    const displayState = getOrCreateStreamDisplayState(requestId);
    const existing = findStreamingMessage(requestId);
    if (existing) {
        if (messageId) existing.messageId = messageId;
        existing.isStreaming = true;
        if (existing.status !== "COMPLETED") existing.status = "GENERATING";
        if (existing.content && existing.content !== THINKING_PLACEHOLDER) {
            displayState.hasRevealed = true;
            if (displayState.revealTimer) {
                clearTimeout(displayState.revealTimer);
                displayState.revealTimer = null;
            }
        }
        if (existing.status === "GENERATING") {
            existing.isThinking = !displayState.hasRevealed;
            if (!existing.content) existing.content = THINKING_PLACEHOLDER;
        }
        return existing;
    }

    const message: ChatMessage = {
        tempId: `ai-${requestId}`,
        requestId,
        messageId,
        role: "ASSISTANT",
        contentType: "TEXT",
        status: "GENERATING",
        content: THINKING_PLACEHOLDER,
        isStreaming: true,
        isThinking: !displayState.hasRevealed,
    };
    messages.value.push(message);
    return message;
}

function syncStreamingMessageContent(
    requestId: string,
    fallbackText = "",
): ChatMessage {
    const displayState = getOrCreateStreamDisplayState(requestId);
    const message = ensureStreamingMessage(requestId);
    const bufferedContent = getBufferedStreamContent(requestId);

    displayState.hasRevealed = true;
    if (displayState.revealTimer) {
        clearTimeout(displayState.revealTimer);
        displayState.revealTimer = null;
    }
    message.isThinking = false;
    if (bufferedContent) {
        message.content = bufferedContent;
    } else if (message.content === THINKING_PLACEHOLDER) {
        message.content = fallbackText;
    }

    return message;
}

function tryRevealStreamingContent(requestId: string): void {
    if (!hasBufferedStreamContent(requestId)) return;

    const displayState = getOrCreateStreamDisplayState(requestId);
    if (displayState.hasRevealed) {
        syncStreamingMessageContent(requestId);
        return;
    }

    if (Date.now() - displayState.startedAt < THINKING_MIN_DURATION_MS) return;
    syncStreamingMessageContent(requestId);
}

function isRecoverableStreamError(code: string): boolean {
    return code === "AI_NETWORK_ERROR";
}

function scheduleReconnect(requestId: string): void {
    if (
        typeof window === "undefined" ||
        !currentSessionId.value ||
        isStreaming.value
    )
        return;
    if (!window.navigator.onLine) return;

    clearReconnectTimer();
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void reconnectPendingStream(requestId);
    }, 600);
}

function handleRecoverableStreamError(requestId: string): void {
    ensureStreamingMessage(requestId);
    isRecoveringStream.value = true;
    syncPendingStreamState(requestId);
    toast("网络短暂中断，正在为你恢复输出");
    scheduleReconnect(requestId);
}

function buildStreamCallbacks(requestId: string): SseCallbacks {
    return {
        onRawEvent() {
            syncPendingStreamState(requestId);
        },
        onDelta({ messageId, delta, replaced }) {
            isRecoveringStream.value = false;
            ensureStreamingMessage(requestId, messageId);
            bufferStreamDelta(requestId, delta, replaced);
            tryRevealStreamingContent(requestId);
            scrollDown();
        },
        onCompleted({ messageId, contentType, structuredJson }) {
            const message = syncStreamingMessageContent(requestId);
            message.messageId = messageId;
            message.contentType = contentType || message.contentType || "TEXT";
            message.structuredJson = structuredJson ?? message.structuredJson;
            message.isStreaming = false;
            message.isThinking = false;
            message.status = "COMPLETED";
            isRecoveringStream.value = false;
            scrollDown();
            void loadSessions();
        },
        onInterrupted() {
            const message = syncStreamingMessageContent(
                requestId,
                "\uFF08\u751F\u6210\u5DF2\u4E2D\u65AD\uFF09",
            );
            message.isStreaming = false;
            message.isThinking = false;
            message.status = "INTERRUPTED";
            if (!message.content)
                message.content = "\uFF08\u751F\u6210\u5DF2\u4E2D\u65AD\uFF09";
            finishPendingStream(requestId);
        },
        onStreamCompleted() {
            finishPendingStream(requestId);
        },
        onError({ code, message }) {
            console.error(`[SSE] ${code}: ${message}`);

            if (isRecoverableStreamError(code)) {
                handleRecoverableStreamError(requestId);
                return;
            }

            const streamingMessage = ensureStreamingMessage(requestId);
            const partialContent = getBufferedStreamContent(requestId);
            streamingMessage.isStreaming = false;
            streamingMessage.isThinking = false;
            streamingMessage.status = "FAILED";
            if (partialContent) {
                streamingMessage.contentType = "TEXT";
                streamingMessage.content = `${partialContent}\n\n\u56DE\u7B54\u672A\u5B8C\u6574\u751F\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002`;
            } else {
                streamingMessage.contentType = "ERROR";
                streamingMessage.content =
                    message ||
                    "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
            }
            finishPendingStream(requestId);
            toast(
                "⚠️ " +
                    (message ||
                        "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"),
            );
        },
    };
}

async function reconnectPendingStream(requestId: string, afterSeq?: number) {
    if (!currentSessionId.value || isStreaming.value) return;

    const pending = getPendingStreamState();
    const replayFromSeq =
        afterSeq ??
        (pending?.requestId === requestId ? pending.lastEventSeq : 0);

    activeRequestId.value = requestId;
    isRecoveringStream.value = true;
    getOrCreateStreamDisplayState(requestId);
    ensureStreamingMessage(requestId);

    await reconnect(requestId, replayFromSeq, buildStreamCallbacks(requestId));

    if (activeRequestId.value === requestId && !isStreaming.value) {
        isRecoveringStream.value = false;
    }
}

async function resumePendingStreamIfNeeded(sessionId: number) {
    const pending = getPendingStreamState();
    const latestGeneratingAssistant = [...messages.value]
        .reverse()
        .find(
            (message) =>
                message.role === "ASSISTANT" &&
                Boolean(message.requestId) &&
                message.status === "GENERATING",
        );

    const requestId =
        pending?.sessionId === sessionId
            ? pending.requestId
            : latestGeneratingAssistant?.requestId;

    if (!requestId) return;

    const targetMessage = findStreamingMessage(requestId);
    if (targetMessage && targetMessage.status !== "GENERATING") {
        clearPendingStreamState(requestId);
        return;
    }

    const replayFromSeq =
        pending?.requestId === requestId && hasBufferedStreamContent(requestId)
            ? pending.lastEventSeq
            : 0;

    await reconnectPendingStream(requestId, replayFromSeq);
}

async function loadMessages(sessionId: number) {
    try {
        const res = await ApiAiButler.listMessages(sessionId);
        const data = (res as unknown as { data: { data: AiButlerMessageVO[] } })
            .data?.data;
        messages.value = Array.isArray(data) ? data.map(mapChatMessage) : [];
        await resumePendingStreamIfNeeded(sessionId);
    } catch (e) {
        console.error("加载消息失败", e);
    }
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鍙戦€佹秷鎭?/ SSE 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

async function send(prefill?: string) {
    const text = (prefill || chatInput.value).trim();
    if (!text || !currentSessionId.value || isBusy.value) return;

    chatInput.value = "";
    clearReconnectTimer();
    const requestId = createRequestId();
    activeRequestId.value = requestId;
    isRecoveringStream.value = false;

    messages.value.push({
        tempId: `user-${requestId}`,
        role: "USER",
        contentType: "TEXT",
        status: "COMPLETED",
        content: text,
    });

    rememberPendingStream(currentSessionId.value, requestId);
    getOrCreateStreamDisplayState(requestId);
    ensureStreamingMessage(requestId);
    scrollDown();

    await startStream(
        {
            sessionId: currentSessionId.value,
            requestId,
            message: text,
        },
        buildStreamCallbacks(requestId),
    );

    if (activeRequestId.value === requestId && !isStreaming.value) {
        isRecoveringStream.value = false;
    }
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鍋滄鐢熸垚 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

async function stopGeneration() {
    if (!activeRequestId.value) return;
    const requestId = activeRequestId.value;
    clearReconnectTimer();
    cancelStream();
    try {
        await ApiAiButler.cancelGeneration(requestId);
    } catch {
        // 忽略取消接口错误
    }
    const msg = findStreamingMessage(requestId);
    if (msg) {
        const partialContent = getBufferedStreamContent(requestId);
        msg.isStreaming = false;
        msg.isThinking = false;
        msg.status = "INTERRUPTED";
        msg.content =
            partialContent || "\uFF08\u751F\u6210\u5DF2\u505C\u6B62\uFF09";
    }
    finishPendingStream(requestId);
}

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鍒濆鍖?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

async function restoreSessionAfterRefresh() {
    const preferredSessionId =
        getPendingStreamState()?.sessionId ?? getStoredActiveSessionId();
    if (!preferredSessionId) return;
    if (
        !sessions.value.some(
            (session) => session.sessionId === preferredSessionId,
        )
    )
        return;
    await switchSession(preferredSessionId);
}

function handleBrowserOnline() {
    const pending = getPendingStreamState();
    if (!pending || pending.sessionId !== currentSessionId.value) return;
    const replayFromSeq = hasBufferedStreamContent(pending.requestId)
        ? pending.lastEventSeq
        : 0;
    void reconnectPendingStream(pending.requestId, replayFromSeq);
}

onMounted(async () => {
    await Promise.all([loadSessions(), loadCurrentSolarTerm()]);
    await restoreSessionAfterRefresh();
    window.addEventListener("online", handleBrowserOnline);
});

onBeforeUnmount(() => {
    clearReconnectTimer();
    clearAllStreamDisplayStates();
    window.removeEventListener("online", handleBrowserOnline);
});

async function loadCurrentSolarTerm() {
    try {
        const data = await ApiSeasonalHealth.getCurrent();
        if (data?.solarTerm?.termName) {
            currentSolarTermName.value = data.solarTerm.termName;
        }
    } catch {
        // use default value
    }
}
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

// Hero
.hero {
    background: linear-gradient(135deg, #e4efe8 0%, #edf4ef 60%, #fdfaf3 100%);
    border: 1px solid var(--jade-soft);
    border-radius: 20px;
    padding: 36px 40px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}
.hero::before {
    content: "\667A";
    position: absolute;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
    font-family: "STKaiti", serif;
    font-size: 200px;
    color: var(--jade);
    opacity: 0.1;
    line-height: 1;
    font-weight: 900;
}
.hero-text {
    position: relative;
    z-index: 1;
}
.hero-label {
    font-size: 13px;
    color: var(--jade);
    letter-spacing: 3px;
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
    max-width: 600px;
}
.hero-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    font-size: 13px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
}
.meta-item strong {
    color: var(--jade);
    font-weight: 600;
}

// Chat App
.chat-app {
    background: var(--paper);
    border-radius: 16px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    overflow: hidden;
    display: grid;
    grid-template-columns: 252px minmax(0, 1fr);
    min-height: 760px;
}

// Sidebar
.side {
    background: linear-gradient(180deg, #f9f3e7 0%, #f6efe4 100%);
    border-right: 1px solid var(--line-soft);
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 24px 20px;
}
.side-top {
    flex-shrink: 0;
}
.side-main {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-top: 4px;
    padding-right: 4px;
}
.side-title {
    font-family: "STKaiti", serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.side-title::before {
    content: "";
    width: 4px;
    height: 16px;
    background: var(--jade);
    border-radius: 2px;
}
.side-title--compact {
    margin-bottom: 10px;
    font-size: 16px;
}
.new-chat-btn {
    width: 100%;
    background: var(--jade);
    color: white;
    border: none;
    padding: 16px 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 10px 22px rgba(92, 131, 116, 0.18);
    &:hover:not(:disabled) {
        background: var(--ink);
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
.history-list {
    display: flex;
    flex-direction: column;
}
.history-item {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 14px;
    padding: 14px 14px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
        background: rgba(255, 255, 255, 0.66);
    }
    &.active {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(92, 131, 116, 0.14);
        box-shadow: 0 10px 24px rgba(60, 50, 30, 0.06);
    }
}
.history-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
}
.history-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}
.history-item h6 {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.5;
    margin: 0;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.history-time {
    flex-shrink: 0;
    color: var(--ink-muted);
    font-size: 12px;
}
.history-delete-btn {
    border: 1px solid transparent;
    background: rgba(194, 96, 73, 0.08);
    color: var(--cinnabar);
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
    opacity: 0;
    pointer-events: none;
}
.history-item:hover .history-delete-btn,
.history-item.active .history-delete-btn {
    opacity: 1;
    pointer-events: auto;
}
.history-delete-btn:hover:not(:disabled) {
    background: rgba(194, 96, 73, 0.16);
    border-color: rgba(194, 96, 73, 0.2);
}
.history-delete-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
.history-sub {
    margin-top: 6px;
    color: var(--ink-muted);
    font-size: 12px;
}
.history-empty {
    text-align: center;
    color: var(--ink-muted);
    font-size: 13px;
    padding: 20px 0;
}

.session-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(39, 41, 35, 0.18);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.session-dialog {
    position: relative;
    width: min(100%, 480px);
    border-radius: 28px;
    overflow: hidden;
    border: 1px solid rgba(232, 223, 208, 0.8);
    background: linear-gradient(
        180deg,
        rgba(255, 253, 249, 0.98) 0%,
        rgba(252, 248, 240, 0.98) 100%
    );
    box-shadow:
        0 28px 64px rgba(52, 43, 30, 0.16),
        0 12px 24px rgba(52, 43, 30, 0.08);
}

.session-dialog__glow {
    position: absolute;
    inset: -40% auto auto -10%;
    width: 220px;
    height: 220px;
    background: radial-gradient(
        circle,
        rgba(140, 176, 159, 0.2) 0%,
        rgba(140, 176, 159, 0) 72%
    );
    pointer-events: none;
}

.session-dialog__header,
.session-dialog__body,
.session-dialog__actions {
    position: relative;
    z-index: 1;
}

.session-dialog__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 24px 0;
}

.session-dialog__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    letter-spacing: 0.14em;
    color: var(--jade);
    font-weight: 700;
}

.session-dialog__eyebrow::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    box-shadow: 0 0 0 6px rgba(140, 176, 159, 0.12);
}

.session-dialog__close {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(232, 223, 208, 0.95);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.78);
    color: var(--ink-muted);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;
}

.session-dialog__close:hover:not(:disabled) {
    color: var(--ink);
    border-color: rgba(140, 176, 159, 0.35);
    background: rgba(255, 255, 255, 0.96);
}

.session-dialog__close:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.session-dialog__body {
    padding: 12px 24px 8px;
}

.session-dialog__title {
    margin: 0;
    font-family: "STKaiti", serif;
    font-size: 28px;
    line-height: 1.25;
    color: var(--ink);
}

.session-dialog__desc {
    margin: 12px 0 0;
    color: var(--ink-muted);
    font-size: 14px;
    line-height: 1.8;
}

.session-dialog__session-card {
    margin-top: 18px;
    padding: 16px 18px;
    border-radius: 18px;
    border: 1px solid rgba(194, 96, 73, 0.14);
    background: linear-gradient(
        135deg,
        rgba(255, 250, 246, 0.96) 0%,
        rgba(255, 244, 238, 0.98) 100%
    );
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.session-dialog__session-label {
    font-size: 12px;
    color: var(--cinnabar);
    font-weight: 700;
    letter-spacing: 0.08em;
}

.session-dialog__session-title {
    color: var(--ink);
    font-size: 16px;
    line-height: 1.6;
    word-break: break-word;
}

.session-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px 24px;
}

.session-dialog__btn {
    min-width: 108px;
    border-radius: 999px;
    padding: 12px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
}

.session-dialog__btn--ghost {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(232, 223, 208, 0.95);
    color: var(--ink-soft);
}

.session-dialog__btn--ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.96);
    color: var(--ink);
}

.session-dialog__btn--danger {
    border: 1px solid transparent;
    background: linear-gradient(135deg, #d46d54 0%, var(--cinnabar) 100%);
    color: #fff;
    box-shadow: 0 12px 22px rgba(194, 96, 73, 0.22);
}

.session-dialog__btn--danger:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(194, 96, 73, 0.26);
}

.session-dialog__btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
    box-shadow: none;
}

// Main chat
.main {
    background: linear-gradient(
        to bottom,
        var(--cream) 0%,
        var(--paper-warm) 100%
    );
    display: flex;
    flex-direction: column;
}
.chat-body {
    flex: 1;
    padding: 32px 30px 36px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-height: 660px;
}

// Welcome state
.welcome-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--ink-muted);
    padding: 60px 20px;
    .welcome-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--jade), var(--jade-light));
        color: white;
        font-family: "STKaiti", serif;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 600;
    }
    p {
        font-size: 14px;
        text-align: center;
        max-width: 240px;
        line-height: 1.7;
    }
}

// Message rows (shared with AiButlerMessage component via global styles)
:deep(.msg-row) {
    display: flex;
    gap: 18px;
    max-width: 98%;
}
:deep(.msg-row.me) {
    align-self: flex-end;
    flex-direction: row-reverse;
}
:deep(.msg-row.full) {
    max-width: 100%;
}
:deep(.msg-avatar) {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    overflow: hidden;
}
:deep(.msg-avatar-img) {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: inherit;
}
:deep(.msg-avatar.ai) {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white;
    font-family: "STKaiti", serif;
}
:deep(.msg-avatar.user) {
    background: var(--gold-soft);
    color: var(--gold-deep);
}
:deep(.bubble-wrap) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    flex: 1;
}
:deep(.msg-row.me .bubble-wrap) {
    align-items: flex-end;
}
:deep(.bub-tag) {
    display: inline-block;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 6px;
    background: var(--jade-soft);
    color: var(--jade);
    font-weight: 600;
}
:deep(.bubble) {
    padding: 18px 22px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.85;
    box-shadow: 0 6px 18px rgba(60, 50, 30, 0.05);
}
:deep(.bub-ai) {
    background: var(--paper);
    color: var(--ink);
    border: 1px solid var(--line);
    border-top-left-radius: 4px;
}
:deep(.bub-me) {
    background: var(--jade);
    color: white;
    border-top-right-radius: 4px;
}

// Quick prompts
.quick-prompts {
    padding: 16px 30px 14px;
    background: var(--paper);
    display: flex;
    gap: 10px;
    overflow-x: auto;
    border-top: 1px solid var(--line-soft);
}
.quick-prompts::-webkit-scrollbar {
    height: 4px;
}
.quick-prompts::-webkit-scrollbar-thumb {
    background: var(--line);
    border-radius: 2px;
}
.quick-prompt {
    flex-shrink: 0;
    padding: 8px 16px;
    background: var(--cream);
    border: 1px solid var(--line);
    border-radius: 16px;
    font-size: 12px;
    color: var(--ink-soft);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    &:hover {
        background: var(--jade-soft);
        border-color: var(--jade);
        color: var(--jade);
    }
}
.quick-prompt .tagico {
    font-size: 11px;
}
.quick-prompt--coming-soon {
    position: relative;
    border-style: dashed;
    border-color: rgba(92, 131, 116, 0.35);
    background: linear-gradient(
        135deg,
        rgba(255, 252, 246, 0.96) 0%,
        rgba(247, 251, 248, 0.98) 100%
    );
    color: var(--jade);
}
.quick-prompt--coming-soon:hover {
    background: linear-gradient(
        135deg,
        rgba(233, 243, 237, 0.96) 0%,
        rgba(244, 249, 245, 0.98) 100%
    );
    border-color: var(--jade);
    color: var(--jade);
}
.quick-prompt__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(92, 131, 116, 0.12);
    color: var(--jade);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
}

// Chat Input
.chat-input-wrap {
    background: var(--paper);
    border-top: 1px solid var(--line-soft);
    padding: 18px 30px 24px;
}
.chat-input-row {
    background: var(--paper-warm);
    border: 1.5px solid var(--line);
    border-radius: 18px;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    &:focus-within {
        border-color: var(--jade);
        box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.1);
    }
}
.chat-input-row input {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px;
    font-size: 15px;
    font-family: inherit;
    background: transparent;
    &::placeholder {
        color: var(--ink-muted);
    }
    &:disabled {
        color: var(--ink-muted);
        cursor: not-allowed;
    }
}
.send-btn {
    background: var(--jade);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 4px;
    &:hover:not(:disabled) {
        background: var(--ink);
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
.stop-btn {
    background: var(--cinnabar) !important;
    &:hover {
        background: #c0392b !important;
    }
}
.disclaimer {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 10px;
    text-align: center;
}

// Toast
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 13px;
    box-shadow: var(--shadow-lg);
    opacity: 0;
    transition: all 0.3s;
    z-index: 1000;
    pointer-events: none;
    &.show {
        opacity: 1;
        transform: translateX(-50%) translateY(-6px);
    }
}

@media (max-width: 1024px) {
    .chat-app {
        grid-template-columns: 1fr;
    }
    .side {
        display: none;
    }
    .chat-body,
    .quick-prompts,
    .chat-input-wrap {
        padding-left: 20px;
        padding-right: 20px;
    }
    .hero {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}

@media (max-width: 640px) {
    .session-dialog-overlay {
        padding: 16px;
    }
    .session-dialog {
        border-radius: 24px;
    }
    .session-dialog__header {
        padding: 18px 18px 0;
    }
    .session-dialog__body {
        padding: 10px 18px 6px;
    }
    .session-dialog__title {
        font-size: 24px;
    }
    .session-dialog__actions {
        padding: 18px;
        flex-direction: column-reverse;
    }
    .session-dialog__btn {
        width: 100%;
    }
}
</style>

<!-- 浠ヤ笅鏍峰紡涓嶅姞 scoped锛岀粰 AiButlerMessage 瀛愮粍浠朵腑鐨勫崱鐗囦娇鐢?-->
<style lang="scss">
.artifact-citations {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
}
.citation-card {
    background: var(--paper-warm);
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-left: 3px solid var(--gold);
    cursor: pointer;
    .ico {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: var(--gold-soft);
        color: var(--gold-deep);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        flex-shrink: 0;
    }
    .info {
        flex: 1;
        min-width: 0;
        h6 {
            font-size: 12px;
            color: var(--ink);
            margin-bottom: 2px;
        }
        .meta {
            font-size: 11px;
            color: var(--ink-muted);
        }
    }
    .arrow {
        color: var(--ink-muted);
    }
}

.artifact-plan {
    background: linear-gradient(135deg, #fdfaf3 0%, #edf4ef 100%);
    border: 1.5px solid var(--jade-light);
    border-radius: 14px;
    padding: 18px;
    margin-top: 12px;
}
.artifact-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--line);
    .seal {
        background: var(--jade);
        color: white;
        border-radius: 6px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        font-family: "STKaiti", serif;
    }
    h5 {
        font-family: "STKaiti", serif;
        font-size: 16px;
        flex: 1;
    }
    .meta {
        font-size: 11px;
        color: var(--ink-muted);
    }
}
.plan-dims {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.plan-dim {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 12px 14px;
    .dim-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-family: "STKaiti", serif;
        font-size: 13px;
        font-weight: 600;
    }
    .ico {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
    }
    .row {
        font-size: 12px;
        padding: 4px 0;
        color: var(--ink-soft);
        line-height: 1.6;
        display: flex;
        gap: 6px;
        align-items: flex-start;
    }
    .row .t {
        font-family: "STKaiti", serif;
        color: var(--ink-muted);
        flex-shrink: 0;
        width: 36px;
    }
    .row .c strong {
        color: var(--ink);
    }
    &.diet .ico {
        background: var(--gold-soft);
        color: var(--gold-deep);
    }
    &.solar .ico {
        background: var(--jade-soft);
        color: var(--jade);
    }
    &.sleep .ico {
        background: var(--moon-soft, #f0f0ff);
        color: #7c6fa8;
    }
    &.exercise .ico {
        background: var(--bamboo-soft);
        color: var(--bamboo);
    }
}

.handoff-card {
    background: linear-gradient(135deg, #fbeef1 0%, var(--cinnabar-soft) 100%);
    border: 1.5px dashed var(--cinnabar);
    border-radius: 12px;
    padding: 14px;
    margin-top: 12px;
    h6 {
        font-family: "STKaiti", serif;
        font-size: 13px;
        color: var(--cinnabar);
        margin-bottom: 6px;
    }
    p {
        font-size: 12px;
        color: var(--ink-soft);
        margin-bottom: 10px;
        line-height: 1.6;
    }
}
.handoff-btn {
    background: var(--cinnabar);
    color: white;
    border: none;
    border-radius: 18px;
    padding: 6px 14px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    &:hover {
        background: #c0392b;
    }
}
</style>
