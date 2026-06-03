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
                <router-link to="/" :class="{ active: route.path === '/' }">养生智库</router-link>
                <router-link to="/community" :class="{ active: route.path.startsWith('/community') }">元气社区</router-link>
                <router-link to="/ai-butler" :class="{ active: route.path.startsWith('/ai-butler') }">AI 管家</router-link>
                <router-link to="/consultation" :class="{ active: route.path.startsWith('/consultation') }">名医健康圈</router-link>
                <router-link to="/shop" :class="{ active: route.path.startsWith('/shop') }">商城</router-link>
            </nav>

            <!-- Actions -->
            <div class="top-actions">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <span class="search-placeholder">搜索节气、食谱、穴位…</span>
                </div>
                <el-dropdown
                    v-if="userStore.G_LoginInfo.isLogin"
                    trigger="click"
                    :teleported="false"
                    :popper-options="{ strategy: 'fixed' }"
                    @visible-change="handleNotificationVisible"
                    @command="handleNotificationCommand"
                >
                    <div ref="bellRef" class="top-bell">
                        🔔
                        <span v-if="unreadCount > 0" class="badge-dot"></span>
                        <span v-if="unreadCount > 0" class="badge-count">{{ unreadCountLabel }}</span>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="notification-menu">
                            <div v-if="notifications.length > 0" class="notification-menu-header">
                                <div>
                                    <div class="notification-menu-title">通知中心</div>
                                    <div class="notification-menu-subtitle">
                                        共 {{ totalNotificationCount }} 条，未读 {{ unreadCount }} 条
                                    </div>
                                </div>
                                <div class="notification-menu-chip" :class="{ hot: unreadCount > 0 }">
                                    {{ unreadCount > 0 ? "有新消息" : "已全部读完" }}
                                </div>
                            </div>
                            <el-dropdown-item v-if="notifications.length === 0" disabled>
                                暂无通知
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-for="item in notifications"
                                :key="item.id"
                                :command="{ type: 'detail', id: item.id }"
                                class="notification-menu-item"
                            >
                                <div class="notification-item" :class="{ unread: !item.isRead }">
                                    <div class="notification-title">{{ item.title }}</div>
                                    <div class="notification-body">{{ item.body || '您有一条新通知' }}</div>
                                    <div class="notification-time">{{ formatNotificationTime(item.createdAt) }}</div>
                                </div>
                            </el-dropdown-item>
                            <!-- 查看更多通知入口 -->
                            <el-dropdown-item
                                v-if="notifications.length > 0"
                                command="viewAll"
                                divided
                                class="notification-menu-footer"
                            >
                                <div class="notification-menu-cta">
                                    <div class="view-all-entry">
                                        <span>查看更多通知</span>
                                        <span class="view-all-arrow">›</span>
                                    </div>
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-if="notifications.length > 0 && unreadCount > 0"
                                command="readAll"
                                class="notification-menu-action"
                            >
                                <div class="read-all-entry">
                                    <span class="read-all-icon">✓</span>
                                    <span>全部标记已读</span>
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div v-else class="top-bell">
                    🔔
                </div>

                <!-- 未登录：点击跳转登录页 -->
                <div v-if="!userStore.G_LoginInfo.isLogin" class="avatar" @click="goToLogin">
                    用
                </div>

                <!-- 已登录：下拉菜单 -->
                <el-dropdown
                    v-else
                    trigger="click"
                    :teleported="false"
                    :popper-options="{ strategy: 'fixed' }"
                    @command="handleCommand"
                >
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
                                    <div class="user-menu-name">{{ userMenuName }}</div>
                                    <div class="user-menu-subtitle">{{ userMenuSubtitle }}</div>
                                </div>
                            </div>
                            <el-dropdown-item command="settings" class="user-menu-item">
                                <div class="user-menu-card">
                                    <span class="user-menu-icon">⚙</span>
                                    <div class="user-menu-text">
                                        <span class="user-menu-label">我的设置</span>
                                        <span class="user-menu-desc">查看账号资料与个人配置</span>
                                    </div>
                                </div>
                            </el-dropdown-item>
                            <el-dropdown-item command="logout" class="user-menu-item logout">
                                <div class="user-menu-card logout">
                                    <span class="user-menu-icon logout">↗</span>
                                    <div class="user-menu-text">
                                        <span class="user-menu-label">退出登录</span>
                                        <span class="user-menu-desc">安全退出当前账号</span>
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
                <template v-if="detailNotification">
                    <div
                        class="popover-detail"
                        :class="{ unread: !detailNotification.isRead }"
                    >
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
                </template>
            </el-popover>
        </div>
    </header>

    <!-- 全部通知弹窗（根层级 + append-to-body，避免导航栏 z-index/overflow 影响） -->
    <el-dialog
        v-model="allNotificationsVisible"
        width="920px"
        :close-on-click-modal="true"
        align-center
        destroy-on-close
        append-to-body
        custom-class="all-notifications-dialog"
    >
        <template #header>
            <div class="dialog-header">
                <div class="dialog-header-main">
                    <span class="dot"></span>
                    <span>全部通知</span>
                </div>
            </div>
        </template>
        <div class="dialog-toolbar">
            <div class="toolbar-meta">
                <span>未读 {{ unreadCount }}</span>
                <span class="toolbar-sep">·</span>
                <span>当前页 {{ allNotifications.length }}</span>
                <span class="toolbar-sep">·</span>
                <span>{{
                    allNotificationsFilter === "all" ? "全部通知" : "仅未读通知"
                }}</span>
            </div>
            <div class="filter-pills" role="tablist" aria-label="通知筛选">
                <button
                    class="filter-pill"
                    :class="{ active: allNotificationsFilter === 'all' }"
                    type="button"
                    @click="handleFilterChange('all')"
                >
                    全部
                </button>
                <button
                    class="filter-pill"
                    :class="{ active: allNotificationsFilter === 'unread' }"
                    type="button"
                    @click="handleFilterChange('unread')"
                >
                    未读
                </button>
            </div>
        </div>
        <div class="all-notifications-list" v-loading="allNotificationsLoading">
            <div v-if="allNotifications.length === 0" class="all-empty">
                <div class="all-empty-icon">🔔</div>
                <div>
                    {{
                        allNotificationsFilter === "all"
                            ? "暂无通知"
                            : "暂无未读通知"
                    }}
                </div>
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
            <div
                v-for="index in allNotificationsPlaceholderCount"
                :key="`placeholder-${index}`"
                class="all-notif-card placeholder"
                aria-hidden="true"
            />
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
                @current-change="handleAllPageChange"
            />
        </div>
    </el-dialog>

    <el-dialog
        v-model="detailDialogVisible"
        width="560px"
        align-center
        append-to-body
        destroy-on-close
        custom-class="notification-detail-dialog"
    >
        <template #header>
            <div v-if="detailNotification" class="detail-dialog-header">
                <div class="detail-dialog-banner">
                    <span class="detail-dialog-badge">{{
                        formatNotificationType(detailNotification.type)
                    }}</span>
                    <span
                        v-if="!detailNotification.isRead"
                        class="detail-dialog-unread"
                        >未读</span
                    >
                </div>
                <div class="detail-dialog-title">
                    {{ detailNotification.title }}
                </div>
            </div>
        </template>
        <template v-if="detailNotification">
            <div class="detail-dialog-body">
                <div class="detail-dialog-section-label">通知内容</div>
                <div class="detail-dialog-content">
                    {{ detailNotification.body || "暂无详细内容" }}
                </div>
                <div class="detail-dialog-meta">
                    <span>{{
                        formatDetailTime(detailNotification.createdAt)
                    }}</span>
                </div>
            </div>
        </template>
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
    const name = userStore.G_LoginInfo.nickName || userStore.G_LoginInfo.account;
    return name ? name.charAt(0) : "我";
});

