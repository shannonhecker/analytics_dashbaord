// Hono backend — AG Grid Server-Side Row Model endpoints + SSE live ticker.
// Accepts AG Grid's IServerSideGetRowsRequest, returns { rows, lastRow }.
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { streamSSE } from 'hono/streaming';
import { cors } from 'hono/cors';
import { EventEmitter } from 'events';
import { DATA, series } from '../src/data.js';

const app = new Hono();
app.use('*', cors());

// ----- Datasets registered for the SSRM router -----
const DATASETS = {
  reports:         () => DATA.reports,
  portfolios:      () => DATA.portfolios,
  riskSummary:     () => DATA.riskSummary,
  sectorBreakdown: () => DATA.sectorBreakdown,
  peers:           () => DATA.issuer.peers,
};

// ----- Pure helpers: filter, sort, group -----
function applyFilter(rows, filterModel) {
  if (!filterModel || Object.keys(filterModel).length === 0) return rows;
  return rows.filter(row => {
    for (const [field, f] of Object.entries(filterModel)) {
      const v = row[field];
      if (f.filterType === 'text') {
        const filterValue = (f.filter ?? '').toString().toLowerCase();
        const cell = (v ?? '').toString().toLowerCase();
        switch (f.type) {
          case 'equals':       if (cell !== filterValue) return false; break;
          case 'notEqual':     if (cell === filterValue) return false; break;
          case 'contains':     if (!cell.includes(filterValue)) return false; break;
          case 'notContains':  if (cell.includes(filterValue)) return false; break;
          case 'startsWith':   if (!cell.startsWith(filterValue)) return false; break;
          case 'endsWith':     if (!cell.endsWith(filterValue)) return false; break;
          default:             if (!cell.includes(filterValue)) return false;
        }
      } else if (f.filterType === 'number') {
        const n = Number(v);
        switch (f.type) {
          case 'equals':              if (n !== f.filter) return false; break;
          case 'notEqual':            if (n === f.filter) return false; break;
          case 'lessThan':            if (!(n <  f.filter)) return false; break;
          case 'lessThanOrEqual':     if (!(n <= f.filter)) return false; break;
          case 'greaterThan':         if (!(n >  f.filter)) return false; break;
          case 'greaterThanOrEqual':  if (!(n >= f.filter)) return false; break;
          case 'inRange':             if (!(n >= f.filter && n <= f.filterTo)) return false; break;
        }
      } else if (f.filterType === 'set') {
        const set = new Set((f.values || []).map(String));
        if (!set.has(String(v))) return false;
      }
    }
    return true;
  });
}

function applySort(rows, sortModel) {
  if (!sortModel || sortModel.length === 0) return rows;
  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const { colId, sort } of sortModel) {
      const av = a[colId], bv = b[colId];
      if (av == null && bv == null) continue;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      if (cmp !== 0) return sort === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
  return sorted;
}

function applyGrouping(rows, request) {
  const { rowGroupCols = [], groupKeys = [], valueCols = [] } = request;
  // Not requesting groups, or already at leaf level — return rows as-is
  if (rowGroupCols.length === 0 || groupKeys.length === rowGroupCols.length) {
    return rows;
  }
  // Filter rows that match the current group key path
  let scoped = rows;
  for (let i = 0; i < groupKeys.length; i++) {
    const col = rowGroupCols[i].field;
    scoped = scoped.filter(r => String(r[col]) === String(groupKeys[i]));
  }
  // Group by the next group column
  const groupCol = rowGroupCols[groupKeys.length].field;
  const buckets = new Map();
  for (const r of scoped) {
    const k = r[groupCol];
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(r);
  }
  // Build group rows with optional aggregations
  const groupRows = [];
  for (const [k, bucket] of buckets) {
    const groupRow = { [groupCol]: k, _group: true, _count: bucket.length };
    for (const vc of valueCols) {
      const f = vc.field;
      const nums = bucket.map(r => Number(r[f])).filter(Number.isFinite);
      if (nums.length === 0) continue;
      switch (vc.aggFunc) {
        case 'sum': groupRow[f] = nums.reduce((a,b)=>a+b, 0); break;
        case 'avg': groupRow[f] = nums.reduce((a,b)=>a+b, 0) / nums.length; break;
        case 'min': groupRow[f] = Math.min(...nums); break;
        case 'max': groupRow[f] = Math.max(...nums); break;
        case 'count': groupRow[f] = nums.length; break;
        default:    groupRow[f] = nums.reduce((a,b)=>a+b, 0);
      }
    }
    groupRows.push(groupRow);
  }
  return groupRows;
}

// ----- SSRM endpoint -----
app.post('/api/grid/:dataset', async (c) => {
  const ds = c.req.param('dataset');
  if (!DATASETS[ds]) return c.json({ error: `unknown dataset: ${ds}` }, 404);

  const request = await c.req.json();
  const { startRow = 0, endRow = 100 } = request;

  let rows = DATASETS[ds]();
  rows = applyGrouping(rows, request);
  rows = applyFilter(rows, request.filterModel);
  rows = applySort(rows, request.sortModel);

  const total = rows.length;
  const sliced = rows.slice(startRow, endRow);
  const lastRow = endRow >= total ? total : -1;

  return c.json({ rows: sliced, lastRow });
});

