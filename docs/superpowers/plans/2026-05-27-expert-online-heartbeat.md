# Expert Online Status (Heartbeat) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 专家登录后通过 STOMP 连接自动标记在线，用户侧专家卡片实时展示在线/离线状态，无需引入 Redis 等新依赖。

**Architecture:** ec-consult 监听 Spring SessionConnectEvent / SessionDisconnectEvent，维护内存中 `ConcurrentHashSet<Long> onlineExpertIds`，并通过 SimpMessagingTemplate 广播到 `/topic/expert.online.status`。ec-expert 的 `getRecommendExperts` 通过新增的 `ec-api-consult` Feign 模块查询在线集合，填充 `ExpertCardDTO.isOnline`。前端专家端在 HeaderLayout 全局连接，用户端订阅广播实时更新卡片状态。

**Tech Stack:** Java 25, Spring Boot 4.0.6, Spring WebSocket/STOMP, OpenFeign, Vue 3, TypeScript, @stomp/stompjs

---

## 文件变更总览

### 后端（`E:\springcloud_project\e-commerce`）
| 文件 | 操作 |
|------|------|
| `ec-api/pom.xml` | 改动 — 注册 ec-api-consult 子模块 |
| `pom.xml`（根） | 改动 — dependencyManagement 加 ec-api-consult |
| `ec-api/ec-api-consult/pom.xml` | 新增 |
| `ec-api/ec-api-consult/src/main/java/cn/ppsnav/api/consult/client/ConsultFeignClient.java` | 新增 |
| `ec-services/ec-consult/src/main/java/cn/ppsnav/consult/service/ExpertPresenceService.java` | 新增 |
| `ec-services/ec-consult/src/test/java/cn/ppsnav/consult/service/ExpertPresenceServiceTest.java` | 新增 |
| `ec-services/ec-consult/src/main/java/cn/ppsnav/consult/controller/ExpertPresenceController.java` | 新增 |
| `ec-services/ec-consult/src/main/java/cn/ppsnav/consult/listener/ExpertPresenceListener.java` | 新增 |
| `ec-api/ec-api-expert/src/main/java/cn/ppsnav/api/expert/dto/ExpertCardDTO.java` | 改动 — 加 isOnline 字段 |
| `ec-services/ec-expert/pom.xml` | 改动 — 加 ec-api-consult 依赖 |
| `ec-services/ec-expert/src/main/java/cn/ppsnav/expert/ExpertApplication.java` | 改动 — EnableFeignClients 加 consult client 包 |
| `ec-services/ec-expert/src/main/java/cn/ppsnav/expert/service/impl/ExpertServiceImpl.java` | 改动 — getRecommendExperts 填 isOnline |

### 前端（`E:\springcloud_project\e-commerce-front`）
| 文件 | 操作 |
|------|------|
| `src/composables/expertStompClient.ts` | 新增 — 共享 STOMP 客户端单例 |
| `src/composables/useExpertQueueSocket.ts` | 改动 — 迁移至 expertStompClient |
| `src/composables/useExpertPresenceSocket.ts` | 新增 — 专家端全局连接 |
| `src/composables/useExpertOnlineSocket.ts` | 新增 — 用户端订阅在线状态广播 |
| `src/layouts/HeaderLayout.vue` | 改动 — 专家登录后全局连接 |
| `src/pages/consultation/index.vue` | 改动 — isOnline 字段 + 订阅 + 模板 + CSS |

---

## Task 1: 新建 ec-api-consult Maven 模块

**Files:**
- Create: `ec-api/ec-api-consult/pom.xml`
- Create: `ec-api/ec-api-consult/src/main/java/cn/ppsnav/api/consult/client/ConsultFeignClient.java`
- Modify: `ec-api/pom.xml`
- Modify: `pom.xml`（根）

- [ ] **Step 1: 创建模块目录结构**

```powershell
New-Item -ItemType Directory -Force -Path "E:\springcloud_project\e-commerce\ec-api\ec-api-consult\src\main\java\cn\ppsnav\api\consult\client"
```

- [ ] **Step 2: 创建 ec-api-consult/pom.xml**

内容完全复制 `ec-api-expert/pom.xml` 结构，仅改 artifactId 和 description：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>cn.ppsnav</groupId>
        <artifactId>ec-api</artifactId>
        <version>0.0.1-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>ec-api-consult</artifactId>
    <description>咨询服务契约：ConsultFeignClient（供 ec-expert 查询在线专家 ID）</description>

    <dependencies>
        <dependency>
            <groupId>cn.ppsnav</groupId>
            <artifactId>ec-common-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration><skip>true</skip></configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: 创建 ConsultFeignClient.java**

路径：`ec-api/ec-api-consult/src/main/java/cn/ppsnav/api/consult/client/ConsultFeignClient.java`

```java
package cn.ppsnav.api.consult.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Set;

/**
 * 咨询服务内部 Feign 接口（供 ec-expert 查询当前在线专家 ID 集合）
 */
@FeignClient(name = "ec-consult", path = "/internal/consult")
public interface ConsultFeignClient {

    /**
     * 返回当前 STOMP 连接活跃的专家 ID 集合
     */
    @GetMapping("/online-experts")
    Set<Long> getOnlineExpertIds();
}
```

