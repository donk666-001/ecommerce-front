# 颐养阁 · 品牌落地页设计规格

**日期**：2026-06-02  
**状态**：已确认，待实现  
**设计稿**：`e-commerce-front/.superpowers/brainstorm/2719-1780379751/content/landing-mockup-v8.html`

---

## 1. 概述

为颐养阁前端项目新增一个独立的品牌营销落地页（`/landing` 路由），向新访客展示平台核心价值。页面与现有功能页（`/`）并存，不修改现有页面结构。

**目标**：用户从任意渠道进入 `/landing`，60 秒内了解平台特色并完成注册引导。

---

## 2. 页面路由与文件结构

```
src/
├── pages/
│   └── LandingPage.vue          # 新增，落地页根组件
├── components/landing/
│   ├── LandingNav.vue           # 悬浮导航
│   ├── LandingHero.vue          # Hero 区块
│   ├── LandingStats.vue         # 数据统计
│   ├── LandingFeatures.vue      # 六大功能
│   ├── LandingAIButler.vue      # AI 管家展示
│   ├── LandingHowTo.vue         # 三步流程
│   ├── LandingExperts.vue       # 专家团队
│   ├── LandingTestimonials.vue  # 用户评价
│   ├── LandingCTA.vue           # 行动号召
│   └── LandingFooter.vue        # 页脚
└── router/index.ts              # 新增 /landing 路由
```

---

## 3. 视觉风格

### 3.1 设计语言

**有机自然系**（Organic Natural）：苔藓绿 × 陶土 × 森林暗调，传递"东方自然养生"的品牌调性。

### 3.2 色彩

| 变量 | 色值 | 用途 |
|---|---|---|
| `--moss` | `#5D7052` | 主色，按钮、标签、图标背景 |
| `--moss-light` | `#8fa882` | 浅苔藓，标签文字、辅助 |
| `--terra` | `#C18C5D` | 陶土，星评、转诊卡片 |
| `--cinnabar` | `#B33C2C` | 朱红，Logo blob |
| 文字白 | `rgba(255,255,255,0.92)` | 正文标题 |
| 文字灰 | `rgba(255,255,255,0.52)` | 辅助说明 |

### 3.3 字体

- 标题：`Georgia, "STSong", serif`（衬线，传统感）
- 正文：`"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`

### 3.4 圆角规范

| 元素 | 圆角 |
|---|---|
| 功能卡片 | `1.5rem` |
| 专家/评价卡片 | `2rem` |
| Hero 毛玻璃卡片 | `22px`（特殊角 `48px`） |
| 宽卡（名医健康圈） | `999px` |
| 按钮 | `999px` |
| 聊天窗口 | `24px` |

---

## 4. 全局背景

**固定森林场景层**（`position: fixed; z-index: 0`）：

- 背景图：`https://images.unsplash.com/photo-1448375240586-882707db888b`（生产环境替换为本地资源）
- Ken Burns 动画：28s，缩放 1→1.08，轻微平移
- 亮度：`brightness(0.65) saturate(1.12)`
- God Rays：8 条光柱，固定在视口左上 18% 处，`rayPulse` 动画（5.5–10s）
- 太阳光晕：`bloomPulse` 6s，`mix-blend-mode: screen`
- 漂浮粒子：12 个，随机分布全页宽度，`floatUp` 动画（10–19s）
- 纸质纹理：SVG feTurbulence，`opacity: 0.028`，`mix-blend-mode: multiply`

各内容区块以 `position: relative; z-index: 1` 叠加在场景层之上，通过半透明背景 `rgba(6~20, 10~26, 4~18, 0.42~0.88)` + `backdrop-filter: blur(2~6px)` 实现毛玻璃效果，保持视觉连续性。

---

## 5. 区块规格

### 5.1 导航（LandingNav）

- `position: fixed; top: 16px`，胶囊形内框
- 初始：`rgba(255,255,255,0.10)` + 白色文字
- 滚动超过 80px：`rgba(20,26,16,0.72)` 深色毛玻璃，苔藓描边
- Logo blob：朱红 `#B33C2C`，有机形状
- 右侧唯一按钮：**前往登录 / 注册**（白底苔藓字）

### 5.2 Hero

- 布局：两列 Grid（`1fr 1fr`），左文右卡
- 左侧：徽章 → 主标题（86px/58px 衬线）→ 副标题 → 双按钮
- 右侧：`2×2` 毛玻璃卡片网格 + 底部宽卡（名医健康圈）
- 卡片样式：`backdrop-filter: blur(18px) saturate(1.45)`，`rgba(255,255,255,0.11)` 背景
- 底部：滚动提示线

### 5.3 Stats（数据统计）

4 列均等，数据：`24节 / 6+ / 50+ / 10万+`，垂直分隔线