const userMenuName = computed(
    () =>
        userStore.G_LoginInfo.nickName ||
        userStore.G_LoginInfo.account ||
        "当前用户",
);
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
const detailDialogVisible = ref(false);

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
const allNotificationsPageSize = 8;
const allNotificationsFilter = ref<"all" | "unread">("all");
const allNotificationsPlaceholderCount = computed(() =>
    allNotifications.value.length === 0
        ? 0
        : Math.max(0, allNotificationsPageSize - allNotifications.value.length),
);

function getNotificationSortTime(notification: NotificationVO) {
    const time = new Date(notification.createdAt).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function sortNotifications(items: NotificationVO[]) {
    return [...items].sort((a, b) => {
        if (a.isRead !== b.isRead) {
            return Number(a.isRead) - Number(b.isRead);
        }
        return getNotificationSortTime(b) - getNotificationSortTime(a);
    });
}

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
    { immediate: true }
);

watch(
    () => ({ login: userStore.G_LoginInfo.isLogin, id: userStore.G_LoginInfo.id }),
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
    { immediate: true }
);

function goHome() {
    router.push("/");
}

function goToLogin() {
    router.push("/login");
}

async function handleCommand(command: string) {
    if (command === "settings") {
        router.push("/settings");
    } else if (command === "logout") {
        if (isExpertView.value) disconnect(); // 主动登出时断开连接
        await userStore.logout(); // 本地状态已同步清除，几乎立即返回
        ElMessage.success("已退出登录");
        router.push("/login"); // 直接跳登录页，不再绕道首页
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
        const [recentRes, unreadRes] = await Promise.all([
            ApiNotification.listMyNotifications(1, 3),
            ApiNotification.listMyNotifications(1, 3, true),
        ]);
        const recentRecords = (recentRes as any)?.data?.data?.records ?? [];
        const unreadRecords = (unreadRes as any)?.data?.data?.records ?? [];
        const merged = [...unreadRecords, ...recentRecords].reduce<
            NotificationVO[]
        >((acc, item) => {
            if (!acc.some((current) => current.id === item.id)) {
                acc.push(item);
            }
            return acc;
        }, []);
        notifications.value = sortNotifications(merged).slice(0, 3);
        totalNotificationCount.value =
            (recentRes as any)?.data?.data?.total ?? 0;
    } catch {
        notifications.value = [];
    }
}

