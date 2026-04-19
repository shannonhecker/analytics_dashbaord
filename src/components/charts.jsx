// Chart utilities — kept lightweight (used inside AG Grid cells and tiny thumbnails).
// Larger panel charts moved to Highcharts (see ./highcharts/).
import React, { useId } from 'react';

// Number formatter — used by Highcharts tooltips, MoneyCell, AG Grid valueFormatters.
export function nfmt(n, d = 2) {
  if (n == null) return '–';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(d) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(d) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(d) + 'K';
  return n.toFixed(d);
}

// Heatmap background color helper — used by HeatmapCell.
// Returns an oklch value tinted positive (teal) or negative (red) based on the
// signed distance from the cell's expected center value.
export function novaHeat(v, domain = [-5, 5]) {
  if (v == null) return 'transparent';
  const [a, b] = domain;
  const t = Math.max(-1, Math.min(1, v >= 0 ? v / b : -(v / a)));
  if (t === 0) return 'transparent';
  const hue = t > 0 ? 160 : 12;
  return `oklch(40% ${Math.abs(t) * 0.12} ${hue} / ${0.2 + Math.abs(t) * 0.4})`;
}

// Sparkline — small inline area chart. Used in HeroKpi tiles and AG Grid SparklineCell.
// Stays as raw SVG (faster than spinning up Highcharts per row).
export function NovaSpark({ data, width = 80, height = 22, color, grad }) {
  const id = useId();
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * height * 0.8 - height * 0.1,
  ]);
  const last = data[data.length - 1], first = data[0];
  const col = color || (last >= first ? 'var(--pos)' : 'var(--neg)');
  const path = 'M' + pts.map(p => `${p[0]} ${p[1]}`).join(' L ');
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.35" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grad && <path d={area} fill={`url(#sg-${id})`} />}
      <path d={path} stroke={col} strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={col} />
    </svg>
  );
}

// Single-row progress bar used in MiniBarCell.
export function NovaBarMini({ value, max = 100, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-sunken)', borderRadius: 3, overflow: 'hidden', minWidth: 40 }}>
        <div style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color || 'var(--accent)'}, ${color || 'var(--accent-2)'})`,
          borderRadius: 3,
        }} />
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', minWidth: 38, textAlign: 'right' }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}

// Mini chart preview thumbnails for the workspace cards on Home.
// Hand-rolled SVG — these are static decorative thumbs, no need for Highcharts.
export function CardPreview({ kind, color = 'var(--accent)' }) {
  const W = 260, H = 64;
  const gid = useId();
  if (kind === 'area') {
    const pts = [58, 52, 55, 48, 44, 46, 40, 36, 32, 28, 30, 24, 20, 22, 16, 12];
    const step = W / (pts.length - 1);
    const d = pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * step},${y}`).join(' ');
    const fill = `${d} L${W},${H} L0,${H} Z`;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#${gid})`} />
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'bars') {
    const vals = [28, 42, 35, 48, 52, 38, 44, 58, 46, 50, 36, 54];
    const bw = W / vals.length - 3;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {vals.map((v, i) => (
          <rect key={i} x={i * (bw + 3)} y={H - v} width={bw} height={v} rx="1.5" fill={color} opacity={0.4 + (v / 60) * 0.6} />
        ))}
      </svg>
    );
  }
  if (kind === 'gauge') {
    const cx = W / 2, cy = H - 6, r = 38;
    const pct = 0.62;
    const start = Math.PI, end = 0;
    const a = start + (end - start) * pct;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const xp = cx + r * Math.cos(a),     yp = cy + r * Math.sin(a);
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" style={{ display: 'block' }}>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke="var(--line)" strokeWidth="5" strokeLinecap="round" />
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xp},${yp}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <circle cx={xp} cy={yp} r="4" fill={color} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="14" fill="var(--ink)" letterSpacing="-0.02em">5.50</text>
      </svg>
    );
  }
  if (kind === 'donut') {
    const cx = W / 2, cy = H / 2 + 2, r = 24, rr = 16;
    const segs = [
      { v: 0.42, c: color },
      { v: 0.28, c: 'var(--c2)' },
      { v: 0.18, c: 'var(--c4)' },
      { v: 0.12, c: 'var(--c6)' },
    ];
    let a0 = -Math.PI / 2;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {segs.map((s, i) => {
          const a1 = a0 + s.v * Math.PI * 2;
          const large = s.v > 0.5 ? 1 : 0;
          const x1 = cx + r * Math.cos(a0),  y1 = cy + r * Math.sin(a0);
          const x2 = cx + r * Math.cos(a1),  y2 = cy + r * Math.sin(a1);
          const x3 = cx + rr * Math.cos(a1), y3 = cy + rr * Math.sin(a1);
          const x4 = cx + rr * Math.cos(a0), y4 = cy + rr * Math.sin(a0);
          const d = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rr},${rr} 0 ${large} 0 ${x4},${y4} Z`;
          a0 = a1;
          return <path key={i} d={d} fill={s.c} />;
        })}
        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="12" fill="var(--ink)" letterSpacing="-0.02em">AA</text>
      </svg>
    );
  }
  return null;
}
