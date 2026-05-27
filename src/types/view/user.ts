// 定义用户类型
interface ILoginInfo {
    id: number; // 用户ID
    isLogin: boolean; // 登录状态
    nickName: string; // 用户昵称
    account: string; // 账号
    email: string; // 邮箱
    status: number; // 状态(1正常,2封号)
}

// 用户信息
export interface IUserInfo {
    id: number; // 用户ID
    role_id: number; // 角色ID
    avatar: string; // 头像
    gender: number; // 性别：0-未知，1-男，2-女
    birthday: Date; // 生日
    introduction: string; // 简介
    location: string; // 位置
    email: string; // 邮箱
    qq: string; // QQ
    wechat: string; // 微信
    phone: string; // 手机
    create_time: Date; // 创建时间
    update_time: Date; // 更新时间
}
export type { ILoginInfo };
