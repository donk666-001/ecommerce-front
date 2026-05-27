# 专家在线状态心跳机制设计

**日期：** 2026-05-27  
**状态：** 已审批  
**范围：** ec-consult 服务 + ec-expert 服务 + 前端 consultation 页面 + HeaderLayout

---

## 1. 背景与问题

当前用户侧在线咨询页面（`consultation/index.vue:171`）的专家"在线"标签是静态硬编码：

```html
<span class="pill pill-jade">在线</span>
```

无论专家是否真的在线，始终显示绿色"在线"标签，导致用户体验欺骗。

`ExpertCardDTO` 无在线状态字段；后端 `Expert` 实体虽有 `lastActiveAt` 字段，但从未被更新。

---

## 2. 目标

- 专家打开 App 时自动上线，关闭时自动下线
- 用户侧专家卡片实时展示在线/离线状态
- 零新基础设施依赖（不引入 Redis 等）

---

## 3. 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 在线语义 | 严格在线（STOMP 连接活跃） | 语义清晰，无歧义 |
| 专家连接时机 | 全局（HeaderLayout，登录即连接） | 无需进入咨询 Tab 才显示在线 |
| 状态存储 | JVM 内存 `ConcurrentHashSet` | 单实例部署，无多实例计划，零依赖 |
| 服务间依赖方向 | ec-expert → Feign → ec-consult | ec-consult 持有在线 Set，ec-expert 查询补填 isOnline |

---

## 4. 整体架构

```
专家登录
  │
  ▼
HeaderLayout.vue（全局，isExpertView=true）
  └─ useExpertPresenceSocket.connect(userId)
       └─ STOMP CONNECT → /ws/consult

       Spring SessionConnectEvent
  │
  ▼
ExpertPresenceListener（ec-consult）
  ├─ Principal → userId
  ├─ Feign GET /internal/experts/by-user/{userId} → expertId
  ├─ ExpertPresenceService.markOnline(expertId)
  └─ SimpMessaging → /topic/expert.online.status
       { "event": "expert.online.status", "data": { "expertId": 1, "online": true } }

用户侧 consultation/index.vue
  ├─ onMounted: GET /experts/recommend → isOnline 字段已填
  └─ useExpertOnlineSocket.subscribe()
       └─ /topic/expert.online.status → expertList[i].isOnline 实时更新

专家关闭页面
  └─ Spring SessionDisconnectEvent
       ├─ ExpertPresenceService.markOffline(expertId)
       └─ 广播 { expertId, online: false }
```

---

## 5. 后端改动

### 5.1 ec-consult：新增组件

#### `ExpertPresenceService`（新建）
```
职责：维护在线专家 ID 集合，提供查询/修改接口
字段：ConcurrentHashMap<Long, String> onlineExperts  // expertId → sessionId（防止多设备误移除，可选）
      或 ConcurrentHashSet<Long> onlineExpertIds      // 简化版（多设备一台断线即离线）
方法：
  markOnline(Long expertId)
  markOffline(Long expertId)
  isOnline(Long expertId): boolean
  getOnlineExpertIds(): Set<Long>
```

**多设备策略：** 使用 `ConcurrentHashSet`，多次 `add` 幂等，任一设备断开即离线（与"严格在线"语义一致）。

#### `ExpertPresenceListener`（新建）
```
注解：@Component, @EventListener
监听：SessionConnectEvent / SessionDisconnectEvent
逻辑（CONNECT）：
  1. 从 event.getMessage() 获取 StompHeaderAccessor
  2. 取 accessor.getUser().getName() → userId
  3. Feign: expertFeignClient.getExpertByUserId(userId) → ExpertBasicDTO
  4. 若 dto != null: ExpertPresenceService.markOnline(dto.getId())
  5. 广播 /topic/expert.online.status
逻辑（DISCONNECT）：同理，markOffline + 广播
异常处理：try-catch，Feign 失败时 log.warn 并跳过，不阻塞事件
```

#### `ExpertPresenceController`（新建）
```
路径：GET /internal/online-experts
返回：Set<Long>（当前在线 expertId 集合）
用途：供 ec-expert Feign 调用
```

#### `StompMessageFrame`（已有）
新增 `expert.online.status` 事件类型，数据结构：
```json
{
  "event": "expert.online.status",
  "data": { "expertId": 1, "online": true }
}
```

### 5.2 ec-expert：两处改动

#### `ExpertCardDTO`（已有）加字段
```java
private Boolean isOnline;  // 默认 null → 前端视为 false
```

#### `ExpertServiceImpl.getRecommendExperts()`
```
1. 查询专家列表（现有逻辑不变）
2. Feign: consultFeignClient.getOnlineExpertIds() → Set<Long>
3. toCardDTO 时补填 isOnline = onlineIds.contains(expert.getId())
4. Feign 调用失败时 catch：全部 isOnline = false，log.warn
```

#### 新增 `ConsultFeignClient`（ec-expert 侧）
```
调用 ec-consult 的 GET /internal/online-experts
```

