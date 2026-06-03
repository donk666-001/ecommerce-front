import {
    addExpertSubscription,
    removeExpertSubscription,
} from "./expertStompClient";
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
            },
        );
    }

    /** 取消接诊队列订阅（不断开共享连接） */
    function unsubscribe(): void {
        removeExpertSubscription(QUEUE_SUB_KEY);
    }

    return { subscribe, unsubscribe };
}
