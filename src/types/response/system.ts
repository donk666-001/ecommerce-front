// 分类键
export interface ICategoryKey {
    id: number; // 分类id
    belong_id: number; // 分类所属上级分类id
    type: number; // 分类类型
    value: string; // 分类值
    description: string; // 分类描述
}

// 分类键值
export interface ICategoryKeyValue {
    id: number; // 分类键值id
    category_id: number; // 所属分类id
    category_self_id: number; // 自身的分类键id
    value: string; // 分类键值
    sort_id: number; // 分类键值排序id
    description: string; // 分类键值描述
}
