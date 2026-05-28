# SleepDataReaderIOS 使用说明

这是一个 iOS 小程序，用来读取 iPhone 健康 App 中由 Apple Watch 同步过来的最近 7 天睡眠阶段数据，并上传到网站后端。

## 已支持

- 打开 App 后自动申请健康权限并读取最近 7 天睡眠数据
- 睡眠总览：总睡眠、深睡、核心睡眠、REM、清醒、睡眠阶段条
- 最近 7 天每日摘要
- 阶段明细列表
- 绑定网站用户 ID
- 配置后端地址
- 上传到后端接口：`POST /sleep-records/apple-watch/import`
- JSON 预览与复制

## 在 Xcode 里打开

打开：

`SleepDataReader.xcodeproj`

然后做两件事：

1. 左侧点项目 `SleepDataReader`
2. 进入 `Signing & Capabilities`
3. `Team` 选择你的 Apple ID 开发团队
4. 如果 HealthKit 没显示，点 `+ Capability` 添加 `HealthKit`

## 真机联调注意

如果 App 跑在 iPhone 真机上，`localhost` 指的是 iPhone 自己，不是你的电脑。

建议在 App 的“后端地址”里填电脑局域网地址，例如：

`http://192.168.1.8:9090`

电脑和 iPhone 需要在同一个 Wi-Fi。Windows 防火墙也要允许 9090 端口被局域网访问。

## 网站账号绑定

当前后端 import 接口需要 `userId`，这个值应该填网站用户 ID，例如 `4`。

Apple Health 本身不会提供你网站的账号 ID，所以 App 必须做一次账号绑定。现在这版使用“填写网站用户 ID”的方式完成绑定。

如果后续要做正式登录，需要后端提供移动端登录接口，返回 token 和网站用户 ID，App 再把 token 保存到 Keychain，并在上传时带上鉴权 header。

## 上传 JSON 格式

App 上传到：

`POST http://你的后端地址/sleep-records/apple-watch/import`

请求体示例：

```json
{
  "generatedAt": "2026-05-28T03:34:20Z",
  "sleepData": [
    {
      "endTime": "2026-05-28T03:45:45+08:00",
      "startTime": "2026-05-28T03:07:45+08:00",
      "type": "light"
    }
  ],
  "userId": "4"
}
```

`type` 对应：

- `deep`：深睡
- `light`：核心睡眠
- `rem`：REM
- `awake`：清醒
- `inBed`：在床
- `asleep`：系统只给了“睡着”，没细分阶段
- `unknown`：未知阶段

## 运行要求

- 需要真机 iPhone
- iPhone 上要有健康 App 睡眠数据
- Apple Watch 的睡眠数据需要已经同步到 iPhone
- 第一次运行会弹出健康权限，允许读取睡眠数据
