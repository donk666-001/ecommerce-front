import { GAxios } from "@/plugins";
import type { IUserInfo } from "@/types";

class ApiUser {
    // 刷新令牌
    static async refresh() {
        try {
            const response = await GAxios.get("/users/refresh");
            const res = response.data;
            if (res.code === 200) {
                return res.data;
            }
            return null;
        } catch {
            return null;
        }
    }

    // 登录
    static async login(data: { username: string; password: string }) {
        const response = await GAxios.post("/users/login", data);
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    }

    // 注册
    static async register(data: {
        username: string;
        password: string;
        email: string;
    }) {
        const response = await GAxios.post("/users/register", data);
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    }

    // 获取用户信息（动态 ID）
    static async getUserInfo(id: number) {
        try {
            const response = await GAxios.get(`/user/info/${id}`);
            const res = response.data;
            return res.code === 200 ? res.data : null;
        } catch {
            return null;
        }
    }

    // 退出登录
    static async logout() {
        try {
            const response = await GAxios.post("/users/logout");
            return response.data.code === 200;
        } catch {
            return false;
        }
    }

    // 更新个人资料
    static async updateProfile(data: Partial<IUserInfo>) {
        try {
            const response = await GAxios.put("/users/profile", data);
            const res = response.data;
            return res.code === 200 ? res.data : null;
        } catch {
            return null;
        }
    }

    // 上传头像，返回头像 URL
    static async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await GAxios.post("/users/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const res = response.data;
            return res.code === 200 ? (res.data as string) : null;
        } catch {
            return null;
        }
    }

    // 修改密码
    static async changePassword(data: {
        oldPassword: string;
        newPassword: string;
    }) {
        try {
            const response = await GAxios.put("/users/password", data);
            return response.data.code === 200;
        } catch {
            return false;
        }
    }
}

export { ApiUser };
