import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01 } from '@/services/sys01CompanyService'
import { sys03, type CompanyMenuDto } from '@/services/sys03CompanyMenuService'
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

export default function Sys03CompanyMenuPage() {
  const qc = useQueryClient()
  const [companyId, setCompanyId] = useState<number | null>(null)

  const { data: companies = [] } = useQuery({ queryKey: ['sys01-companies'], queryFn: sys01.getAll })
  const { data: allMenus = [] } = useQuery({ queryKey: ['menus'], queryFn: fetchMenuTree, staleTime: 1000 * 60 * 10 })
  const { data: companyMenus = [], isLoading } = useQuery({
    queryKey: ['sys03-company-menus', companyId],
    queryFn: () => sys03.getByCompany(companyId!),
    enabled: companyId != null,
  })

  const insertMut = useMutation({
    mutationFn: (dto: CompanyMenuDto) => sys03.insert(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sys03-company-menus', companyId] }),
  })
  const delMut = useMutation({
    mutationFn: ({ cId, mId }: { cId: number; mId: number }) => sys03.delete(cId, mId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sys03-company-menus', companyId] }),
  })

  const flat = flattenMenus(allMenus)
  const assignedIds = new Set(companyMenus.map(cm => cm.menuId))

  const handleToggle = (menuId: number) => {
    if (!companyId) return
    if (assignedIds.has(menuId)) {
      delMut.mutate({ cId: companyId, mId: menuId })
    } else {
      insertMut.mutate({ companyId, menuId, useYn: 'true' })
    }
  }

  return (
    <div className="flex h-full gap-3 p-3">
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <label className="text-xs font-bold text-gray-500 block mb-1">회사 선택</label>
          <select value={companyId ?? ''} onChange={e => setCompanyId(Number(e.target.value))}
            className="w-64 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
            <option value="">-- 선택 --</option>
            {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName} ({c.locNm})</option>)}
          </select>
        </div>

        {companyId ? (
          isLoading ? (
            <div className="p-4 text-center text-gray-400">로딩 중...</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs text-gray-500 mb-3">체크하면 해당 회사에 메뉴 접근 권한이 부여됩니다.</p>
              <div className="flex flex-col gap-1">
                {flat.filter(m => m.screen_no).map(m => (
                  <label key={m.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={assignedIds.has(m.id)}
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
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">회사를 선택하세요</div>
        )}
      </div>

      <div className="w-64 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">할당된 메뉴 ({companyMenus.length})</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {companyMenus.map(cm => {
            const menu = flat.find(m => m.id === cm.menuId)
            return (
              <div key={cm.companyMenuId} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-700">{menu?.title ?? `menuId:${cm.menuId}`}</span>
                <button onClick={() => delMut.mutate({ cId: companyId!, mId: cm.menuId })}
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
