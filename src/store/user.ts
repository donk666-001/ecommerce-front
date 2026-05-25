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
    gender: "",
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
            const id = this.G_LoginInfo.id;
            if (!id || isNaN(id)) return;
            const result = await ApiUser.getUserInfo(id);
            if (result) {
                // 后端返回 roleCodes（100=管理员 200=专家 300=普通用户），映射到 role_id
                const codes: number[] = result.roleCodes ?? [];
                const role_id = codes.includes(100) ? 3 : codes.includes(200) ? 2 : 1;
                this.G_UserInfo = { ...this.G_UserInfo, ...result, role_id };
            }
        },

        // 退出登录
        async logout() {
            await ApiUser.logout();
            this.clearLoginInfo();
            this.G_UserInfo = emptyUserInfo();
            this.isInitialized = true;
        },

        // 清除登录信息
        clearLoginInfo() {
            this.G_LoginInfo = emptyLoginInfo();
        },
    },
});
