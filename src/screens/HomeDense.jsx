// V4 — Carbon analytical (dense, polished) for CIO audience.
// Information-rich with sharper hierarchy. KPI band, twin alerts/movers, multi-panel perf+risk.
import React from 'react';
import { NovaPanel, NovaChip } from '../components/shell.jsx';
import { HxArea } from '../components/highcharts/HxArea.jsx';
import { HxDonut } from '../components/highcharts/HxDonut.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HxGauge } from '../components/highcharts/HxGauge.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaGrid } from '../components/NovaGrid.jsx';
import { LinkCell, ChipCell } from '../components/cell-renderers.jsx';
import { NovaAlertRow, NovaMetricRow } from '../components/metric-row.jsx';
import { DATA, series } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';
import { usePortfolio, useSparks, useLiveAlerts, useLiveMovers } from '../live.jsx';

// Fallbacks — replaced by live SSE streams once connected.
const ALERTS_FALLBACK = [
  { sev:'high', cat:'Issuer',        text:'Meridian Industries downgraded AA → A+', meta:'2m',  dest:'issuer' },
  { sev:'med',  cat:'Limit',         text:'Equity sleeve VaR at 92% of policy',     meta:'14m', dest:'risk' },
  { sev:'med',  cat:'Concentration', text:'Tech weight 35.4% (cap 35%)',            meta:'1h',  dest:'risk' },
  { sev:'low',  cat:'ESG',           text:'3 holdings flagged · climate methodology', meta:'4h', dest:'esg' },
  { sev:'low',  cat:'Liquidity',     text:'7-day liquidation coverage at 88%',      meta:'6h',  dest:'risk' },
];

const MOVERS_FALLBACK = [
  { name:'NVDA', sec:'Tech',     bps:+58 }, { name:'MSFT', sec:'Tech',     bps:+42 },
  { name:'ASML', sec:'Tech',     bps:+31 }, { name:'JPM',  sec:'Financ.', bps:+22 },
  { name:'TSM',  sec:'Tech',     bps:+18 }, { name:'BP',   sec:'Energy',  bps:-31 },
  { name:'XOM',  sec:'Energy',   bps:-22 }, { name:'META', sec:'Tech',    bps:-14 },
];

const FACTORS = [
  { f:'Equity beta',   exp:0.92, contrib:42 },
  { f:'Rates duration', exp:5.4, contrib:24 },
  { f:'Credit spread', exp:1.8,  contrib:14 },
  { f:'FX (USD)',      exp:0.34, contrib:8 },
  { f:'Vol / convexity', exp:0.6, contrib:7 },
  { f:'Idiosyncratic', exp:null, contrib:5 },
];

const STRESS = [
  { scen:'2008 GFC replay',     pnl:-218, pct:-7.7 },
  { scen:'Rates +200 bps',      pnl:-94,  pct:-3.3 },
  { scen:'Equity -20% / Cred +150', pnl:-152, pct:-5.4 },
  { scen:'USD +10% trade-wt.',  pnl:-31,  pct:-1.1 },
  { scen:'Tech -25%',           pnl:-87,  pct:-3.1 },
];

const REPORT_COLS = [
  { field:'name', headerName:'Report', cellRenderer: LinkCell, flex:2, minWidth:220 },
  { field:'cls',  headerName:'Class',  cellRenderer: ChipCell, maxWidth:120 },
  { field:'theme', headerName:'Theme', flex:1.4 },
  { field:'owner', headerName:'Owner', flex:1 },
  { field:'updated', headerName:'Updated', flex:1, cellClass:'ag-right-aligned-cell', headerClass:'ag-right-aligned-header' },
];

function FactorRow({ f }) {
  return (
    <div style={{borderBottom:'1px solid var(--line-faint)'}}>
      <NovaMetricRow
        name={f.f}
        secondary={f.exp == null ? '—' : f.exp.toFixed(2)}
        value={f.contrib}
        valueFormat={v => `${v}%`}
        bar={{ mode:'positive', ratio: Math.min(f.contrib / 50, 1) }}
        emphasis="accent"
      />
    </div>
  );
}

