import type { ILoginInfo, IUserInfo } from "@/types";
import { defineStore } from "pinia";
import { ApiUser } from "@/network/user";

const emptyLoginInfo = (): ILoginInfo => ({
    id: NaN,
    isLogin: false,
    nickName: "",
    account: "",
    email: "",
    status: 1,
});

const emptyUserInfo = (): IUserInfo => ({
    id: NaN,
    role_id: 1,
    avatar: "",
    gender: 0,
    birthday: new Date(),
    introduction: "",
    location: "",
    email: "",
    qq: "",
    wechat: "",
    phone: "",
    create_time: new Date(),
    update_time: new Date(),
});

export const useUserStore = defineStore("user", {
    state: () => ({
        G_LoginInfo: emptyLoginInfo() as ILoginInfo,
        G_UserInfo: emptyUserInfo() as IUserInfo,
        isInitialized: false,
        isLoading: false,
        error: null as string | null,
    }),

    actions: {
        // 刷新令牌（首次调用后标记 isInitialized，避免重复请求）
        async refreshToken() {
            try {
                const result = await ApiUser.refresh();
                if (result) {
                    // ── Tab 身份守卫 ──────────────────────────────────────────────
                    // sessionStorage 是 per-tab 的，不在标签页间共享。
                    // 若其他标签页用不同账号登录，会覆盖浏览器共享的 HttpOnly Cookie，
                    // 导致本 tab 刷新时拿到别人的 JWT。通过比对 userId 来检测这种情况。
                    const storedTabUserId = sessionStorage.getItem("tab-user-id");
                    if (storedTabUserId && storedTabUserId !== String(result.id)) {
                        // Cookie 已被其他标签页的登录覆盖，本 tab 强制退出
                        console.warn(
                            `[Auth] Session 冲突：本 tab 期望用户 ${storedTabUserId}，` +
                            `但 Cookie 已被覆盖为用户 ${result.id}，强制退出登录。`
                        );
                        this.clearLoginInfo();
                        sessionStorage.removeItem("tab-user-id");
                        return false;
                    }
                    // ─────────────────────────────────────────────────────────────

                    this.G_LoginInfo = {
                        ...this.G_LoginInfo,
                        id: result.id,
                        isLogin: true,
                        nickName: result.nickname || result.username,
                        account: result.username,
                        status: 1,
                    };
                    // privileges 先行推导 role_id，loadUserInfo 会再精确覆盖一次
                    const codes: number[] = result.privileges ?? [];
                    const role_id = codes.includes(100) ? 3 : codes.includes(200) ? 2 : 1;
                    this.G_UserInfo = { ...this.G_UserInfo, role_id };
                    // 刷新成功，更新本 tab 记录的用户 ID
                    sessionStorage.setItem("tab-user-id", String(result.id));
                    await this.loadUserInfo();
                } else {
                    this.clearLoginInfo();
                }
            } catch {
                this.clearLoginInfo();
            } finally {
                this.isInitialized = true;
            }
            return this.G_LoginInfo.isLogin;
        },

        // 拉取完整用户信息
        async loadUserInfo() {
            const result = await ApiUser.getUserInfo();
            if (result) {
                // 后端返回 roleCodes（100=管理员 200=专家 300=普通用户），映射到 role_id
                const codes: number[] = result.roleCodes ?? [];
                const role_id = codes.includes(100) ? 3 : codes.includes(200) ? 2 : 1;
                // 后端字段名与前端不一致，手动映射
                this.G_UserInfo = {
                    ...this.G_UserInfo,
                    ...result,
                    role_id,
                    create_time: result.createdAt,
                    update_time: result.updatedAt,
                };
            }
        },

        // 退出登录
        // 先同步清除本地状态（让路由守卫立即生效），再后台通知服务端
        async logout() {
            this.clearLoginInfo();
            this.G_UserInfo = emptyUserInfo();
            this.isInitialized = true;
            // 清除本 tab 的身份记录
            sessionStorage.removeItem("tab-user-id");
            // 后台调用退出接口清除服务端 session，不阻塞页面跳转
            ApiUser.logout().catch(() => {});
        },

        // 清除登录信息
        clearLoginInfo() {
            this.G_LoginInfo = emptyLoginInfo();
        },
    },
});
