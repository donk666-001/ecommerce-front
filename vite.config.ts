import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // 加载环境变量，指定自定义的 env 目录
    const projectEnv = loadEnv(mode, resolve(process.cwd(), "env"), "");
    // 若要调取系统的环境变量，用这个
    // const globalEnv = loadEnv(mode, process.cwd(), "");
    const isProduction = mode === "production"; // 是否为生产环境
    const isDev = mode === "development"; // 是否为开发环境
    // const isTest = mode === "test"; // 是否为测试环境
    let envName: string; // 环境中文名称
    switch (mode) {
        case "development":
            envName = "开发";
            break;
        case "production":
            envName = "生产";
            break;
        case "test":
            envName = "测试";
            break;
        default:
            envName = "未知";
    }
    console.log(`当前项目根路径：${resolve(__dirname)}`);
    console.log(`当前项目运行环境：${envName}环境`);

    // 从环境变量中读取 VITE_BASE_URL
    const baseUrl = projectEnv.VITE_BASE_URL || "/";
    const apiProxyTarget =
        projectEnv.VITE_API_TARGET || "http://localhost:9090";
    console.log("baseUrl:", baseUrl);
    // 只输出 VITE_ 开头的环境变量
    const viteEnv: Record<string, any> = {};
    Object.keys(projectEnv).forEach((key) => {
        if (key.startsWith("VITE_")) {
            viteEnv[key] = projectEnv[key];
        }
    });
    console.log(`当前项目运行环境地址：${JSON.stringify(viteEnv, null, 2)}`);

    return {
        // 项目启动后的路由根路径（例如：http://localhost:5173/dev/ ），注意格式为 /yoursrc/，你可以写多层路径，如：/.env.development/yoursrc/，但必须保证左右都被斜杠包裹
        // base: baseUrl,
        base: "/e-commerce", // 最好不要用环境变量读取，部署到云服务的时候，直接写死
        envDir: "./env", // 环境变量目录，用于读取环境变量
        // 插件配置
        plugins: [
            VueRouter({
                dts: "src/typed-router.d.ts",
                routesFolder: "src/pages",
                importMode: "sync",
                extendRoute: () => {
                    // 可以在这里扩展路由
                },
            }),
            vue(),
        ],
        // 别名配置
        resolve: {
            // 别名配置
            alias: {
                // src 目录别名（你可以在路径引用中使用 @ 代替 src 目录）
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },

        // 服务器选项
        server: {
            // 端口号
            port: 5173,
            // 监听地址（开放了 0.0.0.0 地址后，将监听当前设备所有可用的本地或网络 IP 地址）
            // host: isDev ? "0.0.0.0" : "localhost",
            host: "localhost",
            // https: {
            //     rejectUnauthorized: false,
            //     key: fs.readFileSync(
            //         resolve(__dirname, "./resource/certs/key.pem"),
            //     ),
            //     cert: fs.readFileSync(
            //         resolve(__dirname, "./resource/certs/cert.pem"),
            //     ),
            // },
            proxy: {
                "/e-commerce/api": {
                    target: apiProxyTarget,
                    changeOrigin: true,
                    secure: false, // 相当于 Node 端的 rejectUnauthorized: false，允许代理到 https 且忽略证书校验
                    rewrite: (path) => path.replace(/^\/e-commerce\/api/, ""), // 去掉路径前缀，因为后端没有这个路径
                },
                "/ws": {
                    target: "ws://localhost:9090",
                    ws: true,
                    changeOrigin: true,
                    // 捕获 WebSocket 代理层的各类 socket 错误（ECONNABORTED/ECONNRESET/ECONNREFUSED）
                    // 防止 ec-notification 未启动或连接中断时 Vite 进程在 Windows 上崩溃（exit code 0xC0000409）
                    configure: (proxy: any) => {
                        const ignore = (err: NodeJS.ErrnoException) => {
                            const ignored = [
                                "ECONNABORTED",
                                "ECONNRESET",
                                "ECONNREFUSED",
                                "EPIPE",
                            ];
                            if (!ignored.includes(err.code ?? "")) {
                                console.error("[ws proxy error]", err.message);
                            }
                        };
                        proxy.on("error", ignore);
                        proxy.on(
                            "proxyReqWs",
                            (_req: any, _socket: any, clientSocket: any) => {
                                clientSocket?.on("error", ignore);
                            },
                        );
                        proxy.on("open", (proxySocket: any) => {
                            proxySocket?.on("error", ignore);
                        });
                    },
                },
            },
            open: "/e-commerce/landing", // 启动项目后，自动打开落地页
        },

        // 优化依赖项
        optimizeDeps: {
            include: ["vue", "vue-router", "echarts", "element-plus"], // 预构建的包，常用的还有："echarts", "element-plus"
            // exclude: ['vue-demi'] // 排除某些不需要预构建的包
            force: true, // 强制预构建
        },

        // 构建选项
        build: {
            outDir: "dist", // 输出目录
            assetsDir: "assets", // 构建后的资源目录， 构建后资源放在 dist/assets
            sourcemap: isDev, // 是否生成 sourcemap 文件
            minify: isDev ? "esbuild" : "terser", // 混淆器
            // terser 配置
            terserOptions: {
                // 压缩配置
                compress: {
                    drop_console: isProduction, // 生产环境移除console
                    drop_debugger: isProduction, // 生产环境移除debugger
                    pure_funcs: isProduction
                        ? ["console.log", "console.info"]
                        : [], // 生产环境移除特定函数调用
                },
            },
            cssCodeSplit: true, // 启用CSS代码分割
            assetsInlineLimit: 4096, // 小于4kb的资源内联为base64
            rollupOptions: {
                // 输出格式定制：控制构建后文件的格式和结构
                output: {
                    manualChunks: {
                        // 框架代码单独打包
                        framework: ["vue", "vue-router", "pinia"],
                        // UI库单独打包（根据实际项目需要启用）
                        // ui: ["element-plus"], // 如果使用Element Plus
                        // 工具库单独打包（根据实际项目需要启用）
                        // utils: ["axios", "lodash-es"], // 如果使用这些库
                    },
                    entryFileNames: isDev
                        ? "assets/[name].[hash].js"
                        : "assets/[name].[hash:8].js", // 入口文件命名
                    chunkFileNames: isDev
                        ? "assets/[name].[hash].js"
                        : "assets/[name].[hash:8].js", // 代码块命名
                    assetFileNames: (assetInfo) => {
                        let extType =
                            assetInfo.name?.split(".").at(1) || "asset";
                        if (/png|jpe?g|gif|svg|webp|avif/.test(extType)) {
                            extType = "img";
                        } else if (/woff2?|eot|ttf|otf/.test(extType)) {
                            extType = "fonts";
                        }
                        return `assets/${extType}/[name].[hash:8][extname]`;
                    }, // 资源文件命名
                },
            },
            // 构建大小警告阈值 (KB)
            chunkSizeWarningLimit: 1000,
        },

        // 定义环境变量前缀，确保只有 VITE_ 开头的环境变量会被暴露到客户端
        // vite 内部的配置，使用 loadEnv(mode, resolve(process.cwd(), "env"), ""); 读取所有的自定义环境变量
        // 前端访问环境变量时，请使用 import.meta.env.VITE_XXX 获取
        envPrefix: "VITE_",
    };
});
