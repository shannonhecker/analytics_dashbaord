// Chart primitives — gradient area, bar, donut, gauge, sparkline, region map, stacked bar, funnel.
import React, { useState, useEffect, useRef, useId } from 'react';

const NC = ['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c8)'];

function useWidth(ref) {
  const [w, setW] = useState(400);
  useEffect(()=>{
    if (!ref.current) return;
    const ro = new ResizeObserver(([e])=>setW(e.contentRect.width));
    ro.observe(ref.current);
    return ()=>ro.disconnect();
  },[]);
  return w;
}

export function nfmt(n, d=2) {
  if (n==null) return '–';
  if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(d)+'B';
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(d)+'M';
  if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(d)+'K';
  return n.toFixed(d);
}

export function NovaSpark({data, width=80, height=22, color, grad}) {
  const id = useId();
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max-min || 1;
  const pts = data.map((v,i)=>[i/(data.length-1)*width, height - ((v-min)/range)*height*0.8 - height*0.1]);
  const last = data[data.length-1], first = data[0];
  const col = color || (last >= first ? 'var(--pos)' : 'var(--neg)');
  const path = 'M' + pts.map(p=>`${p[0]} ${p[1]}`).join(' L ');
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {grad && <path d={area} fill={`url(#sg-${id})`}/>}
      <path d={path} stroke={col} strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill={col}/>
    </svg>
  );
}

