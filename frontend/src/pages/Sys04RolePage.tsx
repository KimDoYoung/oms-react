import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01 } from '@/services/sys01CompanyService'
import { sys04, type RoleDto } from '@/services/sys04RoleService'
import { Plus, Trash2, Save } from 'lucide-react'

const empty = (companyId: number): RoleDto => ({ companyId, roleName: '', seq: 1, adminYn: 'N' })

export default function Sys04RolePage() {
  const qc = useQueryClient()
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [selected, setSelected] = useState<RoleDto | null>(null)
  const [form, setForm] = useState<RoleDto | null>(null)
  const [isNew, setIsNew] = useState(false)

  const { data: companies = [] } = useQuery({ queryKey: ['sys01-companies'], queryFn: sys01.getAll })
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['sys04-roles', companyId],
    queryFn: () => sys04.getByCompany(companyId!),
    enabled: companyId != null,
  })

  const saveMut = useMutation({
    mutationFn: (dto: RoleDto) =>
      isNew ? sys04.insert(dto) : sys04.update(dto.roleId!, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sys04-roles', companyId] }); setIsNew(false) },
  })
  const delMut = useMutation({
    mutationFn: (id: number) => sys04.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sys04-roles', companyId] }); setSelected(null); setForm(null) },
  })

  const handleNew = () => { if (!companyId) return; setSelected(null); setForm(empty(companyId)); setIsNew(true) }
  const handleSelect = (r: RoleDto) => { setSelected(r); setForm({ ...r }); setIsNew(false) }

  return (
    <div className="flex h-full gap-3 p-3">
      <div className="w-80 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <label className="text-xs font-bold text-gray-500 block mb-1">회사 선택</label>
          <select value={companyId ?? ''} onChange={e => { setCompanyId(Number(e.target.value)); setSelected(null); setForm(null) }}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
            <option value="">-- 선택 --</option>
            {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">역할(Role) 목록</span>
          {companyId && (
            <button onClick={handleNew} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              <Plus size={12} /> 신규
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
            : roles.map(r => (
              <button key={r.roleId} onClick={() => handleSelect(r)}
                className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.roleId === r.roleId ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}>
                <div className="text-sm font-medium text-gray-800">{r.roleName}</div>
                <div className="text-xs text-gray-400">seq: {r.seq}</div>
              </button>
            ))}
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">{isNew ? '신규 역할' : (form ? '역할 상세' : '역할을 선택하세요')}</span>
          {form && (
            <div className="flex gap-2">
              <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                <Save size={12} /> 저장
              </button>
              {selected && !isNew && (
                <button onClick={() => delMut.mutate(selected.roleId!)} disabled={delMut.isPending}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                  <Trash2 size={12} /> 삭제
                </button>
              )}
            </div>
          )}
        </div>
        {form ? (
          <div className="p-4 flex flex-col gap-4">
            <Field label="역할명 *">
              <input value={form.roleName} onChange={e => setForm(f => f && ({ ...f, roleName: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label="순서">
              <input type="number" value={form.seq ?? 1} onChange={e => setForm(f => f && ({ ...f, seq: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label="관리자여부">
              <select value={form.adminYn ?? 'N'} onChange={e => setForm(f => f && ({ ...f, adminYn: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
                <option value="N">N</option>
                <option value="Y">Y</option>
              </select>
            </Field>
            <Field label="비고">
              <input value={form.note ?? ''} onChange={e => setForm(f => f && ({ ...f, note: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            {saveMut.isError && <p className="text-xs text-red-500">저장 실패</p>}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">회사를 선택 후 역할을 선택하거나 신규 버튼을 누르세요</div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
