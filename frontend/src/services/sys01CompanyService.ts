import api from './api'

export interface CompanyDto {
  companyId?: number
  companyName: string
  locationName?: string
  bizNo?: string
  startDate?: string
  closeDate?: string
  useYn?: string
  contractType?: string
  note?: string
  menuYn?: string
  zipCode?: string
  zipAddress?: string
  zipDetail?: string
  fullAddress?: string
  officeTelNo?: string
  mobileTelNo?: string
  emailAddress?: string
  companyRepName?: string
  assetYn?: string
  advisYn?: string
  pbsYn?: string
}

export const sys01 = {
  getAll: () => api.get<CompanyDto[]>('/api/v1/sys/companies').then(r => r.data),
  search: (name?: string, useYn?: string) => 
    api.get<CompanyDto[]>('/api/v1/sys/companies', { params: { companyName: name, useYn } }).then(r => r.data),
  getById: (id: number) => api.get<CompanyDto>(`/api/v1/sys/companies/${id}`).then(r => r.data),
  getByCode: (code: string) => api.get<CompanyDto>(`/api/v1/sys/companies/by-code/${code}`).then(r => r.data),
  insert: (dto: CompanyDto) => api.post<number>('/api/v1/sys/companies', dto).then(r => r.data),
  update: (id: number, dto: CompanyDto) => api.put<number>(`/api/v1/sys/companies/${id}`, dto).then(r => r.data),
  delete: (id: number) => api.delete<number>(`/api/v1/sys/companies/${id}`).then(r => r.data),
}
