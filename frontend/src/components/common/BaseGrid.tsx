import React, { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  type ColDef,
  type GridReadyEvent,
  type GridOptions,
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
  colorSchemeDarkBlue,
} from 'ag-grid-community'

// Register modules
ModuleRegistry.registerModules([AllCommunityModule])

// Custom theme based on Alpine + OMS color palette
const omsTheme = themeAlpine.withPart(colorSchemeDarkBlue).withParams({
  accentColor: '#588157',
  headerBackgroundColor: '#3A5A40',
  headerTextColor: '#FFFFFF',
  rowHoverColor: '#F0F7F0',
  selectedRowBackgroundColor: '#D1E2D1',
  oddRowBackgroundColor: '#F9FBF9',
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
