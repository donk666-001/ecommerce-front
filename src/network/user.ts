// 登录
import { GAxios, GAxiosWithCredentials } from "@/plugins";
import { useUserStore } from "@/store"; // 账号密码登录
import { storeToRefs } from "pinia";

// 账号密码登录
async function ApiLogin(
    account: string,
    password: string,
    captchaCode: string,
) {
    try {
        const response = await GAxios.post("/user/login", {
            account: account,
            password: password,
            captchaCode: captchaCode,
        });
        // console.log(`响应response:${JSON.stringify(response)}`);
        const res = response.data;
        console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            console.log(`登录成功[cookie是]:${document.cookie}`);
            return res.data;
        } else {
            console.log(res.message);
            return res;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 邮箱验证码登录
async function ApiEmailLogin(
    email: string,
    verifyCode: string,
    isRegistered: boolean,
) {
    try {
        console.log(
            `请求参数:${JSON.stringify({ email, verifyCode, isRegistered })}`,
        );
        const response = await GAxios.post("/user/login/verify/email", {
            email: email,
            verifyCode: verifyCode,
            isRegistered: isRegistered,
        });
        const res = response.data;
        console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return res;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// cookie登录
async function ApiCookieLogin() {
    try {
        // 使用 withCredentialsOverride 参数来临时启用 cookie
        const response = await GAxiosWithCredentials.get("/user/login");
        // console.log(`响应response:${JSON.stringify(response)}`);
        const res = response.data;
        const data = res.data;
        console.log(`[cookie]响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            const { G_LoginInfo } = storeToRefs(useUserStore());
            G_LoginInfo.value = {
                ...G_LoginInfo.value,
                id: data.userId,
                isLogin: true,
            };
        } else {
            console.log(res.message);
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        // 添加更多调试信息
        console.log("当前页面URL:", window.location.href);
        console.log("Cookie信息:", document.cookie);
    }
}

// 退出登录
async function ApiLogout() {
    try {
        const response = await GAxios.get("/user/logout");
        const res = response.data;

        if (res.code === 200) {
            const { G_LoginInfo } = storeToRefs(useUserStore());
            G_LoginInfo.value = {
                id: NaN,
                isLogin: false,
                nickName: "",
                account: "",
                email: "",
                status: 1,
            };
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

export { ApiLogin, ApiEmailLogin, ApiCookieLogin, ApiLogout };
