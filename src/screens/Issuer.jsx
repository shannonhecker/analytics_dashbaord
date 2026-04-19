import React from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HxGauge } from '../components/highcharts/HxGauge.jsx';
import { PillarRow } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { DATA } from '../data.js';

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
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', gap:20, boxShadow:'var(--shadow-sm)'}}>
        <div style={{width:56, height:56, borderRadius:14, background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:18, fontFamily:'var(--font-mono)'}}>{d.ticker.slice(0,2)}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'baseline', gap:12}}>
            <h2 style={{margin:0, fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>{d.name}</h2>
            <span className="mono" style={{fontSize:12, color:'var(--ink-3)'}}>{d.ticker} · {d.market}</span>
            <span style={{fontSize:10, padding:'3px 8px', background:'var(--pos-soft)', color:'var(--pos)', borderRadius:6, fontWeight:500}}>ESG AA</span>
          </div>
          <div style={{fontSize:12, color:'var(--ink-3)', marginTop:6, display:'flex', gap:18}}>
            <span>{d.sector}</span><span>🇺🇸 {d.country}</span><span>{d.mcap}</span>
          </div>
        </div>
        <button style={{padding:'8px 16px', background:'var(--accent)', color:'white', borderRadius:8, fontSize:12, fontWeight:600, border:0, cursor:'pointer'}}>Open Data Explorer →</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16}}>
        <NovaPanel title="ESG Rating" subtitle="Current">
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 0'}}>
            <div className="mono grad-text" style={{fontSize:68, fontWeight:700, lineHeight:1, letterSpacing:'-0.04em'}}>{d.esg}</div>
            <div style={{fontSize:11, color:'var(--ink-3)', marginTop:6}}>Industry mode: <span style={{fontWeight:500, color:'var(--ink-2)'}}>B</span></div>
          </div>
        </NovaPanel>
        <NovaPanel title="ESG Score" subtitle="Weighted"><HxGauge value={9.0} max={10} label="ESG" color="var(--accent)" large/></NovaPanel>
        <NovaPanel title="Pillar Scores">
          <div style={{display:'flex', flexDirection:'column', gap:14, padding:'4px'}}>
            <PillarRow label="E" value={d.e} color="var(--c2)"/>
            <PillarRow label="S" value={d.s} color="var(--c1)"/>
            <PillarRow label="G" value={d.g} color="var(--c3)"/>
          </div>
        </NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <NovaPanel title="Revenue & Exposure" subtitle="Quarterly, $M">
          <HxBar groups={['Q1 23','Q2 23','Q3 23','Q4 23','Q1 24','Q2 24','Q3 24','Q4 24','Q1 25','Q2 25','Q3 25','Q4 25']} series={[{name:'Revenue', data: d.revenue, color:'var(--c1)'}]} compareLine={{name:'Exposure', data: d.revenue.map((_,i)=>2800 + i*50 + (i%3)*30), color:'var(--c4)'}} height={260}/>
        </NovaPanel>
        <NovaPanel title="Peer Comparison" padded={false}>
          <NovaGrid dataset="peers" columnDefs={PEER_COLS} height={300}/>
        </NovaPanel>
      </div>
    </div>
  );
}
