// NovaGrid — AG Grid wrapper with side panel + Carbon theme + SSRM datasource.
// Supports both client-side (rowData prop) and server-side (dataset prop) row models.
// Tracks loading + error + empty states and renders branded overlays.
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { PanelSkeleton, PanelError, PanelEmpty, EMPTY_COPY } from './panel-states.jsx';
import { useViewport } from '../hooks/use-viewport.js';

// Register all modules. License intentionally omitted — eval mode (watermarked).
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Build a server-side datasource that talks to /api/grid/:dataset.
// Reports status to React via onStatus callback: 'loading' | 'ready' | 'empty' | 'error'.
function buildSSRMDatasource(dataset, onStatus) {
  return {
    getRows: async (params) => {
      onStatus?.('loading');
      try {
        const res = await fetch(`/api/grid/${dataset}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params.request),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { rows, lastRow } = await res.json();
        params.success({ rowData: rows, rowCount: lastRow });
        // Only report 'empty' on the first block when no rows come back.
        if (params.request.startRow === 0 && (!rows || rows.length === 0)) {
          onStatus?.('empty');
        } else {
          onStatus?.('ready');
        }
      } catch (err) {
        console.error(`[NovaGrid] /api/grid/${dataset} failed:`, err);
        onStatus?.('error');
        params.fail();
      }
    },
  };
}

export const DEFAULT_SIDEBAR = {
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
  // Hide the three-dot menu icon unless the header is hovered/focused —
  // premium grids don't show chrome on every column all the time.
  suppressHeaderMenuButton: false,
  suppressHeaderContextMenu: false,
  menuTabs: ['generalMenuTab', 'filterMenuTab', 'columnsMenuTab'],
};

// Row + header heights match the ag-grid-theme.css density scale:
// compact 36 / standard 52 / comfortable 64 — retail-finance breathing room.
// These are passed as explicit props to AgGridReact, so they MUST stay in
// sync with --ag-grid-size in ag-grid-theme.css or CSS gets overridden.
const DENSITY_ROW_HEIGHT  = { compact: 36, standard: 52, comfortable: 64 };
const DENSITY_HEADER      = { compact: 34, standard: 48, comfortable: 56 };

// Render a single row as a stacked card. First column becomes the card title
// (usually the entity name); remaining columns become label/value rows.
// Cell renderers still run so sparklines/delta arrows/chips work on mobile.
function MobileCard({ row, columnDefs, onClick }) {
  const [primary, ...rest] = columnDefs;
  const primaryValue = row[primary?.field];
  const PrimaryRenderer = primary?.cellRenderer;
  const Root = onClick ? 'button' : 'div';

  return (
    <Root
      onClick={onClick}
      style={{
        display:'flex', flexDirection:'column', gap:8,
        padding:'12px 14px',
        background:'var(--bg-elev)', border:'1px solid var(--line)',
        borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-sm)',
        textAlign:'left', width:'100%', cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{minHeight:28}}>
        {PrimaryRenderer
          ? <PrimaryRenderer value={primaryValue} data={row} colDef={primary}/>
          : <span style={{fontSize:'var(--fs-md)', fontWeight:600, color:'var(--ink)'}}>{String(primaryValue ?? '—')}</span>}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 12px', paddingTop:8, borderTop:'1px solid var(--line-faint)'}}>
        {rest.map((col) => {
          const val = row[col.field];
          const R = col.cellRenderer;
          const Formatted = col.valueFormatter
            ? col.valueFormatter({ value: val })
            : String(val ?? '—');
          return (
            <div key={col.field} style={{display:'flex', flexDirection:'column', gap:2, minWidth:0}}>
              <span style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600}}>{col.headerName || col.field}</span>
              <div style={{fontSize:'var(--fs-sm)', color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {R ? <R value={val} data={row} colDef={col} valueFormatted={Formatted}/> : Formatted}
              </div>
            </div>
          );
        })}
      </div>
    </Root>
  );
}

export function NovaGrid({
  dataset,
  rowData,
  columnDefs,
  height = 480,
  rowHeight,
  headerHeight,
  density = 'standard',
  quickFilter: enableQuickFilter = false,
  quickFilterPlaceholder = 'Search rows…',
  pagination = false,
  pageSize = 50,
  defaultColDef: userDefault,
  sideBar: userSideBar,
  rowSelection = 'single',
  onRowClicked,
  // Controlled sort from the outside — e.g., a KPI tile click setting the
  // grid's sort. Format matches AG Grid's column state:
  //   [{ colId: 'mv', sort: 'desc' }]
  // Applied on grid-ready and whenever the prop reference changes.
  sortModel,
  ...rest
}) {
  const gridRef = useRef(null);
  const { isMobile } = useViewport();
  const [quickFilterText, setQuickFilterText] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | empty | error
  const [retryKey, setRetryKey] = useState(0);
  const [mobileRows, setMobileRows] = useState(null);

  const defaultColDef = useMemo(
    () => ({ ...DEFAULT_COL_DEF, ...(userDefault || {}) }),
    [userDefault]
  );
  // Side bar is OFF by default — it reads as over-engineered on a
  // read-mostly dashboard. Opt in per grid with `sideBar={DEFAULT_SIDEBAR}`
  // or a custom config when column-picker / filter-builder UI is needed.
  const sideBar = useMemo(() => userSideBar ?? false, [userSideBar]);

  const resolvedRowHeight    = rowHeight    ?? DENSITY_ROW_HEIGHT[density]  ?? DENSITY_ROW_HEIGHT.standard;
  const resolvedHeaderHeight = headerHeight ?? DENSITY_HEADER[density]      ?? DENSITY_HEADER.standard;

  // Server-side row model when dataset is provided
  const useSSRM = Boolean(dataset);
  const datasource = useMemo(
    () => (useSSRM ? buildSSRMDatasource(dataset, setStatus) : null),
    // retryKey forces a new datasource instance, which re-triggers getRows
    [dataset, useSSRM, retryKey]
  );

  // Client-side data doesn't use our SSRM status tracking — treat as ready.
  useEffect(() => {
    if (!useSSRM) setStatus(rowData && rowData.length === 0 ? 'empty' : 'ready');
  }, [useSSRM, rowData]);

  const onGridReady = useCallback(
    (params) => {
      if (useSSRM) {
        params.api.setGridOption('serverSideDatasource', datasource);
      }
      if (sortModel && sortModel.length) {
        params.api.applyColumnState({
          state: sortModel.map((s) => ({ colId: s.colId, sort: s.sort })),
          defaultState: { sort: null },
        });
      }
    },
    [useSSRM, datasource, sortModel]
  );

  // Apply sortModel changes after mount (prop reference changes → re-sort).
  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    if (sortModel && sortModel.length) {
      api.applyColumnState({
        state: sortModel.map((s) => ({ colId: s.colId, sort: s.sort })),
        defaultState: { sort: null },
      });
    }
  }, [sortModel]);

  const handleRetry = useCallback(() => {
    setStatus('loading');
    setRetryKey((k) => k + 1);
  }, []);

  // Mobile card-view: fetch data ourselves (AG Grid is bypassed entirely).
  // Fetches first 50 rows; use Performance-side pagination if needed later.
  useEffect(() => {
    if (!isMobile || !useSSRM) return;
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/grid/${dataset}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startRow: 0, endRow: 50 }),
    })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(({ rows }) => {
        if (cancelled) return;
        setMobileRows(rows || []);
        setStatus((rows && rows.length) ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`[NovaGrid mobile] /api/grid/${dataset} failed:`, err);
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, [isMobile, useSSRM, dataset, retryKey]);

  // Client-side mobile: use rowData directly
  useEffect(() => {
    if (isMobile && !useSSRM) {
      setMobileRows(rowData || []);
      setStatus(rowData && rowData.length ? 'ready' : 'empty');
    }
  }, [isMobile, useSSRM, rowData]);

  const emptyCopy = EMPTY_COPY[dataset] || {
    title: 'No data',
    helper: 'Nothing to display in the current view.',
  };

  // Overlay state takes the full grid height so the user never sees a flash
  // of AG Grid's default "No Rows" message.
  if (status === 'error') {
    return <div style={{width:'100%', height: isMobile ? 'auto' : height, minHeight:120}}><PanelError message="Failed to load data" onRetry={handleRetry}/></div>;
  }
  if (status === 'empty') {
    return <div style={{width:'100%', height: isMobile ? 'auto' : height, minHeight:180}}><PanelEmpty {...emptyCopy}/></div>;
  }

  // Mobile: render each row as a stacked card, bypass AG Grid entirely.
  if (isMobile) {
    if (status === 'loading' || !mobileRows) {
      return (
        <div style={{padding:'16px 12px'}}>
          <PanelSkeleton rows={6}/>
        </div>
      );
    }
    return (
      <div style={{display:'flex', flexDirection:'column', gap:8, padding:'8px 4px'}}>
        {mobileRows.map((row, i) => (
          <MobileCard
            key={row.id ?? i}
            row={row}
            columnDefs={columnDefs}
            onClick={onRowClicked ? () => onRowClicked({ data: row }) : undefined}
          />
        ))}
      </div>
    );
  }

  const grid = (
    <div
      className={`ag-theme-quartz nova-grid${enableQuickFilter ? ' nova-grid-with-quickfilter' : ''}`}
      data-density={density}
      style={{ width: '100%', height, position:'relative' }}
    >
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        sideBar={sideBar}
        rowHeight={resolvedRowHeight}
        headerHeight={resolvedHeaderHeight}
        rowSelection={rowSelection}
        onRowClicked={onRowClicked}
        onGridReady={onGridReady}
        pagination={pagination}
        paginationPageSize={pageSize}
        animateRows={true}
        suppressCellFocus={true}
        quickFilterText={enableQuickFilter ? quickFilterText : undefined}
        {...(useSSRM
          ? { rowModelType: 'serverSide', cacheBlockSize: 50 }
          : { rowModelType: 'clientSide', rowData })}
        {...rest}
      />
      {status === 'loading' && (
        <div style={{position:'absolute', inset:0, background:'var(--bg-elev)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 40px'}}>
          <div style={{width:'100%', maxWidth:480}}><PanelSkeleton rows={6}/></div>
        </div>
      )}
    </div>
  );

  if (!enableQuickFilter) return grid;

  return (
    <div style={{ width: '100%' }}>
      <div className="nova-grid-quickfilter">
        <span className="nova-grid-quickfilter-icon">⌕</span>
        <input
          type="text"
          placeholder={quickFilterPlaceholder}
          aria-label={quickFilterPlaceholder || 'Filter rows'}
          value={quickFilterText}
          onChange={(e) => setQuickFilterText(e.target.value)}
        />
        {quickFilterText && (
          <span className="nova-grid-quickfilter-count">filtering · ESC to clear</span>
        )}
      </div>
      {grid}
    </div>
  );
}
