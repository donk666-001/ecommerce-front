# 睡眠追踪组件使用说明

## 组件概述

`SleepTracker.vue` 是一个完整的睡眠作息管理组件，包含睡眠记录、总结、作息建议、趋势分析和助眠音频等功能。

## 功能模块

### 1. 记录睡眠卡

#### 功能特性

- **日期选择**：支持选择历史日期记录睡眠
- **时间输入**：入睡时间和起床时间选择器
- **自动计算**：根据入睡和起床时间自动计算睡眠时长
- **跨午夜处理**：智能处理跨午夜的睡眠场景（如23:00入睡，07:00起床）
- **质量评分**：5星评分系统，直观展示睡眠质量
- **夜醒次数**：单选标签组，记录夜间醒来次数
- **睡眠状态**：多选标签组，记录多种睡眠状态

#### 数据联动

- 点击"保存记录"后，数据自动同步到"昨夜睡眠总结卡"
- 评分自动计算：星数 × 20 = 总分
- 时间和时长自动回填到总结卡片

#### API集成

```typescript
// 保存睡眠记录的API调用示例
const saveSleepRecord = async () => {
    try {
        const response = await fetch("/api/sleep-logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sleepForm.value),
        });
        const data = await response.json();
        // 处理响应
    } catch (error) {
        console.error("保存失败:", error);
    }
};
```

### 2. 昨夜睡眠总结卡

#### 显示内容

- 睡眠时长（小时+分钟）
- 自评星级和分数
- 入睡时间
- 起床时间
- 夜醒次数
- 睡眠状态标签

#### 数据来源

从记录睡眠卡的数据自动生成，实时反映最新的睡眠记录。

### 3. 今日作息时间建议

#### 时间轴设计

- **已完成节点**：绿色实心圆点，表示已完成的作息
- **未来节点**：灰色空心圆点，表示待完成的作息
- **时间节点**：基于中医十二时辰理论

#### 示例作息

```
06:30 寅时未起床，温水一杯
07:00 卯时起床，舒展筋骨
07:30 早餐宜温，养胃健脾
09:00 巳时工作，精力充沛
12:00 午时小憩，养心补阴
...
```

#### 可定制性

用户可以调整每项的具体时间和内容（需后端支持）。

### 4. 近7日睡眠趋势图

#### SVG折线图

- **X轴**：日期（最近7天）
- **Y轴**：睡眠时长（4-12小时）
- **数据点**：每日实际睡眠时长
- **统计信息**：平均时长、与上周对比

#### 可扩展功能

- 切换周/月/年视图
- 添加今日数据点
- 导出图表数据

#### 图表配置

```typescript
const chartConfig = {
    width: 600,
    height: 300,
    padding: {
        left: 50,
        right: 20,
        top: 20,
        bottom: 40,
    },
};
```

### 5. 助眠音律库

#### 音频类型

- **自然音**：竹林夜雨、山林清风、晨曦微露
- **环境音**：深海蓝调、雪落无声
- **轻音乐**：月光曲

#### 播放功能

- 点击播放/暂停按钮
- 循环播放模式
- 同时只能播放一个音频
- 后台播放支持（需额外实现）

#### 音频文件结构

```
public/audio/
├── bamboo-rain.mp3      # 竹林夜雨
├── deep-sea.mp3         # 深海蓝调
├── forest-breeze.mp3    # 山林清风
├── moonlight.mp3        # 月光曲
├── dawn-light.mp3       # 晨曦微露
└── silent-snow.mp3      # 雪落无声
```

## 技术实现

### 数据类型定义

```typescript
interface SleepForm {
    date: string;
    bedTime: string;
    wakeTime: string;
    duration: string;
    quality: number;
    wakeUpCount: string;
    status: string[];
}

interface LastNightSummary {
    duration: string;
    rating: number;
    score: number;
    bedTime: string;
    wakeTime: string;
    wakeUpCount: string;
    status: string[];
}

interface ScheduleItem {
    time: string;
    content: string;
    completed: boolean;
}

interface TrendDataItem {
    date: string;
    duration: number;
}

interface AudioItem {
    id: number;
    title: string;
    type: string;
    duration: string;
    icon: any;
}
```

### 核心算法

#### 睡眠时长计算

