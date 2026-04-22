import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01, type CompanyDto } from '@/services/sys01CompanyService'
import { sys02, type UserDto } from '@/services/sys02UserService'
import { Search, Plus, Trash2, Save, Building2, Info, Users, Copy, CheckSquare } from 'lucide-react'
import BaseGrid from '@/components/common/BaseGrid'
import { setStatusMessage } from '@/store/statusStore'

// ─── Y/N 컬럼 공통 설정 ───────────────────────────────────────────────────────
const YN_COL = {
  cellEditor: 'agSelectCellEditor',
  cellEditorParams: { values: ['Y', 'N'] },
  cellRenderer: (p: any) => {
    if (p.value === 'Y') return '✔ Y'
    if (p.value === 'N') return '✘ N'
    return p.value ?? '-'
  },
}
const BLUE = { color: '#1e40af', fontWeight: '700' }
const GRAY = { background: '#f8fafc', color: '#94a3b8' }

// ─── ASIS Sys01_TabPage_Info01 컬럼 ─────────────────────────────────────────
// 백엔드 Sys01CompanyDto 기준 (mailInfo·emgrcyPasswd·erpProductName·noticeDate·icamCode 등 미이관 필드 제외)
const info1ColDefs = [
  { field: 'companyId',    headerName: 'companyId',  width: 90,  editable: false, cellStyle: GRAY },
  { field: 'companyName',  headerName: '고객명',      width: 200, editable: true,  cellStyle: BLUE },
  { field: 'locationName', headerName: '서브도메인',   width: 130, editable: true,  cellStyle: BLUE },
  { field: 'contractType', headerName: '계약유형',     width: 100, editable: true  },
  { field: 'closeDate',    headerName: '계약종료일',   width: 110, editable: true  },
  { field: 'assetYn',      headerName: '운용사',       width: 80,  editable: true,  ...YN_COL },
  { field: 'advisYn',      headerName: '자문사',       width: 80,  editable: true,  ...YN_COL },
  { field: 'pbsYn',        headerName: 'PBS',          width: 80,  editable: true,  ...YN_COL },
  { field: 'useYn',        headerName: '사용여부',     width: 85,  editable: true,  ...YN_COL },
  { field: 'note',         headerName: '비고',         flex: 1, minWidth: 200, editable: true },
]

