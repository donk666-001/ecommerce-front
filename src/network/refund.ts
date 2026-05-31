import type { ApiResponse, PageResult } from "./common";
import { GAxios } from "@/plugins";

/** 退款视图对象 */
export interface RefundVO {
    id: number; // 退款ID
    refundNo: string; // 退款单号
    orderId: number; // 订单ID
    userId: number; // 用户ID
    refundType: number; // 退款类型：1=仅退款, 2=退货退款
    refundAmount: number; // 退款金额
    reason: string; // 退款原因
    description: string; // 退款说明
    status: number; // 退款状态：0=申请中, 1=审核通过, 2=退款中, 3=已完成, 4=已拒绝
    auditorId: number; // 审核人ID
    auditTime: string; // 审核时间
    auditRemark: string; // 审核备注
    completeTime: string; // 退款完成时间
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
}

/** 申请退款请求参数 */
export interface ApplyRefundDTO {
    refundType: number; // 退款类型：1=仅退款, 2=退货退款
    refundAmount: number; // 退款金额
    reason: string; // 退款原因
    description?: string; // 退款说明/凭证描述（可选）
}

/** 查询退款列表参数 */
export interface RefundQueryParams {
    status?: number; // 退款状态筛选
    page: number; // 页码
    size: number; // 每页条数
}

/** 审核退款请求参数 */
export interface AuditRefundDTO {
    approved: boolean; // 是否通过：true=通过, false=拒绝
    remark?: string; // 审核备注（可选）
}

/** 退款 API（用户端） */
export const ApiRefund = {
    /** 申请退款 */
    applyRefund: (orderId: number, data: ApplyRefundDTO) =>
        GAxios.post<ApiResponse<RefundVO>>(
            `/refunds/order/${orderId}/apply`,
            data,
        ),

    /** 查询退款详情 */
    getRefundById: (refundId: number) =>
        GAxios.get<ApiResponse<RefundVO>>(`/refunds/${refundId}`),

    /** 查询我的退款列表 */
    listMyRefunds: (params: RefundQueryParams) =>
        GAxios.get<ApiResponse<PageResult<RefundVO>>>("/refunds", { params }),
};

/** 退款 API（管理员端） */
export const ApiRefundAdmin = {
    /** 根据退款单号查询 */
    getRefundByNo: (refundNo: string) =>
        GAxios.get<ApiResponse<RefundVO>>(`/refunds/no/${refundNo}`),

    /** 查询所有退款列表（分页） */
    listAllRefunds: (params: RefundQueryParams) =>
        GAxios.get<ApiResponse<PageResult<RefundVO>>>("/refunds/all", {
            params,
        }),

    /** 审核退款 */
    auditRefund: (refundId: number, data: AuditRefundDTO) =>
        GAxios.put<ApiResponse<string>>(`/refunds/${refundId}/audit`, data),
};
