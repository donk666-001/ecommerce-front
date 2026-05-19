// 文章首页版块树
export interface IHomeDocumentCategoryTree {
    id: number; // 版块id
    value: string; // 版块名称
    children?: IHomeDocumentCategoryTree[];
}
