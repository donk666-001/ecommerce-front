# 客服工作台功能说明

## 概述

颐养阁电商平台的客服工作台系统，提供完整的客户服务功能，包括会话管理、排队队列、历史查询、商品订单速查等。

## 功能模块

### 1. 客服登录 (`/customer/login`)
- 工号密码登录
- 角色验证（仅允许客服角色码400的用户登录）
- 自动跳转到客服工作台

### 2. 工作台主界面 (`/customer/index`)
六个主要功能面板：

#### 📊 工作台 (Dashboard)
- 今日数据统计（接待中、排队数、已接待、消息数、平均响应时间）
- 待办提醒（超时未回复的会话）
- 全店客服在线情况

#### 💬 接待中 (Chat)
- 左侧：当前会话列表
- 中间：聊天区域
  - 支持文本消息
  - 支持发送商品卡片
  - 支持发送订单卡片
  - 常用语快捷回复
- 右侧：客户信息面板
  - 基本资料
  - 购物车信息
  - 历史消费数据

#### ⏳ 排队队列 (Queue)
- 显示等待中的客户列表
- FIFO + 职能匹配分配
- 支持主动接入排队客户

#### 📜 历史会话 (History)
- 按条件搜索历史会话
- 分页展示
- 显示评价和结束原因

#### 🔍 商品订单速查 (Tools)
- 商品搜索：按名称关键词搜索
- 订单查询：按订单号或客户姓名查询
- 快速发送商品/订单到会话

#### ⚙️ 个人设置 (Settings)
- 账号信息查看
- 自动欢迎语设置
- 常用语库管理

### 3. 客服状态管理
- 在线 (online)
- 小休 (break)
- 下班 (off)
- 状态切换实时同步

## 技术实现

### API 接口层 (`src/network/customer.ts`)

所有API接口都已定义并包含模拟数据：

```typescript
// 获取会话列表
ApiCustomer.getSessions()

// 发送消息
ApiCustomer.sendMessage(sessionId, message)

// 获取排队队列
ApiCustomer.getQueueList()

// 从队列接入客户
ApiCustomer.acceptFromQueue(queueNum)

// 获取历史会话
ApiCustomer.getHistorySessions(page, pageSize, filters)

// 获取统计数据
ApiCustomer.getStats()

// 获取客服同事列表
ApiCustomer.getColleagues()

// 更新客服状态
ApiCustomer.updateStatus(status)

// 搜索商品
ApiCustomer.searchProducts(keyword)

// 查询订单
ApiCustomer.searchOrders(keyword)
```

### WebSocket 实时通信 (`src/network/customer.ws.ts`)

模拟WebSocket连接，提供实时消息推送：

```typescript
import { customerWS } from '@/network/customer.ws'

// 连接
await customerWS.connect()

// 发送消息
customerWS.send({ type: 'send_message', sessionId, message })

// 接收消息
customerWS.onMessage((data) => {
    // 处理新消息、会话分配等
})

// 断开
customerWS.disconnect()
```

### 数据类型定义

```typescript
interface CustomerSession {
    id: string
    custId: string
    custName: string
    avatar: string
    source: string
    sourceTag: 'product' | 'order' | 'general'
    startedAt: string
    unread: number
    lastMsg: string
    custTags: string[]
    messages: CustomerMessage[]
    // ... 更多字段
}

interface CustomerMessage {
    from: 'sys' | 'customer' | 'me'
    text: string
    time: string
    type?: 'product' | 'order'
    meta?: any
}
```

## 模拟数据说明

当前所有API都返回预定义的模拟数据，无需后端即可完整体验功能：

- **会话数据**：2个活跃会话（清风明月、云栖之客）
- **排队数据**：2个排队客户
- **历史数据**：3条历史记录
- **商品数据**：4个商品（枸杞红枣茶、四物汤等）
- **订单数据**：3个订单
- **客服同事**：3个客服（小翠、阿岚、暮雨）

## 后续开发 TODO

### 后端对接
1. 将 `customer.ts` 中的模拟数据替换为真实API调用
2. 取消注释真实的HTTP请求代码
3. 删除模拟数据返回部分

### WebSocket 真实化
1. 将 `customer.ws.ts` 改为真实的WebSocket连接
2. 使用 `new WebSocket(url)` 替代模拟类
3. 处理真实的消息格式

### 功能增强
1. **图片消息**：支持发送和接收图片
2. **文件传输**：支持发送文件
3. **表情选择器**：完善表情功能
4. **消息撤回**：支持撤回已发送消息
5. **会话标签**：给客户打标签
6. **智能推荐**：根据客户问题推荐回复
7. **语音消息**：支持语音通话

### 性能优化
1. 消息列表虚拟滚动
2. 会话列表懒加载
3. 图片懒加载
4. WebSocket断线重连机制

### 用户体验
1. 消息提示音
2. 桌面通知
3. 快捷键支持
4. 深色模式
5. 多语言支持

## 开发注意事项

1. **类型安全**：所有数据都有TypeScript类型定义
2. **错误处理**：所有API调用都有try-catch错误处理
3. **加载状态**：异步操作都有loading状态
4. **用户反馈**：成功/失败都有ElMessage提示
5. **组件化**：每个面板都是独立组件，便于维护

## 测试建议

1. 登录流程测试
2. 会话切换测试
3. 消息发送接收测试
4. 状态切换测试
5. 搜索功能测试
6. 排队接入测试

## 相关文档

- [Vue Router配置](../../config/router.ts)
- [用户Store](../../store/user.ts)
- [认证工具](../../utils/base/authRedirect.ts)
