import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { useUserStore } from "@/store/user";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to) => {
    const userStore = useUserStore();

    // 首次进入时通过 refreshToken 初始化登录态
    if (!userStore.isInitialized) {
        await userStore.refreshToken();
    }

    const isLogin = userStore.G_LoginInfo.isLogin;

    // /admin 页面仅管理员（role_id === 3）可访问
    if (to.path === '/admin') {
        if (!isLogin) {
            return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        }
        const privileges = userStore.G_UserInfo.privileges ?? '';
        if (!privileges.split(',').includes('100')) {
            return '/';
        }
    }

    // 已登录访问 /login → 跳首页
    if (to.path === "/login" && isLogin) {
        return "/";
    }

    // 未登录访问非 /login 页面 → 跳登录页
    if (to.path !== "/login" && !isLogin) {
        return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
    }
});

export default router;
