// Vertical bar (column) with optional secondary line series.
// Each bar uses a vertical linear gradient (top opacity 1 → bottom 0.45) so
// columns visually fade from the top, matching the original NovaBar look in
// the user's reference screenshots.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';
import { Highcharts } from './setup.js';

// Per-series gradient: top fully opaque, bottom 45% — applied to each bar's
// bounding box in SVG (default behaviour with relative gradient coordinates).
function barGradient(color) {
  return {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
      [0, Highcharts.color(color).setOpacity(1).get('rgba')],
      [1, Highcharts.color(color).setOpacity(0.45).get('rgba')],
    ],
  };
}

export function HxBar({ groups, series, compareLine, height = 260, showLegend = true }) {
  const options = useMemo(() => {
    const seriesArr = series.map((s) => ({
      type: 'column',
      name: s.name,
      data: s.data,
      // `color` accepts a linearGradient — applied per-column, so each bar fades.
      color: barGradient(s.color),
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
      chart: { type: 'column' },
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
