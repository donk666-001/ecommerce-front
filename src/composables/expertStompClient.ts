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
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
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