```typescript
const calculateSleepDuration = () => {
    const [bedHour, bedMinute] = bedTime.split(":").map(Number);
    const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);

    let bedMinutes = bedHour * 60 + bedMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;

    // 跨午夜处理
    if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60;
    }

    const diffMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}小时${minutes}分钟`;
};
```

#### 评分计算

```typescript
const score = quality * 20; // 5星制转换为百分制
```

### 响应式设计

组件支持多种屏幕尺寸：

- **桌面端**：完整布局，多列显示
- **平板端**：适当调整布局
- **移动端**：单列布局，优化触摸体验

## 使用示例

### 在首页中引入

```vue
<template>
    <div class="home-page">
        <!-- 其他内容 -->
        <SleepTracker />
    </div>
</template>

<script setup lang="ts">
import SleepTracker from "@/components/SleepTracker.vue";
</script>
```

### 点击卡片滚动到组件

```typescript
const showSleepTracker = () => {
    const sleepSection = document.querySelector(".sleep-tracker");
    if (sleepSection) {
        sleepSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};
```

## API接口建议

### 睡眠记录相关

```typescript
// POST /api/sleep-logs - 保存睡眠记录
{
  date: string
  bedTime: string
  wakeTime: string
  duration: string
  quality: number
  wakeUpCount: string
  status: string[]
}

// GET /api/sleep-logs - 获取睡眠记录列表
{
  logs: SleepLog[]
  total: number
}

// GET /api/sleep-logs/summary - 获取睡眠总结
{
  lastNight: LastNightSummary
  weeklyStats: WeeklyStats
}

// GET /api/sleep-logs/trend - 获取趋势数据
{
  trend: TrendDataItem[]
  stats: TrendStats
}
```

### 音频相关

```typescript
// GET /api/sleep-audios - 获取音频库
{
  audios: AudioItem[]
}

// POST /api/sleep-audios/play-history - 记录播放历史
{
  audioId: number
  playTime: Date
  duration: number
}
```

## 性能优化建议

### 1. 懒加载

- 音频文件按需加载
- 图表数据分页加载

### 2. 缓存策略

- 缓存历史睡眠数据
- 缓存音频元数据

### 3. 内存管理

- 组件卸载时清理音频播放器
- 及时释放不需要的数据

### 4. 用户体验

- 添加加载状态提示
- 提供操作反馈（成功/失败）
- 支持键盘导航

## 扩展功能

### 1. 智能推荐

基于睡眠质量推荐助眠音频：

```typescript
const recommendAudio = (sleepData: SleepData) => {
    if (sleepData.deepSleepRatio < 0.2) {
        return deepRelaxationAudios;
    }
    if (sleepData.fallAsleepTime > 30) {
        return sleepAidAudios;
    }
    return allAudios;
};
```

### 2. 数据分析

- 睡眠质量趋势分析
- 最佳入睡时间建议
- 个性化作息方案

### 3. 社交功能

- 分享睡眠报告
- 睡眠挑战活动
- 好友排行榜

### 4. 设备集成

- 智能手环数据同步
- 睡眠监测设备对接
- 健康数据整合

## 注意事项

1. **隐私保护**：睡眠数据属于敏感个人信息，需要加密存储
2. **数据安全**：API接口需要身份验证和权限控制
3. **用户体验**：避免频繁的自动刷新，尊重用户操作
4. **兼容性**：测试不同浏览器的时间和音频API兼容性
5. **无障碍**：确保所有功能都可以通过键盘访问

## 故障排除

### 常见问题

1. **音频无法播放**
    - 检查音频文件路径是否正确
    - 确认文件格式是否支持
    - 查看浏览器控制台错误信息

2. **时间计算错误**
    - 验证时间格式是否为HH:mm
    - 检查跨午夜逻辑是否正确

3. **图表显示异常**
    - 确认数据格式是否正确
    - 检查SVG viewBox设置
    - 验证坐标计算逻辑

### 调试技巧

```typescript
// 启用调试日志
console.log("睡眠表单数据:", sleepForm.value);
console.log("计算的时长:", sleepForm.value.duration);
console.log("趋势数据:", trendData.value);
```

## 更新日志

### v1.0.0 (2026-05-20)

- 初始版本发布
- 实现基础睡眠记录功能
- 添加睡眠总结展示
- 集成作息建议时间轴
- 实现睡眠趋势图表
- 添加助眠音频库
