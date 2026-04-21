# analytics_dashbaord — Design System Rules

> **Purpose:** Project-scoped guidance for any agent (Claude Code, Figma MCP, etc.) working on this repo. Lock onto the patterns below; don't introduce new abstractions.

---

## 1. Token Definitions

**Single source of truth:** [`src/tokens.css`](src/tokens.css) — pure CSS custom properties, no build-time transform.

- Defined on `:root` (light, default) and `[data-theme="dark"]` (dark mode).
- Toggled by setting `data-theme` on `document.documentElement` (see `App.jsx:43`). A `MutationObserver` in [`src/components/highcharts/setup.js:96-105`](src/components/highcharts/setup.js) re-applies the Highcharts theme automatically.
- Density variant: `[data-density="compact"]` overrides `--row-h`, `--pad`, `--fs-sm`, `--fs-md`.

### Token namespaces

| Group | Vars | Purpose |
| --- | --- | --- |
| Surface | `--bg`, `--bg-elev`, `--bg-elev-2`, `--bg-sunken`, `--bg-hover`, `--bg-active` | Page → panel → inset → state |
| Border | `--line`, `--line-strong`, `--line-faint` | Standard / emphasised / divider |
| Ink | `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--ink-5` | Primary → disabled |
| Accent | `--accent`, `--accent-2`, `--accent-soft`, `--accent-glow`, `--grad`, `--grad-v` | Carbon Blue 60 + variants |
| Semantic | `--pos`, `--pos-soft`, `--neg`, `--neg-soft` | Carbon Green 50 / Red 60 |
| Categorical | `--c1`…`--c8` | IBM Carbon palette — `c1`=Purple, `c2`=Cyan, `c3`=Teal, `c4`=Magenta, `c5`=Blue 80, `c6`=Cool Gray, `c7`=Magenta 50, `c8`=Yellow |
| Type | `--font-ui`, `--font-mono`, `--font-display`, `--fs-xs`…`--fs-3xl` | UI system + Geist Mono / JetBrains Mono for numerics |
| Spacing | `--pad`, `--pad-sm`, `--pad-xs`, `--row-h` | Density-aware padding/row height |
| Radius | `--radius-sm`, `--radius`, `--radius-lg`, `--radius-xl` | 4 / 6 / 8 / 12 px |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-pop`, `--shadow-glow` | Elevation scale |

### Hard rules

- **Never** write a literal hex / rgb / px font-size in component code. Reach for the matching CSS var first.
- New token? Add it to **both** `:root` and `[data-theme="dark"]` blocks, then document its purpose with a comment.
- The categorical palette deliberately avoids red/green to prevent collision with `--pos`/`--neg`. Don't reuse them for status.

---

## 2. Component Library

**Location:** [`src/components/`](src/components) — flat structure, function components only, no class components.

| File | Exports | Notes |
| --- | --- | --- |
| `shell.jsx` | `NovaLogo`, `NovaLeftNav`, `NovaFilterBar`, `NovaPanel`, `NovaChip` | App chrome + layout primitives |
| `kpi.jsx` | `HeroKpi`, `RiskTile`, `MiniGauge`, `PillarRow` | KPI tiles + hand-rolled SVG mini-gauge |
| `charts.jsx` | `NovaSpark`, `NovaBarMini`, `CardPreview` (+ `nfmt`, `novaHeat`) | Inline-SVG mini charts (sparkline / progress / area thumbnail) |
| `cell-renderers.jsx` | `SparklineCell`, `TickerBadgeCell`, `DeltaCell`, `MoneyCell`, `HeatmapCell`, `MiniBarCell`, `ChipCell`, `LinkCell` | AG Grid `cellRenderer` components |
| `NovaGrid.jsx` | `NovaGrid` | AG Grid wrapper with SSRM datasource, density toggle, quick-filter |
| `modals.jsx` | `NovaCmdK`, `NovaShare` | Cmd+K palette + share modal |
| `highcharts/` | `HxChart`, `HxArea`, `HxBar`, `HxDonut`, `HxGauge` (+ `setup.js` helpers) | Highcharts wrappers — see §6 |

### Architecture conventions

- **Inline styles using CSS vars:** components style themselves with `style={{color: 'var(--ink)'}}` rather than separate stylesheets. Global utility classes (`.mono`, `.num`, `.pos`, `.neg`, `.muted`, `.grad-text`) live in `tokens.css`.
- **No `className` system:** no Tailwind, no CSS Modules, no styled-components. The only dedicated stylesheet is [`src/ag-grid-theme.css`](src/ag-grid-theme.css), which targets AG Grid's `.ag-*` selectors via a `.nova-grid` wrapper.
- **No prop-types / TypeScript:** loose-typed JSX. Document required props by example in the JSDoc one-liner above the export.
- **Defaults via destructure:** `function NovaPanel({title, padded=true, ...})`. Don't add validation libraries.

### Storybook / docs

There is no Storybook. The Figma file at `https://www.figma.com/design/rXDmoptjaqWJVXduQ75Z7j` is the visual reference (Tokens / Components / Screens pages).

