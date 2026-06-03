import { useUserStore } from "@/store/user";
import { resolvePostLoginPath } from "@/utils";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

/** 不需要登录即可访问的公开路由 */
const PUBLIC_PATHS = ["/login", "/landing","/customer/login"];

router.beforeEach(async (to) => {
    const userStore = useUserStore();

    // 首次进入且非登录页时，通过 refreshToken 初始化登录态
    if (!userStore.isInitialized && to.path !== "/login") {
        await userStore.refreshToken();
    }

    const isLogin = userStore.G_LoginInfo.isLogin;

    // /admin 页面仅管理员(role_id === 1)可访问
    if (to.path.startsWith("/admin")) {
        if (!isLogin) {
            // 未登录 → 跳登录页
            return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
        }
        if (userStore.G_UserInfo.role_id !== 1) {
            // 非管理员 → 跳首页
            return "/";
        }
        // 管理员已登录，允许访问
        return undefined;
    }

    // /customer 页面仅客服(role_id === 4)可访问
    if (to.path.startsWith("/customer") && to.path !== "/customer/login") {
        if (!isLogin) {
            // 未登录 → 跳客服登录页
            return `/customer/login?redirect=${encodeURIComponent(to.fullPath)}`;
        }
        if (userStore.G_UserInfo.role_id !== 4) {
            // 非客服 → 跳首页
            return "/";
        }
        // 客服已登录，允许访问
        return undefined;
    }

    // 已登录访问 /login → 根据角色跳转
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

    // 其他情况，允许继续导航
    return undefined;
});

export default router;