function StressRow({ s }) {
  const intensity = Math.min(Math.abs(s.pct) / 8, 1);
  const pct = Math.round((6 + intensity * 14) * 10) / 10;
  const band = intensity > 0.7 ? 'high' : intensity > 0.35 ? 'medium' : 'low';
  const aria = `${s.scen}: loss $${Math.abs(s.pnl)}M, ${s.pct.toFixed(1)}%, ${band} stress`;
  return (
    <div
      role="group"
      aria-label={aria}
      style={{display:'grid', gridTemplateColumns:'1fr 70px 70px', gap:10, alignItems:'center', fontSize:'var(--fs-xs)', padding:'8px 0', borderBottom:'1px solid var(--line-faint)'}}
    >
      <span style={{color:'var(--ink-2)'}}>{s.scen}</span>
      <span aria-hidden="true" className="mono" style={{textAlign:'right', color:'var(--neg)', fontWeight:600, padding:'2px 6px', background:`color-mix(in srgb, var(--neg) ${pct}%, transparent)`, borderRadius:4}}>${Math.abs(s.pnl)}M</span>
      <span aria-hidden="true" className="mono" style={{textAlign:'right', color:'var(--neg)', fontWeight:600}}>{s.pct.toFixed(1)}%</span>
    </div>
  );
}

