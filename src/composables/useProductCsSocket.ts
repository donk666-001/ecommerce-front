import { Client, type IMessage } from "@stomp/stompjs";

/** 单例 STOMP 客户端，避免同一页面多次重复连接 */
let stompClient: Client | null = null;

/** 商品客服 STOMP 事件帧（服务端推送的消息结构） */
export interface ProductCsEvent {
    /** 事件类型："agent_joined" | "session_closed" | "new_message" */
    event?: string;
    /** 关联会话 ID */
    sessionId?: number;
    /** 客服姓名（agent_joined 事件携带） */
    agentName?: string;
    /** 发送方类型（new_message 事件携带） */
    senderType?: string;
    /** 消息正文（new_message 事件携带） */
    content?: string;
    /** 消息时间戳 */
    timestamp?: string;
    createdAt?: string;
    // 兼容旧消息格式字段
    id?: number;
    contentType?: string;
}

/** 商城用户侧商品客服 STOMP WebSocket 封装（单例模式） */
export function useProductCsSocket() {
    /**
     * 建立 WebSocket 连接并订阅指定会话的推送频道
     * @param sessionId 会话 ID
     * @param onMessage 收到服务端推送时的回调
     */
    function connect(sessionId: number, onMessage: (frame: ProductCsEvent) => void): void {
        // 建立新连接前先断开旧连接，防止重复订阅
        disconnect();

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const brokerURL = `${protocol}//${window.location.host}/ws/product-cs`;

        stompClient = new Client({
            brokerURL,
            // 断线后 5 秒自动重连
            reconnectDelay: 5000,
            onConnect: () => {
                // 订阅会话共享 topic（与 ec-consult 保持一致，simple broker 只支持 /topic 前缀）
                stompClient!.subscribe(
                    `/topic/product-cs/session/${sessionId}`,
                    (msg: IMessage) => {
                        try {
                            onMessage(JSON.parse(msg.body) as ProductCsEvent);
                        } catch {
                            // 忽略非 JSON 格式帧，不影响正常流程
                        }
                    },
                );
            },
            onStompError: (frame) => {
                console.error("[STOMP-ProductCS] STOMP 协议错误:", frame.headers["message"]);
            },
            onWebSocketError: (event) => {
                console.error("[STOMP-ProductCS] WebSocket 连接失败:", event);
            },
            onDisconnect: () => {
                console.warn("[STOMP-ProductCS] WebSocket 连接已断开");
            },
        });

        stompClient.activate();
    }

    /**
     * 通过 STOMP 向服务端发送消息
     * @param sessionId 会话 ID
     * @param content 消息内容
     * @returns 是否发送成功（false 表示连接未就绪，调用方可降级为 HTTP）
     */
    function send(sessionId: number, content: string): boolean {
        if (!stompClient?.connected) return false;
        stompClient.publish({
            destination: `/app/cs/${sessionId}/send`,
            body: JSON.stringify({ content }),
        });
        return true;
    }

    /** 断开 WebSocket 连接并清理单例 */
    function disconnect(): void {
        stompClient?.deactivate();
        stompClient = null;
    }

    return { connect, send, disconnect };
}
