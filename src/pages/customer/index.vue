<template>
    <div class="customer-workspace">
        <!-- 侧边栏 -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-seal">颐</div>
                <div>
                    <div class="sidebar-title">颐养阁</div>
                    <div class="sidebar-sub">客服工作台</div>
                </div>
            </div>

            <nav class="nav">
                <template v-for="item in navItems" :key="item.panel">
                    <div v-if="item.section" class="nav-section">
                        {{ item.section }}
                    </div>
                    <button
                        class="nav-item"
                        :class="{ active: currentPanel === item.panel }"
                        @click="switchPanel(item.panel)"
                    >
                        <svg
                            class="nav-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.75"
                        >
                            <template v-if="item.panel === 'dashboard'">
                                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                                <rect x="3" y="16" width="7" height="5" rx="1.5" />
                            </template>
                            <template v-else-if="item.panel === 'chat'">
                                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                            </template>
                            <template v-else-if="item.panel === 'queue'">
                                <path d="M8 6h13" />
                                <path d="M8 12h13" />
                                <path d="M8 18h13" />
                                <circle cx="3.5" cy="6" r="1.5" />
                                <circle cx="3.5" cy="12" r="1.5" />
                                <circle cx="3.5" cy="18" r="1.5" />
                            </template>
                            <template v-else-if="item.panel === 'history'">
                                <path d="M3 12a9 9 0 1 0 3-6.7" />
                                <path d="M3 4v6h6" />
                                <path d="M12 7v5l3 2" />
                            </template>
                            <template v-else-if="item.panel === 'tools'">
                                <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
                                <path d="M7 7h.01" />
                            </template>
                            <template v-else>
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V22a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 18l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" />
                            </template>
                        </svg>
                        <span>{{ item.label }}</span>
                        <span
                            v-if="item.panel === 'chat' && chatCount > 0"
                            class="nav-badge"
                        >
                            {{ chatCount }}
                        </span>
                        <span
                            v-if="item.panel === 'queue' && queueCount > 0"
                            class="nav-badge gold"
                        >
                            {{ queueCount }}
                        </span>
                    </button>
                </template>
            </nav>

            <div class="sidebar-account-wrap" ref="accountMenuRef">
                <Transition name="account-menu">
                    <div v-if="showAccountMenu" class="account-menu">
                        <div class="account-profile">
                            <div class="agent-avatar account-avatar">
                                {{ agentName.slice(-1) }}
                            </div>
                            <div class="account-meta">
                                <div class="account-name">{{ agentName }}</div>
                                <div class="account-role">{{ agentId }}</div>
                            </div>
                        </div>
                        <div class="account-sep"></div>
                        <button
                            v-for="status in statusOptions"
                            :key="status.value"
                            type="button"
                            class="account-menu-item"
                            :class="{
                                'item-active': agentStatus === status.value,
                            }"
                            @click.stop="setStatus(status.value, status.label)"
                        >
                            <span
                                class="status-led"
                                :class="`led-${status.value}`"
                            ></span>
                            <span>{{ status.label }}</span>
                        </button>
                        <div class="account-sep"></div>
                        <button
                            type="button"
                            class="account-menu-item danger"
                            @click.stop="handleLogout"
                        >
                            <span>退出登录</span>
                        </button>
                    </div>
                </Transition>

                <button
                    type="button"
                    class="sidebar-account"
                    :class="{ open: showAccountMenu }"
                    @click.stop="toggleAccountMenu"
                >
                    <div class="account-info">
                        <div class="agent-avatar">
                            {{ agentName.slice(-1) }}
                        </div>
                        <div class="account-meta">
                            <div class="account-name">{{ agentName }}</div>
                            <div class="account-role">{{ agentId }}</div>
                        </div>
                    </div>
                    <span
                        class="status-led"
                        :class="`led-${agentStatus}`"
                    ></span>
                </button>
            </div>
        </aside>

        <!-- 退出登录二次确认弹窗 -->
        <Teleport to="body">
            <Transition name="logout-modal">
                <div
                    v-if="showLogoutConfirm"
                    class="logout-mask"
                    @click.self="showLogoutConfirm = false"
                >
                    <div class="logout-dialog">
                        <div class="logout-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="32" height="32">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </div>
                        <div class="logout-title">确认退出工作台？</div>
                        <div class="logout-body">所有进行中的会话将释放并重新分配给其他客服，请确认后再退出。</div>
                        <div class="logout-actions">
                            <button class="logout-btn cancel" @click="showLogoutConfirm = false">取消</button>
                            <button class="logout-btn confirm" :disabled="logoutLoading" @click="confirmLogout">
                                {{ logoutLoading ? '退出中…' : '确认退出' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- 主内容区 -->
        <div class="main">
            <!-- 内容面板 -->
            <div class="content">
                <!-- 工作台面板 -->
                <div
                    v-show="currentPanel === 'dashboard'"
                    class="panel panel-scroll"
                >
                    <DashboardPanel
                        ref="dashboardPanelRef"
                        :chat-count="chatCount"
                        :queue-count="queueCount"
                        :agent-name="agentName"
                        :agent-status="agentStatus"
                    />
                </div>

                <!-- 接待中面板（不加内边距，自己管理布局）-->
                <div v-show="currentPanel === 'chat'" class="panel panel-fill">
                    <ChatPanel
                        ref="chatPanelRef"
                        :agent-name="agentName"
                        :agent-id="agentId"
                        @count-update="chatCount = $event"
                        @switch-to-queue="currentPanel = 'queue'"
                        @session-ended="handleSessionEnded"
                        @msg-count-update="dashboardPanelRef?.addMessages($event)"
                        @queue-new-message="handleQueueNewMessage"
                    />
                </div>

                <!-- 排队队列面板 -->
                <div
                    v-show="currentPanel === 'queue'"
                    class="panel panel-scroll"
                >
                    <QueuePanel
                        ref="queuePanelRef"
                        @switch-to-chat="handleSwitchToChat"
                        @count-update="queueCount = $event"
                    />
                </div>

                <!-- 历史会话面板 -->
                <div
                    v-show="currentPanel === 'history'"
                    class="panel panel-scroll"
                >
                    <HistoryPanel ref="historyPanelRef" />
                </div>

                <!-- 商品订单速查面板 -->
                <div
                    v-show="currentPanel === 'tools'"
                    class="panel panel-scroll"
                >
                    <ToolsPanel />
                </div>

                <!-- 个人设置面板 -->
                <div
                    v-show="currentPanel === 'settings'"
                    class="panel panel-scroll"
                >
                    <SettingsPanel />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import {
    ApiCustomer,
    type HistorySession,
    type CustomerSession,
} from "@/network/customer";
import { customerWS } from "@/network/customer.ws";
import { ElMessage } from "element-plus";

// 导入子组件（稍后创建）
import DashboardPanel from "@/components/customer/DashboardPanel.vue";
import ChatPanel from "@/components/customer/ChatPanel.vue";
import QueuePanel from "@/components/customer/QueuePanel.vue";
import HistoryPanel from "@/components/customer/HistoryPanel.vue";
import ToolsPanel from "@/components/customer/ToolsPanel.vue";
import SettingsPanel from "@/components/customer/SettingsPanel.vue";

const router = useRouter();
const chatPanelRef = ref<InstanceType<typeof ChatPanel>>();
const historyPanelRef = ref<InstanceType<typeof HistoryPanel>>();
const dashboardPanelRef = ref<InstanceType<typeof DashboardPanel>>();
const queuePanelRef = ref<InstanceType<typeof QueuePanel>>();
const userStore = useUserStore();
const accountMenuRef = ref<HTMLElement | null>(null);

// 导航配置
const navItems = [
    { panel: "dashboard", label: "工作台", section: "接待" },
    { panel: "chat", label: "接待中" },
    { panel: "queue", label: "排队队列" },
    { panel: "history", label: "历史会话" },
    { panel: "tools", label: "商品订单速查", section: "工具" },
    { panel: "settings", label: "个人设置" },
];

const currentPanel = ref("dashboard");
const chatCount = ref(0);
const queueCount = ref(0);

// 客服状态管理
type AgentStatus = "online" | "break" | "off";
const agentStatus = ref<AgentStatus>("online");
const showAccountMenu = ref(false);
const showLogoutConfirm = ref(false);
const logoutLoading = ref(false);

const statusOptions = [
    { value: "online", label: "在线" },
    { value: "break", label: "小休" },
    { value: "off", label: "下班" },
];

// 客服信息（从 store 获取）
const agentId = computed(() => userStore.G_LoginInfo.account || "CS001");
const agentName = computed(() => userStore.G_LoginInfo.nickName || "小翠");

// 切换面板
function switchPanel(panel: string) {
    currentPanel.value = panel;
}

// 从排队队列接入，跳转到接待中并注入新会话
function handleSwitchToChat(session: CustomerSession) {
    currentPanel.value = "chat";
    chatPanelRef.value?.injectSession(session);
}

// 排队中的会话有新消息（STOMP 实时推送），立即刷新排队列表
function handleQueueNewMessage() {
    queuePanelRef.value?.loadQueue();
}

// 会话结束 → 同步历史 + 今日接待数 +1
function handleSessionEnded(record: HistorySession) {
    historyPanelRef.value?.addRecord(record);
    dashboardPanelRef.value?.incrementTodayServed();
}

// 账号菜单
function toggleAccountMenu() {
    showAccountMenu.value = !showAccountMenu.value;
}

function onDocClick(e: MouseEvent) {
    if (
        accountMenuRef.value &&
        !accountMenuRef.value.contains(e.target as Node)
    ) {
        showAccountMenu.value = false;
    }
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        showAccountMenu.value = false;
        showLogoutConfirm.value = false;
    }
}

async function syncAgentStatus(status: AgentStatus, options?: { silent?: boolean; label?: string }) {
    try {
        const success = await ApiCustomer.updateStatus(status);
        if (success) {
            agentStatus.value = status;
            showAccountMenu.value = false;
            if (!options?.silent) {
                ElMessage.success(`状态已切换：${options?.label ?? status}`);
            }
        } else {
            if (!options?.silent) ElMessage.error("状态切换失败");
        }
    } catch (error) {
        console.error("切换状态失败:", error);
        if (!options?.silent) ElMessage.error("状态切换失败");
    }
}

async function setStatus(status: string, label: string) {
    await syncAgentStatus(status as AgentStatus, { label });
}

// 退出登录
function handleLogout() {
    showAccountMenu.value = false;
    showLogoutConfirm.value = true;
}

async function confirmLogout() {
    logoutLoading.value = true;
    try {
        await syncAgentStatus("off", { silent: true });
        await userStore.logout();
        showLogoutConfirm.value = false;
        ElMessage.success("已退出登录");
        await router.replace({ path: "/login" });
    } finally {
        logoutLoading.value = false;
    }
}

// 点击外部关闭状态菜单
onMounted(async () => {
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKeydown);

    // 连接WebSocket
    try {
        await customerWS.connect();
        console.log("[CustomerPage] WebSocket已连接");
        await syncAgentStatus("online", { silent: true });
    } catch (error) {
        console.error("[CustomerPage] WebSocket连接失败:", error);
    }
});