- [ ] **Step 4: 在 ec-api/pom.xml 注册新模块**

在 `<modules>` 块末尾加一行（保持其余内容不变）：

```xml
<module>ec-api-consult</module>
```

最终 `<modules>` 块：
```xml
<modules>
    <module>ec-api-user</module>
    <module>ec-api-product</module>
    <module>ec-api-order</module>
    <module>ec-api-payment</module>
    <module>ec-api-expert</module>
    <module>ec-api-notification</module>
    <module>ec-api-ai</module>
    <module>ec-api-consult</module>
</modules>
```

- [ ] **Step 5: 在根 pom.xml 的 dependencyManagement 加版本锁定**

在根 `pom.xml` 的 `<dependencyManagement>` 里，紧跟 `ec-api-ai` 条目之后添加：

```xml
<dependency>
    <groupId>cn.ppsnav</groupId>
    <artifactId>ec-api-consult</artifactId>
    <version>${project.version}</version>
</dependency>
```

- [ ] **Step 6: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce
mvn install -pl ec-api/ec-api-consult -am -q
```

期望输出：`BUILD SUCCESS`（无编译错误）

- [ ] **Step 7: Commit**

```powershell
cd E:\springcloud_project\e-commerce
git add ec-api/ec-api-consult ec-api/pom.xml pom.xml
git commit -m "feat(api): 新建 ec-api-consult 模块，暴露 ConsultFeignClient.getOnlineExpertIds"
```

---

## Task 2: ec-consult — ExpertPresenceService + 单元测试

**Files:**
- Create: `ec-services/ec-consult/src/main/java/cn/ppsnav/consult/service/ExpertPresenceService.java`
- Create: `ec-services/ec-consult/src/test/java/cn/ppsnav/consult/service/ExpertPresenceServiceTest.java`

- [ ] **Step 1: 创建测试目录**

```powershell
New-Item -ItemType Directory -Force -Path "E:\springcloud_project\e-commerce\ec-services\ec-consult\src\test\java\cn\ppsnav\consult\service"
```

- [ ] **Step 2: 先写失败测试**

路径：`ec-services/ec-consult/src/test/java/cn/ppsnav/consult/service/ExpertPresenceServiceTest.java`

```java
package cn.ppsnav.consult.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ExpertPresenceServiceTest {

    private ExpertPresenceService service;

    @BeforeEach
    void setUp() {
        service = new ExpertPresenceService();
    }

    @Test
    void markOnline_addsExpertToOnlineSet() {
        service.markOnline(1L);
        assertThat(service.isOnline(1L)).isTrue();
    }

    @Test
    void markOffline_removesExpertFromOnlineSet() {
        service.markOnline(2L);
        service.markOffline(2L);
        assertThat(service.isOnline(2L)).isFalse();
    }

    @Test
    void markOnline_isIdempotent() {
        service.markOnline(3L);
        service.markOnline(3L);
        assertThat(service.getOnlineExpertIds()).hasSize(1);
    }

    @Test
    void isOnline_returnsFalse_forUnknownExpert() {
        assertThat(service.isOnline(999L)).isFalse();
    }

    @Test
    void getOnlineExpertIds_returnsAllOnlineExperts() {
        service.markOnline(10L);
        service.markOnline(20L);
        Set<Long> ids = service.getOnlineExpertIds();
        assertThat(ids).containsExactlyInAnyOrder(10L, 20L);
    }

    @Test
    void markOffline_unknownExpert_doesNotThrow() {
        service.markOffline(999L); // 幂等，不抛异常
        assertThat(service.isOnline(999L)).isFalse();
    }
}
```

- [ ] **Step 3: 运行测试，确认失败（类不存在）**

```powershell
cd E:\springcloud_project\e-commerce
mvn test -pl ec-services/ec-consult -Dtest=ExpertPresenceServiceTest -q 2>&1 | Select-Object -Last 10
```

期望：编译错误（`ExpertPresenceService` 不存在）

- [ ] **Step 4: 实现 ExpertPresenceService**

路径：`ec-services/ec-consult/src/main/java/cn/ppsnav/consult/service/ExpertPresenceService.java`

```java
package cn.ppsnav.consult.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 在线专家状态维护服务（内存单例，单实例部署）。
 * 专家 STOMP 连接时 markOnline，断连时 markOffline。
 */
@Service
public class ExpertPresenceService {

    /** 当前在线的专家 ID 集合（线程安全） */
    private final Set<Long> onlineExpertIds = ConcurrentHashMap.newKeySet();

    public void markOnline(Long expertId) {
        onlineExpertIds.add(expertId);
    }

    public void markOffline(Long expertId) {
        onlineExpertIds.remove(expertId);
    }

    public boolean isOnline(Long expertId) {
        return onlineExpertIds.contains(expertId);
    }

