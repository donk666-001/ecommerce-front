import type { ApiResponse, PageResult } from "./common";
import { GAxios } from "@/plugins";

/** 商品视图对象 */
export interface ProductVO {
    id: number;
    name: string;
    image: string; // Base64编码的图片
    tags: string; // 逗号分隔的标签
    originalPrice: number;
    discountPrice: number;
    stock: number;
    soldCount: number;
    deliveryDescription: string;
    efficacy: string;
    description: string;
    categoryId: number;
    categoryName: string;
    status: number; // 1=上架, 0=下架, 2=售罄
    createdAt: string;
    updatedAt: string;
}

/** 商品类别视图对象 */
export interface CategoryVO {
    id: number;
    name: string;
    description: string;
    sortOrder: number;
    status: number; // 1=启用, 0=禁用
    createdAt: string;
    updatedAt: string;
}

/** 分页查询参数 */
export interface ProductQueryParams {
    page: number;
    size: number;
    categoryId?: number;
    status?: number;
    keyword?: string;
}

/** 创建/更新商品请求参数 */
export interface ProductCreateDTO {
    name: string;
    image?: string;
    tags?: string;
    originalPrice: number;
    discountPrice: number;
    stock: number;
    deliveryDescription?: string;
    efficacy?: string;
    description?: string;
    categoryId: number;
    status?: number;
}

/** 创建/更新类别请求参数 */
export interface CategoryCreateDTO {
    name: string;
    description?: string;
    sortOrder?: number;
    status?: number;
}

/** 购物车项视图对象（与后端 OpenAPI 完全匹配） */
export interface CartItemVO {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    subtotal: number; // 小计金额
    selected: number; // 是否选中：1=选中, 0=未选中（后端使用整数）
    status: number; // 状态：1=正常, 0=失效
    createdAt: string;
    updatedAt: string;
}

/** 购物车汇总响应（后端 GET /cart 返回的结构） */
export interface CartSummaryVO {
    items: CartItemVO[]; // 购物车项列表
    totalQuantity: number; // 选中商品总数
    totalPrice: number; // 选中商品总金额
    itemCount: number; // 购物车商品总数量（包含未选中）
}

/** 添加购物车请求参数 */
export interface AddCartDTO {
    productId: number;
    quantity: number;
}

/** 更新购物车请求参数 */
export interface UpdateCartDTO {
    quantity?: number;
    checked?: boolean;
}

/** 商品 API */
export const ApiProduct = {
    /** 分页查询商品列表 */
    listProducts: (params: ProductQueryParams) =>
        GAxios.get<ApiResponse<PageResult<ProductVO>>>("/products", { params }),

    /** 根据ID查询商品详情 */
    getProductById: (id: number) =>
        GAxios.get<ApiResponse<ProductVO>>(`/products/${id}`),

    /** 根据类别查询商品列表 */
    getProductsByCategory: (categoryId: number) =>
        GAxios.get<ApiResponse<ProductVO[]>>(
            `/products/category/${categoryId}`,
        ),

    /** 创建商品 */
    createProduct: (data: ProductCreateDTO) =>
        GAxios.post<ApiResponse<ProductVO>>("/products", data),

    /** 更新商品信息 */
    updateProduct: (id: number, data: ProductCreateDTO) =>
        GAxios.put<ApiResponse<ProductVO>>(`/products/${id}`, data),

    /** 删除商品 */
    deleteProduct: (id: number) =>
        GAxios.delete<ApiResponse<string>>(`/products/${id}`),

    /** 更新商品库存 */
    updateStock: (id: number, stock: number) =>
        GAxios.put<ApiResponse<string>>(`/products/${id}/stock`, null, {
            params: { stock },
        }),

    /** 更新商品销量 */
    updateSoldCount: (id: number, soldCount: number) =>
        GAxios.put<ApiResponse<string>>(`/products/${id}/sold-count`, null, {
            params: { soldCount },
        }),

    /** 分页查询商品类别列表 */
    listCategories: (page = 1, size = 10, status?: number) =>
        GAxios.get<ApiResponse<PageResult<CategoryVO>>>("/categories", {
            params: { page, size, status },
        }),

    /** 查询商品类别详情 */
    getCategoryById: (id: number) =>
        GAxios.get<ApiResponse<CategoryVO>>(`/categories/${id}`),

    /** 获取所有启用的商品类别 */
    getActiveCategories: () =>
        GAxios.get<ApiResponse<CategoryVO[]>>("/categories/active"),

    /** 创建商品类别 */
    createCategory: (data: CategoryCreateDTO) =>
        GAxios.post<ApiResponse<CategoryVO>>("/categories", data),

    /** 更新商品类别 */
    updateCategory: (id: number, data: CategoryCreateDTO) =>
        GAxios.put<ApiResponse<CategoryVO>>(`/categories/${id}`, data),

    /** 删除商品类别 */
    deleteCategory: (id: number) =>
        GAxios.delete<ApiResponse<string>>(`/categories/${id}`),

    // ========== 购物车相关 API ==========

    /** 获取购物车详情（包含汇总信息） */
    getCartDetail: () => GAxios.get<ApiResponse<CartSummaryVO>>("/cart"),

    /** 获取购物车项列表（仅 items 数组） */
    getCartList: () => GAxios.get<ApiResponse<CartItemVO[]>>("/cart/items"),

    /** 添加商品到购物车 */
    addToCart: (data: AddCartDTO) =>
        GAxios.post<ApiResponse<CartItemVO>>("/cart", data),

    /** 更新购物车项数量 */
    updateCartItemQuantity: (id: number, quantity: number) =>
        GAxios.put<ApiResponse<CartItemVO>>(`/cart/${id}/quantity`, {
            quantity,
        }),

    /** 选中/取消选中购物车项 */
    selectCartItem: (id: number, selected: number) =>
        GAxios.put<ApiResponse<string>>(`/cart/${id}/select`, null, {
            params: { selected },
        }),

    /** 全选/全不选购物车 */
    selectAllCartItems: (selected: number) =>
        GAxios.put<ApiResponse<string>>("/cart/select-all", null, {
            params: { selected },
        }),

    /** 删除购物车项 */
    removeCartItem: (id: number) =>
        GAxios.delete<ApiResponse<string>>(`/cart/${id}`),

    /** 批量删除购物车项 */
    batchRemoveCartItems: (ids: number[]) =>
        GAxios.delete<ApiResponse<string>>("/cart/batch", { params: { ids } }),

    /** 清空购物车 */
    clearCart: () => GAxios.delete<ApiResponse<string>>("/cart"),
};
