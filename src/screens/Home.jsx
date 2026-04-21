// Home screen with layout switcher — two CIO-oriented redesigns + original "Classic" view.
// Preference persists in localStorage so user can switch and compare across sessions.
import React, { useState, useEffect } from 'react';
import { NovaPanel, NovaChip } from '../components/shell.jsx';
import { CardPreview } from '../components/charts.jsx';
import { HxArea } from '../components/highcharts/HxArea.jsx';
import { HxDonut } from '../components/highcharts/HxDonut.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { LinkCell, ChipCell } from '../components/cell-renderers.jsx';
import { DATA, series } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';
import { usePortfolio, useSparks } from '../live.jsx';
import { HomeMinimal } from './HomeMinimal.jsx';
import { HomeDense } from './HomeDense.jsx';

const REPORT_COLS = [
  { field: 'name', headerName: 'Name', cellRenderer: LinkCell, flex: 2, minWidth: 220 },
  { field: 'cls',  headerName: 'Class', cellRenderer: ChipCell, maxWidth: 120 },
  { field: 'theme', headerName: 'Theme', flex: 1.4 },
  { field: 'owner', headerName: 'Owner', flex: 1 },
  { field: 'updated', headerName: 'Updated', flex: 1, cellClass: 'ag-right-aligned-cell', headerClass: 'ag-right-aligned-header' },
];

const VIEWS = [
  { id:'minimal', label:'Minimal',  desc:'Modern · Stripe/Linear' },
  { id:'dense',   label:'Analytical', desc:'Dense · Carbon' },
  { id:'classic', label:'Classic',  desc:'Original' },
];

function LayoutSwitcher({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Home layout" style={{display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderBottom:'1px solid var(--line-faint)', background:'var(--bg-elev)'}}>
      <span aria-hidden="true" style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginRight:4}}>Layout</span>
      <div style={{display:'flex', background:'var(--bg-sunken)', borderRadius:'var(--radius)', padding:2, gap:2}}>
        {VIEWS.map(v => {
          const active = value === v.id;
          const hover = (e) => { if (!active) { e.currentTarget.style.color = 'var(--ink)'; } };
          const leave = (e) => { if (!active) { e.currentTarget.style.color = 'var(--ink-3)'; } };
          return (
            <button
              key={v.id}
              role="radio"
              aria-checked={active}
              aria-label={`${v.label} layout — ${v.desc}`}
              onClick={()=>onChange(v.id)}
              style={{
                padding:'5px 12px', fontSize:'var(--fs-sm)', fontWeight:500, borderRadius:4,
                background: active ? 'var(--bg-elev)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: active ? 'var(--shadow-xs)' : 'none',
                cursor:'pointer', transition:'color 120ms, background 120ms, box-shadow 120ms',
              }}
              title={v.desc}
              onMouseEnter={hover}
              onMouseLeave={leave}
              onFocus={hover}
              onBlur={leave}
            >{v.label}</button>
          );
        })}
      </div>
      <span style={{fontSize:'var(--fs-xs)', color:'var(--ink-4)', marginLeft:'auto'}}>{VIEWS.find(v=>v.id===value)?.desc}</span>
    </div>
  );
}

