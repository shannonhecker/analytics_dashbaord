import React from 'react';
import { NovaPanel, NovaChip } from '../components/shell.jsx';
import { NovaArea, NovaBar, NovaDonut } from '../components/charts.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { TickerBadgeCell, MoneyCell, DeltaCell, SparklineCell } from '../components/cell-renderers.jsx';
import { DATA, series } from '../data.js';

const PERF_COLS = [
  { field: 'name',   headerName: 'Portfolio', cellRenderer: TickerBadgeCell, cellRendererParams:{ subField:'ccy' }, flex: 2, minWidth: 240 },
  { field: 'ccy',    headerName: 'Ccy', maxWidth: 80 },
  { field: 'mv',     headerName: 'Market Value', cellRenderer: MoneyCell, cellRendererParams:{ decimals:1 }, type:'numericColumn', flex:1.2 },
  { field: 'pnl',    headerName: '1M', cellRenderer: DeltaCell, type:'numericColumn', maxWidth:100 },
  { field: 'ytd',    headerName: 'YTD', cellRenderer: DeltaCell, type:'numericColumn', maxWidth:100 },
  { field: 'ytdbm',  headerName: 'Benchmark', valueFormatter: p=>`${p.value.toFixed(2)}%`, type:'numericColumn', maxWidth:120 },
  { field: 'ytdx',   headerName: 'Excess', cellRenderer: DeltaCell, type:'numericColumn', maxWidth:100 },
  { field: 'spark',  headerName: '24M', cellRenderer: SparklineCell, sortable:false, filter:false, maxWidth:120 },
];

export function Performance() {
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(6, minmax(0, 1fr))', gap:12}}>
        <HeroKpi label="Total MV" value="$2.83B" delta={2.41} spark={series(20,100,2,101,0.5)} hero compact/>
        <HeroKpi label="MTD" value="+3.10%" delta={0.18} spark={series(20,100,1.5,102,0.3)} compact/>
        <HeroKpi label="YTD" value="+5.18%" delta={1.63} deltaLabel="pts" spark={series(20,100,2.2,103,0.8)} compact/>
        <HeroKpi label="Active" value="+2.13%" delta={-0.04} spark={series(20,100,0.8,104,0.2)} compact/>
        <HeroKpi label="Tracking" value="2.84%" delta={-0.12} spark={series(20,100,0.5,105,0)} compact/>
        <HeroKpi label="Sharpe" value="1.42" delta={0.09} deltaLabel="" spark={series(20,100,1.1,107,0.2)} compact/>
      </div>

      <NovaPanel title="Performance Results" subtitle="Net of Fees · Monthly · GBP" actions={<div style={{display:'flex', gap:4}}><NovaChip>Account</NovaChip><NovaChip active>Asset</NovaChip><NovaChip>Strategy</NovaChip></div>} padded={false}>
        <NovaGrid dataset="portfolios" columnDefs={PERF_COLS} height={420}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <NovaPanel title="Allocation History" subtitle="by Asset Class">
          <NovaArea series={DATA.allocationHistory.series} labels={DATA.allocationHistory.labels} height={260}/>
        </NovaPanel>
        <NovaPanel title="Allocation" subtitle="Current snapshot">
          <NovaDonut segments={[
            {label:'Equities',   value:40.8, color:'var(--c1)'},
            {label:'Corp Bonds', value:25.0, color:'var(--c2)'},
            {label:'Govt Bonds', value:12.2, color:'var(--c3)'},
            {label:'Other',      value:21.7, color:'var(--c6)'},
            {label:'Cash',       value:0.3,  color:'var(--c4)'},
          ]} centerLabel="$992K" centerSub="Total MV"/>
        </NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <NovaPanel title="Returns by Account" subtitle="vs MSCI World">
          <NovaBar groups={DATA.returnsByAccount.labels} series={DATA.returnsByAccount.data} compareLine={DATA.returnsByAccount.line} height={240}/>
        </NovaPanel>
        <NovaPanel title="Investment Trend" subtitle="vs Fund Index">
          <NovaBar groups={DATA.varTrend.labels} series={DATA.varTrend.series} compareLine={DATA.varTrend.line} height={240}/>
        </NovaPanel>
      </div>
    </div>
  );
}
