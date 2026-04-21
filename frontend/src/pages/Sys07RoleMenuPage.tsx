import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01 } from '@/services/sys01CompanyService'
import { sys04, type RoleDto } from '@/services/sys04RoleService'
import { sys07, type RoleMenuDto } from '@/services/sys07RoleMenuService'
import { fetchMenuTree, type MenuItem } from '@/services/menuService'
import { Trash2 } from 'lucide-react'

function flattenMenus(menus: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = []
  const walk = (items: MenuItem[]) => {
    for (const m of items) {
      result.push(m)
      if (m.children?.length) walk(m.children)
    }
  }
  walk(menus)
  return result
}

export default function Sys07RoleMenuPage() {
  const qc = useQueryClient()
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null)

  const { data: companies = [] } = useQuery({ queryKey: ['sys01-companies'], queryFn: sys01.getAll })
  const { data: allMenus = [] } = useQuery({ queryKey: ['menus'], queryFn: fetchMenuTree, staleTime: 1000 * 60 * 10 })
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['sys04-roles', companyId],
    queryFn: () => sys04.getByCompany(companyId!),
    enabled: companyId != null,
  })
  const { data: roleMenus = [], isLoading: rmLoading } = useQuery({
    queryKey: ['sys07-role-menus', selectedRole?.roleId],
    queryFn: () => sys07.getByRole(selectedRole!.roleId!),
    enabled: selectedRole?.roleId != null,
  })

  const insertMut = useMutation({
    mutationFn: (dto: RoleMenuDto) => sys07.insert(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sys07-role-menus', selectedRole?.roleId] }),
  })
  const delMut = useMutation({
    mutationFn: (id: number) => sys07.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sys07-role-menus', selectedRole?.roleId] }),
  })

  const flat = flattenMenus(allMenus)
  const assignedMenuIds = new Set(roleMenus.map(rm => rm.menuId))

  const handleToggle = (menuId: number) => {
    if (!selectedRole?.roleId) return
    const existing = roleMenus.find(rm => rm.menuId === menuId)
    if (existing) {
      delMut.mutate(existing.roleMenuId!)
    } else {
      insertMut.mutate({ roleId: selectedRole.roleId, menuId, useYn: 'true' })
    }
  }

  const handleCompanyChange = (id: number) => {
    setCompanyId(id)
    setSelectedRole(null)
  }

  return (
    <div className="flex h-full gap-3 p-3">
      {/* 역할 목록 */}
      <div className="w-64 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <label className="text-xs font-bold text-gray-500 block mb-1">회사 선택</label>
          <select value={companyId ?? ''} onChange={e => handleCompanyChange(Number(e.target.value))}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
            <option value="">-- 선택 --</option>
            {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="px-3 py-2 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">역할(Role) 목록</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rolesLoading ? (
            <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
          ) : roles.map(r => (
            <button key={r.roleId} onClick={() => setSelectedRole(r)}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedRole?.roleId === r.roleId ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}>
              <div className="text-sm font-medium text-gray-800">{r.roleName}</div>
              {r.adminYn === 'Y' && <div className="text-xs text-red-500">관리자</div>}
            </button>
          ))}
        </div>
      </div>

      {/* 메뉴 할당 */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">
            {selectedRole ? `${selectedRole.roleName} — 메뉴 권한` : '역할을 선택하세요'}
          </span>
        </div>

        {selectedRole ? (
          rmLoading ? (
            <div className="p-4 text-center text-gray-400">로딩 중...</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs text-gray-500 mb-3">체크하면 해당 역할에 메뉴 접근 권한이 부여됩니다.</p>
              <div className="flex flex-col gap-1">
                {flat.filter(m => m.screen_no).map(m => (
                  <label key={m.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={assignedMenuIds.has(m.id)}
                      onChange={() => handleToggle(m.id)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-gray-700">{m.title}</span>
                    {m.screen_no && <span className="text-xs text-gray-400">({m.screen_no})</span>}
                  </label>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">회사 선택 후 역할을 선택하세요</div>
        )}
      </div>

      {/* 할당된 메뉴 목록 */}
      <div className="w-56 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">할당된 메뉴 ({roleMenus.length})</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {roleMenus.map(rm => {
            const menu = flat.find(m => m.id === rm.menuId)
            return (
              <div key={rm.roleMenuId} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-700">{menu?.title ?? `menuId:${rm.menuId}`}</span>
                <button onClick={() => delMut.mutate(rm.roleMenuId!)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50">
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
