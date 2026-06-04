import { GAxios } from "@/plugins";
import type { ApiResponse } from "./common";

/** 客服人员信息（对应后端 AgentColleagueVO） */
export interface ProductCsAgent {
    id?: string;
    userId?: string;
    name: string;
    role: "presale" | "aftersale";
    status: "online" | "break" | "off";
    currentLoad: number;
    maxLoad: number;
    todayServed: number;
}

/** 会话详情（对应后端 ProductCsSessionVO） */
export interface ProductCsSessionVO {
    id: number;
    userId: number;
    productId: number;
    status: "WAITING" | "CHATTING" | "CLOSED";
    productName?: string;
    productImage?: string;
    lastMessageAt?: string;
    createdAt?: string;
    messages: ProductCsMessageVO[];
}

/** 消息 VO */
export interface ProductCsMessageVO {
    id: number;
    senderType: "user" | "customer_service" | "system";
    contentType: string;
    content: string;
    createdAt?: string;
}

/** 会话列表项（用于列表展示） */
export interface ProductCsSessionListItem {
    id: number;
    productId: number;
    productName?: string;
    productImage?: string;
    status: string;
    lastMessageAt?: string;
    createdAt?: string;
}

type RawRecord = Record<string, any>;

/** 将后端 status 字段转为前端枚举 */
function toStatus(v: unknown): ProductCsAgent["status"] {
    const s = String(v ?? "").toLowerCase();
    if (s === "online" || s === "break" || s === "off") return s;
    return "off";
}

/** 将后端 role 字段转为前端枚举 */
function toRole(v: unknown): ProductCsAgent["role"] {
    return String(v ?? "") === "aftersale" ? "aftersale" : "presale";
}

/** 将后端原始对象映射为 ProductCsAgent */
function mapAgent(raw: RawRecord): ProductCsAgent {
    return {
        id: raw.id !== undefined ? String(raw.id) : undefined,
        userId: raw.userId !== undefined ? String(raw.userId) : undefined,
        name: String(raw.name ?? ""),
        role: toRole(raw.role),
        status: toStatus(raw.status),
        currentLoad: Number(raw.currentLoad ?? 0),
        maxLoad: Number(raw.maxLoad ?? 5),
        todayServed: Number(raw.todayServed ?? 0),
    };
}

/** 将后端原始对象映射为 ProductCsMessageVO */
function mapMessageVO(raw: RawRecord): ProductCsMessageVO {
    return {
        id: Number(raw.id ?? 0),
        senderType: (raw.senderType ?? "user") as ProductCsMessageVO["senderType"],
        contentType: String(raw.contentType ?? "text"),
        content: String(raw.content ?? ""),
        createdAt: raw.createdAt,
    };
}

/** 将后端原始对象映射为 ProductCsSessionVO */
function mapSessionVO(raw: RawRecord): ProductCsSessionVO {
    return {
        id: Number(raw.id ?? 0),
        userId: Number(raw.userId ?? 0),
        productId: Number(raw.productId ?? 0),
        status: (raw.status ?? "WAITING") as ProductCsSessionVO["status"],
        productName: raw.productName,
        productImage: raw.productImage,
        lastMessageAt: raw.lastMessageAt,
        createdAt: raw.createdAt,
        messages: Array.isArray(raw.messages) ? raw.messages.map(mapMessageVO) : [],
    };
}

/** 商品客服 REST 接口集合 */
export const ApiProductCs = {
    /** 获取客服列表（含在线状态） */
    listAgents: async (): Promise<ProductCsAgent[]> => {
        const res = await GAxios.get<ApiResponse<RawRecord[]>>("/product/cs/agents");
        const data = res.data;
        if (data.code !== 200) throw new Error(data.message || "获取客服列表失败");
        return (data.data ?? []).map(mapAgent);
    },

    /** 创建或获取会话（同一用户+商品唯一） */
    createSession: async (productId: number): Promise<ProductCsSessionVO> => {
        const res = await GAxios.post<ApiResponse<RawRecord>>("/product/cs/sessions", { productId });
        const data = res.data;
        if (data.code !== 200) throw new Error(data.message || "创建会话失败");
        return mapSessionVO(data.data ?? {});
    },

    /** 查询当前用户的会话列表 */
    listSessions: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<ProductCsSessionListItem[]> => {
        const res = await GAxios.get<ApiResponse<RawRecord[]>>("/product/cs/sessions", { params });
        const data = res.data;
        if (data.code !== 200) throw new Error(data.message || "查询会话失败");
        return (data.data ?? []).map((raw) => ({
            id: Number(raw.id ?? 0),
            productId: Number(raw.productId ?? 0),
            productName: raw.productName,
            productImage: raw.productImage,
            status: String(raw.status ?? "WAITING"),
            lastMessageAt: raw.lastMessageAt,
            createdAt: raw.createdAt,
        }));
    },

    /** 查询历史消息（游标分页，before 为消息 id） */
    getMessages: async (sessionId: number, before?: number, pageSize = 50): Promise<ProductCsMessageVO[]> => {
        const res = await GAxios.get<ApiResponse<RawRecord[]>>(`/product/cs/sessions/${sessionId}/messages`, {
            params: { before, pageSize },
        });
        const data = res.data;
        if (data.code !== 200) throw new Error(data.message || "查询消息失败");
        return (data.data ?? []).map(mapMessageVO);
    },

    /** HTTP 降级发消息（STOMP 不可用时兜底） */
    sendMessage: async (sessionId: number, content: string): Promise<void> => {
        const res = await GAxios.post<ApiResponse<any>>(`/product/cs/sessions/${sessionId}/messages`, { content });
        if (res.data.code !== 200) throw new Error(res.data.message || "发送消息失败");
    },

    /** 关闭会话 */
    closeSession: async (sessionId: number): Promise<void> => {
        const res = await GAxios.post<ApiResponse<any>>(`/product/cs/sessions/${sessionId}/close`);
        if (res.data.code !== 200) throw new Error(res.data.message || "关闭会话失败");
    },
};
