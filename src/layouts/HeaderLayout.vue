<template>
    <header class="topbar">
        <div class="topbar-inner">
            <!-- Logo -->
            <div class="logo" @click="goHome">
                <div class="logo-seal">颐</div>
                <span>颐养阁</span>
            </div>

            <!-- Navigation -->
            <nav class="top-nav">
                <router-link to="/" :class="{ active: route.path === '/' }"
                    >养生智库</router-link
                >
                <router-link
                    to="/community"
                    :class="{ active: route.path.startsWith('/community') }"
                    >元气社区</router-link
                >
                <router-link
                    to="/ai-butler"
                    :class="{ active: route.path.startsWith('/ai-butler') }"
                    >AI 管家</router-link
                >
                <router-link
                    to="/consultation"
                    :class="{ active: route.path.startsWith('/consultation') }"
                    >名医健康圈</router-link
                >
                <router-link
                    to="/shop"
                    :class="{ active: route.path.startsWith('/shop') }"
                    >商城</router-link
                >
            </nav>

            <!-- Actions -->
            <div class="top-actions">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <span class="search-placeholder"
                        >搜索节气、食谱、穴位…</span
                    >
                </div>
                <el-dropdown
                    v-if="userStore.G_LoginInfo.isLogin"
                    trigger="click"
                    @visible-change="handleNotificationVisible"
                    @command="handleNotificationCommand"
                >
                    <div ref="bellRef" class="top-bell">
                        🔔
                        <span v-if="unreadCount > 0" class="badge-dot"></span>
                        <span v-if="unreadCount > 0" class="badge-count">{{
                            unreadCountLabel
                        }}</span>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="notification-menu">
                            <div
                                v-if="notifications.length > 0"
                                class="notification-menu-header"
                            >
                                <div>
                                    <div class="notification-menu-title">
                                        通知中心
                                    </div>
                                    <div class="notification-menu-subtitle">
                                        共 {{ totalNotificationCount }} 条，未读
                                        {{ unreadCount }} 条
                                    </div>
                                </div>
                                <div
                                    class="notification-menu-chip"
                                    :class="{ hot: unreadCount > 0 }"
                                >
                                    {{
                                        unreadCount > 0
                                            ? "有新消息"
                                            : "已全部读完"
                                    }}
                                </div>
                            </div>
                            <el-dropdown-item
                                v-if="notifications.length === 0"
                                disabled
                            >
                                暂无通知
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-for="item in notifications"
                                :key="item.id"
                                :command="{ type: 'detail', id: item.id }"
                            >
                                <div
                                    class="notification-item"
                                    :class="{ unread: !item.isRead }"
                                >
                                    <div class="notification-title">
                                        {{ item.title }}
                                    </div>
                                    <div class="notification-body">
                                        {{ item.body || "您有一条新通知" }}
                                    </div>
                                    <div class="notification-time">
                                        {{
                                            formatNotificationTime(
                                                item.createdAt,
                                            )
                                        }}
                                    </div>
                                </div>
                            </el-dropdown-item>
                            <!-- 查看更多通知入口 -->
                            <el-dropdown-item
                                v-if="notifications.length > 0"
                                command="viewAll"
                                divided
                            >
                                <div class="view-all-entry">查看更多通知</div>
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-if="
                                    notifications.length > 0 && unreadCount > 0
                                "
                                command="readAll"
                            >
                                全部标记已读
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div v-else class="top-bell">🔔</div>

                <!-- 未登录：点击跳转登录页 -->
                <div
                    v-if="!userStore.G_LoginInfo.isLogin"
                    class="avatar"
                    @click="goToLogin"
                >
                    用
                </div>

                <!-- 已登录：下拉菜单 -->
                <el-dropdown v-else trigger="click" @command="handleCommand">
                    <div class="avatar">
                        <img
                            v-if="userStore.G_UserInfo.avatar"
                            :src="userStore.G_UserInfo.avatar"
                            alt="头像"
                            class="avatar-img"
                        />
                        <span v-else>{{ displayInitial }}</span>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="user-menu">
                            <div class="user-menu-header">
                                <div class="user-menu-avatar">
                                    <img
                                        v-if="userStore.G_UserInfo.avatar"
                                        :src="userStore.G_UserInfo.avatar"
                                        alt="头像"
                                        class="user-menu-avatar-img"
                                    />
                                    <span v-else>{{ displayInitial }}</span>
                                </div>
                                <div class="user-menu-meta">
                                    <div class="user-menu-name">
                                        {{ userMenuName }}
                                    </div>
                                    <div class="user-menu-subtitle">
                                        {{ userMenuSubtitle }}
                                    </div>
                                </div>
                            </div>
                            <el-dropdown-item
                                command="settings"
                                class="user-menu-item"
                            >
                                <div class="user-menu-card">
                                    <span class="user-menu-icon">⚙</span>
                                    <div class="user-menu-text">
                                        <span class="user-menu-label"
                                            >我的设置</span
                                        >
                                        <span class="user-menu-desc"
                                            >查看账号资料与个人配置</span
                                        >
                                    </div>
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item
                                command="logout"
                                class="user-menu-item logout"
                            >
                                <div class="user-menu-card logout">
                                    <span class="user-menu-icon logout">↗</span>
                                    <div class="user-menu-text">
                                        <span class="user-menu-label"
                                            >退出登录</span
                                        >
                                        <span class="user-menu-desc"
                                            >安全退出当前账号</span
                                        >
                                    </div>
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

            <!-- 通知详情气泡弹窗 -->
            <el-popover
                v-model:visible="detailPopoverVisible"
                :virtual-ref="bellRef"
                trigger="manual"
                placement="bottom-end"
                :width="360"
                :show-arrow="true"
                popper-class="notification-detail-popover"
            >
                <div v-if="detailNotification" class="popover-detail"
                    :class="{ unread: !detailNotification.isRead }">
                    <div class="detail-banner">
                        <span class="detail-badge">{{
                            formatNotificationType(detailNotification.type)
                        }}</span>
                        <span
                            v-if="!detailNotification.isRead"
                            class="detail-unread"
                            >未读</span
                        >
                    </div>
                    <div class="detail-header">
                        <span class="detail-title">{{
                            detailNotification.title
                        }}</span>
                        <span
                            class="detail-close"
                            @click="detailPopoverVisible = false"
                            >✕</span
                        >
                    </div>
                    <div class="detail-body">
                        <div class="detail-body-label">通知内容</div>
                        <div class="detail-body-text">
                            {{ detailNotification.body || "暂无详细内容" }}
                        </div>
                    </div>
                    <div class="detail-time">
                        {{ formatDetailTime(detailNotification.createdAt) }}
                    </div>
                </div>
                <!-- 当没有通知时显示空状态，避免 Element Plus 报错 -->
                <div v-else class="popover-empty">
                    <div class="popover-empty-icon">🔔</div>
                    <div class="popover-empty-text">暂无通知详情</div>
                </div>
            </el-popover>
        </div>
    </header>

    <!-- 全部通知弹窗（根层级 + append-to-body，避免导航栏 z-index/overflow 影响） -->
    <el-dialog
        v-model="allNotificationsVisible"
        width="580px"
        :close-on-click-modal="true"
        :lock-scroll="false"
        destroy-on-close
        append-to-body
        custom-class="all-notifications-dialog"
    >
        <template #header>
            <div class="dialog-header">
                <span class="dot"></span>
                <span>全部通知</span>
            </div>
        </template>
        <div class="all-notifications-list" v-loading="allNotificationsLoading">
            <div v-if="allNotifications.length === 0" class="all-empty">
                <div class="all-empty-icon">🔔</div>
                <div>暂无通知</div>
            </div>
            <div
                v-for="item in allNotifications"
                :key="item.id"
                class="all-notif-card"
                :class="{ unread: !item.isRead }"
                @click="openDetailFromAll(item)"
            >
                <div class="all-notif-top">
                    <div class="all-notif-left">
                        <span class="unread-dot" v-if="!item.isRead"></span>
                        <span class="all-notif-title">{{ item.title }}</span>
                    </div>
                    <span class="all-notif-time">{{
                        formatNotificationTime(item.createdAt)
                    }}</span>
                </div>
                <div class="all-notif-body">{{ item.body || "暂无内容" }}</div>
            </div>
        </div>
        <div
            class="all-pagination"
            v-if="allNotificationsTotal > allNotificationsPageSize"
        >
            <el-pagination
                v-model:current-page="allNotificationsPage"
                :page-size="allNotificationsPageSize"
                :total="allNotificationsTotal"
                layout="prev, pager, next"
                small
                background
                @current-change="handleAllPageChange"
            />
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";
import { useExpertPresenceSocket } from "@/composables/useExpertPresenceSocket";
import { useNotificationSocket } from "@/composables/useNotificationSocket";
import { ApiNotification, type NotificationVO } from "@/network";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const displayInitial = computed(() => {
    const name =
        userStore.G_LoginInfo.nickName || userStore.G_LoginInfo.account;
    return name ? name.charAt(0) : "我";
});

