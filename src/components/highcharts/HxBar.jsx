// Vertical bar (column) with optional secondary line series. Replaces NovaBar.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';

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
      chart: { type: 'column' },
      xAxis: { categories: groups, tickLength: 0 },
      yAxis: { gridLineWidth: 1 },
      legend: { enabled: showLegend },
      tooltip: { shared: true },
      plotOptions: {
        column: { pointPadding: 0.08, groupPadding: 0.12, borderRadius: 3 },
      },
      series: seriesArr,
    };
  }, [groups, series, compareLine, showLegend]);

  return <HxChart options={options} height={height}/>;
}
