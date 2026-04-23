// KPI primitives — HeroKpi covers three variants:
//   'compact'  — tight 6-up KPI bands (HomeDense, Performance)
//   'default'  — 4-up balanced grid
//   'hero'     — prominent top accent bar + glow ring
//   'large'    — generous whitespace, hero value, sparkline below
//                (HomeMinimal's 3-KPI hero strip)
//
// `hero` and `compact` booleans preserved for backwards compat.
// PillarRow is used by Issuer.jsx.
// HeroKpi detects value changes and applies the .nova-flash animation
// defined in tokens.css (respects prefers-reduced-motion via the global rule).
// Flash is gated by a relative-delta threshold so micro-ticks don't strobe.
import React, { useEffect, useRef, useState } from 'react';
import { NovaSpark } from './charts.jsx';

function useFlashOnValueChange(value, threshold = 0.005) {
  const prev = useRef(value);
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    const p = prev.current;
    if (p !== undefined && p !== value) {
      const pNum = typeof p === 'number' ? p : parseFloat(String(p).replace(/[^0-9.\-]/g, ''));
      const vNum = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
      const denom = Math.abs(pNum) || 1;
      const relDelta = Number.isFinite(pNum) && Number.isFinite(vNum)
        ? Math.abs((vNum - pNum) / denom)
        : 1;
      if (relDelta > threshold) setFlashKey((k) => k + 1);
    }
    prev.current = value;
  }, [value, threshold]);
  return flashKey;
}

