import React from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { NovaArea, NovaBar, nfmt } from '../components/charts.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { MoneyCell, HeatmapCell } from '../components/cell-renderers.jsx';
import { DATA, series } from '../data.js';

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
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12}}>
        <HeroKpi label="VaR 95%" value="$46.3M" delta={-0.12} spark={series(20,100,1.5,201,-0.1)} hero/>
        <HeroKpi label="VaR 99%" value="$54.2M" delta={0.34} spark={series(20,100,1.8,202,0.1)}/>
        <HeroKpi label="CVaR" value="$56.7M" delta={0.21} spark={series(20,100,2,203,0.15)}/>
        <HeroKpi label="Beta" value="1.08" delta={0.03} deltaLabel="" spark={series(20,100,0.8,204,0.05)}/>
        <HeroKpi label="Leverage" value="1.42×" delta={-0.02} deltaLabel="" spark={series(20,100,0.5,205,0)}/>
      </div>

      <NovaPanel title="Risk Summary" subtitle="Aggregate & fund-level breakdown" padded={false}>
        <NovaGrid dataset="riskSummary" columnDefs={RISK_COLS} height={340}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <NovaPanel title="Risk Contribution" subtitle="By risk type">
          <NovaBar groups={DATA.riskContribution.labels} series={DATA.riskContribution.data} height={250}/>
        </NovaPanel>
        <NovaPanel title="Top 10 Issuers" subtitle="By exposure">
          <NovaBar groups={DATA.topIssuers.labels} series={DATA.topIssuers.data} height={250}/>
        </NovaPanel>
      </div>

      <NovaPanel title="Value at Risk" subtitle="Time series, 24M">
        <NovaArea series={DATA.varHistory.series} labels={DATA.varHistory.labels} height={260}/>
      </NovaPanel>
    </div>
  );
}
