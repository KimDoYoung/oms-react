import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01, type CompanyDto } from '@/services/sys01CompanyService'
import { Search, Plus, Trash2, Save, Building2, Info, Users } from 'lucide-react'
import BaseGrid from '@/components/common/BaseGrid'
import Sys02UserPage from './Sys02UserPage'

export default function Sys01CompanyPage() {
  const qc = useQueryClient()
  const [searchName, setSearchName] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('info1')

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['sys01-companies', searchName],
    queryFn: () => sys01.search(searchName),
  })

  const { data: detail } = useQuery({
    queryKey: ['sys01-company', selectedId],
    queryFn: () => sys01.getById(selectedId!),
    enabled: !!selectedId,
  })

  const delMut = useMutation({
    mutationFn: (id: number) => sys01.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-companies'] })
      setSelectedId(null)
    },
  })

  const columns = [
    { field: 'companyName', headerName: '고객명', width: 200 },
    { field: 'locationName', headerName: 'Sub-Domain', width: 150 },
    { field: 'useYn', headerName: '사용여부', width: 100, cellRenderer: (p: any) => p.value === 'Y' ? 'YES' : 'NO' },
    { field: 'note', headerName: '비고', flex: 1 },
  ]

  const onRowSelected = (rows: any[]) => {
    if (rows.length > 0) setSelectedId(rows[0].companyId)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Search & Tool Bar */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">고객명</label>
            <div className="relative">
              <input 
                value={searchName} 
                onChange={e => setSearchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all w-64"
                placeholder="회사명 검색..."
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
          </div>
          <button 
            onClick={() => qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-bold transition-colors shadow-sm"
          >
            조회
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-bold transition-colors shadow-sm">
            <Plus size={14} /> 등록
          </button>
          <button 
            onClick={() => selectedId && delMut.mutate(selectedId)}
            disabled={!selectedId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-sm font-bold transition-colors shadow-sm disabled:opacity-40"
          >
            <Trash2 size={14} /> 삭제
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="flex-1 min-h-0 p-3 pb-1.5">
        <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600 flex items-center gap-2 uppercase tracking-tight">
              <Building2 size={14} className="text-green-600" />
              고객사 정보 목록
            </h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
              총 {list.length} 건
            </span>
          </div>
          <div className="flex-1">
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
      <div className="h-[400px] p-3 pt-1.5 shrink-0">
        <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50/50 border-b border-gray-200 flex px-1 shrink-0">
            <TabButton active={activeTab === 'info1'} onClick={() => setActiveTab('info1')} icon={<Info size={14} />} label="관리정보" />
            <TabButton active={activeTab === 'info2'} onClick={() => setActiveTab('info2')} icon={<Building2 size={14} />} label="기본정보" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14} />} label="고객별 관리자" />
          </div>
          <div className="flex-1 overflow-y-auto bg-white relative">
            {!selectedId ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                <Building2 size={48} className="opacity-10" />
                <p className="text-sm font-medium">조회할 고객사를 상단 목록에서 선택해 주세요.</p>
              </div>
            ) : (
              <div className="p-4 h-full">
                {activeTab === 'info1' && <CompanyInfo1 data={detail} />}
                {activeTab === 'info2' && <CompanyInfo2 data={detail} />}
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
      className={`px-4 py-3 flex items-center gap-2 text-sm font-bold transition-all relative
        ${active 
          ? 'text-green-700' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
    >
      {icon}
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 animate-in fade-in slide-in-from-bottom-1" />}
    </button>
  )
}

function CompanyInfo1({ data }: { data?: any }) {
  if (!data) return null
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
      <DetailField label="고객사 ID" value={data.companyId} />
      <DetailField label="고객사명" value={data.companyName} />
      <DetailField label="Sub-Domain" value={data.locationName} highlight />
      <DetailField label="사용여부" value={data.useYn === 'Y' ? '사용 중' : '사용 안함'} />
      <DetailField label="비고" value={data.note} fullWidth />
    </div>
  )
}

function CompanyInfo2({ data }: { data?: any }) {
  if (!data) return null
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
      <DetailField label="대표전화" value={data.officeTelNo} />
      <DetailField label="담당자 정보" value={data.empInfo} />
      <DetailField label="주소" value={data.fullAddress} fullWidth />
    </div>
  )
}

function DetailField({ label, value, highlight = false, fullWidth = false }: { label: string; value: any; highlight?: boolean; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'col-span-2' : ''}`}>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className={`text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-md font-medium
        ${highlight ? 'text-blue-700 bg-blue-50/30 border-blue-100' : 'text-gray-700'}`}>
        {value || '-'}
      </div>
    </div>
  )
}
