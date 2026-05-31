import type { ApiResponse, PageResult } from "./common";
import { GAxios } from "@/plugins";

/** 订单项视图对象 */
export interface OrderItemVO {
    id: number; // 订单项ID
    productId: number; // 商品ID
    productName: string; // 商品名称
    productImage: string; // 商品图片
    price: number; // 商品单价
    quantity: number; // 购买数量
    subtotal: number; // 小计金额
}

/** 订单视图对象 */
export interface OrderVO {
    id: number; // 订单ID
    orderNo: string; // 订单号
    userId: number; // 用户ID
    totalAmount: number; // 订单总金额
    payAmount: number; // 实付金额
    freightAmount: number; // 运费
    discountAmount: number; // 优惠金额
    receiverName: string; // 收货人姓名
    receiverPhone: string; // 收货人电话
    receiverAddress: string; // 收货地址
    remark: string; // 订单备注
    status: number; // 订单状态：0=待付款, 1=已付款, 2=已发货, 3=已完成, 4=已取消, 5=退款中, 6=已退款
    paymentType: number; // 支付方式：1=微信支付, 2=支付宝, 3=银行卡
    paymentTime: string; // 支付时间
    deliveryTime: string; // 发货时间
    finishTime: string; // 完成时间
    cancelTime: string; // 取消时间
    cancelReason: string; // 取消原因
    trackingNo: string; // 物流单号
    logisticsCompany: string; // 物流公司
    items: OrderItemVO[]; // 订单项列表
    createdAt: string; // 创建时间
    updatedAt: string; // 更新时间
}

/** 分页查询订单参数 */
export interface OrderQueryParams {
    status?: number; // 订单状态筛选：0=待付款, 1=已付款, 2=已发货, 3=已完成, 4=已取消
    page?: number; // 页码，默认1
    size?: number; // 每页条数，默认10
}

/** 创建订单请求参数 */
export interface CreateOrderDTO {
    cartIds: number[]; // 购物车项ID列表
    receiverName: string; // 收货人姓名
    receiverPhone: string; // 收货人电话
    receiverAddress: string; // 收货地址
    remark?: string; // 订单备注（可选）
}

/** 订单 API */
export const ApiOrder = {
    /** 分页查询订单列表 */
    listOrders: (params: OrderQueryParams = {}) =>
        GAxios.get<ApiResponse<PageResult<OrderVO>>>("/orders", { params }),

    /** 查询订单详情 */
    getOrderById: (id: number) =>
        GAxios.get<ApiResponse<OrderVO>>(`/orders/${id}`),

    /** 根据订单号查询 */
    getOrderByNo: (orderNo: string) =>
        GAxios.get<ApiResponse<OrderVO>>(`/orders/no/${orderNo}`),

    /** 创建订单 */
    createOrder: (data: CreateOrderDTO) =>
        GAxios.post<ApiResponse<OrderVO>>("/orders", data),

    /** 取消订单 */
    cancelOrder: (id: number, reason?: string) =>
        GAxios.put<ApiResponse<string>>(`/orders/${id}/cancel`, null, {
            params: { reason },
        }),

    /** 确认收货 */
    confirmReceipt: (id: number) =>
        GAxios.put<ApiResponse<string>>(`/orders/${id}/confirm`),

    /** 模拟支付 */
    simulatePay: (id: number) =>
        GAxios.put<ApiResponse<string>>(`/orders/${id}/pay`),

    /** 删除订单 */
    deleteOrder: (id: number) =>
        GAxios.delete<ApiResponse<string>>(`/orders/${id}`),
};