async function markNotificationAsRead(notification: NotificationVO) {
    if (notification.isRead) return;
    try {
        await ApiNotification.markRead(notification.id);
        notification.isRead = true;
        if (unreadCount.value > 0) unreadCount.value--;
        notifications.value = sortNotifications(
            notifications.value.map((item) =>
                item.id === notification.id
                    ? ({ ...item, isRead: true } as NotificationVO)
                    : item,
            ),
        );
        allNotifications.value = sortNotifications(
            allNotifications.value.map((item) =>
                item.id === notification.id
                    ? ({ ...item, isRead: true } as NotificationVO)
                    : item,
            ),
        );
        if (unreadCount.value > 0) {
            await loadNotifications();
        }
    } catch {
        // 标记已读失败不影响详情查看
    }
}

function handleRealtimeNotification(notification: NotificationVO) {
    // 下拉列表保持未读优先，其次按时间倒序，最终只展示 3 条
    notifications.value = sortNotifications([
        notification,
        ...notifications.value.filter((item) => item.id !== notification.id),
    ]).slice(0, 3);
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

async function handleNotificationCommand(command: string | { type: string; id?: number }) {
    if (command === "readAll") {
        await ApiNotification.markAllRead();
        notifications.value = sortNotifications(
            notifications.value.map(item => ({ ...item, isRead: true } as NotificationVO))
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
        if (notif) openDetail(notif);
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

/** 打开通知详情气泡弹窗，同时标记该通知已读 */
async function openDetail(notification: NotificationVO) {
    detailNotification.value = notification;
    detailDialogVisible.value = false;
    detailPopoverVisible.value = true;
    await markNotificationAsRead(notification);
}

/** 从全部通知弹窗中点击单条，打开详情 */
async function openDetailFromAll(item: NotificationVO) {
    detailPopoverVisible.value = false;
    detailNotification.value = item;
    await markNotificationAsRead(item);
    allNotificationsVisible.value = false;
    window.setTimeout(() => {
        detailDialogVisible.value = true;
    }, 160);
}

/** 打开全部通知弹窗 */
function openAllNotifications() {
    allNotificationsPage.value = 1;
    allNotificationsVisible.value = true;
    loadAllNotifications(1, allNotificationsFilter.value);
}

/** 加载全部通知（分页） */
async function loadAllNotifications(
    page: number,
    filter: "all" | "unread" = allNotificationsFilter.value,
) {
    allNotificationsLoading.value = true;
    try {
        const res = await ApiNotification.listMyNotifications(
            page,
            allNotificationsPageSize,
            filter === "unread",
        );
        allNotifications.value = sortNotifications(
            (res as any)?.data?.data?.records ?? [],
        );
        allNotificationsTotal.value = (res as any)?.data?.data?.total ?? 0;
    } catch {
        allNotifications.value = [];
        allNotificationsTotal.value = 0;
    } finally {
        allNotificationsLoading.value = false;
    }
}

/** 全部通知弹窗分页切换 */
function handleAllPageChange(page: number) {
    allNotificationsPage.value = page;
    loadAllNotifications(page, allNotificationsFilter.value);
}

/** 全部通知弹窗筛选切换 */
function handleFilterChange(filter: "all" | "unread") {
    if (
        allNotificationsFilter.value === filter &&
        allNotificationsPage.value === 1
    )
        return;
    allNotificationsFilter.value = filter;
    allNotificationsPage.value = 1;
    loadAllNotifications(1, filter);
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

    &:hover { opacity: 0.85; }
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
            content: '';
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

    &:hover { border-color: var(--jade-light); }

    .search-icon { font-size: 13px; flex-shrink: 0; }
    .search-placeholder { color: var(--ink-muted); font-size: 13px; }
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
    width: 360px;
    padding: 10px;
    border-radius: 20px;
    background:
        linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.99),
            rgba(252, 248, 241, 0.98)
        ),
        radial-gradient(
            circle at top right,
            rgba(92, 131, 116, 0.08),
            transparent 32%
        );
    border: 1px solid rgba(232, 223, 208, 0.88);
    box-shadow:
        0 22px 48px rgba(55, 42, 25, 0.12),
        0 6px 16px rgba(55, 42, 25, 0.06);
    backdrop-filter: blur(12px);
}

:deep(.notification-menu .el-dropdown-menu__item) {
    white-space: normal;
    line-height: 1.4;
    padding: 0;
    margin: 0;
    border-radius: 16px;

    &:not(.is-disabled):focus-visible {
        outline: none;
        background: transparent;
    }
}

:deep(.user-menu) {
    width: 320px;
    padding: 10px;
    border-radius: 20px;
    background:
        linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.99),
            rgba(252, 248, 241, 0.98)
        ),
        radial-gradient(
            circle at top right,
            rgba(92, 131, 116, 0.08),
            transparent 34%
        );
    border: 1px solid rgba(232, 223, 208, 0.88);
    box-shadow:
        0 22px 48px rgba(55, 42, 25, 0.12),
        0 6px 16px rgba(55, 42, 25, 0.06);
    backdrop-filter: blur(12px);
}