### 5.4 Features（六大功能）

`3×2` 网格，卡片含：图标块 + 标题 + 描述 + 标签组

功能列表：节气养生 / 睡眠作息 / 经期管理 / 中医养生 / 情绪疗愈 / 个性推荐

### 5.5 AI 管家（重点展示）

两列布局（`1fr 1fr`）：

**左侧**：区块标签 + 标题（"你的专属东方健康顾问"）+ 副标题 + 4 个特性列表项（节气日历 / 体质辨识 / 实时问答 / 智能转诊）

**右侧**：聊天窗口 mockup
- 顶栏：头像 + 名称 + 绿点在线状态 + "由 DeepSeek 驱动"标签
- 消息序列：系统提示 → AI 建议 → 用户提问 → AI 回复 → 转诊推荐卡片 → 打字气泡
- 底部：输入框 + 发送按钮

### 5.6 How To（三步流程）

横向 `1fr 80px 1fr 80px 1fr` 网格，步骤圆形数字 + SVG 波浪连接线

### 5.7 Experts（专家团队）

`3×1` 网格，每张专家卡：有机形状头像 + 姓名 + 职称 + 所属医院 + 标签

### 5.8 Testimonials（用户评价）

`3×1` 网格，引号 + 评语 + 用户信息行（头像 / 姓名 / 体质 / 星评）

### 5.9 CTA

深色背景（`rgba(6,10,5,0.72)`），居中：标签 + 大标题 + 副标题 + 双按钮 + 四项特性说明

### 5.10 Footer

四列：品牌介绍 / 功能模块 / 服务 / 关于  
版权：`© 2026 颐养阁`，社交图标：微信 / 微博 / 抖音（SVG）

---

## 6. 动画规格

### 6.1 Hero 入场序列（CSS animation，无需 JS）

| 元素 | 延迟 | 动画 |
|---|---|---|
| 徽章 | 0.3s | `heroFadeUp` 0.8s |
| 主标题 | 0.5s | `heroFadeUp` 0.9s |
| 副标题 | 0.75s | `heroFadeUp` 0.9s |
| 按钮组 | 1.0s | `heroFadeUp` 0.9s |
| 卡片 1–4 | 1.1–1.4s | `heroFadeUp` 0.8s |
| 宽卡 | 1.5s | `heroFadeUp` 0.8s |
| 滚动提示 | 1.8s | `heroFadeUp` 0.8s |

### 6.2 打字机效果

- 目标：Hero 主标题「与自然同频」
- 页面加载后 0.9s 触发，每字 120ms，首字前延迟 600ms

### 6.3 滚动入场（IntersectionObserver，threshold: 0.12）

`[data-animate]` 属性统一管理：
- 默认：`translateY(32px)` → `none`，0.75s `cubic-bezier(.22,1,.36,1)`
- `from-left`：`translateX(-40px)` → `none`
- `from-right`：`translateX(40px)` → `none`
- `scale-up`：`scale(0.88) translateY(16px)` → `none`
- 通过 CSS 自定义属性 `--delay` 控制各元素错开时机（80–510ms）

### 6.4 数字计数（IntersectionObserver，threshold: 0.3）

Stats 区块进入视口后，`count-num` 元素从 0 计数至目标值，1600ms 三次缓出曲线。

### 6.5 AI 对话逐条出现

AI 管家区块进入视口后（threshold: 0.2），5 条消息按 `[300, 1400, 2600, 3800, 5200]ms` 延迟依次 `.show`（`opacity: 0→1 + translateY(8px)→0`）。

### 6.6 Blob 漂移（CSS keyframes，持续循环）

三套轨迹（`blobDrift1/2/3`），周期 14 / 18 / 22s，`translate + scale + rotate` 组合，幅度约 ±14px。

### 6.7 卡片 hover 流光

所有内容卡片（feature / expert / testi / fg-card）`:hover::after` 触发：  
`background-position: 200%→-200%`，模拟光线从左扫过，0.55s ease。

---

## 7. 实现约束

- **不使用 Tailwind**，纯 SCSS + CSS 自定义属性
- **不修改现有页面**：`index.vue`、`HeaderLayout.vue` 均不变
- 森林背景图生产环境替换为 `/assets/images/forest-bg.jpg`（Unsplash 图仅用于 mockup）
- AI 管家聊天窗口为静态 mockup，不接真实 API（区别于 `AiButlerStreamController` 的真实对话功能）
- 路由守卫：`/landing` 不需要登录，跳过 JWT 检查（与网关 `/internal/**` 规则无关）
- 「前往登录 / 注册」按钮跳转至 `router.push('/login')`

---

## 8. 不在本次范围内

- 移动端响应式适配（另起一期）
- 落地页 SEO meta 标签（另起一期）
- A/B 测试与埋点（另起一期）
