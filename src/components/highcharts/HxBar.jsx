// Vertical bar (column) with optional secondary line series. Replaces NovaBar.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';
import { carbonGradient } from './setup.js';
import { PanelEmpty, EMPTY_ICONS } from '../panel-states.jsx';

export function HxBar({ groups, series, compareLine, height = 260, showLegend = true }) {
  const hasData = Array.isArray(series) && series.length > 0 && series.some((s) => Array.isArray(s?.data) && s.data.length > 0);
  if (!hasData) return <div style={{height}}><PanelEmpty icon={EMPTY_ICONS.chart} title="No data" helper="No comparison available for this view."/></div>;

  const options = useMemo(() => {
    const seriesArr = series.map((s) => ({
      type: 'column',
      name: s.name,
      data: s.data,
      color: carbonGradient(s.color),
    }));
    if (compareLine) {
      seriesArr.push({
        type: 'spline',
        name: compareLine.name,
        data: compareLine.data,
        color: compareLine.color,
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 3.5,
          lineWidth: 1.5,
          fillColor: compareLine.color,
          lineColor: 'var(--bg-elev)',
          states: { hover: { radius: 5, lineWidth: 2, fillColor: compareLine.color, lineColor: 'var(--bg-elev)' } },
        },
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
        column: { pointPadding: 0.08, groupPadding: 0.12, borderRadius: 4 },
      },
      series: seriesArr,
    };
  }, [groups, series, compareLine, showLegend]);

  return <HxChart options={options} height={height}/>;
}