/** 用户菜单显示名称 */
const userMenuName = computed(() => {
    return (
        userStore.G_LoginInfo.nickName ||
        userStore.G_LoginInfo.account ||
        "用户"
    );
});

/** 用户菜单副标题（角色信息） */
const userMenuSubtitle = computed(() => {
    const roleMap: Record<number, string> = {
        1: "管理员",
        2: "认证专家",
        3: "普通用户",
        4: "客服专员",
    };
    return roleMap[userStore.G_UserInfo.role_id] || "用户";
});

/** 当前登录用户是否为认证专家（role_id === 2） */
const isExpertView = computed(() => userStore.G_UserInfo.role_id === 2);

const { connect, disconnect } = useExpertPresenceSocket();
const { connect: connectNotifications, disconnect: disconnectNotifications } =
    useNotificationSocket();

const notifications = ref<NotificationVO[]>([]);

/** 未读通知数量（独立从服务端加载，保证准确性） */
const unreadCount = ref(0);
const unreadCountLabel = computed(() =>
    unreadCount.value > 99 ? "99+" : String(unreadCount.value),
);

/** 通知总数（用于判断是否显示"查看更多"入口） */
const totalNotificationCount = ref(0);

/** 铃铛元素引用（气泡弹窗定位用） */
const bellRef = ref<HTMLElement | null>(null);

