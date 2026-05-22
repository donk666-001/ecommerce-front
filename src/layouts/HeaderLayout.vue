<template>
    <header class="header">
        <div class="container">
            <div class="logo" @click="goHome">颐养阁</div>
            <el-menu
                mode="horizontal"
                :ellipsis="false"
                class="nav-menu"
                :default-active="activeMenu"
            >
                <el-menu-item index="/" @click="navigateTo('/')"
                    >首页</el-menu-item
                >
                <el-menu-item index="/health" @click="navigateTo('/')"
                    >养生智库</el-menu-item
                >
                <el-menu-item
                    index="/community"
                    @click="navigateTo('/community')"
                    >元气社区</el-menu-item
                >
                <el-menu-item
                    index="/consultation"
                    @click="navigateTo('/consultation')"
                    >名医问诊</el-menu-item
                >
                <el-menu-item index="/courses" @click="navigateTo('/courses')"
                    >课程</el-menu-item
                >
                <el-menu-item index="/shop" @click="navigateTo('/shop')"
                    >商城</el-menu-item
                >
            </el-menu>
            <div class="search-box">
                <el-input
                    v-model="searchQuery"
                    placeholder="搜索节气、食谱、穴位..."
                    prefix-icon="Search"
                    clearable
                />
            </div>
            <div class="user-avatar" @click="handleAvatarClick">
                <el-avatar
                    :size="40"
                    :src="userStore.G_UserInfo.avatar || defaultAvatar"
                >
                    {{
                        userStore.G_LoginInfo.isLogin
                            ? userStore.G_LoginInfo.nickName.charAt(0)
                            : "用"
                    }}
                </el-avatar>
            </div>
        </div>
    </header>

    <!-- 登录弹窗 -->
    <LoginDialog v-model="showLoginDialog" />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import LoginDialog from "@/components/LoginDialog.vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const searchQuery = ref("");
const showLoginDialog = ref(false);
const defaultAvatar = "/images/default-avatar.svg"; // 默认头像

// 根据当前路由设置激活的菜单项
const activeMenu = computed(() => {
    return route.path;
});

// 导航到指定路径
function navigateTo(path: string) {
    router.push(path);
}

// 返回首页
function goHome() {
    router.push("/");
}

// 处理头像点击事件
function handleAvatarClick() {
    // 如果未登录，显示登录弹窗
    if (!userStore.G_LoginInfo.isLogin) {
        showLoginDialog.value = true;
    } else {
        // 如果已登录，可以显示用户菜单或其他操作
        console.log("用户已登录:", userStore.G_LoginInfo.nickName);
        // TODO: 后续可以添加用户下拉菜单
    }
}
</script>

<style scoped lang="scss">
.header {
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;

    .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
    }

    .logo {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
        cursor: pointer;
        transition: opacity 0.3s ease;

        &:hover {
            opacity: 0.8;
        }
    }

    .nav-menu {
        flex: 1;
        margin: 0 20px;
        border-bottom: none;
    }

    .search-box {
        width: 250px;
    }

    .user-avatar {
        margin-left: 20px;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
            transform: scale(1.1);
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .header {
        .container {
            flex-direction: column;
            height: auto;
            padding: 10px;
        }

        .nav-menu {
            margin: 10px 0;
            width: 100%;
        }

        .search-box {
            width: 100%;
            margin-top: 10px;
        }
    }
}
</style>
