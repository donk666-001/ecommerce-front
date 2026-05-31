import type { ApiResponse, PageResult } from "./common";
import { GAxios } from "@/plugins";

/** 物流轨迹详情视图对象 */
export interface LogisticsDetailVO {
    id: number; // 轨迹ID
    time: string; // 时间点
    location: string; // 地点
    description: string; // 描述
    createdAt: string; // 创建时间
}

/** 物流视图对象 */
export interface LogisticsVO {
    id: number; // 物流ID
    orderId: number; // 订单ID
    trackingNo: string; // 物流单号
    logisticsCompany: string; // 物流公司
    status: number; // 物流状态：0=待发货, 1=已发货, 2=运输中, 3=已签收
    currentLocation: string; // 当前位置
    remark: string; // 备注
    operatorId: number; // 操作人ID
    details: LogisticsDetailVO[]; // 物流轨迹详情列表
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
}

/** 发货请求参数（管理员） */
export interface ShipOrderDTO {
    trackingNo: string; // 物流单号
    logisticsCompany: string; // 物流公司
    remark?: string; // 备注（可选）
}

/** 更新物流轨迹请求参数（管理员） */
export interface UpdateLogisticsDTO {
    status: number; // 物流状态：0=待发货, 1=已发货, 2=运输中, 3=已签收
    description: string; // 轨迹描述
    currentLocation?: string; // 当前位置（可选）
    time?: string; // 时间点（不填则使用当前时间，可选）
}

/** 物流 API（用户端 + 管理端） */
export const ApiLogistics = {
    // ========== 用户端接口 ==========

    /** 查询订单物流（用户） */
    getOrderLogistics: (orderId: number) =>
        GAxios.get<ApiResponse<LogisticsVO>>(`/logistics/order/${orderId}`),

    /** 确认收货（用户） */
    confirmReceipt: (orderId: number) =>
        GAxios.put<ApiResponse<string>>(`/logistics/order/${orderId}/receipt`),

    // ========== 管理端接口 ==========

    /** 发货（管理员） */
    shipOrder: (orderId: number, data: ShipOrderDTO) =>
        GAxios.post<ApiResponse<LogisticsVO>>(
            `/logistics/ship/${orderId}`,
            data,
        ),

    /** 更新物流轨迹（管理员） */
    updateLogistics: (logisticsId: number, data: UpdateLogisticsDTO) =>
        GAxios.put<ApiResponse<LogisticsVO>>(
            `/logistics/${logisticsId}/update`,
            data,
        ),

    /** 根据物流单号查询（管理员） */
    getLogisticsByTrackingNo: (trackingNo: string) =>
        GAxios.get<ApiResponse<LogisticsVO>>(
            `/logistics/tracking/${trackingNo}`,
        ),

    /** 分页查询物流列表（管理员） */
    listLogistics: (params?: {
        status?: number;
        trackingNo?: string;
        logisticsCompany?: string;
        page?: number;
        size?: number;
    }) =>
        GAxios.get<ApiResponse<PageResult<LogisticsVO>>>(
            "/logistics/admin/list",
            { params },
        ),
};
