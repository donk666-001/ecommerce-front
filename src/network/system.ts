import { GAxios } from "@/plugins";

class ApiSystem {
    // 后端连通性测试
    static async checkStart() {
        const response = await GAxios.get("/checkStart");
        const res = response.data;
        if (res.code === 200) {
            console.log(res);
            return res.data;
        } else {
            console.log(res.message);
        }
    }
}

export { ApiSystem };
