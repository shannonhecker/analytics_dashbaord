// Donut/pie with center label + side legend. Replaces NovaDonut.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';

export function HxDonut({ segments, centerLabel, centerSub, height = 260 }) {
  const options = useMemo(() => ({
    chart: {
      type: 'pie',
      events: {
        // Render center label after chart initialises and on every redraw
        render() {
          const chart = this;
          if (chart._centerText) chart._centerText.destroy();
          if (chart._centerSubText) chart._centerSubText.destroy();
          const cx = chart.plotLeft + chart.plotWidth / 2;
          const cy = chart.plotTop + chart.plotHeight / 2;
          if (centerSub) {
            chart._centerSubText = chart.renderer
              .text(centerSub, cx, cy - 8)
              .css({ color: 'var(--ink-4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' })
              .attr({ align: 'center' })
              .add();
          }
          chart._centerText = chart.renderer
            .text(centerLabel, cx, cy + 12)
            .css({ color: 'var(--ink)', fontSize: '17px', fontWeight: '600', fontFamily: 'var(--font-mono)' })
            .attr({ align: 'center' })
            .add();
        },
      },
    },
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      labelFormatter() {
        const pct = this.percentage.toFixed(1);
        return `<span style="color:var(--ink-2)">${this.name}</span> <span style="color:var(--ink-4);font-family:var(--font-mono);margin-left:8px">${pct}%</span>`;
      },
      useHTML: true,
      itemMarginTop: 2,
      itemMarginBottom: 2,
    },
    tooltip: {
      shared: false,
      pointFormat:
        '<span style="font-family:var(--font-mono);font-weight:600">{point.percentage:.1f}%</span> · {point.y:.1f}',
    },
    plotOptions: {
      pie: {
        // Tighter inner ring to match the CardPreview donut thumbnail proportions.
        innerSize: '70%',
        // Carbon-flat: solid color slices, thin separator stroke against panel bg.
        borderWidth: 2,
        borderColor: 'var(--bg-elev)',
        dataLabels: { enabled: false },
        states: {
          hover: { halo: { size: 6, opacity: 0.15 }, brightness: 0.05 },
          inactive: { opacity: 0.4 },
        },
      },
    },
    series: [{
      name: centerSub || 'Total',
      colorByPoint: true,
      data: segments.map((s) => ({ name: s.label, y: s.value, color: s.color })),
    }],
  }), [segments, centerLabel, centerSub]);

  return <HxChart options={options} height={height}/>;
}
