import { Client, type IMessage } from "@stomp/stompjs";

/** 客服工作台 STOMP 事件帧 */
export interface WorkbenchEvent {
    event?: string;       // "new_message" | "new_session"
    sessionId?: number;
    senderType?: string;  // "user"
    content?: string;
    timestamp?: string;
}

/** 单例 STOMP 客户端（工作台专用） */
let workbenchClient: Client | null = null;

/** 客服工作台 STOMP WebSocket 封装（单例，订阅工作台频道接收用户消息） */
export function useProductCsWorkbenchSocket() {
    /**
     * 连接并订阅工作台频道
     * @param agentUserId 客服的登录用户 ID（Long 转 number）
     * @param onEvent 工作台事件回调（接待中会话的实时消息）
     * @param onQueueEvent 排队事件回调（等待中会话的消息/通知）；不传则复用 onEvent
     */
    function connect(
        agentUserId: number,
        onEvent: (event: WorkbenchEvent) => void,
        onQueueEvent?: (event: WorkbenchEvent) => void,
    ): void {
        disconnect();

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const brokerURL = `${protocol}//${window.location.host}/ws/product-cs`;

        workbenchClient = new Client({
            brokerURL,
            reconnectDelay: 5000,
            onConnect: () => {
                // 订阅工作台频道：接收所有由该客服接待的会话（CHATTING 状态）的用户消息
                workbenchClient!.subscribe(
                    `/topic/product-cs/workbench/${agentUserId}`,
                    (msg: IMessage) => {
                        try {
                            onEvent(JSON.parse(msg.body) as WorkbenchEvent);
                        } catch {
                            // 忽略非 JSON 帧
                        }
                    },
                );
                // 订阅排队频道：接收等待中会话的新消息或新会话通知
                workbenchClient!.subscribe(
                    `/topic/product-cs/queue`,
                    (msg: IMessage) => {
                        try {
                            const data = JSON.parse(msg.body) as WorkbenchEvent;
                            const ev = { ...data, event: data.event || "new_session" };
                            // 有专用排队回调则走排队回调，否则保持原有行为
                            (onQueueEvent ?? onEvent)(ev);
                        } catch {
                            // 忽略非 JSON 帧
                        }
                    },
                );
            },
            onStompError: (frame) => {
                console.error("[STOMP-Workbench] STOMP 错误:", frame.headers["message"]);
            },
            onWebSocketError: (event) => {
                console.error("[STOMP-Workbench] WebSocket 连接失败:", event);
            },
            onDisconnect: () => {
                console.warn("[STOMP-Workbench] WebSocket 连接已断开");
            },
        });
        workbenchClient.activate();
    }

    /** 断开连接并清理单例 */
    function disconnect(): void {
        workbenchClient?.deactivate();
        workbenchClient = null;
    }

    return { connect, disconnect };
}
