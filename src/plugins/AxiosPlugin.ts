import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from "axios";

// ==================== 令牌刷新状态机 ====================
type RefreshState = "idle" | "refreshing" | "unauthorized";
let refreshState: RefreshState = "idle";
let pendingRequests: Array<{
    config: InternalAxiosRequestConfig;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}> = [];

// ==================== 核心功能函数 ====================

/**
 * 执行令牌刷新
 */
async function performTokenRefresh(): Promise<boolean> {
    if (refreshState === "refreshing") {
        return new Promise((resolve) => {
            resolve(false);
        });
    }

    refreshState = "refreshing";
    console.log("[Token Refresh] 开始刷新令牌...");

    try {
        // 直接使用原生 fetch 避免循环依赖和拦截器干扰
        const baseURL = "/e-commerce/api";
        const requestUrl = `${baseURL}/users/refresh`;

        console.log("[Token Refresh] 请求配置:", {
            baseURL,
            requestUrl,
            fullUrl: window.location.origin + requestUrl,
        });

        const response = await fetch(requestUrl, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // 先检查响应状态，避免解析非 JSON 响应
        if (!response.ok) {
            console.warn(
                `[Token Refresh] ⚠️ HTTP 错误: ${response.status} ${response.statusText}`,
            );
            // 尝试读取错误信息（可能是 JSON 或文本）
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorResult = await response.json();
                    console.warn("[Token Refresh] 错误详情:", errorResult);
                } catch {
                    console.warn("[Token Refresh] 无法解析错误响应");
                }
            }
            refreshState = "unauthorized";
            await handleUnauthorized();
            rejectPendingRequests();
            return false;
        }

        // 确保响应是 JSON 格式
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn(
                "[Token Refresh] ⚠️ 响应不是 JSON 格式:",
                contentType || "unknown",
            );
            refreshState = "unauthorized";
            await handleUnauthorized();
            rejectPendingRequests();
            return false;
        }

        const result = await response.json();
        console.log("[Token Refresh] 刷新响应:", result);

        if (result.code === 200) {
            // 刷新成功
            console.log("[Token Refresh] 刷新成功，释放待处理请求");
            refreshState = "idle";
            retryPendingRequests();
            return true;
        } else if (result.code === 401) {
            // 刷新令牌失效，需要重新登录
            console.warn("[Token Refresh] 刷新令牌失效:", result.message);
            refreshState = "unauthorized";
            await handleUnauthorized();
            rejectPendingRequests();
            return false;
        } else {
            // 其他错误码，视为刷新失败
            console.error("[Token Refresh] 刷新失败:", result);
            refreshState = "unauthorized";
            await handleUnauthorized();
            rejectPendingRequests();
            return false;
        }
    } catch (error) {
        console.error("[Token Refresh] 刷新请求异常:", error);
        refreshState = "unauthorized";
        await handleUnauthorized();
        rejectPendingRequests();
        return false;
    }
}

/**
 * 重试所有待处理的请求
 */
function retryPendingRequests() {
    pendingRequests.forEach(({ config, resolve }) => {
        // 重新发送请求
        axios(config)
            .then(resolve)
            .catch((error) => {
                // 如果重试仍然失败，交给原始 reject 处理
                console.error("[Token Refresh] 重试请求失败:", error);
            });
    });
    pendingRequests = [];
}

/**
 * 拒绝所有待处理的请求
 */
function rejectPendingRequests() {
    pendingRequests.forEach(({ reject }) => {
        reject({ code: "TOKEN_REFRESH_FAILED", message: "令牌刷新失败" });
    });
    pendingRequests = [];
}

/**
 * 处理未授权状态（清除登录态并跳转）
 */
async function handleUnauthorized() {
    try {
        const { useUserStore } = await import("@/store/user");
        const userStore = useUserStore();
        if (userStore.G_LoginInfo.isLogin) {
            await userStore.logout();
            const current = window.location.pathname;
            const basePath = import.meta.env.BASE_URL || "/";
            const loginPath = basePath === "/" ? "/login" : `${basePath}login`;
            const redirect =
                current !== loginPath
                    ? `?redirect=${encodeURIComponent(current)}`
                    : "";
            console.log("[Auth] 跳转到登录页:", `${loginPath}${redirect}`);
            window.location.href = `${loginPath}${redirect}`;
        }
    } catch (error) {
        console.error("[Auth] 处理未授权状态失败:", error);
    }
}

// ==================== Axios 实例创建 ====================

/**
 * 创建基础实例
 */
