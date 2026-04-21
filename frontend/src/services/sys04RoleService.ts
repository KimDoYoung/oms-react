import api from './api'

export interface RoleDto {
  roleId?: number
  companyId: number
  roleName: string
  seq?: number
  note?: string
  adminYn?: string
  companyName?: string
  userRoleYn?: boolean
}

export const sys04 = {
  getByCompany: (companyId: number) =>
    api.get<RoleDto[]>('/api/v1/sys/roles', { params: { companyId } }).then(r => r.data),
  getByUser: (companyId: number, userId: number) =>
    api.get<RoleDto[]>(`/api/v1/sys/roles/by-user/${userId}`, { params: { companyId } }).then(r => r.data),
  insert: (dto: RoleDto) => api.post<number>('/api/v1/sys/roles', dto).then(r => r.data),
  update: (id: number, dto: RoleDto) => api.put<number>(`/api/v1/sys/roles/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete<number>(`/api/v1/sys/roles/${id}`).then(r => r.data),
}
