// GET /api/health — small ping with available datasets.
import { DATASETS } from '../server/grid-handler.js';

export const config = { runtime: 'edge' };

export default function handler() {
  return new Response(
    JSON.stringify({ ok: true, datasets: Object.keys(DATASETS) }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}
