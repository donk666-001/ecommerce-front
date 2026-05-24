import { GAxios } from "@/plugins";

class ApiUser {
    // 刷新令牌
    static async refresh() {
        try {
            const response = await GAxios.get("/users/refresh");
            const res = response.data;
            if (res.code === 200) {
                console.log("令牌刷新成功");
                return res.data;
            } else {
                console.log("令牌刷新失败:", res.message);
                return null;
            }
        } catch (error) {
            console.error("刷新令牌请求失败:", error);
            return null;
        }
    }

    // 登录
    static async login(data: { username: string; password: string }) {
        const response = await GAxios.post("/users/login", data);
        const res = response.data;
        if (res.code === 200) {
            console.log(res);
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
            console.log(res);
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    }

    // 获取用户信息
    static async getUserInfo() {
        const response = await GAxios.get("/user/info/1");
        const res = response.data;
        if (res.code === 200) {
            console.log(res);
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    }
}

export { ApiUser };
