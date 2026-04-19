import React from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { NovaBar, NovaGauge } from '../components/charts.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { MiniBarCell, HeatmapCell } from '../components/cell-renderers.jsx';
import { DATA } from '../data.js';

const SECTOR_COLS = [
  { field: 'sector', headerName: 'GICS Sector', flex: 2, minWidth:200 },
  { field: 'weight', headerName: 'Weight', cellRenderer: MiniBarCell, cellRendererParams:{ max:0.25, color:'var(--c1)' }, type:'numericColumn', flex:1.5, minWidth:160 },
  { field: 'wk',     headerName: 'Key Issues', valueFormatter: p=>p.value.toFixed(2), type:'numericColumn', maxWidth:120 },
  { field: 'env',    headerName: 'E', cellRenderer: HeatmapCell, cellRendererParams:{ center:6.5, domain:[-5,4] }, type:'numericColumn', maxWidth:90 },
  { field: 'soc',    headerName: 'S', cellRenderer: HeatmapCell, cellRendererParams:{ center:6.5, domain:[-5,4] }, type:'numericColumn', maxWidth:90 },
  { field: 'gov',    headerName: 'G', cellRenderer: HeatmapCell, cellRendererParams:{ center:6.5, domain:[-5,4] }, type:'numericColumn', maxWidth:90 },
];

export function Esg() {
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
        <NovaPanel title="ESG Score" subtitle="Weighted"><NovaGauge value={5.50} max={10} label="ESG" color="var(--accent)"/></NovaPanel>
        <NovaPanel title="Environmental" subtitle="Pillar"><NovaGauge value={4.21} max={10} label="E" color="var(--c2)"/></NovaPanel>
        <NovaPanel title="Social" subtitle="Pillar"><NovaGauge value={6.30} max={10} label="S" color="var(--c1)"/></NovaPanel>
        <NovaPanel title="Governance" subtitle="Pillar"><NovaGauge value={9.28} max={10} label="G" color="var(--c3)"/></NovaPanel>
      </div>

      <NovaPanel title="Sector Breakdown" subtitle="Weighted key issues by GICS sector" padded={false}>
        <NovaGrid dataset="sectorBreakdown" columnDefs={SECTOR_COLS} height={460}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <NovaPanel title="ESG Trend" subtitle="Quarterly">
          <NovaBar groups={DATA.esgTrend.labels} series={DATA.esgTrend.bars} compareLine={DATA.esgTrend.line} height={240}/>
        </NovaPanel>
        <NovaPanel title="Climate Alignment" subtitle="Portfolio weight by bucket">
          <NovaBar groups={['1.5°C','<2°C','>2°C','>4°C','N/R']} series={[{name:'Weight', data:[8,42,20,18,12], color:'var(--c2)'}]} height={240} showLegend={false}/>
        </NovaPanel>
      </div>
    </div>
  );
}
