// PanelSkeleton / PanelError / PanelEmpty — shared states for data panels.
// All three obey prefers-reduced-motion via tokens.css global branch.
import React from 'react';

const SHIMMER_KEY = 'nova-shimmer';

// One-shot style injection for the shimmer keyframes (can't use CSS var in
// keyframes directly; token-driven colors applied inline on elements).
if (typeof document !== 'undefined' && !document.getElementById(SHIMMER_KEY)) {
  const style = document.createElement('style');
  style.id = SHIMMER_KEY;
  style.textContent = `
    @keyframes nova-shimmer {
      0% { opacity: 0.55; }
      50% { opacity: 1; }
      100% { opacity: 0.55; }
    }
    .nova-shimmer-row {
      animation: nova-shimmer 1.5s ease-in-out infinite;
      background: var(--bg-sunken);
      border-radius: var(--radius-sm);
      height: 12px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Skeleton rows for loading panels. Defaults to 5 rows at various widths.
 * Use inside a NovaPanel body, not as a panel replacement.
 */
export function PanelSkeleton({ rows = 5 }) {
  const widths = ['92%', '78%', '64%', '86%', '70%', '58%', '82%'];
  return (
    <div role="status" aria-label="Loading" style={{display:'flex', flexDirection:'column', gap:10, padding:'4px 0'}}>
      {Array.from({length: rows}).map((_, i) => (
        <div key={i} className="nova-shimmer-row" style={{width: widths[i % widths.length]}}/>
      ))}
    </div>
  );
}

/**
 * Error state — centered stack with severity dot + message + retry button.
 */
export function PanelError({ message = 'Failed to load', onRetry }) {
  return (
    <div role="alert" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:'32px 16px', minHeight:120}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span aria-hidden="true" style={{width:8, height:8, borderRadius:'50%', background:'var(--neg)'}}/>
        <span style={{fontSize:'var(--fs-sm)', color:'var(--ink-2)', fontWeight:500}}>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="nova-link" style={{padding:'4px 8px'}}>Retry →</button>
      )}
    </div>
  );
}

/**
 * Empty state — icon + title + helper copy + optional action.
 * Icon rendered at 32px via inline SVG so it inherits currentColor.
 */
export function PanelEmpty({
  icon,
  title,
  helper,
  action,
}) {
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:'40px 16px', minHeight:180, textAlign:'center'}}>
      {icon && (
        <div aria-hidden="true" style={{color:'var(--ink-4)', display:'flex'}}>
          {icon}
        </div>
      )}
      {title && <div style={{fontSize:'var(--fs-md)', color:'var(--ink-2)', fontWeight:600, letterSpacing:'-0.01em'}}>{title}</div>}
      {helper && <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-4)', maxWidth:280, lineHeight:1.5}}>{helper}</div>}
      {action && (
        <button onClick={action.onClick} className="nova-link" style={{padding:'4px 8px', marginTop:4}}>{action.label} →</button>
      )}
    </div>
  );
}

// Icon presets for common empty contexts. 32×32, currentColor, matches the
// house nav icon convention (strokeWidth 1.8).
export const EMPTY_ICONS = {
  grid: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="M3 9h18M9 4v16"/>
    </svg>
  ),
  inbox: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  chart: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M7 14l4-4 4 4 5-5"/>
    </svg>
  ),
  users: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

// Dataset → empty-state copy. Change copy here, not at call site.
export const EMPTY_COPY = {
  reports: {
    icon: EMPTY_ICONS.inbox,
    title: 'No saved reports yet',
    helper: 'Create a new analytics report from the Performance, Risk, or Sustainability dashboards and it will appear here.',
  },
  portfolios: {
    icon: EMPTY_ICONS.chart,
    title: 'No portfolios in view',
    helper: 'Adjust the filters above or load a workspace to see your portfolio breakdown.',
  },
  riskSummary: {
    icon: EMPTY_ICONS.grid,
    title: 'Risk data unavailable',
    helper: 'No funds match the current view. Try a different confidence interval or time period.',
  },
  sectorBreakdown: {
    icon: EMPTY_ICONS.grid,
    title: 'No sector exposure',
    helper: 'Holdings need to load before GICS sector breakdown can be calculated.',
  },
  peers: {
    icon: EMPTY_ICONS.users,
    title: 'No peer comparison',
    helper: 'Peer entities for this issuer haven\'t been identified. Try a different peer group from the filter above.',
  },
};
