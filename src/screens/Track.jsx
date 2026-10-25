import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Stuck, Pill, Listen } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { sampleApplications, trackStages } from '../data/applications.js';
import { rtos } from '../data/rtos.js';
import { stuck } from '../data/content.js';
import { addDays, todayStr } from '../utils.js';
import { requestStages, serviceById } from '../data/services.js';
import { OutboxNote } from '../components/Help.jsx';

export const stagesFor = (type) => (type === 'll' ? trackStages.slice(0, 4) : type === 'req' ? requestStages : trackStages);

// Name of an application in the current language
export function appTitle(app, t, L) {
  if (app.type === 'req') return L(serviceById[app.service]?.title);
  return t(app.type === 'll' ? 'tr.typeLL' : 'tr.typeDL');
}

// Build timelines for the user's own (simulated) applications from their saved progress
export function ownApps(s) {
  const today = todayStr();
  const list = [];
  if (s.app.submitted) {
    const p = s.app.paidAt;
    const done = { applied: p };
    if (addDays(p, 1) <= today) done.docs = addDays(p, 1);
    if (addDays(p, 2) <= today) done.booked = addDays(p, 2);
    if (s.ll.date) Object.assign(done, { docs: done.docs || s.ll.date, booked: done.booked || s.ll.date, passed: s.ll.date });
    list.push({ no: s.app.appNo, type: 'll', rto: s.app.form.rto, done, own: true });
  }
  if (s.dl.submitted) {
    const p = s.dl.paidAt;
    const done = { applied: p };
    if (addDays(p, 1) <= today) done.docs = addDays(p, 1);
    if (s.slot.date) Object.assign(done, { docs: done.docs || s.slot.bookedAt || p, booked: s.slot.bookedAt || p });
    if (s.drivingPassed) {
      const at = s.drivingPassedAt || today;
      done.passed = at;
      if (addDays(at, 3) <= today) done.printed = addDays(at, 3);
      if (addDays(at, 5) <= today) done.posted = addDays(at, 5);
    }
    list.push({ no: s.dl.appNo, type: 'dl', rto: s.slot.rto || s.app.form.rto, done, own: true });
  }
  for (const r of s.requests || []) {
    const steps = { applied: 0, docs: 1, processing: 2, printed: 6, posted: 8 };
    const done = {};
    for (const [k, d] of Object.entries(steps)) if (addDays(r.at, d) <= today) done[k] = addDays(r.at, d);
    list.push({ no: r.no, type: 'req', service: r.service, done, own: true, at: r.at });
  }
  return list;
}

const norm = (x) => x.toUpperCase().replace(/\s+/g, '');

export default function Track() {
  const { state } = useStore();
  const { t, L, fmtDate } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get('no') || '');
  const [query, setQuery] = useState(params.get('no') || '');
  const mine = ownApps(state);
  const all = [...mine, ...sampleApplications];
  const found = query ? all.find((a) => norm(a.no) === norm(query)) : null;

  const show = (no) => {
    setInput(no);
    setQuery(no);
    setParams({ no }, { replace: true });
  };

  return (
    <Screen title="tr.title" back="/">
      <div className="mb-3"><OutboxNote /></div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          show(input.trim());
        }}
      >
        <label htmlFor="appno" className="sr-only">{t('tr.enter')}</label>
        <input id="appno" className="field font-mono uppercase" placeholder="LS-26-48213" value={input} onChange={(e) => setInput(e.target.value)} autoCapitalize="characters" />
        <button className="btn-primary px-4 shrink-0" type="submit">{t('tr.find')}</button>
      </form>

      {mine.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-muted">{t('tr.yours')}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {mine.map((a) => <button key={a.no} className="chip font-mono border-brand text-brand" onClick={() => show(a.no)}>{a.no}</button>)}
          </div>
        </div>
      )}
      <div className="mt-2">
        <p className="text-xs font-semibold text-muted">{t('tr.try')}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {sampleApplications.map((a) => <button key={a.no} className="chip font-mono" onClick={() => show(a.no)}>{a.no}</button>)}
        </div>
      </div>

      {query && !found && (
        <p role="alert" className="mt-3 text-bad font-semibold flex items-center gap-1"><Icon name="alert" size={18} /> {t('tr.notFound')}</p>
      )}

      {found && <Timeline app={found} />}
      {!found && <Stuck items={stuck.track} className="mt-4" />}
      {found?.type === 'll' && found.done.passed && (
        <button className="btn-secondary w-full mt-3" onClick={() => navigate('/permanent')}><Tx k="pm.title" /></button>
      )}
    </Screen>
  );

  function Timeline({ app }) {
    const stages = stagesFor(app.type);
    const cur = stages.findIndex((s) => !app.done[s]);
    const allDone = cur === -1;
    const lastDone = allDone ? stages[stages.length - 1] : stages[cur - 1];
    const rto = rtos.find((r) => r.id === app.rto);
    const nextText = allDone ? t(app.type === 'll' ? 'tr.llDone' : 'tr.complete') : t((app.type === 'req' ? 'tr.r.' : 'tr.n.') + (lastDone || 'applied'));

    return (
      <section className="card mt-4 p-3 fade-in" aria-label={app.no}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono font-bold text-lg">{app.no}</p>
            <p className="text-sm text-muted">{appTitle(app, t, L)}{rto ? ` · ${L(rto.name)}` : ''}</p>
          </div>
          {app.own ? <Pill tone="brand">{t('tr.mine')}</Pill> : <Pill>{t('c.sample')}</Pill>}
        </div>

        <ol className="mt-3">
          {stages.map((s, i) => {
            const isDone = !!app.done[s];
            const isCur = i === cur;
            return (
              <li key={s} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-7 h-7 rounded-full grid place-items-center border-2 shrink-0 ${isDone ? 'bg-ok border-ok text-on-brand' : isCur ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-muted'}`}
                  >
                    {isDone ? <Icon name="check" size={14} strokeWidth={3} /> : isCur ? <Icon name="clock" size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </span>
                  {i < stages.length - 1 && <span className={`w-0.5 flex-1 min-h-[1rem] ${isDone ? 'bg-ok' : 'bg-line'}`} />}
                </div>
                <div className="pb-3 min-w-0 flex-1 flex items-baseline justify-between gap-2">
                  <span className={`font-semibold ${isDone || isCur ? '' : 'text-muted'}`}>{t('tr.s.' + s)}</span>
                  <span className={`text-sm shrink-0 ${isDone ? 'text-ok font-semibold' : isCur ? 'text-brand font-semibold' : 'text-muted'}`}>
                    {isDone ? fmtDate(app.done[s], { day: 'numeric', month: 'short' }) : isCur ? t('tr.now') : t('tr.waiting')}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className={`rounded-xl p-3 mt-1 ${allDone ? 'bg-ok-soft' : 'bg-brand-soft'}`} role="status">
          <p className="font-semibold flex gap-2 items-start">
            <Icon name={allDone ? 'check' : 'info'} size={18} className="shrink-0 mt-0.5" /> {nextText}
          </p>
        </div>
        <div className="mt-2"><Listen small text={`${appTitle(app, t, L)}. ${stages.filter((s) => app.done[s]).map((s) => t('tr.s.' + s)).join(', ')}. ${nextText}`} /></div>
      </section>
    );
  }
}
