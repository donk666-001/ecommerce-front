import App from "./App.vue";
import { router } from "./config/index";
import "@/styles/base.scss";
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
app.mount("#app");
