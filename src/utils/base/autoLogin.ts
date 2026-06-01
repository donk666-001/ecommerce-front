import { resolvePostLoginPath } from "./authRedirect";
import { useUserStore } from "@/store/user";

/**
 * 自动登录：使用原生 fetch 刷新令牌，不经过 Axios
 * @returns 是否自动登录成功
 */
export async function tryAutoLogin(): Promise<boolean> {
    console.log("[Auto Login] 开始尝试自动登录...");

    try {
        const baseURL = import.meta.env.BASE_URL || "/";
        const apiBase = `${baseURL}/api`;
        const requestUrl = `${apiBase}/users/refresh`;

        console.log("[Auto Login] 请求配置:", {
            baseURL,
            apiBase,
            requestUrl,
            fullUrl: window.location.origin + requestUrl,
        });

        const response = await fetch(requestUrl, {
            method: "GET",
            credentials: "include", // 携带 Cookie（双 Cookie：访问令牌 + 刷新令牌）
            headers: {
                "Content-Type": "application/json",
            },
        });

        // 先检查响应状态，避免解析非 JSON 响应
        if (!response.ok) {
            console.warn(
                `[Auto Login] ⚠️ HTTP 错误: ${response.status} ${response.statusText}`,
            );
            // 尝试读取错误信息（可能是 JSON 或文本）
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorResult = await response.json();
                    console.warn("[Auto Login] 错误详情:", errorResult);
                } catch {
                    console.warn("[Auto Login] 无法解析错误响应");
                }
            }
            return false;
        }

        // 确保响应是 JSON 格式
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn(
                "[Auto Login] ⚠️ 响应不是 JSON 格式:",
                contentType || "unknown",
            );
            return false;
        }

        const result = await response.json();
        console.log("[Auto Login] 响应:", result);

        // 检查是否为刷新令牌不存在的错误
        if (
            (response.status === 401 || result.code === 401) &&
            result.message?.includes("刷新令牌不存在")
        ) {
            console.log("[Auto Login] ℹ️ 刷新令牌不存在，跳过自动登录");
            return false;
        }

        // 检查是否自动登录成功
        if (response.status !== 200 || result.code !== 200) {
            console.warn("[Auto Login] ⚠️ 自动登录失败:", result);
            return false;
        }

        console.log("[Auto Login] ✅ 自动登录成功");

        // 更新 Pinia 用户信息
        const userStore = useUserStore();
        const userData = result.data;

        // 设置登录信息
        userStore.G_LoginInfo = {
            ...userStore.G_LoginInfo,
            id: userData.id,
            isLogin: true,
            nickName: userData.nickname || userData.username,
            account: userData.username,
            status: 1,
        };

        // 根据 privileges 推导 role_id
        const codes: number[] = userData.privileges ?? [];
        const role_id = codes.includes(100)
            ? 1 // 管理员
            : codes.includes(200)
              ? 2 // 专家
              : codes.includes(400)
                ? 4 // 客服
                : 3; // 普通用户

        userStore.G_UserInfo = {
            ...userStore.G_UserInfo,
            role_id,
        };

        // 保存 tab 用户 ID（防止多标签页身份冲突）
        sessionStorage.setItem("tab-user-id", String(userData.id));
        userStore.isInitialized = true;

        console.log("[Auto Login] 用户信息已更新:", {
            id: userData.id,
            nickname: userData.nickname,
            role_id,
        });

        // 加载完整用户信息
        await userStore.loadUserInfo();

        // 跳转到对应角色的页面
        const redirectPath = resolvePostLoginPath(role_id);
        console.log("[Auto Login] 准备跳转到:", redirectPath);

        // 使用 router 跳转（需要在调用方传入 router 实例）
        return true;
    } catch (error) {
        console.error("[Auto Login] ❌ 自动登录请求失败:", error);
        return false;
    }
}
