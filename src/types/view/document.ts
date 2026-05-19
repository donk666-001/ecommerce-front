// 文档信息
export interface IViewDocumentInfo {
    id: number; // 文档id
    belong_id: number; // 所属文档系列id
    belong_share_id: number; // 所属共享文档id
    type: number; // 文档类型:1:共享文档,2:方言文档
    author_id: number; // 文档作者id
    author_name: string; // 文档作者名称
    level: number; // 文档等级
    sort: number; // 文档排序
    title: string; // 文档标题
    summary: string; // 文档摘要
    content?: string; // 文档内容
    tags: string; // 文档标签
    create_time: string; // 文档创建时间
    update_time: string; // 文档更新时间
}

// 文档信息
export interface IReqDocumentInfoSimplify {
    id: number; // 文档id
    belong_id: number; // 所属文档系列id
    belong_share_id: number; // 所属共享文档id
    type: number; // 文档类型:1:共享文档,2:方言文档
    author_id: number; // 文档作者id
    author_name: string; // 文档作者名称
    level: number; // 文档等级
    sort: number; // 文档排序
    title: string; // 文档标题
    summary: string; // 文档摘要
    tags: string; // 文档标签
    create_time: string; // 文档创建时间
    update_time: string; // 文档更新时间
}

// 新增文档信息
export interface IAddDocumentInfo {
    id?: number; // 文档id
    belong_id: number; // 所属文档系列id
    belong_share_id: number; // 所属共享文档id
    type: number; // 文档类型:1:共享文档,2:方言文档
    author_id: number; // 文档作者id
    author_name: string; // 文档作者名称
    level: number; // 文档等级
    sort: number; // 文档排序
    title: string; // 文档标题
    summary: string; // 文档摘要
    tags: string; // 文档标签
}