const createAxiosInstance = (withCredentials: boolean): AxiosInstance => {
    const instance = axios.create({
        baseURL: "/e-commerce/api", // 开发时使用
        // baseURL: "http://localhost:9090", // 本地虚拟机使用
        // baseURL: "https://dev.ppsnav.cn/e-commerce/local/api", // 云服务器专用版
        // baseURL: "http://154.219.104.242:9090", // 云服务器专用版
        timeout: 10000,
        withCredentials,
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
        },
    });

    // ==================== 请求拦截器 ====================
    instance.interceptors.request.use(
        (config) => {
            console.log("完整请求路径：", (config.baseURL || "") + config.url);
            if (withCredentials) {
                console.log(`[携带cookie]请求参数:`, config);
            }

            // 如果正在刷新令牌，将请求加入等待队列
            if (refreshState === "refreshing") {
                // 排除刷新接口本身，避免死锁
                if (config.url?.includes("/users/refresh")) {
                    return config;
                }

                console.log(
                    "[Token Refresh] 请求被拦截，加入等待队列:",
                    config.url,
                );
                return new Promise((resolve, reject) => {
                    pendingRequests.push({ config, resolve, reject });
                });
            }

            return config;
        },
        (error) => Promise.reject(error),
    );

    // ==================== 响应拦截器 ====================
    instance.interceptors.response.use(
        (response) => {
            console.log("[Response Interceptor] 收到响应:", {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
            return response;
        },
        async (error) => {
            console.log("[Response Interceptor] 捕获错误:", {
                url: error.config?.url,
                hasResponse: !!error.response,
                status: error.response?.status,
                data: error.response?.data,
            });

            if (!error.response) {
                // 无响应错误(网络/跨域问题)
                if (error.code === "ERR_NETWORK") {
                    console.error("网络连接异常", error);
                } else if (error.code === "ECONNABORTED") {
                    console.error("请求超时", error.message);
                }
                return Promise.reject({ ...error, isNetworkError: true });
            }

            // 有响应错误
            const { status, data } = error.response;
            console.log("[Response Interceptor] 响应详情:", {
                status,
                dataCode: data?.code,
                dataMessage: data?.message,
            });

            // 处理业务层面的 403(令牌过期但刷新令牌有效)
            // 支持两种情况:
            // 1. HTTP 200 + data.code = 403 (业务层错误码)
            // 2. HTTP 403 + data.code = 403 (HTTP 状态码也是 403)
            const isTokenExpired =
                (status === 200 && data?.code === 403) ||
                (status === 403 && data?.code === 403);

            if (isTokenExpired) {
                console.log("[Token Refresh] ⚠️ 检测到令牌过期:", data);
                const message = data.message || "";
                console.log(
                    "[Token Refresh] 检查消息是否包含'刷新令牌有效':",
                    message,
                    message.includes("刷新令牌有效"),
                );

                if (message.includes("刷新令牌有效")) {
                    console.log(
                        "[Token Refresh] ✅ 确认需要刷新令牌,当前状态:",
                        refreshState,
                    );

                    // 如果已经在刷新中,当前请求会被请求拦截器处理
                    if (refreshState === "refreshing") {
                        console.log("[Token Refresh] 已在刷新中,等待队列处理");
                        return new Promise(() => {
                            // 等待刷新完成,由 retryPendingRequests 处理
                        });
                    }

                    console.log("[Token Refresh] 🔄 启动刷新流程...");
                    // 启动刷新流程
                    const success = await performTokenRefresh();
                    console.log(
                        "[Token Refresh] 刷新结果:",
                        success ? "成功" : "失败",
                    );
                    if (success) {
                        // 刷新成功,重新发送原请求
                        console.log(
                            "[Token Refresh] 📤 重新发送请求:",
                            error.config.url,
                        );
                        return axios(error.config);
                    } else {
                        // 刷新失败,返回错误
                        console.error("[Token Refresh] ❌ 刷新失败,拒绝请求");
                        return Promise.reject({
                            code: "TOKEN_REFRESH_FAILED",
                            message: "令牌刷新失败",
                        });
                    }
                } else {
                    console.log(
                        "[Token Refresh] ⚠️ 消息不包含'刷新令牌有效',不触发刷新",
                    );
                }
            } else {
                console.log("[Token Refresh] ℹ️ 非令牌过期错误,跳过刷新逻辑");
            }

            // 处理 HTTP 401 错误
            if (status === 401) {
                console.warn("[Auth] 认证过期", data?.message);
                // 清除 store 状态后跳转登录页（懒加载避免循环依赖）
                import("@/store/user").then(({ useUserStore }) => {
                    const userStore = useUserStore();
                    // 避免重复清除和跳转
                    if (userStore.G_LoginInfo.isLogin) {
                        userStore.clearLoginInfo();
                        const current = window.location.pathname;
                        const basePath = import.meta.env.BASE_URL || "/";
                        // 确保登录路径包含 base URL
                        const loginPath =
                            basePath === "/" ? "/login" : `${basePath}login`;
                        const redirect =
                            current !== loginPath
                                ? `?redirect=${encodeURIComponent(current)}`
                                : "";
                        console.log(
                            "[Auth] 跳转到登录页:",
                            `${loginPath}${redirect}`,
                        );
                        window.location.href = `${loginPath}${redirect}`;
                    }
                });
            } else {
                console.error(`服务异常 [${status}]`, error.response);
            }
            return Promise.reject(error);
        },
    );

    return instance;
};

// ==================== 导出实例 ====================
export const GAxios = createAxiosInstance(false); // 不带凭证
export const GAxiosWithCredentials = createAxiosInstance(true); // 带凭证
