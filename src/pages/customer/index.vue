<template>
    <div class="customer-workspace">
        <!-- 侧边栏 -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-seal">颐</div>
                <div>
                    <div class="sidebar-title">客服工作台</div>
                    <div class="sidebar-sub">颐养阁官方店铺</div>
                </div>
            </div>

            <nav class="nav">
                <button
                    v-for="item in navItems"
                    :key="item.panel"
                    class="nav-item"
                    :class="{ active: currentPanel === item.panel }"
                    @click="switchPanel(item.panel)"
                >
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
            </nav>

            <div class="sidebar-account-wrap">
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
                    />
                </div>

                <!-- 排队队列面板 -->
                <div
                    v-show="currentPanel === 'queue'"
                    class="panel panel-scroll"
                >
                    <QueuePanel
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
const userStore = useUserStore();

// 导航配置
const navItems = [
    { panel: "dashboard", label: "工作台" },
    { panel: "chat", label: "接待中" },
    { panel: "queue", label: "排队队列" },
    { panel: "history", label: "历史会话" },
    { panel: "tools", label: "商品订单速查" },
    { panel: "settings", label: "个人设置" },
];

const currentPanel = ref("dashboard");
const chatCount = ref(0);
const queueCount = ref(0);

// 客服状态管理
const agentStatus = ref<"online" | "break" | "off">("online");
const showAccountMenu = ref(false);

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

// 会话结束 → 同步历史 + 今日接待数 +1
function handleSessionEnded(record: HistorySession) {
    historyPanelRef.value?.addRecord(record);
    dashboardPanelRef.value?.incrementTodayServed();
}

// 账号菜单
function toggleAccountMenu() {
    showAccountMenu.value = !showAccountMenu.value;
}

async function setStatus(status: string, label: string) {
    try {
        const success = await ApiCustomer.updateStatus(status as any);
        if (success) {
            agentStatus.value = status as any;
            showAccountMenu.value = false;
            ElMessage.success(`状态已切换：${label}`);
        } else {
            ElMessage.error("状态切换失败");
        }
    } catch (error) {
        console.error("切换状态失败:", error);
        ElMessage.error("状态切换失败");
    }
}

// 退出登录
async function handleLogout() {
    if (!confirm("确认退出工作台？所有进行中的会话将释放并重新分配。")) return;
    await userStore.logout();
    ElMessage.success("已退出登录");
    router.push("/customer/login");
}

// 点击外部关闭状态菜单
onMounted(async () => {
    document.addEventListener("click", () => {
        showAccountMenu.value = false;
    });

    // 连接WebSocket
    try {
        await customerWS.connect();
        console.log("[CustomerPage] WebSocket已连接");
    } catch (error) {
        console.error("[CustomerPage] WebSocket连接失败:", error);
    }
});

onUnmounted(() => {
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
    background: linear-gradient(180deg, var(--jade-pale) 0%, #d9e5d1 100%);
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
</style>
