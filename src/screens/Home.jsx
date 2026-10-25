import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import Icon from '../components/Icon.jsx';
import TileArt from '../components/TileArt.jsx';
import Ring from '../components/Ring.jsx';
import JourneyCurve from '../components/JourneyCurve.jsx';
import { services } from '../data/services.js';
import { rtos } from '../data/rtos.js';
import { currentStage, stageRoutes, readiness } from '../journey.js';
import { completeness, hasBasics, fileToDoc } from '../profile.js';
import { ownApps, stagesFor, appTitle } from './Track.jsx';
import { config } from '../data/config.js';
import { downloadSummary } from '../summary.js';
import { docsFor } from './Documents.jsx';
import { OutboxNote } from '../components/Help.jsx';
import { requestUnlock } from '../components/Lock.jsx';
import { situation, history } from '../situation.js';
import { downloadIcs } from '../summary.js';

// Tailwind needs full class names, so tints are mapped here
const APPLY_ORDER = ['ll', 'dl', 'duplicate', 'rto', 'renew', 'address', 'track', 'help'];
export const TINT = { sage: 'bg-sage', sand: 'bg-sand', sky: 'bg-sky', blush: 'bg-blush', butter: 'bg-butter', lilac: 'bg-lilac' };

export default function Home() {
  const { state, update, security } = useStore();
  const { t, L, fmtDate } = useI18n();
  const navigate = useNavigate();
  const loc = useLocation();
  const servicesRef = useRef(null);

  // "#services" from the menu or the details screen scrolls straight to the tiles
  useEffect(() => {
    if (loc.hash === '#services') servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loc.hash, loc.key]);

  const [fabHidden, setFabHidden] = useState(false);
  const lastY = useRef(0);
  const onScroll = (e) => {
    const y = e.currentTarget.scrollTop;
    setFabHidden(y > lastY.current && y > 80);
    lastY.current = y;
  };
  const first = state.profile.name ? state.profile.name.split(' ')[0] : '';
  const calm = !!state.settings.calm;
  const [showAll, setShowAll] = useState(loc.hash === '#services');
  const sit = situation(state);
  const today = fmtDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="h-full relative">
    <div className="h-full overflow-y-auto" onScroll={onScroll}>
      <div className="px-5 pt-5 pb-28">
        {/* Greeting */}
        <header className="rise">
          <p className="eyebrow">{today}</p>
          <h1 className="font-display text-[2.6rem] leading-[1.02] tracking-[-0.015em] mt-1 break-words">
            {first ? t('h.hello', { name: first }) : t('h.helloAnon')}
          </h1>
          <p className="text-muted mt-1.5">{t('h.sub')}</p>
          <button
            className={`mt-3 chip min-h-[2.5rem] ${calm ? 'border-brand text-brand bg-brand-soft' : ''}`}
            onClick={() => update((st) => { st.settings.calm = !calm; })}
            aria-pressed={calm}
          >
            <Icon name="leaf" size={15} /> {calm ? t('calm.on') : t('calm.ask')}
          </button>
        </header>

        {sit.kind !== 'start' && <SituationCard s={sit} onOther={() => { setShowAll(true); setTimeout(() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }} />}

        {/* Clear way in: apply for a licence or any other service */}
        {sit.kind === 'start' && <section className="mt-5 rounded-4xl bg-brand text-on-brand p-5 rise" aria-labelledby="start-h">
          <h2 id="start-h" className="font-display text-[1.75rem] leading-tight">{t('h.startT')}</h2>
          <p className="opacity-90 text-sm mt-0.5">{t('h.startSub')}</p>
          <div className="mt-4 grid gap-2">
            <button className="w-full min-h-[3.25rem] rounded-2xl bg-surface text-ink font-semibold px-4 flex items-center gap-3 text-left active:scale-[0.99]" onClick={() => navigate('/service/ll')}>
              <span className="w-9 h-9 rounded-xl bg-sage grid place-items-center font-bold shrink-0">L</span>
              <span className="flex-1 min-w-0 leading-tight">{t('h.applyLL')}</span><Icon name="right" size={18} />
            </button>
            <button className="w-full min-h-[3.25rem] rounded-2xl bg-surface text-ink font-semibold px-4 flex items-center gap-3 text-left active:scale-[0.99]" onClick={() => navigate('/service/dl')}>
              <span className="w-9 h-9 rounded-xl bg-sky grid place-items-center shrink-0"><Icon name="file" size={18} /></span>
              <span className="flex-1 min-w-0 leading-tight">{t('h.applyDL')}</span><Icon name="right" size={18} />
            </button>
            <button className="w-full min-h-[3rem] rounded-2xl border-2 border-on-brand/40 font-semibold px-4 flex items-center gap-3 text-left" onClick={() => { setShowAll(true); setTimeout(() => servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}>
              <span className="flex-1 min-w-0 leading-tight">{t('h.applyOther')}</span><Icon name="down" size={18} />
            </button>
          </div>
        </section>}

        <button className="mt-3 w-full card px-4 py-3.5 flex items-center gap-3 text-left rise" style={{ '--i': 1 }} onClick={() => navigate('/fix')}>
          <span className="w-10 h-10 rounded-full bg-butter grid place-items-center shrink-0"><Icon name="sparkle" size={18} /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold leading-tight">{t('fx.homeT')}</span><span className="block text-sm text-muted leading-snug">{t('fx.homeSub')}</span></span>
          <Icon name="right" size={18} className="text-muted" />
        </button>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 [&>*]:min-w-0">
          <DetailsBox />
          <StatusBox />
        </div>

        <DoneSoFar calm={calm} />

        {calm && !showAll && (
          <button ref={servicesRef} className="mt-6 btn-secondary w-full" onClick={() => setShowAll(true)}>
            <Icon name="grid" size={18} /> {t('calm.showAll')}
          </button>
        )}
        {(!calm || showAll) && <>
        <section ref={servicesRef} id="services" className="mt-9 scroll-mt-4" aria-labelledby="svc-h">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 id="svc-h" className="font-display text-[1.9rem] leading-tight">{t('h.apply')}</h2>
              <p className="text-sm text-muted">{t('h.applySub')}</p>
            </div>
          </div>
          <TileGrid list={APPLY_ORDER.map((id) => services.find((s) => s.id === id))} offset={2} />
        </section>

        <section className="mt-9" aria-labelledby="prep-h">
          <h2 id="prep-h" className="font-display text-[1.9rem] leading-tight">{t('h.prepare')}</h2>
          <p className="text-sm text-muted">{t('h.prepareSub')}</p>
          <TileGrid list={services.filter((s) => s.group === 'prepare')} offset={10} />
        </section>
        </>}

        <footer className="mt-10 pt-5 border-t border-line/70 text-xs text-muted leading-relaxed">
          <p>{t('footer')}</p>
        </footer>
      </div>
    </div>
      <button
        onClick={() => navigate('/chat')}
        className={`absolute right-4 bottom-5 z-20 flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-ink text-bg shadow-lift active:scale-95 transition-all duration-300 ${fabHidden ? 'translate-y-24 opacity-0 pointer-events-none' : ''}`}
        aria-label={t('ch.title')}
        tabIndex={fabHidden ? -1 : 0}
      >
        <Icon name="chat" />
        <span className="font-semibold">{t('nav.ask')}</span>
      </button>
    </div>
  );

  function TileGrid({ list, offset }) {
    return (
      <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 [&>*]:min-w-0">
        {list.map((s, i) => (
          <li key={s.id} className="rise" style={{ '--i': i + offset }}>
            <button
              onClick={() => navigate(s.entry || (s.direct ? s.to : `/service/${s.id}`))}
              className={`tile ${TINT[s.tint]} w-full h-full min-h-[9.75rem] p-4 flex flex-col gap-3`}
              aria-label={`${L(s.title)}. ${L(s.short)}`}
            >
              <span className="flex items-start justify-between">
                <TileArt name={s.anim} className="w-[4.25rem] h-[3.4rem] -ml-1" />
                <span className="w-7 h-7 rounded-full bg-surface/70 grid place-items-center text-ink/70 shrink-0">
                  <Icon name="right" size={15} strokeWidth={2.5} />
                </span>
              </span>
              <span className="min-w-0 w-full">
                <span className="block font-semibold leading-tight break-words min-h-[2.5em]">{L(s.title)}</span>
                <span className="block text-[0.8rem] text-ink/60 leading-snug mt-0.5 break-words">{L(s.short)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  // ---------- Box 1: your details (fill once)
  function DetailsBox() {
    const p = state.profile;
    if (security.on && !security.unlocked) {
      return (
        <section className="card p-5 flex flex-col rise" style={{ '--i': 0 }} aria-labelledby="det-h">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-brand-soft text-brand grid place-items-center shrink-0"><Icon name="lock" size={22} /></span>
            <div className="min-w-0">
              <p className="eyebrow">{t('h.yourDetails')}</p>
              <h2 id="det-h" className="font-semibold text-lg leading-tight">{t('h.locked')}</h2>
            </div>
          </div>
          <p className="text-muted text-sm mt-2 leading-snug">{t('h.lockedSub')}</p>
          <button className="btn-secondary w-full mt-4" onClick={() => requestUnlock()}><Icon name="unlock" size={18} /> {t('pf.unlock')}</button>
        </section>
      );
    }
    const c = completeness(p);
    const started = hasBasics(p);
    const docList = docsFor({ age: state.elig.age || '19', vehicle: state.elig.vehicle || 'motorcycle' }).filter((d) => d.id !== 'form1');
    const have = docList.filter((d) => state.docs[d.id] || (d.id === 'photo' && p.photo) || (d.id === 'signature' && p.sign) || Object.entries(fileToDoc).some(([f, id]) => id === d.id && p.files?.[f]));
    const missing = docList.filter((d) => !have.includes(d));

    if (!started) {
      return (
        <section className="card p-5 min-h-[15.5rem] flex flex-col rise" style={{ '--i': 0 }} aria-labelledby="det-h">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow text-brand">{t('h.step1')}</p>
              <h2 id="det-h" className="font-display text-[1.75rem] leading-[1.1] mt-1">{t('h.addDetails')}</h2>
            </div>
            <TileArt name="idscan" className="w-20 h-16 shrink-0 -mr-1" />
          </div>
          <p className="text-muted mt-2 leading-snug">{t('h.addDetailsSub')}</p>
          <div className="mt-auto pt-4">
            <button className="btn-primary w-full" onClick={() => navigate('/profile')}>
              {t('h.addDetailsBtn')} <Icon name="right" size={18} />
            </button>
            <p className="text-xs text-muted text-center mt-2">{t('h.addDetailsTime')}</p>
          </div>
        </section>
      );
    }

    return (
      <section className="card p-5 min-h-[15.5rem] flex flex-col rise" style={{ '--i': 0 }} aria-labelledby="det-h">
        <div className="flex items-center gap-3">
          {p.photo ? (
            <img src={p.photo} alt="" className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-surface shadow-soft" />
          ) : (
            <span className="w-14 h-14 rounded-full bg-brand text-on-brand grid place-items-center text-xl font-bold shrink-0">{p.name[0]}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t('h.yourDetails')}</p>
            <h2 id="det-h" className="font-semibold text-lg leading-tight break-words">{p.name}</h2>
          </div>
          <Ring pct={c.pct} size={52} stroke={5}>
            <span className="text-xs font-bold tabular-nums">{c.pct}%</span>
          </Ring>
        </div>

        <div className="where-grid mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-ok-soft px-3 py-2.5 min-w-0">
            <p className="text-xs font-semibold text-ok flex items-center gap-1"><Icon name="check" size={13} strokeWidth={3} /> {t('h.have')}</p>
            <p className="text-sm font-semibold mt-0.5 leading-snug break-words">{have.length ? have.map((d) => L(d.name).split(' (')[0]).slice(0, 2).join(', ') + (have.length > 2 ? ` +${have.length - 2}` : '') : '—'}</p>
          </div>
          <div className={`rounded-2xl px-3 py-2.5 min-w-0 ${missing.length ? 'bg-warn-soft' : 'bg-ok-soft'}`}>
            <p className={`text-xs font-semibold flex items-center gap-1 ${missing.length ? 'text-warn' : 'text-ok'}`}>
              <Icon name={missing.length ? 'alert' : 'check'} size={13} strokeWidth={2.5} /> {t('h.missing')}
            </p>
            <p className="text-sm font-semibold mt-0.5 leading-snug break-words">{missing.length ? missing.map((d) => L(d.name).split(' (')[0]).slice(0, 2).join(', ') + (missing.length > 2 ? ` +${missing.length - 2}` : '') : t('h.nothing')}</p>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <p className="text-xs text-muted flex-1 min-w-0 leading-snug">{t('h.usedEverywhere')}</p>
          <button className="btn-secondary min-h-[2.75rem] px-4 text-sm shrink-0" onClick={() => navigate('/profile')}>
            <Icon name="pen" size={15} /> {t('c.edit')}
          </button>
        </div>
      </section>
    );
  }

  // ---------- Box 2: what you applied for and where it is
  function StatusBox() {
    // Requests still waiting to send count too, so Home shows the right application straight away
    const queued = (state.outbox || []).filter((x) => x.request).map((x) => ({ no: x.request.no, type: 'req', service: x.request.service, done: {}, own: true, waiting: true }));
    const apps = [...ownApps(state), ...queued];
    const journeyStarted = state.app.submitted || state.ll.date || state.dl.submitted || state.stageMin > 0;
    const cur = currentStage(state);
    const labels = [0, 1, 2, 3, 4, 5].map((i) => t('sts.' + i));
    const ready = readiness(state.tests, config.test.passMark, config.test.count);
    const reqs = apps.filter((a) => a.type === 'req');
    const main = apps.filter((a) => a.type !== 'req').slice(-1)[0];
    // No learner's/driving licence journey yet: show the latest other application (e.g. a lost licence) on the curve
    const reqMode = !journeyStarted && reqs.length > 0;
    const primary = reqMode ? reqs[reqs.length - 1] : main;
    const others = reqs.filter((a) => a !== primary).slice(-2).reverse();
    const rStages = stagesFor('req');
    const rCur = reqMode ? (() => { const i = rStages.findIndex((x) => !primary.done[x]); return i < 0 ? rStages.length - 1 : i; })() : 0;
    const curveLabels = reqMode ? rStages.map((_, i) => t('rq.' + i)) : labels;
    const curveCur = reqMode ? rCur : cur;

    const save = () => {
      const all = ownApps(state);
      const rto = rtos.find((r) => r.id === state.slot.rto);
      downloadSummary({
        heading: t('h.sumHeading'),
        name: state.profile.name,
        rows: [
          ...all.map((a) => {
            const st = stagesFor(a.type);
            const at = st.findIndex((x) => !a.done[x]);
            return { label: `${appTitle(a, t, L)} · ${a.no}`, value: at < 0 ? t('h.done') : t('tr.s.' + st[Math.max(0, at - 1)]) };
          }),
          ...(state.slot.date ? [{ label: t('pm.book'), value: `${fmtDate(state.slot.date)} · ${state.slot.time} · ${rto ? L(rto.name) : ''}` }] : []),
        ].slice(0, 5),
        nextLabel: t('home.next'),
        next: reqMode ? t('h.nextTrack') : t('nx.' + cur),
        listTitle: t('pm.checklist'),
        list: ['ll', 'docs', 'vehicle', 'helmet'].map((k) => t('pm.ck.' + k)),
        footer: t('footer'),
      });
    };

    if (!journeyStarted && !reqs.length && !(state.outbox || []).length) {
      return (
        <section className="card p-5 min-h-[15.5rem] flex flex-col rise" style={{ '--i': 1 }} aria-labelledby="st-h">
          <p className="eyebrow">{t('h.yourApps')}</p>
          <h2 id="st-h" className="font-semibold text-lg leading-tight mt-1">{t('h.noApps')}</h2>
          <div className="mt-2 -mx-1 opacity-80"><JourneyCurve labels={labels} ghost title={t('home.journey')} /></div>
          <p className="text-sm text-muted">{t('h.whereAreYou')}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[['home.b0', 0, '/service/ll'], ['home.b1', 3, '/permanent'], ['home.b2', 4, '/driving-test'], ['home.b3', null, '/track']].map(([k, st, to]) => (
              <WhereChip key={k} k={k} st={st} to={to} />
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="card p-5 min-h-[15.5rem] flex flex-col rise" style={{ '--i': 1 }} aria-labelledby="st-h">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="eyebrow">{t('h.yourApps')}</p>
            <h2 id="st-h" className="font-semibold text-lg leading-tight mt-1 break-words">
              {primary ? appTitle(primary, t, L) : t('home.journey')}
              {primary && <span className="block text-xs font-mono text-muted font-normal mt-0.5">{primary.no}</span>}
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted shrink-0 tabular-nums mt-1">{t('h.stageN', { n: curveCur + 1, total: curveLabels.length })}</span>
        </div>

        <div className="mt-2"><OutboxNote /></div>
        <div className="mt-1 -mx-1"><JourneyCurve labels={curveLabels} current={curveCur} title={reqMode ? `${appTitle(primary, t, L)}: ${t('rq.' + rCur)}` : `${t('home.journey')}: ${t('st.' + cur)}`} /></div>

        {sit.kind === 'start' && <button
          onClick={() => navigate(reqMode ? '/track?no=' + primary.no : stageRoutes[cur])}
          className="w-full text-left rounded-2xl bg-brand text-on-brand px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs opacity-80 font-semibold">{t('home.next')}</span>
            <span className="block font-semibold leading-snug break-words">{reqMode ? t('h.nextTrack') : t('nx.' + cur)}</span>
          </span>
          <Icon name="right" />
        </button>}

        {!reqMode && cur === 2 && ready && (
          <p className="text-xs text-muted mt-2">{t('home.ready')}: <strong className="text-ink">{ready.pct}%</strong></p>
        )}

        {others.length > 0 && (
          <ul className="mt-3 divide-y divide-line/70">
            {others.map((a) => {
              const st = stagesFor(a.type);
              const at = st.findIndex((x) => !a.done[x]);
              return (
                <li key={a.no}>
                  <button onClick={() => navigate('/track?no=' + a.no)} className="w-full flex items-center gap-2 py-2 text-left text-sm min-h-[2.75rem]">
                    <span className="flex-1 min-w-0 truncate font-medium">{appTitle(a, t, L)}</span>
                    <span className={`shrink-0 text-xs font-semibold rounded-full px-2 py-0.5 ${at < 0 ? 'bg-ok-soft text-ok' : 'bg-brand-soft text-brand'}`}>
                      {at < 0 ? t('h.done') : t('tr.s.' + st[Math.max(0, at - 1)])}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-auto pt-3 grid grid-cols-2 gap-2">
          <button className="btn-secondary min-h-[2.75rem] px-3 text-sm" onClick={save}>
            <Icon name="download" size={16} /> {t('h.download')}
          </button>
          <button className="btn-secondary min-h-[2.75rem] px-3 text-sm" onClick={() => navigate('/track' + (primary ? '?no=' + primary.no : ''))}>
            <Icon name="route" size={16} /> {t('h.track')}
          </button>
        </div>
      </section>
    );
  }

  function WhereChip({ k, st, to }) {
    const { update } = useStore();
    return (
      <button
        className="chip text-xs min-h-[2.5rem] px-3"
        onClick={() => {
          if (st !== null) update((s) => { s.stageMin = st; });
          navigate(to);
        }}
      >
        {t(k)}
      </button>
    );
  }
}

// Resolve [key, vars] into text: dates are formatted, {en,hi} objects translated
function useTk() {
  const { t, L, fmtDate } = useI18n();
  return (pair) => {
    if (!pair) return '';
    const [k, vars] = pair;
    const v = {};
    for (const [n, x] of Object.entries(vars || {})) v[n] = n === 'date' ? fmtDate(x) : x && typeof x === 'object' ? L(x) : x;
    return t(k, v);
  };
}

// ---------- "Where you are": changes colour, facts and the one next step with the person's situation
function SituationCard({ s, onOther }) {
  const { t, L, fmtDate } = useI18n();
  const tk = useTk();
  const navigate = useNavigate();
  const run = (a) => {
    if (a.to) return navigate(a.to);
    if (a.ics) downloadIcs({ title: tk(a.ics.title), date: a.ics.date, time: a.ics.time, minutes: 30, note: tk(a.ics.note) });
  };
  const value = (f) => {
    if (f.days !== undefined) return t('sit.f.days', { n: f.days });
    if (f.text) return f.text;
    if (f.textL) return L(f.textL);
    if (f.stage) return t('tr.s.' + f.stage);
    if (f.pending) return t('sit.f.checking');
    if (f.now) return t('sit.f.now');
    return fmtDate(f.date) + (f.extra ? ` · ${f.extra}` : '');
  };
  const sub = (f) => {
    if (f.ago !== undefined) return f.ago === 0 ? t('sit.f.today') : t('sit.f.ago', { n: f.ago });
    if (f.left !== undefined) return f.left < 0 ? t('sit.f.expired') : t('sit.f.left', { n: f.left });
    if (f.now) return fmtDate(f.date);
    if (f.stage) return t('sit.f.expected', { date: fmtDate(f.date) });
    if (f.done !== undefined) return f.done ? t('sit.f.doneMark') : t('sit.f.expectedShort');
    return '';
  };
  const warn = (f) => f.left !== undefined && f.left < 30;
  return (
    <section className={`mt-5 rounded-4xl ${TINT[s.tint] || 'bg-sage'} p-5 rise`} aria-labelledby="sit-h">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/70 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand" aria-hidden="true" /> {tk(s.eyebrow)}
      </p>
      <h2 id="sit-h" className="font-display text-[1.95rem] leading-[1.08] mt-1.5 break-words">{tk(s.h)}</h2>
      <p className="text-ink/75 mt-1.5 leading-snug">{tk(s.sub)}</p>
      <button className="mt-4 w-full rounded-2xl bg-brand text-on-brand px-4 py-3 min-h-[3.25rem] flex items-center gap-3 text-left active:scale-[0.99]" onClick={() => run(s.next)}>
        <span className="min-w-0 flex-1">
          <span className="block text-xs opacity-80 font-semibold">{t('home.next')}</span>
          <span className="block font-semibold leading-snug break-words">{t(s.next.k)}</span>
        </span>
        <Icon name="right" />
      </button>

      {s.bar && (
        <div className="mt-4" aria-hidden="true">
          <div className="relative h-2.5 rounded-full bg-surface/80">
            <div className={`absolute inset-y-0 left-0 rounded-full ${s.bar.warn ? 'bg-warn' : 'bg-brand'}`} style={{ width: `${Math.max(3, s.bar.pos * 100)}%` }} />
            <div className="absolute -top-1 w-0.5 h-4.5 bg-ink/60" style={{ left: `${s.bar.mark * 100}%`, height: '1.1rem' }} />
          </div>
          <div className="relative mt-1 h-4 text-[0.7rem] font-semibold text-ink/65">
            <span className="absolute" style={{ left: `${Math.max(0, s.bar.mark * 100 - 4)}%` }}>{t('sit.bar.mark')}</span>
            <span className="absolute right-0">{t('sit.bar.end')}</span>
          </div>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-2 [&>*]:min-w-0">
        {s.facts.map((f) => (
          <div key={f.k} className={`rounded-2xl px-3 py-2.5 ${warn(f) ? 'bg-warn-soft' : 'bg-surface/75'}`}>
            <dt className="text-xs font-semibold text-ink/65 leading-tight">{t(f.k)}</dt>
            <dd className={`font-semibold leading-snug mt-0.5 break-words ${f.mono ? 'font-mono text-sm' : ''}`}>{value(f)}</dd>
            {sub(f) && <dd className={`text-xs leading-tight mt-0.5 ${warn(f) ? 'text-warn font-semibold' : 'text-ink/65'}`}>{sub(f)}</dd>}
          </div>
        ))}
      </dl>

      {(s.also || []).map((a) => (
        <button key={a.k} className="mt-2 w-full rounded-2xl bg-surface/80 px-4 min-h-[3rem] flex items-center gap-3 text-left font-semibold" onClick={() => run(a)}>
          <Icon name={a.ics ? 'calendar' : a.to === '/road-game' ? 'play' : 'check'} size={18} className="shrink-0 text-brand" />
          <span className="flex-1 min-w-0 leading-snug">{t(a.k, a.vars?.date ? { date: fmtDate(a.vars.date) } : undefined)}</span>
        </button>
      ))}
      <button className="mt-3 text-sm font-semibold underline min-h-[2.5rem] flex items-center gap-1" onClick={onOther}>{t('sit.more')} <Icon name="down" size={14} /></button>
    </section>
  );
}

// ---------- "What you've already done": so nobody has to remember
function DoneSoFar({ calm }) {
  const { state } = useStore();
  const { t, fmtDate } = useI18n();
  const tk = useTk();
  const navigate = useNavigate();
  const [all, setAll] = useState(false);
  const items = history(state);
  if (!items.length) return null;
  const max = calm ? 2 : 3;
  const shown = all ? items : items.slice(0, max);
  return (
    <section className="card p-5 mt-3 rise" style={{ '--i': 2 }} aria-labelledby="done-h">
      <h2 id="done-h" className="font-semibold text-lg leading-tight">{t('done.title')}</h2>
      <p className="text-sm text-muted">{t('done.sub')}</p>
      <ul className="mt-3 divide-y divide-line/70">
        {shown.map((x, i) => (
          <li key={x.k + i}>
            <button className="w-full flex items-start gap-3 py-2.5 text-left min-h-[2.75rem]" onClick={() => navigate(x.to)}>
              <span className="w-6 h-6 rounded-full bg-ok-soft text-ok grid place-items-center shrink-0 mt-0.5"><Icon name="check" size={13} strokeWidth={3} /></span>
              <span className="flex-1 min-w-0 leading-snug">{tk([x.k, x.vars])}</span>
              <span className="text-xs text-muted shrink-0 mt-0.5 tabular-nums">{x.date ? fmtDate(x.date, { day: 'numeric', month: 'short' }) : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      {items.length > max && (
        <button className="mt-1 text-sm font-semibold text-brand min-h-[2.5rem]" onClick={() => setAll(!all)}>
          {all ? t('done.less') : t('done.more', { n: items.length })}
        </button>
      )}
    </section>
  );
}

