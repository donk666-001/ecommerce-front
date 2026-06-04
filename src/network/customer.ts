import type { ApiResponse } from "./common";
import { GAxios } from "@/plugins";

// 客服会话类型
export interface CustomerSession {
    id: string;
    custId: string;
    custName: string;
    avatar: string;
    source: string;
    sourceTag: "product" | "order" | "general";
    startedAt: string;
    unread: number;
    lastMsg: string;
    custTags: string[];
    custCity: string;
    custReg: string;
    custSpent: string;
    custOrderCount: number;
    custCart: Array<{ name: string; icon: string; qty: number; price: number }>;
    cartTotal: number;
    messages: CustomerMessage[];
}

// 客服消息类型
export interface CustomerMessage {
    from: "sys" | "customer" | "me";
    text: string;
    time: string;
    type?: "product" | "order" | "image";
    meta?: {
        icon?: string;
        desc?: string;
        price?: number;
        status?: string;
        amount?: number;
        imageUrl?: string;
        orderId?: string;
        productId?: string;
    };
}

// 排队客户类型
export interface QueuedCustomer {
    sessionId?: number;
    queueNum: number;
    custName: string;
    source: string;
    sourceTag: "product" | "order";
    firstMsg: string;
    startedAt: string;
    roleType: "presale" | "aftersale";
}

// 历史会话类型
export interface HistorySession {
    id: string;
    custId: string;
    custName: string;
    agentId: string;
    agentName: string;
    msgCount: number;
    startTime: string;
    endTime: string;
    endReason: "manual" | "timeout";
}

// 转接排队客户类型
export interface TransferredCustomer {
    queueNum: number;
    custName: string;
    source: string;
    sourceTag: "product" | "order" | "general";
    firstMsg: string;
    startedAt: string;
    fromAgent: string;
    history: CustomerMessage[];
}

// 客服统计数据
export interface CustomerStats {
    currentSessions: number;
    maxSessions: number;
    queueCount: number;
    todayServed: number;
    todayMessages: number;
    avgFirstResponse: number;
}

// 客服同事信息
export interface AgentColleague {
    id?: string;
    userId?: string;
    name: string;
    role: "presale" | "aftersale";
    status: "online" | "break" | "off";
    currentLoad: number;
    maxLoad: number;
    todayServed: number;
}

export interface CustomerProductSearchItem {
    id: string;
    name: string;
    icon: string;
    price: number;
    desc: string;
}

export interface CustomerOrderSearchItem {
    id: string;
    productName: string;
    custName: string;
    amount: number;
    status: string;
    date: string;
}

type RawRecord = Record<string, any>;
type HistoryResponse = { records?: RawRecord[]; total?: number };

const WORKBENCH_BASE = "/customer/workbench";

function unwrap<T>(response: ApiResponse<T>): T {
    if (response.code === 200) return response.data;
    throw new Error(response.message || "客服接口请求失败");
}

function asArray(value: unknown): RawRecord[] {
    return Array.isArray(value) ? (value as RawRecord[]) : [];
}

function toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toSourceTag(value: unknown): "product" | "order" | "general" {
    return value === "product" || value === "order" ? value : "general";
}

function toQueueSourceTag(value: unknown): "product" | "order" {
    return value === "order" ? "order" : "product";
}

function toRole(value: unknown): "presale" | "aftersale" {
    const normalized = String(value ?? "").toLowerCase();
    return normalized === "aftersale" ? "aftersale" : "presale";
}

function toStatus(value: unknown): "online" | "break" | "off" {
    const normalized = String(value ?? "").toLowerCase();
    if (
        normalized === "online" ||
        normalized === "break" ||
        normalized === "off"
    ) {
        return normalized;
    }
    return "off";
}

function toMessageFrom(value: unknown): "sys" | "customer" | "me" {
    if (value === "customer" || value === "me") return value;
    return "sys";
}

function toMessageType(value: unknown): "product" | "order" | "image" | undefined {
    if (value === "product" || value === "order" || value === "image") {
        return value;
    }
    return undefined;
}

function nowTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function startedAtFromWait(waitTime: unknown): string {
    if (typeof waitTime !== "string") return new Date().toISOString();
    const [minutes = "0", seconds = "0"] = waitTime.split(":");
    const elapsed =
        toNumber(minutes) * 60 * 1000 + toNumber(seconds) * 1000;
    return new Date(Date.now() - elapsed).toISOString();
}

