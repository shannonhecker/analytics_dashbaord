import React from 'react';
import { NovaPanel, NovaChip } from '../components/shell.jsx';
import { CardPreview } from '../components/charts.jsx';
import { HxArea } from '../components/highcharts/HxArea.jsx';
import { HxDonut } from '../components/highcharts/HxDonut.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { LinkCell, ChipCell } from '../components/cell-renderers.jsx';
import { DATA, series } from '../data.js';

const REPORT_COLS = [
  { field: 'name', headerName: 'Name', cellRenderer: LinkCell, flex: 2, minWidth: 220 },
  { field: 'cls',  headerName: 'Class', cellRenderer: ChipCell, maxWidth: 120 },
  { field: 'theme', headerName: 'Theme', flex: 1.4 },
  { field: 'owner', headerName: 'Owner', flex: 1 },
  { field: 'updated', headerName: 'Updated', flex: 1, cellClass: 'mono' },
];

export function Home({openDash}) {
  const featured = [
    { id:'performance', title:'Performance',    cls:'Holdings', desc:'Portfolio returns, attribution, and benchmark comparison across asset classes.', updated:'2 min ago',  kpi:'+5.18%', delta:'+2.13pts', preview:'area',  tint:'var(--c1)' },
    { id:'risk',        title:'Risk',           cls:'Holdings', desc:'VaR, CVaR, contribution analysis, issuer exposure, currency breakdown.',         updated:'5 min ago',  kpi:'$46.3M', delta:'-0.12%',   preview:'bars',  tint:'var(--c4)' },
    { id:'esg',         title:'Sustainability', cls:'Holdings', desc:'ESG scoring, climate alignment, portfolio emissions, sector contribution.',       updated:'1 hr ago',   kpi:'5.50',   delta:'+0.24pts', preview:'gauge', tint:'var(--c2)' },
    { id:'issuer',      title:'Issuer Detail',  cls:'Company',  desc:'Single-issuer deep dive with peer comparison and scoring history.',                updated:'22 min ago', kpi:'AA',     delta:'+2 notch', preview:'donut', tint:'var(--c3)' },
  ];

  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:12}}>
        <HeroKpi label="Total MV"      value="$2.83B"  delta={2.41} spark={series(20,100,2,101,0.5)}   hero/>
        <HeroKpi label="YTD Return"    value="+5.18%"  delta={1.63} deltaLabel="pts" spark={series(20,100,2.2,103,0.8)}/>
        <HeroKpi label="Active Return" value="+2.13%"  delta={-0.04} spark={series(20,100,0.8,104,0.2)}/>
        <HeroKpi label="Sharpe"        value="1.42"    delta={0.09} deltaLabel="" spark={series(20,100,1.1,107,0.2)}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
        {featured.map(c => (
          <button key={c.id} onClick={()=>openDash(c.id)} style={{textAlign:'left', background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'all 150ms', display:'flex', flexDirection:'column', boxShadow:'var(--shadow-sm)', cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ink-5)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='none';}}>
            <div style={{padding:'14px 16px 8px'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontSize:13.5, fontWeight:600, color:'var(--ink)'}}>{c.title}</div>
                <span style={{fontSize:10, color:'var(--ink-3)', background:'var(--bg-sunken)', padding:'2px 7px', borderRadius:4, marginLeft:'auto', fontWeight:600}}>{c.cls}</span>
              </div>
              <div style={{fontSize:11.5, color:'var(--ink-3)', marginTop:5, lineHeight:1.45, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:33}}>{c.desc}</div>
            </div>
            <div style={{padding:'0 16px 8px', display:'flex', alignItems:'baseline', gap:8}}>
              <div className="mono" style={{fontSize:20, fontWeight:700, color:'var(--ink)'}}>{c.kpi}</div>
              <div style={{fontSize:11, color:c.delta.startsWith('-')?'var(--neg)':'var(--pos)', fontFamily:'var(--font-mono)', fontWeight:600}}>{c.delta}</div>
            </div>
            <div style={{height:60, marginTop:'auto', padding:'0 8px', display:'flex', alignItems:'flex-end'}}>
              <CardPreview kind={c.preview} color={c.tint}/>
            </div>
            <div style={{padding:'8px 16px', borderTop:'1px solid var(--line-faint)', fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', display:'flex', justifyContent:'space-between', textTransform:'uppercase', fontWeight:600}}>
              <span>Updated {c.updated}</span>
              <span style={{color:'var(--accent)'}}>Open →</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <NovaPanel title="Allocation History" subtitle="by Asset Class" actions={<div style={{display:'flex', gap:4}}><NovaChip active>24M</NovaChip><NovaChip>YTD</NovaChip><NovaChip>3Y</NovaChip></div>}>
          <HxArea series={DATA.allocationHistory.series} labels={DATA.allocationHistory.labels} height={260}/>
        </NovaPanel>
        <NovaPanel title="Allocation" subtitle="Current snapshot">
          <HxDonut segments={[
            {label:'Equities',         value:40.8, color:'var(--c1)'},
            {label:'Corporate Bonds',  value:25.0, color:'var(--c2)'},
            {label:'Government Bonds', value:12.2, color:'var(--c3)'},
            {label:'Private Equity',   value:11.0, color:'var(--c4)'},
            {label:'Hedge Funds',      value:8.0,  color:'var(--c5)'},
            {label:'Other',            value:3.0,  color:'var(--c6)'},
          ]} centerLabel="$2.83B" centerSub="Total MV"/>
        </NovaPanel>
      </div>

      <NovaPanel title="Recent Reports" subtitle="Saved analytics across all workspaces" padded={false}>
        <NovaGrid
          dataset="reports"
          columnDefs={REPORT_COLS}
          height={340}
          onRowClicked={(e) => openDash(e.data?.id)}
        />
      </NovaPanel>
    </div>
  );
}
