// Inline SVG flag registry. Simplified forms — recognizable at 16×12, not
// geopolitically complete. Add a flag here before rendering a new market.
// Fallback renders a typographic country code pill so missing markets never
// break the layout.
import React from 'react';

const VB = '0 0 16 12';
const common = { width:16, height:12, viewBox:VB, 'aria-hidden':'true', style:{flexShrink:0, display:'block', borderRadius:2} };

// Each entry: name (for aria), render function returning <svg>.
const REGISTRY = {
  US: {
    name: 'United States',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#fff"/>
        {[1,3,5,7,9,11].map(y => <rect key={y} x="0" y={y} width="16" height="1" fill="#b22234"/>)}
        <rect width="7" height="6" fill="#3c3b6e"/>
      </svg>
    ),
  },
  UK: {
    name: 'United Kingdom',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#012169"/>
        <path d="M0 0 L16 12 M16 0 L0 12" stroke="#fff" strokeWidth="2"/>
        <path d="M0 0 L16 12 M16 0 L0 12" stroke="#c8102e" strokeWidth="1"/>
        <rect x="7" width="2" height="12" fill="#fff"/>
        <rect y="5" width="16" height="2" fill="#fff"/>
        <rect x="7.5" width="1" height="12" fill="#c8102e"/>
        <rect y="5.5" width="16" height="1" fill="#c8102e"/>
      </svg>
    ),
  },
  EU: {
    name: 'European Union',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#003399"/>
        <circle cx="8" cy="6" r="2.5" fill="none" stroke="#ffcc00" strokeWidth="0.5" strokeDasharray="0.4 0.9"/>
      </svg>
    ),
  },
  JP: {
    name: 'Japan',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#fff"/>
        <circle cx="8" cy="6" r="3.2" fill="#bc002d"/>
      </svg>
    ),
  },
  CN: {
    name: 'China',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#de2910"/>
        <path d="M3 2.2 L3.6 3.8 L5.2 3.8 L3.9 4.8 L4.4 6.4 L3 5.4 L1.6 6.4 L2.1 4.8 L0.8 3.8 L2.4 3.8 Z" fill="#ffde00"/>
      </svg>
    ),
  },
  DE: {
    name: 'Germany',
    render: () => (
      <svg {...common}>
        <rect width="16" height="4" fill="#000"/>
        <rect y="4" width="16" height="4" fill="#dd0000"/>
        <rect y="8" width="16" height="4" fill="#ffce00"/>
      </svg>
    ),
  },
  FR: {
    name: 'France',
    render: () => (
      <svg {...common}>
        <rect width="5.33" height="12" fill="#0055a4"/>
        <rect x="5.33" width="5.33" height="12" fill="#fff"/>
        <rect x="10.67" width="5.33" height="12" fill="#ef4135"/>
      </svg>
    ),
  },
  CA: {
    name: 'Canada',
    render: () => (
      <svg {...common}>
        <rect width="4" height="12" fill="#d52b1e"/>
        <rect x="4" width="8" height="12" fill="#fff"/>
        <rect x="12" width="4" height="12" fill="#d52b1e"/>
        <path d="M8 3 L8.4 4.6 L9.8 4.2 L9.2 5.6 L10 6 L9.2 6.4 L9.8 7.8 L8.4 7.4 L8 9 L7.6 7.4 L6.2 7.8 L6.8 6.4 L6 6 L6.8 5.6 L6.2 4.2 L7.6 4.6 Z" fill="#d52b1e"/>
      </svg>
    ),
  },
  AU: {
    name: 'Australia',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#00008b"/>
        <rect width="8" height="6" fill="#00008b"/>
        <path d="M0 0 L8 6 M8 0 L0 6" stroke="#fff" strokeWidth="1"/>
        <rect x="3.5" width="1" height="6" fill="#fff"/>
        <rect y="2.5" width="8" height="1" fill="#fff"/>
        <circle cx="12" cy="6" r="0.5" fill="#fff"/>
        <circle cx="13" cy="4" r="0.4" fill="#fff"/>
        <circle cx="14" cy="8" r="0.4" fill="#fff"/>
        <circle cx="11" cy="9" r="0.3" fill="#fff"/>
      </svg>
    ),
  },
  BR: {
    name: 'Brazil',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#009c3b"/>
        <path d="M8 1 L15 6 L8 11 L1 6 Z" fill="#ffdf00"/>
        <circle cx="8" cy="6" r="2.2" fill="#002776"/>
      </svg>
    ),
  },
  CH: {
    name: 'Switzerland',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#d52b1e"/>
        <rect x="6.5" y="3" width="3" height="6" fill="#fff"/>
        <rect x="5" y="4.5" width="6" height="3" fill="#fff"/>
      </svg>
    ),
  },
  HK: {
    name: 'Hong Kong',
    render: () => (
      <svg {...common}>
        <rect width="16" height="12" fill="#de2910"/>
        <circle cx="8" cy="6" r="2.2" fill="#fff"/>
      </svg>
    ),
  },
  SG: {
    name: 'Singapore',
    render: () => (
      <svg {...common}>
        <rect width="16" height="6" fill="#ed2939"/>
        <rect y="6" width="16" height="6" fill="#fff"/>
        <circle cx="4" cy="3" r="1.8" fill="#fff"/>
        <circle cx="4.7" cy="3" r="1.5" fill="#ed2939"/>
      </svg>
    ),
  },
};

/**
 * Flag renders a country flag by ISO-like code. Falls back to a typographic
 * pill for unregistered codes so layout never breaks.
 *
 * Usage: <Flag code="US" />
 */
export function Flag({ code, title }) {
  const entry = REGISTRY[code];
  if (!entry) {
    return (
      <span
        title={title || code}
        aria-label={title || code}
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:16, height:12, padding:'0 3px', background:'var(--bg-sunken)',
          border:'1px solid var(--line)', borderRadius:2, fontFamily:'var(--font-mono)',
          fontSize:9, fontWeight:600, color:'var(--ink-3)', letterSpacing:'0.02em',
        }}
      >{code}</span>
    );
  }
  return <span role="img" aria-label={title || entry.name} title={title || entry.name} style={{display:'inline-flex', alignItems:'center'}}>{entry.render()}</span>;
}