// ─── ASIS Sys01_TabPage_Info02 컬럼 ─────────────────────────────────────────
// (decCorpRegNo·empInfo·officeFaxNo 미이관 필드 제외)
const info2ColDefs = [
  { field: 'startDate',    headerName: '설립일',        width: 110, editable: true, cellStyle: BLUE },
  { field: 'bizNo',        headerName: '사업자등록번호', width: 140, editable: true, cellStyle: BLUE },
  { field: 'mobileTelNo',  headerName: '비상전화',      width: 130, editable: true },
  { field: 'officeTelNo',  headerName: '대표전화',      width: 130, editable: true },
  { field: 'emailAddress', headerName: '이메일주소',    width: 200, editable: true },
  { field: 'zipCode',      headerName: '우편번호',      width: 90,  editable: true },
  { field: 'zipAddress',   headerName: '주소',          width: 280, editable: true },
  { field: 'zipDetail',    headerName: '상세주소',      flex: 1, minWidth: 150, editable: true },
]

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
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

  const listColumns = [
    { field: 'companyName',  headerName: '고객명',      width: 220, pinned: 'left' },
    { field: 'locationName', headerName: 'Sub-Domain',  width: 130 },
    { field: 'bizNo',        headerName: '사업자번호',   width: 130 },
    { field: 'contractType', headerName: '계약유형',     width: 100 },
    { field: 'useYn',        headerName: '사용',         width: 70,
      cellRenderer: (p: any) => p.value === 'Y' ? 'YES' : 'NO' },
    { field: 'startDate',    headerName: '설립일',       width: 100 },
    { field: 'officeTelNo',  headerName: '대표전화',     width: 120 },
    { field: 'note',         headerName: '비고',         flex: 1, minWidth: 200 },
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

      {/* Toolbar */}
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
        <span className="text-[10px] font-bold text-slate-400 pr-2">TOTAL: {list.length} 건</span>
      </div>

      {/* 상단 그리드 */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <BaseGrid
            rowData={list}
            columnDefs={listColumns}
            onRowSelected={rows => {
              const id = rows.length > 0 ? (rows[0] as any).companyId : null
              console.log('[Sys01] selected →', rows[0] ?? null, 'companyId:', id)
              setSelectedId(id)
            }}
            loading={isLoading}
            showFilter={false}
            rowHeight={28}
          />
        </div>
      </div>

      {/* 하단 탭 */}
      <div className="h-[280px] p-2 pt-0 shrink-0">
        <div className="h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* 탭 헤더 */}
          <div className="bg-slate-100 border-b border-slate-200 flex px-1 shrink-0 items-center justify-between">
            <div className="flex">
              <TabButton active={activeTab === 'info1'} onClick={() => setActiveTab('info1')} icon={<Info size={14} />}     label="관리정보" />
              <TabButton active={activeTab === 'info2'} onClick={() => setActiveTab('info2')} icon={<Building2 size={14} />} label="기본정보" />
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={14} />}     label="고객별 관리자" />
            </div>
            {selectedId !== null && (
              <button onClick={copyId} className="flex items-center gap-1 mr-3 px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-[10px] font-bold shadow-sm">
                <Copy size={11} /> ID 복사
              </button>
            )}
          </div>

          {/* 탭 바디 */}
          <div className="flex-1 min-h-0 relative">
            {selectedId === null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2">
                <Building2 size={36} className="opacity-20" />
                <p className="text-xs font-medium">상단 목록에서 고객사를 선택해 주세요.</p>
              </div>
            ) : (
              <div className="h-full">
                {activeTab === 'info1' && (
                  <CompanyInfoGrid
                    data={detail}
                    colDefs={info1ColDefs}
                    onSave={() => qc.invalidateQueries({ queryKey: ['sys01-companies'] })}
                  />
                )}
                {activeTab === 'info2' && (
                  <CompanyInfoGrid
                    data={detail}
                    colDefs={info2ColDefs}
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

// ─── 관리정보/기본정보 그리드 (1행 가로 그리드, ASIS와 동일 구조) ──────────────
function CompanyInfoGrid({
  data,
  colDefs,
  onSave,
}: {
  data?: CompanyDto
  colDefs: any[]
  onSave: () => void
}) {
  const qc = useQueryClient()
  const [row, setRow] = useState<CompanyDto | null>(null)

  useEffect(() => {
    if (!data) return
    console.log('[CompanyInfoGrid] data received:', data)
    setRow({ ...data })
  }, [data?.companyId])

  const saveMut = useMutation({
    mutationFn: () => sys01.update(row!.companyId!, row!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sys01-company', row?.companyId] })
      onSave()
      setStatusMessage('저장되었습니다.', 'success')
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end px-3 py-1.5 border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={() => row && saveMut.mutate()}
          disabled={saveMut.isPending || !row}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold shadow-sm disabled:opacity-50"
        >
          <Save size={13} /> 저장
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <BaseGrid
          rowData={row ? [row] : []}
          columnDefs={colDefs}
          showFilter={false}
          rowHeight={28}
          pagination={false}
          onCellValueChanged={e =>
            setRow(prev => prev ? { ...prev, [e.column.getColId()]: e.newValue } : prev)
          }
        />
      </div>
    </div>
  )
}

// ─── 고객별 관리자 그리드 (ASIS Sys02_Tab_User) ───────────────────────────────
// ASIS 컬럼: 사용자명·ID·PW·이메일·기타정보·전체권한 (telNo01·telNo02 미이관)
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

  const userColDefs = [
    { field: 'korNm',   headerName: '사용자명', width: 120, editable: true, cellStyle: BLUE },
    { field: 'loginId', headerName: 'ID',       width: 120, editable: true, cellStyle: BLUE },
    { field: 'passwd',  headerName: 'PW',       width: 120, editable: true,
      cellRenderer: (p: any) => p.value ? '••••••' : '' },
    { field: 'email',   headerName: '이메일',   width: 240, editable: true },
    { field: 'note',    headerName: '기타정보', flex: 1, minWidth: 200, editable: true },
    { field: 'adminYn', headerName: '전체권한', width: 100, editable: true, ...YN_COL },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 bg-white shrink-0">
        <button onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-xs font-bold shadow-sm">
          <Plus size={13} /> 등록
        </button>
        <button onClick={handleDelete} disabled={!selectedRow}
          className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 rounded text-xs font-bold shadow-sm disabled:opacity-40">
          <Trash2 size={13} /> 삭제
        </button>
        <button onClick={() => saveMut.mutate(rows)} disabled={saveMut.isPending}
          className="flex items-center gap-1.5 px-4 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold shadow-sm disabled:opacity-50 ml-auto">
          <Save size={13} /> 저장
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <BaseGrid
          rowData={rows}
          columnDefs={userColDefs}
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