---

## 6. 前端改动

### 6.1 新增 `useExpertPresenceSocket.ts`

```
职责：专家端全局 STOMP 连接（用于上线信号）
底层：与 useExpertQueueSocket 共享 expertQueueClient 单例
      → 将两者的客户端提升为共享模块 expertStompClient.ts
方法：
  connect(userId: number): void   // 建立连接
  disconnect(): void
备注：连接建立后 ExpertQueueSocket 可复用此连接追加订阅
```

**重构说明：** `useExpertQueueSocket` 和 `useExpertPresenceSocket` 共用同一个底层 STOMP 客户端，避免两条 TCP 连接。提取 `expertStompClient.ts` 单例，两个 composable 都从中取 client。

### 6.2 新增 `useExpertOnlineSocket.ts`

```
职责：用户侧订阅在线状态广播
连接：独立 STOMP 客户端（用户不是专家，不能复用专家客户端）
订阅：/topic/expert.online.status
回调：onStatusChange(expertId: number, online: boolean)
```

### 6.3 `HeaderLayout.vue`

```typescript
// onMounted
if (isExpertView.value && userStore.G_LoginInfo.id) {
  useExpertPresenceSocket().connect(userStore.G_LoginInfo.id)
}
// onUnmounted
useExpertPresenceSocket().disconnect()
```

### 6.4 `consultation/index.vue`

**interface 变更：**
```typescript
interface ExpertCardDTO {
    id: number; realName: string; avatar: string | null;
    roleType: string; bio: string | null;
    isOnline: boolean;  // 新增
}
```

**onMounted 追加：**
```typescript
const { subscribe, unsubscribe } = useExpertOnlineSocket()
subscribe((expertId, online) => {
    const idx = expertList.value.findIndex(e => e.id === expertId)
    if (idx !== -1) expertList.value[idx] = { ...expertList.value[idx], isOnline: online }
})
```

**onUnmounted 追加：**
```typescript
unsubscribe()
```

**模板（两处）：**
```html
<!-- 专家卡片列表 -->
<span v-if="doc.isOnline" class="pill pill-jade">在线</span>
<span v-else class="pill pill-gray">离线</span>

<!-- 聊天头部 -->
<span :class="selectedExpert.isOnline ? 'pill-jade' : 'pill-gray'">
  {{ selectedExpert.isOnline ? '在线' : '离线' }}
</span>
```

**CSS 补充：**
```css
.pill-gray { background: var(--ink-soft, #e5e7eb); color: var(--ink-muted, #6b7280); }
```

---

## 7. 文件变更清单

### 前端（e-commerce-front）

| 文件 | 操作 |
|------|------|
| `src/composables/expertStompClient.ts` | 新增（共享客户端单例） |
| `src/composables/useExpertPresenceSocket.ts` | 新增（专家端全局连接） |
| `src/composables/useExpertOnlineSocket.ts` | 新增（用户侧订阅） |
| `src/composables/useExpertQueueSocket.ts` | 改动（迁移至 expertStompClient） |
| `src/layouts/HeaderLayout.vue` | 改动（专家全局连接） |
| `src/pages/consultation/index.vue` | 改动（isOnline 字段 + 模板 + 订阅） |

### 后端（e-commerce）

| 文件 | 操作 |
|------|------|
| `ec-consult/.../ExpertPresenceService.java` | 新增 |
| `ec-consult/.../ExpertPresenceListener.java` | 新增 |
| `ec-consult/.../ExpertPresenceController.java` | 新增 |
| `ec-api-expert/.../ExpertBasicDTO.java` | 无需改动（已有 id/userId） |
| `ec-api-consult`（新建 API 模块，与 ec-api-expert 同级） | 新增 `ConsultFeignClient` 接口（`GET /internal/online-experts → Set<Long>`） |
| `ec-expert/.../ExpertCardDTO.java` | 改动（加 isOnline 字段） |
| `ec-expert/.../ExpertServiceImpl.java` | 改动（填充 isOnline） |

---

## 8. 错误处理

| 场景 | 处理 |
|------|------|
| Feign 查 expertId 失败（CONNECT 时） | try-catch，warn 日志，跳过 markOnline，不影响连接 |
| Feign 查在线 Set 失败（getRecommendExperts 时） | 降级全部 isOnline=false，warn 日志 |
| 专家断网 TCP 异常 | Spring SessionDisconnectEvent 由 STOMP 心跳超时触发，自动 markOffline |
| ec-consult 重启 | 内存 Set 清空，专家重新打开 App 后恢复在线，短暂离线可接受 |
| 用户侧 STOMP 断连 | reconnectDelay:5000 自动重连；初始 isOnline 已由 REST 加载，不影响展示 |
| 同一专家多设备登录 | 任一设备断开即离线（严格在线语义） |

---

## 9. 不在本期范围内

- 专家手动"暂停接诊"开关
- 多实例在线状态共享（Redis）
- 在线时长统计
- `lastActiveAt` 数据库更新（可独立迭代）
