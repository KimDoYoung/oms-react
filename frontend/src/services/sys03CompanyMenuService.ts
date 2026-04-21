import api from './api'

export interface CompanyMenuDto {
  companyMenuId?: number
  companyId: number
  menuId: number
  useYn?: string
  note?: string
}

export const sys03 = {
  getByCompany: (companyId: number) =>
    api.get<CompanyMenuDto[]>('/api/v1/sys/company-menus', { params: { companyId } }).then(r => r.data),
  insert: (dto: CompanyMenuDto) => api.post<number>('/api/v1/sys/company-menus', dto).then(r => r.data),
  updateUseYn: (dto: CompanyMenuDto) => api.put<number>('/api/v1/sys/company-menus/use-yn', dto).then(r => r.data),
  delete: (companyId: number, menuId: number) =>
    api.delete<number>('/api/v1/sys/company-menus', { params: { companyId, menuId } }).then(r => r.data),
}