/** 通知详情气泡弹窗 */
const detailPopoverVisible = ref(false);
const detailNotification = ref<NotificationVO | null>(null);

// 气泡弹窗打开时监听 document 点击以关闭
watch(detailPopoverVisible, (visible) => {
    if (visible) {
        nextTick(() =>
            document.addEventListener("click", closePopoverOnClickOutside),
        );
    } else {
        document.removeEventListener("click", closePopoverOnClickOutside);
    }
});

/** 点击弹窗外部时关闭气泡 */
function closePopoverOnClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // 点击气泡内部、下拉菜单、铃铛时不关闭
    if (
        target.closest(".el-popover") ||
        target.closest(".el-dropdown-menu") ||
        target.closest(".top-bell")
    ) {
        return;
    }
    detailPopoverVisible.value = false;
}

/** 全部通知弹窗 */
const allNotificationsVisible = ref(false);
const allNotifications = ref<NotificationVO[]>([]);
const allNotificationsLoading = ref(false);
const allNotificationsPage = ref(1);
const allNotificationsTotal = ref(0);
const allNotificationsPageSize = 10;

onMounted(() => {
    // 专家登录后全局建立 STOMP 连接，使在线状态对用户可见
    if (isExpertView.value && userStore.G_LoginInfo.id) {
        connect();
    }
    if (userStore.G_LoginInfo.isLogin && userStore.G_LoginInfo.id) {
        loadNotifications();
        loadUnreadCount();
        connectNotifications(
            userStore.G_LoginInfo.id,
            handleRealtimeNotification,
        );
    }
});

onUnmounted(() => {
    // 页面卸载时断开连接（浏览器关闭时 beforeunload 也会触发 STOMP DISCONNECT）
    if (isExpertView.value) {
        disconnect();
    }
    disconnectNotifications();
});

// 监听 userStore 异步加载完成后的变化，处理 onMounted 时 store 尚未就绪的竞态
watch(
    () => ({ expert: isExpertView.value, id: userStore.G_LoginInfo.id }),
    ({ expert, id }) => {
        if (expert && id) connect();
        else if (!expert) disconnect();
    },
    { immediate: true },
);

