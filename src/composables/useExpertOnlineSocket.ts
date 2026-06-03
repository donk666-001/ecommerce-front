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
    function subscribe(
        onStatusChange: (expertId: number, online: boolean) => void,
    ): void {
        if (onlineStatusClient) return; // 已订阅，幂等

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        onlineStatusClient = new Client({
            brokerURL: `${protocol}//${window.location.host}/ws/consult`,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
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
                                    Boolean(frame.data.online),
                                );
                            }
                        } catch {
                            // 忽略非 JSON 帧
                        }
                    },
                );
            },
            onStompError: (frame) => {
                console.error(
                    "[STOMP-OnlineStatus] 错误:",
                    frame.headers["message"],
                );
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