    /** 返回只读快照，供 Feign 接口序列化 */
    public Set<Long> getOnlineExpertIds() {
        return Collections.unmodifiableSet(onlineExpertIds);
    }
}
```

- [ ] **Step 5: 运行测试，确认全部通过**

```powershell
cd E:\springcloud_project\e-commerce
mvn test -pl ec-services/ec-consult -Dtest=ExpertPresenceServiceTest
```

期望：`Tests run: 6, Failures: 0, Errors: 0`

- [ ] **Step 6: Commit**

```powershell
cd E:\springcloud_project\e-commerce
git add ec-services/ec-consult/src/main/java/cn/ppsnav/consult/service/ExpertPresenceService.java
git add ec-services/ec-consult/src/test/java/cn/ppsnav/consult/service/ExpertPresenceServiceTest.java
git commit -m "feat(consult): ExpertPresenceService 内存在线集合（TDD）"
```

---

## Task 3: ec-consult — ExpertPresenceController（内部 REST 接口）

**Files:**
- Create: `ec-services/ec-consult/src/main/java/cn/ppsnav/consult/controller/ExpertPresenceController.java`

- [ ] **Step 1: 创建 ExpertPresenceController**

路径：`ec-services/ec-consult/src/main/java/cn/ppsnav/consult/controller/ExpertPresenceController.java`

```java
package cn.ppsnav.consult.controller;

import cn.ppsnav.consult.service.ExpertPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

/**
 * 咨询服务内部接口（仅供 ec-expert 通过 Feign 调用，网关不对外暴露）
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/consult")
public class ExpertPresenceController {

    private final ExpertPresenceService expertPresenceService;

    /**
     * 返回当前 STOMP 连接活跃的专家 ID 集合。
     * 消费方：ec-expert.ExpertServiceImpl.getRecommendExperts()
     */
    @GetMapping("/online-experts")
    public Set<Long> getOnlineExpertIds() {
        return expertPresenceService.getOnlineExpertIds();
    }
}
```

- [ ] **Step 2: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce
mvn compile -pl ec-services/ec-consult -q
```

期望：`BUILD SUCCESS`

- [ ] **Step 3: Commit**

```powershell
cd E:\springcloud_project\e-commerce
git add ec-services/ec-consult/src/main/java/cn/ppsnav/consult/controller/ExpertPresenceController.java
git commit -m "feat(consult): ExpertPresenceController 暴露内部在线专家 ID 接口"
```

---

## Task 4: ec-consult — ExpertPresenceListener（STOMP 生命周期事件监听）

**Files:**
- Create: `ec-services/ec-consult/src/main/java/cn/ppsnav/consult/listener/ExpertPresenceListener.java`

- [ ] **Step 1: 创建目录**

```powershell
New-Item -ItemType Directory -Force -Path "E:\springcloud_project\e-commerce\ec-services\ec-consult\src\main\java\cn\ppsnav\consult\listener"
```

- [ ] **Step 2: 创建 ExpertPresenceListener**

路径：`ec-services/ec-consult/src/main/java/cn/ppsnav/consult/listener/ExpertPresenceListener.java`

```java
package cn.ppsnav.consult.listener;

import cn.ppsnav.api.expert.client.ExpertFeignClient;
import cn.ppsnav.api.expert.dto.ExpertBasicDTO;
import cn.ppsnav.consult.model.vo.StompMessageFrame;
import cn.ppsnav.consult.service.ExpertPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * STOMP 会话生命周期监听器：专家连接时标记在线，断连时标记离线，并广播状态变更。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExpertPresenceListener {

    private static final String BROADCAST_TOPIC = "/topic/expert.online.status";

    private final ExpertPresenceService expertPresenceService;
    private final ExpertFeignClient expertFeignClient;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * STOMP CONNECT 帧处理完成后触发。
     * Principal 已由 StompChannelInterceptor 设置到消息头。
     */
    @EventListener
    public void onConnect(SessionConnectEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            Principal user = accessor.getUser();
            if (user == null) {
                log.debug("[Presence] CONNECT 无 Principal（未登录），跳过");
                return;
            }
            Long userId = Long.parseLong(user.getName());
            ExpertBasicDTO expert = expertFeignClient.getExpertByUserId(userId).getData();
            if (expert == null) {
                log.debug("[Presence] userId={} 无专家记录，跳过标记上线", userId);
                return;
            }
            expertPresenceService.markOnline(expert.getId());
            broadcast(expert.getId(), true);
            log.info("[Presence] 专家上线 expertId={} userId={}", expert.getId(), userId);
        } catch (Exception e) {
            log.warn("[Presence] CONNECT 处理异常，跳过标记上线: {}", e.getMessage());
        }
    }

    /**
     * STOMP 连接断开时触发（TCP 断开或 DISCONNECT 帧均会触发）。
     */
    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        try {
            Principal user = event.getUser();
            if (user == null) {
                log.debug("[Presence] DISCONNECT 无 Principal，跳过");
                return;
            }
            Long userId = Long.parseLong(user.getName());
            ExpertBasicDTO expert = expertFeignClient.getExpertByUserId(userId).getData();
            if (expert == null) {
                log.debug("[Presence] userId={} 无专家记录，跳过标记下线", userId);
                return;
            }
            expertPresenceService.markOffline(expert.getId());
            broadcast(expert.getId(), false);
            log.info("[Presence] 专家下线 expertId={} userId={}", expert.getId(), userId);
        } catch (Exception e) {
            log.warn("[Presence] DISCONNECT 处理异常，跳过标记下线: {}", e.getMessage());
        }
    }

    private void broadcast(Long expertId, boolean online) {
        StompMessageFrame frame = new StompMessageFrame(
                "expert.online.status",
                null,
                Map.of("expertId", expertId, "online", online),
                LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend(BROADCAST_TOPIC, frame);
    }
}
```

