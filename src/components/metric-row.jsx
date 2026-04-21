// Row primitives — shared across HomeMinimal / HomeDense and anywhere else
// a "severity alert row" or "label + bar + value" pattern is needed.
//
// NovaAlertRow: severity dot + category eyebrow + text + meta [+ caret].
// NovaMetricRow: optional name + optional secondary + bar + value, with
//   `mode='signed'` (symmetric around centerline, for contribution/P&L bars)
//   or `mode='positive'` (left-anchored, for risk-factor/exposure bars).
//
// Both use only tokens. No hex/rgb in this file.
import React from 'react';

const SEV = {
  high: { dot:'var(--neg)',  bg:'var(--neg-soft)',  label:'High' },
  med:  { dot:'var(--warn)', bg:'var(--warn-soft)', label:'Medium' },
  low:  { dot:'var(--ink-4)', bg:'var(--bg-sunken)', label:'Low' },
};

/**
 * Unified severity alert row. Adopts the denser HomeDense grid template
 * (8px / 64px / 1fr / 28px) as canonical — matches the Carbon analytical
 * house style.
 *
 * Props: sev ('high'|'med'|'low'), cat, text, meta, onClick, showCaret?
 */
export function NovaAlertRow({ sev, cat, text, meta, onClick, showCaret = true }) {
  const s = SEV[sev] || SEV.low;
  const ariaLabel = `${s.label} severity, ${cat}: ${text}, ${meta}`;
  const hover = (e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 4%, transparent)'; };
  const leave = (e) => { e.currentTarget.style.background = 'transparent'; };
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display:'grid',
        gridTemplateColumns: showCaret ? '8px 72px 1fr 56px 16px' : '8px 72px 1fr 56px',
        gap:10, alignItems:'center',
        padding:'10px 8px', borderBottom:'1px solid var(--line-faint)',
        width:'100%', textAlign:'left', background:'transparent', cursor:'pointer',
        transition:'background 120ms',
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onFocus={hover}
      onBlur={leave}
    >
      <span aria-hidden="true" style={{width:6, height:6, borderRadius:'50%', background:s.dot}}/>
      <span aria-hidden="true" style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em'}}>{cat}</span>
      <span style={{fontSize:'var(--fs-sm)', color:'var(--ink-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{text}</span>
      <span aria-hidden="true" style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontFamily:'var(--font-mono)', textAlign:'right'}}>{meta}</span>
      {showCaret && <span aria-hidden="true" style={{fontSize:'var(--fs-md)', color:'var(--ink-4)', textAlign:'right'}}>›</span>}
    </button>
  );
}

/**
 * Unified bar-row primitive. Three common shapes collapse into this:
 *  - Contributors / movers: mode='signed' (bar centered at 0, +/- bps)
 *  - Risk factors / exposure: mode='positive' (bar anchored left, 0 to max)
 *  - Generic label + progress: mode='positive' without secondary
 *
 * Props:
 *   name       — primary label (e.g. ticker, factor name)
 *   secondary? — small caption (e.g. sector, exposure number as string)
 *   value      — number shown on the right
 *   valueFormat? — (v) => string, defaults to `${v>=0?'+':''}${v}`
 *   bar: {
 *     mode: 'signed' | 'positive',
 *     ratio: number 0-1 (fraction of bar to fill),
 *     color: css color (uses var(--pos) / var(--neg) automatically when
 *            signed + color omitted),
 *   }
 *   emphasis? — 'normal' | 'accent' (accent highlights the bar with the
 *               cool-to-accent gradient used on FactorRow)
 */
export function NovaMetricRow({
  name,
  secondary,
  value,
  valueFormat,
  bar,
  emphasis = 'normal',
}) {
  const pos = value >= 0;
  const fmtValue = valueFormat ? valueFormat(value) : `${pos ? '+' : ''}${value}`;
  const ratio = Math.max(0, Math.min(1, bar?.ratio ?? 0));

  // Auto-choose bar color when signed and no color override
  let barColor = bar?.color;
  if (!barColor) {
    barColor = bar?.mode === 'signed' ? (pos ? 'var(--pos)' : 'var(--neg)') : 'var(--c1)';
  }
  const barBackground = emphasis === 'accent'
    ? 'linear-gradient(90deg, var(--c2), var(--accent))'
    : barColor;

  const cols = secondary
    ? '52px 60px 1fr 56px'
    : '52px 1fr 60px';

  return (
    <div style={{
      display:'grid', gridTemplateColumns: cols, gap:10, alignItems:'center',
      fontSize:'var(--fs-xs)', padding:'7px 0',
    }}>
      <span className="mono" style={{color:'var(--ink-2)', fontWeight:500}}>{name}</span>
      {secondary && <span style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)'}}>{secondary}</span>}
      <div aria-hidden="true" style={{position:'relative', height:6, background:'var(--bg-sunken)', borderRadius:3, overflow:'hidden'}}>
        {bar?.mode === 'signed' && (
          <span style={{position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'var(--line)'}}/>
        )}
        <div style={{
          position:'absolute', top:0, bottom:0,
          left: bar?.mode === 'signed' ? (pos ? '50%' : `${50 - ratio * 50}%`) : '0',
          width: bar?.mode === 'signed' ? `${ratio * 50}%` : `${ratio * 100}%`,
          background: barBackground,
          opacity: emphasis === 'accent' ? 1 : 0.85,
          borderRadius: 1.5,
        }}/>
      </div>
      <span
        className="mono"
        style={{
          textAlign:'right',
          color: bar?.mode === 'signed' ? (pos ? 'var(--pos)' : 'var(--neg)') : 'var(--ink)',
          fontWeight:600,
        }}
      >{fmtValue}</span>
    </div>
  );
}
