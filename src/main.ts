import App from "./App.vue";
import { router } from "./config/index";
import "@/styles/base.scss";
import { SysLog } from "@/utils";
import { tryAutoLogin } from "@/utils/base/autoLogin";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { createPinia } from "pinia";
import { type Component, createApp } from "vue";

// 打印项目环境信息
SysLog.getBaseEnvLog();

const app = createApp(App);

// @ts-ignore - ElementPlus plugin type inference issue
app.use(ElementPlus, {
    locale: zhCn,
});
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component as Component);
}

app.use(createPinia());
app.use(router);

// 尝试自动登录（使用原生 fetch，不经过 Axios）
const autoLoginSuccess = await tryAutoLogin();

if (autoLoginSuccess) {
    // 自动登录成功，跳转到对应角色页面
    const userStore = await import("@/store/user").then((m) =>
        m.useUserStore(),
    );
    const role_id = userStore.G_UserInfo.role_id;
    const { resolvePostLoginPath } = await import("@/utils/base/authRedirect");
    const redirectPath = resolvePostLoginPath(role_id);
    console.log("[Auto Login] 跳转到:", redirectPath);
    await router.push(redirectPath);
} else {
    // 自动登录失败，等待路由守卫处理
    console.log("[Auto Login] 自动登录未成功，由路由守卫处理");
}

// 等待初次导航（含 auth 守卫的 refreshToken 请求）完全完成后再渲染
// 避免未登录时短暂渲染首页后才跳转登录页（首屏闪烁）
await router.isReady();

app.mount("#app");