- [ ] **Step 3: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce
mvn compile -pl ec-services/ec-consult -am -q
```

期望：`BUILD SUCCESS`

- [ ] **Step 4: Commit**

```powershell
cd E:\springcloud_project\e-commerce
git add ec-services/ec-consult/src/main/java/cn/ppsnav/consult/listener/ExpertPresenceListener.java
git commit -m "feat(consult): ExpertPresenceListener 监听 STOMP Connect/Disconnect，广播在线状态"
```

---

## Task 5: ec-expert — 接入 ConsultFeignClient，更新 ExpertCardDTO + ExpertServiceImpl

**Files:**
- Modify: `ec-api/ec-api-expert/src/main/java/cn/ppsnav/api/expert/dto/ExpertCardDTO.java`
- Modify: `ec-services/ec-expert/pom.xml`
- Modify: `ec-services/ec-expert/src/main/java/cn/ppsnav/expert/ExpertApplication.java`
- Modify: `ec-services/ec-expert/src/main/java/cn/ppsnav/expert/service/impl/ExpertServiceImpl.java`

- [ ] **Step 1: ExpertCardDTO 加 isOnline 字段**

在 `ec-api/ec-api-expert/src/main/java/cn/ppsnav/api/expert/dto/ExpertCardDTO.java` 末尾的字段列表后添加：

```java
/** 当前是否在线（STOMP 连接活跃）；由消费方 ec-expert 调用 ec-consult 内部接口填充 */
private Boolean isOnline;
```

完整文件：
```java
package cn.ppsnav.api.expert.dto;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 专家卡片 DTO（圈内首页 / 在线咨询推荐列表使用）
 */
@Data
@Accessors(chain = true)
public class ExpertCardDTO {

    private Long id;
    /** 真实姓名 */
    private String realName;
    /** 头像 objectKey（消费方自行拼 MinIO 地址） */
    private String avatar;
    /** 专家类型枚举名：DOCTOR / NUTRITIONIST / REHAB / GURU */
    private String roleType;
    /** 个人简介（认证时填写，卡片和详情页共用） */
    private String bio;
    /** 最后活跃时间（ISO-8601） */
    private String lastActiveAt;
    /** 当前是否在线（STOMP 连接活跃）；由消费方 ec-expert 调用 ec-consult 内部接口填充 */
    private Boolean isOnline;
}
```

- [ ] **Step 2: ec-expert/pom.xml 添加 ec-api-consult 依赖**

在 `ec-services/ec-expert/pom.xml` 的 `<dependencies>` 里，紧跟 `ec-api-expert` 依赖之后添加：

```xml
<!-- 消费：咨询服务（查询在线专家 ID） -->
<dependency>
    <groupId>cn.ppsnav</groupId>
    <artifactId>ec-api-consult</artifactId>
</dependency>
```

- [ ] **Step 3: ExpertApplication 添加 ConsultFeignClient 扫描包**

完整替换 `ExpertApplication.java`：

```java
package cn.ppsnav.expert;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 专家服务启动类（端口 8091）
 */
