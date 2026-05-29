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
        client = new Client({
            brokerURL: `${protocol}//${window.location.host}/ws/notifications`,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
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
