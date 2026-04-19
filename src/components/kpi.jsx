// Small data-display primitives — KPI tile, risk tile, mini gauge, pillar row.
import React from 'react';
import { NovaSpark } from './charts.jsx';

export function HeroKpi({label, value, delta, deltaLabel, spark, hero, compact}) {
  const up = delta>=0;
  return (
    <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:14, padding: compact?'14px 14px':'18px 20px', position:'relative', overflow:'hidden', boxShadow: hero?'var(--shadow-glow)':'none', minWidth:0}}>
      {hero && <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'var(--grad)'}}/>}
      <div style={{fontSize:10, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500, marginBottom: compact?8:10}}>{label}</div>
      <div className="mono" style={{fontSize: compact?20:30, fontWeight:600, letterSpacing:'-0.025em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{value}</div>
      <div style={{display:'flex', alignItems:'center', gap:8, marginTop: compact?8:10}}>
        <div className="mono" style={{fontSize:10.5, color:up?'var(--pos)':'var(--neg)', display:'flex', alignItems:'center', gap:2, padding:'2px 6px', background:up?'var(--pos-soft)':'var(--neg-soft)', borderRadius:5, fontWeight:500, flexShrink:0}}>
          <span style={{fontSize:7}}>{up?'▲':'▼'}</span>{Math.abs(delta).toFixed(2)}{deltaLabel||'%'}
        </div>
        <div style={{flex:1, minWidth:0}}><NovaSpark data={spark} width={compact?80:120} height={20} grad color={hero?'var(--accent)':(up?'var(--pos)':'var(--neg)')}/></div>
      </div>
    </div>
  );
}

export function RiskTile({label, value, delta, sep}) {
  const up = delta >= 0;
  return (
    <div style={{padding:'18px 20px', borderRight: sep ? '1px solid var(--line-faint)' : 'none'}}>
      <div style={{fontSize:11, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600}}>{label}</div>
      <div className="mono" style={{fontSize:24, fontWeight:700, color:'var(--ink)', marginTop:6, letterSpacing:'-0.02em'}}>{value}</div>
      <div className="mono" style={{fontSize:12, color: up?'var(--pos)':'var(--neg)', marginTop:4, fontWeight:600}}>{up?'+':''}{delta.toFixed(2)}%</div>
    </div>
  );
}

export function MiniGauge({value, label, color}) {
  const pct = value / 10;
  const r = 28, cx = 36, cy = 36;
  const start = Math.PI, end = 0;
  const a = start + (end - start) * pct;
  const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
  const x2 = cx + r*Math.cos(end),   y2 = cy + r*Math.sin(end);
  const xp = cx + r*Math.cos(a),     yp = cy + r*Math.sin(a);
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'4px'}}>
      <svg width={72} height={42} viewBox={`0 0 72 42`}>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke="var(--bg-sunken)" strokeWidth="6" strokeLinecap="round"/>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xp},${yp}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      </svg>
      <div className="mono" style={{fontSize:18, fontWeight:700, color:'var(--ink)', marginTop:-4, letterSpacing:'-0.02em'}}>{value.toFixed(2)}</div>
      <div style={{fontSize:11, color:'var(--ink-4)', marginTop:2, fontWeight:600, letterSpacing:'0.04em'}}>{label}</div>
    </div>
  );
}

export function PillarRow({label, value, color}) {
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
        <span style={{width:20, height:20, borderRadius:5, background:color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:10}}>{label}</span>
        <span style={{fontSize:11, color:'var(--ink-3)', flex:1}}>Score out of 100</span>
        <span className="mono" style={{fontWeight:600, fontSize:15}}>{value}</span>
      </div>
      <div style={{height:8, background:'var(--bg-sunken)', borderRadius:4, overflow:'hidden'}}>
        <div style={{width:`${value}%`, height:'100%', background:`linear-gradient(90deg, ${color}66, ${color})`, borderRadius:4}}/>
      </div>
    </div>
  );
}
