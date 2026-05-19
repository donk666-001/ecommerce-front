/// <reference types="vite/client" />

// 扩展 ImportMetaEnv 接口，添加项目自定义的环境变量类型
interface ImportMetaEnv {
    /** 应用标题 */
    readonly VITE_APP_TITLE: string;

    /** 应用运行环境 */
    readonly VITE_APP_ENV: "development" | "production" | "test";

    /** 开发环境 CORS 源 */
    readonly VITE_DEV_CORS_ORIGIN: string;

    /** 应用基础路径 */
    readonly VITE_BASE_URL: string;

    /** API 目标地址 */
    readonly VITE_API_TARGET: string;

    // 可以在这里添加更多自定义环境变量类型
    // readonly VITE_YOUR_CUSTOM_VAR: string;
}