:deep(.user-menu .el-dropdown-menu__item) {
    white-space: normal;
    line-height: 1.4;
    padding: 0;
    margin: 0;
    border-radius: 16px;

    &:not(.is-disabled):focus-visible {
        outline: none;
        background: transparent;
    }
}

.notification-menu-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 10px 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.78);
}

.notification-menu-title {
    font-family: "STKaiti", "KaiTi", serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: 0.02em;
}

.notification-menu-subtitle {
    margin-top: 6px;
    font-size: 13px;
    color: var(--ink-muted);
}

.notification-menu-chip {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-muted);
    background: rgba(255, 252, 248, 0.98);
    border: 1px solid rgba(232, 223, 208, 0.82);
    border-radius: 999px;
    padding: 8px 14px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);

    &.hot {
        color: var(--cinnabar);
        background: linear-gradient(
            180deg,
            rgba(255, 244, 241, 0.98),
            rgba(255, 237, 232, 0.94)
        );
        border-color: rgba(179, 60, 44, 0.18);
    }
}

.notification-menu-item {
    margin-bottom: 8px;
}

.notification-item {
    width: 100%;
    padding: 14px 16px 13px;
    color: var(--ink);
    background:
        linear-gradient(
            180deg,
            rgba(255, 253, 249, 0.98),
            rgba(253, 250, 243, 0.92)
        ),
        radial-gradient(
            circle at left top,
            rgba(92, 131, 116, 0.06),
            transparent 26%
        );
    border: 1px solid rgba(239, 231, 218, 0.88);
    border-radius: 18px;
    box-shadow: 0 1px 2px rgba(60, 50, 30, 0.03);
    transition:
        background 0.22s ease,
        border-color 0.22s ease,
        transform 0.22s ease,
        box-shadow 0.22s ease;

    &:hover {
        background:
            linear-gradient(
                180deg,
                rgba(248, 252, 250, 0.98),
                rgba(252, 249, 242, 0.98)
            ),
            radial-gradient(
                circle at left top,
                rgba(92, 131, 116, 0.08),
                transparent 28%
            );
        border-color: rgba(92, 131, 116, 0.18);
        transform: translateY(-2px);
        box-shadow: 0 10px 22px rgba(92, 131, 116, 0.08);
    }
}

