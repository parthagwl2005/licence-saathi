import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Bi, Choices, ProgressBar, Stuck, Term } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { config } from '../data/config.js';
import { stuck } from '../data/content.js';
import { addYears, todayStr, minAgeFor } from '../utils.js';

export function eligibility(e) {
  const age = Number(e.age);
  if (!age || !e.vehicle) return null;
  const min = minAgeFor(e.vehicle);
  if (age >= min) {
    const parent = config.parentConsent.includes(e.vehicle) && age < 18;
    return { ok: true, parent, doctor: age >= config.doctorCertAge, min };
  }
  const from = e.dob ? addYears(e.dob, min) : addYears(todayStr(), min - age);
  return { ok: false, min, from, exact: !!e.dob };
}

export default function Eligibility() {
  const { state, update } = useStore();
  const { t, L, fmtDate, lang } = useI18n();
  const navigate = useNavigate();
  const e = state.elig;
  const [step, setStep] = useState(e.ok !== null && e.age && e.vehicle && e.state ? 3 : 0);
  const [err, setErr] = useState('');

  const set = (k, v) => update((s) => { s.elig[k] = v; s.elig.ok = null; });

  const next = () => {
    setErr('');
    if (step === 0) {
      const a = Number(e.age);
      if (!a || a < 10 || a > 100) return setErr(t('ap.err.required'));
    }
    if (step === 1 && !e.vehicle) return setErr(t('ap.err.vehicle'));
    if (step === 2) {
      if (!e.state) return setErr(t('ap.err.required'));
      const r = eligibility(e);
      update((s) => {
        s.elig.ok = r.ok;
        // Fill once: carry answers into the application form
        if (!s.app.form.state) s.app.form.state = e.state;
        if (!s.app.form.vehicles?.length) s.app.form.vehicles = [e.vehicle];
      });
    }
    setStep(step + 1);
  };

  const r = eligibility(e);

  const footer =
    step < 3 ? (
      <div className="flex gap-2">
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            <Icon name="back" size={18} /> {t('c.back')}
          </button>
        )}
        <button className="btn-primary flex-1" onClick={next}>
          {t('c.next')} <Icon name="right" size={18} />
        </button>
      </div>
    ) : r?.ok ? (
      <button className="btn-primary w-full" onClick={() => navigate('/documents')}>
        <Tx k="el.goDocs" /> <Icon name="right" size={18} />
      </button>
    ) : (
      <button className="btn-secondary w-full" onClick={() => setStep(0)}>
        {t('el.again')}
      </button>
    );

  return (
    <Screen title="el.title" back="/" footer={footer}>
      {step < 3 && <ProgressBar value={step + 1} max={3} label={t('c.step', { n: step + 1, total: 3 })} />}

      <div className="mt-4">
        {step === 0 && (
          <div>
            <label htmlFor="age" className="block text-lg font-semibold mb-2"><Tx k="el.qAge" /></label>
            <input
              id="age"
              inputMode="numeric"
              pattern="[0-9]*"
              className="field text-2xl font-bold max-w-[10rem]"
              value={e.age}
              onChange={(ev) => set('age', ev.target.value.replace(/\D/g, '').slice(0, 3))}
              aria-describedby="age-hint"
              autoFocus
            />
            <p id="age-hint" className="text-sm text-muted mt-1">{t('el.ageHint')}</p>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="text-lg font-semibold mb-2" id="veh-q"><Tx k="el.qVehicle" /></p>
            <Choices
              name={t('el.qVehicle')}
              value={e.vehicle}
              onChange={(v) => set('vehicle', v)}
              options={config.vehicles.map((v) => ({ value: v.id, label: <Bi v={v} /> }))}
            />
            <Stuck items={stuck.eligibility} className="mt-3" />
          </div>
        )}
        {step === 2 && (
          <div>
            <label htmlFor="state" className="block text-lg font-semibold mb-2"><Tx k="el.qState" /></label>
            <select id="state" className="field" value={e.state} onChange={(ev) => set('state', ev.target.value)}>
              <option value="">{t('c.select')}</option>
              {config.states.map((s) => (
                <option key={s.id} value={s.id}>{L(s)}</option>
              ))}
            </select>
          </div>
        )}
        {err && <p role="alert" className="mt-2 text-bad font-semibold flex items-center gap-1"><Icon name="alert" size={18} /> {err}</p>}

        {step === 3 && r && (
          <div className="fade-in">
            <div className={`rounded-2xl p-4 border-2 ${r.ok ? 'bg-ok-soft border-ok/40' : 'bg-warn-soft border-warn/40'}`} role="status">
              <div className="flex gap-3 items-start">
                <span className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-on-brand ${r.ok ? 'bg-ok' : 'bg-warn'}`}>
                  <Icon name={r.ok ? 'check' : 'clock'} size={20} strokeWidth={3} />
                </span>
              <p className="text-lg font-semibold leading-snug">
                {r.ok
                  ? t(r.parent ? 'el.yesParent' : 'el.yes')
                  : r.exact
                  ? t('el.no', { date: fmtDate(r.from) })
                  : t('el.noApprox', { age: r.min, date: fmtDate(r.from, { month: 'long', year: 'numeric' }) })}
              </p>
              </div>
              {r.ok && r.doctor && <p className="mt-2 text-sm">{t('el.doctor', { age: config.doctorCertAge })}</p>}
            </div>

            {!r.ok && !r.exact && (
              <div className="mt-4">
                <label htmlFor="dob" className="label">{t('el.dobAsk')}</label>
                <input id="dob" type="date" className="field" max={todayStr()} value={e.dob} onChange={(ev) => update((s) => { s.elig.dob = ev.target.value; })} lang={lang} />
              </div>
            )}

            <dl className="mt-4 card divide-y divide-line text-sm">
              {[
                ['el.qAge', e.age],
                ['el.qVehicle', L(config.vehicles.find((v) => v.id === e.vehicle))],
                ['el.qState', L(config.states.find((s) => s.id === e.state))],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 px-3 py-2">
                  <dt className="text-muted">{t(k)}</dt>
                  <dd className="font-semibold text-right">{v}</dd>
                </div>
              ))}
            </dl>
            {r.ok && (
              <p className="mt-3 text-sm text-muted">
                <Term id="LL">LL</Term> · <Term id="RTO">RTO</Term>
              </p>
            )}
          </div>
        )}
      </div>
    </Screen>
  );
}