onUnmounted(() => {
    document.removeEventListener("click", onDocClick);
    window.removeEventListener("keydown", onKeydown);
    void syncAgentStatus("off", { silent: true });
    // 页面卸载时断开WebSocket
    customerWS.disconnect();
    console.log("[CustomerPage] WebSocket已断开");
});
</script>

<style scoped lang="scss">
.customer-workspace {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--cream);
}

/* 侧边栏 */
.sidebar {
    width: 220px;
    background: linear-gradient(180deg, #eaf1e4 0%, #d5e3d0 100%);
    border-right: 1px solid rgba(92, 131, 116, 0.2);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
}

.sidebar-header {
    height: 76px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 18px;
    border-bottom: 1px solid rgba(92, 131, 116, 0.15);
}

.logo-seal {
    width: 42px;
    height: 42px;
    background: var(--cinnabar);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-family: "STKaiti", serif;
    font-size: 22px;
    font-weight: 700;
    box-shadow: 0 3px 8px rgba(179, 60, 44, 0.3);
}

.sidebar-title {
    font-family: "STKaiti", serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
}

.sidebar-sub {
    font-size: 15px;
    color: var(--ink-muted);
    margin-top: 2px;
}

.nav {
    flex: 1;
    padding: 14px 0;
}

.nav-item {
    width: 100%;
    background: transparent;
    border: none;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: inherit;
    font-size: 17px;
    color: var(--ink-light);
    cursor: pointer;
    border-left: 4px solid transparent;
    transition: all 0.2s;
    text-align: left;

    &:hover {
        background: rgba(255, 255, 255, 0.4);
        color: var(--cinnabar);
    }

    &.active {
        background: rgba(255, 255, 255, 0.75);
        color: var(--cinnabar);
        font-weight: 600;
        border-left-color: var(--cinnabar);
    }
}

.nav-badge {
    margin-left: auto;
    background: var(--cinnabar);
    color: white;
    font-size: 14px;
    padding: 1px 7px;
    border-radius: 9px;
    font-weight: 700;

    &.gold {
        background: var(--gold);
    }
}

.sidebar-account-wrap {
    position: relative;
    padding: 10px 12px;
    border-top: 1px solid rgba(92, 131, 116, 0.15);
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.24);
}

