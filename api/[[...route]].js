// Vercel serverless catch-all that routes /api/* into the shared Hono app.
import { handle } from 'hono/vercel';
import { app } from '../server/app.js';

export const config = { runtime: 'nodejs' };
export default handle(app);
