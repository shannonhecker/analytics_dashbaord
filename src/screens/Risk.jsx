import React from 'react';
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

export function Risk() {
  const { isMobile, isTablet } = useViewport();
  const PORTFOLIO = usePortfolio();
  const sparks = useSparks();
  const kpiCols = isMobile ? 2 : isTablet ? 3 : 5;
  const twoCol = isMobile || isTablet ? '1fr' : '1fr 1fr';

  return (
    <div style={{flex:1, overflow:'auto', padding:'clamp(16px, 2.5vw, 24px)', display:'flex', flexDirection:'column', gap:16, width:'100%', maxWidth:1600, margin:'0 auto'}}>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${kpiCols}, 1fr)`, gap:12}}>
        <HeroKpi label="VaR 95%"  value={PORTFOLIO.var95Display}                                            delta={-0.12} spark={sparks?.var95    ?? series(20,100,1.5,201,-0.1)}/>
        <HeroKpi label="VaR 99%"  value={PORTFOLIO.var99Display    ?? `$${(PORTFOLIO.var99/1_000_000).toFixed(1)}M`} delta={0.34}  spark={sparks?.var99    ?? series(20,100,1.8,202,0.1)}/>
        <HeroKpi label="CVaR"     value={PORTFOLIO.cvarDisplay}                                             delta={0.21}  spark={sparks?.cvar     ?? series(20,100,2,203,0.15)}/>
        <HeroKpi label="Beta"     value={PORTFOLIO.betaDisplay     ?? PORTFOLIO.beta.toFixed(2)}            delta={0.03}  deltaLabel="" spark={sparks?.beta     ?? series(20,100,0.8,204,0.05)}/>
        <HeroKpi label="Leverage" value={PORTFOLIO.leverageDisplay ?? `${PORTFOLIO.leverage.toFixed(2)}×`}  delta={-0.02} deltaLabel="" spark={sparks?.leverage ?? series(20,100,0.5,205,0)}/>
      </div>

      <NovaPanel title="Risk Summary" subtitle="Aggregate & fund-level breakdown" padded={false} subtle>
        <NovaGrid dataset="riskSummary" columnDefs={RISK_COLS} height={CHART_HEIGHT.lg + 80}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:twoCol, gap:16}}>
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
