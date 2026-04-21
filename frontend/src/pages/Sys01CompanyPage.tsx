import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01, type CompanyDto } from '@/services/sys01CompanyService'
import { Search, Plus, Trash2, Save, Building2, Info, Users, Copy, CheckSquare } from 'lucide-react'
import BaseGrid from '@/components/common/BaseGrid'
import Sys02UserPage from './Sys02UserPage'
import { setStatusMessage } from '@/store/statusStore'

export default function Sys01CompanyPage() {
  const qc = useQueryClient()
  const [searchName, setSearchName] = useState('')
  const [useYnOnly, setUseYnOnly] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('info1')

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['sys01-companies', searchName, useYnOnly],
    queryFn: () => sys01.search(searchName, useYnOnly ? 'true' : 'false'),
  })

  // admin(0)을 위해 정확한 null 체크 (selectedId !== null)
  const { data: detail } = useQuery({
    queryKey: ['sys01-company', selectedId],
    queryFn: () => sys01.getById(selectedId!),
    enabled: selectedId !== null,
  })

  const delMut = useMutation({
    mutationFn: (id: number) => sys01.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-companies'] })
      setSelectedId(null)
      setStatusMessage('삭제되었습니다.', 'success')
    },
  })

  const columns = [
    { field: 'companyName', headerName: '고객명', width: 220, pinned: 'left' },
    { field: 'locationName', headerName: 'Sub-Domain', width: 130 },
    { field: 'bizNo', headerName: '사업자번호', width: 130 },
    { field: 'contractType', headerName: '계약유형', width: 100 },
    { field: 'useYn', headerName: '사용', width: 80, cellRenderer: (p: any) => p.value === 'Y' || p.value === 'true' ? 'YES' : 'NO' },
    { field: 'startDate', headerName: '설립일', width: 110 },
    { field: 'officeTelNo', headerName: '대표전화', width: 130 },
    { field: 'note', headerName: '비고', flex: 1, minWidth: 200 },
  ]

  const onRowSelected = (rows: any[]) => {
    // 0을 값으로 받기 위해 체크
    if (rows.length > 0) {
      setSelectedId(rows[0].companyId)
    } else {
      setSelectedId(null)
    }
  }

  const copyId = () => {
    if (selectedId !== null) {
      navigator.clipboard.writeText(selectedId.toString())
      setStatusMessage('ID 복사됨: ' + selectedId, 'info')
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Title Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center shrink-0">
         <Building2 size={16} className="text-slate-400 mr-2" />
         <h1 className="text-sm font-bold text-slate-700">고객별 시스템정보 관리</h1>
      </div>

      {/* Search & Tool Bar */}
      <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded border border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">고객명</label>
            <div className="relative">
              <input 
                value={searchName} 
                onChange={e => setSearchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
                className="pl-7 pr-2 py-1 border border-slate-300 rounded text-xs outline-none focus:border-slate-500 w-44 bg-white"
                placeholder="검색어..."
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors ${useYnOnly ? 'bg-slate-600 border-slate-600' : 'bg-white border-slate-300'}`}>
               {useYnOnly && <CheckSquare size={10} className="text-white" />}
               <input type="checkbox" className="hidden" checked={useYnOnly} onChange={e => setUseYnOnly(e.target.checked)} />
            </div>
            <span className="text-[11px] font-bold text-slate-600">사용고객만 보기</span>
          </label>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          <button 
            onClick={() => qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
            className="px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors shadow-sm"
          >
            조회
          </button>
          <button className="px-4 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
            <Plus size={14} className="text-slate-500" /> 등록
          </button>
          <button 
            onClick={() => selectedId !== null && delMut.mutate(selectedId)}
            disabled={selectedId === null}
            className="px-4 py-1 bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 rounded text-xs font-bold transition-colors shadow-sm disabled:opacity-40 flex items-center gap-1"
          >
            <Trash2 size={14} /> 삭제
          </button>
        </div>
        <div className="flex items-center gap-2 pr-2">
           <span className="text-[10px] font-bold text-slate-400">
             TOTAL: {list.length} 건
           </span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 ag-theme-alpine-oms">
            <BaseGrid 
              rowData={list} 
              columnDefs={columns} 
              onRowSelected={onRowSelected}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Detail Tab Section */}
      <div className="h-[380px] p-2 pt-0 shrink-0">
        <div className="h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-100 border-b border-slate-200 flex px-1 shrink-0 items-center justify-between">
            <div className="flex">
              <TabButton active={activeTab === 'info1'} onClick={() => setActiveTab('info1')} icon={<Info size={14} />} label="관리정보" />
              <TabButton active={activeTab === 'info2'} onClick={() => setActiveTab('info2')} icon={<Building2 size={14} />} label="기본정보" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14} />} label="고객별 관리자" />
            </div>
            {selectedId !== null && (
               <div className="flex gap-2 pr-3">
                 <button onClick={copyId} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-[10px] font-bold transition-all shadow-sm">
                    <Copy size={11} /> ID 복사
                 </button>
               </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden bg-white relative">
            {selectedId === null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2">
                <Building2 size={40} className="opacity-20" />
                <p className="text-xs font-medium">조회할 고객사를 상단 목록에서 선택해 주세요.</p>
              </div>
            ) : (
              <div className="h-full">
                {activeTab === 'info1' && <CompanyForm1 data={detail} onSave={() => qc.invalidateQueries({queryKey:['sys01-companies']})} />}
                {activeTab === 'info2' && <CompanyForm2 data={detail} onSave={() => qc.invalidateQueries({queryKey:['sys01-companies']})} />}
                {activeTab === 'users' && <Sys02UserPage companyId={selectedId} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 text-[11px] font-bold transition-all relative
        ${active 
          ? 'text-slate-900 bg-white border-x border-slate-200 -mb-px z-10' 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
    >
      <span className={active ? 'text-slate-700' : 'text-slate-300'}>{icon}</span>
      {label}
      {active && <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-600" />}
    </button>
  )
}

function CompanyForm1({ data, onSave }: { data?: CompanyDto; onSave: () => void }) {
  const [form, setForm] = useState<CompanyDto | null>(null)
  const qc = useQueryClient()

  if (data && (!form || form.companyId !== data.companyId)) {
    setForm({ ...data })
  }

  const saveMut = useMutation({
    mutationFn: (dto: CompanyDto) => sys01.update(dto.companyId!, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-company', data?.companyId] })
      onSave()
      setStatusMessage('저장되었습니다.', 'success')
    },
  })

  if (!form) return null

  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <div className="flex justify-end mb-3">
        <button 
          onClick={() => saveMut.mutate(form)}
          disabled={saveMut.isPending}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={14} /> 저장
        </button>
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3 max-w-5xl">
        <FormField label="고객사 ID" value={form.companyId} readOnly />
        <FormField label="고객명" value={form.companyName} onChange={(v:any) => setForm({...form, companyName: v})} />
        <FormField label="Sub-Domain" value={form.locationName} onChange={(v:any) => setForm({...form, locationName: v})} highlight />
        <FormField label="사업자번호" value={form.bizNo} onChange={(v:any) => setForm({...form, bizNo: v})} />
        <FormField label="계약유형" value={form.contractType} onChange={(v:any) => setForm({...form, contractType: v})} />
        <FormSelect label="사용여부" value={form.useYn || 'Y'} options={[{l:'YES',v:'Y'}, {l:'NO',v:'N'}]} onChange={(v:any) => setForm({...form, useYn: v})} />
        <FormField label="비고" value={form.note} onChange={(v:any) => setForm({...form, note: v})} fullWidth />
      </div>
    </div>
  )
}

function CompanyForm2({ data, onSave }: { data?: CompanyDto; onSave: () => void }) {
  const [form, setForm] = useState<CompanyDto | null>(null)
  const qc = useQueryClient()

  if (data && (!form || form.companyId !== data.companyId)) {
    setForm({ ...data })
  }

  const saveMut = useMutation({
    mutationFn: (dto: CompanyDto) => sys01.update(dto.companyId!, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-company', data?.companyId] })
      onSave()
      setStatusMessage('저장되었습니다.', 'success')
    },
  })

  if (!form) return null

  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <div className="flex justify-end mb-3">
        <button 
          onClick={() => saveMut.mutate(form)}
          disabled={saveMut.isPending}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold transition-all shadow-sm"
        >
          <Save size={14} /> 저장
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
        <FormField label="대표전화" value={form.officeTelNo} onChange={(v:any) => setForm({...form, officeTelNo: v})} />
        <FormField label="비상전화" value={form.mobileTelNo} onChange={(v:any) => setForm({...form, mobileTelNo: v})} />
        <FormField label="이메일" value={form.emailAddress} onChange={(v:any) => setForm({...form, emailAddress: v})} />
        <FormField label="대표이사" value={form.companyRepName} onChange={(v:any) => setForm({...form, companyRepName: v})} />
        <FormField label="주소" value={form.fullAddress} readOnly fullWidth />
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, readOnly = false, highlight = false, fullWidth = false }: any) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-full' : ''}`}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-0.5">{label}</label>
      <input 
        value={value || ''} 
        onChange={e => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`px-3 py-1.5 border rounded text-xs outline-none transition-all
          ${readOnly ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-white border-slate-300 focus:border-slate-500'}
          ${highlight ? 'font-bold text-blue-800 bg-blue-50/20 border-blue-200' : ''}`}
      />
    </div>
  )
}

function FormSelect({ label, value, options, onChange, fullWidth = false }: any) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-full' : ''}`}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-0.5">{label}</label>
      <select 
        value={value || ''} 
        onChange={e => onChange?.(e.target.value)}
        className="px-3 py-1.5 border border-slate-300 bg-white rounded text-xs outline-none focus:border-slate-500 transition-all"
      >
        {options.map((o:any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}
