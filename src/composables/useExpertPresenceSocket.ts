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
