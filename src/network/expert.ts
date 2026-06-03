import { GAxios, GAxiosWithCredentials } from "@/plugins";

function normalizeAssetUrl(url: string | null | undefined, baseURL?: string) {
    if (
        !url ||
        /^(https?:)?\/\//.test(url) ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
    ) {
        return url ?? "";
    }
    if (url.startsWith("/users/") && baseURL) {
        return `${baseURL.replace(/\/$/, "")}${url}`;
    }
    return url;
}

export interface ExpertCardVO {
    id: number;
    realName: string;
    realname?: string;
    real_name?: string;
    name?: string;
    nickName?: string;
    nickname?: string;
    avatar: string | null;
    roleType: string;
    bio: string;
    lastActiveAt: string | null;
    isOnline: boolean;
}

export interface ExpertBasicVO {
    id: number;
    userId: number;
    realName: string;
    realname?: string;
    real_name?: string;
    name?: string;
    nickName?: string;
    nickname?: string;
    avatar: string | null;
    roleType: string;
    status: string;
}

function firstText(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return "";
}

function normalizeExpertName<T extends Partial<ExpertCardVO | ExpertBasicVO>>(
    expert: T,
    fallback = "名医专家",
) {
    const name =
        firstText(
            expert.realName,
            expert.realname,
            expert.real_name,
            expert.name,
            expert.nickName,
            expert.nickname,
        ) || fallback;
    expert.realName = name;
    expert.realname = name;
    expert.name = name;
    return expert;
}

export interface AttachmentInfo {
    docType: string;
    url: string;
    fileName: string;
    size: number;
}

export interface MyApplicationVO {
    id: number;
    status:
        | "SUBMITTED"
        | "REVIEWING"
        | "APPROVED"
        | "REJECTED"
        | "WITHDRAWN"
        | "SIGNED"
        | "ACTIVATED";
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
    attachments: {
        docType: string;
        objectKey: string;
        fileName: string;
        size: number;
    }[];
}

export const ApiExpert = {
    async getRecommendExperts(limit = 12) {
        const response = await GAxios.get("/experts/recommend", {
            params: { limit },
        });
        const experts = response.data?.data;
        if (Array.isArray(experts)) {
            experts.forEach((expert: ExpertCardVO) => {
                normalizeExpertName(expert);
                expert.avatar = normalizeAssetUrl(
                    expert.avatar,
                    response.config.baseURL,
                );
                expert.roleType = expert.roleType || "DOCTOR";
                expert.bio = firstText(expert.bio, "暂无简介");
                expert.isOnline = Boolean(expert.isOnline);
            });
        }
        return response;
    },

    async getMyExpertProfile() {
        const response = await GAxiosWithCredentials.get("/experts/me");
        const expert = response.data?.data as ExpertBasicVO | null | undefined;
        if (expert) {
            normalizeExpertName(expert, "认证专家");
        }
        if (expert?.avatar) {
            expert.avatar = normalizeAssetUrl(
                expert.avatar,
                response.config.baseURL,
            );
        }
        return response;
    },

    uploadAttachment: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return GAxiosWithCredentials.post<string>(
            "/experts/apply/attachment",
            form,
        );
    },

    submitApplication: (req: SubmitApplicationRequest) =>
        GAxiosWithCredentials.post<MyApplicationVO>("/experts/apply", req),

    getMyApplication: () =>
        GAxiosWithCredentials.get<MyApplicationVO | null>("/experts/apply/my"),

    withdrawApplication: (appId: number) =>
        GAxiosWithCredentials.post<void>(`/experts/apply/${appId}/withdraw`),

    signContract: (appId: number) =>
        GAxiosWithCredentials.post<MyApplicationVO>(
            `/experts/apply/${appId}/sign`,
        ),

    adminGetStats: () =>
        GAxiosWithCredentials.get<{ total: number; todayNew: number }>(
            "/experts/apply/admin/stats",
        ),

    adminListApplications: (
        status?: string,
        page = 1,
        size = 20,
        keyword?: string,
        roleType?: string,
        orderBy?: string,
        date?: string,
    ) =>
        GAxiosWithCredentials.get("/experts/apply/admin/list", {
            params: { status, page, size, keyword, roleType, orderBy, date },
        }),

    adminGetApplication: (appId: number) =>
        GAxiosWithCredentials.get<AdminApplicationVO>(
            `/experts/apply/admin/${appId}`,
        ),

    adminReviewApplication: (
        appId: number,
        action: "APPROVE" | "REJECT",
        rejectReason?: string,
        rejectSuggestion?: string,
    ) =>
        GAxiosWithCredentials.post<void>(
            `/experts/apply/admin/${appId}/review`,
            {
                action,
                rejectReason,
                rejectSuggestion,
            },
        ),
};
