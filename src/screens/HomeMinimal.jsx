// V3 — Modern minimalist (Stripe/Linear feel) for CIO audience.
// Exception-driven: hero KPIs, attention feed, twin perf/risk panels, allocation snapshot.
import React from 'react';
import { NovaPanel } from '../components/shell.jsx';
import { HxArea } from '../components/highcharts/HxArea.jsx';
import { HxDonut } from '../components/highcharts/HxDonut.jsx';
import { HxBar } from '../components/highcharts/HxBar.jsx';
import { HeroKpi } from '../components/kpi.jsx';
import { NovaAlertRow, NovaMetricRow } from '../components/metric-row.jsx';
import { DATA, series } from '../data.js';
import { CHART_HEIGHT } from '../tokens.js';
import { useViewport } from '../hooks/use-viewport.js';
import { usePortfolio, useSparks, useLiveAlerts } from '../live.jsx';

// Fallback used until the first live tick arrives; after that useLiveAlerts()
// supplies a growing feed with server-driven perturbations.
const ALERTS_FALLBACK = [
  { sev:'high', cat:'Issuer', text:'Meridian Industries downgraded AA → A+ by S&P', meta:'2 min ago', dest:'issuer' },
  { sev:'med',  cat:'Limit',  text:'Equity sleeve VaR at 92% of policy limit',       meta:'14 min ago', dest:'risk' },
  { sev:'med',  cat:'Concentration', text:'Tech sector weight 35.4% (cap 35%)',       meta:'1 hr ago',   dest:'risk' },
  { sev:'low',  cat:'ESG',    text:'3 holdings flagged on new climate methodology',   meta:'4 hr ago',   dest:'esg' },
];

const TOP_CONTRIBUTORS = [
  { name:'NVDA',  bps:+58 }, { name:'MSFT', bps:+42 }, { name:'ASML', bps:+31 },
  { name:'JPM',   bps:+22 }, { name:'TSM',  bps:+18 }, { name:'META', bps:-14 },
  { name:'XOM',   bps:-22 }, { name:'BP',   bps:-31 },
];

const DRIFT = DATA.allocation;


function ContributorBars() {
  const max = Math.max(...TOP_CONTRIBUTORS.map(c=>Math.abs(c.bps)));
  return (
    <div style={{display:'flex', flexDirection:'column', gap:4, padding:'4px 0'}}>
      {TOP_CONTRIBUTORS.map(c => (
        <NovaMetricRow
          key={c.name}
          name={c.name}
          value={c.bps}
          valueFormat={v => `${v>=0?'+':''}${v} bps`}
          bar={{ mode:'signed', ratio: Math.abs(c.bps) / max }}
        />
      ))}
    </div>
  );
}

