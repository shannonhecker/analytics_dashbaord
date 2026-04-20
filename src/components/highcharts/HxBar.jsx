// Vertical bar (column) with optional secondary line series.
//
// Per-bar vertical gradient (top opacity 1.0 → bottom 0.45). Implementation:
//
// 1. Register one <linearGradient gradientUnits="objectBoundingBox" x1=0 y1=0
//    x2=0 y2=1> per series in the chart's <defs>, via Highcharts' official
//    SVGRenderer.definition() API.
// 2. After every render, walk each column point and override its fill with
//    `url(#<gradId>)`. Critically, with borderRadius>0 Highcharts renders
//    columns as <path> elements (not <rect>), so we accept both tags.
//
// Why this is needed: Highcharts' built-in `color: { linearGradient }` API
// hardcodes gradientUnits="userSpaceOnUse", so a bar-shaped gradient on the
// series color spans the entire chart canvas instead of each bar.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';

function applyBarGradients(chart) {
  if (!chart?.renderer || !chart.series) return;

  chart.series.forEach((series, si) => {
    if (series.type !== 'column') return;
    const baseColor = series.options.color;
    if (typeof baseColor !== 'string') return;

    const gradId = `nova-bar-grad-${chart.index}-${si}`;

    // Define gradient once per chart instance (Highcharts' SVGRenderer.definition
    // keeps it in <defs>, dedupes on subsequent calls).
    if (!chart._novaBarGradients?.[gradId]) {
      chart.renderer.definition({
        tagName: 'linearGradient',
        attributes: {
          id: gradId,
          gradientUnits: 'objectBoundingBox',
          x1: 0, y1: 0, x2: 0, y2: 1,
        },
        children: [
          { tagName: 'stop', attributes: { offset: '0%',   'stop-color': baseColor, 'stop-opacity': 1 } },
          { tagName: 'stop', attributes: { offset: '100%', 'stop-color': baseColor, 'stop-opacity': 0.45 } },
        ],
      });
      chart._novaBarGradients = { ...(chart._novaBarGradients || {}), [gradId]: true };
    }

    // Override fill on every column shape — accept rect (no borderRadius) AND
    // path (when borderRadius > 0, Highcharts uses path for the rounded shape).
    series.points.forEach((point) => {
      const el = point.graphic?.element;
      if (!el) return;
      if (el.tagName === 'rect' || el.tagName === 'path') {
        el.setAttribute('fill', `url(#${gradId})`);
      }
    });
  });
}

export function HxBar({ groups, series, compareLine, height = 260, showLegend = true }) {
  const options = useMemo(() => {
    const seriesArr = series.map((s) => ({
      type: 'column',
      name: s.name,
      data: s.data,
      color: s.color,
    }));
    if (compareLine) {
      seriesArr.push({
        type: 'spline',
        name: compareLine.name,
        data: compareLine.data,
        color: compareLine.color,
        lineWidth: 2,
        marker: { enabled: true, radius: 3, lineWidth: 2, fillColor: 'var(--bg-elev)' },
        zIndex: 5,
      });
    }
    return {
      chart: {
        type: 'column',
        events: {
          render() { applyBarGradients(this); },
        },
      },
      xAxis: { categories: groups, tickLength: 0 },
      yAxis: { gridLineWidth: 1 },
      legend: { enabled: showLegend },
      tooltip: { shared: true },
      plotOptions: {
        column: {
          pointPadding: 0.08,
          groupPadding: 0.12,
          borderRadius: 3,
          borderWidth: 0,
          states: { hover: { brightness: 0.1 } },
        },
      },
      series: seriesArr,
    };
  }, [groups, series, compareLine, showLegend]);

  return <HxChart options={options} height={height}/>;
}
