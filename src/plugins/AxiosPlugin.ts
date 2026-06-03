import axios, { type AxiosInstance } from "axios";

// 创建基础实例
const createAxiosInstance = (withCredentials: boolean): AxiosInstance => {
    const instance = axios.create({
        baseURL: "/e-commerce/api", // 开发时使用
        // baseURL: "http://localhost:9090", // 本地虚拟机使用
        // baseURL: "https://dev.ppsnav.cn/e-commerce/local/api", // 云服务器专用版
        timeout: 10000,
        withCredentials,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
        },
    });

    // 通用请求拦截器
    instance.interceptors.request.use(
        (config) => {
            const isFormData =
                typeof FormData !== "undefined" &&
                config.data instanceof FormData;
            if (isFormData) {
                if (config.headers) {
                    delete (config.headers as Record<string, unknown>)[
                        "Content-Type"
                    ];
                }
            } else if (config.data != null && config.headers) {
                (config.headers as Record<string, unknown>)["Content-Type"] =
                    "application/json";
            }
            console.log("完整请求路径：", (config.baseURL || "") + config.url);
            if (withCredentials) {
                console.log(`[携带cookie]请求参数:${JSON.stringify(config)}`);
            }
            return config;
        },
        (error) => Promise.reject(error),
    );

    // 通用响应拦截器
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (!error.response) {
                // 无响应错误（网络/跨域问题）
                if (error.code === "ERR_NETWORK") {
                    console.error("网络连接异常", error);
                } else if (error.code === "ECONNABORTED") {
                    console.error("请求超时", error.message);
                }
                return Promise.reject({ ...error, isNetworkError: true });
            }

            // 有响应错误
            const { status, data } = error.response;
            if (status === 401) {
                // 以下接口的 401 由各自的调用方静默处理，不触发全局跳转
                // /users/refresh → router guard 判断未登录，正常流转
                // /users/info   → loadUserInfo() 自行 catch 降级
                const silentPaths = ["/users/refresh", "/users/info"];
                if (silentPaths.some((p) => error.config?.url?.includes(p))) {
                    return Promise.reject(error);
                }
                console.warn("认证过期", data?.message);
                // 清除 store 状态后跳转登录页（懒加载避免循环依赖）
                import("@/store/user").then(({ useUserStore }) => {
                    useUserStore().clearLoginInfo();
                });
                const loginPath = `${import.meta.env.BASE_URL}login`;
                const current = window.location.pathname;
                const redirect =
                    current !== loginPath
                        ? `?redirect=${encodeURIComponent(current)}`
                        : "";
                window.location.href = `${loginPath}${redirect}`;
            } else {
                console.error(`服务异常 [${status}]`, error.response);
            }
            return Promise.reject(error);
        },
    );

    return instance;
};

// 按需导出实例
export const GAxios = createAxiosInstance(false); // 不带凭证
export const GAxiosWithCredentials = createAxiosInstance(true); // 带凭证
