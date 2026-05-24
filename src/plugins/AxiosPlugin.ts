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
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json",
        },
    });

    // 通用请求拦截器
    instance.interceptors.request.use(
        (config) => {
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
                console.warn("认证过期", data.message);
                // 此处应跳转登录页 router.push('/login')
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