export function HeroKpi({
  label,
  value,
  delta,
  deltaSuffix = '%',
  spark,
  hero,
  compact,
  tone,
  variant,
  // Filter-tile behavior: when onClick is provided, the tile renders as a
  // pressable button. `selected` triggers the hero treatment (accent top
  // bar + subtle bg tint) so one tile in a band visually reads as "active."
  onClick,
  selected,
}) {
  // Resolve variant: explicit > compact flag > hero flag > 'default'
  const v = variant ?? (compact ? 'compact' : hero ? 'hero' : 'default');
  const isLarge = v === 'large';
  const isCompact = v === 'compact';
  const isHero = v === 'hero' || hero === true || selected === true;
  const interactive = typeof onClick === 'function';

  const up = (delta ?? 0) >= 0;
  const suffix = deltaSuffix;
  const isNeutral = tone === 'neutral';
  const deltaColor = isNeutral ? 'var(--ink-3)' : (up ? 'var(--pos)' : 'var(--neg)');
  const flashKey = useFlashOnValueChange(value);

  // Large variant is a minimal typographic layout — no tile chrome.
  if (isLarge) {
    return (
      <div style={{display:'flex', flexDirection:'column', gap:8, padding:'8px 0'}}>
        <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-4)', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase'}}>{label}</div>
        <div key={flashKey} className={flashKey ? 'nova-flash mono' : 'mono'} style={{fontSize:'var(--fs-hero)', fontWeight:600, letterSpacing:'-0.03em', color:'var(--ink)', lineHeight:1}}>{value}</div>
        <div style={{display:'flex', alignItems:'center', gap:12, marginTop:4}}>
          {delta != null && (
            <div className="mono" aria-label={`${up?'up':'down'} ${Math.abs(delta).toFixed(2)}${suffix}`} style={{fontSize:'var(--fs-sm)', color:deltaColor, fontWeight:600}}>
              <span aria-hidden="true">{up ? '▲' : '▼'}</span> {Math.abs(delta).toFixed(2)}{suffix}
            </div>
          )}
          {spark && <NovaSpark data={spark} width={120} height={22} grad color={deltaColor}/>}
        </div>
      </div>
    );
  }

  // Default / compact / hero variants share tile chrome.
  // Interactive-but-not-selected tiles use a stronger border + subtle shadow
  // so users can see at-a-glance which tiles are pressable vs display-only.
  const tilePadding = isCompact ? '14px 14px' : '18px 20px';
  const valueFontSize = isCompact ? 'var(--fs-xl)' : 'var(--fs-kpi)';
  const deltaAria = delta != null ? `${up ? 'up' : 'down'} ${Math.abs(delta).toFixed(2)}${suffix}` : '';

  const interactiveIdle = interactive && !isHero;
  const tileBorder = isHero
    ? 'var(--line)'
    : interactiveIdle ? 'var(--line)' : 'var(--line-faint)';
  const tileBoxShadow = interactiveIdle ? 'var(--shadow-xs)' : 'none';

  const Root = interactive ? 'button' : 'div';
  return (
    <Root
      key={flashKey}
      className={flashKey ? 'nova-flash' : undefined}
      {...(interactive ? {
        type: 'button',
        onClick,
        'aria-pressed': selected ? 'true' : 'false',
        title: 'Click to sort by this metric',
      } : {})}
      style={{
        background: isHero ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'transparent',
        border: '1px solid ' + tileBorder,
        borderRadius:'var(--radius-lg)',
        padding: tilePadding,
        position:'relative',
        overflow:'hidden',
        boxShadow: tileBoxShadow,
        minWidth:0,
        textAlign: interactive ? 'left' : undefined,
        width: interactive ? '100%' : undefined,
        cursor: interactive ? 'pointer' : undefined,
        transition: 'background 120ms, border-color 120ms, box-shadow 120ms',
      }}
      {...(interactive ? {
        onMouseEnter: (e) => { if (!selected) e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 2%, transparent)'; },
        onMouseLeave: (e) => { if (!selected) e.currentTarget.style.background = 'transparent'; },
        onFocus:      (e) => { if (!selected) e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 2%, transparent)'; },
        onBlur:       (e) => { if (!selected) e.currentTarget.style.background = 'transparent'; },
      } : {})}>
      {isHero && <div aria-hidden="true" style={{position:'absolute', top:0, left:0, right:0, height:3, background:'var(--grad)'}}/>}
      <div style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500, marginBottom: isCompact ? 8 : 10}}>{label}</div>
      <div className="mono" style={{fontSize: valueFontSize, fontWeight:600, letterSpacing:'-0.025em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{value}</div>
      {delta != null && (
        <div style={{display:'flex', alignItems:'center', gap:8, marginTop: isCompact ? 8 : 10}}>
          <div className="mono" aria-label={deltaAria} style={{fontSize:'var(--fs-2xs)', color:deltaColor, display:'flex', alignItems:'center', gap:2, padding:'2px 6px', background: isNeutral ? 'var(--bg-sunken)' : (up ? 'var(--pos-soft)' : 'var(--neg-soft)'), borderRadius:5, fontWeight:500, flexShrink:0}}>
            <span aria-hidden="true" style={{fontSize:7}}>{up?'▲':'▼'}</span>{Math.abs(delta).toFixed(2)}{suffix}
          </div>
          {spark && <div aria-hidden="true" style={{flex:1, minWidth:0}}><NovaSpark data={spark} width={isCompact ? 80 : 120} height={20} grad color={isHero ? 'var(--accent)' : deltaColor}/></div>}
        </div>
      )}
    </Root>
  );
}

export function PillarRow({label, value, color}) {
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
        <span style={{width:20, height:20, borderRadius:'var(--radius-sm)', background:color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:'var(--fs-2xs)'}}>{label}</span>
        <span style={{fontSize:'var(--fs-xs)', color:'var(--ink-3)', flex:1}}>Score out of 100</span>
        <span className="mono" style={{fontWeight:600, fontSize:'var(--fs-lg)'}}>{value}</span>
      </div>
      <div style={{height:8, background:'var(--bg-sunken)', borderRadius:'var(--radius-sm)', overflow:'hidden'}}>
        <div style={{width:`${value}%`, height:'100%', background:`linear-gradient(90deg, ${color}66, ${color})`, borderRadius:'var(--radius-sm)'}}/>
      </div>
    </div>
  );
}
