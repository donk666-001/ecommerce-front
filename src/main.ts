import App from "./App.vue";
import { router } from "./config/index";
import "@/styles/base.scss";
import "@/styles/landing.scss";
import { SysLog } from "@/utils";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createPinia } from "pinia";
import { type Component, createApp } from "vue";

// 打印项目环境信息
SysLog.getBaseEnvLog();

const app = createApp(App);

app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component as Component);
}

app.use(createPinia());
app.use(router);

// 等待初次导航（含 auth 守卫的 refreshToken 请求）完全完成后再渲染
// 避免未登录时短暂渲染首页后才跳转登录页（首屏闪烁）
await router.isReady();

app.mount("#app");
