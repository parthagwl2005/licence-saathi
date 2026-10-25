import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { BackButton, Listen, Tx } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import TileArt from '../components/TileArt.jsx';
import { Logo } from '../components/Shell.jsx';
import { serviceById, extraDocs } from '../data/services.js';
import { documents } from '../data/content.js';
import { faq } from '../data/faq.js';
import { config } from '../data/config.js';
import { TINT } from './Home.jsx';
import { matchFaq } from './Chat.jsx';
import { llFee } from './Apply.jsx';
import { ageOn, addYears, todayStr, llDates, newAppNo, fileToDataURL, shrinkImage, sampleImage } from '../utils.js';
import { usePersonForm, SourceChooser, SourceBar, PersonFields, validatePerson, changedFields, SaveSheet, PERSON, detailsPatch, LockedDraft } from '../components/FillForm.jsx';
import { useSavedDetails } from '../components/Lock.jsx';
import { fileToDoc } from '../profile.js';
import NumberInput, { validDl } from '../components/NumberInput.jsx';
import { ErrorCard, PauseButton } from '../components/Help.jsx';
import { trySend, queueItem } from '../queue.js';

const faqById = Object.fromEntries(faq.map((f) => [f.id, f]));

export const feeFor = (s) => (s.feeKey === 'll' ? llFee(1) : s.feeKey === 'dl' ? config.fees.drivingTest + config.fees.licenceIssue : s.fee);

// Name of a required document, from either list
export function docName(id, L) {
  const d = documents.find((x) => x.id === id);
  if (d) return L(d.name);
  if (extraDocs[id]) return L(extraDocs[id].name);
  return id;
}

// Does the user already have this document? (from Your details or the checklist)
export function hasDoc(state, id, extraFiles = {}) {
  const p = state.profile;
  if (extraFiles[id]) return true;
  if (id === 'photo') return !!p.photo || !!state.docs.photo;
  if (id === 'signature') return !!p.sign || !!state.docs.signature;
  if (id === 'form1') return true;
  if (extraFiles[id]) return true;
  if (p.files?.[id]) return true;
  const f = Object.entries(fileToDoc).find(([, d]) => d === id);
  return !!(f && p.files?.[f[0]]) || !!state.docs[id];
}

// Optional documents (only needed in some cases)
const isOptional = (id, state, dob = state.profile.dob) => id === 'police' || (id === 'form1a' && !(dob && ageOn(dob) >= config.doctorCertAge));