export function NovaArea({series, labels, height=220, filled=true, showGrid=true, showAxis=true, showLegend=true, smooth=true}) {
  const ref = useRef();
  const w = useWidth(ref);
  const [hover, setHover] = useState(null);
  const id = useId();
  const pad = {t:10, r:14, b: showAxis?24:6, l: showAxis?40:6};
  const plotW = Math.max(10, w - pad.l - pad.r);
  const plotH = height - pad.t - pad.b - (showLegend?22:0);

  const allVals = series.flatMap(s => s.data);
  const min = Math.min(0, ...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const n = labels.length;
  const x = (i) => pad.l + (i/(n-1)) * plotW;
  const y = (v) => pad.t + plotH - ((v - min)/range)*plotH;
  const zeroY = y(0);

  const ticks = [];
  for (let i=0;i<=4;i++) ticks.push(min + (range * i/4));

  const smoothPath = (pts) => {
    if (pts.length<2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i=1; i<pts.length; i++) {
      const p0 = pts[i-1], p1 = pts[i];
      const cpx = (p0[0]+p1[0])/2;
      d += ` C ${cpx} ${p0[1]}, ${cpx} ${p1[1]}, ${p1[0]} ${p1[1]}`;
    }
    return d;
  };

  return (
    <div ref={ref} style={{width:'100%', height:height+(showLegend?0:0), position:'relative'}}>
      <svg width={w} height={height} style={{display:'block'}}
        onMouseMove={e=>{
          const r = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - r.left;
          const idx = Math.round(((px - pad.l)/plotW) * (n-1));
          if (idx>=0 && idx<n) setHover(idx); else setHover(null);
        }}
        onMouseLeave={()=>setHover(null)}
      >
        <defs>
          {series.map((s,si)=>{
            const col = s.color || NC[si%NC.length];
            return (
              <linearGradient key={si} id={`${id}-g${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={col} stopOpacity="0.45"/>
                <stop offset="50%" stopColor={col} stopOpacity="0.15"/>
                <stop offset="100%" stopColor={col} stopOpacity="0"/>
              </linearGradient>
            );
          })}
        </defs>
        {showGrid && ticks.map((t,i)=>(
          <g key={i}>
            <line x1={pad.l} x2={pad.l+plotW} y1={y(t)} y2={y(t)} stroke="var(--line-faint)" strokeDasharray="2 3"/>
            {showAxis && <text x={pad.l-8} y={y(t)+3} fontSize="10" fill="var(--ink-4)" textAnchor="end" fontFamily="var(--font-mono)">{nfmt(t,1)}</text>}
          </g>
        ))}
        {series.map((s,si)=>{
          const col = s.color || NC[si%NC.length];
          const pts = s.data.map((v,i)=>[x(i), y(v)]);
          const path = smooth ? smoothPath(pts) : 'M'+pts.map(p=>`${p[0]} ${p[1]}`).join(' L ');
          const areaP = filled ? path + ` L ${x(n-1)} ${zeroY} L ${x(0)} ${zeroY} Z` : '';
          return (
            <g key={si}>
              {filled && <path d={areaP} fill={`url(#${id}-g${si})`}/>}
              <path d={path} stroke={col} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
            </g>
          );
        })}
        {showAxis && labels.map((l,i)=>{
          if (n>15 && i%3!==0 && i!==n-1) return null;
          return <text key={i} x={x(i)} y={height-pad.b+15} fontSize="10" fill="var(--ink-4)" textAnchor="middle">{l}</text>;
        })}
        {hover!==null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t+plotH} stroke="var(--ink-3)" strokeDasharray="2 3" opacity="0.5"/>
            {series.map((s,si)=>{
              const col = s.color || NC[si%NC.length];
              return <g key={si}><circle cx={x(hover)} cy={y(s.data[hover])} r="5" fill={col} fillOpacity="0.25"/><circle cx={x(hover)} cy={y(s.data[hover])} r="3" fill={col} stroke="var(--bg-elev)" strokeWidth="1.5"/></g>;
            })}
          </g>
        )}
      </svg>
      {hover!==null && (
        <div style={{position:'absolute', left: Math.min(w-180, x(hover)+10), top:8, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:8, padding:'8px 10px', fontSize:11, boxShadow:'var(--shadow-md)', pointerEvents:'none', minWidth:150, backdropFilter:'blur(6px)'}}>
          <div style={{fontSize:10, color:'var(--ink-4)', marginBottom:5, letterSpacing:'0.04em', textTransform:'uppercase'}}>{labels[hover]}</div>
          {series.map((s,si)=>(
            <div key={si} style={{display:'flex', alignItems:'center', gap:8, lineHeight:1.7}}>
              <span style={{width:6, height:6, borderRadius:'50%', background: s.color || NC[si%NC.length]}}/>
              <span style={{flex:1, color:'var(--ink-2)'}}>{s.name}</span>
              <span className="mono" style={{fontWeight:600}}>{nfmt(s.data[hover],2)}</span>
            </div>
          ))}
        </div>
      )}
      {showLegend && (
        <div style={{display:'flex', gap:16, flexWrap:'wrap', fontSize:11, paddingLeft:pad.l, marginTop:-4, color:'var(--ink-3)'}}>
          {series.map((s,i)=>(
            <div key={i} style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:10, height:2, borderRadius:1, background:s.color||NC[i%NC.length]}}/>
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function NovaBar({groups, series, height=220, horizontal=false, showLegend=true, compareLine}) {
  const ref = useRef();
  const w = useWidth(ref);
  const id = useId();
  const allVals = series.flatMap(s => s.data);
  const max = Math.max(...allVals, 0);
  const min = Math.min(...allVals, 0);
  const pad = {t:10, r:14, b:24, l:40};
  const plotW = Math.max(10, w - pad.l - pad.r);
  const plotH = height - pad.t - pad.b - (showLegend?22:0);

  const catW = plotW / groups.length;
  const barW = Math.max(4, (catW - 10) / series.length);
  const yy = (v) => pad.t + plotH - ((v - min)/((max-min)||1))*plotH;
  const zeroY = yy(0);

  return (
    <div ref={ref} style={{width:'100%', height: height + (showLegend?0:0)}}>
      <svg width={w} height={height}>
        <defs>
          {series.map((s,si)=>{
            const col = s.color || NC[si%NC.length];
            return <linearGradient key={si} id={`${id}-vb${si}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="1"/><stop offset="100%" stopColor={col} stopOpacity="0.45"/></linearGradient>;
          })}
        </defs>
        {[0,0.25,0.5,0.75,1].map((t,i)=>{
          const v = min + (max-min)*t;
          return <g key={i}><line x1={pad.l} x2={pad.l+plotW} y1={yy(v)} y2={yy(v)} stroke="var(--line-faint)" strokeDasharray="2 3"/><text x={pad.l-8} y={yy(v)+3} fontSize="10" fill="var(--ink-4)" textAnchor="end" fontFamily="var(--font-mono)">{nfmt(v,1)}</text></g>;
        })}
        {groups.map((g,gi)=>(
          <g key={gi}>
            {series.map((s,si)=>{
              const v = s.data[gi];
              const xp = pad.l + gi*catW + 5 + si*barW;
              const top = v >= 0 ? yy(v) : zeroY;
              const h = Math.abs(yy(v) - zeroY);
              return <rect key={si} x={xp} y={top} width={barW-2} height={h} fill={`url(#${id}-vb${si})`} rx="3"/>;
            })}
            <text x={pad.l + gi*catW + catW/2} y={height-pad.b+15} fontSize="10" fill="var(--ink-4)" textAnchor="middle">{g}</text>
          </g>
        ))}
        {compareLine && (() => {
          const pts = compareLine.data.map((v,i) => [pad.l + i*catW + catW/2, yy(v)]);
          const path = 'M'+pts.map(p=>`${p[0]} ${p[1]}`).join(' L ');
          return <g><path d={path} stroke={compareLine.color||'var(--accent)'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>{pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--bg-elev)" stroke={compareLine.color||'var(--accent)'} strokeWidth="2"/>)}</g>;
        })()}
      </svg>
      {showLegend && <NovaLegend series={compareLine ? [...series, compareLine] : series} paddingLeft={pad.l}/>}
    </div>
  );
}

export function NovaLegend({series, paddingLeft=0}) {
  return (
    <div style={{display:'flex', gap:16, flexWrap:'wrap', fontSize:11, paddingLeft, marginTop:-2, color:'var(--ink-3)'}}>
      {series.map((s,i)=>(
        <div key={i} style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{width:10, height:10, borderRadius:3, background:s.color||NC[i%NC.length]}}/>
          {s.name}
        </div>
      ))}
    </div>
  );
}

export function NovaDonut({segments, centerLabel, centerSub, size=180}) {
  const id = useId();
  const r = size/2 - 12;
  const ir = r - 16;
  const cx = size/2, cy = size/2;
  const total = segments.reduce((a,s)=>a+s.value, 0);
  let acc = 0;
  const arcs = segments.map((s,i) => {
    const start = acc/total * Math.PI*2 - Math.PI/2;
    acc += s.value;
    const end = acc/total * Math.PI*2 - Math.PI/2;
    const large = end-start > Math.PI ? 1 : 0;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const x2 = cx + r*Math.cos(end), y2 = cy + r*Math.sin(end);
    const ix1 = cx + ir*Math.cos(start), iy1 = cy + ir*Math.sin(start);
    const ix2 = cx + ir*Math.cos(end), iy2 = cy + ir*Math.sin(end);
    return { d:`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`, color: s.color || NC[i%NC.length], label: s.label, pct: s.value/total*100 };
  });
  return (
    <div style={{display:'flex', alignItems:'center', width:'100%', height:'100%', gap:20}}>
      <div style={{position:'relative', flexShrink:0}}>
        <svg width={size} height={size}>
          <defs>
            {arcs.map((a,i)=>(
              <radialGradient key={i} id={`${id}-d${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor={a.color} stopOpacity="0.85"/>
                <stop offset="100%" stopColor={a.color} stopOpacity="1"/>
              </radialGradient>
            ))}
          </defs>
          {arcs.map((a,i)=>(<path key={i} d={a.d} fill={`url(#${id}-d${i})`}/>))}
        </svg>
        <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
          <div style={{fontSize:10, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{centerSub}</div>
          <div className="mono" style={{fontSize:17, fontWeight:600, marginTop:2}}>{centerLabel}</div>
        </div>
      </div>
      <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:6}}>
        {arcs.map((a,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:8, fontSize:11.5}}>
            <span style={{width:3, height:14, borderRadius:2, background:a.color, flexShrink:0}}/>
            <span style={{color:'var(--ink-2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.label}</span>
            <span className="mono" style={{color:'var(--ink-3)'}}>{a.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NovaBarMini({value, max=100, color, label}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <div style={{flex:1, height:6, background:'var(--bg-sunken)', borderRadius:3, overflow:'hidden', minWidth:40}}>
        <div style={{width: `${Math.min(100, (value/max)*100)}%`, height:'100%', background: `linear-gradient(90deg, ${color||'var(--accent)'}, ${color? color : 'var(--accent-2)'})`, borderRadius:3}}/>
      </div>
      <span className="mono" style={{fontSize:10.5, color:'var(--ink-3)', minWidth:38, textAlign:'right'}}>{value.toFixed(2)}</span>
    </div>
  );
}

export function NovaGauge({value, min=0, max=10, label, color='var(--accent)', large}) {
  const id = useId();
  const size = large ? 180 : 140;
  const r = size/2 - 14;
  const cx = size/2, cy = size/2+6;
  const startA = Math.PI, endA = 0;
  const valA = startA + ((value-min)/(max-min))*(endA-startA);
  const p = (a) => [cx + r*Math.cos(a), cy + r*Math.sin(a)];
  const arcPath = (a1,a2) => {
    const [x1,y1] = p(a1), [x2,y2] = p(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const svgH = size/2 + 14;
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', padding:'4px 0', position:'relative'}}>
      <svg width={size} height={svgH} style={{overflow:'visible'}}>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={color} stopOpacity="1"/>
          </linearGradient>
        </defs>
        <path d={arcPath(startA,endA)} stroke="var(--bg-sunken)" strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d={arcPath(startA,valA)} stroke={`url(#${id}-g)`} strokeWidth="10" fill="none" strokeLinecap="round"/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={large?32:24} fontWeight="600" fill="var(--ink)" fontFamily="var(--font-mono)" letterSpacing="-0.02em">{value.toFixed(2)}</text>
      </svg>
      <div style={{fontSize:10.5, color:'var(--ink-4)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em'}}>{label}</div>
    </div>
  );
}

export function novaHeat(v, domain=[-5,5]) {
  if (v==null) return 'transparent';
  const [a,b] = domain;
  const t = Math.max(-1, Math.min(1, v >= 0 ? v/b : -(v/a)));
  if (t === 0) return 'transparent';
  const hue = t > 0 ? 160 : 12;
  return `oklch(40% ${Math.abs(t)*0.12} ${hue} / ${0.2 + Math.abs(t)*0.4})`;
}

// Mini chart preview thumbnails for workspace cards
export function CardPreview({kind, color='var(--accent)'}) {
  const W = 260, H = 64;
  const gid = useId();
  if (kind === 'area') {
    const pts = [58, 52, 55, 48, 44, 46, 40, 36, 32, 28, 30, 24, 20, 22, 16, 12];
    const step = W / (pts.length - 1);
    const d = pts.map((y,i) => `${i===0?'M':'L'}${i*step},${y}`).join(' ');
    const fill = `${d} L${W},${H} L0,${H} Z`;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#${gid})`}/>
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (kind === 'bars') {
    const vals = [28, 42, 35, 48, 52, 38, 44, 58, 46, 50, 36, 54];
    const bw = W / vals.length - 3;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
        {vals.map((v,i)=>(<rect key={i} x={i*(bw+3)} y={H-v} width={bw} height={v} rx="1.5" fill={color} opacity={0.4 + (v/60)*0.6}/>))}
      </svg>
    );
  }
  if (kind === 'gauge') {
    const cx = W/2, cy = H-6, r = 38;
    const pct = 0.62;
    const start = Math.PI, end = 0;
    const a = start + (end - start) * pct;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const x2 = cx + r*Math.cos(end), y2 = cy + r*Math.sin(end);
    const xp = cx + r*Math.cos(a), yp = cy + r*Math.sin(a);
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" style={{display:'block'}}>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke="var(--line)" strokeWidth="5" strokeLinecap="round"/>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xp},${yp}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
        <circle cx={xp} cy={yp} r="4" fill={color}/>
        <text x={cx} y={cy-8} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="14" fill="var(--ink)" letterSpacing="-0.02em">5.50</text>
      </svg>
    );
  }
  if (kind === 'donut') {
    const cx = W/2, cy = H/2+2, r = 24, rr = 16;
    const segs = [{v:0.42, c:color},{v:0.28, c:'var(--c2)'},{v:0.18, c:'var(--c4)'},{v:0.12, c:'var(--c6)'}];
    let a0 = -Math.PI/2;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{display:'block'}}>
        {segs.map((s,i) => {
          const a1 = a0 + s.v * Math.PI*2;
          const large = s.v > 0.5 ? 1 : 0;
          const x1 = cx + r*Math.cos(a0), y1 = cy + r*Math.sin(a0);
          const x2 = cx + r*Math.cos(a1), y2 = cy + r*Math.sin(a1);
          const x3 = cx + rr*Math.cos(a1), y3 = cy + rr*Math.sin(a1);
          const x4 = cx + rr*Math.cos(a0), y4 = cy + rr*Math.sin(a0);
          const d = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rr},${rr} 0 ${large} 0 ${x4},${y4} Z`;
          a0 = a1;
          return <path key={i} d={d} fill={s.c}/>;
        })}
        <text x={cx} y={cy+4} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="12" fill="var(--ink)" letterSpacing="-0.02em">AA</text>
      </svg>
    );
  }
  return null;
}
