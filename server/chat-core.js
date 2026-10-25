// Shared AI chat logic, used by every server adapter (Vercel, Netlify and the local dev server).
// The API key is read on the server only. The browser never sees it.
import { config } from '../src/data/config.js';
import { faq } from '../src/data/faq.js';
import { fixes } from '../src/data/fixes.js';

export const MAX_CHARS = 500; // per message
export const MAX_MESSAGES = 10; // context sent to the AI
const TIMEOUT_MS = 15000;

// Facts the AI must use, built from the same data files the app uses
function facts() {
  const c = config;
  const lines = [
    `Minimum age: ${c.minAge.gearless50} for a gearless scooter up to 50cc (with a parent's consent), ${c.minAge.motorcycle} for a motorcycle or car, ${c.minAge.commercial} for a commercial vehicle.`,
    `Sample fees: learner's licence Rs ${c.fees.llPerClass} per vehicle type, learner's test Rs ${c.fees.llTest}, driving test Rs ${c.fees.drivingTest}, licence issue Rs ${c.fees.licenceIssue}. Fees differ by state.`,
    `Learner's test: ${c.test.count} questions, ${c.test.passMark} correct to pass, ${c.test.secondsPerQuestion} seconds per question.`,
    `A learner's licence is valid for ${c.llValidityMonths} months. The permanent licence can be applied for ${c.dlWaitDays} days after the learner's licence is issued.`,
    `A doctor's certificate (Form 1A) is needed at age ${c.doctorCertAge} or above.`,
    'Many licence services (learner\'s licence, lost/duplicate licence, renewal, address change) can be done fully online with Aadhaar authentication, under notification S.O. 4353(E) of 16 September 2022. Using Aadhaar is voluntary. States differ.',
    'A driving licence shown in DigiLocker or mParivahan is valid like the card.',
    'People trained at a government-accredited driver training centre do not take the driving test at the RTO. Ordinary driving schools do not count.',
  ];
  const qa = faq.map((f) => `Q: ${f.q.en}\nA: ${f.a.en}`).join('\n\n');
  return `${lines.join('\n')}\n\nCommon questions and answers:\n${qa}`;
}

const STAGES = [
  'check if they can apply',
  "apply for a learner's licence",
  "pass the learner's test",
  'wait 30 days and apply for the permanent licence',
  'pass the driving test',
  'receive the licence',
];

export function systemPrompt({ lang = 'en', stage = 0 }) {
  return [
    'You are "Licence Saathi", a kind helper for people getting a driving licence in India.',
    'Rules:',
    '- Reply in the same language the user writes in (Hindi, English or Hinglish). If unsure, use ' + (lang === 'hi' ? 'Hindi.' : 'English.'),
    '- Use short, simple sentences a Class 8 student would understand. At most 5 short sentences or 5 short bullet lines. Plain text only, no markdown symbols like ** or #.',
    '- Be calm and kind. Never blame the user. Never use threatening words like penalty, illegal or violation; say what to do instead.',
    '- Use ONLY the facts below. If the answer depends on the state, ask which state they live in.',
    '- If you are not sure, say so plainly and point them to parivahan.gov.in or their local RTO.',
    '- Never ask for an Aadhaar number, phone number, address, licence number or any other personal details. If the user shares one, tell them not to share it here.',
    '- This app is a prototype with sample data. Fees and rules can differ by state.',
    `- The user is currently at this stage of their licence journey: "${STAGES[stage] || STAGES[0]}". When it helps, end with their next step in one sentence.`,
    '',
    'Facts:',
    facts(),
  ].join('\n');
}