.notification-item.unread {
    border-color: rgba(92, 131, 116, 0.2);
    background:
        linear-gradient(
            180deg,
            rgba(246, 251, 249, 0.98),
            rgba(253, 250, 243, 0.94)
        ),
        radial-gradient(
            circle at left top,
            rgba(92, 131, 116, 0.1),
            transparent 28%
        );
}

.notification-item.unread .notification-title {
    color: var(--jade);
}

.notification-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 6px;
}

.notification-body {
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.62;
    min-height: 21px;
}

.notification-time {
    color: var(--ink-muted);
    opacity: 0.75;
    font-size: 12px;
    margin-top: 10px;
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

    &:hover { transform: scale(1.06); }

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
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    background:
        linear-gradient(
            180deg,
            rgba(250, 253, 251, 0.98),
            rgba(246, 250, 248, 0.96)
        ),
        radial-gradient(
            circle at top center,
            rgba(92, 131, 116, 0.08),
            transparent 42%
        );
    border: 1px solid rgba(92, 131, 116, 0.14);
    border-radius: 16px;
    padding: 14px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
    transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: rgba(92, 131, 116, 0.22);
        box-shadow:
            0 10px 20px rgba(92, 131, 116, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
}

.view-all-arrow {
    font-size: 16px;
    line-height: 1;
}

.notification-menu-action {
    margin-top: 8px;
}

.notification-menu-footer {
    margin-top: 4px;
}

.notification-menu-cta {
    width: 100%;
    padding: 8px 10px 2px;
}

.read-all-entry {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 12px 6px;
    color: var(--ink-muted);
    font-size: 13px;
    font-weight: 600;
    transition: color 0.2s ease;

    &:hover {
        color: var(--jade);
    }
}

.read-all-icon {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--jade);
    background: rgba(92, 131, 116, 0.08);
    border: 1px solid rgba(92, 131, 116, 0.14);
    font-size: 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);
}

.user-menu-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 10px 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.78);
}

.user-menu-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--jade));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    border: 2px solid rgba(255, 255, 255, 0.88);
    box-shadow: 0 8px 18px rgba(92, 131, 116, 0.12);
    overflow: hidden;
    flex-shrink: 0;
}

.user-menu-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-menu-meta {
    min-width: 0;
}

.user-menu-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-menu-subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--ink-muted);
}