export default function Service() {
  const { id } = useParams();
  const s = serviceById[id];
  const { state } = useStore();
  const { t, L, fmtDate, num } = useI18n();
  const navigate = useNavigate();
  if (!s) return <Navigate to="/" replace />;
  if (s.direct) return <Navigate to={s.to} replace />;

  const p = state.profile;
  const already = (state.requests || []).filter((r) => r.service === id).slice(-1)[0] || (id === 'll' && state.app.submitted ? { no: state.app.appNo } : null) || (id === 'dl' && state.dl.submitted ? { no: state.dl.appNo } : null);

  // Eligibility in one line, worked out from saved details
  let elig = { tone: 'ok', text: t('sv.canApply') };
  if (id === 'll') {
    if (!p.dob) elig = { tone: 'neutral', text: t('sv.addDob'), to: '/profile' };
    else {
      const age = ageOn(p.dob);
      if (age >= config.minAge.motorcycle) elig = { tone: 'ok', text: t('sv.canApply') };
      else if (age >= config.minAge.gearless50) elig = { tone: 'warn', text: t('sv.only50') };
      else elig = { tone: 'warn', text: t('sv.from', { date: fmtDate(addYears(p.dob, config.minAge.gearless50)) }) };
    }
  }
  if (id === 'dl') {
    if (!state.ll.date) elig = { tone: 'neutral', text: t('sv.afterLL') };
    else {
      const d = llDates(state.ll.date);
      const today = todayStr();
      elig = today < d.applyFrom ? { tone: 'warn', text: t('sv.from', { date: fmtDate(d.applyFrom) }) } : today > d.expires ? { tone: 'warn', text: t('pm.expired') } : { tone: 'ok', text: t('sv.canApply') };
    }
  }
  if (already) elig = { tone: 'brand', text: t('sv.already', { no: already.no }), to: '/track?no=' + already.no };

  const tone = { ok: 'bg-ok-soft text-ok', warn: 'bg-warn-soft text-warn', neutral: 'bg-sunk text-ink', brand: 'bg-brand-soft text-brand' }[elig.tone];
  const applyTo = s.to || `/service/${id}/apply`;
  const EligTag = elig.to ? 'button' : 'div';
  const docs = s.docs || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        <div className="px-5 pt-4"><BackButton back="/#services" /></div>
        {/* Hero */}
        <div className={`mx-5 mt-3 rounded-4xl ${TINT[s.tint]} px-5 pt-5 pb-6 rise`}>
          <TileArt name={s.anim} className="w-28 h-[5.6rem] -ml-2" />
          <h1 className="font-display text-[2.3rem] leading-[1.05] mt-2 break-words">{L(s.title)}</h1>
          <p className="text-ink/70 mt-1 break-words">{L(s.short)}</p>
        </div>

        <div className="px-5">
          <EligTag
            onClick={elig.to ? () => navigate(elig.to) : undefined}
            className={`mt-3 w-full rounded-2xl px-4 py-3 flex items-center gap-2 text-left font-semibold rise ${tone}`}
            style={{ '--i': 1 }}
            role={elig.to ? undefined : 'status'}
          >
            <Icon name={elig.tone === 'ok' ? 'check' : elig.tone === 'brand' ? 'route' : 'info'} size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="flex-1 min-w-0 break-words">{elig.text}</span>
            {elig.to && <Icon name="right" size={18} />}
          </EligTag>

          <dl className="mt-3 card divide-y divide-line/70 rise" style={{ '--i': 2 }}>
            <Row k="sv.what" v={L(s.what)} />
            <Row k="sv.when" v={L(s.when)} />
            <Row k="sv.fee" v={<span className="tabular-nums">₹{num(feeFor(s))} <span className="text-muted font-normal text-sm">· {t('c.sample')}</span></span>} />
          </dl>
          <div className="mt-2"><Listen small text={`${L(s.title)}. ${L(s.what)} ${L(s.when)}`} /></div>

          {docs.length > 0 && (
            <section className="mt-5 rise" style={{ '--i': 3 }}>
              <h2 className="font-semibold"><Tx k="sv.need" inline /></h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {docs.map((d) => {
                  const have = hasDoc(state, d);
                  return (
                    <li key={d} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${have ? 'bg-ok-soft text-ok' : 'bg-surface border border-line text-ink'}`}>
                      <Icon name={have ? 'check' : 'plus'} size={14} strokeWidth={2.5} />
                      <span>{docName(d, L)}</span>
                      {isOptional(d, state) && !have && <span className="text-muted text-xs">· {t('pf.optional')}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {s.steps && (
            <section className="mt-5 rise" style={{ '--i': 4 }}>
              <h2 className="font-semibold"><Tx k="sv.steps" inline /></h2>
              <ol className="mt-2 grid gap-2">
                {s.steps.map((st, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-8 h-8 shrink-0 rounded-full bg-surface border border-line grid place-items-center text-sm font-bold tabular-nums">{i + 1}</span>
                    <span className="min-w-0 break-words">{L(st)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <MiniHelper ids={s.faq || []} />
        </div>
      </div>
      <div className="px-5 py-3 border-t border-line/70 bg-bg/90 backdrop-blur">
        <button className="btn-primary w-full" onClick={() => navigate(applyTo)}>
          {already ? t('sv.applyAgain') : t('sv.applyFor', { name: L(s.title) })} <Icon name="right" size={18} />
        </button>
      </div>
    </div>
  );

  function Row({ k, v }) {
    return (
      <div className="px-4 py-3">
        <dt className="text-xs font-semibold text-muted">{t(k)}</dt>
        <dd className="mt-0.5 leading-snug break-words">{v}</dd>
      </div>
    );
  }
}

// "Ask about this": a small built-in helper with this service's common questions
function MiniHelper({ ids }) {
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const [ans, setAns] = useState(null); // { q, id|null }
  const [text, setText] = useState('');
  const ask = (q, id) => setAns({ q, id });
  return (
    <section className="mt-6 card p-4 rise" style={{ '--i': 5 }} aria-labelledby="mh-h">
      <div className="flex items-center gap-2">
        <Logo size={26} />
        <h2 id="mh-h" className="font-semibold flex-1 min-w-0">{t('sv.ask')}</h2>
        <button className="text-sm font-semibold text-brand min-h-[2.5rem] px-2" onClick={() => navigate('/chat')}>{t('sv.fullChat')}</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <button key={id} className={`chip text-left ${ans?.id === id ? 'border-brand text-brand' : ''}`} onClick={() => ask(L(faqById[id].q), id)}>
            {L(faqById[id].q)}
          </button>
        ))}
      </div>
      {ans && (
        <div className="mt-3 rounded-2xl bg-sunk p-3 fade-in" aria-live="polite" key={ans.q}>
          <p className="text-xs font-semibold text-muted">{ans.q}</p>
          <p className="mt-1 leading-snug">{ans.id ? L(faqById[ans.id].a) : t('ch.notSure')}</p>
          {!ans.id && <a href={config.officialSite} target="_blank" rel="noreferrer" className="text-sm text-brand font-semibold underline">parivahan.gov.in ↗</a>}
        </div>
      )}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const q = text.trim();
          if (!q) return;
          setText('');
          ask(q, /\d{4}\s?\d{4}\s?\d{4}/.test(q) ? null : matchFaq(q));
        }}
      >
        <label htmlFor="mh-in" className="sr-only">{t('ch.placeholder')}</label>
        <input id="mh-in" className="field min-h-[3rem]" placeholder={t('ch.placeholder')} value={text} maxLength={200} onChange={(e) => setText(e.target.value)} autoComplete="off" />
        <button className="w-12 h-12 shrink-0 rounded-full bg-brand text-on-brand grid place-items-center" aria-label={t('ch.send')}><Icon name="send" size={20} /></button>
      </form>
    </section>
  );
}

// ---------- One-screen apply: choose how to fill (saved / DigiLocker / yourself), then check and pay
export function ServiceApply() {
  const { id } = useParams();
  const s = serviceById[id];
  const { state, update } = useStore();
  const saved = useSavedDetails();
  const { t, L, num } = useI18n();
  const navigate = useNavigate();
  const pf = usePersonForm(id);
  const form = pf.form;
  const [queued, setQueued] = useState(null);
  const [keepName, setKeepName] = useState(false);
  const [ask, setAsk] = useState(null);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState('');
  const [errors, setErrors] = useState({});
  if (!s || s.to) return <Navigate to={s ? s.to : '/'} replace />;
  const backTo = id === 'duplicate' ? '/lost' : `/service/${id}`;
  const d = form?.data || {};
  // The licence number comes from what you typed, DigiLocker, your saved details or the lost-licence questions
  const extra = form?.extra || (s.extra?.key === 'licenceNo' ? form?.licenceNo || (id === 'duplicate' && state.lost?.licenceNo) || '' : '');
  // Rejection Shield: the name must match the ID card (scanned, saved or from DigiLocker)
  const idName = form?.idName || '';
  const nameClash = idName && d.name && idName.trim().toLowerCase() !== d.name.trim().toLowerCase() && !keepName;
  const files = form?.files || {};
  const docs = (s.docs || []).filter((x) => x !== 'form1');
  const missingDocs = docs.filter((x) => !isOptional(x, state, d.dob) && !hasDoc(state, x, files));
  const fee = feeFor(s);

  const validate = () => {
    const e = validatePerson(d, PERSON, t);
    setErrors(e);
    if (Object.keys(e).length) return t('sv.err.fields');
    if (s.extra && !String(extra).trim()) return t('sv.err.extra');
    if (s.extra?.key === 'licenceNo' && !validDl(extra)) return t('ni.check');
    if (missingDocs.length) return t('sv.err.docs', { list: missingDocs.map((x) => docName(x, L)).join(', ') });
    return '';
  };

  const submit = () => {
    setAsk(null);
    setPaying(true);
    setTimeout(() => {
      const no = newAppNo(id.slice(0, 2).toUpperCase());
      // Only what is needed to track it is kept; personal details are not copied into the request
      const request = { service: id, no, at: todayStr(), amount: fee, extra: s.extra?.key === 'licenceNo' ? '' : extra };
      const r = trySend(state, 0);
      if (r === 'sent') {
        update((st) => { st.requests = [...(st.requests || []), request]; delete st.forms[id]; });
        navigate(`/service/${id}/done?no=${no}`, { replace: true });
      } else {
        update((st) => { st.outbox = [...(st.outbox || []), queueItem({ request }, r)]; delete st.forms[id]; });
        setPaying(false);
        setQueued({ reason: r, no });
      }
    }, 1100);
  };

  const pay = () => {
    const e = validate();
    setErr(e);
    if (e) return;
    const list = form.source === 'saved' && saved.unlocked ? changedFields(d, state.profile) : PERSON.filter((k) => d[k]);
    if (list.length) setAsk(list);
    else submit();
  };

  const answer = async (yes) => {
    if (yes === null) return setAsk(null);
    if (yes) await saved.save(detailsPatch(form));
    submit();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-4 pb-3 flex items-start gap-3">
        <BackButton back={backTo} />
        <div className="min-w-0 pt-0.5 flex-1">
          <h1 className="font-display text-[1.85rem] leading-[1.1] break-words">{queued ? L(s.title) : form?.source ? t('sv.checkApply') : t('sv.applyFor', { name: L(s.title) })}</h1>
          {!queued && <p className="text-sm text-muted break-words">{form?.source ? `${L(s.title)} · ${t('c.minLeft', { n: 2 })}` : t('ff.step1')}</p>}
        </div>
        {!queued && <PauseButton className="mt-1 shrink-0" />}
      </div>
      {queued && (
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          <ErrorCard code={queued.reason}>
            <p className="text-sm">{t('q.saved', { no: queued.no })}</p>
          </ErrorCard>
          <div className="grid gap-2 mt-4">
            <button className="btn-primary" onClick={() => navigate('/')}>{t('c.goHome')}</button>
            <button className="btn-secondary" onClick={() => navigate('/track')}>{t('h.track')}</button>
          </div>
        </div>
      )}

      {!queued && !form?.source && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6" tabIndex={0}>
            {pf.lockedDraft ? <LockedDraft onStartAgain={pf.startAgain} /> : <SourceChooser onPick={(src) => pf.choose(src)} />}
          </div>
          <div className="px-5 py-3 border-t border-line/70 bg-bg/90 backdrop-blur">
            <button className="btn-secondary w-full" onClick={() => navigate(backTo)}><Icon name="back" size={18} /> {t('c.back')}</button>
          </div>
        </>
      )}

      {!queued && form?.source && <>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6" tabIndex={0}>
        <SourceBar source={form.source} onChange={pf.restart} />
        <section className="card p-4 mt-3 rise" aria-labelledby="yd-h">
          <h2 id="yd-h" className="font-semibold mb-3">{t('sv.yourDetails')}</h2>
          <PersonFields form={form} set={pf.set} errors={errors} prefix="sa" />
        </section>

        {nameClash && (
          <div className="mt-3 rise">
            <ErrorCard code="mismatch">
              <p className="text-sm">{t('rs.compare', { form: d.name, id: idName })}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="btn-secondary min-h-[2.75rem] px-3 text-sm" onClick={() => setKeepName(true)}>{t('rs.keep')}</button>
                <button className="btn-primary min-h-[2.75rem] px-3 text-sm" onClick={() => pf.set('name', idName)}>{t('rs.use')}</button>
              </div>
            </ErrorCard>
          </div>
        )}

        {s.extra && (
          <div className="mt-3 card p-4 rise" style={{ '--i': 1 }}>
            {s.extra.key === 'licenceNo' ? (
              <NumberInput id="extra" value={extra} onChange={pf.setExtra} label={t('sv.extra.licenceNo')} />
            ) : (
              <>
                <label htmlFor="extra" className="label">{t('sv.extra.' + s.extra.key)}</label>
                <input id="extra" type={s.extra.type} min={s.extra.type === 'date' ? todayStr() : undefined} className="field" value={extra} onChange={(e) => pf.setExtra(e.target.value)} />
              </>
            )}
          </div>
        )}

        {docs.length > 0 && (
          <section className="mt-3 card p-4 rise" style={{ '--i': 2 }}>
            <h2 className="font-semibold">{t('sv.need')}</h2>
            <ul className="mt-1 divide-y divide-line/70">
              {docs.map((x) => (
                <DocLine key={x} id={x} have={hasDoc(state, x, files)} via={files[x]?.via} optional={isOptional(x, state, d.dob)} onFile={(f) => pf.setFile(x, f)} />
              ))}
            </ul>
          </section>
        )}

        <div className="mt-3 card p-4 flex items-center justify-between rise" style={{ '--i': 3 }}>
          <span className="font-semibold">{t('ap.total')}</span>
          <span className="font-bold text-lg tabular-nums">₹{num(fee)} <span className="text-xs text-muted font-normal">· {t('c.sample')}</span></span>
        </div>
        {err && <p role="alert" className="mt-3 text-bad font-semibold flex gap-1.5 items-start"><Icon name="alert" size={18} className="shrink-0 mt-0.5" /> {err}</p>}
      </div>

      <div className="px-5 py-3 border-t border-line/70 bg-bg/90 backdrop-blur grid grid-cols-[auto_1fr] gap-2">
        <button className="btn-secondary px-4" onClick={pf.restart}><Icon name="back" size={18} /> {t('c.back')}</button>
        <button className="btn-primary" onClick={pay} disabled={paying} aria-busy={paying}>
          {paying ? t('ap.paying') : t('ap.pay', { amt: num(fee) })}
        </button>
      </div>
      </>}

      {ask && <SaveSheet list={ask} onAnswer={answer} />}
      {pf.lockerSheet}
    </div>
  );
}

function DocLine({ id, have, via, optional, onFile }) {
  const { t, L } = useI18n();
  const input = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    let url = '';
    if (f.type.startsWith('image/')) url = await shrinkImage(await fileToDataURL(f), id === 'photo' ? config.upload.photoMaxKB : 120, id === 'photo' ? 360 : 900);
    onFile({ name: f.name, kb: Math.max(1, Math.round(f.size / 1024)), url, at: todayStr(), via: 'upload' });
  };
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center ${have ? 'bg-ok-soft text-ok' : optional ? 'bg-sunk text-muted' : 'bg-warn-soft text-warn'}`}>
        <Icon name={have ? 'check' : optional ? 'file' : 'alert'} size={16} strokeWidth={2.5} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-medium leading-snug break-words">{docName(id, L)}</span>
        <span className={`block text-xs ${have ? 'text-ok' : 'text-muted'}`}>{have ? (via === 'digilocker' ? t('ff.fromLocker') : via === 'upload' ? t('ff.added') : t('sv.fromDetails')) : optional ? t('pf.optional') : t('sv.needed')}</span>
      </span>
      {!have && (
        <>
          <input ref={input} type="file" accept="image/*,application/pdf" className="sr-only" onChange={pick} tabIndex={-1} aria-label={docName(id, L)} />
          {(id === 'photo' || id === 'signature') && (
            <button className="text-xs text-brand font-semibold underline shrink-0 min-h-[2.5rem]" onClick={() => onFile({ name: id + '-sample.png', kb: 8, url: sampleImage(id === 'photo' ? 'photo' : 'sign'), at: todayStr(), via: 'upload' })}>{t('ff.sample')}</button>
          )}
          <button className="chip shrink-0" onClick={() => input.current?.click()}>{t('pf.add')}</button>
        </>
      )}
    </li>
  );
}

// ---------- Receipt
export function ServiceDone() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const s = serviceById[id];
  const { state } = useStore();
  const { t, L, num, fmtDate } = useI18n();
  const navigate = useNavigate();
  const no = params.get('no');
  const r = (state.requests || []).find((x) => x.no === no);
  if (!s || !r) return <Navigate to="/" replace />;
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-8 pb-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-ok text-on-brand grid place-items-center pop shadow-lift">
          <Icon name="check" size={40} strokeWidth={3} />
        </div>
        <h1 className="font-display text-[2.2rem] leading-tight mt-4 rise">{t('ap.done')}</h1>
        <p className="text-muted rise" style={{ '--i': 1 }}>{L(s.title)}</p>
        <div className="card mt-5 p-5 rise" style={{ '--i': 2 }}>
          <p className="text-sm text-muted">{t('ap.appNo')}</p>
          <p className="text-[1.6rem] font-bold tracking-wider font-mono mt-1 break-all">{r.no}</p>
          <p className="text-sm text-muted mt-1">{t('ap.paidOn', { amt: num(r.amount), date: fmtDate(r.at) })} · {t('c.sample')}</p>
        </div>
        <div className="card mt-3 p-5 text-left rise" style={{ '--i': 3 }}>
          <h2 className="font-semibold">{t('ap.nextHead')}</h2>
          <ol className="mt-2 space-y-2">
            {(s.steps || []).map((st, i) => (
              <li key={i} className="flex gap-3 items-center">
                <span className={`w-7 h-7 rounded-full grid place-items-center text-sm font-bold shrink-0 ${i === 0 ? 'bg-ok text-on-brand' : 'bg-sunk'}`}>
                  {i === 0 ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 break-words">{L(st)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-line/70 grid grid-cols-2 gap-2">
        <button className="btn-secondary px-3" onClick={() => navigate('/track?no=' + r.no)}>{t('h.track')}</button>
        <button className="btn-primary px-3" onClick={() => navigate('/')}>{t('c.goHome')}</button>
      </div>
    </div>
  );
}
