import React from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HxGauge } from '../components/highcharts/HxGauge.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { MiniBarCell, HeatmapCell } from '../components/cell-renderers.jsx';
import { DATA } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';

const SECTOR_COLS = [
  { field: 'sector', headerName: 'GICS Sector', flex: 2, minWidth:200 },
  { field: 'weight', headerName: 'Weight', cellRenderer: MiniBarCell, cellRendererParams:{ max:0.25, color:'var(--c1)' }, type:'numericColumn', flex:1.5, minWidth:160 },
  { field: 'wk',     headerName: 'Key Issues', valueFormatter: p=>p.value.toFixed(2), type:'numericColumn', maxWidth:120 },
  { field: 'env',    headerName: 'E', cellRenderer: HeatmapCell, cellRendererParams:{ center:6.5, domain:[-5,4] }, type:'numericColumn', maxWidth:90 },
  { field: 'soc',    headerName: 'S', cellRenderer: HeatmapCell, cellRendererParams:{ center:6.5, domain:[-5,4] }, type:'numericColumn', maxWidth:90 },
  { field: 'gov',    headerName: 'G', cellRenderer: HeatmapCell, cellRendererParams:{ center:6.5, domain:[-5,4] }, type:'numericColumn', maxWidth:90 },
];

const PILLARS = [
  { letter:'E', name:'Environmental', value:4.21, color:'var(--c2)' },
  { letter:'S', name:'Social',        value:6.30, color:'var(--c1)' },
  { letter:'G', name:'Governance',    value:9.28, color:'var(--c3)' },
];

export function Esg() {
  const { isMobile, isTablet } = useViewport();
  const pillarCols = isMobile ? 1 : 3;
  const twoCol = isMobile || isTablet ? '1fr' : '1fr 1fr';

  return (
    <div style={{flex:1, overflow:'auto', padding:'var(--screen-pad)', display:'flex', flexDirection:'column', gap:'var(--gap-md)', width:'100%', maxWidth:1600, margin:'0 auto'}}>
      {/* Overall ESG headline — wide, large gauge, visually dominant */}
      <NovaPanel title="ESG Score" subtitle="Overall weighted score across holdings">
        <HxGauge value={5.50} max={10} label="ESG" color="var(--accent)" large ariaLabel="Overall ESG score 5.50 out of 10, weighted by holdings"/>
      </NovaPanel>

      {/* Pillars — collapsed into a single panel. Inline color dots act as the
          legend so E=cyan / S=purple / G=teal is self-evident. */}
      <NovaPanel title="ESG Pillars" subtitle="Environmental · Social · Governance">
        <div style={{display:'grid', gridTemplateColumns:`repeat(${pillarCols}, 1fr)`, gap:'var(--gap-md)'}}>
          {PILLARS.map(p => (
            <div key={p.letter} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
              <HxGauge value={p.value} max={10} label={p.letter} color={p.color} compact ariaLabel={`${p.name} pillar score ${p.value.toFixed(2)} out of 10`}/>
              <div style={{display:'inline-flex', alignItems:'center', gap:8, fontSize:'var(--fs-sm)', color:'var(--ink-2)', fontWeight:500}}>
                <span aria-hidden="true" style={{width:8, height:8, borderRadius:'50%', background:p.color}}/>
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </NovaPanel>

      <NovaPanel title="Sector Breakdown" subtitle="Weighted key issues by GICS sector" padded={false} subtle>
        <NovaGrid dataset="sectorBreakdown" columnDefs={SECTOR_COLS} height={CHART_HEIGHT.xl + 40}/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:twoCol, gap:'var(--gap-md)'}}>
        <NovaPanel title="ESG Trend" subtitle="Quarterly">
          <HxBar groups={DATA.esgTrend.labels} series={DATA.esgTrend.bars} compareLine={DATA.esgTrend.line} height={CHART_HEIGHT.md}/>
        </NovaPanel>
        <NovaPanel title="Climate Alignment" subtitle="Portfolio weight by bucket">
          <HxBar groups={['1.5°C','<2°C','>2°C','>4°C','N/R']} series={[{name:'Weight', data:[8,42,20,18,12], color:'var(--c2)'}]} height={CHART_HEIGHT.md} showLegend={false}/>
        </NovaPanel>
      </div>
    </div>
  );
}
