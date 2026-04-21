// JS-level design tokens. Mirrors src/tokens.css for values that can't live
// in CSS (numeric props passed to JSX components — e.g. chart heights).
// Keep in sync with tokens.css manually.

export const CHART_HEIGHT = {
  sm: 200,
  md: 240,
  lg: 260,
  xl: 420,  // data-table + tall panels (AG Grid primary surface)
};

export const ICON_SIZE = {
  glyph: 8,
  compact: 12,
  minor: 14,
  action: 16,
  nav: 22,
};