.sidebar-account {
    width: 100%;
    border: none;
    border-radius: 12px;
    background: transparent;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-family: inherit;
    transition:
        background 0.16s,
        box-shadow 0.16s;

    &:hover,
    &.open {
        background: rgba(255, 255, 255, 0.82);
        box-shadow: 0 3px 14px rgba(60, 50, 30, 0.08);
    }
}

.account-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.account-meta {
    text-align: left;
}

.account-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
}

.account-role {
    font-size: 14px;
    color: var(--ink-muted);
    margin-top: 1px;
}

.account-menu {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: calc(100% + 6px);
    background: white;
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 8px 28px rgba(60, 50, 30, 0.12);
    padding: 6px 0;
    z-index: 200;
}

.account-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px 8px;
}

.account-avatar {
    flex-shrink: 0;
}

.account-sep {
    height: 1px;
    background: var(--line);
    margin: 4px 0;
}

.account-menu-item {
    width: 100%;
    height: 38px;
    border: none;
    background: transparent;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-family: inherit;
    color: var(--ink);
    cursor: pointer;
    transition:
        background 0.14s,
        color 0.14s;

    &:hover {
        background: var(--cream);
    }

    &.item-active {
        font-weight: 600;
        color: var(--jade);
    }

    &.danger {
        color: var(--cinnabar);
    }

    &.danger:hover {
        background: var(--cinnabar-soft);
    }
}

