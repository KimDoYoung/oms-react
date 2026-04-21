import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01, type CompanyDto } from '@/services/sys01CompanyService'
import { Plus, Trash2, Save } from 'lucide-react'

const empty = (): CompanyDto => ({ companyName: '', locNm: '', useYn: 'Y' })

export default function Sys01CompanyPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<CompanyDto | null>(null)
  const [form, setForm] = useState<CompanyDto>(empty())
  const [isNew, setIsNew] = useState(false)

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['sys01-companies'],
    queryFn: sys01.getAll,
  })

  const saveMut = useMutation({
    mutationFn: (dto: CompanyDto) =>
      isNew ? sys01.insert(dto) : sys01.update(dto.companyId!, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sys01-companies'] }); setIsNew(false) },
  })

  const delMut = useMutation({
    mutationFn: (id: number) => sys01.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-companies'] })
      setSelected(null); setForm(empty()); setIsNew(false)
    },
  })

  const handleSelect = (c: CompanyDto) => { setSelected(c); setForm({ ...c }); setIsNew(false) }
  const handleNew = () => { setSelected(null); setForm(empty()); setIsNew(true) }
  const handleSave = () => saveMut.mutate(form)

  return (
    <div className="flex h-full gap-3 p-3">
      {/* 목록 */}
      <div className="w-80 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">회사 목록</span>
          <button onClick={handleNew} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            <Plus size={12} /> 신규
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
          ) : list.map(c => (
            <button
              key={c.companyId}
              onClick={() => handleSelect(c)}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.companyId === c.companyId ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}
            >
              <div className="text-sm font-medium text-gray-800">{c.companyName}</div>
              <div className="text-xs text-gray-400">{c.locNm}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 상세/편집 */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">{isNew ? '신규 회사' : (selected ? '회사 상세' : '회사를 선택하세요')}</span>
          {(isNew || selected) && (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saveMut.isPending}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                <Save size={12} /> 저장
              </button>
              {selected && !isNew && (
                <button onClick={() => delMut.mutate(selected.companyId!)} disabled={delMut.isPending}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                  <Trash2 size={12} /> 삭제
                </button>
              )}
            </div>
          )}
        </div>

        {(isNew || selected) ? (
          <div className="p-4 flex flex-col gap-4">
            <Field label="회사명 *">
              <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            <Field label="접속코드(subdomain) *">
              <input value={form.locNm} onChange={e => setForm(f => ({ ...f, locNm: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="예: kova1" />
            </Field>
            <Field label="사용여부">
              <select value={form.useYn ?? 'Y'} onChange={e => setForm(f => ({ ...f, useYn: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Field>
            <Field label="비고">
              <input value={form.note ?? ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            </Field>
            {saveMut.isError && <p className="text-xs text-red-500">저장 실패: {String(saveMut.error)}</p>}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">좌측 목록에서 회사를 선택하거나 신규 버튼을 누르세요</div>
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
