// Vertical bar (column) with optional secondary line series.
//
// Per-bar vertical gradient (top opacity 1.0 → bottom 0.45). Fights three
// Highcharts/SVG quirks at once:
//
// 1. With borderRadius > 0, columns render as <path> elements (rounded
//    corners encoded as path commands), not <rect>. Filter both tags.
// 2. CSS variables (e.g. 'var(--c2)') don't resolve in SVG `stop-color` /
//    `fill` *attributes*. We resolve them to actual hex via getComputedStyle
//    before injecting into the gradient definition.
// 3. Highcharts often sets fill via inline `style="fill: ..."`, which beats
//    setAttribute('fill', ...) on specificity. We set BOTH the attribute
//    AND the inline style so the gradient URL wins.
//
// Defers via requestAnimationFrame so we run *after* Highcharts' render
// pipeline finishes painting columns.
import React, { useMemo } from 'react';
import { HxChart } from './HxChart.jsx';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Resolve `var(--name)` (or fallback expressions) to an actual color string.
function resolveColor(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  const match = trimmed.match(/var\(\s*(--[a-zA-Z0-9_-]+)/);
  if (!match) return trimmed;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return value || trimmed;
}

function ensureGradient(svg, defs, gradId, color) {
  if (defs.querySelector(`#${CSS.escape(gradId)}`)) return;
  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', gradId);
  grad.setAttribute('gradientUnits', 'objectBoundingBox');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');

  const top = document.createElementNS(SVG_NS, 'stop');
  top.setAttribute('offset', '0%');
  top.setAttribute('stop-color', color);
  top.setAttribute('stop-opacity', '1');

  const bottom = document.createElementNS(SVG_NS, 'stop');
  bottom.setAttribute('offset', '100%');
  bottom.setAttribute('stop-color', color);
  bottom.setAttribute('stop-opacity', '0.45');

  grad.appendChild(top);
  grad.appendChild(bottom);
  defs.appendChild(grad);
}

function applyBarGradients(chart) {
  const svg = chart.container?.querySelector('svg');
  if (!svg) return;

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  chart.series.forEach((series, si) => {
    if (series.type !== 'column') return;
    const resolved = resolveColor(series.options.color);
    if (!resolved) return;

    const gradId = `nova-bar-grad-${chart.index}-${si}`;
    ensureGradient(svg, defs, gradId, resolved);
    const fillRef = `url(#${gradId})`;

    series.points.forEach((point) => {
      const el = point.graphic?.element;
      if (!el) return;
      if (el.tagName !== 'rect' && el.tagName !== 'path') return;
      // Beat Highcharts' inline-style fill on specificity by setting both.
      el.setAttribute('fill', fillRef);
      el.style.fill = fillRef;
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
          load() {
            const chart = this;
            // Apply once after initial paint AND once more after the animation
            // settles (Highcharts repaints columns several times during animation
            // and can clobber our fill mid-flight).
            requestAnimationFrame(() => applyBarGradients(chart));
            setTimeout(() => applyBarGradients(chart), 800);
          },
          render() {
            const chart = this;
            requestAnimationFrame(() => applyBarGradients(chart));
          },
        },
      },
      xAxis: { categories: groups, tickLength: 0 },
      yAxis: { gridLineWidth: 1 },
      legend: { enabled: showLegend },
      tooltip: { shared: true },
      plotOptions: {
        series: {
          events: {
            afterAnimate() {
              // Fires when the series finishes animating in — guaranteed point
              // graphics exist by now and Highcharts is done re-painting.
              applyBarGradients(this.chart);
            },
          },
        },
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
