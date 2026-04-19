// NovaGrid — AG Grid wrapper with side panel + Carbon theme + SSRM datasource.
// Supports both client-side (rowData prop) and server-side (dataset prop) row models.
import React, { useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';

// Register all modules. License intentionally omitted — eval mode (watermarked).
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Build a server-side datasource that talks to /api/grid/:dataset.
function buildSSRMDatasource(dataset) {
  return {
    getRows: async (params) => {
      try {
        const res = await fetch(`/api/grid/${dataset}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params.request),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { rows, lastRow } = await res.json();
        params.success({ rowData: rows, rowCount: lastRow });
      } catch (err) {
        console.error(`[NovaGrid] /api/grid/${dataset} failed:`, err);
        params.fail();
      }
    },
  };
}

const DEFAULT_SIDEBAR = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressRowGroups: false,
        suppressValues: false,
        suppressPivots: false,
        suppressPivotMode: false,
        suppressColumnFilter: false,
        suppressColumnSelectAll: false,
        suppressColumnExpandAll: false,
      },
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
    },
  ],
  defaultToolPanel: undefined, // collapsed by default
};

const DEFAULT_COL_DEF = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  sortable: true,
  filter: true,
  enableRowGroup: true,
  enableValue: true,
  enablePivot: true,
};

export function NovaGrid({
  dataset,
  rowData,
  columnDefs,
  height = 480,
  rowHeight = 44,
  headerHeight = 36,
  pagination = false,
  pageSize = 50,
  defaultColDef: userDefault,
  sideBar: userSideBar,
  rowSelection = 'single',
  onRowClicked,
  ...rest
}) {
  const gridRef = useRef(null);

  const defaultColDef = useMemo(
    () => ({ ...DEFAULT_COL_DEF, ...(userDefault || {}) }),
    [userDefault]
  );
  const sideBar = useMemo(() => userSideBar ?? DEFAULT_SIDEBAR, [userSideBar]);

  // Server-side row model when dataset is provided
  const useSSRM = Boolean(dataset);
  const datasource = useMemo(
    () => (useSSRM ? buildSSRMDatasource(dataset) : null),
    [dataset, useSSRM]
  );

  const onGridReady = useCallback(
    (params) => {
      if (useSSRM) {
        params.api.setGridOption('serverSideDatasource', datasource);
      }
    },
    [useSSRM, datasource]
  );

  return (
    <div className="ag-theme-quartz nova-grid" style={{ width: '100%', height }}>
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        sideBar={sideBar}
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        rowSelection={rowSelection}
        onRowClicked={onRowClicked}
        onGridReady={onGridReady}
        pagination={pagination}
        paginationPageSize={pageSize}
        animateRows={true}
        suppressCellFocus={true}
        {...(useSSRM
          ? { rowModelType: 'serverSide', cacheBlockSize: 50 }
          : { rowModelType: 'clientSide', rowData })}
        {...rest}
      />
    </div>
  );
}
