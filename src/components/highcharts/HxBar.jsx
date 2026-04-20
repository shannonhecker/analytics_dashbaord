// Vertical bar (column) with optional secondary line series.
//
// Per-bar vertical gradient (top opacity 1.0 → bottom 0.45) — implemented
// by injecting <linearGradient> definitions into the chart's <defs> with
// gradientUnits="objectBoundingBox" so each <rect> bar gets the gradient
// mapped to its own bounding box. Highcharts' built-in `color: {linearGradient}`
// API renders into userSpaceOnUse coordinates instead, which makes the gradient
// span the whole chart canvas — this hook fixes that.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';

const SVG_NS = 'http://www.w3.org/2000/svg';

function applyBarGradients(chart) {
  const svg = chart.container.querySelector('svg');
  if (!svg) return;
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  chart.series.forEach((series, si) => {
    if (series.type !== 'column') return;
    const baseColor = series.options.color;
    // Skip if color isn't a simple string (e.g. already a gradient object)
    if (typeof baseColor !== 'string') return;

    const gradId = `nova-bar-grad-${chart.index}-${si}`;
    if (!defs.querySelector(`#${gradId}`)) {
      const grad = document.createElementNS(SVG_NS, 'linearGradient');
      grad.setAttribute('id', gradId);
      grad.setAttribute('gradientUnits', 'objectBoundingBox');
      grad.setAttribute('x1', '0');
      grad.setAttribute('y1', '0');
      grad.setAttribute('x2', '0');
      grad.setAttribute('y2', '1');
      const stopTop = document.createElementNS(SVG_NS, 'stop');
      stopTop.setAttribute('offset', '0%');
      stopTop.setAttribute('stop-color', baseColor);
      stopTop.setAttribute('stop-opacity', '1');
      const stopBottom = document.createElementNS(SVG_NS, 'stop');
      stopBottom.setAttribute('offset', '100%');
      stopBottom.setAttribute('stop-color', baseColor);
      stopBottom.setAttribute('stop-opacity', '0.45');
      grad.appendChild(stopTop);
      grad.appendChild(stopBottom);
      defs.appendChild(grad);
    }

    // Apply gradient as fill on every column <rect> in this series.
    series.points.forEach((point) => {
      const el = point.graphic?.element;
      if (!el || el.tagName !== 'rect') return;
      el.setAttribute('fill', `url(#${gradId})`);
    });
  });
}

export function HxBar({ groups, series, compareLine, height = 260, showLegend = true }) {
  const options = useMemo(() => {
    const seriesArr = series.map((s) => ({
      type: 'column',
      name: s.name,
      data: s.data,
      color: s.color, // string — picked up by applyBarGradients hook
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
