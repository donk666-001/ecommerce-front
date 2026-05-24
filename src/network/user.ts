import { GAxios } from "@/plugins";

class ApiUser {
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