function DriftTable() {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:10}}>
      {DRIFT.map(d => {
        const drift = d.actual - d.target;
        const tone = Math.abs(drift) > 2 ? 'var(--neg)' : Math.abs(drift) > 0.5 ? 'var(--c8)' : 'var(--ink-3)';
        return (
          <div key={d.cls} style={{display:'grid', gridTemplateColumns:'10px 1fr 60px 60px 60px', gap:10, alignItems:'center', fontSize:12}}>
            <span style={{width:8, height:8, borderRadius:2, background:d.color}}/>
            <span style={{color:'var(--ink-2)'}}>{d.cls}</span>
            <span className="mono" style={{textAlign:'right', color:'var(--ink-3)'}}>{d.target.toFixed(1)}%</span>
            <span className="mono" style={{textAlign:'right', color:'var(--ink)', fontWeight:600}}>{d.actual.toFixed(1)}%</span>
            <span className="mono" style={{textAlign:'right', color:tone, fontWeight:600}}>{drift>0?'+':''}{drift.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HomeMinimal({ openDash }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const { isMobile, isTablet } = useViewport();
  const PORTFOLIO = usePortfolio();
  const sparks = useSparks();
  const ALERTS = useLiveAlerts() ?? ALERTS_FALLBACK;
  const heroCols = isMobile ? '1fr' : 'repeat(3, 1fr)';
  const twinCols = isMobile || isTablet ? '1fr' : '1fr 1fr';
  const allocCols = isMobile || isTablet ? '1fr' : '1fr 1.4fr';

  return (
    <div style={{flex:1, overflow:'auto', padding:'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) 40px', display:'flex', flexDirection:'column', gap:32, width:'100%', maxWidth:1600, margin:'0 auto'}}>

      {/* Greeting + status */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:'1px solid var(--line-faint)', paddingBottom:20}}>
        <div>
          <div style={{fontSize:24, fontWeight:600, color:'var(--ink)', letterSpacing:'-0.02em'}}>{greeting}, Shannon</div>
          <div style={{fontSize:'var(--fs-md)', color:'var(--ink-3)', marginTop:6}}>Your portfolio is up <span style={{color:'var(--pos)', fontWeight:600}}>{PORTFOLIO.ytdReturn.toFixed(2)}%</span> year-to-date · {ALERTS.length} items need attention</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8, fontSize:'var(--fs-xs)', color:'var(--ink-4)', fontFamily:'var(--font-mono)'}}>
          <span aria-hidden="true" style={{width:6, height:6, borderRadius:'50%', background:'var(--pos)'}}/>
          LIVE · As of {PORTFOLIO.asOf}
        </div>
      </div>

      {/* Hero numbers — 3 only, generous space */}
      <div style={{display:'grid', gridTemplateColumns:heroCols, gap: isMobile ? 24 : 48, padding:'8px 0'}}>
        <HeroKpi variant="large" label="Total assets"  value={PORTFOLIO.totalMvDisplay}   delta={2.41}  spark={sparks?.totalMv   ?? series(20,100,2,101,0.5)}/>
        <HeroKpi variant="large" label="YTD return"    value={PORTFOLIO.ytdReturnDisplay} delta={1.63}  deltaSuffix="pts vs bench" spark={sparks?.ytdReturn ?? series(20,100,2.2,103,0.8)}/>
        <HeroKpi variant="large" label="VaR (95%, 1d)" value={PORTFOLIO.var95Display}    delta={-0.42} tone="neutral" spark={sparks?.var95     ?? series(20,100,1.5,102,0.4)}/>
      </div>

      {/* Attention feed */}
      <NovaPanel
        title="Attention"
        subtitle={`${ALERTS.length} items · sorted by severity`}
        actions={<button className="nova-link">View all alerts →</button>}
      >
        <div style={{borderTop:'1px solid var(--line-faint)'}}>
          {ALERTS.map((a,i) => <NovaAlertRow key={i} sev={a.sev} cat={a.cat} text={a.text} meta={a.meta} onClick={()=>openDash?.(a.dest)}/>)}
        </div>
      </NovaPanel>

      {/* Performance + Risk twin */}
      <div style={{display:'grid', gridTemplateColumns:twinCols, gap:24}}>
        <NovaPanel title="Performance" subtitle="Portfolio vs benchmark · 24 months">
          <HxArea series={DATA.allocationHistory.series.slice(0,2)} labels={DATA.allocationHistory.labels} height={CHART_HEIGHT.sm} showLegend={false}/>
          <div style={{marginTop:16, paddingTop:16, borderTop:'1px solid var(--line-faint)'}}>
            <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12}}>Top contributors · YTD</div>
            <ContributorBars/>
          </div>
        </NovaPanel>
        <NovaPanel title="Risk" subtitle="Contribution by risk type">
          <HxBar groups={DATA.riskContribution.labels} series={DATA.riskContribution.data.slice(1)} height={CHART_HEIGHT.sm} showLegend={false}/>
          <div style={{marginTop:16, paddingTop:16, borderTop:'1px solid var(--line-faint)', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24}}>
            {[
              { l:'VaR 95%', v:'$46.3M', d:'4.63%' },
              { l:'CVaR',    v:'$56.7M', d:'5.67%' },
              { l:'Tracking err', v:'2.1%', d:'vs bench' },
            ].map(m=>(
              <div key={m.l}>
                <div style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4}}>{m.l}</div>
                <div className="mono" style={{fontSize:18, fontWeight:600, color:'var(--ink)', letterSpacing:'-0.02em'}}>{m.v}</div>
                <div style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', marginTop:2}}>{m.d}</div>
              </div>
            ))}
          </div>
        </NovaPanel>
      </div>

      {/* Allocation + drift */}
      <NovaPanel title="Allocation" subtitle="Current snapshot vs target weights">
        <div style={{display:'grid', gridTemplateColumns:allocCols, gap:32, alignItems:'center'}}>
          <div>
            <HxDonut segments={DRIFT.map(d=>({label:d.cls, value:d.actual, color:d.color}))} height={CHART_HEIGHT.md}/>
          </div>
          <div>
            <div style={{display:'grid', gridTemplateColumns:'10px 1fr 60px 60px 60px', gap:10, fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8, paddingBottom:8, borderBottom:'1px solid var(--line-faint)'}}>
              <span/>
              <span>Asset class</span>
              <span style={{textAlign:'right'}}>Target</span>
              <span style={{textAlign:'right'}}>Actual</span>
              <span style={{textAlign:'right'}}>Drift</span>
            </div>
            <DriftTable/>
          </div>
        </div>
      </NovaPanel>

      {/* Footer */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderTop:'1px solid var(--line-faint)', fontSize:'var(--fs-sm)', color:'var(--ink-4)'}}>
        <span>Last reconciled at 14:32 GMT · Source: BNY Mellon, Aladdin</span>
        <button className="nova-link">Recent reports →</button>
      </div>
    </div>
  );
}