.user-menu-item {
    margin-bottom: 8px;

    &.logout {
        margin-bottom: 0;
    }
}

.user-menu-card {
    width: 100%;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 18px;
    border: 1px solid rgba(239, 231, 218, 0.88);
    background:
        linear-gradient(
            180deg,
            rgba(255, 253, 249, 0.98),
            rgba(253, 250, 243, 0.92)
        ),
        radial-gradient(
            circle at left top,
            rgba(92, 131, 116, 0.06),
            transparent 26%
        );
    box-shadow: 0 1px 2px rgba(60, 50, 30, 0.03);
    transition:
        background 0.22s ease,
        border-color 0.22s ease,
        transform 0.22s ease,
        box-shadow 0.22s ease;

    &:hover {
        background:
            linear-gradient(
                180deg,
                rgba(248, 252, 250, 0.98),
                rgba(252, 249, 242, 0.98)
            ),
            radial-gradient(
                circle at left top,
                rgba(92, 131, 116, 0.08),
                transparent 28%
            );
        border-color: rgba(92, 131, 116, 0.18);
        transform: translateY(-2px);
        box-shadow: 0 10px 22px rgba(92, 131, 116, 0.08);
    }

    &.logout {
        background:
            linear-gradient(
                180deg,
                rgba(255, 250, 248, 0.98),
                rgba(253, 247, 243, 0.94)
            ),
            radial-gradient(
                circle at left top,
                rgba(179, 60, 44, 0.07),
                transparent 26%
            );

        &:hover {
            border-color: rgba(179, 60, 44, 0.2);
            background:
                linear-gradient(
                    180deg,
                    rgba(255, 247, 244, 0.98),
                    rgba(253, 245, 240, 0.96)
                ),
                radial-gradient(
                    circle at left top,
                    rgba(179, 60, 44, 0.08),
                    transparent 28%
                );
            box-shadow: 0 10px 22px rgba(179, 60, 44, 0.08);
        }
    }
}

.user-menu-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(92, 131, 116, 0.08);
    border: 1px solid rgba(92, 131, 116, 0.14);
    color: var(--jade);
    font-size: 15px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);

    &.logout {
        color: var(--cinnabar);
        background: rgba(179, 60, 44, 0.08);
        border-color: rgba(179, 60, 44, 0.14);
    }
}

.user-menu-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.user-menu-label {
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
}

.user-menu-desc {
    font-size: 12px;
    color: var(--ink-muted);
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

    .dialog-header-main {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .dot {
        width: 4px;
        height: 16px;
        background: var(--jade);
        border-radius: 2px;
        flex-shrink: 0;
    }
}

/* 全部通知弹窗 - 列表 */
.dialog-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
    padding: 2px 0 12px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.75);
}

.toolbar-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: var(--ink-muted);
}

.toolbar-sep {
    opacity: 0.55;
}

.filter-pills {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px;
    background: rgba(253, 250, 243, 0.72);
    border: 1px solid rgba(232, 223, 208, 0.8);
    border-radius: 999px;
}

.filter-pill {
    appearance: none;
    border: 1px solid transparent;
    background: transparent;
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: var(--jade);
        background: rgba(92, 131, 116, 0.06);
    }

    &.active {
        color: var(--jade);
        background: var(--jade-soft);
        border-color: rgba(92, 131, 116, 0.08);
        box-shadow: none;
    }
}

.all-notifications-list {
    --all-notif-row-height: 92px;
    min-height: 120px;
    height: min(calc(var(--all-notif-row-height) * 8), calc(100vh - 300px));
    max-height: min(calc(var(--all-notif-row-height) * 8), calc(100vh - 300px));
    flex: none;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 2px;
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
    background: transparent;
    border-radius: 0;
    padding: 12px 2px 12px 12px;
    min-height: var(--all-notif-row-height);
    margin-bottom: 0;
    cursor: pointer;
    border-bottom: 1px solid rgba(232, 223, 208, 0.75);
    transition:
        background 0.2s,
        border-color 0.2s,
        transform 0.2s;
    position: relative;
    overflow: hidden;

    &:hover {
        background: rgba(92, 131, 116, 0.04);
        border-color: rgba(92, 131, 116, 0.16);
        transform: translateX(1px);
    }

    &:last-child {
        margin-bottom: 0;
        border-bottom: none;
    }

    &.unread {
        background: linear-gradient(
            90deg,
            rgba(92, 131, 116, 0.06),
            rgba(253, 250, 243, 0)
        );
        border-color: rgba(92, 131, 116, 0.14);

        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--jade);
        }
    }
}

