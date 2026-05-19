// 新增键值
export interface IFormAddKeyValue {
    value: string; // 键名
    sort_id: number; // 排序ID
    description: string; // 描述
}

// 编辑键值
export interface IFormEditKeyValue {
    id: number; //  ID
    category_id: number; // 所属分类ID
    category_self_id: number | undefined; // 自身分类ID
    value: string; // 键名
    sort_id: number; // 排序ID
    description: string; // 描述
}

// 新增键
export interface IFormAddKey {
    belong_id: number; // 所属分类ID
    type: number; //  类型
    value: string; // 键名
    description: string; // 描述
}

// 编辑键
export interface IFormEditKey {
    id: number; //  ID
    belong_id: number; // 所属分类ID
    type: number; //  类型
    value: string; // 键名
    description: string; // 描述
}