export function HomeDense({ openDash }) {
  const { isMobile, isTablet } = useViewport();
  const PORTFOLIO = usePortfolio();
  const sparks = useSparks();
  const ALERTS = useLiveAlerts() ?? ALERTS_FALLBACK;
  const MOVERS = useLiveMovers() ?? MOVERS_FALLBACK;
  const kpiCols = isMobile ? 2 : isTablet ? 3 : 6;
  const splitCols = isMobile || isTablet ? '1fr' : '1.2fr 1fr';
  const twinCols = isMobile || isTablet ? '1fr' : '1fr 1fr';
  const triCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';

  return (
    <div style={{flex:1, overflow:'auto', padding:'clamp(14px, 2vw, 20px)', display:'flex', flexDirection:'column', gap:14, width:'100%', maxWidth:1600, margin:'0 auto'}}>

      {/* KPI band — 6 → 3 → 2. Values + sparklines tick live via useSparks. */}
      <div style={{display:'grid', gridTemplateColumns:`repeat(${kpiCols}, minmax(0,1fr))`, gap:10}}>
        <HeroKpi label="Total MV"      value={PORTFOLIO.totalMvDisplay}                                          delta={2.41}  spark={sparks?.totalMv      ?? series(20,100,2,101,0.5)}    hero compact/>
        <HeroKpi label="YTD Return"    value={PORTFOLIO.ytdReturnDisplay}                                        delta={1.63}  deltaLabel="pts" spark={sparks?.ytdReturn    ?? series(20,100,2.2,103,0.8)} compact/>
        <HeroKpi label="MTD Return"    value={PORTFOLIO.mtdReturnDisplay    ?? `+${PORTFOLIO.mtdReturn.toFixed(2)}%`}    delta={0.34}  deltaLabel="pts" spark={sparks?.mtdReturn    ?? series(20,100,1.4,102,0.3)} compact/>
        <HeroKpi label="Active"        value={PORTFOLIO.activeReturnDisplay ?? `+${PORTFOLIO.activeReturn.toFixed(2)}%`} delta={-0.04} spark={sparks?.activeReturn ?? series(20,100,0.8,104,0.2)} compact/>
        <HeroKpi label="Sharpe"        value={PORTFOLIO.sharpeDisplay       ?? PORTFOLIO.sharpe.toFixed(2)}              delta={0.09}  deltaLabel="" spark={sparks?.sharpe       ?? series(20,100,1.1,107,0.2)} compact/>
        <HeroKpi label="VaR 95% / 1d"  value={PORTFOLIO.var95Display}                                            delta={-0.42} spark={sparks?.var95        ?? series(20,100,1.5,102,0.4)} compact/>
      </div>

      {/* Alerts (left) + Movers (right) */}
      <div style={{display:'grid', gridTemplateColumns:splitCols, gap:14}}>
        <NovaPanel title="Attention" subtitle={`${ALERTS.length} items · sorted by severity`} actions={<button className="nova-link" style={{fontSize:'var(--fs-xs)'}}>All →</button>}>
          <div style={{borderTop:'1px solid var(--line-faint)'}}>
            {ALERTS.map((a,i) => <NovaAlertRow key={i} sev={a.sev} cat={a.cat} text={a.text} meta={a.meta} onClick={()=>openDash?.(a.dest)} showCaret={false}/>)}
          </div>
        </NovaPanel>
        <NovaPanel title="Top movers · YTD" subtitle="Contribution to active return">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px'}}>
            {[MOVERS.slice(0,4), MOVERS.slice(4)].map((col, i) => (
              <div key={i}>
                {col.map(m => (
                  <NovaMetricRow
                    key={m.name}
                    name={m.name}
                    secondary={m.sec}
                    value={m.bps}
                    bar={{ mode:'signed', ratio: Math.abs(m.bps) / 60 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </NovaPanel>
      </div>

      {/* Performance (left, wide) | Risk (right, wide) */}
      <div style={{display:'grid', gridTemplateColumns:twinCols, gap:14}}>
        <NovaPanel title="Performance" subtitle="Cumulative return vs benchmark · 24m" actions={<div style={{display:'flex', gap:4}}><NovaChip>3M</NovaChip><NovaChip>YTD</NovaChip><NovaChip active>24M</NovaChip><NovaChip>3Y</NovaChip></div>}>
          <HxArea series={DATA.allocationHistory.series.slice(0,2)} labels={DATA.allocationHistory.labels} height={CHART_HEIGHT.sm}/>
        </NovaPanel>
        <NovaPanel title="Risk decomposition" subtitle="Factor contribution to portfolio VaR">
          <div style={{padding:'4px 0'}}>
            {FACTORS.map(f => <FactorRow key={f.f} f={f}/>)}
          </div>
        </NovaPanel>
      </div>

      {/* Allocation donut + Stress test + ESG gauges (3-up) */}
      <div style={{display:'grid', gridTemplateColumns:triCols, gap:14}}>
        <NovaPanel title="Allocation" subtitle="Current weights">
          <HxDonut segments={DATA.allocation.map(a => ({label:a.cls, value:a.actual, color:a.color}))} height={CHART_HEIGHT.sm}/>
        </NovaPanel>
        <NovaPanel title="Stress scenarios" subtitle="Hypothetical P&L · current book">
          <div style={{padding:'4px 0'}}>
            {STRESS.map(s => <StressRow key={s.scen} s={s}/>)}
          </div>
        </NovaPanel>
        <NovaPanel title="ESG pillar scores" subtitle="Weighted by holdings">
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, paddingTop:4}}>
            {[
              {letter:'E', name:'Environmental', value:4.21, color:'var(--c2)'},
              {letter:'S', name:'Social',        value:6.30, color:'var(--c1)'},
              {letter:'G', name:'Governance',    value:9.28, color:'var(--c3)'},
            ].map(p => (
              <div key={p.letter} style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <HxGauge value={p.value} max={10} color={p.color} compact ariaLabel={`${p.name} pillar score ${p.value.toFixed(2)} out of 10`}/>
                <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:2}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:'var(--fs-sm)', fontWeight:700, color:p.color}}>{p.letter}</span>
                  <span style={{fontSize:'var(--fs-xs)', color:'var(--ink-3)', fontWeight:500}}>{p.name}</span>
                </div>
              </div>
            ))}
          </div>
        </NovaPanel>
      </div>

      {/* Reports table */}
      <NovaPanel title="Recent reports" subtitle="Saved analytics across workspaces" padded={false} subtle>
        <NovaGrid dataset="reports" columnDefs={REPORT_COLS} height={260} onRowClicked={(e) => openDash?.(e.data?.id)}/>
      </NovaPanel>
    </div>
  );
}
