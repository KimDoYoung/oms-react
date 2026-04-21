import api from './api'

export interface UserRoleDto {
  userRoleId?: number
  userId: number
  roleId: number
  seq?: number
  note?: string
  authOrgName?: string
}

export const sys05 = {
  getByUser: (userId: number) =>
    api.get<UserRoleDto[]>('/api/v1/sys/user-roles', { params: { userId } }).then(r => r.data),
  getByRole: (roleId: number) =>
    api.get<UserRoleDto[]>('/api/v1/sys/user-roles', { params: { roleId } }).then(r => r.data),
  insert: (dto: UserRoleDto) => api.post<number>('/api/v1/sys/user-roles', dto).then(r => r.data),
  delete: (id: number) => api.delete<number>(`/api/v1/sys/user-roles/${id}`).then(r => r.data),
}
