// Hono backend — AG Grid Server-Side Row Model endpoints.
// Accepts AG Grid's IServerSideGetRowsRequest, returns { rows, lastRow }.
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
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

app.get('/api/health', (c) => c.json({ ok: true, datasets: Object.keys(DATASETS) }));

const port = Number(process.env.PORT || 8787);
serve({ fetch: app.fetch, port });
console.log(`[server] listening on http://localhost:${port}`);
