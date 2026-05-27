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
                <div class="top-bell">
                    🔔
                    <span class="badge-dot"></span>
                </div>

                <!-- 未登录：点击跳转登录页 -->
                <div v-if="!userStore.G_LoginInfo.isLogin" class="avatar" @click="goToLogin">
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
                        <el-dropdown-menu>
                            <el-dropdown-item command="settings">我的设置</el-dropdown-item>
                            <el-dropdown-item command="logout" divided style="color: var(--cinnabar)">
                                退出登录
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";
import { useExpertPresenceSocket } from "@/composables/useExpertPresenceSocket";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const displayInitial = computed(() => {
    const name = userStore.G_LoginInfo.nickName || userStore.G_LoginInfo.account;
    return name ? name.charAt(0) : "我";
});

/** 当前登录用户是否为认证专家（role_id === 2） */
const isExpertView = computed(() => userStore.G_UserInfo.role_id === 2);

const { connect, disconnect } = useExpertPresenceSocket();

onMounted(() => {
    // 专家登录后全局建立 STOMP 连接，使在线状态对用户可见
    if (isExpertView.value && userStore.G_LoginInfo.id) {
        connect();
    }
});

onUnmounted(() => {
    // 页面卸载时断开连接（浏览器关闭时 beforeunload 也会触发 STOMP DISCONNECT）
    if (isExpertView.value) {
        disconnect();
    }
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

@media (max-width: 900px) {
    .topbar-inner { padding: 12px 20px; gap: 16px; }
    .search-box { display: none; }
    .top-nav { gap: 14px; font-size: 13px; }
}
</style>
