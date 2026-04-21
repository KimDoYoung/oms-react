import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  type ColDef,
  type GridReadyEvent,
  type GridOptions,
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from 'ag-grid-community'

// Register modules
ModuleRegistry.registerModules([AllCommunityModule])

// Custom theme based on Alpine + neutral white/gray palette
const omsTheme = themeAlpine.withParams({
  accentColor: '#64748b',
  headerBackgroundColor: '#475569',
  headerTextColor: '#f8fafc',
  rowHoverColor: '#f1f5f9',
  selectedRowBackgroundColor: '#e2e8f0',
  oddRowBackgroundColor: '#f8fafc',
  backgroundColor: '#ffffff',
  foregroundColor: '#334155',
  borderColor: '#e2e8f0',
  fontFamily: 'inherit',
})

interface BaseGridProps<TData = unknown> {
  rowData?: TData[] | null
  columnDefs: ColDef<TData>[]
  onGridReady?: (event: GridReadyEvent<TData>) => void
  gridOptions?: GridOptions<TData>
  loading?: boolean
  height?: string | number
}

/**
 * OMS Common AgGrid Wrapper
 */
export default function BaseGrid<TData = unknown>({
  rowData,
  columnDefs,
  onGridReady,
  gridOptions,
  loading = false,
  height = '100%',
}: BaseGridProps<TData>) {
  
  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
  }), [])

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white">
      <div style={{ height }} className="flex-1 w-full">
        <AgGridReact
          theme={omsTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          gridOptions={gridOptions}
          loading={loading}
          // GXT-like basic behaviors
          rowSelection={{ mode: 'singleRow' }}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[20, 50, 100]}
          animateRows={true}
        />
      </div>
    </div>
  )
}
