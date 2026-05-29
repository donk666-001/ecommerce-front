import { GAxios } from "@/plugins";

export interface ReviewRequest {
    rating: number;
    tags?: string[];
    comment?: string;
}

/** 在线咨询 REST 网络层 */
export const ApiConsult = {
    /** 创建或获取咨询会话，返回 SessionVO + 历史消息 */
    createSession: (expertId: number) =>
        GAxios.post("/consult/sessions", { expertId }),

    /** 查询会话列表 */
    listSessions: (params?: { status?: string; page?: number; pageSize?: number }) =>
        GAxios.get("/consult/sessions", { params }),

    /** 历史消息分页（before 为游标消息 ID） */
    getMessages: (sessionId: number, before?: number, pageSize = 50) =>
        GAxios.get(`/consult/sessions/${sessionId}/messages`, {
            params: { before, pageSize },
        }),

    /** HTTP 降级发消息（WebSocket 不可用时） */
    sendMessage: (sessionId: number, content: string) =>
        GAxios.post(`/consult/sessions/${sessionId}/messages`, { content }),

    /** 转人工，触发 AI 生成预问诊小结 */
    transfer: (sessionId: number) =>
        GAxios.post(`/consult/sessions/${sessionId}/transfer`),

    /** 关闭会话 */
    close: (sessionId: number) =>
        GAxios.post(`/consult/sessions/${sessionId}/close`),

    /** 提交评价 */
    review: (sessionId: number, body: ReviewRequest) =>
        GAxios.post(`/consult/sessions/${sessionId}/review`, body),

    /** 专家接诊队列（status: HUMAN_PENDING | HUMAN_CHATTING） */
    listExpertSessions: (status: 'HUMAN_PENDING' | 'HUMAN_CHATTING', page = 1, pageSize = 20) =>
        GAxios.get('/consult/expert/sessions', { params: { status, page, pageSize } }),

    /** 专家发消息（首次发消息自动将状态 HUMAN_PENDING → HUMAN_CHATTING） */
    expertReply: (sessionId: number, content: string) =>
        GAxios.post(`/consult/expert/sessions/${sessionId}/reply`, { content }),
};
