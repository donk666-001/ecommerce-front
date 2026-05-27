import { Client, type IMessage } from "@stomp/stompjs";

/** 专家个人通知频道 STOMP 客户端（单例）。
 * 与 useConsultSocket（会话级）相互独立，互不干扰。 */
let expertQueueClient: Client | null = null;

/**
 * 专家接诊队列实时更新 STOMP 连接封装。
 * 订阅 /topic/expert.user.{userId}，收到 consult.queue_updated 事件时执行回调。
 */
export function useExpertQueueSocket() {
    /**
     * 建立连接并订阅专家个人通知频道。
     * @param userId 当前登录用户的 userId（即专家账号的 userId）
     * @param onQueueUpdate 收到 consult.queue_updated 事件时的回调（通常是 loadExpertQueues）
     */
    function subscribe(userId: number, onQueueUpdate: () => void): void {
        unsubscribe(); // 防止重复连接

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const brokerURL = `${protocol}//${window.location.host}/ws/consult`;

        expertQueueClient = new Client({
            brokerURL,
            reconnectDelay: 5000,
            onConnect: () => {
                expertQueueClient!.subscribe(
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
                    },
                );
            },
            onStompError: (frame) => {
                console.error("[STOMP-Expert] 错误:", frame.headers["message"]);
            },
        });
        expertQueueClient.activate();
    }

    /** 断开连接并清理单例，切换 Tab 或组件卸载时调用 */
    function unsubscribe(): void {
        expertQueueClient?.deactivate();
        expertQueueClient = null;
    }

    return { subscribe, unsubscribe };
}
