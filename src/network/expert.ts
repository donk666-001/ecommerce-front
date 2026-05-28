import { GAxios, GAxiosWithCredentials } from "@/plugins";

export interface ExpertCardVO {
    id: number;
    realName: string;
    avatar: string;
    roleType: string;
    bio: string;
    lastActiveAt: string | null;
    isOnline: boolean;
}

export interface ExpertBasicVO {
    id: number;
    userId: number;
    realName: string;
    avatar: string | null;
    roleType: string;
    status: string;
}

export interface AttachmentInfo {
    docType: string;
    url: string;
    fileName: string;
    size: number;
}

export interface MyApplicationVO {
    id: number;
    status: 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'SIGNED' | 'ACTIVATED';
    roleType: string;
    realName: string;
    bio: string;
    attachments: AttachmentInfo[];
    rejectReason: string | null;
    rejectSuggestion: string | null;
    createdAt: string;
    reviewedAt: string | null;
    agreementVersion: string | null;
    signedAt: string | null;
    activatedAt: string | null;
}

export interface AdminApplicationVO extends MyApplicationVO {
    userId: number;
    phone: string | null;
    email: string | null;
}

export interface SubmitApplicationRequest {
    roleType: string;
    realName: string;
    bio: string;
    attachments: { docType: string; objectKey: string; fileName: string; size: number }[];
}

export const ApiExpert = {
    getRecommendExperts: (limit = 12) =>
        GAxios.get<ExpertCardVO[]>('/experts/recommend', { params: { limit } }),

    getMyExpertProfile: () =>
        GAxiosWithCredentials.get<ExpertBasicVO>('/experts/me'),

    uploadAttachment: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return GAxiosWithCredentials.post<string>('/experts/apply/attachment', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    submitApplication: (req: SubmitApplicationRequest) =>
        GAxiosWithCredentials.post<MyApplicationVO>('/experts/apply', req),

    getMyApplication: () =>
        GAxiosWithCredentials.get<MyApplicationVO | null>('/experts/apply/my'),

    withdrawApplication: (appId: number) =>
        GAxiosWithCredentials.post<void>(`/experts/apply/${appId}/withdraw`),

    signContract: (appId: number) =>
        GAxiosWithCredentials.post<MyApplicationVO>(`/experts/apply/${appId}/sign`),

    adminGetStats: () =>
        GAxiosWithCredentials.get<{ total: number; todayNew: number }>('/experts/apply/admin/stats'),

    adminListApplications: (
        status?: string,
        page = 1,
        size = 20,
        keyword?: string,
        roleType?: string,
        orderBy?: string,
        date?: string,
    ) =>
        GAxiosWithCredentials.get('/experts/apply/admin/list', {
            params: { status, page, size, keyword, roleType, orderBy, date },
        }),

    adminGetApplication: (appId: number) =>
        GAxiosWithCredentials.get<AdminApplicationVO>(`/experts/apply/admin/${appId}`),

    adminReviewApplication: (
        appId: number,
        action: 'APPROVE' | 'REJECT',
        rejectReason?: string,
        rejectSuggestion?: string,
    ) =>
        GAxiosWithCredentials.post<void>(`/experts/apply/admin/${appId}/review`, {
            action,
            rejectReason,
            rejectSuggestion,
        }),
};