function HomeClassic({ openDash }) {
  const { isMobile, isTablet } = useViewport();
  const PORTFOLIO = usePortfolio();
  const sparks = useSparks();
  const kpiCols = isMobile ? 2 : isTablet ? 2 : 4;
  const cardCols = isMobile ? 1 : isTablet ? 2 : 4;
  const wide = isMobile || isTablet ? '1fr' : '2fr 1fr';

  const featured = [
    { id:'performance', title:'Performance',    cls:'Holdings', desc:'Portfolio returns, attribution, and benchmark comparison across asset classes.', updated:'2 min ago',  kpi:'+5.18%', delta:'+2.13pts', preview:'area',  tint:'var(--c1)' },
    { id:'risk',        title:'Risk',           cls:'Holdings', desc:'VaR, CVaR, contribution analysis, issuer exposure, currency breakdown.',         updated:'5 min ago',  kpi:'$46.3M', delta:'-0.12%',   preview:'bars',  tint:'var(--c4)' },
    { id:'esg',         title:'Sustainability', cls:'Holdings', desc:'ESG scoring, climate alignment, portfolio emissions, sector contribution.',       updated:'1 hr ago',   kpi:'5.50',   delta:'+0.24pts', preview:'gauge', tint:'var(--c2)', previewValue:5.5, previewMax:10 },
    { id:'issuer',      title:'Issuer Detail',  cls:'Company',  desc:'Single-issuer deep dive with peer comparison and scoring history.',                updated:'22 min ago', kpi:'AA',     delta:'+2 notch', preview:'donut', tint:'var(--c3)' },
  ];

  return (
    <div style={{flex:1, overflow:'auto', padding:'clamp(16px, 2.5vw, 24px)', display:'flex', flexDirection:'column', gap:16, width:'100%', maxWidth:1600, margin:'0 auto'}}>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${kpiCols}, minmax(0, 1fr))`, gap:12}}>
        <HeroKpi label="Total MV"      value={PORTFOLIO.totalMvDisplay}                                          delta={2.41}  spark={sparks?.totalMv      ?? series(20,100,2,101,0.5)}   hero/>
        <HeroKpi label="YTD Return"    value={PORTFOLIO.ytdReturnDisplay}                                        delta={1.63}  deltaLabel="pts" spark={sparks?.ytdReturn    ?? series(20,100,2.2,103,0.8)}/>
        <HeroKpi label="Active Return" value={PORTFOLIO.activeReturnDisplay ?? `+${PORTFOLIO.activeReturn.toFixed(2)}%`} delta={-0.04} spark={sparks?.activeReturn ?? series(20,100,0.8,104,0.2)}/>
        <HeroKpi label="Sharpe"        value={PORTFOLIO.sharpeDisplay       ?? PORTFOLIO.sharpe.toFixed(2)}              delta={0.09}  deltaLabel="" spark={sparks?.sharpe       ?? series(20,100,1.1,107,0.2)}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:`repeat(${cardCols}, 1fr)`, gap:16}}>
        {featured.map(c => (
          <button key={c.id} onClick={()=>openDash(c.id)} style={{textAlign:'left', background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'all 150ms', display:'flex', flexDirection:'column', boxShadow:'var(--shadow-sm)', cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ink-5)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='none';}}
            onFocus={e=>{e.currentTarget.style.borderColor='var(--ink-5)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)';}}
            onBlur={e=>{e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='none';}}>
            <div style={{padding:'14px 16px 8px'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontSize:'var(--fs-md)', fontWeight:600, color:'var(--ink)'}}>{c.title}</div>
                <span style={{fontSize:'var(--fs-2xs)', color:'var(--ink-3)', background:'var(--bg-sunken)', padding:'2px 7px', borderRadius:4, marginLeft:'auto', fontWeight:600}}>{c.cls}</span>
              </div>
              <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-3)', marginTop:5, lineHeight:1.45, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:33}}>{c.desc}</div>
            </div>
            <div style={{padding:'0 16px 8px', display:'flex', alignItems:'baseline', gap:8}}>
              <div className="mono" style={{fontSize:20, fontWeight:700, color:'var(--ink)'}}>{c.kpi}</div>
              <div style={{fontSize:'var(--fs-xs)', color:c.delta.startsWith('-')?'var(--neg)':'var(--pos)', fontFamily:'var(--font-mono)', fontWeight:600}}>{c.delta}</div>
            </div>
            <div style={{height:60, marginTop:'auto', padding:'0 8px', display:'flex', alignItems:'flex-end'}}>
              <CardPreview kind={c.preview} color={c.tint} value={c.previewValue} max={c.previewMax}/>
            </div>
            <div style={{padding:'8px 16px', borderTop:'1px solid var(--line-faint)', fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontFamily:'var(--font-mono)', display:'flex', justifyContent:'space-between', textTransform:'uppercase', fontWeight:600}}>
              <span>Updated {c.updated}</span>
              <span style={{color:'var(--accent)'}}>Open →</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:wide, gap:16}}>
        <NovaPanel title="Allocation History" subtitle="by Asset Class" actions={<div style={{display:'flex', gap:4}}><NovaChip active>24M</NovaChip><NovaChip>YTD</NovaChip><NovaChip>3Y</NovaChip></div>}>
          <HxArea series={DATA.allocationHistory.series} labels={DATA.allocationHistory.labels} height={CHART_HEIGHT.lg}/>
        </NovaPanel>
        <NovaPanel title="Allocation" subtitle="Current snapshot">
          <HxDonut segments={DATA.allocation.map(a => ({label:a.cls, value:a.actual, color:a.color}))}/>
        </NovaPanel>
      </div>

      <NovaPanel title="Recent Reports" subtitle="Saved analytics across all workspaces" padded={false} subtle>
        <NovaGrid dataset="reports" columnDefs={REPORT_COLS} height={CHART_HEIGHT.lg + 80} onRowClicked={(e) => openDash(e.data?.id)}/>
      </NovaPanel>
    </div>
  );
}

export function Home({ openDash }) {
  const [view, setView] = useState(() => localStorage.getItem('nova.homeView') || 'minimal');
  useEffect(() => { localStorage.setItem('nova.homeView', view); }, [view]);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
      <LayoutSwitcher value={view} onChange={setView}/>
      {view === 'minimal' && <HomeMinimal openDash={openDash}/>}
      {view === 'dense'   && <HomeDense openDash={openDash}/>}
      {view === 'classic' && <HomeClassic openDash={openDash}/>}
    </div>
  );
}