function mapMessage(raw: RawRecord): CustomerMessage {
    const meta = raw.meta && typeof raw.meta === "object" ? raw.meta : undefined;
    const message: CustomerMessage = {
        from: toMessageFrom(raw.from),
        text: String(raw.text ?? raw.content ?? ""),
        time: String(raw.time ?? ""),
    };
    const type = toMessageType(raw.type);
    if (type) message.type = type;
    if (meta) message.meta = meta;
    return message;
}

function mapSession(raw: RawRecord): CustomerSession {
    const custName = String(raw.custName ?? raw.customerName ?? "访客");
    const startedAt = raw.startedAt
        ? String(raw.startedAt)
        : new Date().toISOString();

    return {
        id: String(raw.id ?? raw.sessionId ?? ""),
        custId: String(raw.custId ?? raw.customerId ?? ""),
        custName,
        avatar: String(raw.avatar ?? custName.slice(-1) ?? "客"),
        source: String(raw.source ?? "客服咨询"),
        sourceTag: toSourceTag(raw.sourceTag),
        startedAt,
        unread: toNumber(raw.unread),
        lastMsg: String(raw.lastMsg ?? raw.lastMessage ?? ""),
        custTags: Array.isArray(raw.custTags) ? raw.custTags.map(String) : [],
        custCity: String(raw.custCity ?? ""),
        custReg: String(raw.custReg ?? ""),
        custSpent: String(raw.custSpent ?? "¥0"),
        custOrderCount: toNumber(raw.custOrderCount),
        custCart: asArray(raw.custCart).map((item) => ({
            name: String(item.name ?? ""),
            icon: String(item.icon ?? ""),
            qty: toNumber(item.qty),
            price: toNumber(item.price),
        })),
        cartTotal: toNumber(raw.cartTotal),
        messages: asArray(raw.messages).map(mapMessage),
    };
}

function mapQueuedCustomer(raw: RawRecord): QueuedCustomer {
    return {
        sessionId: raw.sessionId !== undefined ? toNumber(raw.sessionId) : undefined,
        queueNum: toNumber(raw.queueNum),
        custName: String(raw.custName ?? "访客"),
        source: String(raw.source ?? "客服咨询"),
        sourceTag: toQueueSourceTag(raw.sourceTag),
        firstMsg: String(raw.firstMsg ?? ""),
        startedAt: raw.startedAt
            ? String(raw.startedAt)
            : startedAtFromWait(raw.waitTime),
        roleType: toRole(raw.roleType),
    };
}

function mapHistory(raw: RawRecord): HistorySession {
    return {
        id: String(raw.id ?? raw.sessionId ?? ""),
        custId: String(raw.custId ?? raw.customerId ?? "-"),
        custName: String(raw.custName ?? "访客"),
        agentId: String(raw.agentId ?? "-"),
        agentName: String(raw.agentName ?? "-"),
        msgCount: toNumber(raw.msgCount),
        startTime: String(raw.startTime ?? ""),
        endTime: String(raw.endTime ?? raw.duration ?? ""),
        endReason: raw.endReason === "timeout" ? "timeout" : "manual",
    };
}

function mapStats(raw: RawRecord): CustomerStats {
    return {
        currentSessions: toNumber(raw.currentSessions),
        maxSessions: toNumber(raw.maxSessions),
        queueCount: toNumber(raw.queueCount),
        todayServed: toNumber(raw.todayServed),
        todayMessages: toNumber(raw.todayMessages),
        avgFirstResponse: toNumber(raw.avgFirstResponse),
    };
}

function mapColleague(raw: RawRecord): AgentColleague {
    return {
        id: raw.id !== undefined ? String(raw.id) : undefined,
        userId: raw.userId !== undefined ? String(raw.userId) : undefined,
        name: String(raw.name ?? ""),
        role: toRole(raw.role),
        status: toStatus(raw.status),
        currentLoad: toNumber(raw.currentLoad),
        maxLoad: toNumber(raw.maxLoad),
        todayServed: toNumber(raw.todayServed),
    };
}

function mapProduct(raw: RawRecord): CustomerProductSearchItem {
    return {
        id: String(raw.id ?? raw.productId ?? ""),
        name: String(raw.name ?? raw.productName ?? ""),
        icon: String(raw.icon ?? ""),
        price: toNumber(raw.price ?? raw.discountPrice),
        desc: String(raw.desc ?? raw.description ?? raw.efficacy ?? ""),
    };
}

