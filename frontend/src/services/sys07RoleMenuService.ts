import api from './api'

export interface RoleMenuDto {
  roleMenuId?: number
  roleId: number
  menuId: number
  useYn?: string
  note?: string
}

export const sys07 = {
  getByRole: (roleId: number) =>
    api.get<RoleMenuDto[]>('/api/v1/sys/role-menus', { params: { roleId } }).then(r => r.data),
  insert: (dto: RoleMenuDto) => api.post<number>('/api/v1/sys/role-menus', dto).then(r => r.data),
  update: (id: number, dto: RoleMenuDto) => api.put<number>(`/api/v1/sys/role-menus/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete<number>(`/api/v1/sys/role-menus/${id}`).then(r => r.data),
  deleteByRole: (roleId: number) =>
    api.delete<number>('/api/v1/sys/role-menus', { params: { roleId } }).then(r => r.data),
}
