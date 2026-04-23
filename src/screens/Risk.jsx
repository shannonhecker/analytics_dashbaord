import React, { useState, useMemo } from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { HxArea } from '../components/highcharts/HxArea.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { MoneyCell, HeatmapCell } from '../components/cell-renderers.jsx';
import { DATA, series } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';
import { usePortfolio, useSparks } from '../live.jsx';

const RISK_COLS = [
  { field: 'view',   headerName: 'View', flex:1.2, minWidth:140 },
  { field: 'mv',     headerName: 'PV', cellRenderer: MoneyCell, type:'numericColumn' },
  { field: 'var95',  headerName: 'VaR 95%', cellRenderer: MoneyCell, type:'numericColumn' },
  { field: 'var95p', headerName: 'VaR 95% %', cellRenderer: HeatmapCell, cellRendererParams:{ center:3, domain:[-5,5] }, type:'numericColumn', maxWidth:120 },
  { field: 'var99',  headerName: 'VaR 99%', cellRenderer: MoneyCell, type:'numericColumn' },
  { field: 'var99p', headerName: 'VaR 99% %', cellRenderer: HeatmapCell, cellRendererParams:{ center:3, domain:[-5,5] }, type:'numericColumn', maxWidth:120 },
  { field: 'cvar',   headerName: 'CVaR', cellRenderer: MoneyCell, type:'numericColumn' },
  { field: 'cvarp',  headerName: 'CVaR %', cellRenderer: HeatmapCell, cellRendererParams:{ center:5, domain:[-5,5] }, type:'numericColumn', maxWidth:120 },
];

// Click-to-sort map — KPI tile id → grid column. Beta + Leverage aren't
// on riskSummary rows, so those tiles stay display-only.
const KPI_SORT_MAP = {
  var95: 'var95',
  var99: 'var99',
  cvar:  'cvar',
};

export function Risk() {
  const { isMobile, isTablet } = useViewport();
  const PORTFOLIO = usePortfolio();
  const sparks = useSparks();
  const kpiCols = isMobile ? 2 : isTablet ? 3 : 5;
  const twoCol = isMobile || isTablet ? '1fr' : '1fr 1fr';

  // VaR 95% is the headline institutional risk metric — selected by default
  // so the band reads with a clear anchor on first render.
  const [selectedKpi, setSelectedKpi] = useState('var95');
  const sortModel = useMemo(() => {
    const colId = KPI_SORT_MAP[selectedKpi];
    return colId ? [{ colId, sort: 'desc' }] : [];
  }, [selectedKpi]);
  const pick = (id) => () => setSelectedKpi(id);

  return (
    <div style={{flex:1, overflow:'auto', padding:'var(--screen-pad)', display:'flex', flexDirection:'column', gap:'var(--gap-md)', width:'100%', maxWidth:1600, margin:'0 auto'}}>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${kpiCols}, 1fr)`, gap:'var(--gap-sm)'}}>
        <HeroKpi label="VaR 95%"  value={PORTFOLIO.var95Display}                                            delta={-0.12} spark={sparks?.var95    ?? series(20,100,1.5,201,-0.1)} selected={selectedKpi==='var95'}  onClick={pick('var95')}/>
        <HeroKpi label="VaR 99%"  value={PORTFOLIO.var99Display    ?? `$${(PORTFOLIO.var99/1_000_000).toFixed(1)}M`} delta={0.34}  spark={sparks?.var99    ?? series(20,100,1.8,202,0.1)}  selected={selectedKpi==='var99'}  onClick={pick('var99')}/>
        <HeroKpi label="CVaR"     value={PORTFOLIO.cvarDisplay}                                             delta={0.21}  spark={sparks?.cvar     ?? series(20,100,2,203,0.15)}  selected={selectedKpi==='cvar'}   onClick={pick('cvar')}/>
        <HeroKpi label="Beta"     value={PORTFOLIO.betaDisplay     ?? PORTFOLIO.beta.toFixed(2)}            delta={0.03}  deltaSuffix="" spark={sparks?.beta     ?? series(20,100,0.8,204,0.05)}/>
        <HeroKpi label="Leverage" value={PORTFOLIO.leverageDisplay ?? `${PORTFOLIO.leverage.toFixed(2)}×`}  delta={-0.02} deltaSuffix="" spark={sparks?.leverage ?? series(20,100,0.5,205,0)}/>
      </div>

      <NovaPanel title="Risk Summary" subtitle="Aggregate & fund-level breakdown" padded={false} subtle>
        <NovaGrid dataset="riskSummary" columnDefs={RISK_COLS} height={CHART_HEIGHT.lg + 80} sortModel={sortModel}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:twoCol, gap:'var(--gap-md)'}}>
        <NovaPanel title="Risk Contribution" subtitle="By risk type">
          <HxBar groups={DATA.riskContribution.labels} series={DATA.riskContribution.data} height={CHART_HEIGHT.md}/>
        </NovaPanel>
        <NovaPanel title="Top 10 Issuers" subtitle="By exposure">
          <HxBar groups={DATA.topIssuers.labels} series={DATA.topIssuers.data} height={CHART_HEIGHT.md}/>
        </NovaPanel>
      </div>

      <NovaPanel title="Value at Risk" subtitle="Time series, 24M">
        <HxArea series={DATA.varHistory.series} labels={DATA.varHistory.labels} height={CHART_HEIGHT.lg}/>
      </NovaPanel>
    </div>
  );
}
