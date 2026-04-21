import api from './api'

export interface UserDto {
  userId?: number
  companyId: number
  loginId: string
  korNm: string
  passwd?: string
  email?: string
  adminYn?: string
  note?: string
  companyName?: string
}

export const sys02 = {
  getByCompany: (companyId: number) =>
    api.get<UserDto[]>('/api/v1/sys/users', { params: { companyId } }).then(r => r.data),
  getById: (id: number) => api.get<UserDto>(`/api/v1/sys/users/${id}`).then(r => r.data),
  insert: (dto: UserDto) => api.post<number>('/api/v1/sys/users', dto).then(r => r.data),
  update: (id: number, dto: UserDto) => api.put<number>(`/api/v1/sys/users/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete<number>(`/api/v1/sys/users/${id}`).then(r => r.data),
}