---

## 3. Frameworks & Libraries

From [`package.json`](package.json):

| Layer | Choice | Version |
| --- | --- | --- |
| Build | **Vite** | ^6.0.0 |
| Plugin | `@vitejs/plugin-react` | ^4.3.4 |
| UI | **React** | ^18.3.1 |
| Server | **Hono** + `@hono/node-server` | ^4.6.0 |
| Charts (large) | `highcharts` + `highcharts-react-official` | ^12.0.0 / ^3.2.1 |
| Tables | `ag-grid-community`, `ag-grid-enterprise`, `ag-grid-react` | ^33.0.0 (eval mode — watermark expected) |
| Dev orchestration | `concurrently` | ^9.1.0 |

**Module type:** ESM (`"type": "module"`). All files use `import`/`export`.

**Scripts:**
```bash
npm run dev      # concurrently runs vite + node --watch server/index.js
npm run dev:web  # vite only
npm run dev:api  # node --watch server/index.js only
npm run build    # vite build
npm run preview  # vite preview
```

[`vite.config.js`](vite.config.js): dev server on `:5173`, `/api` proxied to `:8787` (Hono).

**Don't add** Tailwind, shadcn, Radix, MUI, Chakra, or any other component library. The house aesthetic is hand-rolled IBM Carbon-derived primitives — match that.

---

## 4. Asset Management

- **No `assets/`, `public/`, or `images/` folder.** Static assets are vanishingly few in this project.
- All decorative graphics are **inline SVG** authored in JSX (see `NovaLogo` in `shell.jsx:14`, `CardPreview` in `charts.jsx:77`).
- Charts are rendered live via Highcharts or hand-rolled SVG (`NovaSpark`, `NovaBarMini`) — never imported as static images.
- No image optimisation pipeline, no CDN. If a raster asset is ever needed, place it under `public/` and let Vite serve it directly.

---

## 5. Icon System

- **No icon library** (no Lucide, Heroicons, Material Icons, etc.).
- Navigation icons are inline SVG `<path>` definitions stored as JSX in [`shell.jsx:5-11`](src/components/shell.jsx) (the `NAV_ITEMS` array).
- Action / inline icons are also inline SVG drawn at point of use (search, share, theme toggle in `RailIcon` — `shell.jsx:62-72`).
- Glyphs (`▲`, `▼`, `›`, `⌕`, `→`) are used directly as Unicode characters in text — see `DeltaCell` (`cell-renderers.jsx:35`), `ChipCell`, alert "›" caret, quick-filter `⌕`.

### Conventions

