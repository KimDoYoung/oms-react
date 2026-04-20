import api from './api'

export interface MenuItem {
  id: number
  parent_id: number | null
  level: number
  screen_no: string | null
  title: string
  url: string | null
  component: string | null
  icon: string | null
  sort_order: number
  is_active: number
  children: MenuItem[]
}

export async function fetchMenuTree(): Promise<MenuItem[]> {
  const res = await api.get('/api/v1/menus/')
  return res.data.data.menus as MenuItem[]
}
