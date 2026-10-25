// Vercel serverless function: POST /api/chat
// Set GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables.
import { answer } from '../server/chat-core.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const { status, body: out } = await answer(body, process.env);
  res.status(status).json(out);
}
