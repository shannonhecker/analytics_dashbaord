// Multi-series gradient areaspline. Replaces NovaArea.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';
import { Highcharts, resolveColor } from './setup.js';
import { PanelEmpty, EMPTY_ICONS } from '../panel-states.jsx';

// Build a vertical gradient from a series color: top 35% opacity → bottom 0%.
// Matches the CardPreview thumbnail spec exactly so panel charts and card thumbs
// share the same visual DNA.
function gradientFill(color) {
  const base = resolveColor(color);
  const stops = [
    [0, Highcharts.color(base).setOpacity(0.45).get('rgba')],
    [0.5, Highcharts.color(base).setOpacity(0.15).get('rgba')],
    [1, Highcharts.color(base).setOpacity(0).get('rgba')],
  ];
  return { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops };
}

export function HxArea({ series, labels, height = 260, smooth = true, showLegend = true, ariaLabel }) {
  const hasData = Array.isArray(series) && series.length > 0 && series.some((s) => Array.isArray(s?.data) && s.data.length > 0);
  if (!hasData) return <div style={{height}}><PanelEmpty icon={EMPTY_ICONS.chart} title="No data" helper="No series available for this period."/></div>;

  const options = useMemo(() => ({
    chart: { type: smooth ? 'areaspline' : 'area' },
    xAxis: { categories: labels, tickLength: 0 },
    yAxis: { gridLineWidth: 1 },
    tooltip: { shared: true },
    legend: { enabled: showLegend },
    plotOptions: {
      series: {
        states: { inactive: { opacity: 0.2 } },
        events: {
          // Series highlight: dim others on hover (uses Highcharts built-in inactive state)
        },
      },
    },
    series: series.map((s) => ({
      name: s.name,
      data: s.data,
      color: s.color,
      fillColor: gradientFill(s.color || Highcharts.getOptions().colors[0]),
      lineWidth: 2,
    })),
  }), [series, labels, smooth, showLegend]);

  return <HxChart options={options} height={height}/>;
}
