import { GAxios } from "@/plugins";

// 获取登录的图形验证码
async function ApiLoginCaptcha(account: string) {
    try {
        const response = await GAxios.post("/resource/svg/verifyCode/login", {
            account: account,
        });
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`[network]发现错误:`, error);
        return null;
    }
}

// 发送登录/注册的邮箱验证码
async function ApiSendEmailCaptcha(email: string) {
    try {
        const response = await GAxios.post("/email/verify/login", {
            email: email,
        });
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`[network]发现错误:`, error);
        return null;
    }
}

export { ApiLoginCaptcha, ApiSendEmailCaptcha };
