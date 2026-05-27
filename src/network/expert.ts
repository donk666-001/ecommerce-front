import { GAxios, GAxiosWithCredentials } from "@/plugins";

/** 推荐专家卡片 */
export interface ExpertCardVO {
    id: number;
    realName: string;
    avatar: string;
    roleType: string;
    bio: string;
    lastActiveAt: string | null;
    isOnline: boolean;
}

/** 附件信息 */
export interface AttachmentInfo {
    docType: string;
    url: string;   // objectKey（展示时前端拼 MinIO baseUrl）
    fileName: string;
    size: number;
}

/** 用户端申请状态 VO */
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
}

/** 管理员端申请详情 VO */
export interface AdminApplicationVO extends MyApplicationVO {
    userId: number;
    phone: string | null;
}

/** 提交申请请求体 */
export interface SubmitApplicationRequest {
    roleType: string;
    realName: string;
    bio: string;
    attachments: { docType: string; objectKey: string; fileName: string; size: number }[];
}

/** 专家相关接口 */
export const ApiExpert = {
    /** 获取推荐专家列表，默认 12 条 */
    getRecommendExperts: (limit = 12) =>
        GAxios.get<ExpertCardVO[]>('/experts/recommend', { params: { limit } }),

    /** 上传认证附件，返回 objectKey */
    uploadAttachment: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return GAxiosWithCredentials.post<string>('/experts/apply/attachment', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /** 提交认证申请 */
    submitApplication: (req: SubmitApplicationRequest) =>
        GAxiosWithCredentials.post<MyApplicationVO>('/experts/apply', req),

    /** 查询我的申请状态（null = 未申请） */
    getMyApplication: () =>
        GAxiosWithCredentials.get<MyApplicationVO | null>('/experts/apply/my'),

    /** 撤回申请 */
    withdrawApplication: (appId: number) =>
        GAxiosWithCredentials.post<void>(`/experts/apply/${appId}/withdraw`),

    /** 管理员：分页列表 */
    adminListApplications: (status?: string, page = 1, size = 20) =>
        GAxiosWithCredentials.get('/experts/apply/admin/list', { params: { status, page, size } }),

    /** 管理员：申请详情 */
    adminGetApplication: (appId: number) =>
        GAxiosWithCredentials.get<AdminApplicationVO>(`/experts/apply/admin/${appId}`),

    /** 管理员：审核（APPROVE / REJECT） */
    adminReviewApplication: (appId: number, action: 'APPROVE' | 'REJECT',
                             rejectReason?: string, rejectSuggestion?: string) =>
        GAxiosWithCredentials.post<void>(`/experts/apply/admin/${appId}/review`,
            { action, rejectReason, rejectSuggestion }),
};
