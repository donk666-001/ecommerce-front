# 颐养阁 · 东方自然健康生活平台

> 静谧 · 专业 · 东方 —— 在一屏之内，让人感受到「进入了一座清晨森林」

---

## 项目简介

**颐养阁**是一个融合东方自然哲学的健康生活平台前端项目。  
它将二十四节气养生、中医古方智慧与 AI 个性化推荐融为一体，为用户提供节气内容、睡眠分析、在线问诊、养生课程、社区交流等一站式服务。

本仓库为前端工程，基于 **Vue 3 + TypeScript + Vite** 构建，采用文件路由组织页面，配合 Spring Cloud 微服务后端协同运作。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) + TypeScript |
| 构建工具 | Vite 7 |
| 路由 | Vue Router 4 + unplugin-vue-router（文件路由） |
| 状态管理 | Pinia 3 |
| UI 组件库 | Element Plus |
| HTTP 请求 | Axios |
| 数据可视化 | ECharts 6 |
| 3D 渲染 | Three.js |
| 实时通信 | STOMP.js（WebSocket） |
| 样式 | Sass / SCSS |
| 代码规范 | OxLint + OxFmt |
| 单元测试 | Vitest |
| E2E 测试 | Playwright |

---

## 功能模块

```
src/pages/
├── landing/        # 落地页（东方意境首屏）
├── login/          # 登录 / 注册
├── shop/           # 养生商城 + 支付
├── consultation/   # 在线问诊
├── community/      # 健康社区
├── ai-butler/      # AI 健康管家
├── customer/       # 用户中心
├── settings/       # 个人设置
└── admin/          # 后台管理
```

### 核心功能亮点

- **节气养生内容** — 根据二十四节气推送养生知识与食谱
- **AI 健康管家** — 个性化健康建议与智能问答
- **在线问诊** — 与专业医师实时交流（WebSocket 支持）
- **睡眠 / 情绪追踪** — 数据可视化健康报告
- **养生商城** — 商品浏览、下单、扫码支付全流程
- **健康社区** — 用户分享与互动

---

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm（推荐）

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

启动后自动打开落地页：[http://localhost:5173/e-commerce/landing](http://localhost:5173/e-commerce/landing)

### 构建生产版本

```bash
pnpm build
```

### 其他命令

```bash
pnpm test:unit     # 单元测试
pnpm test:e2e      # E2E 测试
pnpm lint          # 代码检查（自动修复）
pnpm format        # 代码格式化
```

---

## 环境变量配置

在 `env/` 目录下配置各环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_BASE_URL` | 应用根路径 | `/e-commerce` |
| `VITE_API_TARGET` | 后端 API 地址 | `http://localhost:9090` |

---

## 项目结构

```
e-commerce-front/
├── src/
│   ├── assets/         # 静态资源（图片、字体）
│   ├── components/     # 全局复用组件
│   ├── composables/    # 组合式函数
│   ├── config/         # 全局配置
│   ├── layouts/        # 页面布局
│   ├── network/        # Axios 封装 / API 定义
│   ├── pages/          # 文件路由页面
│   ├── store/          # Pinia 状态仓库
│   ├── styles/         # 全局样式
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── env/                # 环境变量文件
├── public/             # 公共静态资源
├── vite.config.ts      # Vite 配置
└── package.json
```

---

## 后端服务

本项目配套 Spring Cloud 微服务后端，包含用户、商品、订单、问诊、通知等服务。  
后端仓库：[e-commerce](https://github.com/donk666-001)

---

## 设计理念

> **留白即语言** — 空间本身就是设计元素，不让任何区域拥挤  
> **材质先于装饰** — 靠色彩深度、光影层次、字体质感说话，不靠花哨效果  
> **东方而非中国风** — 克制的意境美学，拒绝符号化  
> **专业信任感** — 排版精确、间距一致、色彩沉稳，传达健康平台的专业度

---

## License

MIT
