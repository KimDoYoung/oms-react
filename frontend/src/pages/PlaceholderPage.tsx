import React, { useMemo } from 'react'
import BaseGrid from '@/components/common/BaseGrid'
import type { ColDef } from 'ag-grid-community'

interface Props {
  screenNo?: string
  title?: string
}

export default function PlaceholderPage({ screenNo, title }: Props) {
  
  // Sample data for presentation
  const rowData = useMemo(() => [
    { id: 1, name: '삼성전자', code: '005930', type: '주식', price: 75000, change: '+1.2%', qty: 100 },
    { id: 2, name: 'SK하이닉스', code: '000660', type: '주식', price: 180000, change: '-0.5%', qty: 50 },
    { id: 3, name: '국고03250-2409', code: 'KR103502G9B0', type: '채권', price: 10050, change: '+0.01%', qty: 1000 },
    { id: 4, name: '현대차', code: '005380', type: '주식', price: 245000, change: '+2.1%', qty: 30 },
    { id: 5, name: 'LG에너지솔루션', code: '373220', type: '주식', price: 380000, change: '-1.4%', qty: 20 },
    { id: 6, name: 'MSFT US', code: 'MSFT', type: '해외주식', price: 420.5, change: '+0.8%', qty: 10 },
    { id: 7, name: 'AAPL US', code: 'AAPL', type: '해외주식', price: 190.2, change: '+1.1%', qty: 15 },
  ], [])

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'id', headerName: 'ID', width: 70, checkboxSelection: true, headerCheckboxSelection: true },
    { field: 'name', headerName: '종목명', flex: 2 },
    { field: 'code', headerName: '종목코드' },
    { field: 'type', headerName: '구분', width: 100 },
    { field: 'price', headerName: '현재가', type: 'numericColumn', valueFormatter: (p) => p.value?.toLocaleString() },
    { field: 'change', headerName: '등락률', cellStyle: (p) => ({ color: p.value?.includes('+') ? '#ef4444' : '#3b82f6' }) },
    { field: 'qty', headerName: '보유수량', type: 'numericColumn' },
  ], [])

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold text-gray-800">{title ?? '화면 준비 중'}</h2>
          {screenNo && <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">[{screenNo}]</span>}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-200 rounded shadow-sm text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">엑셀다운로드</button>
          <button className="px-3 py-1.5 bg-[#588157] text-white rounded shadow-sm text-xs font-semibold hover:bg-[#3A5A40] transition-colors">조회</button>
        </div>
      </div>
      
      {/* Search Bar Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">조회기간</label>
          <input type="date" className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#588157]" defaultValue="2024-04-20" />
          <span className="text-gray-300">~</span>
          <input type="date" className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#588157]" defaultValue="2024-04-20" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">검색어</label>
          <input type="text" className="text-xs border border-gray-200 rounded px-4 py-1 w-48 focus:outline-none focus:ring-1 focus:ring-[#588157]" placeholder="종목명 또는 코드..." />
        </div>
      </div>

      <div className="flex-1 shadow-inner border border-gray-200 rounded-lg overflow-hidden">
        <BaseGrid rowData={rowData} columnDefs={columnDefs} />
      </div>

      {/* Info bar */}
      <div className="mt-3 flex items-center justify-between px-2">
        <p className="text-[11px] text-gray-400 italic font-medium">※ AgGrid + FlexLayout 기반 OMS 화면 프로토타입</p>
        <p className="text-[11px] text-gray-400 font-bold">건수: {rowData.length}건</p>
      </div>
    </div>
  )
}
