// Hono app for local dev — wraps the shared grid-handler logic.
// In production on Vercel, the same handler is mounted by api/health.js
// and api/grid/[dataset].js as Edge functions.
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DATASETS, runQuery } from './grid-handler.js';

export const app = new Hono().basePath('/api');
app.use('*', cors());

app.get('/health', (c) => c.json({ ok: true, datasets: Object.keys(DATASETS) }));

app.post('/grid/:dataset', async (c) => {
  const ds = c.req.param('dataset');
  if (!DATASETS[ds]) return c.json({ error: `unknown dataset: ${ds}` }, 404);
  const request = await c.req.json();
  const result = runQuery(ds, request);
  return c.json(result);
});