- All inline SVGs use `viewBox="0 0 24 24"` (or `0 0 12 12` for tiny carets), `stroke="currentColor"`, `fill="none"`, `strokeWidth="1.8"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
- Color is inherited via `currentColor` so a parent's `color: var(--ink-3)` propagates.
- New icons: drop a `<path>` directly into the JSX where it's used. Only extract to a shared component if it appears in 3+ places.

---

## 6. Styling Approach

- **Methodology:** plain inline styles + CSS variables. No CSS-in-JS runtime, no class-name system.
- **Global styles** ([`src/tokens.css`](src/tokens.css)):
  - `* { box-sizing: border-box; }`
  - `html, body` resets + `var(--bg)` / `var(--ink)` / `var(--font-ui)`
  - Utility classes: `.mono`, `.num`, `.pos`, `.neg`, `.muted`, `.grad-text`
  - `::-webkit-scrollbar` themed
  - `@keyframes pulse-glow`
- **AG Grid styling:** [`src/ag-grid-theme.css`](src/ag-grid-theme.css). Wrapper class `.ag-theme-quartz.nova-grid` overrides ~30 `--ag-*` variables to map to Carbon tokens. Density variants live on `.nova-grid[data-density="compact|standard|comfortable"]`.
- **Highcharts styling:** [`src/components/highcharts/setup.js`](src/components/highcharts/setup.js). `applyHighchartsTheme()` reads CSS vars via `getComputedStyle(document.documentElement)` and pushes them to `Highcharts.setOptions(...)`. Helpers: `resolveColor(varOrHex)`, `carbonGradient()` (vertical fill), `arcGradient()` (horizontal arc).

### Responsive

- This is a **desktop-first dashboard.** No mobile breakpoints exist.
- The left nav is a fixed 72px rail (`shell.jsx:21`). Filter bar is sticky. Panels use CSS Grid (`gridTemplateColumns: '2fr 1fr'`, `repeat(4, 1fr)`, etc.) inside screen files.
- If asked to add mobile support, surface it as a discussion before assuming media queries — the design language hasn't been adapted for touch.

### Theming rules

- Theme toggle: `setTheme('dark' | 'light')` in `App.jsx:36-44` writes to `localStorage` and `document.documentElement.dataset.theme`. Never bypass this.
- Inline `style` props should consume `var(--token)` rather than literal hex. Highcharts callers pass `var(--c2)` etc. — `resolveColor` flips them to the right hex at theme-apply time.
- Gradients: `carbonGradient(color)` and `arcGradient(color)` from `setup.js` — never write a Highcharts gradient stops array by hand.

---

## 7. Project Structure

```
analytics_dashbaord/
├── package.json                    # ESM, "type": "module"
├── vite.config.js                  # Vite + react plugin, /api → :8787 proxy
├── index.html                      # mounts <div id="root">
├── CLAUDE.md                       # ← this file
├── server/
│   └── index.js                    # Hono — AG Grid SSRM endpoints under /api/grid/:dataset
└── src/
    ├── main.jsx                    # Entry: imports tokens.css + ag-grid styles, renders <App/>
    ├── App.jsx                     # State-based screen switcher (no router); localStorage-persisted
    ├── tokens.css                  # ★ design tokens (single source of truth)
    ├── ag-grid-theme.css           # AG Grid Quartz overrides
    ├── data.js                     # Mock datasets (portfolios, riskSummary, esgTrend, etc.)
    ├── components/
    │   ├── shell.jsx               # NovaLeftNav, NovaFilterBar, NovaPanel, NovaChip, NovaLogo
    │   ├── kpi.jsx                 # HeroKpi, RiskTile, MiniGauge, PillarRow
    │   ├── charts.jsx              # NovaSpark, NovaBarMini, CardPreview, nfmt, novaHeat
    │   ├── cell-renderers.jsx      # AG Grid cell renderers
    │   ├── NovaGrid.jsx            # AG Grid wrapper (SSRM, density, quick-filter)
    │   ├── modals.jsx              # NovaCmdK (Cmd+K palette), NovaShare
    │   └── highcharts/
    │       ├── setup.js            # ★ theme + resolveColor / carbonGradient / arcGradient
    │       ├── HxChart.jsx         # Generic wrapper, ResizeObserver-driven reflow
    │       ├── HxArea.jsx          # Area / areaspline
    │       ├── HxBar.jsx           # Column + optional spline compareLine
    │       ├── HxDonut.jsx         # Pie/donut with center label
    │       └── HxGauge.jsx         # Half-circle solid gauge
    └── screens/
        ├── Home.jsx                # Layout switcher (Minimal / Analytical / Classic)
        ├── HomeMinimal.jsx         # V3 — Stripe/Linear feel (CIO default)
        ├── HomeDense.jsx           # V4 — Carbon analytical
        ├── Performance.jsx
        ├── Risk.jsx
        ├── Esg.jsx
        └── Issuer.jsx
