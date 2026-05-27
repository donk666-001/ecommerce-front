import { GAxiosWithCredentials } from "@/plugins";

/** 管理员用户列表项 */
export interface UserAdminVO {
  userId: number;
  displayId: string;
  username: string;
  nickname: string;
  email: string;
  roleCode: number;   // 100=管理员 200=专家 300=普通用户
  roleName: string;
  status: number;      // 1=正常 0=禁用 2=锁定
  createdAt: string;
}

/** 分页响应 */
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export const ApiAdmin = {
  /** 分页搜索用户列表 */
  listUsers: (keyword: string, page = 1, size = 10) =>
    GAxiosWithCredentials.get('/users/admin/list', { params: { keyword, page, size } }),

  /** 修改用户角色 */
  updateUserRole: (userId: number, roleCode: number) =>
    GAxiosWithCredentials.put(`/users/admin/${userId}/role`, { roleCode }),

  /** 修改用户状态 */
  updateUserStatus: (userId: number, status: number) =>
    GAxiosWithCredentials.put(`/users/admin/${userId}/status`, { status }),
};
