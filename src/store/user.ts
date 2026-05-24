import type { ILoginInfo, IUserInfo } from "@/types";
import { defineStore } from "pinia";
import { ApiUser } from "@/network/user";

export const useUserStore = defineStore("user", {
    // State: 定义状态数据
    state: () => ({
        G_LoginInfo: {
            id: NaN,
            isLogin: false,
            nickName: "",
            account: "",
            email: "",
            status: 1,
        } as ILoginInfo, // 用户登录状态
        G_UserInfo: {
            id: 1,
            role_id: 1,
            avatar: "",
            gender: "男",
            birthday: new Date(),
            introduction: "",
            location: "",
            email: "",
            qq: "",
            wechat: "",
            phone: "",
            create_time: new Date(),
            update_time: new Date(),
        } as IUserInfo,
        isLoading: false, // 加载状态
        error: null as string | null, // 错误信息 - 修复：定义正确的类型
    }),

    // Getters: 基于 State 计算衍生数据
    getters: {},

    // Actions: 修改 State 的业务方法
    actions: {
        // 刷新令牌方法
        async refreshToken() {
            try {
                const result = await ApiUser.refresh();
                if (result) {
                    // 令牌刷新成功，更新用户信息
                    this.G_LoginInfo = {
                        ...this.G_LoginInfo,
                        id: result.id,
                        isLogin: true,
                        nickName: result.nickname || result.username,
                        account: result.username,
                        status: 1
                    };
                    return true;
                } else {
                    // 令牌刷新失败，需要重新登录
                    this.clearLoginInfo();
                    return false;
                }
            } catch (error) {
                console.error('刷新令牌失败:', error);
                this.clearLoginInfo();
                return false;
            }
        },
        
        // 清除登录信息
        clearLoginInfo() {
            this.G_LoginInfo = {
                id: NaN,
                isLogin: false,
                nickName: "",
                account: "",
                email: "",
                status: 1,
            };
        }
    },
});
