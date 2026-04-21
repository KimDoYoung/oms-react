import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01 } from '@/services/sys01CompanyService'
import { sys02, type UserDto } from '@/services/sys02UserService'
import { Plus, Trash2, Save } from 'lucide-react'

const empty = (companyId: number): UserDto => ({ companyId, loginId: '', korNm: '', passwd: '', adminYn: 'Y' })

export default function Sys02UserPage() {
  const qc = useQueryClient()
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [selected, setSelected] = useState<UserDto | null>(null)
  const [form, setForm] = useState<UserDto | null>(null)
  const [isNew, setIsNew] = useState(false)

  const { data: companies = [] } = useQuery({ queryKey: ['sys01-companies'], queryFn: sys01.getAll })
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['sys02-users', companyId],
    queryFn: () => sys02.getByCompany(companyId!),
    enabled: companyId != null,
  })

  const saveMut = useMutation({
    mutationFn: (dto: UserDto) =>
      isNew ? sys02.insert(dto) : sys02.update(dto.userId!, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sys02-users', companyId] }); setIsNew(false) },
  })

  const delMut = useMutation({
    mutationFn: (id: number) => sys02.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sys02-users', companyId] }); setSelected(null); setForm(null) },
  })

  const handleNew = () => {
    if (!companyId) return
    setSelected(null); setForm(empty(companyId)); setIsNew(true)
  }
  const handleSelect = (u: UserDto) => { setSelected(u); setForm({ ...u }); setIsNew(false) }

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
          <span className="text-sm font-bold text-gray-700">사용자 목록</span>
          {companyId && (
            <button onClick={handleNew} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              <Plus size={12} /> 신규
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
            : users.map(u => (
              <button key={u.userId} onClick={() => handleSelect(u)}
                className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.userId === u.userId ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}>
                <div className="text-sm font-medium text-gray-800">{u.korNm}</div>
                <div className="text-xs text-gray-400">{u.loginId}</div>
              </button>
            ))}
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">{isNew ? '신규 사용자' : (form ? '사용자 상세' : '사용자를 선택하세요')}</span>
          {form && (
            <div className="flex gap-2">
              <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                <Save size={12} /> 저장
              </button>
              {selected && !isNew && (
                <button onClick={() => delMut.mutate(selected.userId!)} disabled={delMut.isPending}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                  <Trash2 size={12} /> 삭제
                </button>
              )}
            </div>
          )}
        </div>
        {form ? (
          <div className="p-4 flex flex-col gap-4">
            <Field label="한글명 *">
              <input value={form.korNm} onChange={e => setForm(f => f && ({ ...f, korNm: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label="로그인ID *">
              <input value={form.loginId} onChange={e => setForm(f => f && ({ ...f, loginId: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label={isNew ? '비밀번호 *' : '비밀번호 (변경 시 입력)'}>
              <input type="password" value={form.passwd ?? ''} onChange={e => setForm(f => f && ({ ...f, passwd: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label="이메일">
              <input value={form.email ?? ''} onChange={e => setForm(f => f && ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label="관리자여부">
              <select value={form.adminYn ?? 'Y'} onChange={e => setForm(f => f && ({ ...f, adminYn: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Field>
            {saveMut.isError && <p className="text-xs text-red-500">저장 실패</p>}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">회사를 선택 후 사용자를 선택하거나 신규 버튼을 누르세요</div>
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
