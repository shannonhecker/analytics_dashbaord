// Generic Highcharts wrapper — handles setup + reflow on container resize.
// Shows a skeleton on the first paint before Highcharts has rendered.
// Renders PanelError if Highcharts init throws (corrupted data, missing module).
import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import { Highcharts, setupHighcharts } from './setup.js';
import { PanelSkeleton, PanelError } from '../panel-states.jsx';

setupHighcharts();

// Narrow error boundary — catches render-time Highcharts exceptions so a
// bad series doesn't blank out the whole screen. Screens can't retry a
// chart (no external fetch), so the error state is terminal for that
// instance; reload to recover.
class ChartErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error('[HxChart] render failed:', err); }
  render() {
    if (this.state.err) {
      return <div style={{ width:'100%', height: this.props.height }}><PanelError message="Chart failed to render"/></div>;
    }
    return this.props.children;
  }
}

export function HxChart({ options, height = 260, allowChartUpdate = true, ariaLabel }) {
  return (
    <ChartErrorBoundary height={height}>
      <HxChartInner options={options} height={height} allowChartUpdate={allowChartUpdate} ariaLabel={ariaLabel}/>
    </ChartErrorBoundary>
  );
}

function HxChartInner({ options, height, allowChartUpdate, ariaLabel }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const merged = useMemo(
    () => ({
      ...options,
      chart: {
        ...(options?.chart || {}),
        height,
        events: {
          ...(options?.chart?.events || {}),
          load() {
            options?.chart?.events?.load?.call(this);
            requestAnimationFrame(() => setMounted(true));
          },
        },
      },
    }),
    [options, height]
  );

  useEffect(() => {
    if (!containerRef.current || !ref.current?.chart) return;
    const ro = new ResizeObserver(() => ref.current?.chart?.reflow());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      style={{ width: '100%', height, position:'relative' }}
    >
      <HighchartsReact
        ref={ref}
        highcharts={Highcharts}
        options={merged}
        allowChartUpdate={allowChartUpdate}
        immutable={false}
      />
      {!mounted && (
        <div style={{position:'absolute', inset:0, background:'var(--bg-elev)', display:'flex', alignItems:'center', padding:'20px 24px'}}>
          <div style={{width:'100%'}}><PanelSkeleton rows={4}/></div>
        </div>
      )}
    </div>
  );
}
