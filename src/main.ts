import App from "./App.vue";
import { router } from "./config/index";
import "@/styles/base.scss";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createPinia } from "pinia";
import { type Component, createApp } from "vue";
// console.log(`当前环境：${import.meta.env.Mode}`);
// if (import.meta.env.DEV) {
//     console.log(`=== 环境变量验证 ===`);
//     console.log(`VITE_APP_TITLE: ${import.meta.env.VITE_APP_TITLE}`);
//     console.log(`VITE_API_TARGET: ${import.meta.env.VITE_API_TARGET}`);
//     console.log(`VITE_APP_ENV: ${import.meta.env.VITE_APP_ENV}`);
//     console.log(
//         `VITE_DEV_CORS_ORIGIN: ${import.meta.env.VITE_DEV_CORS_ORIGIN}`,
//     );
//     console.log(`VITE_BASE_URL: ${import.meta.env.VITE_BASE_URL}`);
//     console.log(`MODE: ${import.meta.env.MODE}`);
//     console.log(`DEV: ${import.meta.env.DEV}`);
//     console.log(`PROD: ${import.meta.env.PROD}`);
//     console.log(`==================`);
// } else if (import.meta.env.PROD) {
//     console.log(`=== 环境变量验证 ===`);
//     console.log(`VITE_APP_TITLE: ${import.meta.env.VITE_APP_TITLE}`);
//     console.log(`VITE_API_TARGET: ${import.meta.env.VITE_API_TARGET}`);
//     console.log(`VITE_APP_ENV: ${import.meta.env.VITE_APP_ENV}`);
//     console.log(
//         `VITE_DEV_CORS_ORIGIN: ${import.meta.env.VITE_DEV_CORS_ORIGIN}`,
//     );
//     console.log(`==================`);
// }

const app = createApp(App);

app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component as Component);
}

app.use(createPinia());
app.use(router);
app.mount("#app");