@SpringBootApplication
@MapperScan("cn.ppsnav.expert.mapper")
@EnableFeignClients(basePackages = {
        "cn.ppsnav.api.notification.client",
        "cn.ppsnav.api.user.client",
        "cn.ppsnav.api.consult.client"
})
public class ExpertApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExpertApplication.class, args);
    }
}
```

- [ ] **Step 4: 更新 ExpertServiceImpl.getRecommendExperts()**

在 `ExpertServiceImpl.java` 的 import 部分添加：

```java
import cn.ppsnav.api.consult.client.ConsultFeignClient;
import lombok.extern.slf4j.Slf4j;
```

在类字段声明中添加（已有 `ExpertMapper` 通过 `ServiceImpl` 注入）：

```java
private final ConsultFeignClient consultFeignClient;
```

由于类已有 `@RequiredArgsConstructor`，Lombok 会自动生成包含 `consultFeignClient` 的构造器。

完整替换 `getRecommendExperts` 方法：

```java
@Override
public List<ExpertCardDTO> getRecommendExperts(int limit) {
    int safeLimit = Math.min(Math.max(limit, 1), 20);

    List<Expert> experts = lambdaQuery()
            .eq(Expert::getStatus, ExpertStatus.APPROVED)
            .orderByDesc(Expert::getApprovedAt)
            .last("LIMIT " + safeLimit)
            .list();

    // 查询在线专家 ID（降级：Feign 失败时全部视为离线）
    Set<Long> onlineIds;
    try {
        onlineIds = consultFeignClient.getOnlineExpertIds();
        if (onlineIds == null) onlineIds = Set.of();
    } catch (Exception e) {
        log.warn("[ExpertService] 查询在线专家 ID 失败，降级为全部离线: {}", e.getMessage());
        onlineIds = Set.of();
    }

    final Set<Long> finalOnlineIds = onlineIds;
    return experts.stream().map(e -> toCardDTO(e, finalOnlineIds)).toList();
}
```

同时更新 `toCardDTO` 方法签名和实现（原方法只有 `Expert` 参数）：

```java
/** Expert 实体 → ExpertCardDTO（含在线状态） */
private ExpertCardDTO toCardDTO(Expert expert, Set<Long> onlineIds) {
    return new ExpertCardDTO()
            .setId(expert.getId())
            .setRealName(expert.getRealName())
            .setAvatar(expert.getAvatar())
            .setRoleType(expert.getRoleType().name())
            .setBio(expert.getBio())
            .setLastActiveAt(expert.getLastActiveAt() != null
                    ? expert.getLastActiveAt().toString() : null)
            .setIsOnline(onlineIds.contains(expert.getId()));
}
```

**注意：** 同时将类头部 `import` 加入 `Set`：

```java
import java.util.Set;
```

以及 `@Slf4j` 注解加到类上（若未有）：

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class ExpertServiceImpl extends ServiceImpl<ExpertMapper, Expert>
        implements ExpertService {
```

- [ ] **Step 5: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce
mvn compile -pl ec-services/ec-expert -am -q
```

期望：`BUILD SUCCESS`

- [ ] **Step 6: Commit**

```powershell
cd E:\springcloud_project\e-commerce
git add ec-api/ec-api-expert/src/main/java/cn/ppsnav/api/expert/dto/ExpertCardDTO.java
git add ec-services/ec-expert/pom.xml
git add ec-services/ec-expert/src/main/java/cn/ppsnav/expert/ExpertApplication.java
git add ec-services/ec-expert/src/main/java/cn/ppsnav/expert/service/impl/ExpertServiceImpl.java
git commit -m "feat(expert): 接入 ConsultFeignClient，getRecommendExperts 补填 isOnline"
```

---

## Task 6: 前端 — expertStompClient.ts（共享 STOMP 客户端单例）

**Files:**
- Create: `src/composables/expertStompClient.ts`

- [ ] **Step 1: 创建 expertStompClient.ts**

路径：`E:\springcloud_project\e-commerce-front\src\composables\expertStompClient.ts`

```typescript
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

/** 单条订阅注册记录 */
interface SubEntry {
    topic: string;
    callback: (msg: IMessage) => void;
    sub?: StompSubscription;
}

/** 共享专家 STOMP 客户端单例（useExpertPresenceSocket + useExpertQueueSocket 共用） */
let client: Client | null = null;

/** 待注册订阅 map（key → SubEntry），连接建立时批量 subscribe，断开重连时自动恢复） */
const registry = new Map<string, SubEntry>();

function buildClient(): Client {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const brokerURL = `${protocol}//${window.location.host}/ws/consult`;

    return new Client({
        brokerURL,
        reconnectDelay: 5000,
        onConnect: () => {
            // 连接/重连时恢复所有注册订阅
            for (const entry of registry.values()) {
                entry.sub = client!.subscribe(entry.topic, entry.callback);
            }
        },
        onStompError: (frame) => {
            console.error("[STOMP-Expert] 错误:", frame.headers["message"]);
        },
    });
}

/** 激活共享客户端（幂等，已激活则跳过） */
export function activateExpertClient(): void {
    if (!client) client = buildClient();
    if (!client.active) client.activate();
}

/** 停用并销毁共享客户端，清空所有订阅 */
export function deactivateExpertClient(): void {
    client?.deactivate();
    client = null;
    registry.clear();
}

/**
 * 注册一个订阅。
 * - 若客户端已连接，立即 subscribe
 * - 若尚未连接，等待 onConnect 时触发
 */
export function addExpertSubscription(
    key: string,
    topic: string,
    callback: (msg: IMessage) => void
): void {
    const entry: SubEntry = { topic, callback };
    if (client?.connected) {
        entry.sub = client.subscribe(topic, callback);
    }
    registry.set(key, entry);
}

