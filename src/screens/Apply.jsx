import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Bi, Choices, ProgressBar, Stuck, Term, Listen } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { PauseButton } from '../components/Help.jsx';
import { usePersonForm, SourceChooser, SourceBar, PersonFields, validatePerson, changedFields, SaveSheet, PERSON, detailsPatch, LockedDraft } from '../components/FillForm.jsx';
import { useSavedDetails } from '../components/Lock.jsx';
import { config } from '../data/config.js';
import { rtos } from '../data/rtos.js';
import { stuck } from '../data/content.js';
import { ageOn, todayStr, minAgeFor, newAppNo, fileToDataURL, dataUrlKB, shrinkImage, sampleImage } from '../utils.js';

const STEPS = ['source', 'state', 'vehicle', 'details', 'photo', 'fitness'];
const FIT = ['1', '2', '3', '4'];

export const llFee = (n) => config.fees.llPerClass * Math.max(1, n) + config.fees.llTest;

export default function Apply() {
  const { state, update } = useStore();
  const saved = useSavedDetails();
  const { t, L, fmtDate, num } = useI18n();
  const navigate = useNavigate();
  const app = state.app;
  const f = app.form;
  const pf = usePersonForm('ll');
  const pd = pf.form?.data || {};
  const files = pf.form?.files || {};
  const [err, setErr] = useState('');
  const [errors, setErrors] = useState({});
  const [fromReview, setFromReview] = useState(false);
  const [paying, setPaying] = useState(false);
  const [ask, setAsk] = useState(null);
  const [waitLocker, setWaitLocker] = useState(false);
  const step = Math.min(app.step || 0, STEPS.length); // STEPS.length = review

  const setF = (k, v) =>
    update((s) => {
      s.app.form[k] = v;
      if (!s.app.startedAt) s.app.startedAt = todayStr();
    });
  const goStep = (n) => {
    setErr('');
    setErrors({});
    update((s) => { s.app.step = n; });
  };

  // DigiLocker finished: move on to the next question
  useEffect(() => {
    if (waitLocker && pf.form?.source === 'digilocker') { setWaitLocker(false); goStep(1); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitLocker, pf.form?.source]);

  const pick = async (src) => {
    if (src === 'digilocker') { setWaitLocker(true); pf.choose(src); return; }
    if (await pf.choose(src)) goStep(1);
  };

  // ---------- Validation for the current step
  const validate = () => {
    const name = STEPS[step];
    if (name === 'state' && (!f.state || !f.rto)) return t('ap.err.required');
    if (name === 'vehicle' && !f.vehicles?.length) return t('ap.err.vehicle');
    if (name === 'details') {
      const e = validatePerson(pd, PERSON, t);
      if (pd.dob && !e.dob) {
        const age = ageOn(pd.dob);
        const min = Math.min(...(f.vehicles?.length ? f.vehicles : ['motorcycle']).map(minAgeFor));
        if (age < min) e.dob = t('ap.err.age', { age, min });
      }
      setErrors(e);
      if (Object.keys(e).length) return e.dob && Object.keys(e).length === 1 ? e.dob : t('sv.err.fields');
    }
    if (name === 'photo' && (!files.photo?.url || !files.signature?.url)) return t('ap.err.required');
    if (name === 'fitness' && FIT.some((k) => !f.fitness?.[k])) return t('ap.err.fit');
    return '';
  };

  const next = () => {
    const e = validate();
    if (e) return setErr(e);
    if (fromReview) {
      setFromReview(false);
      return goStep(STEPS.length);
    }
    goStep(step + 1);
  };

  const pay = () => {
    setAsk(null);
    setPaying(true);
    setTimeout(() => {
      update((s) => {
        s.app.submitted = true;
        s.app.appNo = newAppNo('LS');
        s.app.paidAt = todayStr();
        s.app.amount = llFee(s.app.form.vehicles.length);
        s.app.step = STEPS.length;
        if (s.forms.ll) s.forms.ll.submitted = true; // kept (locked) so the driving licence form can reuse it
      });
      setPaying(false);
    }, 1200);
  };
  const tryPay = () => {
    const list = pf.form?.source === 'saved' && saved.unlocked ? changedFields(pd, state.profile) : PERSON.filter((k) => pd[k]);
    if (list.length) setAsk(list);
    else pay();
  };
  const answer = async (yes) => {
    if (yes === null) return setAsk(null);
    if (yes) await saved.save(detailsPatch(pf.form));
    pay();
  };

  // ---------- Receipt
  if (app.submitted) {
    return (
      <Screen
        title="ap.title"
        back="/"
        footer={
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => navigate('/track?no=' + app.appNo)}>{t('ap.track')}</button>
            <button className="btn-primary flex-1" onClick={() => navigate('/learn')}>{t('ap.goLearn')}</button>
          </div>
        }
      >
        <div className="text-center mt-2" role="status">
          <div className="w-16 h-16 mx-auto rounded-full bg-ok text-on-brand grid place-items-center">
            <Icon name="check" size={34} strokeWidth={3} />
          </div>
          <h2 className="mt-3 text-2xl font-bold"><Tx k="ap.done" /></h2>
        </div>
        <div className="card mt-4 p-4 text-center">
          <p className="text-sm text-muted">{t('ap.appNo')}</p>
          <p className="text-2xl font-bold tracking-wider font-mono mt-1">{app.appNo}</p>
          <p className="text-sm text-muted mt-1">{t('ap.paidOn', { amt: num(app.amount), date: fmtDate(app.paidAt) })} · {t('c.sample')}</p>
        </div>
        <h3 className="mt-4 font-bold"><Tx k="ap.nextHead" inline /></h3>
        <ol className="mt-2 space-y-2">
          {['ap.next1', 'ap.next2', 'ap.next3'].map((k, i) => (
            <li key={k} className="flex gap-3 items-start">
              <span className="w-7 h-7 shrink-0 rounded-full bg-brand-soft text-brand font-bold grid place-items-center text-sm">{i + 1}</span>
              <span className="pt-0.5">{t(k)}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3"><Listen small text={[t('ap.done'), t('ap.appNo'), app.appNo.split('').join(' '), t('ap.next1'), t('ap.next2'), t('ap.next3')].join('. ')} /></div>
      </Screen>
    );
  }

  // ---------- Review
  if (step === STEPS.length) {
    const veh = (f.vehicles || []).map((v) => L(config.vehicles.find((x) => x.id === v))).join(', ');
    const rto = rtos.find((r) => r.id === f.rto);
    const stName = (id) => L(config.states.find((x) => x.id === id));
    const rows = [
      ['ap.q.state', `${stName(f.state)} · ${rto ? L(rto.name) : ''}`, 1],
      ['ap.q.vehicle', veh, 2],
      ['pf.name', pd.name, 3],
      ['pf.relation', pd.relation, 3],
      ['pf.dob', fmtDate(pd.dob), 3],
      ['pf.gender', pd.gender ? t('pf.g.' + pd.gender) : '', 3],
      ['pf.mobile', pd.mobile, 3],
      ['pf.address', [pd.address, pd.pincode, stName(pd.state)].filter(Boolean).join(', '), 3],
      ['ap.q.photo', files.photo && files.signature ? t('ap.uploaded') : t('ap.notUploaded'), 4],
      ['ap.q.fitness', t('ap.fitAll'), 5],
    ];
    const n = f.vehicles?.length || 1;
    const total = llFee(n);
    return (
      <Screen
        title="ap.review"
        sub={t('ap.reviewSub')}
        back={() => goStep(STEPS.length - 1)}
        footer={
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button className="btn-secondary px-4" onClick={() => goStep(STEPS.length - 1)}><Icon name="back" size={18} /> {t('c.back')}</button>
            <button className="btn-primary" onClick={tryPay} disabled={paying} aria-busy={paying}>
              {paying ? t('ap.paying') : t('ap.pay', { amt: num(total) })}
            </button>
          </div>
        }
      >
        <div className="card divide-y divide-line">
          {rows.map(([k, v, i]) => (
            <div key={k} className="flex items-center gap-2 pl-3 pr-1 py-1.5">
              <dl className="min-w-0 flex-1">
                <dt className="text-xs text-muted">{t(k)}</dt>
                <dd className="font-semibold break-words">{v || <span className="text-bad">{t('sv.missingValue')}</span>}</dd>
              </dl>
              {i === 4 && files.photo?.url && <img src={files.photo.url} alt="" className="w-8 h-10 object-cover rounded" />}
              <button
                className="btn-ghost min-h-[2.75rem] px-3 text-sm"
                onClick={() => { setFromReview(true); goStep(i); }}
                aria-label={`${t('c.change')}: ${t(k)}`}
              >
                {t('c.change')}
              </button>
            </div>
          ))}
        </div>
        <div className="card mt-3 p-3">
          <h3 className="font-bold mb-1">{t('ap.fees')}</h3>
          <div className="flex justify-between text-sm"><span>{t('ap.feeLL', { n })}</span><span>₹{num(config.fees.llPerClass * n)}</span></div>
          <div className="flex justify-between text-sm"><span>{t('ap.feeTest')}</span><span>₹{num(config.fees.llTest)}</span></div>
          <div className="flex justify-between font-bold mt-1 pt-1 border-t border-line"><span>{t('ap.total')}</span><span>₹{num(total)}</span></div>
        </div>
        {ask && <SaveSheet list={ask} onAnswer={answer} />}
      </Screen>
    );
  }

  // Reopened while locked: the half-filled form stays hidden until the phone lock / PIN
  if (pf.lockedDraft) {
    return (
      <Screen title="ap.title" back="/service/ll">
        <LockedDraft onStartAgain={() => { pf.startAgain(); goStep(0); }} />
      </Screen>
    );
  }

  // ---------- One step per screen
  const name = STEPS[step];
  const stateRtos = rtos.filter((r) => r.state === f.state);
  const rtoList = stateRtos.length ? stateRtos : rtos;
  const chosen = !!pf.form?.source;

  return (
    <Screen
      title="ap.title"
      back={step === 0 ? '/service/ll' : () => goStep(step - 1)}
      action={<PauseButton />}
      footer={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => (step === 0 ? navigate('/service/ll') : goStep(step - 1))}>
            <Icon name="back" size={18} /> {t('c.back')}
          </button>
          {(step > 0 || chosen) && (
            <button className="btn-primary flex-1" onClick={step === 0 ? () => goStep(1) : next}>
              {fromReview ? t('c.done') : step === 0 ? t('ff.continue') : t('c.next')} <Icon name="right" size={18} />
            </button>
          )}
        </div>
      }
    >
      <ProgressBar value={step + 1} max={STEPS.length} label={`${t('c.step', { n: step + 1, total: STEPS.length })} · ${t('c.minLeft', { n: Math.max(1, STEPS.length - step) })}`} />
      <p className="mt-1 text-xs text-muted flex items-center gap-1"><Icon name="check" size={12} /> {t('c.saved')} · {t('ap.sim')}</p>

      <div className="mt-4" key={name}>
        {name === 'source' && (chosen ? (
          <div className="grid gap-3">
            <SourceBar source={pf.form.source} onChange={pf.restart} />
            <p className="text-muted">{t('ff.chosen')}</p>
          </div>
        ) : (
          <SourceChooser onPick={pick} />
        ))}

        {name === 'state' && (
          <div className="space-y-3">
            <p className="text-lg font-semibold"><Tx k="ap.q.state" /></p>
            <select aria-label={t('el.qState')} className="field" value={f.state || ''} onChange={(e) => update((s) => { s.app.form.state = e.target.value; s.app.form.rto = ''; })}>
              <option value="">{t('c.select')}</option>
              {config.states.map((s) => <option key={s.id} value={s.id}>{L(s)}</option>)}
            </select>
            {f.state && (
              <div>
                <p className="label"><Tx k="ap.q.rto" inline /> (<Term id="RTO">RTO</Term>)</p>
                <Choices
                  name={t('ap.q.rto')}
                  value={f.rto}
                  onChange={(v) => setF('rto', v)}
                  options={rtoList.slice(0, 4).map((r) => ({ value: r.id, label: <span><span className="block">{L(r.name)}</span><span className="block text-sm text-muted">{L(r.area)}</span></span> }))}
                />
              </div>
            )}
          </div>
        )}

        {name === 'vehicle' && (
          <div>
            <p className="text-lg font-semibold mb-2"><Tx k="ap.q.vehicle" /></p>
            <Choices
              multi
              name={t('ap.q.vehicle')}
              value={f.vehicles}
              onChange={(v) => setF('vehicles', v)}
              options={config.vehicles.map((v) => ({ value: v.id, label: <span><Bi v={v} /><span className="block text-xs text-muted mt-0.5">{v.cls} · ₹{config.fees.llPerClass}</span></span> }))}
            />
            <Stuck items={stuck.vehicle} className="mt-3" />
          </div>
        )}

        {name === 'details' && (
          <div className="grid gap-3">
            {chosen && <SourceBar source={pf.form.source} onChange={() => { pf.restart(); goStep(0); }} />}
            <p className="text-lg font-semibold"><Tx k="ff.detailsQ" /></p>
            <PersonFields form={pf.form} set={pf.set} errors={errors} prefix="ll" />
            <Stuck items={stuck.name} className="mt-1" />
          </div>
        )}

        {name === 'photo' && (
          <div>
            <p className="text-lg font-semibold mb-2"><Tx k="ap.q.photo" /></p>
            <div className="grid grid-cols-2 gap-2">
              <Upload kind="photo" value={files.photo?.url} onDone={(v) => pf.setFile('photo', { name: 'photo', kb: 0, url: v, via: 'upload' })} max={config.upload.photoMaxKB} />
              <Upload kind="sign" value={files.signature?.url} onDone={(v) => pf.setFile('signature', { name: 'signature', kb: 0, url: v, via: 'upload' })} max={config.upload.signMaxKB} />
            </div>
            <Stuck items={stuck.photo} className="mt-3" />
          </div>
        )}

        {name === 'fitness' && (
          <div>
            <p className="text-lg font-semibold"><Tx k="ap.q.fitness" /></p>
            <p className="text-sm text-muted mb-2"><Term id="Form 1">Form 1</Term></p>
            <div className="space-y-2.5">
              {FIT.map((k) => (
                <fieldset key={k} className="card p-2.5">
                  <legend className="sr-only">{t('ap.fit.' + k)}</legend>
                  <p className="font-medium mb-1.5" aria-hidden="true">{t('ap.fit.' + k)}</p>
                  <Choices
                    cols={2}
                    name={t('ap.fit.' + k)}
                    value={f.fitness?.[k]}
                    onChange={(v) => update((s) => { s.app.form.fitness = { ...(s.app.form.fitness || {}), [k]: v }; })}
                    options={[{ value: 'yes', label: t('c.yes') }, { value: 'no', label: t('c.no') }]}
                  />
                </fieldset>
              ))}
            </div>
            {FIT.some((k) => f.fitness?.[k] === 'no') && <p className="mt-2 text-sm text-warn font-semibold">{t('ap.fitNote')}</p>}
          </div>
        )}

        {err && (
          <p role="alert" className="mt-3 text-bad font-semibold flex items-start gap-1">
            <Icon name="alert" size={18} className="shrink-0 mt-0.5" /> {err}
          </p>
        )}
      </div>
      {pf.lockerSheet}
    </Screen>
  );
}

// Photo / signature upload with a size check and one-tap "Make it fit"
export function Upload({ kind, value, onDone, max }) {
  const { t } = useI18n();
  const input = useRef(null);
  const [pending, setPending] = useState(null); // { url, kb } when too big
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const label = t(kind === 'photo' ? 'ap.ph.photo' : 'ap.ph.sign');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|jpg|webp)$/.test(file.type)) return setMsg(t('ap.ph.notImage'));
    setMsg('');
    const url = await fileToDataURL(file);
    const kb = Math.round(file.size / 1024);
    if (kb <= max) {
      setPending(null);
      onDone(url);
    } else {
      setPending({ url, kb });
    }
  };

  const fix = async () => {
    setBusy(true);
    const out = await shrinkImage(pending.url, max, kind === 'photo' ? 360 : 400);
    setPending(null);
    setBusy(false);
    onDone(out);
  };

  const shown = pending?.url || value;
  const kb = pending ? pending.kb : value ? dataUrlKB(value) : null;

  return (
    <div className="card p-2.5 flex flex-col gap-2">
      <p className="font-semibold text-sm">{label}</p>
      <div className={`h-24 rounded-xl bg-sunk grid place-items-center overflow-hidden border ${pending ? 'border-bad' : value ? 'border-ok' : 'border-line'}`}>
        {shown ? <img src={shown} alt={label} className="max-h-full max-w-full object-contain" /> : <Icon name={kind === 'photo' ? 'camera' : 'file'} size={28} className="text-muted" />}
      </div>
      {kb !== null && (
        <p className={`text-xs font-semibold flex items-center gap-1 ${pending ? 'text-bad' : 'text-ok'}`}>
          <Icon name={pending ? 'x' : 'check'} size={14} strokeWidth={3} />
          {pending ? t('ap.ph.big', { kb, max }) : t('ap.ph.ok', { kb })}
        </p>
      )}
      {msg && <p className="text-xs text-bad font-semibold" role="alert">{msg}</p>}
      <input ref={input} type="file" accept="image/jpeg,image/png" className="sr-only" onChange={pick} aria-label={`${label}: ${t('ap.ph.choose')}`} tabIndex={-1} />
      {pending ? (
        <button className="btn-primary min-h-[2.75rem] px-3 text-sm" onClick={fix} disabled={busy}>
          {busy ? t('ap.ph.checking') : t('ap.ph.fix')}
        </button>
      ) : (
        <button className="btn-secondary min-h-[2.75rem] px-3 text-sm" onClick={() => input.current?.click()}>
          {t('ap.ph.choose')}
        </button>
      )}
      {!value && !pending && (
        <button className="text-sm text-brand font-semibold underline min-h-[2.25rem]" onClick={() => onDone(sampleImage(kind))}>
          {t('ap.ph.sample')}
        </button>
      )}
    </div>
  );
}
