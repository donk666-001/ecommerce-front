import { useUserStore } from "@/store/user";
import { resolvePostLoginPath } from "@/utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

/** 不需要登录即可访问的公开路由 */
const PUBLIC_PATHS = ["/login", "/landing"];

router.beforeEach(async (to) => {
    const userStore = useUserStore();

    if (!userStore.isInitialized) {
        await userStore.refreshToken();
    }

    const isLogin = userStore.G_LoginInfo.isLogin;

    // /admin 页面仅管理员（role_id === 1）可访问
    if (to.path.startsWith("/admin")) {
        if (!isLogin) {
            return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        }
        if (userStore.G_UserInfo.role_id !== 1) {
            return "/";
        }
    }

    // 已登录访问 /login → 跳首页
    if (to.path === "/login" && isLogin) {
        return resolvePostLoginPath(
            userStore.G_UserInfo.role_id,
            to.query.redirect,
        );
    }

    // 未登录访问非公开路由 → 跳登录页
    if (!PUBLIC_PATHS.includes(to.path) && !isLogin) {
        return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
    }
});

export default router;
