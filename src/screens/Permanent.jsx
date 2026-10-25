import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Stuck, Term, Pill } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { config } from '../data/config.js';
import { rtos } from '../data/rtos.js';
import { stuck } from '../data/content.js';
import { todayStr, addDays, daysBetween, llDates, newAppNo, parse, toStr } from '../utils.js';
import { usePersonForm, SourceChooser, SourceBar, PersonFields, validatePerson, changedFields, SaveSheet, PERSON, detailsPatch, LockedDraft } from '../components/FillForm.jsx';
import { useSavedDetails } from '../components/Lock.jsx';

const SECTIONS = ['date', 'apply', 'slot', 'check'];

export default function Permanent() {
  const { state, update } = useStore();
  const { t, L, fmtDate, num } = useI18n();
  const navigate = useNavigate();
  const today = todayStr();
  const ll = state.ll.date;
  const d = ll ? llDates(ll) : null;
  const canApply = d && today >= d.applyFrom && today <= d.expires;
  const expired = d && today > d.expires;
  const f = state.app.form;
  // Details: choose saved / DigiLocker / the learner's licence form / type them
  const saved = useSavedDetails();
  const pf = usePersonForm('dl');
  const llForm = state.forms?.ll?.data?.name ? state.forms.ll : null;
  const [errors, setErrors] = useState({});
  const [ask, setAsk] = useState(null);
  const submitDl = () => { setAsk(null); update((s) => { s.dl.submitted = true; s.dl.appNo = newAppNo('DL'); s.dl.paidAt = today; }); };
  const confirmDl = () => {
    const e = validatePerson(pf.form?.data, PERSON, t);
    setErrors(e);
    if (Object.keys(e).length) return;
    const pd = pf.form.data;
    const list = pf.form.source === 'saved' && saved.unlocked ? changedFields(pd, state.profile) : pf.form.source === 'llform' ? [] : PERSON.filter((k) => pd[k]);
    if (list.length) setAsk(list);
    else submitDl();
  };
  const pickDl = (src) => {
    if (src !== 'llform') return pf.choose(src);
    const from = Object.fromEntries(Object.keys(llForm.data).map((k) => [k, 'llform']));
    return pf.choose('llform', { data: { ...llForm.data }, from, files: llForm.files || {}, idName: llForm.idName || '' });
  };
  const twoWheeler = (f.vehicles || []).some((v) => v === 'motorcycle' || v === 'gearless50') || !f.vehicles?.length;

  const doneFlags = { date: !!ll, apply: state.dl.submitted, slot: !!state.slot.date, check: false };
  const firstOpen = SECTIONS.find((s) => !doneFlags[s]) || 'check';
  const [sec, setSec] = useState(firstOpen);

  // ---- Slot booking state
  const [rto, setRto] = useState(state.slot.rto || f.rto || '');
  const [date, setDate] = useState(state.slot.date || '');
  const [time, setTime] = useState(state.slot.time || '');
  const [editingSlot, setEditingSlot] = useState(!state.slot.date);

  const days = [];
  if (d) {
    let cur = today >= d.applyFrom ? addDays(today, 1) : d.applyFrom;
    while (days.length < 10 && cur <= d.expires && daysBetween(today, cur) <= config.slotDaysAhead + 30) {
      if (!config.closedWeekdays.includes(parse(cur).getDay())) days.push(cur);
      cur = addDays(cur, 1);
    }
  }
  // Some slots shown as already taken, so it feels real (deterministic per day)
  const taken = (day, tm) => (parseInt(day.slice(-2), 10) + tm.charCodeAt(1)) % 4 === 0;

  const fees = config.fees.drivingTest + config.fees.licenceIssue;

  const sectionBody = {
    date: (
      <div>
        <label htmlFor="lldate" className="block text-lg font-semibold mb-2"><Tx k="pm.llDate" /></label>
        <input
          id="lldate"
          type="date"
          className="field"
          max={today}
          min={toStr(new Date(Date.now() - 400 * 86400000))}
          value={ll}
          onChange={(e) => update((s) => { s.ll.date = e.target.value; if (s.stageMin < 3) s.stageMin = 3; })}
        />
        <p className="text-sm text-muted mt-1"><Term id="LL">LL</Term> · <Term id="DL">DL</Term></p>
        {d && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`rounded-2xl p-3 border-2 ${canApply ? 'border-ok/50 bg-ok-soft' : 'border-line bg-surface'}`}>
              <p className="text-xs font-semibold text-muted">{t('pm.from')}</p>
              <p className="font-bold text-lg leading-tight mt-0.5">{fmtDate(d.applyFrom)}</p>
              <p className={`text-sm font-semibold mt-1 ${canApply ? 'text-ok' : 'text-ink'}`}>
                {canApply || expired ? (canApply ? t('pm.now') : '–') : t('pm.daysToGo', { n: daysBetween(today, d.applyFrom) })}
              </p>
            </div>
            <div className={`rounded-2xl p-3 border-2 ${expired ? 'border-bad/50 bg-bad-soft' : 'border-line bg-surface'}`}>
              <p className="text-xs font-semibold text-muted">{t('pm.ends')}</p>
              <p className="font-bold text-lg leading-tight mt-0.5">{fmtDate(d.expires)}</p>
              <p className={`text-sm font-semibold mt-1 ${expired ? 'text-bad' : daysBetween(today, d.expires) < 30 ? 'text-warn' : 'text-ink'}`}>
                {expired ? t('pm.expired') : t('pm.daysLeft', { n: daysBetween(today, d.expires) })}
              </p>
            </div>
          </div>
        )}
      </div>
    ),

    apply: (
      <div>
        {state.dl.submitted ? (
          <div className="rounded-2xl p-4 bg-ok-soft border-2 border-ok/40" role="status">
            <p className="font-bold text-ok flex items-center gap-1.5"><Icon name="check" strokeWidth={3} /> {t('pm.submitted')}</p>
            <p className="mt-1 text-sm text-muted">{t('ap.appNo')}</p>
            <p className="font-mono font-bold text-xl tracking-wider">{state.dl.appNo}</p>
          </div>
        ) : (
          <>
            <p className="text-lg font-semibold"><Tx k="pm.apply" /></p>
            <p className="text-sm text-muted">{t('pm.applySub')}</p>
            {pf.lockedDraft ? (
              <div className="mt-3"><LockedDraft onStartAgain={pf.startAgain} /></div>
            ) : !pf.form?.source ? (
              <div className="mt-3">
                <SourceChooser onPick={pickDl} extra={llForm ? [{ id: 'llform', icon: 'file', title: t('ff.llform'), sub: t('ff.llformSub') }] : []} />
              </div>
            ) : (
              <div className="mt-3 grid gap-3">
                <SourceBar source={pf.form.source} onChange={pf.restart} />
                <PersonFields form={pf.form} set={pf.set} errors={errors} prefix="dl" />
              </div>
            )}
            {pf.form?.source && <>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <label htmlFor="llno" className="label mb-0">{t('pm.llNo')}</label>
                <Pill tone="brand">{t('pm.onlyNew')}</Pill>
              </div>
              <input
                id="llno"
                className="field mt-1 font-mono uppercase"
                placeholder="HR26/LL/2026/0012345"
                value={state.dl.llNo}
                onChange={(e) => update((s) => { s.dl.llNo = e.target.value.toUpperCase(); })}
                aria-describedby="llno-hint"
              />
              <p id="llno-hint" className="text-xs text-muted mt-1">{t('pm.llNoHint')}</p>
            </div>
            <div className="flex justify-between text-sm mt-3"><span>{t('pm.feeDT')} + {t('pm.feeIssue')}</span><span className="font-bold">₹{num(fees)}</span></div>
            {!canApply && d && !expired && <p className="mt-2 text-sm font-semibold text-warn">{t('pm.wait', { n: daysBetween(today, d.applyFrom) })}</p>}
            {Object.keys(errors).length > 0 && <p role="alert" className="mt-2 text-bad font-semibold">{t('sv.err.fields')}</p>}
            <button
              className="btn-primary w-full mt-2"
              disabled={!canApply || state.dl.llNo.trim().length < 5}
              onClick={confirmDl}
            >
              {t('pm.confirm', { amt: num(fees) })}
            </button>
            </>}
            {ask && <SaveSheet list={ask} onAnswer={async (yes) => { if (yes === null) return setAsk(null); if (yes) await saved.save(detailsPatch(pf.form)); submitDl(); }} />}
            {pf.lockerSheet}
          </>
        )}
      </div>
    ),

    slot: (
      <div>
        <p className="text-lg font-semibold mb-2"><Tx k="pm.book" /></p>
        {!editingSlot && state.slot.date ? (
          <div className="rounded-2xl p-4 bg-brand-soft border-2 border-brand/30">
            <p className="font-bold flex items-center gap-1.5 text-brand"><Icon name="calendar" /> {L(rtos.find((r) => r.id === state.slot.rto)?.name)}</p>
            <p className="mt-1 text-lg font-semibold">{t('pm.booked', { date: fmtDate(state.slot.date, { weekday: 'short', day: 'numeric', month: 'short' }), time: state.slot.time })}</p>
            <button className="btn-ghost mt-1 -ml-3" onClick={() => setEditingSlot(true)}>{t('pm.rebook')}</button>
          </div>
        ) : !d ? (
          <p className="text-sm text-muted">{t('pm.llDate')}</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor="rto" className="label">{t('pm.rto')}</label>
              <select id="rto" className="field" value={rto} onChange={(e) => setRto(e.target.value)}>
                <option value="">{t('c.select')}</option>
                {rtos.map((r) => <option key={r.id} value={r.id}>{L(r.name)} · {r.code}</option>)}
              </select>
            </div>
            <div>
              <p className="label" id="date-l">{t('pm.date')}</p>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1" role="radiogroup" aria-labelledby="date-l">
                {days.map((day) => (
                  <button
                    key={day}
                    role="radio"
                    aria-checked={date === day}
                    onClick={() => { setDate(day); setTime(''); }}
                    className={`shrink-0 w-[4.25rem] min-h-[4rem] rounded-2xl border-2 flex flex-col items-center justify-center ${date === day ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface'}`}
                  >
                    <span className="text-xs">{fmtDate(day, { weekday: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{parse(day).getDate()}</span>
                    <span className="text-xs">{fmtDate(day, { month: 'short' })}</span>
                  </button>
                ))}
              </div>
            </div>
            {date && (
              <div>
                <p className="label" id="time-l">{t('pm.time')}</p>
                <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-labelledby="time-l">
                  {config.slotTimes.map((tm) => {
                    const off = taken(date, tm);
                    return (
                      <button
                        key={tm}
                        role="radio"
                        aria-checked={time === tm}
                        disabled={off}
                        onClick={() => setTime(tm)}
                        className={`min-h-[3rem] rounded-xl border-2 font-semibold ${time === tm ? 'border-brand bg-brand text-on-brand' : off ? 'border-line bg-sunk text-muted line-through' : 'border-line bg-surface'}`}
                      >
                        {tm}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              className="btn-primary w-full"
              disabled={!rto || !date || !time}
              onClick={() => {
                update((s) => { s.slot = { rto, date, time, bookedAt: today }; });
                setEditingSlot(false);
              }}
            >
              {t('pm.confirmSlot')}
            </button>
          </div>
        )}
      </div>
    ),

    check: (
      <div>
        <p className="text-lg font-semibold mb-2"><Tx k="pm.checklist" /></p>
        <ul className="space-y-2">
          {['ll', 'docs', 'vehicle', ...(twoWheeler ? ['helmet'] : [])].map((k) => (
            <li key={k}>
              <label className={`card flex items-center gap-3 p-3 min-h-[3.25rem] cursor-pointer ${state.dlCheck[k] ? 'border-ok/50 bg-ok-soft' : ''}`}>
                <input type="checkbox" className="w-6 h-6 accent-[rgb(var(--ok))]" checked={!!state.dlCheck[k]} onChange={(e) => update((s) => { s.dlCheck[k] = e.target.checked; })} />
                <span className="font-medium">{t('pm.ck.' + k)}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-2"><Term id="RC">RC</Term> · <Term id="PUC">PUC</Term></p>
        {state.drivingPassed ? (
          <p className="mt-3 rounded-2xl bg-ok-soft p-3 font-semibold text-ok flex items-center gap-2" role="status"><Icon name="check" strokeWidth={3} /> {t('pm.passedDone')}</p>
        ) : (
          state.slot.date && (
            <button
              className="btn-secondary w-full mt-3"
              onClick={() => { update((s) => { s.drivingPassed = true; s.drivingPassedAt = today; }); navigate('/track?no=' + state.dl.appNo); }}
            >
              <Icon name="flag" size={18} /> {t('pm.passed')}
            </button>
          )
        )}
      </div>
    ),
  };

  const idx = SECTIONS.indexOf(sec);
  const nextSec = () => setSec(SECTIONS[Math.min(idx + 1, SECTIONS.length - 1)]);

  return (
    <Screen
      title="pm.title"
      back="/"
      footer={
        <div className="flex gap-2">
          {idx > 0 && <button className="btn-secondary" onClick={() => setSec(SECTIONS[idx - 1])}><Icon name="back" size={18} /> {t('c.back')}</button>}
          {idx < SECTIONS.length - 1 ? (
            <button className="btn-primary flex-1" onClick={nextSec} disabled={!doneFlags[sec]}>{t('c.next')} <Icon name="right" size={18} /></button>
          ) : (
            <button className="btn-primary flex-1" onClick={() => navigate('/driving-test')}>{t('pm.howTest')} <Icon name="right" size={18} /></button>
          )}
        </div>
      }
    >
      {/* Mini step bar */}
      <ol className="grid grid-cols-4 gap-1.5" aria-label={t('pm.steps')}>
        {SECTIONS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => setSec(s)}
              aria-current={sec === s ? 'step' : undefined}
              className={`w-full rounded-xl px-1.5 py-1.5 text-left border-2 min-h-[3rem] ${sec === s ? 'border-brand bg-brand-soft' : 'border-transparent bg-sunk'}`}
            >
              <span className={`flex items-center gap-1 text-xs font-bold ${doneFlags[s] ? 'text-ok' : 'text-muted'}`}>
                {doneFlags[s] ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="block text-xs leading-tight font-semibold">{t('pm.s' + (i + 1))}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-4 fade-in" key={sec}>{sectionBody[sec]}</div>
      <Stuck items={stuck.permanent} className="mt-4" />
    </Screen>
  );
}
