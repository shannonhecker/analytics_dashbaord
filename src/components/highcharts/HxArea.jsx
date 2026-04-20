// Multi-series gradient areaspline. Replaces NovaArea.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';
import { Highcharts } from './setup.js';

// Build a vertical gradient from a series color: top 35% opacity → bottom 0%.
// Matches the CardPreview thumbnail spec exactly so panel charts and card thumbs
// share the same visual DNA.
function gradientFill(color) {
  const stops = [
    [0, Highcharts.color(color).setOpacity(0.35).get('rgba')],
    [1, Highcharts.color(color).setOpacity(0).get('rgba')],
  ];
  return { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops };
}

export function HxArea({ series, labels, height = 260, smooth = true, showLegend = true }) {
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
