import type { ILoginInfo, IUserInfo } from "@/types";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    // State: 定义状态数据
    state: () => ({
        // G_LoginInfo: {
        //     id: NaN,
        //     isLogin: false,
        //     nickName: "",
        //     account: "",
        //     email: "",
        //     status: 1,
        // } as ILoginInfo, // 用户登录状态
        G_LoginInfo: {
            id: 1,
            isLogin: true,
            nickName: "紫霞铃音",
            account: "10000",
            email: "2714...@qq.com",
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
    actions: {},
});
