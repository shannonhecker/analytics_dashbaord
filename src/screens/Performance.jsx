import React, { useState, useMemo } from 'react';
import { NovaPanel, NovaChip } from '../components/shell.jsx';
import { HxArea } from '../components/highcharts/HxArea.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HxDonut } from '../components/highcharts/HxDonut.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { TickerBadgeCell, MoneyCell, DeltaCell, SparklineCell } from '../components/cell-renderers.jsx';
import { DATA, series } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';
import { usePortfolio, useSparks } from '../live.jsx';

const PERF_COLS = [
  { field: 'name',   headerName: 'Portfolio', cellRenderer: TickerBadgeCell, cellRendererParams:{ subField:'ccy' }, flex: 2, minWidth: 240 },
  { field: 'ccy',    headerName: 'Ccy', maxWidth: 80 },
  { field: 'mv',     headerName: 'Market Value', cellRenderer: MoneyCell, cellRendererParams:{ decimals:1, showCcy:true }, type:'numericColumn', flex:1.2 },
  { field: 'pnl',    headerName: '1M', cellRenderer: DeltaCell, type:'numericColumn', maxWidth:100 },
  { field: 'ytd',    headerName: 'YTD', cellRenderer: DeltaCell, type:'numericColumn', maxWidth:100 },
  { field: 'ytdbm',  headerName: 'Benchmark', valueFormatter: p=>`${p.value.toFixed(2)}%`, type:'numericColumn', maxWidth:120 },
  { field: 'ytdx',   headerName: 'Excess', cellRenderer: DeltaCell, type:'numericColumn', maxWidth:100 },
  { field: 'spark',  headerName: '24M', cellRenderer: SparklineCell, sortable:false, filter:false, maxWidth:120 },
];

// Click-to-sort map — KPI tile id → grid column. Tiles without a column
// mapping are display-only (Tracking + Sharpe aren't on the portfolio rows).
const KPI_SORT_MAP = {
  totalMv: 'mv',
  mtd:     'pnl',
  ytd:     'ytd',
  active:  'ytdx',
};

export function Performance() {
  const { isMobile, isTablet } = useViewport();
  const PORTFOLIO = usePortfolio();
  const sparks = useSparks();
  const kpiCols = isMobile ? 2 : isTablet ? 3 : 6;
  const twoCol = isMobile || isTablet ? '1fr' : '1fr 1fr';
  const wide = isMobile || isTablet ? '1fr' : '2fr 1fr';

  // Which KPI tile is currently driving the grid sort. Total MV is the
  // default — matches the visual hero state on first render.
  const [selectedKpi, setSelectedKpi] = useState('totalMv');
  const sortModel = useMemo(() => {
    const colId = KPI_SORT_MAP[selectedKpi];
    return colId ? [{ colId, sort: 'desc' }] : [];
  }, [selectedKpi]);
  const pick = (id) => () => setSelectedKpi(id);

  return (
    <div style={{flex:1, overflow:'auto', padding:'var(--screen-pad)', display:'flex', flexDirection:'column', gap:'var(--gap-md)', width:'100%', maxWidth:1600, margin:'0 auto'}}>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${kpiCols}, minmax(0, 1fr))`, gap:'var(--gap-sm)'}}>
        <HeroKpi label="Total MV" value={PORTFOLIO.totalMvDisplay}                                          delta={2.41}  spark={sparks?.totalMv      ?? series(20,100,2,101,0.5)}    compact selected={selectedKpi==='totalMv'} onClick={pick('totalMv')}/>
        <HeroKpi label="MTD"      value={PORTFOLIO.mtdReturnDisplay    ?? `+${PORTFOLIO.mtdReturn.toFixed(2)}%`}    delta={0.18}  spark={sparks?.mtdReturn    ?? series(20,100,1.5,102,0.3)} compact selected={selectedKpi==='mtd'}     onClick={pick('mtd')}/>
        <HeroKpi label="YTD"      value={PORTFOLIO.ytdReturnDisplay}                                        delta={1.63}  deltaSuffix="pts" spark={sparks?.ytdReturn    ?? series(20,100,2.2,103,0.8)} compact selected={selectedKpi==='ytd'}     onClick={pick('ytd')}/>
        <HeroKpi label="Active"   value={PORTFOLIO.activeReturnDisplay ?? `+${PORTFOLIO.activeReturn.toFixed(2)}%`} delta={-0.04} spark={sparks?.activeReturn ?? series(20,100,0.8,104,0.2)} compact selected={selectedKpi==='active'}  onClick={pick('active')}/>
        <HeroKpi label="Tracking" value={`${PORTFOLIO.trackingErr.toFixed(2)}%`}                            delta={-0.12} spark={series(20,100,0.5,105,0)} compact/>
        <HeroKpi label="Sharpe"   value={PORTFOLIO.sharpeDisplay       ?? PORTFOLIO.sharpe.toFixed(2)}              delta={0.09}  deltaSuffix="" spark={sparks?.sharpe       ?? series(20,100,1.1,107,0.2)} compact/>
      </div>

      <NovaPanel title="Performance Results" subtitle="Net of Fees · Monthly · GBP" actions={<div style={{display:'flex', gap:4}}><NovaChip>Account</NovaChip><NovaChip active>Asset</NovaChip><NovaChip>Strategy</NovaChip></div>} padded={false} subtle>
        <NovaGrid dataset="portfolios" columnDefs={PERF_COLS} height={CHART_HEIGHT.xl} sortModel={sortModel}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:wide, gap:'var(--gap-md)'}}>
        <NovaPanel title="Allocation History" subtitle="by Asset Class">
          <HxArea series={DATA.allocationHistory.series} labels={DATA.allocationHistory.labels} height={CHART_HEIGHT.lg}/>
        </NovaPanel>
        <NovaPanel title="Allocation" subtitle="Current snapshot">
          <HxDonut segments={DATA.allocation.map(a => ({label:a.cls, value:a.actual, color:a.color}))}/>
        </NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:twoCol, gap:'var(--gap-md)'}}>
        <NovaPanel title="Returns by Account" subtitle="vs MSCI World">
          <HxBar groups={DATA.returnsByAccount.labels} series={DATA.returnsByAccount.data} compareLine={DATA.returnsByAccount.line} height={CHART_HEIGHT.md}/>
        </NovaPanel>
        <NovaPanel title="Investment Trend" subtitle="vs Fund Index">
          <HxBar groups={DATA.varTrend.labels} series={DATA.varTrend.series} compareLine={DATA.varTrend.line} height={CHART_HEIGHT.md}/>
        </NovaPanel>
      </div>
    </div>
  );
}
