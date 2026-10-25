import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Listen } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { Logo } from '../components/Shell.jsx';
import { faq, quickChips } from '../data/faq.js';
import { config } from '../data/config.js';
import { currentStage, stageRoutes } from '../journey.js';

const faqById = Object.fromEntries(faq.map((f) => [f.id, f]));

// Keyword matching: longer keyword matches count more. Returns a faq id or null.
export function matchFaq(text) {
  const q = ' ' + text.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ') + ' ';
  let best = null;
  let bestScore = 0;
  for (const f of faq) {
    let score = 0;
    for (const k of f.k) {
      const kw = k.toLowerCase();
      const hit = /^[a-z0-9 ]+$/.test(kw) ? q.includes(' ' + kw + ' ') || (kw.length > 4 && q.includes(kw)) : q.includes(kw);
      if (hit) score += Math.min(kw.length, 8);
    }
    if (score > bestScore) {
      bestScore = score;
      best = f.id;
    }
  }
  return bestScore >= 2 ? best : null;
}

const MAX_CHARS = 500;
const MAX_HISTORY = 10;

// Ask our own server, never the AI directly (the key stays on the server). Returns text or null.
async function askServer(payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 18000);
  try {
    const r = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.info('[chat] AI unavailable (' + r.status + '), using built-in answers');
      return null;
    }
    const data = await r.json().catch(() => null);
    return typeof data?.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
  } catch {
    console.info('[chat] AI unreachable, using built-in answers');
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const NEXT_WORDS = ['next', 'what now', 'aage', 'आगे', 'kya karu', 'kya karun', 'क्या करूँ', 'क्या करूं', 'what should i do'];
const looksPersonal = (s) => /\d{4}\s?\d{4}\s?\d{4}/.test(s) || /\d{10}/.test(s.replace(/\s/g, ''));

export default function Chat() {
  const { state, update } = useStore();
  const { t, L, lang } = useI18n();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const msgs = state.chat;
  const stage = currentStage(state);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [msgs.length]);

  const [typing, setTyping] = useState(false);
  const useAI = state.settings.ai !== false;

  // Answer: personal details and "what next" are handled here instantly.
  // Everything else goes to the AI through our server (/api/chat). If that fails for any reason,
  // the built-in keyword answers reply instead, so the chat always answers.
  const reply = async (input) => {
    const userText = input.slice(0, MAX_CHARS);
    const personal = looksPersonal(userText);
    // Never keep digits that look like an ID or phone number
    const safe = personal ? userText.replace(/\d/g, '•') : userText;
    const push = (...items) => update((s) => { s.chat.push(...items); s.chat = s.chat.slice(-40); });
    const local = () => {
      const id = matchFaq(userText);
      return id ? { faq: id } : { kind: 'notSure' };
    };

    if (personal) return push({ from: 'me', text: safe }, { from: 'bot', kind: 'privacy' });
    if (NEXT_WORDS.some((w) => userText.toLowerCase().includes(w))) return push({ from: 'me', text: safe }, { from: 'bot', kind: 'next' });

    push({ from: 'me', text: safe });
    if (!useAI || (typeof navigator !== 'undefined' && navigator.onLine === false)) return push({ from: 'bot', ...local(), fallback: useAI });

    // Last 10 messages as context, in the words shown on screen
    const history = [...msgs, { from: 'me', text: safe }]
      .filter((m) => m.kind !== 'hello')
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.from === 'me' ? 'user' : 'assistant', text: m.from === 'me' ? meText(m) : botText(m) }));

    setTyping(true);
    const ai = await askServer({ messages: history, lang, stage });
    setTyping(false);
    if (ai) push({ from: 'bot', ai: true, text: ai });
    else push({ from: 'bot', ...local(), fallback: true });
  };

  const ask = (id) =>
    update((s) => {
      s.chat.push({ from: 'me', faqQ: id }, { from: 'bot', faq: id });
      s.chat = s.chat.slice(-40);
    });
  const askNext = () =>
    update((s) => {
      s.chat.push({ from: 'me', textKey: 'ch.nextChip' }, { from: 'bot', kind: 'next' });
    });

  const send = (e) => {
    e?.preventDefault();
    const v = text.trim();
    if (!v || typing) return;
    setText('');
    reply(v);
  };

  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const voice = () => {
    if (!SR) return;
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.interimResults = false;
    r.onresult = (ev) => {
      const said = ev.results[0][0].transcript;
      setListening(false);
      reply(said);
    };
    r.onerror = r.onend = () => setListening(false);
    setListening(true);
    r.start();
  };

  // Bot messages are stored as references, so they re-render in the current language
  const botText = (m) => {
    if (m.ai) return m.text;
    if (m.faq) return L(faqById[m.faq].a);
    if (m.kind === 'hello') return t('ch.hello');
    if (m.kind === 'privacy') return t('ch.privacy');
    if (m.kind === 'next') return t('ch.next', { step: t('nx.' + stage) });
    return t('ch.notSure');
  };
  const botLink = (m) => (m.faq ? faqById[m.faq].to : m.kind === 'next' ? stageRoutes[stage] : null);
  const meText = (m) => (m.faqQ ? L(faqById[m.faqQ].q) : m.textKey ? t(m.textKey) : m.text);

  const Bubble = ({ m }) =>
    m.from === 'me' ? (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand text-on-brand px-3 py-2">{meText(m)}</p>
      </div>
    ) : (
      <div className="flex gap-2 items-end">
        <span className="shrink-0"><Logo size={28} /></span>
        <div className={`max-w-[85%] rounded-2xl rounded-bl-md px-3 py-2 border ${m.kind === 'privacy' ? 'bg-warn-soft border-warn/40' : 'bg-surface border-line'}`}>
          {m.ai && <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brand mb-0.5">{t('ch.aiTag')}</p>}
          <p className="whitespace-pre-line break-words">{botText(m)}</p>
          {m.fallback && <p className="text-xs text-muted mt-1">{t('ch.fallback')}</p>}
          {m.kind === 'notSure' && (
            <a href={config.officialSite} target="_blank" rel="noreferrer" className="text-brand font-semibold underline text-sm">parivahan.gov.in ↗</a>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Listen small text={botText(m)} />
            {botLink(m) && (
              <button className="chip min-h-[2.25rem] text-brand border-brand" onClick={() => navigate(botLink(m))}>
                {t('ch.related')} <Icon name="right" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-line">
        <h1 className="font-display text-[1.7rem] leading-tight flex-1">{t('ch.title')}</h1>
        {msgs.length > 0 && (
          <button className="btn-ghost min-h-[2.5rem] px-3 text-sm" onClick={() => update((s) => { s.chat = []; })}>{t('ch.clear')}</button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
        <Bubble m={{ from: 'bot', kind: 'hello' }} />
        {msgs.map((m, i) => <Bubble key={i} m={m} />)}
        {typing && (
          <div className="flex gap-2 items-end fade-in" role="status" aria-label={t('ch.typing')}>
            <span className="shrink-0"><Logo size={28} /></span>
            <div className="rounded-2xl rounded-bl-md px-4 py-3 border bg-surface border-line typing text-muted text-lg leading-none" aria-hidden="true">
              <span>•</span><span>•</span><span>•</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line bg-bg">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-3 pt-2" aria-label="Quick questions">
          <button className="chip shrink-0 border-brand text-brand" onClick={askNext}>{t('ch.nextChip')}</button>
          {quickChips.map((id) => (
            <button key={id} className="chip shrink-0" onClick={() => ask(id)}>{L(faqById[id].q)}</button>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2 p-3">
          <label htmlFor="chat-in" className="sr-only">{t('ch.placeholder')}</label>
          <div className="flex-1 min-w-0 relative">
            <input id="chat-in" className="field pr-14" placeholder={t('ch.placeholder')} value={text} maxLength={MAX_CHARS} onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))} autoComplete="off" aria-describedby="chat-count" />
            {text.length > 350 && <span id="chat-count" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted tabular-nums">{MAX_CHARS - text.length}</span>}
          </div>
          {SR && (
            <button type="button" onClick={voice} className={`w-12 h-12 shrink-0 rounded-2xl grid place-items-center border-2 ${listening ? 'border-bad bg-bad-soft text-bad' : 'border-line bg-surface'}`} aria-label={listening ? t('ch.listening') : t('ch.voice')}>
              <Icon name="mic" />
            </button>
          )}
          <button type="submit" disabled={typing} className="w-12 h-12 shrink-0 rounded-2xl bg-brand text-on-brand grid place-items-center disabled:opacity-50" aria-label={t('ch.send')}>
            <Icon name="send" />
          </button>
        </form>
      </div>
    </div>
  );
}
