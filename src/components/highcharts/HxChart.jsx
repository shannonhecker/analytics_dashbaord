// Generic Highcharts wrapper — handles setup + reflow on container resize.
import React, { useEffect, useMemo, useRef } from 'react';
import HighchartsReact from 'highcharts-react-official';
import { Highcharts, setupHighcharts } from './setup.js';

setupHighcharts();

export function HxChart({ options, height = 260, allowChartUpdate = true }) {
  const ref = useRef(null);
  const containerRef = useRef(null);

  const merged = useMemo(
    () => ({
      ...options,
      chart: { ...(options?.chart || {}), height },
    }),
    [options, height]
  );

  // Reflow on container resize (panels can grow when sub-header height changes etc.)
  useEffect(() => {
    if (!containerRef.current || !ref.current?.chart) return;
    const ro = new ResizeObserver(() => ref.current?.chart?.reflow());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      <HighchartsReact
        ref={ref}
        highcharts={Highcharts}
        options={merged}
        allowChartUpdate={allowChartUpdate}
        immutable={false}
      />
    </div>
  );
}
