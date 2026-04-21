// Half-circle solid gauge.
// Variants:
//   default — standard 160h gauge, value + label stacked in arc center
//   compact — 120h, value only
//   large   — 200h, bigger value + label
//   thumb   — bare arc only, no text, any height — for card previews
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';
import { arcGradient } from './setup.js';

export function HxGauge({ value, min = 0, max = 10, label, color = 'var(--accent)', large = false, compact = false, thumb = false, height }) {
  const computedHeight = height ?? (thumb ? 60 : large ? 200 : compact ? 120 : 160);
  const paneSize = thumb ? '175%' : compact ? '105%' : large ? '135%' : '130%';
  const paneCenterY = thumb ? '92%' : '78%';
  const valueFs = compact ? '20px' : large ? '32px' : '24px';

  const options = useMemo(() => ({
    chart: { type: 'solidgauge', spacing: [2, 2, 2, 2], margin: thumb ? [0, 0, 0, 0] : undefined },
    pane: {
      center: ['50%', paneCenterY],
      size: paneSize,
      startAngle: -90,
      endAngle: 90,
      // Carbon-flat track: thin sunken arc matching the CardPreview gauge thumb.
      background: [{
        backgroundColor: 'var(--bg-sunken)',
        innerRadius: '92%',
        outerRadius: '100%',
        shape: 'arc',
        borderWidth: 0,
      }],
    },
    yAxis: {
      min,
      max,
      lineWidth: 0,
      tickPositions: [],
      gridLineWidth: 0,
      labels: { enabled: false },
      title: { text: null },
    },
    tooltip: { enabled: false },
    legend: { enabled: false },
    plotOptions: {
      solidgauge: {
        // Match track radii so fill sits cleanly on the sunken track.
        innerRadius: '92%',
        radius: '100%',
        rounded: true,
        dataLabels: thumb
          ? { enabled: false }
          : {
              enabled: true,
              y: compact ? -8 : -16,
              borderWidth: 0,
              useHTML: true,
              format: compact
                ? `<div style="text-align:center"><div style="font-size:${valueFs};font-weight:700;font-family:var(--font-mono);color:var(--ink);letter-spacing:-0.02em">{y:.2f}</div></div>`
                : `<div style="text-align:center"><div style="font-size:${valueFs};font-weight:700;font-family:var(--font-mono);color:var(--ink);letter-spacing:-0.02em">{y:.2f}</div><div style="font-size:var(--fs-2xs);color:var(--ink-4);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${label || ''}</div></div>`,
            },
      },
    },
    series: [{ name: label, data: [{ y: value, color: arcGradient(color) }] }],
  }), [value, min, max, label, color, paneSize, paneCenterY, valueFs, compact, thumb]);

  return <HxChart options={options} height={computedHeight}/>;
}
