// AG Grid cell renderers — sparkline, ticker badge, delta, heatmap, mini-bar.
import React from 'react';
import { NovaSpark, NovaBarMini, novaHeat, nfmt } from './charts.jsx';

export function SparklineCell({ value, data }) {
  const arr = Array.isArray(value) ? value : (Array.isArray(data?.spark) ? data.spark : null);
  if (!arr) return null;
  return (
    <div style={{display:'flex', alignItems:'center', height:'100%'}}>
      <NovaSpark data={arr} width={84} height={24} grad/>
    </div>
  );
}

export function TickerBadgeCell({ value, data, colDef }) {
  const code = (value || '').toString().slice(0,3).toUpperCase();
  const sub = data?.[colDef?.cellRendererParams?.subField || 'ccy'] || '';
  const color = data?.color || data?._badgeColor || 'var(--c1)';
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, height:'100%', minWidth:0}}>
      <div style={{
        width:28, height:28, borderRadius:'50%', background:color, color:'white',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'var(--fs-2xs)', fontWeight:700, fontFamily:'var(--font-mono)', flexShrink:0,
      }}>{code}</div>
      <div style={{minWidth:0, display:'flex', alignItems:'baseline', gap:8}}>
        <span style={{fontSize:'var(--fs-md)', fontWeight:500, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0}}>{value}</span>
        {sub && <span style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0}}>{sub}</span>}
      </div>
    </div>
  );
}

export function DeltaCell({ value, valueFormatted }) {
  if (value == null) return null;
  const up = value >= 0;
  const abs = Math.abs(value);
  const display = valueFormatted ?? `${abs.toFixed(2)}%`;
  const sign = up ? '+' : '−'; // U+2212 minus (matches width of +)
  return (
    <span
      className="tab-nums"
      aria-label={`${up ? 'up' : 'down'} ${display}`}
      style={{color: up?'var(--pos)':'var(--neg)', fontWeight:500}}
    >
      {sign}{display}
    </span>
  );
}

const MONEY_FMT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export function MoneyCell({ value, valueFormatted, data, colDef }) {
  if (value == null) return null;
  const params = colDef?.cellRendererParams || {};
  const decimals = params.decimals;
  const useGrouped = params.grouped === true;
  const showCcy = params.showCcy === true;
  const ccy = showCcy ? (data?.ccy || '') : '';
  let display;
  if (valueFormatted != null) display = valueFormatted;
  else if (useGrouped) display = `$${MONEY_FMT.format(Math.round(value))}`;
  else display = `$${nfmt(value, decimals ?? 1)}`;
  return (
    <span className="tab-nums" style={{color:'var(--ink)', fontWeight:500}}>
      {display}
      {ccy && <span style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', fontWeight:500, marginLeft:6, textTransform:'uppercase', letterSpacing:'0.04em'}}>{ccy}</span>}
    </span>
  );
}

export function HeatmapCell({ value, colDef }) {
  if (value == null) return null;
  const center = colDef?.cellRendererParams?.center ?? 0;
  const domain = colDef?.cellRendererParams?.domain ?? [-5, 5];
  const bg = novaHeat(value - center, domain);
  const band = value > center ? 'above expected' : value < center ? 'below expected' : 'at expected';
  return (
    <div
      className="tab-nums"
      aria-label={`${value.toFixed(2)} — ${band}`}
      style={{
        // alignSelf: stretch overrides AG Grid's align-items:center on .ag-cell
        // so this block fills the full row height. Explicit height:100%
        // + lineHeight:1 avoids optical drift from font metrics when the
        // default line-height would place text above the visual center.
        alignSelf:'stretch',
        height:'100%',
        width:'100%',
        padding:'0 14px',
        display:'flex', alignItems:'center', justifyContent:'center',
        lineHeight: 1,
        background: bg, fontWeight:500,
      }}
    >
      {value.toFixed(2)}
    </div>
  );
}

export function MiniBarCell({ value, colDef }) {
  if (value == null) return null;
  const max = colDef?.cellRendererParams?.max ?? 100;
  const color = colDef?.cellRendererParams?.color ?? 'var(--c1)';
  return (
    <div style={{height:'100%', display:'flex', alignItems:'center'}}>
      <NovaBarMini value={value} max={max} color={color}/>
    </div>
  );
}

export function ChipCell({ value, colDef }) {
  const color = colDef?.cellRendererParams?.colorMap?.[value] || 'var(--ink-3)';
  const tone = colDef?.cellRendererParams?.toneMap?.[value];
  const bg = tone
    ? { pos:'var(--pos-soft)', neg:'var(--neg-soft)', neutral:'var(--bg-sunken)', accent:'var(--accent-soft)' }[tone] || 'var(--bg-sunken)'
    : 'var(--bg-sunken)';
  return (
    <span style={{
      fontSize:'var(--fs-xs)', padding:'3px 9px', border:0, borderRadius:10,
      color, background: bg, fontWeight:600, letterSpacing:'0.01em',
      display:'inline-flex', alignItems:'center',
    }}>{value}</span>
  );
}

export function LinkCell({ value }) {
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:8, color:'var(--accent)', fontWeight:500}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{opacity:0.7, flexShrink:0}}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
      </svg>
      <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value}</span>
    </span>
  );
}
