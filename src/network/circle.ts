import { GAxios } from "@/plugins";

/** 圈内首页相关接口 */
export class ApiCircle {
    /** 获取当前节气信息（根据服务器日期自动计算） */
    static async getSolarTerm() {
        return GAxios.get("/circle/solar-term/current");
    }
}