function mapOrder(raw: RawRecord): CustomerOrderSearchItem {
    return {
        id: String(raw.id ?? raw.orderNo ?? ""),
        productName: String(raw.productName ?? raw.name ?? ""),
        custName: String(raw.custName ?? raw.receiverName ?? ""),
        amount: toNumber(raw.amount ?? raw.payAmount ?? raw.totalAmount),
        status: String(raw.statusText ?? raw.status ?? ""),
        date: String(raw.date ?? raw.createdAt ?? ""),
    };
}

function buildSessionFromQueue(item: QueuedCustomer): CustomerSession {
    const time = nowTime();
    return {
        id: `queue_${item.queueNum}`,
        custId: `queue_${item.queueNum}`,
        custName: item.custName,
        avatar: item.custName.slice(-1),
        source: item.source,
        sourceTag: item.sourceTag,
        startedAt: new Date().toISOString(),
        unread: 1,
        lastMsg: item.firstMsg,
        custTags: [],
        custCity: "",
        custReg: "",
        custSpent: "¥0",
        custOrderCount: 0,
        custCart: [],
        cartTotal: 0,
        messages: [
            { from: "sys", text: `会话开始 · ${time}`, time: "" },
            { from: "customer", text: item.firstMsg, time },
        ],
    };
}

export class ApiCustomer {
    static async getSessions() {
        const response = await GAxios.get<ApiResponse<RawRecord[]>>(
            `${WORKBENCH_BASE}/sessions`,
        );
        return unwrap(response.data).map(mapSession);
    }

    static async getSessionDetail(sessionId: string) {
        const response = await GAxios.get<ApiResponse<RawRecord>>(
            `${WORKBENCH_BASE}/sessions/${sessionId}`,
        );
        const data = unwrap(response.data);
        return data ? mapSession(data) : null;
    }

    static async sendMessage(sessionId: string, message: string) {
        const response = await GAxios.post<ApiResponse<boolean>>(
            `${WORKBENCH_BASE}/sessions/${sessionId}/messages`,
            { text: message },
        );
        return unwrap(response.data) === true;
    }

    static async endSession(sessionId: string) {
        const response = await GAxios.post<ApiResponse<boolean>>(
            `${WORKBENCH_BASE}/sessions/${sessionId}/end`,
        );
        return unwrap(response.data) === true;
    }

    static async transferSession(
        sessionId: string,
        targetAgentId: string,
        note: string,
    ) {
        const numericTargetAgentId = Number(targetAgentId);
        const response = await GAxios.post<ApiResponse<boolean>>(
            `${WORKBENCH_BASE}/sessions/${sessionId}/transfer`,
            {
                targetAgentId: Number.isFinite(numericTargetAgentId)
                    ? numericTargetAgentId
                    : targetAgentId,
                note,
            },
        );
        return unwrap(response.data) === true;
    }

    static async getQueueList() {
        const response = await GAxios.get<ApiResponse<RawRecord[]>>(
            `${WORKBENCH_BASE}/queue`,
        );
        return unwrap(response.data).map(mapQueuedCustomer);
    }

    static async acceptFromQueue(
        queueNum: number,
    ): Promise<CustomerSession | null> {
        const queue = await this.getQueueList();
        const item = queue.find((q) => q.queueNum === queueNum);
        const response = await GAxios.post<ApiResponse<boolean | RawRecord>>(
            `${WORKBENCH_BASE}/queue/accept`,
            { queueNum },
        );
        const data = unwrap(response.data);

        if (data && typeof data === "object") {
            return mapSession(data);
        }

        return data === true && item ? buildSessionFromQueue(item) : null;
    }

