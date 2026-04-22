import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01, type CompanyDto } from '@/services/sys01CompanyService'
import { sys02, type UserDto } from '@/services/sys02UserService'
import { Search, Plus, Trash2, Save, Building2, Info, Users, Copy, CheckSquare } from 'lucide-react'
import BaseGrid from '@/components/common/BaseGrid'
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
    { field: 'useYn', headerName: '사용', width: 70, cellRenderer: (p: any) => p.value === 'Y' || p.value === 'true' ? 'YES' : 'NO' },
    { field: 'startDate', headerName: '설립일', width: 100 },
    { field: 'officeTelNo', headerName: '대표전화', width: 120 },
    { field: 'note', headerName: '비고', flex: 1, minWidth: 200 },
  ]

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

          <label className="flex items-center gap-2 cursor-pointer select-none">
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
          <span className="text-[10px] font-bold text-slate-400">TOTAL: {list.length} 건</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <BaseGrid
            rowData={list}
            columnDefs={columns}
            onRowSelected={rows => {
              const id = rows.length > 0 ? (rows[0] as any).companyId : null
              console.log('[Sys01] row selected:', rows[0] ?? null, '→ companyId:', id)
              setSelectedId(id)
            }}
            loading={isLoading}
            showFilter={false}
            rowHeight={28}
          />
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="h-[320px] p-2 pt-0 shrink-0">
        <div className="h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-100 border-b border-slate-200 flex px-1 shrink-0 items-center justify-between">
            <div className="flex">
              <TabButton active={activeTab === 'info1'} onClick={() => setActiveTab('info1')} icon={<Info size={14} />} label="관리정보" />
              <TabButton active={activeTab === 'info2'} onClick={() => setActiveTab('info2')} icon={<Building2 size={14} />} label="기본정보" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14} />} label="고객별 관리자" />
            </div>
            {selectedId !== null && (
              <div className="flex gap-2 pr-3">
                <button onClick={copyId} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-[10px] font-bold shadow-sm">
                  <Copy size={11} /> ID 복사
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0 bg-white relative">
            {selectedId === null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2">
                <Building2 size={40} className="opacity-20" />
                <p className="text-xs font-medium">조회할 고객사를 상단 목록에서 선택해 주세요.</p>
              </div>
            ) : (
              <div className="h-full">
                {activeTab === 'info1' && (
                  <CompanyPropGrid
                    data={detail}
                    fields={info1Fields}
                    onSave={() => qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
                  />
                )}
                {activeTab === 'info2' && (
                  <CompanyPropGrid
                    data={detail}
                    fields={info2Fields}
                    onSave={() => qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
                  />
                )}
                {activeTab === 'users' && <CompanyUsersGrid companyId={selectedId} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 탭 버튼 ─────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 text-[11px] font-bold transition-all relative
        ${active ? 'text-slate-900 bg-white border-x border-slate-200 -mb-px z-10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
    >
      <span className={active ? 'text-slate-700' : 'text-slate-300'}>{icon}</span>
      {label}
      {active && <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-600" />}
    </button>
  )
}

// ─── Property Grid 필드 정의 ─────────────────────────────────────────────────
type FieldDef = { key: keyof CompanyDto; label: string; readonly?: boolean; highlight?: boolean }

const info1Fields: FieldDef[] = [
  { key: 'companyId',    label: '고객사 ID',  readonly: true },
  { key: 'companyName',  label: '고객명' },
  { key: 'locationName', label: 'Sub-Domain', highlight: true },
  { key: 'bizNo',        label: '사업자번호' },
  { key: 'contractType', label: '계약유형' },
  { key: 'useYn',        label: '사용여부' },
  { key: 'startDate',    label: '설립일' },
  { key: 'closeDate',    label: '해지일' },
  { key: 'assetYn',      label: '자산모듈' },
  { key: 'advisYn',      label: '자문모듈' },
  { key: 'pbsYn',        label: 'PBS모듈' },
  { key: 'note',         label: '비고' },
]

const info2Fields: FieldDef[] = [
  { key: 'officeTelNo',   label: '대표전화' },
  { key: 'mobileTelNo',   label: '비상전화' },
  { key: 'emailAddress',  label: '이메일' },
  { key: 'companyRepName',label: '대표이사' },
  { key: 'zipCode',       label: '우편번호',  readonly: true },
  { key: 'zipAddress',    label: '도로명주소', readonly: true },
  { key: 'zipDetail',     label: '상세주소',  readonly: true },
  { key: 'fullAddress',   label: '전체주소',  readonly: true },
]

// ─── Property Grid 컴포넌트 ───────────────────────────────────────────────────
type PropRow = { key: string; label: string; value: string; readonly: boolean; highlight: boolean }

function CompanyPropGrid({
  data,
  fields,
  onSave,
}: {
  data?: CompanyDto
  fields: FieldDef[]
  onSave: () => void
}) {
  const qc = useQueryClient()
  const [rows, setRows] = useState<PropRow[]>([])

  useEffect(() => {
    if (!data) return
    console.log('[CompanyPropGrid] data loaded:', data)
    setRows(fields.map(f => ({
      key: String(f.key),
      label: f.label,
      value: String(data[f.key] ?? ''),
      readonly: !!f.readonly,
      highlight: !!f.highlight,
    })))
  }, [data?.companyId])

  const saveMut = useMutation({
    mutationFn: () => {
      const dto = rows.reduce<any>((acc, r) => ({ ...acc, [r.key]: r.value }), {})
      dto.companyId = data!.companyId
      return sys01.update(data!.companyId!, dto as CompanyDto)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-company', data?.companyId] })
      onSave()
      setStatusMessage('저장되었습니다.', 'success')
    },
  })

  const columns = [
    {
      field: 'label',
      headerName: '항목',
      width: 130,
      editable: false,
      cellStyle: { background: '#f1f5f9', fontWeight: '700', color: '#475569', fontSize: '11px' },
    },
    {
      field: 'value',
      headerName: '값',
      flex: 1,
      editable: (p: any) => !p.data.readonly,
      cellStyle: (p: any) => {
        if (p.data.readonly) return { background: '#f8fafc', color: '#94a3b8' }
        if (p.data.highlight) return { color: '#1e40af', fontWeight: '700', background: '#eff6ff' }
        return null
      },
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end px-3 py-1.5 border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold shadow-sm disabled:opacity-50"
        >
          <Save size={13} /> 저장
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <BaseGrid
          rowData={rows}
          columnDefs={columns}
          showFilter={false}
          rowHeight={28}
          onCellValueChanged={e =>
            setRows(prev => prev.map(r => r.key === (e.data as PropRow).key ? { ...r, value: e.newValue ?? '' } : r))
          }
        />
      </div>
    </div>
  )
}

// ─── 고객별 관리자 그리드 ─────────────────────────────────────────────────────
type UserRow = UserDto & { _isNew?: boolean }

function CompanyUsersGrid({ companyId }: { companyId: number }) {
  const qc = useQueryClient()
  const [rows, setRows] = useState<UserRow[]>([])
  const [selectedRow, setSelectedRow] = useState<UserRow | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['sys02-users', companyId],
    queryFn: () => sys02.getByCompany(companyId),
  })

  useEffect(() => { setRows(users) }, [users])

  const saveMut = useMutation({
    mutationFn: async (list: UserRow[]) => {
      for (const row of list) {
        const { _isNew, ...dto } = row
        if (_isNew) await sys02.insert(dto)
        else if (dto.userId) await sys02.update(dto.userId, dto)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys02-users', companyId] })
      setStatusMessage('저장되었습니다.', 'success')
    },
  })

  const delMut = useMutation({
    mutationFn: (id: number) => sys02.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys02-users', companyId] })
      setSelectedRow(null)
      setStatusMessage('삭제되었습니다.', 'success')
    },
  })

  const handleAdd = () => {
    setRows(prev => [...prev, { companyId, loginId: '', korNm: '', passwd: '', adminYn: 'Y', _isNew: true }])
  }

  const handleDelete = () => {
    if (!selectedRow) return
    if (selectedRow._isNew) {
      setRows(prev => prev.filter(r => r !== selectedRow))
      setSelectedRow(null)
    } else if (selectedRow.userId) {
      delMut.mutate(selectedRow.userId)
    }
  }

  const columns = [
    { field: 'korNm',   headerName: '이름',     width: 120, editable: true },
    { field: 'loginId', headerName: '로그인ID', width: 150, editable: true },
    { field: 'passwd',  headerName: '비밀번호', width: 120, editable: true,
      cellRenderer: (p: any) => p.value ? '••••••' : <span className="text-slate-300 text-[10px]">미입력</span> },
    { field: 'adminYn', headerName: '관리자', width: 80, editable: true },
    { field: 'email',   headerName: '이메일', flex: 1, editable: true },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-xs font-bold shadow-sm"
        >
          <Plus size={13} /> 추가
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedRow}
          className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 rounded text-xs font-bold shadow-sm disabled:opacity-40"
        >
          <Trash2 size={13} /> 삭제
        </button>
        <button
          onClick={() => saveMut.mutate(rows)}
          disabled={saveMut.isPending}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold shadow-sm disabled:opacity-50 ml-auto"
        >
          <Save size={13} /> 저장
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <BaseGrid
          rowData={rows}
          columnDefs={columns}
          showFilter={false}
          rowHeight={28}
          loading={isLoading}
          onRowSelected={r => setSelectedRow((r[0] as UserRow) ?? null)}
          onCellValueChanged={e =>
            setRows(prev => prev.map((r, i) => i === e.rowIndex ? { ...r, [e.column.getColId()]: e.newValue } : r))
          }
        />
      </div>
    </div>
  )
}
