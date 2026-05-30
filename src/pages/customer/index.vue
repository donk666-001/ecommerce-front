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
                    <span class="nav-icon">{{ item.icon }}</span>
                    <span>{{ item.label }}</span>
                    <span
                        v-if="item.badge"
                        class="nav-badge"
                        :class="{ gold: item.badgeType === 'gold' }"
                    >
                        {{ item.badge }}
                    </span>
                </button>
            </nav>

            <div class="sidebar-footer">v1.0 · 颐养阁 © 2026</div>
        </aside>

        <!-- 主内容区 -->
        <div class="main">
            <!-- 顶部栏 -->
            <div class="topbar">
                <div class="breadcrumb">
                    客服中心 /
                    <span class="current">{{ currentPanelLabel }}</span>
                </div>
                <div class="topbar-right">
                    <!-- 状态选择器 -->
                    <div class="status-selector" @click="toggleStatusMenu">
                        <span
                            class="status-led"
                            :class="`led-${agentStatus}`"
                        ></span>
                        <span>{{ statusText }}</span>
                        <span style="font-size: 10px; color: var(--ink-muted)"
                            >▼</span
                        >

                        <div v-show="showStatusMenu" class="status-menu">
                            <div
                                v-for="status in statusOptions"
                                :key="status.value"
                                class="status-menu-item"
                                @click="setStatus(status.value, status.label)"
                            >
                                <span
                                    class="status-led"
                                    :class="`led-${status.value}`"
                                ></span>
                                <span>{{ status.label }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 客服信息 -->
                    <div class="agent-card">
                        <div class="agent-avatar">{{ agentName[0] }}</div>
                        <div>
                            <div class="agent-name">{{ agentName }}</div>
                            <div class="agent-meta">
                                {{ agentId }} · {{ agentRole }}
                            </div>
                        </div>
                    </div>

                    <button class="logout" @click="handleLogout">退出</button>
                </div>
            </div>

            <!-- 内容面板 -->
            <div class="content">
                <!-- 工作台面板 -->
                <div v-show="currentPanel === 'dashboard'" class="panel active">
                    <DashboardPanel />
                </div>

                <!-- 接待中面板 -->
                <div v-show="currentPanel === 'chat'" class="panel active">
                    <ChatPanel />
                </div>

                <!-- 排队队列面板 -->
                <div v-show="currentPanel === 'queue'" class="panel active">
                    <QueuePanel />
                </div>

                <!-- 历史会话面板 -->
                <div v-show="currentPanel === 'history'" class="panel active">
                    <HistoryPanel />
                </div>

                <!-- 商品订单速查面板 -->
                <div v-show="currentPanel === 'tools'" class="panel active">
                    <ToolsPanel />
                </div>

                <!-- 个人设置面板 -->
                <div v-show="currentPanel === 'settings'" class="panel active">
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
import { ApiCustomer } from "@/network/customer";
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
const userStore = useUserStore();

// 导航配置
const navItems = [
    { panel: "dashboard", icon: "📊", label: "工作台" },
    { panel: "chat", icon: "💬", label: "接待中", badge: 3 },
    {
        panel: "queue",
        icon: "⏳",
        label: "排队队列",
        badge: 2,
        badgeType: "gold",
    },
    { panel: "history", icon: "📜", label: "历史会话" },
    { panel: "tools", icon: "🔍", label: "商品订单速查" },
    { panel: "settings", icon: "⚙️", label: "个人设置" },
];

const currentPanel = ref("dashboard");

// 面包屑标签映射
const panelLabels: Record<string, string> = {
    dashboard: "工作台",
    chat: "接待中",
    queue: "排队队列",
    history: "历史会话",
    tools: "商品订单速查",
    settings: "个人设置",
};

const currentPanelLabel = computed(() => panelLabels[currentPanel.value]);

// 客服状态管理
const agentStatus = ref<"online" | "break" | "off">("online");
const showStatusMenu = ref(false);

const statusText = computed(() => {
    const map = { online: "在线", break: "小休", off: "下班" };
    return map[agentStatus.value];
});

const statusOptions = [
    { value: "online", label: "在线" },
    { value: "break", label: "小休" },
    { value: "off", label: "下班" },
];

// 客服信息（从 store 获取）
const agentId = computed(() => userStore.G_LoginInfo.account || "CS001");
const agentName = computed(() => userStore.G_LoginInfo.nickName || "小翠");
const agentRole = computed(() => {
    const roleMap: Record<number, string> = {
        4: "售前客服",
    };
    return roleMap[userStore.G_UserInfo.role_id] || "客服";
});

// 切换面板
function switchPanel(panel: string) {
    currentPanel.value = panel;
}

// 状态菜单
function toggleStatusMenu() {
    showStatusMenu.value = !showStatusMenu.value;
}

async function setStatus(status: string, label: string) {
    try {
        const success = await ApiCustomer.updateStatus(status as any);
        if (success) {
            agentStatus.value = status as any;
            showStatusMenu.value = false;
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
        showStatusMenu.value = false;
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
    font-size: 20px;
    font-weight: 700;
    box-shadow: 0 3px 8px rgba(179, 60, 44, 0.3);
}

.sidebar-title {
    font-family: "STKaiti", serif;
    font-size: 17px;
    font-weight: 600;
    color: var(--ink);
}

.sidebar-sub {
    font-size: 11px;
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
    font-size: 14px;
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

.nav-icon {
    width: 18px;
    font-size: 16px;
    text-align: center;
}

.nav-badge {
    margin-left: auto;
    background: var(--cinnabar);
    color: white;
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 9px;
    font-weight: 700;

    &.gold {
        background: var(--gold);
    }
}

.sidebar-footer {
    padding: 14px;
    text-align: center;
    font-size: 11px;
    color: var(--ink-muted);
    border-top: 1px solid rgba(92, 131, 116, 0.15);
}

/* 主内容区 */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.topbar {
    height: 64px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line);
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.breadcrumb {
    font-size: 15px;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 8px;

    .current {
        color: var(--ink);
        font-weight: 500;
    }
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.status-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--paper-warm);
    cursor: pointer;
    font-size: 13px;
    position: relative;

    &:hover {
        border-color: var(--jade);
    }
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

.status-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 6px;
    background: white;
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    min-width: 160px;
    z-index: 100;
}

.status-menu-item {
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    cursor: pointer;

    &:hover {
        background: var(--cream);
    }
}

.agent-card {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
}

.agent-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    color: white;
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.agent-name {
    font-weight: 600;
}

.agent-meta {
    font-size: 11px;
    color: var(--ink-muted);
}

.logout {
    background: transparent;
    border: none;
    color: var(--ink-muted);
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;

    &:hover {
        color: var(--cinnabar);
    }
}

.content {
    flex: 1;
    overflow: auto;
    padding: 24px;
}

.panel {
    animation: fadeIn 0.25s ease;
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
