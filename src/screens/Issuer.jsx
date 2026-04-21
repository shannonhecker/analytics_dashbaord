import React from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HxGauge } from '../components/highcharts/HxGauge.jsx';
import { PillarRow } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { Flag } from '../components/flags.jsx';
import { DATA } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';

const PEER_COLS = [
  { field: 'name',  headerName: 'Entity', flex:2, minWidth:180,
    cellStyle: p => p.data?.self ? { fontWeight:600, color:'var(--accent)' } : null
  },
  { field: 'score', headerName: 'ESG', type:'numericColumn', maxWidth:100 },
  { field: 'e',     headerName: 'E', type:'numericColumn', maxWidth:80 },
  { field: 's',     headerName: 'S', type:'numericColumn', maxWidth:80 },
  { field: 'g',     headerName: 'G', type:'numericColumn', maxWidth:80 },
];

export function Issuer() {
  const d = DATA.issuer;
  const { isMobile, isTablet } = useViewport();
  const panelCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';
  const wideCols = isMobile || isTablet ? '1fr' : '2fr 1fr';

  return (
    <div style={{flex:1, overflow:'auto', padding:'clamp(16px, 2.5vw, 24px)', display:'flex', flexDirection:'column', gap:16, width:'100%', maxWidth:1600, margin:'0 auto'}}>
      <div style={{
        background:'var(--bg-elev)',
        border:'1px solid var(--line-faint)',
        borderRadius:'var(--radius-xl)',
        padding: isMobile ? '16px 18px' : '20px 24px',
        display:'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 14 : 20,
      }}>
        <div style={{display:'flex', alignItems:'center', gap: isMobile ? 14 : 20, minWidth:0, flex:1}}>
          <div style={{width:56, height:56, borderRadius:'var(--radius-xl)', background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:'var(--fs-lg)', fontFamily:'var(--font-mono)', flexShrink:0}}>{d.ticker.slice(0,2)}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap'}}>
              <h2 style={{margin:0, fontSize:'var(--fs-xl)', fontWeight:600, letterSpacing:'-0.02em'}}>{d.name}</h2>
              <span className="mono" style={{fontSize:'var(--fs-sm)', color:'var(--ink-3)'}}>{d.ticker} · {d.market}</span>
              <span style={{fontSize:'var(--fs-2xs)', padding:'3px 8px', background:'var(--pos-soft)', color:'var(--pos)', borderRadius:'var(--radius)', fontWeight:500}}>ESG AA</span>
            </div>
            <div style={{fontSize:'var(--fs-sm)', color:'var(--ink-3)', marginTop:6, display:'flex', gap:18, alignItems:'center', flexWrap:'wrap'}}>
              <span>{d.sector}</span>
              <span style={{display:'inline-flex', alignItems:'center', gap:6}}><Flag code={d.country}/> {d.country}</span>
              <span>{d.mcap}</span>
            </div>
          </div>
        </div>
        <button style={{
          padding: isMobile ? '12px 16px' : '8px 16px',
          background:'var(--accent)', color:'white',
          borderRadius:'var(--radius-lg)', fontSize:'var(--fs-sm)', fontWeight:600,
          border:0, cursor:'pointer', flexShrink:0,
          width: isMobile ? '100%' : 'auto',
        }}>Open Data Explorer →</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:panelCols, gap:16}}>
        <NovaPanel title="ESG Rating" subtitle="Current">
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 0'}}>
            <div className="mono grad-text" style={{fontSize:'var(--fs-display)', fontWeight:700, lineHeight:1, letterSpacing:'-0.04em'}}>{d.esg}</div>
            <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-3)', marginTop:6}}>Industry mode: <span style={{fontWeight:500, color:'var(--ink-2)'}}>B</span></div>
          </div>
        </NovaPanel>
        <NovaPanel title="ESG Score" subtitle="Weighted"><HxGauge value={9.0} max={10} label="ESG" color="var(--accent)" large ariaLabel={`${d.name} ESG score 9.0 out of 10`}/></NovaPanel>
        <NovaPanel title="Pillar Scores">
          <div style={{display:'flex', flexDirection:'column', gap:14, padding:'4px'}}>
            <PillarRow label="E" value={d.e} color="var(--c2)"/>
            <PillarRow label="S" value={d.s} color="var(--c1)"/>
            <PillarRow label="G" value={d.g} color="var(--c3)"/>
          </div>
        </NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:wideCols, gap:16}}>
        <NovaPanel title="Revenue & Exposure" subtitle="Quarterly, $M">
          <HxBar groups={['Q1 23','Q2 23','Q3 23','Q4 23','Q1 24','Q2 24','Q3 24','Q4 24','Q1 25','Q2 25','Q3 25','Q4 25']} series={[{name:'Revenue', data: d.revenue, color:'var(--c1)'}]} compareLine={{name:'Exposure', data: d.exposure, color:'var(--c4)'}} height={CHART_HEIGHT.lg}/>
        </NovaPanel>
        <NovaPanel title="Peer Comparison" padded={false} subtle>
          <NovaGrid dataset="peers" columnDefs={PEER_COLS} height={CHART_HEIGHT.lg + 40}/>
        </NovaPanel>
      </div>
    </div>
  );
}
