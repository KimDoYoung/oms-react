import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  type ColDef,
  type GridReadyEvent,
  type GridOptions,
  type CellValueChangedEvent,
  type RowClickedEvent,
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from 'ag-grid-community'

// Register modules
ModuleRegistry.registerModules([AllCommunityModule])

// Custom theme based on Alpine + neutral white/gray palette
const omsTheme = themeAlpine.withParams({
  accentColor: '#3b82f6',
  headerBackgroundColor: '#475569',
  headerTextColor: '#f8fafc',
  rowHoverColor: '#f1f5f9',
  selectedRowBackgroundColor: '#bfdbfe',
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
  onRowSelected?: (rows: TData[]) => void
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void
  gridOptions?: GridOptions<TData>
  loading?: boolean
  height?: string | number
  rowHeight?: number
  showFilter?: boolean
}

/**
 * OMS Common AgGrid Wrapper
 */
export default function BaseGrid<TData = unknown>({
  rowData,
  columnDefs,
  onGridReady,
  onRowSelected,
  onCellValueChanged,
  gridOptions,
  loading = false,
  height = '100%',
  rowHeight,
  showFilter = true,
}: BaseGridProps<TData>) {

  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: showFilter,
    floatingFilter: showFilter,
  }), [showFilter])

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
          rowHeight={rowHeight}
          onRowClicked={(e: RowClickedEvent<TData>) => {
            if (e.data) {
              e.api.deselectAll()
              e.node.setSelected(true)
              onRowSelected?.([e.data])
            }
          }}
          onCellValueChanged={onCellValueChanged}
          rowSelection={{ mode: 'singleRow', enableClickSelection: true }}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[20, 50, 100]}
          animateRows={true}
        />
      </div>
    </div>
  )
}
