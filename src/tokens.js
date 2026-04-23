// JS-level design tokens. Mirrors src/tokens.css for values that can't live
// in CSS (numeric props passed to JSX components — e.g. chart heights).
// Keep in sync with tokens.css manually.

export const CHART_HEIGHT = {
  sm: 200,
  md: 240,
  lg: 260,
  xl: 420,  // data-table + tall panels (AG Grid primary surface)
};

// Icon-size scale. Mirrors --icon-nav / --icon-utility / --icon-display in tokens.css.
// Small glyph/compact/minor steps stay for dense inline use (alert dots, mini charts).
export const ICON_SIZE = {
  glyph: 8,
  compact: 12,
  minor: 14,
  utility: 18,
  nav: 20,
  display: 32,
  // Legacy aliases — retained for any caller not yet migrated.
  action: 18,
};
