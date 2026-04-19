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
    <div style={{display:'flex', alignItems:'center', gap:10, height:'100%'}}>
      <div style={{
        width:28, height:28, borderRadius:'50%', background:color, color:'white',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', flexShrink:0,
      }}>{code}</div>
      <div style={{minWidth:0, lineHeight:1.25}}>
        <div style={{fontSize:13, fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{value}</div>
        {sub && <div style={{fontSize:11, color:'var(--ink-4)'}}>{sub}</div>}
      </div>
    </div>
  );
}

export function DeltaCell({ value, valueFormatted }) {
  if (value == null) return null;
  const up = value >= 0;
  const display = valueFormatted ?? `${up?'+':''}${value.toFixed(2)}%`;
  return (
    <span className="mono" style={{color: up?'var(--pos)':'var(--neg)', fontWeight:600}}>
      {display}
    </span>
  );
}

export function MoneyCell({ value, valueFormatted, colDef }) {
  if (value == null) return null;
  const display = valueFormatted ?? `$${nfmt(value, colDef?.cellRendererParams?.decimals ?? 1)}`;
  return <span className="mono" style={{color:'var(--ink)', fontWeight:500}}>{display}</span>;
}

export function HeatmapCell({ value, colDef }) {
  if (value == null) return null;
  const center = colDef?.cellRendererParams?.center ?? 0;
  const domain = colDef?.cellRendererParams?.domain ?? [-5, 5];
  const bg = novaHeat(value - center, domain);
  return (
    <div className="mono" style={{
      width:'100%', height:'100%', padding:'0 14px', display:'flex', alignItems:'center', justifyContent:'flex-end',
      background: bg, fontWeight:500,
    }}>
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
  return (
    <span style={{
      fontSize:11, padding:'2px 8px', border:'1px solid var(--line)', borderRadius:4,
      color, background:'transparent', fontWeight:500,
    }}>{value}</span>
  );
}

export function LinkCell({ value }) {
  return <span style={{color:'var(--accent)', fontWeight:600}}>{value}</span>;
}
