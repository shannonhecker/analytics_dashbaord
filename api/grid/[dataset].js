// POST /api/grid/:dataset — AG Grid Server-Side Row Model endpoint.
import { DATASETS, runQuery } from '../../server/grid-handler.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const dataset = url.pathname.split('/').pop();

  if (!DATASETS[dataset]) {
    return new Response(
      JSON.stringify({ error: `unknown dataset: ${dataset}` }),
      { status: 404, headers: { 'content-type': 'application/json' } },
    );
  }

  let request;
  try {
    request = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const result = runQuery(dataset, request);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