/** 移除并取消订阅（幂等） */
export function removeExpertSubscription(key: string): void {
    const entry = registry.get(key);
    entry?.sub?.unsubscribe();
    registry.delete(key);
}
```

- [ ] **Step 2: 编译验证（TypeScript）**

```powershell
cd E:\springcloud_project\e-commerce-front
npx tsc --noEmit --strict
```

期望：无 `expertStompClient.ts` 相关错误

- [ ] **Step 3: Commit**

```powershell
cd E:\springcloud_project\e-commerce-front
git add src/composables/expertStompClient.ts
git commit -m "feat(front): expertStompClient 共享 STOMP 客户端单例（支持订阅注册/恢复）"
```

---

## Task 7: 前端 — 重构 useExpertQueueSocket.ts

**Files:**
- Modify: `src/composables/useExpertQueueSocket.ts`

- [ ] **Step 1: 完整替换 useExpertQueueSocket.ts**

```typescript
import { addExpertSubscription, removeExpertSubscription } from "./expertStompClient";
import type { IMessage } from "@stomp/stompjs";

/** 专家接诊队列实时更新订阅（复用共享 expertStompClient，不自行创建连接） */
const QUEUE_SUB_KEY = "expert-queue";

export function useExpertQueueSocket() {
    /**
     * 订阅专家个人通知频道。
     * 前提：expertStompClient 已由 useExpertPresenceSocket 在 HeaderLayout 激活。
     * @param userId  当前登录用户的 userId（即专家账号的 userId）
     * @param onQueueUpdate  收到 consult.queue_updated 事件时的回调
     */
    function subscribe(userId: number, onQueueUpdate: () => void): void {
        addExpertSubscription(
            QUEUE_SUB_KEY,
            `/topic/expert.user.${userId}`,
            (msg: IMessage) => {
                try {
                    const frame = JSON.parse(msg.body);
                    if (frame.event === "consult.queue_updated") {
                        onQueueUpdate();
                    }
                } catch {
                    // 忽略非 JSON 帧
                }
            }
        );
    }

    /** 取消接诊队列订阅（不断开共享连接） */
    function unsubscribe(): void {
        removeExpertSubscription(QUEUE_SUB_KEY);
    }

    return { subscribe, unsubscribe };
}
```

- [ ] **Step 2: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce-front
npx tsc --noEmit --strict
```

期望：无新增错误

- [ ] **Step 3: Commit**

```powershell
cd E:\springcloud_project\e-commerce-front
git add src/composables/useExpertQueueSocket.ts
git commit -m "refactor(front): useExpertQueueSocket 迁移至 expertStompClient 共享连接"
```

---

## Task 8: 前端 — useExpertPresenceSocket.ts（专家端全局连接管理）

**Files:**
- Create: `src/composables/useExpertPresenceSocket.ts`

- [ ] **Step 1: 创建 useExpertPresenceSocket.ts**

```typescript
import { activateExpertClient, deactivateExpertClient } from "./expertStompClient";

/**
 * 专家端全局 STOMP 连接管理。
 * 在 HeaderLayout.vue 的 onMounted/onUnmounted 调用，
 * 使专家登录后即上线、关闭页面即下线。
 */
export function useExpertPresenceSocket() {
    /** 激活共享 STOMP 连接（专家上线信号） */
    function connect(): void {
        activateExpertClient();
    }

    /** 停用共享 STOMP 连接（专家下线信号），并清理所有订阅 */
    function disconnect(): void {
        deactivateExpertClient();
    }

    return { connect, disconnect };
}
```

- [ ] **Step 2: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce-front
npx tsc --noEmit --strict
```

- [ ] **Step 3: Commit**

```powershell
cd E:\springcloud_project\e-commerce-front
git add src/composables/useExpertPresenceSocket.ts
git commit -m "feat(front): useExpertPresenceSocket 专家端全局连接管理"
```

---

## Task 9: 前端 — useExpertOnlineSocket.ts（用户端在线状态订阅）

**Files:**
- Create: `src/composables/useExpertOnlineSocket.ts`

- [ ] **Step 1: 创建 useExpertOnlineSocket.ts**

```typescript
import { Client, type IMessage } from "@stomp/stompjs";

/** 用户侧独立 STOMP 客户端（与专家端共享客户端互相独立，用户不是专家） */
let onlineStatusClient: Client | null = null;

/**
 * 用户侧专家在线状态实时订阅。
 * 订阅 /topic/expert.online.status，收到帧时回调通知调用方更新 UI。
 */
export function useExpertOnlineSocket() {
    /**
     * 建立连接并订阅在线状态广播。
     * @param onStatusChange  (expertId: number, online: boolean) => void
     */
    function subscribe(onStatusChange: (expertId: number, online: boolean) => void): void {
        if (onlineStatusClient) return; // 已订阅，幂等

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        onlineStatusClient = new Client({
            brokerURL: `${protocol}//${window.location.host}/ws/consult`,
            reconnectDelay: 5000,
            onConnect: () => {
                onlineStatusClient!.subscribe(
                    "/topic/expert.online.status",
                    (msg: IMessage) => {
                        try {
                            const frame = JSON.parse(msg.body);
                            if (
                                frame.event === "expert.online.status" &&
                                frame.data?.expertId != null
                            ) {
                                onStatusChange(
                                    Number(frame.data.expertId),
                                    Boolean(frame.data.online)
                                );
                            }
                        } catch {
                            // 忽略非 JSON 帧
                        }
                    }
                );
            },
            onStompError: (frame) => {
                console.error("[STOMP-OnlineStatus] 错误:", frame.headers["message"]);
            },
        });
        onlineStatusClient.activate();
    }

    /** 断开连接并销毁客户端（onUnmounted 时调用） */
    function unsubscribe(): void {
        onlineStatusClient?.deactivate();
        onlineStatusClient = null;
    }

    return { subscribe, unsubscribe };
}
```

- [ ] **Step 2: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce-front
npx tsc --noEmit --strict
```

