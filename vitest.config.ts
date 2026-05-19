import viteConfig from "./vite.config";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

export default mergeConfig(
    // 调用 viteConfig 函数并传入适当的环境参数
    viteConfig({ command: "serve", mode: "test" }),
    defineConfig({
        test: {
            environment: "jsdom",
            exclude: [...configDefaults.exclude, "e2e/**"],
            root: fileURLToPath(new URL("./", import.meta.url)),
            setupFiles: ["./vitest.setup.ts"], // 添加测试设置文件
            globals: true, // 启用全局 API，如 test, describe, expect
        },
    }),
);
