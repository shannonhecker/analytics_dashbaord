// Donut/pie with center label + side legend. Replaces NovaDonut.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';
import { Highcharts, resolveColor } from './setup.js';
import { PanelEmpty, EMPTY_ICONS } from '../panel-states.jsx';

// Highcharts renders center text via the SVG renderer's .css() — CSS vars
// don't always resolve on SVG text nodes across browsers, so we pull the
// token's computed value once per render.
function tokenPx(name) {
  if (typeof window === 'undefined') return undefined;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || undefined;
}

function sliceGradient(colorOrVar) {
  const base = resolveColor(colorOrVar);
  if (!base) return colorOrVar;
  return {
    radialGradient: { cx: 0.5, cy: 0.5, r: 0.7 },
    stops: [
      [0, Highcharts.color(base).brighten(0.18).get('rgba')],
      [1, base],
    ],
  };
}

export function HxDonut({ segments, centerLabel, centerSub, height = 260 }) {
  const hasData = Array.isArray(segments) && segments.some((s) => (s?.value ?? 0) > 0);
  if (!hasData) return <div style={{height}}><PanelEmpty icon={EMPTY_ICONS.chart} title="No allocation data" helper="No positions held in this view."/></div>;

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
              .css({ color: 'var(--ink-4)', fontSize: tokenPx('--fs-2xs') || '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em' })
              .attr({ align: 'center' })
              .add();
          }
          chart._centerText = chart.renderer
            .text(centerLabel, cx, cy + 12)
            .css({ color: 'var(--ink)', fontSize: tokenPx('--fs-xl') || '20px', fontWeight: '600', fontFamily: 'var(--font-mono)' })
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
        innerSize: '62%',
        borderWidth: 2,
        borderColor: 'var(--bg-elev)',
        states: {
          hover: { halo: { size: 6, opacity: 0.15 } },
          inactive: { opacity: 0.4 },
        },
      },
    },
    series: [{
      name: centerSub || 'Total',
      colorByPoint: true,
      data: segments.map((s) => ({ name: s.label, y: s.value, color: sliceGradient(s.color) })),
    }],
  }), [segments, centerLabel, centerSub]);

  return <HxChart options={options} height={height}/>;
}
