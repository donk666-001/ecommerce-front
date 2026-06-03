import type { NotificationVO } from "@/network";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

let client: Client | null = null;
let subscription: StompSubscription | null = null;
let currentUserId: number | null = null;

export function useNotificationSocket() {
    function connect(
        userId: number,
        onNotification: (notification: NotificationVO) => void,
    ): void {
        if (client?.active && currentUserId === userId) return;
        disconnect();

        currentUserId = userId;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        let retryCount = 0;
        client = new Client({
            brokerURL: `${protocol}//${window.location.host}/ws/notifications`,
            // 后端未就绪时指数退避，最多重试 5 次，避免持续触发 Vite WS 代理错误
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onWebSocketError: () => {
                retryCount++;
                if (retryCount >= 5) {
                    console.warn("[STOMP-Notification] 连接失败次数过多，已停止重连，请确认通知服务已启动");
                    client?.deactivate();
                }
            },
            onConnect: () => {
                retryCount = 0;
                subscription = client!.subscribe(
                    `/topic/notifications.user.${userId}`,
                    (msg: IMessage) => {
                        try {
                            const frame = JSON.parse(msg.body);
                            if (
                                frame.event === "notification.new" &&
                                frame.data
                            ) {
                                onNotification(frame.data as NotificationVO);
                            }
                        } catch {
                            // 忽略非 JSON 帧
                        }
                    },
                );
            },
            onStompError: (frame) => {
                console.error(
                    "[STOMP-Notification] 错误:",
                    frame.headers["message"],
                );
            },
        });
        client.activate();
    }

    function disconnect(): void {
        subscription?.unsubscribe();
        subscription = null;
        client?.deactivate();
        client = null;
        currentUserId = null;
    }

    return { connect, disconnect };
}