watch(
    () => ({
        login: userStore.G_LoginInfo.isLogin,
        id: userStore.G_LoginInfo.id,
    }),
    ({ login, id }) => {
        if (login && id) {
            loadNotifications();
            loadUnreadCount();
            connectNotifications(id, handleRealtimeNotification);
        } else {
            notifications.value = [];
            unreadCount.value = 0;
            totalNotificationCount.value = 0;
            disconnectNotifications();
        }
    },
    { immediate: true },
);

function goHome() {
    router.push("/");
}

function goToLogin() {
    router.push("/login");
}

async function handleCommand(command: string) {
    if (command === "settings") {
        await router.push("/settings");
    } else if (command === "logout") {
        if (isExpertView.value) disconnect(); // 主动登出时断开连接
        await userStore.logout(); // 本地状态已同步清除，几乎立即返回
        ElMessage.success("已退出登录");
        await router.push("/login"); // 直接跳登录页，不再绕道首页
    }
}

/** 加载未读通知数量（独立请求，保证角标准确） */
async function loadUnreadCount() {
    if (!userStore.G_LoginInfo.isLogin) return;
    try {
        const res = await ApiNotification.listMyNotifications(1, 1, true);
        unreadCount.value = (res as any)?.data?.data?.total ?? 0;
    } catch {
        unreadCount.value = 0;
    }
}

async function loadNotifications() {
    if (!userStore.G_LoginInfo.isLogin) return;
    try {
        const res = await ApiNotification.listMyNotifications(1, 3);
        notifications.value = (res as any)?.data?.data?.records ?? [];
        totalNotificationCount.value = (res as any)?.data?.data?.total ?? 0;
    } catch {
        notifications.value = [];
    }
}

function handleRealtimeNotification(notification: NotificationVO) {
    // 追加到下拉列表头部，保持最多 3 条
    notifications.value = [
        notification,
        ...notifications.value.filter((item) => item.id !== notification.id),
    ].slice(0, 3);
    totalNotificationCount.value++;
    unreadCount.value++;
    ElMessage.info(notification.body || notification.title);
}

async function handleNotificationVisible(visible: boolean) {
    if (visible) {
        detailPopoverVisible.value = false; // 关掉可能打开的气泡
        await Promise.all([loadNotifications(), loadUnreadCount()]);
    }
}

async function handleNotificationCommand(
    command: string | { type: string; id?: number },
) {
    if (command === "readAll") {
        await ApiNotification.markAllRead();
        notifications.value = sortNotifications(
            notifications.value.map(
                (item) => ({ ...item, isRead: true }) as NotificationVO,
            ),
        );
        unreadCount.value = 0;
        return;
    }
    if (command === "viewAll") {
        openAllNotifications();
        return;
    }
    if (
        typeof command === "object" &&
        command.type === "detail" &&
        command.id != null
    ) {
        const notif = notifications.value.find((n) => n.id === command.id);
        if (notif) await openDetail(notif);
        return;
    }
}

function formatNotificationTime(value: string) {
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return "";
    const diff = Date.now() - time;
    if (diff < 60_000) return "刚刚";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
    return new Date(value).toLocaleDateString();
}

/** 通知详情页的完整时间格式 */
function formatDetailTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
}

/** 将通知类型码转换为可读中文标签 */
function formatNotificationType(type: string) {
    const map: Record<string, string> = {
        "expert.approved": "专家审核",
        "consult.transfer_request": "转人工请求",
    };
    return map[type] || "系统通知";
}

/** 对通知列表按时间倒序排序（最新的在前） */
function sortNotifications(list: NotificationVO[]): NotificationVO[] {
    return [...list].sort((a, b) => {
        return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    });
}

/** 标记单个通知为已读 */
async function markNotificationAsRead(notification: NotificationVO) {
    if (notification.isRead) return;
    try {
        await ApiNotification.markRead(notification.id);
        // 更新本地状态
        notification.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
        console.error("标记通知已读失败:", error);
    }
}

/** 打开通知详情气泡弹窗，同时标记该通知已读 */
async function openDetail(notification: NotificationVO) {
    detailNotification.value = notification;
    detailPopoverVisible.value = true;
    await markNotificationAsRead(notification);
}

/** 从全部通知弹窗中点击单条，打开详情 */
async function openDetailFromAll(item: NotificationVO) {
    allNotificationsVisible.value = false;
    // 等弹窗关闭后再打开详情弹窗
    setTimeout(() => openDetail(item), 200);
}