```

### Feature organisation

- **One screen = one file** under `src/screens/`. Screens compose components but never define new primitives — if the same UI block appears twice, lift it into `src/components/`.
- **No routing library.** Navigation is a single `useState('home')` in `App.jsx`. Add a screen by:
  1. Creating `src/screens/YourScreen.jsx`
  2. Importing it in `App.jsx`
  3. Adding entries to `TITLES`, `SUBTITLES`, `FILTERS` (`App.jsx:12-32`)
  4. Adding a `NAV_ITEMS` entry in `shell.jsx:5` with an inline SVG `<path>`
- **Data lives in `src/data.js`.** Screens import named slices: `import { DATA, series } from '../data.js'`. The Hono server reads the same module so client-side and server-side stay aligned.

---

## Figma ↔ Code mapping (for MCP work)

There is a **synced Figma file** at <https://www.figma.com/design/rXDmoptjaqWJVXduQ75Z7j>. Use it via Figma MCP for design reference.

| Figma | Code |
| --- | --- |
| Variable collection `Carbon Tokens` (Light / Dark modes) | `src/tokens.css` `:root` and `[data-theme="dark"]` |
| Text styles `ui/*`, `mono/*` | Inline `fontSize` / `font-family: var(--font-ui|--font-mono)` (no shared text-style component) |
| Component `Panel` | `NovaPanel` in `shell.jsx` |
| Component `KPI / Hero` (+ Default · Up / Down) | `HeroKpi` in `kpi.jsx` |
| Component `Chip / Neutral|Positive|Negative` | `NovaChip` (`shell.jsx`) and `ChipCell` (`cell-renderers.jsx`) |
| Component `Alert Row / High|Med|Low` | Inline `AlertRow` block in `HomeMinimal.jsx:67-82` and `HomeDense.jsx:74-90` |
| Component `Mover / Positive|Negative` | Inline `ContributorBars` (`HomeMinimal.jsx:84`) and `MoverRow` (`HomeDense.jsx:92`) |
| Component `Chart / HxBar|HxArea|HxDonut|HxGauge` | `src/components/highcharts/Hx*.jsx` |
| Component `Grid / Sample` | `NovaGrid` in `NovaGrid.jsx` (rendered with `dataset="reports"` on Home) |
| Screen `Home / Minimal (V3)` | `src/screens/HomeMinimal.jsx` |
| Screen `Home / Analytical (V4)` | `src/screens/HomeDense.jsx` |
| Screen `Home / Classic` | `HomeClassic` inside `src/screens/Home.jsx` |
| Dark variants (`· Dark` suffix) | Auto-applied at runtime via `data-theme="dark"` — no separate code path |

### Code Connect guidance (when wiring it up)

- Map each Figma component to its React export above.
- For chart components, the `color` prop accepts `var(--cN)` strings; `resolveColor` (`setup.js:17-21`) handles the Highcharts conversion. Code Connect prop docs should reflect this.
- Don't generate code that imports from `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, or `lucide-react`. None of those exist in this repo.

---

## Don'ts

- ❌ Don't add Tailwind, shadcn, Radix, or any other component library.
- ❌ Don't introduce TypeScript without an explicit ask — the codebase is plain JSX.
- ❌ Don't write hex or rgb literals in components — reach for the right `--token`.
- ❌ Don't bypass the theme system. CSS-in-JS that hard-codes colors will silently break dark mode.
- ❌ Don't add a router. The state-based screen switcher is intentional.
- ❌ Don't add Storybook / Histoire. The Figma file is the design reference.
- ❌ Don't create new docs files (`README.md`, `STYLEGUIDE.md`, etc.) unless explicitly asked.

---

## Clarify-first (project-scoped)

Global rule applies: ask one clarifying question per turn, every request (incl. auto mode), until nothing is left to ask. Escape: `"just do it"` / `"go"` / `"ship it"`. Full checklist in `~/.claude/skills/clarify-first/SKILL.md`.

**analytics_dashbaord-specific things to always clarify before building:**

- **Which surface?** Web (Vite/React), API (Hono on Node), or both. `npm run dev` runs concurrently; `dev:web` / `dev:api` isolate.
- **Token layer vs. component layer?** `src/tokens.css` is the single source of truth. Changes there ripple; component-level changes don't. Ask before touching tokens.
- **Theme impact:** does the change need to work in both light and dark (`[data-theme="dark"]`) and across density (`[data-density="compact"]`)? Don't silently skip either axis.
- **Chart vs. table surface:** Highcharts (with `MutationObserver` theme re-apply) vs. ag-grid. Different theming paths — ask which is intended.
