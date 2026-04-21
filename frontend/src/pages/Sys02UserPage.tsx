import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01 } from '@/services/sys01CompanyService'
import { sys02, type UserDto } from '@/services/sys02UserService'
import { Plus, Trash2, Save } from 'lucide-react'
import { setStatusMessage } from '@/store/statusStore'

const empty = (companyId: number): UserDto => ({ companyId, loginId: '', korNm: '', passwd: '', adminYn: 'Y' })

export default function Sys02UserPage({ companyId: propCompanyId }: { companyId?: number }) {
  const qc = useQueryClient()
  const [internalCompanyId, setInternalCompanyId] = useState<number | null>(null)
  const companyId = propCompanyId ?? internalCompanyId
  const [selected, setSelected] = useState<UserDto | null>(null)
  const [form, setForm] = useState<UserDto | null>(null)
  const [isNew, setIsNew] = useState(false)

  const { data: companies = [] } = useQuery({ 
    queryKey: ['sys01-companies'], 
    queryFn: sys01.getAll,
    enabled: !propCompanyId 
  })
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['sys02-users', companyId],
    queryFn: () => sys02.getByCompany(companyId!),
    enabled: companyId != null,
  })

  const saveMut = useMutation({
    mutationFn: (dto: UserDto) =>
      isNew ? sys02.insert(dto) : sys02.update(dto.userId!, dto),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['sys02-users', companyId] })
      setIsNew(false)
      setStatusMessage('사용자 정보가 저장되었습니다.', 'success')
    },
  })

  const delMut = useMutation({
    mutationFn: (id: number) => sys02.delete(id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['sys02-users', companyId] })
      setSelected(null)
      setForm(null)
      setStatusMessage('사용자가 삭제되었습니다.', 'success')
    },
  })

  const handleNew = () => {
    if (!companyId) return
    setSelected(null); setForm(empty(companyId)); setIsNew(true)
  }
  const handleSelect = (u: UserDto) => { setSelected(u); setForm({ ...u }); setIsNew(false) }

  return (
    <div className={`flex h-full gap-2 ${propCompanyId ? 'p-0' : 'p-2'}`}>
      {!propCompanyId && (
        <div className="w-64 flex flex-col bg-white border border-slate-200 rounded overflow-hidden shrink-0 shadow-sm">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Company Select</label>
            <select value={companyId ?? ''} onChange={e => { setInternalCompanyId(Number(e.target.value)); setSelected(null); setForm(null) }}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:border-slate-500 bg-white">
              <option value="">-- 선택 --</option>
              {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50/30">
            <span className="text-[11px] font-bold text-slate-700">사용자 목록</span>
            {companyId && (
              <button onClick={handleNew} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
                <Plus size={12} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? <div className="p-4 text-center text-slate-400 text-xs">로딩 중...</div>
              : users.map(u => (
                <button key={u.userId} onClick={() => handleSelect(u)}
                  className={`w-full text-left px-3 py-2 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selected?.userId === u.userId ? 'bg-slate-100 border-l-2 border-l-slate-600' : ''}`}>
                  <div className="text-xs font-medium text-slate-800">{u.korNm}</div>
                  <div className="text-[10px] text-slate-400">{u.loginId}</div>
                </button>
              ))}
          </div>
        </div>
      )}
      
      {propCompanyId && (
        <div className="w-52 flex flex-col bg-white border-r border-slate-200 overflow-hidden shrink-0">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
             <span className="text-[11px] font-bold text-slate-700">사용자</span>
             <button onClick={handleNew} className="p-1 bg-slate-600 text-white rounded hover:bg-slate-700">
                <Plus size={12} />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto">
             {users.map(u => (
                <button key={u.userId} onClick={() => handleSelect(u)}
                  className={`w-full text-left px-3 py-1.5 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected?.userId === u.userId ? 'bg-slate-100' : ''}`}>
                  <div className="text-xs font-medium text-slate-700">{u.korNm}</div>
                  <div className="text-[10px] text-slate-400">{u.loginId}</div>
                </button>
             ))}
          </div>
        </div>
      )}

      <div className="flex-1 bg-white border border-slate-200 rounded overflow-hidden flex flex-col shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <span className="text-xs font-bold text-slate-700">{isNew ? '신규 사용자' : (form ? '상세 정보' : '선택된 사용자 없음')}</span>
          {form && (
            <div className="flex gap-2">
              <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-white rounded text-[11px] font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                <Save size={13} /> 저장
              </button>
              {selected && !isNew && (
                <button onClick={() => delMut.mutate(selected.userId!)} disabled={delMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-500 rounded text-[11px] font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50">
                  <Trash2 size={13} /> 삭제
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {form ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
              <Field label="한글명 *">
                <input value={form.korNm} onChange={e => setForm(f => f && ({ ...f, korNm: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-500" />
              </Field>
              <Field label="로그인ID *">
                <input value={form.loginId} onChange={e => setForm(f => f && ({ ...f, loginId: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-500" />
              </Field>
              <Field label={isNew ? '비밀번호 *' : '비밀번호 (변경 시만 입력)'}>
                <input type="password" value={form.passwd ?? ''} onChange={e => setForm(f => f && ({ ...f, passwd: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-500" />
              </Field>
              <Field label="관리자여부">
                <select value={form.adminYn ?? 'Y'} onChange={e => setForm(f => f && ({ ...f, adminYn: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-500">
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </Field>
              <Field label="이메일" fullWidth>
                <input value={form.email ?? ''} onChange={e => setForm(f => f && ({ ...f, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-slate-500" />
              </Field>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-xs">
              왼쪽 목록에서 사용자를 선택하거나 상단 + 버튼을 누르세요.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, fullWidth = false }: { label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase ml-0.5">{label}</label>
      {children}
    </div>
  )
}