/** 打开全部通知弹窗 */
function openAllNotifications() {
    allNotificationsPage.value = 1;
    allNotificationsVisible.value = true;
    loadAllNotifications(1);
}

/** 加载全部通知（分页） */
async function loadAllNotifications(page: number) {
    allNotificationsLoading.value = true;
    try {
        const res = await ApiNotification.listMyNotifications(
            page,
            allNotificationsPageSize,
        );
        allNotifications.value = sortNotifications(
            (res as any)?.data?.data?.records ?? [],
        );
        allNotificationsTotal.value = (res as any)?.data?.data?.total ?? 0;
    } catch {
        allNotifications.value = [];
    } finally {
        allNotificationsLoading.value = false;
    }
}

/** 全部通知弹窗分页切换 */
function handleAllPageChange(page: number) {
    allNotificationsPage.value = page;
    loadAllNotifications(page);
}
</script>

<style scoped lang="scss">
.topbar {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line);
    position: sticky;
    top: 0;
    z-index: 100;
}

.topbar-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 14px 40px;
    display: flex;
    align-items: center;
    gap: 32px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "STKaiti", "KaiTi", serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--jade);
    cursor: pointer;
    flex-shrink: 0;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.85;
    }
}

.logo-seal {
    width: 36px;
    height: 36px;
    background: var(--cinnabar);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-size: 16px;
    font-family: "STKaiti", "KaiTi", serif;
    box-shadow: 0 2px 6px rgba(179, 60, 44, 0.3);
    flex-shrink: 0;
}

.top-nav {
    display: flex;
    gap: 26px;
    font-size: 14px;
    flex: 1;

    a {
        color: var(--ink-muted);
        text-decoration: none;
        padding: 4px 0;
        position: relative;
        transition: color 0.2s;
        white-space: nowrap;

        &:hover,
        &.active {
            color: var(--jade);
        }

        &.active::after {
            content: "";
            position: absolute;
            bottom: -18px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--jade);
            border-radius: 2px;
        }
    }
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    margin-left: auto;
}

.search-box {
    background: var(--cream);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 13px;
    width: 220px;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
        border-color: var(--jade-light);
    }

    .search-icon {
        font-size: 13px;
        flex-shrink: 0;
    }
    .search-placeholder {
        color: var(--ink-muted);
        font-size: 13px;
    }
}

.top-bell {
    font-size: 18px;
    position: relative;
    cursor: pointer;
    line-height: 1;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    .badge-dot {
        position: absolute;
        top: -2px;
        right: -4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--cinnabar);
        border: 1.5px solid white;
    }

    .badge-count {
        position: absolute;
        top: -8px;
        right: -12px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--cinnabar);
        color: white;
        border: 1.5px solid white;
        font-size: 10px;
        line-height: 14px;
        text-align: center;
        box-sizing: border-box;
    }
}

:deep(.notification-menu) {
    width: 320px;
    max-height: 380px;
    overflow-y: auto;
}

:deep(.notification-menu .el-dropdown-menu__item) {
    white-space: normal;
    line-height: 1.4;
}

.notification-item {
    width: 280px;
    padding: 4px 0;
    color: var(--ink);
}

.notification-item.unread .notification-title {
    color: var(--jade);
}

.notification-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 3px;
}

.notification-body {
    color: var(--ink-muted);
    font-size: 12px;
}

.notification-time {
    color: var(--ink-muted);
    opacity: 0.75;
    font-size: 11px;
    margin-top: 4px;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--jade));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: var(--shadow);
    flex-shrink: 0;
    transition: transform 0.2s;
    overflow: hidden;

    &:hover {
        transform: scale(1.06);
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    }
}

// el-dropdown 触发器样式重置
:deep(.el-dropdown) {
    display: flex;
    align-items: center;
}

/* 查看更多通知入口 */
.view-all-entry {
    text-align: center;
    color: var(--jade);
    font-size: 13px;
    font-weight: 500;
    width: 100%;
}

/* 全部通知弹窗 - 标题 */
.dialog-header {
    font-family: "STKaiti", "KaiTi", serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 10px;

    .dot {
        width: 4px;
        height: 16px;
        background: var(--jade);
        border-radius: 2px;
        flex-shrink: 0;
    }
}

