// Half-circle solid gauge. Replaces NovaGauge.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';

export function HxGauge({ value, min = 0, max = 10, label, color = 'var(--accent)', large = false, height }) {
  const computedHeight = height ?? (large ? 200 : 160);
  const options = useMemo(() => ({
    chart: { type: 'solidgauge', spacing: [4, 4, 4, 4] },
    pane: {
      center: ['50%', '78%'],
      size: '160%',
      startAngle: -90,
      endAngle: 90,
      background: [{
        backgroundColor: 'var(--bg-sunken)',
        innerRadius: '88%',
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
        innerRadius: '88%',
        radius: '100%',
        rounded: true,
        dataLabels: {
          enabled: true,
          y: -16,
          borderWidth: 0,
          useHTML: true,
          format:
            `<div style="text-align:center"><div style="font-size:${large ? '32px' : '24px'};font-weight:700;font-family:var(--font-mono);color:var(--ink);letter-spacing:-0.02em">{y:.2f}</div><div style="font-size:10.5px;color:var(--ink-4);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${label || ''}</div></div>`,
        },
      },
    },
    series: [{ name: label, data: [{ y: value, color }] }],
  }), [value, min, max, label, color, large]);

  return <HxChart options={options} height={computedHeight}/>;
}
