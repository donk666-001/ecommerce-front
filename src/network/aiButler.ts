import { GAxios } from "@/plugins";

export interface AiButlerSessionVO {
    sessionId: number;
    title: string;
    status: string;
    lastMessageAt: string;
    createdAt: string;
}

export interface AiButlerMessageVO {
    messageId: number;
    requestId?: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    contentType: string;
    status: string;
    content?: string;
    structuredJson?: string;
    createdAt: string;
}

export interface ChatStreamRequest {
    sessionId: number;
    requestId: string;
    message: string;
    context?: Record<string, string>;
}

export const ApiAiButler = {
    createSession: (title?: string) =>
        GAxios.post<AiButlerSessionVO>("/ai-butler/sessions", { title }),

    listSessions: (page = 1, pageSize = 20) =>
        GAxios.get<AiButlerSessionVO[]>("/ai-butler/sessions", {
            params: { page, pageSize },
        }),

    listMessages: (sessionId: number, before?: number, pageSize = 50) =>
        GAxios.get<AiButlerMessageVO[]>(
            `/ai-butler/sessions/${sessionId}/messages`,
            { params: { before, pageSize } },
        ),

    deleteSession: (sessionId: number) =>
        GAxios.delete(`/ai-butler/sessions/${sessionId}`),

    cancelGeneration: (requestId: string) =>
        GAxios.post(`/ai-butler/chat/stream/${requestId}/cancel`),
};