- [ ] **Step 3: Commit**

```powershell
cd E:\springcloud_project\e-commerce-front
git add src/composables/useExpertOnlineSocket.ts
git commit -m "feat(front): useExpertOnlineSocket 用户端订阅专家在线状态广播"
```

---

## Task 10: 前端 — HeaderLayout.vue（专家全局连接）

**Files:**
- Modify: `src/layouts/HeaderLayout.vue`

- [ ] **Step 1: 更新 `<script setup>` 部分**

在现有 `<script setup lang="ts">` 的 import 区末尾添加：

```typescript
import { computed, onMounted, onUnmounted } from "vue";
import { useExpertPresenceSocket } from "@/composables/useExpertPresenceSocket";
```

**注意：** 原文件只导入了 `computed`（没有 `onMounted`/`onUnmounted`），需补全。

完整 `<script setup lang="ts">` 替换为：

```typescript
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";
import { useExpertPresenceSocket } from "@/composables/useExpertPresenceSocket";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const displayInitial = computed(() => {
    const name = userStore.G_LoginInfo.nickName || userStore.G_LoginInfo.account;
    return name ? name.charAt(0) : "我";
});

/** 当前登录用户是否为认证专家（role_id === 2） */
const isExpertView = computed(() => userStore.G_UserInfo.role_id === 2);

const { connect, disconnect } = useExpertPresenceSocket();

onMounted(() => {
    // 专家登录后全局建立 STOMP 连接，使在线状态对用户可见
    if (isExpertView.value && userStore.G_LoginInfo.id) {
        connect();
    }
});

onUnmounted(() => {
    // 页面卸载时断开连接（浏览器关闭时 beforeunload 也会触发 STOMP DISCONNECT）
    if (isExpertView.value) {
        disconnect();
    }
});

function goHome() {
    router.push("/");
}

function goToLogin() {
    router.push("/login");
}

async function handleCommand(command: string) {
    if (command === "settings") {
        router.push("/settings");
    } else if (command === "logout") {
        if (isExpertView.value) disconnect(); // 主动登出时断开连接
        await userStore.logout();
        ElMessage.success("已退出登录");
        router.push("/login");
    }
}
</script>
```

