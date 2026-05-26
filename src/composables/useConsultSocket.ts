import { Client, type IMessage } from "@stomp/stompjs";

let stompClient: Client | null = null;

/** STOMP WebSocket 连接封装（单例，切换专家时先 disconnect 再 connect） */
export function useConsultSocket() {
    function connect(sessionId: number, onMessage: (frame: any) => void): void {
        disconnect(); // 防止重复连接

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const brokerURL = `${protocol}//${window.location.host}/ws/consult`;

        stompClient = new Client({
            brokerURL,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient!.subscribe(
                    `/topic/session.${sessionId}`,
                    (msg: IMessage) => {
                        try {
                            onMessage(JSON.parse(msg.body));
                        } catch {
                            // 忽略非 JSON 帧
                        }
                    },
                );
            },
            onStompError: (frame) => {
                console.error("[STOMP] 错误:", frame.headers["message"]);
            },
        });
        stompClient.activate();
    }

    /** 发送消息，返回是否成功（STOMP 未连接时返回 false） */
    function send(sessionId: number, content: string): boolean {
        if (!stompClient?.connected) return false;
        stompClient.publish({
            destination: "/app/consult.send",
            body: JSON.stringify({ sessionId, content }),
        });
        return true;
    }

    function disconnect(): void {
        stompClient?.deactivate();
        stompClient = null;
    }

    return { connect, send, disconnect };
}
