# 助眠音频资源说明

## 目录结构

```
public/audio/
├── bamboo-rain.mp3      # 竹林夜雨
├── deep-sea.mp3         # 深海蓝调
├── forest-breeze.mp3    # 山林清风
├── moonlight.mp3        # 月光曲
├── dawn-light.mp3       # 晨曦微露
└── silent-snow.mp3      # 雪落无声
```

## 使用说明

### 当前状态

目前这些音频文件尚未添加，组件中使用的是模拟播放逻辑。在实际部署时，需要：

1. **添加真实音频**：将对应的助眠音频放入此目录
2. **音频规格建议**：
    - 格式：MP3/AAC/WAV
    - 比特率：128-192kbps（平衡音质和文件大小）
    - 时长：30-60分钟
    - 大小：每个文件控制在50MB以内
    - 采样率：44.1kHz

### 音频类型说明

#### 自然音

- **竹林夜雨**：模拟竹林中的雨声，有助于放松身心
- **山林清风**：山间微风拂过的声音，清新自然
- **晨曦微露**：清晨鸟鸣和微风的声音，适合早晨使用

#### 环境音

- **深海蓝调**：深海环境的低频声音，有助于深度放松
- **雪落无声**：雪天静谧的环境音，营造宁静氛围

#### 轻音乐

- **月光曲**：柔和的钢琴曲，舒缓情绪

### 临时解决方案

在开发阶段，可以使用以下方式：

1. **使用在线音频服务**：

    ```typescript
    // 修改组件中的音频路径为在线URL
    const audioUrl = "https://example.com/audio/bamboo-rain.mp3";
    ```

2. **使用免费音频资源**：
    - FreeSound.org
    - Pixabay Music
    - YouTube Audio Library

3. **移除音频功能**：
    - 暂时注释掉音频播放相关代码
    - 仅显示音频列表界面

### 音频命名规范

- 使用小写字母
- 单词间用连字符分隔
- 描述性命名，便于识别

### 后续优化建议

#### 1. 音频播放功能实现

```typescript
// 示例：集成真实的音频播放
const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.loop = true; // 循环播放
    audio.play().catch((err) => console.error("播放失败:", err));
    return audio;
};
```

#### 2. 后台播放支持

- 使用Web Audio API
- 实现Service Worker进行后台播放
- 支持锁屏控制

#### 3. 定时功能扩展

- 添加定时器（15min/30min/60min）
- 渐弱停止功能
- 睡眠模式自动关闭

#### 4. 性能优化

- 实现音频预加载
- 使用CDN加速音频加载
- 支持离线缓存

#### 5. 用户体验增强

- 添加播放进度条
- 音量调节功能
- 播放列表管理
- 收藏功能

### API集成建议

当后端API准备好后，可以这样集成：

```typescript
// 获取助眠音频列表
const fetchAudioLibrary = async () => {
    try {
        const response = await fetch("/api/sleep-audios");
        const data = await response.json();
        audioLibrary.value = data;
    } catch (error) {
        console.error("获取音频库失败:", error);
    }
};

// 记录播放历史
const recordPlayHistory = async (audioId: number) => {
    try {
        await fetch("/api/sleep-audios/play-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioId, playTime: new Date() }),
        });
    } catch (error) {
        console.error("记录播放历史失败:", error);
    }
};
```

### 推荐算法扩展

基于用户睡眠质量推荐音频：

```typescript
// 根据睡眠数据推荐音频
const recommendAudio = (sleepData: SleepData) => {
    if (sleepData.deepSleepRatio < 0.2) {
        // 深睡比例低，推荐深度放松音频
        return audioLibrary.value.filter(
            (audio) => audio.type === "环境音" || audio.title.includes("深海"),
        );
    }

    if (sleepData.fallAsleepTime > 30) {
        // 入睡时间长，推荐助眠音频
        return audioLibrary.value.filter(
            (audio) => audio.type === "自然音" || audio.title.includes("雨"),
        );
    }

    return audioLibrary.value;
};
```

### 注意事项

1. **版权问题**：确保使用的音频有合法版权或使用许可
2. **文件大小**：考虑移动端用户的流量消耗
3. **兼容性**：测试不同浏览器的音频播放兼容性
4. **用户体验**：避免自动播放，尊重用户选择
5. **无障碍**：为音频添加适当的ARIA标签
