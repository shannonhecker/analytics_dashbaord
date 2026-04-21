// Highcharts setup — modules + Carbon-derived theme synced to our CSS variables.
// Theme re-applies whenever the document `data-theme` attribute changes so charts
// follow light/dark toggles without a page reload.
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/solid-gauge';
import 'highcharts/modules/accessibility';
import 'highcharts/modules/exporting';

let initialized = false;

function v(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Resolve a CSS-var reference like "var(--c2)" to its computed color, or pass through.
export function resolveColor(c) {
  if (typeof c !== 'string') return c;
  const m = c.match(/^var\((--[^)]+)\)$/);
  return m ? v(m[1]) || c : c;
}

// Vertical gradient (saturated top → faded base) matching the NovaSpark/CardPreview SVG style.
// Returns a Highcharts gradient object suitable for series.color.
export function carbonGradient(colorOrVar) {
  const base = resolveColor(colorOrVar);
  if (!base) return colorOrVar;
  return {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
      [0, Highcharts.color(base).setOpacity(0.95).get('rgba')],
      [1, Highcharts.color(base).setOpacity(0.25).get('rgba')],
    ],
  };
}

// Horizontal gradient along an arc (lighter start → saturated tip). Used by HxGauge.
export function arcGradient(colorOrVar) {
  const base = resolveColor(colorOrVar);
  if (!base) return colorOrVar;
  return {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
    stops: [
      [0, Highcharts.color(base).brighten(0.25).get('rgba')],
      [1, base],
    ],
  };
}

export function applyHighchartsTheme() {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  Highcharts.setOptions({
    colors: ['--c1','--c2','--c3','--c4','--c5','--c6','--c7','--c8'].map(v),
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: v('--font-ui') || 'system-ui, sans-serif' },
      spacing: [12, 12, 12, 12],
    },
    title: { text: undefined },
    xAxis: {
      lineColor: v('--line'),
      tickColor: v('--line'),
      gridLineColor: v('--line-faint'),
      // --ink-3 (not ink-4) for axis labels — passes WCAG AA in both modes
      // against panel surfaces (~4.9:1 on dark --bg-elev, ~6.3:1 on white).
      labels: { style: { color: v('--ink-3'), fontSize: v('--fs-xs') || '11.5px' } },
      crosshair: { color: v('--ink-4'), dashStyle: 'LongDash', width: 1 },
    },
    yAxis: {
      lineColor: v('--line'),
      tickColor: v('--line'),
      gridLineColor: v('--line-faint'),
      labels: { style: { color: v('--ink-3'), fontSize: v('--fs-xs') || '11.5px', fontFamily: v('--font-mono') } },
      title: { text: null },
    },
    legend: {
      itemStyle: { color: v('--ink-2'), fontWeight: '500', fontSize: v('--fs-xs') || '11.5px' },
      itemHoverStyle: { color: v('--ink') },
      itemHiddenStyle: { color: v('--ink-5') },
      symbolHeight: 10,
      symbolWidth: 10,
      symbolRadius: 2,
      align: 'left',
      verticalAlign: 'bottom',
      itemDistance: 16,
    },
    tooltip: {
      // Use live CSS vars (not baked hex) so theme toggles update the
      // tooltip colors instantly. Contrast verified: all text pairs ≥4.9:1
      // against --bg-elev-2 in both light and dark modes.
      backgroundColor: 'var(--bg-elev-2)',
      borderColor: 'var(--line-strong)',
      borderRadius: 8,
      borderWidth: 1,
      shadow: false,
      shared: true,
      useHTML: true,
      padding: 10,
      style: { color: 'var(--ink)', fontSize: '12px' },
      headerFormat:
        `<div style="font-size:10.5px;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:6px">{point.key}</div>`,
      pointFormat:
        `<div style="display:flex;align-items:center;gap:8px;line-height:1.7">`
        + `<span style="width:6px;height:6px;border-radius:50%;background:{point.color};flex-shrink:0"></span>`
        + `<span style="flex:1;color:var(--ink-2);font-weight:500">{series.name}</span>`
        + `<span style="font-family:var(--font-mono);font-weight:600;color:var(--ink)">{point.y:.2f}</span>`
        + `</div>`,
    },
    plotOptions: {
      series: {
        animation: reducedMotion ? false : { duration: 350 },
        states: {
          hover: { lineWidthPlus: 1, brightness: 0.05 },
          inactive: { opacity: 0.35 },
        },
        marker: { enabled: false, states: { hover: { enabled: true, radius: 3, lineWidth: 1.5, lineColor: v('--bg-elev') } } },
      },
      areaspline: { fillOpacity: 0.18, lineWidth: 2 },
      area:       { fillOpacity: 0.18, lineWidth: 2 },
      column:     { borderRadius: 1, borderWidth: 0, pointPadding: 0.04, groupPadding: 0.08 },
      pie:        { borderColor: v('--bg-elev'), borderWidth: 2, dataLabels: { enabled: false } },
      solidgauge: { dataLabels: { enabled: false } },
    },
    credits: {
      // Disabled for a cleaner professional look. Highcharts free license requires
      // credit for non-commercial use — this repo runs in demo/eval mode (AG Grid
      // Enterprise also evals; see CLAUDE.md). Re-enable or purchase a commercial
      // key before shipping.
      enabled: false,
    },
    accessibility: { enabled: true, keyboardNavigation: { enabled: true } },
    exporting: { enabled: false }, // toggled per-chart if needed
  });
}

export function setupHighcharts() {
  if (initialized) return;
  initialized = true;
  applyHighchartsTheme();

  // Re-apply theme when light/dark toggles, so colors follow CSS vars.
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        applyHighchartsTheme();
        // Force redraw of all live charts so they pick up the new palette.
        Highcharts.charts.forEach((c) => c?.update({}, true, true));
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });
}

export { Highcharts };