.all-notif-card.placeholder {
    cursor: default;
    pointer-events: none;
    background: transparent;

    &:hover {
        background: transparent;
        border-color: rgba(232, 223, 208, 0.75);
        transform: none;
    }

    &::before {
        display: none;
    }
}

.all-notif-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    min-width: 0;
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
    white-space: nowrap;
}

.all-notif-body {
    font-size: 13px;
    color: var(--ink-muted);
    line-height: 1.65;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 16px;
    min-width: 0;
}

.all-pagination {
    display: flex;
    justify-content: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(232, 223, 208, 0.75);
}

:deep(.all-notifications-dialog) {
    max-width: calc(100vw - 32px);
    box-shadow: var(--shadow-lg);
    border-radius: 18px;
    overflow: hidden;
    width: min(920px, calc(100vw - 32px));
    max-height: calc(100vh - 40px);
}

:deep(.all-notifications-dialog .el-dialog__body) {
    padding: 16px 22px 20px;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

:deep(.all-notifications-dialog .el-pagination) {
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(
        180deg,
        rgba(253, 250, 243, 0.9),
        rgba(255, 255, 255, 0.96)
    );
    border: 1px solid rgba(232, 223, 208, 0.88);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
    gap: 6px;
}

:deep(.all-notifications-dialog .el-pagination .btn-prev),
:deep(.all-notifications-dialog .el-pagination .btn-next),
:deep(.all-notifications-dialog .el-pagination .el-pager li) {
    min-width: 36px;
    height: 36px;
    line-height: 34px;
    border-radius: 12px;
    border: 1px solid rgba(232, 223, 208, 0.68);
    background: rgba(255, 255, 255, 0.92);
    color: var(--ink-muted);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(60, 50, 30, 0.03);
    transition: all 0.2s ease;
}

:deep(.all-notifications-dialog .el-pagination .btn-prev:hover),
:deep(.all-notifications-dialog .el-pagination .btn-next:hover),
:deep(.all-notifications-dialog .el-pagination .el-pager li:hover) {
    color: var(--jade);
    border-color: rgba(92, 131, 116, 0.22);
    background: rgba(92, 131, 116, 0.06);
    transform: translateY(-1px);
}

:deep(.all-notifications-dialog .el-pagination .el-pager li.is-active) {
    color: #fff;
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    border-color: rgba(92, 131, 116, 0.45);
    box-shadow:
        0 8px 18px rgba(92, 131, 116, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

:deep(.all-notifications-dialog .el-pagination .btn-prev:disabled),
:deep(.all-notifications-dialog .el-pagination .btn-next:disabled) {
    opacity: 0.42;
    background: rgba(255, 255, 255, 0.72);
    transform: none;
}

:deep(.all-notifications-dialog .el-pagination .el-pager) {
    display: flex;
    align-items: center;
    gap: 6px;
}

:deep(.all-notifications-dialog .el-pagination .btn-prev .el-icon),
:deep(.all-notifications-dialog .el-pagination .btn-next .el-icon) {
    font-size: 12px;
}

@media (max-width: 900px) {
    .topbar-inner { padding: 12px 20px; gap: 16px; }
    .search-box { display: none; }
    .top-nav { gap: 14px; font-size: 13px; }
}
</style>

<!-- 气泡弹窗样式（非 scoped，因为 el-popover 内容会 teleport 到 body） -->
<style lang="scss">
.notification-detail-popover {
    padding: 12px !important;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid rgba(232, 223, 208, 0.78);
    background: rgba(255, 255, 255, 0.98);

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

    .detail-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
    }

    .detail-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--jade);
        background: rgba(92, 131, 116, 0.08);
        border: 1px solid rgba(92, 131, 116, 0.08);
        border-radius: 999px;
        padding: 4px 10px;
    }

    .detail-unread {
        font-size: 12px;
        color: var(--cinnabar);
        background: rgba(179, 60, 44, 0.08);
        border-radius: 999px;
        padding: 4px 10px;
    }

    .detail-body {
        font-size: 14px;
        line-height: 1.75;
        color: var(--ink);
        margin-bottom: 12px;
        white-space: pre-wrap;
    }

    .detail-body-label {
        font-size: 12px;
        color: var(--ink-muted);
        margin-bottom: 6px;
        letter-spacing: 0.5px;
    }

    .detail-body-text {
        background: rgba(253, 250, 243, 0.72);
        border: 1px solid rgba(232, 223, 208, 0.78);
        border-radius: 12px;
        padding: 12px 13px;
        white-space: pre-wrap;
        line-height: 1.75;
    }

    .detail-time {
        font-size: 12px;
        color: var(--ink-muted);
    }
}

