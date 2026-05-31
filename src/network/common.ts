/** 统一API响应结构 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

/** 通用分页响应（MyBatis-Plus IPage 结构） */
export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    orders?: Array<{ column: string; asc: boolean }>;
    optimizeCountSql?: boolean;
    searchCount?: boolean;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
}
