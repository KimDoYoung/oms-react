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
  const res = await api.get('/api/v1/menus')
  const rawMenus = res.data.data.menus

  // Backend DTO (Sys06MenuDto) -> Frontend MenuItem 매핑
  const mapMenu = (m: any): MenuItem => ({
    id: m.menuId,
    parent_id: m.parentId,
    level: m.level,
    screen_no: m.menuNo,
    title: m.menuName,
    url: null,
    component: m.className,
    icon: null,
    sort_order: m.seq,
    is_active: m.useYn === 'true' ? 1 : 0,
    children: m.children ? m.children.map(mapMenu) : []
  })

  return rawMenus.map(mapMenu)
}