/* 全部通知弹窗全局覆盖 */
.all-notifications-dialog {
    border-radius: 18px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    margin: 0 !important;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;

    .el-dialog__header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--line-soft);
        background: linear-gradient(
            180deg,
            rgba(253, 250, 243, 0.96),
            rgba(255, 255, 255, 0.98)
        );
        flex-shrink: 0;
    }

    .el-dialog__body {
        padding: 16px 24px 22px;
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98),
            rgba(253, 250, 243, 0.98)
        );
        flex: 1;
        min-height: 0;
    }

    .el-dialog__headerbtn {
        top: 20px;
        right: 20px;
    }
}

.notification-detail-dialog {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);

    .el-dialog__header {
        padding: 22px 24px 12px;
        border-bottom: 1px solid rgba(232, 223, 208, 0.72);
        background: linear-gradient(
            180deg,
            rgba(253, 250, 243, 0.98),
            rgba(255, 255, 255, 0.98)
        );
    }

    .el-dialog__body {
        padding: 20px 24px 24px;
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.98),
            rgba(252, 248, 241, 0.94)
        );
    }

    .el-dialog__headerbtn {
        top: 18px;
        right: 18px;
    }

    .el-dialog__headerbtn .el-dialog__close {
        color: var(--ink-muted);
        transition: color 0.2s ease;
    }

    .el-dialog__headerbtn:hover .el-dialog__close {
        color: var(--ink);
    }
}

.detail-dialog-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-dialog-banner {
    display: flex;
    align-items: center;
    gap: 10px;
}

.detail-dialog-badge,
.detail-dialog-unread {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}

.detail-dialog-badge {
    color: var(--jade);
    background: rgba(92, 131, 116, 0.08);
    border: 1px solid rgba(92, 131, 116, 0.14);
}

.detail-dialog-unread {
    color: var(--cinnabar);
    background: rgba(179, 60, 44, 0.08);
    border: 1px solid rgba(179, 60, 44, 0.12);
}

.detail-dialog-title {
    font-size: 28px;
    line-height: 1.3;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: 0.01em;
}

.detail-dialog-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.detail-dialog-section-label {
    font-size: 12px;
    color: var(--ink-muted);
    letter-spacing: 0.08em;
}

.detail-dialog-content {
    padding: 20px 22px;
    border-radius: 18px;
    border: 1px solid rgba(232, 223, 208, 0.78);
    background:
        linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.94),
            rgba(253, 250, 243, 0.94)
        ),
        radial-gradient(
            circle at top right,
            rgba(92, 131, 116, 0.08),
            transparent 34%
        );
    color: var(--ink);
    font-size: 16px;
    line-height: 1.9;
    white-space: pre-wrap;
}

.detail-dialog-meta {
    font-size: 13px;
    color: var(--ink-muted);
}
</style>