// ----- Live ticker: shared state + SSE broadcast -----
// Single global ticker mutates shared `live` state; every connected client
// receives the same snapshot. Sparklines GROW (append each tick) until
// the cap is reached, then shift as a rolling window.

const live = {
  totalMv: 2_830_000_000,
  ytdReturn: 5.18,
  mtdReturn: 0.87,
  activeReturn: 2.13,
  sharpe: 1.42,
  var95: 46_300_000,
  var99: 54_200_000,
  cvar: 56_700_000,
  beta: 1.08,
  leverage: 1.42,
};

const SPARK_CAP = 120; // ~4 minutes of 2s ticks before shifting
const sparks = {};

// Alerts + movers: bounded live feeds that evolve at a slower cadence than
// the KPI sparkline ticks. Alerts get new entries injected randomly and the
// oldest drop off; movers reshuffle their bps values + sector membership.
const ALERT_SEEDS = [
  { sev:'high', cat:'Issuer',        text:'Meridian Industries downgraded AA → A+', dest:'issuer' },
  { sev:'med',  cat:'Limit',         text:'Equity sleeve VaR at 92% of policy',     dest:'risk' },
  { sev:'med',  cat:'Concentration', text:'Tech weight 35.4% (cap 35%)',            dest:'risk' },
  { sev:'low',  cat:'ESG',           text:'3 holdings flagged · climate methodology', dest:'esg' },
  { sev:'low',  cat:'Liquidity',     text:'7-day liquidation coverage at 88%',      dest:'risk' },
  { sev:'med',  cat:'FX',            text:'GBP exposure drift +1.2% vs target',     dest:'risk' },
  { sev:'high', cat:'Issuer',        text:'Apex Systems under review by Moody\'s',  dest:'issuer' },
  { sev:'low',  cat:'Performance',   text:'Hedge Funds B outperformed bench by 4.8%', dest:'performance' },
];

let alerts = ALERT_SEEDS.slice(0, 5).map((a, i) => ({
  ...a,
  id: `a-${Date.now()}-${i}`,
  ageSec: (i + 1) * 60 * (i + 1),
}));

const MOVER_TICKERS = [
  { name:'NVDA', sec:'Tech' },     { name:'MSFT', sec:'Tech' },
  { name:'ASML', sec:'Tech' },     { name:'JPM',  sec:'Financ.' },
  { name:'TSM',  sec:'Tech' },     { name:'META', sec:'Tech' },
  { name:'XOM',  sec:'Energy' },   { name:'BP',   sec:'Energy' },
  { name:'V',    sec:'Financ.' },  { name:'AAPL', sec:'Tech' },
];

let movers = [
  { name:'NVDA', sec:'Tech',     bps:+58 }, { name:'MSFT', sec:'Tech',     bps:+42 },
  { name:'ASML', sec:'Tech',     bps:+31 }, { name:'JPM',  sec:'Financ.', bps:+22 },
  { name:'TSM',  sec:'Tech',     bps:+18 }, { name:'BP',   sec:'Energy',  bps:-31 },
  { name:'XOM',  sec:'Energy',   bps:-22 }, { name:'META', sec:'Tech',    bps:-14 },
];

// Seed each spark with 20 back-dated points so sparklines aren't empty on first render
function seedSpark(baseline, vol) {
  const arr = [];
  let v = baseline;
  for (let i = 0; i < 20; i++) {
    v += (Math.random() - 0.5) * vol;
    arr.push(v);
  }
  return arr;
}
sparks.totalMv      = seedSpark(live.totalMv,      1_500_000);
sparks.ytdReturn    = seedSpark(live.ytdReturn,    0.02);
sparks.mtdReturn    = seedSpark(live.mtdReturn,    0.015);
sparks.activeReturn = seedSpark(live.activeReturn, 0.01);
sparks.sharpe       = seedSpark(live.sharpe,       0.005);
sparks.var95        = seedSpark(live.var95,        200_000);
sparks.var99        = seedSpark(live.var99,        200_000);
sparks.cvar         = seedSpark(live.cvar,         200_000);
sparks.beta         = seedSpark(live.beta,         0.005);
sparks.leverage     = seedSpark(live.leverage,     0.003);

const bus = new EventEmitter();
bus.setMaxListeners(100);

