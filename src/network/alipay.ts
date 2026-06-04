import type { ApiResponse } from "./common";
import { GAxios } from "@/plugins";

export interface AlipayCreateOrderDTO {
    businessOrderNo: string;
    outTradeNo: string;
    subject: string;
    totalAmountFen: number;
    body?: string;
    qrPay?: boolean;
}

export interface AlipayCreateOrderVO {
    outTradeNo: string;
    orderStr?: string;
    payUrl?: string;
    qrCode?: string;
}

export interface AlipayRefundDTO {
    outTradeNo: string;
    refundRequestNo: string;
    refundAmountFen: number;
    reason?: string;
}

export interface AlipayRefundVO {
    outTradeNo: string;
    refundRequestNo: string;
    refundAmountFen: number;
    success: boolean;
    rawResult?: string;
}

export const ApiAlipay = {
    createOrder: (data: AlipayCreateOrderDTO) =>
        GAxios.post<ApiResponse<AlipayCreateOrderVO>>(
            "/alipay/create-order",
            data,
        ),

    toSuccess: (outTradeNo: string) =>
        GAxios.get<ApiResponse<string>>("/alipay/toSuccess", {
            params: { out_trade_no: outTradeNo },
        }),

    refund: (data: AlipayRefundDTO) =>
        GAxios.post<ApiResponse<AlipayRefundVO>>("/alipay/refund", data),
};
