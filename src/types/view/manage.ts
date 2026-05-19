// 左侧菜单列表(带路由跳转)
export interface IManageMenuItem {
    id?: number; // 菜单id
    name: string; // 菜单名称
    path?: string; // 路由路径
    icon?: string; // 图标名
    expand?: boolean; // 展开状态
    children?: IManageMenuItem[];
}