function signed(n, digits = 2) { return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`; }

function metaFormat(ageSec) {
  if (ageSec < 60) return `${ageSec}s ago`;
  if (ageSec < 3600) return `${Math.floor(ageSec / 60)}m ago`;
  if (ageSec < 86400) return `${Math.floor(ageSec / 3600)}h ago`;
  return `${Math.floor(ageSec / 86400)}d ago`;
}

function snapshot() {
  return {
    ts: Date.now(),
    alerts: alerts.map((a) => ({ ...a, meta: metaFormat(a.ageSec) })),
    movers: movers.slice(),
    values: {
      totalMv:             live.totalMv,
      totalMvDisplay:      `$${(live.totalMv / 1e9).toFixed(2)}B`,
      ytdReturn:           live.ytdReturn,
      ytdReturnDisplay:    `${signed(live.ytdReturn)}%`,
      mtdReturn:           live.mtdReturn,
      mtdReturnDisplay:    `${signed(live.mtdReturn)}%`,
      activeReturn:        live.activeReturn,
      activeReturnDisplay: `${signed(live.activeReturn)}%`,
      sharpe:              live.sharpe,
      sharpeDisplay:       live.sharpe.toFixed(2),
      var95:               live.var95,
      var95Display:        `$${(live.var95 / 1e6).toFixed(1)}M`,
      var99:               live.var99,
      var99Display:        `$${(live.var99 / 1e6).toFixed(1)}M`,
      cvar:                live.cvar,
      cvarDisplay:         `$${(live.cvar / 1e6).toFixed(1)}M`,
      beta:                live.beta,
      betaDisplay:         live.beta.toFixed(2),
      leverage:            live.leverage,
      leverageDisplay:     `${live.leverage.toFixed(2)}×`,
    },
    sparks: {
      totalMv:      [...sparks.totalMv],
      ytdReturn:    [...sparks.ytdReturn],
      mtdReturn:    [...sparks.mtdReturn],
      activeReturn: [...sparks.activeReturn],
      sharpe:       [...sparks.sharpe],
      var95:        [...sparks.var95],
      var99:        [...sparks.var99],
      cvar:         [...sparks.cvar],
      beta:         [...sparks.beta],
      leverage:     [...sparks.leverage],
    },
  };
}

function tick() {
  live.totalMv      += (Math.random() - 0.5) * 2_000_000;
  live.ytdReturn    += (Math.random() - 0.5) * 0.02;
  live.mtdReturn    += (Math.random() - 0.5) * 0.015;
  live.activeReturn += (Math.random() - 0.5) * 0.01;
  live.sharpe        = Math.max(0.5, live.sharpe + (Math.random() - 0.5) * 0.005);
  live.var95        += (Math.random() - 0.5) * 200_000;
  live.var99        += (Math.random() - 0.5) * 200_000;
  live.cvar         += (Math.random() - 0.5) * 200_000;
  live.beta         += (Math.random() - 0.5) * 0.005;
  live.leverage     += (Math.random() - 0.5) * 0.003;

  for (const key of Object.keys(sparks)) {
    sparks[key].push(live[key]);
    if (sparks[key].length > SPARK_CAP) sparks[key].shift();
  }

  // Age all alerts by 2s
  alerts = alerts.map((a) => ({ ...a, ageSec: a.ageSec + 2 }));

  // ~5% chance each tick: inject a new alert at the top, drop the oldest
  if (Math.random() < 0.05) {
    const seed = ALERT_SEEDS[Math.floor(Math.random() * ALERT_SEEDS.length)];
    alerts = [{ ...seed, id: `a-${Date.now()}`, ageSec: 0 }, ...alerts.slice(0, 6)];
  }

  // Movers: perturb bps on each tick; occasionally reshuffle
  movers = movers.map((m) => ({
    ...m,
    bps: Math.round(m.bps + (Math.random() - 0.5) * 6),
  }));
  // ~8% chance: swap one mover for a fresh ticker
  if (Math.random() < 0.08) {
    const pool = MOVER_TICKERS.filter((t) => !movers.some((m) => m.name === t.name));
    if (pool.length) {
      const fresh = pool[Math.floor(Math.random() * pool.length)];
      const swapIdx = Math.floor(Math.random() * movers.length);
      movers = movers.map((m, i) => i === swapIdx
        ? { ...fresh, bps: Math.round((Math.random() - 0.5) * 80) }
        : m);
    }
  }
  // Sort by descending bps for consistent top-N feel
  movers.sort((a, b) => b.bps - a.bps);
}

// One global 2s tick loop — shared across all SSE clients.
setInterval(() => {
  tick();
  bus.emit('tick', snapshot());
}, 2000);

app.get('/api/stream/ticks', (c) => {
  return streamSSE(c, async (stream) => {
    // Initial snapshot on connect so clients don't wait 2s for first paint.
    await stream.writeSSE({ data: JSON.stringify(snapshot()) });

    const keepAlive = new Promise((resolve) => {
      stream.onAbort(() => resolve());
    });
    const handler = (payload) => {
      stream.writeSSE({ data: JSON.stringify(payload) }).catch(() => {});
    };
    bus.on('tick', handler);

    await keepAlive;
    bus.off('tick', handler);
  });
});

app.get('/api/health', (c) => c.json({ ok: true, datasets: Object.keys(DATASETS) }));

const port = Number(process.env.PORT || 8787);
serve({ fetch: app.fetch, port });
console.log(`[server] listening on http://localhost:${port}`);
