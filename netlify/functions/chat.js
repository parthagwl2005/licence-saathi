// Netlify function, reachable at /api/chat (see netlify.toml).
// Set GEMINI_API_KEY in Netlify → Site configuration → Environment variables.
import { answer } from '../../server/chat-core.js';

export default async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  let body = null;
  try { body = await req.json(); } catch { body = null; }
  const { status, body: out } = await answer(body, process.env);
  return Response.json(out, { status, headers: { 'Cache-Control': 'no-store' } });
};

export const config = { path: '/api/chat' };
