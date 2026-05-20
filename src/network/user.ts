import { GAxios } from "@/plugins";

class ApiUser {
    // 登录
    static async login() {
        const response = await GAxios.post("/user/auth/login", {});
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
