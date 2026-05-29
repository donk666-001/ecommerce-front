import { GAxios, GAxiosWithCredentials } from "@/plugins";

function normalizeAssetUrl(url: string, baseURL?: string) {
    if (!url || /^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
        return url;
    }
    if (url.startsWith("/users/") && baseURL) {
        return `${baseURL.replace(/\/$/, "")}${url}`;
    }
    return url;
}

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
        gender?: number;
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

    // 获取当前登录用户信息
    static async getUserInfo() {
        try {
            const response = await GAxios.get("/users/info");
            const res = response.data;
            if (res.code !== 200) return null;
            if (res.data?.avatar) {
                res.data.avatar = normalizeAssetUrl(res.data.avatar, response.config.baseURL);
            }
            return res.data;
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

    // 更新个人资料（昵称、性别、邮箱、手机号均可选）
    static async updateProfile(data: {
        nickname?: string;
        gender?: number;
        email?: string;
        phone?: string;
    }) {
        try {
            const response = await GAxios.put("/users/profile", data);
            const res = response.data;
            // PUT /users/profile 返回 Result<Void>，data 恒为 null，只需判断 code
            return res.code === 200 ? true : null;
        } catch {
            return null;
        }
    }

    // 更新个人资料，并保留后端返回的失败原因
    static async updateProfileDetailed(data: {
        nickname?: string;
        gender?: number;
        email?: string;
        phone?: string;
    }) {
        try {
            const response = await GAxios.put("/users/profile", data);
            const res = response.data;
            return {
                success: res.code === 200,
                message: res.message || (res.code === 200 ? "保存成功" : "保存失败，请稍后重试"),
            };
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || "保存失败，请稍后重试",
            };
        }
    }

    // 上传头像，返回头像 URL
    static async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await GAxiosWithCredentials.post("/users/avatar", formData);
            const res = response.data;
            return res.code === 200 ? normalizeAssetUrl(res.data as string, response.config.baseURL) : null;
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
