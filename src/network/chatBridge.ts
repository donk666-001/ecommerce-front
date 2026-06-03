import { reactive } from "vue";
import { customerWS } from "./customer.ws";

export interface BridgeMessage {
    from: "customer" | "agent";
    text: string;
    time: string;
}

export interface BridgeSession {
    id: string;
    custName: string;
    custId: string;
    agentId: string;
    source: string;
    firstMsg: string;
    messages: BridgeMessage[];
    status: "queued" | "active" | "ended";
    startedAt: string;
}

function nowTime(): string {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}

export const bridgeSessions = reactive<BridgeSession[]>([]);

// 商城侧：第一条消息进入排队
export function bridgeEnterQueue(
    custName: string,
    custId: string,
    agentId: string,
    firstMsg: string,
): BridgeSession {
    const existing = bridgeSessions.find(
        (s) =>
            s.custId === custId &&
            s.agentId === agentId &&
            s.status !== "ended",
    );
    if (existing) {
        bridgeCustomerSend(existing.id, firstMsg);
        return existing;
    }
    const session: BridgeSession = {
        id: `bridge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        custName,
        custId,
        agentId,
        source: "客服咨询",
        firstMsg,
        messages: [{ from: "customer", text: firstMsg, time: nowTime() }],
        status: "queued",
        startedAt: new Date().toISOString(),
    };
    bridgeSessions.push(session);
    return session;
}

// 商城侧：已有会话继续发消息，同时通知客服侧 WS
export function bridgeCustomerSend(sessionId: string, text: string): void {
    const s = bridgeSessions.find((s) => s.id === sessionId);
    if (!s || s.status === "ended") return;
    const msg: BridgeMessage = { from: "customer", text, time: nowTime() };
    s.messages.push(msg);
    // 触发客服端 handleWSMessage
    customerWS.simulateIncomingMessage({
        type: "new_message",
        sessionId,
        message: { from: "customer", text, time: msg.time },
    });
}

// 客服侧：从队列接入
export function bridgeAgentAccept(
    sessionId: string,
): BridgeSession | null {
    const s = bridgeSessions.find((s) => s.id === sessionId);
    if (!s || s.status !== "queued") return null;
    s.status = "active";
    return s;
}

// 客服侧：发送回复（商城端通过 watch 响应式感知）
export function bridgeAgentSend(sessionId: string, text: string): void {
    const s = bridgeSessions.find((s) => s.id === sessionId);
    if (!s || s.status === "ended") return;
    s.messages.push({ from: "agent", text, time: nowTime() });
}

// 任意侧：结束会话
export function bridgeEndSession(sessionId: string): void {
    const s = bridgeSessions.find((s) => s.id === sessionId);
    if (s) s.status = "ended";
}
