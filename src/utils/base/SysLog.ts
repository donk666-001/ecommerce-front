class SysLog {
    public static getBaseEnvLog() {
        console.log(`=== 环境变量验证 ===`);
        console.log(`当前环境：${import.meta.env.MODE}`);
        console.log(`BASE_URL：${import.meta.env.BASE_URL}`);
        console.log(`DEV：${import.meta.env.DEV}`);
        console.log(`PROD：${import.meta.env.PROD}`);
        console.log(`SSR：${import.meta.env.SSR}`);

        console.log(`应用名: ${import.meta.env.VITE_APP_TITLE}`);
        console.log(`目标API基准地址: ${import.meta.env.VITE_API_TARGET}`);
        console.log(`前端项目目录: ${import.meta.env.VITE_APP_ENV}`);
        console.log(`前端启动地址: ${import.meta.env.VITE_DEV_CORS_ORIGIN}`);
        console.log(`基准路由: ${import.meta.env.VITE_BASE_URL}`);
    }
}
export { SysLog };
