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

export function applyHighchartsTheme() {
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
      labels: { style: { color: v('--ink-4'), fontSize: '10px' } },
      crosshair: { color: v('--ink-4'), dashStyle: 'Dash', width: 1 },
    },
    yAxis: {
      lineColor: v('--line'),
      tickColor: v('--line'),
      gridLineColor: v('--line-faint'),
      labels: { style: { color: v('--ink-4'), fontSize: '10px', fontFamily: v('--font-mono') } },
      title: { text: null },
    },
    legend: {
      itemStyle: { color: v('--ink-3'), fontWeight: '500', fontSize: '11px' },
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
      backgroundColor: v('--bg-elev-2'),
      borderColor: v('--line-strong'),
      borderRadius: 8,
      borderWidth: 1,
      shadow: false,
      shared: true,
      useHTML: true,
      style: { color: v('--ink-2'), fontSize: '11px' },
      headerFormat:
        `<div style="font-size:10px;color:${v('--ink-4')};text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px">{point.key}</div>`,
      pointFormat:
        `<div style="display:flex;align-items:center;gap:8px;line-height:1.7"><span style="width:6px;height:6px;border-radius:50%;background:{series.color}"></span><span style="flex:1">{series.name}</span><span style="font-family:${v('--font-mono')};font-weight:600">{point.y:.2f}</span></div>`,
    },
    plotOptions: {
      series: {
        animation: { duration: 350 },
        states: {
          hover: { lineWidthPlus: 1, brightness: 0.05 },
          inactive: { opacity: 0.35 },
        },
        marker: { enabled: false, states: { hover: { enabled: true, radius: 4, lineWidth: 2, lineColor: v('--bg-elev') } } },
      },
      areaspline: { fillOpacity: 0.25, lineWidth: 2 },
      area:       { fillOpacity: 0.25, lineWidth: 2 },
      column:     { borderRadius: 3, borderWidth: 0, pointPadding: 0.08, groupPadding: 0.12 },
      pie:        { borderColor: v('--bg-elev'), borderWidth: 2, dataLabels: { enabled: false } },
      solidgauge: { dataLabels: { enabled: false } },
    },
    credits: {
      // Highcharts free-license attribution — required when not using a commercial key.
      enabled: true,
      style: { color: v('--ink-5'), fontSize: '9px' },
      position: { align: 'right', verticalAlign: 'bottom', x: -8, y: -4 },
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