/* 全部通知弹窗 - 列表 */
.all-notifications-list {
    min-height: 120px;
    max-height: 420px;
    overflow-y: auto;
}

.all-empty {
    text-align: center;
    color: var(--ink-muted);
    padding: 50px 0;
    font-size: 14px;
}

.all-empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
    opacity: 0.6;
}

.all-notif-card {
    background: var(--paper-warm);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 10px;
    cursor: pointer;
    border: 1px solid var(--line-soft);
    transition: all 0.2s;

    &:hover {
        border-color: var(--jade-light);
        box-shadow: var(--shadow);
        transform: translateY(-1px);
    }

    &:last-child {
        margin-bottom: 0;
    }

    &.unread {
        background: linear-gradient(135deg, var(--paper), var(--jade-soft));
        border-color: rgba(92, 131, 116, 0.15);
    }
}

.all-notif-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.all-notif-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--cinnabar);
    flex-shrink: 0;
    box-shadow: 0 0 4px rgba(179, 60, 44, 0.3);
}

.all-notif-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.all-notif-card.unread .all-notif-title {
    font-weight: 600;
}

.all-notif-time {
    font-size: 12px;
    color: var(--ink-muted);
    flex-shrink: 0;
    margin-left: 16px;
}

.all-notif-body {
    font-size: 13px;
    color: var(--ink-muted);
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 16px;
}

.all-pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid var(--line-soft);
}

/* 用户下拉菜单样式 */
:deep(.user-menu) {
    min-width: 280px;
    padding: 0;
}

.user-menu-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, var(--paper), var(--jade-soft));
    border-bottom: 1px solid var(--line-soft);
}

.user-menu-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--jade));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 18px;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(92, 131, 116, 0.2);
}

.user-menu-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-menu-meta {
    flex: 1;
    min-width: 0;
}

.user-menu-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-menu-subtitle {
    font-size: 12px;
    color: var(--ink-muted);
}

:deep(.user-menu-item) {
    padding: 0;
    margin: 0;
}

.user-menu-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    width: 100%;
    transition: background-color 0.2s;
}

.user-menu-icon {
    font-size: 18px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cream);
    border-radius: 8px;
    flex-shrink: 0;
}

.user-menu-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-menu-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
}

.user-menu-desc {
    font-size: 12px;
    color: var(--ink-muted);
}

.user-menu-card.logout .user-menu-icon {
    background: rgba(179, 60, 44, 0.1);
    color: var(--cinnabar);
}

.user-menu-card.logout .user-menu-label {
    color: var(--cinnabar);
}

:deep(.user-menu-item:hover) .user-menu-card {
    background: var(--cream);
}

@media (max-width: 900px) {
    .topbar-inner {
        padding: 12px 20px;
        gap: 16px;
    }
    .search-box {
        display: none;
    }
    .top-nav {
        gap: 14px;
        font-size: 13px;
    }
}
</style>

<!-- 气泡弹窗样式（非 scoped，因为 el-popover 内容会 teleport 到 body） -->
<style lang="scss">
.notification-detail-popover {
    padding: 16px !important;

    .detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .detail-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--ink);
    }

    .detail-close {
        font-size: 14px;
        color: var(--ink-muted);
        cursor: pointer;
        line-height: 1;
        padding: 2px 4px;
        transition: color 0.15s;

        &:hover {
            color: var(--ink);
        }
    }

    .detail-type {
        margin-bottom: 12px;
    }

    .detail-body {
        font-size: 14px;
        line-height: 1.8;
        color: var(--ink);
        margin-bottom: 12px;
        white-space: pre-wrap;
    }

    .detail-time {
        font-size: 12px;
        color: var(--ink-muted);
    }

    /* 空状态样式 */
    .popover-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        text-align: center;

        .popover-empty-icon {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.6;
        }

        .popover-empty-text {
            font-size: 14px;
            color: var(--ink-muted);
        }
    }
}

/* 全部通知弹窗全局覆盖 */
.all-notifications-dialog {
    border-radius: 14px;
    overflow: hidden;

    .el-dialog__header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--line-soft);
    }

    .el-dialog__body {
        padding: 16px 24px 20px;
    }

    .el-dialog__headerbtn {
        top: 20px;
        right: 20px;
    }
}
</style>