    /**
     * 按会话 ID 接入排队会话（真实会话接入入口）
     * @param sessionId 排队会话 ID
     * @returns 接入后的会话对象，失败返回 null
     */
    static async acceptSession(sessionId: number): Promise<CustomerSession | null> {
        const response = await GAxios.post<ApiResponse<boolean | RawRecord>>(
            `${WORKBENCH_BASE}/sessions/${sessionId}/accept`,
        );
        const data = unwrap(response.data);
        if (data && typeof data === "object") {
            return mapSession(data);
        }
        if (data === true) {
            // 后端返回 true 时，加载会话详情以获取用户发送的历史消息
            try {
                const detail = await this.getSessionDetail(String(sessionId));
                if (detail) {
                    // 在历史消息前插入"接入"系统提示
                    return {
                        ...detail,
                        messages: [
                            { from: "sys", text: `会话已接入 · ${nowTime()}`, time: "" },
                            ...detail.messages,
                        ],
                    };
                }
            } catch {
                // 加载详情失败则降级为最小化会话对象
            }
            return {
                id: String(sessionId),
                custId: String(sessionId),
                custName: "客户",
                avatar: "客",
                source: "商品咨询",
                sourceTag: "product",
                startedAt: new Date().toISOString(),
                unread: 0,
                lastMsg: "",
                custTags: [],
                custCity: "",
                custReg: "",
                custSpent: "¥0",
                custOrderCount: 0,
                custCart: [],
                cartTotal: 0,
                messages: [{ from: "sys", text: `会话已接入 · ${nowTime()}`, time: "" }],
            };
        }
        return null;
    }

    static async getHistorySessions(
        page: number,
        pageSize: number,
        filters?: {
            keyword?: string;
            startDate?: string;
            endDate?: string;
        },
    ) {
        const response = await GAxios.get<ApiResponse<HistoryResponse>>(
            `${WORKBENCH_BASE}/history`,
            {
                params: {
                    page,
                    pageSize,
                    custName: filters?.keyword,
                    startDate: filters?.startDate,
                    endDate: filters?.endDate,
                },
            },
        );
        const data = unwrap(response.data);
        const records = asArray(data?.records).map(mapHistory);
        return {
            records,
            total: toNumber(data?.total, records.length),
        };
    }

    static async getStats() {
        const response = await GAxios.get<ApiResponse<RawRecord>>(
            `${WORKBENCH_BASE}/stats`,
        );
        return mapStats(unwrap(response.data));
    }

    static async getColleagues() {
        const response = await GAxios.get<ApiResponse<RawRecord[]>>(
            `${WORKBENCH_BASE}/colleagues`,
        );
        return unwrap(response.data).map(mapColleague);
    }

    static async getProductCsAgents() {
        const response = await GAxios.get<ApiResponse<RawRecord[]>>(
            "/product/cs/agents",
        );
        return unwrap(response.data).map(mapColleague);
    }

    static async updateStatus(status: "online" | "break" | "off") {
        const response = await GAxios.post<ApiResponse<boolean>>(
            `${WORKBENCH_BASE}/status`,
            { status },
        );
        return unwrap(response.data) === true;
    }

    static async getTransferQueue(): Promise<TransferredCustomer[]> {
        return [];
    }

    static async acceptTransfer(
        queueNum: number,
    ): Promise<CustomerSession | null> {
        const transfers = await this.getTransferQueue();
        const transfer = transfers.find((t) => t.queueNum === queueNum);
        if (!transfer) return null;

        const lastCustomerMsg = [...transfer.history]
            .reverse()
            .find((m) => m.from === "customer");

        return {
            id: `transfer_${queueNum}_${Date.now()}`,
            custId: `cust_transfer_${queueNum}`,
            custName: transfer.custName,
            avatar: transfer.custName.slice(-1),
            source: transfer.source,
            sourceTag: transfer.sourceTag,
            startedAt: transfer.startedAt,
            unread: transfer.history.filter((m) => m.from === "customer")
                .length,
            lastMsg: lastCustomerMsg?.text || transfer.firstMsg,
            custTags: [],
            custCity: "",
            custReg: "",
            custSpent: "¥0",
            custOrderCount: 0,
            custCart: [],
            cartTotal: 0,
            messages: [
                {
                    from: "sys",
                    text: `由 ${transfer.fromAgent} 转接 · 以下为历史记录`,
                    time: "",
                },
                ...transfer.history,
                {
                    from: "sys",
                    text: "—— 历史记录结束，以下由您接待 ——",
                    time: "",
                },
            ],
        };
    }

    static async searchProducts(keyword: string) {
        const response = await GAxios.get<ApiResponse<RawRecord[]>>(
            `${WORKBENCH_BASE}/products/search`,
            { params: { keyword } },
        );
        return unwrap(response.data).map(mapProduct);
    }

    static async searchOrders(keyword: string) {
        const response = await GAxios.get<ApiResponse<RawRecord[]>>(
            `${WORKBENCH_BASE}/orders/search`,
            { params: { keyword } },
        );
        return unwrap(response.data).map(mapOrder);
    }
}
