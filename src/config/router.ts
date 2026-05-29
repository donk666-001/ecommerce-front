import { useUserStore } from "@/store/user";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { resolvePostLoginPath } from "@/utils";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to) => {
    const userStore = useUserStore();

    // 首次进入且非登录页时，通过 refreshToken 初始化登录态
    // if (!userStore.isInitialized && to.path !== "/login") {
    if (!userStore.isInitialized) {
        await userStore.refreshToken();
    }

    const isLogin = userStore.G_LoginInfo.isLogin;

    // /admin 页面仅管理员（role_id === 1）可访问
    if (to.path.startsWith('/admin')) {
        if (!isLogin) {
            return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        }
        if (userStore.G_UserInfo.role_id !== 1) {
            return '/';
        }
    }

    // 已登录访问 /login → 跳首页
    if (to.path === "/login" && isLogin) {
        return resolvePostLoginPath(userStore.G_UserInfo.role_id, to.query.redirect);
        // return "/";
    }

    // 未登录访问非 /login 页面 → 跳登录页
    if (to.path !== "/login" && !isLogin) {
        return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
    }
});

export default router;