// "What happened?" mode: the AI only CHOOSES one known problem and explains it simply.
// Links and pages come from our own list (by id), so the AI can never send someone to a wrong site.
export function fixPrompt({ lang = 'en' }) {
  const list = fixes.map((f) => `- ${f.id}: ${f.title.en}. Usual fix: ${f.steps.map((x) => x.en).join(' ')}`).join('\n');
  return [
    'You help people in India who are stuck with a driving licence task. They describe the problem in their own words:',
    'English, Hindi, or Hinglish (Hindi typed in English letters), often with spelling and grammar mistakes. Understand the meaning, not the spelling.',
    'Pick the ONE problem from the list below that best matches. If none fits, use "none".',
    'Reply ONLY with JSON: {"id": "<problem id or none>", "summary": "<one short sentence: what probably happened, kind, never blaming>", "steps": ["<up to 4 short steps>"]}',
    'Write summary and steps in the same language and script the person used (Hinglish stays Hinglish). If unsure, use ' + (lang === 'hi' ? 'Hindi.' : 'English.'),
    'Use short Class-8 words. Never ask for Aadhaar, phone or licence numbers. Never invent fees, laws or websites.',
    '',
    'Known problems:',
    list,
  ].join('\n');
}

export function readFix(text) {
  let j;
  try { j = JSON.parse(String(text).replace(/^```(?:json)?|```$/g, '').trim()); } catch { return null; }
  const ids = new Set(fixes.map((f) => f.id));
  const id = ids.has(j?.id) ? j.id : 'none';
  const clean = (x) => String(x || '').replace(/[*#`]/g, '').trim().slice(0, 220);
  const steps = Array.isArray(j?.steps) ? j.steps.map(clean).filter(Boolean).slice(0, 4) : [];
  return { id, summary: clean(j?.summary), steps };
}

// Remove things that look like ID or phone numbers before anything leaves the server
export function redact(text) {
  return String(text)
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[number removed]')
    .replace(/\b[6-9]\d{9}\b/g, '[number removed]');
}

// Validate the request body. Returns { ok, error, messages, lang, stage }
export function parseBody(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad_request' };
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, text: redact(m.text.slice(0, MAX_CHARS)) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return { ok: false, error: 'bad_request' };
  const lang = body.lang === 'hi' ? 'hi' : 'en';
  const stage = Number.isInteger(body.stage) && body.stage >= 0 && body.stage <= 5 ? body.stage : 0;
  return { ok: true, messages, lang, stage };
}

// Call Gemini. Returns { status, body } where body is { reply } or { error }.
export async function answer(body, env = process.env, fetchImpl = fetch) {
  const key = env.GEMINI_API_KEY;
  if (!key || key === 'paste-your-key-here') return { status: 503, body: { error: 'no_key' } };
  const p = parseBody(body);
  if (!p.ok) return { status: 400, body: { error: p.error } };

  const model = env.GEMINI_MODEL || 'gemini-flash-latest';
  const base = env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${base}/models/${encodeURIComponent(model)}:generateContent`;

  // Gemini needs the conversation to start with a user turn
  const msgs = p.messages.slice(p.messages.findIndex((m) => m.role === 'user'));
  const fixMode = body.mode === 'fix';
  const payload = fixMode
    ? {
        system_instruction: { parts: [{ text: fixPrompt(p) }] },
        contents: [{ role: 'user', parts: [{ text: msgs[msgs.length - 1].text }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 500, responseMimeType: 'application/json' },
      }
    : {
        system_instruction: { parts: [{ text: systemPrompt(p) }] },
        contents: msgs.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
      };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (r.status === 400 || r.status === 401 || r.status === 403) {
      const detail = await r.text().catch(() => '');
      const badKey = /API key|API_KEY|permission|unauth/i.test(detail);
      return { status: badKey ? 401 : 502, body: { error: badKey ? 'bad_key' : 'ai_rejected' } };
    }
    if (r.status === 404) return { status: 502, body: { error: 'bad_model' } };
    if (r.status === 429) return { status: 429, body: { error: 'rate_limited' } };
    if (!r.ok) return { status: 502, body: { error: 'ai_error' } };
    const data = await r.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((x) => x.text || '').join('').trim();
    if (!text) return { status: 502, body: { error: 'empty' } };
    if (fixMode) {
      const fix = readFix(text);
      return fix ? { status: 200, body: { fix } } : { status: 502, body: { error: 'ai_error' } };
    }
    // Plain text only: strip markdown that may slip through
    const reply = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '').replace(/^\s*[*]\s+/gm, '• ').slice(0, 1500);
    return { status: 200, body: { reply } };
  } catch (e) {
    return { status: 504, body: { error: e?.name === 'AbortError' ? 'timeout' : 'network' } };
  } finally {
    clearTimeout(timer);
  }
}