.account-menu-enter-active,
.account-menu-leave-active {
    transition:
        opacity 0.16s ease,
        transform 0.16s ease;
}

.account-menu-enter-from,
.account-menu-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

/* 主内容区 */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
}

.status-led {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.led-online {
        background: #2eae6f;
        box-shadow: 0 0 6px rgba(46, 174, 111, 0.6);
    }

    &.led-busy {
        background: var(--gold);
    }

    &.led-full {
        background: #e08a3e;
    }

    &.led-break {
        background: #999;
    }

    &.led-off {
        background: #555;
    }
}

.agent-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    color: white;
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

/* 所有面板绝对定位，撑满 .content */
.panel {
    position: absolute;
    inset: 0;
    animation: fadeIn 0.25s ease;
}

/* 带内边距 + 可滚动（除接待中外的所有面板）*/
.panel-scroll {
    overflow-y: auto;
    padding: 24px;
}

/* 接待中：铺满，内部自管理滚动 */
.panel-fill {
    overflow: hidden;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 退出确认弹窗 */
.logout-mask {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(44, 54, 57, 0.42);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logout-dialog {
    width: 360px;
    background: var(--paper, #fffef9);
    border: 1px solid rgba(232, 223, 208, 0.9);
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(44, 54, 57, 0.22), 0 4px 14px rgba(60, 50, 30, 0.1);
    padding: 36px 32px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.logout-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--cinnabar-soft, #fae5e0);
    color: var(--cinnabar, #b33c2c);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
}

.logout-title {
    font-family: "STKaiti", serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--ink, #2c3639);
    margin-bottom: 10px;
}

.logout-body {
    font-size: 15px;
    color: var(--ink-muted, #6b7c7a);
    line-height: 1.7;
    margin-bottom: 28px;
}

.logout-actions {
    display: flex;
    gap: 12px;
    width: 100%;
}

.logout-btn {
    flex: 1;
    height: 42px;
    border-radius: 11px;
    font-size: 15px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s;

    &.cancel {
        border: 1px solid rgba(216, 202, 183, 0.9);
        background: white;
        color: var(--ink-muted, #6b7c7a);

        &:hover {
            border-color: rgba(92, 131, 116, 0.4);
            color: var(--ink, #2c3639);
        }
    }

    &.confirm {
        border: none;
        background: var(--cinnabar, #b33c2c);
        color: white;
        box-shadow: 0 6px 16px rgba(179, 60, 44, 0.28);

        &:hover:not(:disabled) {
            background: #9c3325;
        }

        &:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }
    }
}

.logout-modal-enter-active,
.logout-modal-leave-active {
    transition: opacity 0.2s ease;

    .logout-dialog {
        transition: transform 0.2s ease, opacity 0.2s ease;
    }
}

.logout-modal-enter-from,
.logout-modal-leave-to {
    opacity: 0;

    .logout-dialog {
        transform: translateY(12px) scale(0.97);
        opacity: 0;
    }
}

/* Admin-aligned customer shell */
.customer-workspace {
    background: var(--cream, #faf6ee);
}

.sidebar {
    width: 240px;
    background: linear-gradient(180deg, #eaf1e4 0%, #d5e3d0 100%);
    border-right: 1px solid rgba(92, 131, 116, 0.18);
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
}

.sidebar-header {
    height: 64px;
    gap: 12px;
    padding: 0 20px;
}

.logo-seal {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    font-size: 20px;
    box-shadow: 0 3px 10px rgba(179, 60, 44, 0.28);
}

.sidebar-title {
    font-size: 18px;
}

.sidebar-sub {
    font-size: 11px;
    letter-spacing: 0.5px;
}

.nav {
    padding: 12px 10px;
}

.nav-section {
    padding: 12px 10px 6px;
    color: var(--ink-muted, #6b7c7a);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1px;
}

.nav-item {
    min-height: 40px;
    margin-bottom: 2px;
    padding: 10px 12px;
    border-left: none;
    border-radius: 9px;
    font-size: 14px;
    gap: 10px;
    color: var(--ink-light, #4a565a);

    &:hover {
        background: rgba(255, 255, 255, 0.5);
        color: #456660;
    }

    &.active {
        background: rgba(255, 255, 255, 0.82);
        color: var(--cinnabar, #b33c2c);
        border-left-color: transparent;
        box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    }
}

.nav-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.nav-badge {
    font-size: 11px;
    line-height: 18px;
    padding: 1px 7px;
}

.sidebar-account-wrap {
    padding: 10px 12px;
}

.sidebar-account {
    border-radius: 12px;
    padding: 8px;
    gap: 10px;
    background: rgba(255, 255, 255, 0.46);

    &:hover,
    &.open {
        background: rgba(255, 255, 255, 0.82);
    }
}

.agent-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--jade, #5c8374), #456660);
    font-size: 15px;
    box-shadow: 0 4px 12px rgba(69, 102, 96, 0.2);
}

.account-name {
    font-size: 13px;
    line-height: 1.25;
}

.account-role {
    font-size: 11px;
}

.account-menu {
    bottom: calc(100% + 8px);
    border-radius: 14px;
    border-color: rgba(232, 223, 208, 0.86);
    box-shadow:
        0 18px 38px rgba(60, 50, 30, 0.16),
        0 2px 8px rgba(60, 50, 30, 0.08);
    padding: 8px;
}

.account-profile {
    padding: 9px 9px 11px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.7);
    margin-bottom: 5px;
}

.account-sep {
    display: none;
}

.account-menu-item {
    height: 38px;
    border-radius: 9px;
    padding: 0 10px;
    font-size: 13px;
}

.main {
    background: var(--cream, #faf6ee);
}

.content {
    background:
        linear-gradient(180deg, rgba(255, 254, 249, 0.58), rgba(250, 246, 238, 0)),
        var(--cream, #faf6ee);
}

.panel-scroll {
    padding: 22px 24px;
}

.logout-dialog {
    border-radius: 18px;
}

:deep(.section-title) {
    margin-bottom: 16px;
    font-size: 20px;
    color: var(--ink, #2c3639);
}

:deep(.panel-card),
:deep(.col-card) {
    border-radius: 14px;
    border: 1px solid rgba(232, 223, 208, 0.72);
    box-shadow: 0 8px 24px rgba(60, 50, 30, 0.08);
    background: var(--paper, #fffef9);
}

:deep(.panel-card-head),
:deep(.session-head),
:deep(.chat-head) {
    min-height: 58px;
    padding: 12px 16px;
    background: linear-gradient(180deg, #fffef9 0%, #fbf8ef 100%);
}

:deep(.panel-card-head h3) {
    font-size: 16px;
}

:deep(.stats-grid) {
    gap: 12px;
}

:deep(.stat-card) {
    border-radius: 14px;
    padding: 18px 16px;
}

:deep(.stat-label),
:deep(.stat-foot),
:deep(.head-note),
:deep(.refresh-hint) {
    font-size: 13px;
}

:deep(.stat-value) {
    font-size: 28px;
}

:deep(.queue-table),
:deep(.history-table),
:deep(.order-table) {
    font-size: 14px;
}

:deep(.queue-table th),
:deep(.history-table th),
:deep(.order-table th) {
    padding: 11px 14px;
    font-size: 13px;
    font-weight: 600;
}

:deep(.queue-table td),
:deep(.history-table td),
:deep(.order-table td) {
    padding: 12px 14px;
}

:deep(.chat-layout) {
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 14px;
    padding: 16px;
}

:deep(.session-name),
:deep(.session-time),
:deep(.session-msg),
:deep(.chat-banner),
:deep(.msg-meta),
:deep(.bubble),
:deep(.send-row),
:deep(.chat-input),
:deep(.tool-btn),
:deep(.btn) {
    font-size: 14px;
}

:deep(.session-item) {
    padding: 11px 13px;
}

:deep(.chat-banner) {
    padding: 8px 16px;
}

:deep(.chat-body) {
    padding: 16px;
    gap: 12px;
}

:deep(.chat-input-area) {
    padding: 10px 12px;
}

:deep(.chat-input) {
    height: 68px;
}

:deep(.bubble) {
    border-radius: 11px;
    line-height: 1.55;
}

:deep(.msg-avatar),
:deep(.session-avatar) {
    width: 36px;
    height: 36px;
    font-size: 14px;
}

:deep(.send-btn) {
    border-radius: 8px;
    font-size: 14px;
}

:deep(.product-card),
:deep(.card-msg) {
    border-radius: 12px;
}

@media (max-width: 1024px) {
    .sidebar {
        width: 210px;
    }

    :deep(.chat-layout) {
        grid-template-columns: 280px minmax(0, 1fr);
    }
}

@media (max-width: 768px) {
    .customer-workspace {
        display: block;
        min-height: 100vh;
        overflow: auto;
    }

    .sidebar {
        position: relative;
        width: 100%;
        height: auto;
        min-height: auto;
    }

    .nav {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .nav-section {
        grid-column: 1 / -1;
    }

    .main {
        min-height: 720px;
    }

    :deep(.chat-layout) {
        grid-template-columns: 1fr;
    }
}
</style>