- [ ] **Step 2: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce-front
npx tsc --noEmit --strict
```

- [ ] **Step 3: Commit**

```powershell
cd E:\springcloud_project\e-commerce-front
git add src/layouts/HeaderLayout.vue
git commit -m "feat(front): HeaderLayout 专家登录后全局建立 STOMP 在线连接"
```

---

## Task 11: 前端 — consultation/index.vue（isOnline 字段 + 订阅 + 模板 + CSS）

**Files:**
- Modify: `src/pages/consultation/index.vue`

### Step 1: 更新 ExpertCardDTO interface

- [ ] 在 `consultation/index.vue` 的 `<script setup>` 中，找到：

```typescript
interface ExpertCardDTO {
    id: number; realName: string; avatar: string | null;
    roleType: string; bio: string | null;
}
```

替换为：

```typescript
interface ExpertCardDTO {
    id: number; realName: string; avatar: string | null;
    roleType: string; bio: string | null;
    isOnline: boolean;
}
```

### Step 2: 添加 useExpertOnlineSocket import 并订阅

- [ ] 在现有 import 区末尾添加：

```typescript
import { useExpertOnlineSocket } from "@/composables/useExpertOnlineSocket";
```

- [ ] 在 `onMounted` 处理中（现有的 `try { const [stRes, expRes] = await Promise.all(...)` 块之后），追加订阅代码。

找到：

```typescript
onMounted(async () => {
    try {
        const [stRes, expRes] = await Promise.all([
            ApiCircle.getSolarTerm(),
            ApiExpert.getRecommendExperts(),
        ]);
        if (stRes.data?.data) solarTerm.value = stRes.data.data;
        if (expRes.data?.data) expertList.value = expRes.data.data;
    } catch {
        // 接口异常时保持默认显示
    }
});
```

替换为：

```typescript
const { subscribe: subscribeOnline, unsubscribe: unsubscribeOnline } = useExpertOnlineSocket();

onMounted(async () => {
    try {
        const [stRes, expRes] = await Promise.all([
            ApiCircle.getSolarTerm(),
            ApiExpert.getRecommendExperts(),
        ]);
        if (stRes.data?.data) solarTerm.value = stRes.data.data;
        if (expRes.data?.data) expertList.value = expRes.data.data;
    } catch {
        // 接口异常时保持默认显示
    }

    // 用户侧订阅专家在线状态实时推送（非专家视图才需要）
    if (!isExpertView.value) {
        subscribeOnline((expertId, online) => {
            const idx = expertList.value.findIndex(e => e.id === expertId);
            if (idx !== -1) {
                expertList.value[idx] = { ...expertList.value[idx], isOnline: online };
            }
        });
    }
});
```

- [ ] 在现有 `onUnmounted` 处找到并追加（若无 onUnmounted 则新增）：

找到 `onUnmounted` 里现有的 disconnect 调用（专家侧的 STOMP 断开逻辑），在其旁边添加：

```typescript
onUnmounted(() => {
    consultSocket.disconnect();
    expertQueueSocket.unsubscribe();
    unsubscribeOnline(); // ← 新增：用户侧断开在线状态订阅
});
```

**注意：** 需确认现有 `onUnmounted` 的实际内容，只追加 `unsubscribeOnline()` 调用，不删除已有代码。

### Step 3: 更新专家卡片模板（推荐列表卡片，两处）

- [ ] **第一处：推荐专家列表卡片（约 `doc` 变量循环处）**

找到（两处 doctor-card 内的 doctor-consult-btn 前的按钮区域，其实是展开模态框内的卡片和主列表卡片，需要找在线标签位置）。

实际上，当前卡片没有在线标签，在线标签只在 **聊天头部**（`selectedExpert`）。需要在两个位置：

**位置 A：主页推荐专家卡片（doc 循环，约第 124 行附近）**  
在 `<div class="doctor-bio">` 之前插入在线状态标签：

```html
<!-- 在线状态（位置 A：主页推荐列表） -->
<div class="doctor-online-status">
    <span v-if="doc.isOnline" class="pill pill-jade">在线</span>
    <span v-else class="pill pill-gray">离线</span>
</div>
```

**位置 B：展开模态框卡片（filteredModalExperts 循环，约第 565 行附近）**  
同位置，`<div class="doctor-bio">` 之前：

```html
<!-- 在线状态（位置 B：模态框列表） -->
<div class="doctor-online-status">
    <span v-if="doc.isOnline" class="pill pill-jade">在线</span>
    <span v-else class="pill pill-gray">离线</span>
</div>
```

**位置 C：聊天头部（selectedExpert，约第 171 行）**

将：

```html
<h4>{{ selectedExpert.realName }} {{ roleLabel(selectedExpert.roleType) }} <span class="pill pill-jade">在线</span></h4>
```

替换为：

```html
<h4>
    {{ selectedExpert.realName }} {{ roleLabel(selectedExpert.roleType) }}
    <span :class="selectedExpert.isOnline ? 'pill pill-jade' : 'pill pill-gray'">
        {{ selectedExpert.isOnline ? '在线' : '离线' }}
    </span>
</h4>
```

### Step 4: 添加 .pill-gray CSS

- [ ] 在 `<style scoped lang="scss">` 中，找到 `.pill-jade` 规则：

```scss
.pill-jade { background: var(--jade-soft); color: var(--jade); }
```

在其后添加：

```scss
.pill-gray { background: var(--ink-soft, #e5e7eb); color: var(--ink-muted, #6b7280); }
```

- [ ] **Step 5: 编译验证**

```powershell
cd E:\springcloud_project\e-commerce-front
npx tsc --noEmit --strict
```

期望：无新增 TypeScript 错误

- [ ] **Step 6: Commit**

```powershell
cd E:\springcloud_project\e-commerce-front
git add src/pages/consultation/index.vue
git commit -m "feat(front): consultation 页面接入专家在线状态（isOnline 字段 + 实时订阅 + 模板）"
```

---

## 验收标准

1. **专家登录** → HeaderLayout 建立 STOMP 连接 → ec-consult 收到 `SessionConnectEvent` → `ExpertPresenceService.markOnline()` → 广播 `/topic/expert.online.status { online: true }`
2. **用户打开在线咨询** → `GET /experts/recommend` 返回 `isOnline: true` → 卡片显示绿色"在线"
3. **用户侧 STOMP 收到广播** → `expertList[i].isOnline` 实时更新 → 无需刷新页面
4. **专家关闭浏览器** → `SessionDisconnectEvent` 触发 → 广播 `online: false` → 用户侧卡片变为灰色"离线"
5. **ec-consult 重启** → 内存 Set 清空 → 专家重新打开 App 后恢复在线

---

## 自查 Checklist

- [x] **spec 覆盖：** 所有 spec 需求有对应 Task（架构/后端/前端/错误处理均覆盖）
- [x] **类型一致性：** `ExpertCardDTO.isOnline` (Boolean/boolean) 在所有 Task 中一致；`expertId` 类型为 `Long`/`number`
- [x] **方法名一致性：** `markOnline/markOffline/isOnline/getOnlineExpertIds` 在 Service + Test + Listener 中一致；`connect/disconnect` 在 Presence composable 中一致；`subscribe/unsubscribe` 在 Queue + Online composables 中一致
- [x] **无 TBD/TODO：** 所有步骤有完整代码
