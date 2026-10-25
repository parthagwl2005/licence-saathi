import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Listen } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { fixes, fixById, matchFixes, OFFICIAL } from '../data/fixes.js';

const MAX = 500;
const redact = (s) => String(s).replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[number removed]').replace(/\b[6-9]\d{9}\b/g, '[number removed]');
const EXAMPLES = ['paise kat gaye par receipt nahi aayi', 'OTP nahi aaya', 'mera licence kho gaya', 'website khul nahi rahi', 'naam galat chhap gaya', 'photo upload nahi ho rahi'];

// Ask the AI to pick the problem (server keeps the key). Returns { id, summary, steps } or null.
async function askAi(text, lang) {
  if (!navigator.onLine) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'fix', lang, messages: [{ role: 'user', text }] }),
      signal: ctrl.signal,
    });
    if (!r.ok) return null;
    const data = await r.json().catch(() => null);
    return data?.fix && fixById[data.fix.id] ? data.fix : data?.fix?.id === 'none' ? { id: 'none' } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// "Something went wrong? Tell us in your own words." Hindi, English or Hinglish, spelling doesn't matter.
export default function Fix() {
  const { state } = useStore();
  const { t, L, lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [text, setText] = useState(params.get('q') || '');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null); // { id, summary?, steps?, via: 'ai'|'list'|'none', others: [] }
  const [listening, setListening] = useState(false);
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const solve = async (raw) => {
    const q = redact(raw.trim()).slice(0, MAX);
    if (!q) return;
    setBusy(true);
    setRes(null);
    const local = matchFixes(q);
    const ai = state.settings.ai !== false ? await askAi(q, lang) : null;
    setBusy(false);
    if (ai && ai.id !== 'none') {
      setRes({ ...ai, via: 'ai', others: local.map((x) => x.id).filter((id) => id !== ai.id).slice(0, 2), asked: q });
    } else if (local.length) {
      setRes({ id: local[0].id, via: 'list', others: local.slice(1).map((x) => x.id), asked: q });
    } else {
      setRes({ id: null, via: 'none', others: [], asked: q });
    }
  };

  const voice = () => {
    if (!SR) return;
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.interimResults = false;
    r.onresult = (ev) => { const said = ev.results[0][0].transcript; setText(said); setListening(false); solve(said); };
    r.onerror = r.onend = () => setListening(false);
    setListening(true);
    r.start();
  };

  const f = res?.id ? fixById[res.id] : null;
  const steps = f ? (res.via === 'ai' && res.steps?.length ? res.steps : f.steps.map((s) => L(s))) : [];
  const summary = f ? (res.via === 'ai' && res.summary ? res.summary : L(f.what)) : '';

  return (
    <Screen title="fx.title" sub={t('fx.sub')} back="/">
      {!res && (
        <form onSubmit={(e) => { e.preventDefault(); solve(text); }} className="grid gap-3 [&>*]:min-w-0">
          <label htmlFor="fx-in" className="font-semibold">{t('fx.label')}</label>
          <textarea id="fx-in" rows={4} maxLength={MAX} className="field py-3 text-lg" placeholder={t('fx.ph')} value={text} onChange={(e) => setText(e.target.value)} aria-describedby="fx-note" />
          <p id="fx-note" className="text-xs text-muted flex gap-1.5 items-start"><Icon name="shield" size={14} className="shrink-0 mt-0.5" /> {t('fx.note')}</p>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button className="btn-primary" disabled={!text.trim() || busy} aria-busy={busy}>{busy ? t('fx.thinking') : t('fx.go')}</button>
            {SR && (
              <button type="button" className={`w-14 h-14 rounded-full grid place-items-center ${listening ? 'bg-bad text-on-brand' : 'bg-surface shadow-soft'}`} onClick={voice} aria-label={t('ch.voice')}>
                <Icon name="mic" size={22} />
              </button>
            )}
          </div>
          {busy && <p className="text-muted flex items-center gap-2" role="status"><span className="typing" aria-hidden="true"><span>•</span><span>•</span><span>•</span></span> {t('fx.thinking')}</p>}
          <div>
            <p className="text-sm text-muted mt-2">{t('fx.examples')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => <button key={ex} type="button" className="chip text-left" onClick={() => { setText(ex); solve(ex); }}>{ex}</button>)}
            </div>
          </div>
        </form>
      )}

      {res && (
        <div className="grid gap-3 fade-in [&>*]:min-w-0">
          <p className="text-sm text-muted">{t('fx.you')} <q className="text-ink">{res.asked}</q></p>
          {f ? (
            <section className="card p-5" aria-labelledby="fx-h">
              <p className="eyebrow flex items-center gap-1.5">{res.via === 'ai' ? <><Icon name="sparkle" size={13} /> {t('fx.viaAi')}</> : <><Icon name="check" size={13} /> {t('fx.viaList')}</>}</p>
              <h2 id="fx-h" className="font-display text-[1.6rem] leading-tight mt-1">{L(f.title)}</h2>
              <p className="mt-2 leading-snug">{summary}</p>
              <h3 className="font-semibold mt-4">{t('fx.do')}</h3>
              <ol className="mt-2 grid gap-2">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-brand-soft text-brand font-bold grid place-items-center text-sm">{i + 1}</span>
                    <span className="pt-0.5 leading-snug">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3"><Listen small text={[L(f.title), summary, ...steps].join('. ')} /></div>
              <div className="mt-4 grid gap-2 [&>*]:min-w-0 [&>*]:h-auto [&>*]:py-3 [&>*]:[overflow-wrap:anywhere]">
                <button className="btn-primary" onClick={() => navigate(f.route)}>{t('fx.open', { page: t('fx.page.' + f.id) })} <Icon name="right" size={18} /></button>
                {f.help && !f.route.includes('topic=') && <button className="btn-secondary" onClick={() => navigate('/help?topic=' + f.help)}><Icon name="pen" size={18} /> {t('fx.complaint')}</button>}
                <a className="btn-secondary" href={OFFICIAL[f.link]} target="_blank" rel="noreferrer"><Icon name="share" size={18} /> {t('fx.official', { site: new URL(OFFICIAL[f.link]).hostname.replace('www.', '') })}</a>
              </div>
            </section>
          ) : (
            <section className="card p-5" role="status">
              <h2 className="font-display text-[1.6rem] leading-tight">{t('fx.unsureT')}</h2>
              <p className="mt-1 text-muted">{t('fx.unsureSub')}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {fixes.slice(0, 8).map((x) => <button key={x.id} className="chip text-left" onClick={() => setRes({ id: x.id, via: 'list', others: [], asked: res.asked })}>{L(x.title)}</button>)}
              </div>
              <button className="btn-secondary w-full mt-4" onClick={() => navigate('/chat')}><Icon name="chat" size={18} /> {t('fx.chat')}</button>
            </section>
          )}
          {res.others?.length > 0 && (
            <div>
              <p className="text-sm text-muted">{t('fx.orMaybe')}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {res.others.map((id) => <button key={id} className="chip text-left" onClick={() => setRes({ id, via: 'list', others: [], asked: res.asked })}>{L(fixById[id].title)}</button>)}
              </div>
            </div>
          )}
          <button className="btn-ghost justify-start px-0" onClick={() => { setRes(null); }}><Icon name="back" size={18} /> {t('fx.again')}</button>
        </div>
      )}
    </Screen>
  );
}
