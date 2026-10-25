import { useState } from 'react';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import Icon from './Icon.jsx';
import { Choices } from './ui.jsx';
import DigiLocker from './DigiLocker.jsx';
import { useSavedDetails, requestUnlock, requestSetup } from './Lock.jsx';
import { config } from '../data/config.js';
import { todayStr, ageOn } from '../utils.js';
import { validMobile, validPin } from '../profile.js';
import { validDl } from './NumberInput.jsx';

// The details almost every licence form asks for (Sarathi forms 2, 4, 9 and others)
export const PERSON = ['name', 'relation', 'dob', 'gender', 'mobile', 'email', 'address', 'pincode', 'state'];
export const OPTIONAL = ['email'];
const blank = () => ({ source: '', data: {}, from: {}, files: {}, extra: '', idName: '', licenceNo: '' });

// One form in progress, kept per service in state.forms[id] (encrypted once a PIN is set)
export function usePersonForm(id, fields = PERSON) {
  const { state, update, security } = useStore();
  const saved = useSavedDetails();
  const [locker, setLocker] = useState(false);
  const form = state.forms?.[id] || null;
  // A half-filled form is waiting inside the locked vault: show it only after the phone lock / PIN
  const lockedDraft = !form && security.on && !security.unlocked && (state.lockedForms || []).includes(id);

  const fromProfile = (p) => {
    const data = {};
    const from = {};
    fields.forEach((k) => { if (p[k]) { data[k] = p[k]; from[k] = 'saved'; } });
    const files = { ...(p.files || {}) };
    if (p.photo) files.photo = { name: 'photo', kb: 0, url: p.photo, via: 'saved' };
    if (p.sign) files.signature = { name: 'signature', kb: 0, url: p.sign, via: 'saved' };
    return { data, from, files, idName: p.idName || '', licenceNo: p.licenceNo || '' };
  };

  const choose = async (src, custom) => {
    if (src === 'saved') {
      if (!(await saved.open())) return false;
      update((s) => { s.forms[id] = { ...blank(), extra: s.forms[id]?.extra || '', source: 'saved', ...fromProfile(s.profile) }; });
      return true;
    }
    if (src === 'digilocker') { setLocker(true); return true; }
    if (src === 'manual') { update((s) => { s.forms[id] = { ...blank(), extra: s.forms[id]?.extra || '', source: 'manual' }; }); return true; }
    if (custom) { update((s) => { s.forms[id] = { ...blank(), source: src, ...custom }; }); return true; }
    return false;
  };

  const fromLocker = (res) => {
    update((s) => {
      const data = {};
      const from = {};
      fields.forEach((k) => { if (res.fields[k]) { data[k] = res.fields[k]; from[k] = 'digilocker'; } });
      s.forms[id] = { ...blank(), source: 'digilocker', data, from, files: res.files, idName: res.idName, licenceNo: res.fields.licenceNo || '', extra: s.forms[id]?.extra || '' };
    });
    setLocker(false);
  };

  const set = (k, v) => update((s) => {
    const f = s.forms[id] || (s.forms[id] = { ...blank(), source: 'manual' });
    f.data[k] = v;
    f.from[k] = 'you';
  });
  const setExtra = (v) => update((s) => { (s.forms[id] || (s.forms[id] = { ...blank(), source: 'manual' })).extra = v; });
  const setFile = (k, file) => update((s) => { const f = s.forms[id] || (s.forms[id] = { ...blank(), source: 'manual' }); f.files = { ...(f.files || {}), [k]: file }; });
  const restart = () => update((s) => { delete s.forms[id]; });

  const lockerSheet = locker ? <DigiLocker onClose={() => setLocker(false)} onUse={fromLocker} /> : null;
  const startAgain = () => update((s) => { s.lockedForms = (s.lockedForms || []).filter((x) => x !== id); });
  return { form, choose, set, setExtra, setFile, restart, lockerSheet, lockedDraft, startAgain };
}

// ---------- Reopened a half-filled form while locked: nothing is shown until the owner unlocks
export function LockedDraft({ onStartAgain }) {
  const { t } = useI18n();
  const { security } = useStore();
  return (
    <section className="card p-6 text-center rise" aria-labelledby="ld-h" role="status">
      <span className="w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand grid place-items-center"><Icon name="lock" size={30} /></span>
      <h2 id="ld-h" className="font-display text-[1.8rem] leading-tight mt-3">{t('ff.lockedT')}</h2>
      <p className="text-muted mt-1">{t('ff.lockedSub')}</p>
      <button className="btn-primary w-full mt-5" onClick={() => requestUnlock()}>
        <Icon name={security.phone ? 'finger' : 'unlock'} size={18} /> {t('ff.lockedBtn')}
      </button>
      <button className="btn-ghost w-full mt-2" onClick={onStartAgain}>{t('ff.lockedNew')}</button>
      <p className="text-xs text-muted mt-4 flex gap-1.5 items-start text-left"><Icon name="shield" size={14} className="shrink-0 mt-0.5" /> {t('ff.lockedNote')}</p>
    </section>
  );
}

// ---------- Step 1 of every form: how do you want to fill it?
export function SourceChooser({ onPick, extra = [] }) {
  const { t } = useI18n();
  const { security } = useStore();
  const opts = [
    security.on
      ? { id: 'saved', icon: security.unlocked ? 'user' : 'lock', title: t('ff.saved'), sub: security.unlocked ? t('ff.savedReady') : t('ff.savedLocked') }
      : { id: 'saved', icon: 'user', title: t('ff.saved'), sub: t('ff.savedNone'), off: true },
    { id: 'digilocker', icon: 'cloud', title: t('ff.locker'), sub: t('ff.lockerSub') },
    ...extra,
    { id: 'manual', icon: 'pen', title: t('ff.manual'), sub: t('ff.manualSub') },
  ];
  return (
    <section aria-labelledby="ff-h">
      <h2 id="ff-h" className="font-display text-[1.8rem] leading-tight">{t('ff.how')}</h2>
      <p className="text-muted mt-1">{t('ff.howSub')}</p>
      <ul className="mt-4 grid gap-2">
        {opts.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              disabled={o.off}
              onClick={() => onPick(o.id)}
              className={`w-full text-left rounded-3xl p-4 flex items-center gap-3 border-2 border-transparent transition-transform active:scale-[0.99] ${o.off ? 'bg-sunk text-muted' : 'bg-surface shadow-soft hover:border-brand/40'}`}
            >
              <span className={`w-11 h-11 shrink-0 rounded-full grid place-items-center ${o.off ? 'bg-bg' : 'bg-brand-soft text-brand'}`}><Icon name={o.icon} size={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-tight">{o.title}</span>
                <span className="block text-sm text-muted leading-snug mt-0.5">{o.sub}</span>
              </span>
              {!o.off && <Icon name="right" size={18} className="text-muted shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted flex gap-1.5 items-start"><Icon name="shield" size={16} className="shrink-0 mt-0.5" /> {t('ff.safe')}</p>
    </section>
  );
}

// "Filled from DigiLocker · Choose another way"
export function SourceBar({ source, onChange }) {
  const { t } = useI18n();
  const { security } = useStore();
  return (
    <div>
      <div className="rounded-2xl bg-brand-soft text-brand px-4 py-2.5 flex items-center gap-2">
        <Icon name={source === 'digilocker' ? 'cloud' : source === 'manual' ? 'pen' : 'user'} size={18} className="shrink-0" />
        <span className="flex-1 min-w-0 text-sm font-semibold leading-snug">{t('ff.using.' + (['saved', 'digilocker', 'manual'].includes(source) ? source : 'other'))}</span>
        <button type="button" className="text-sm font-semibold underline min-h-[2.5rem] px-1 shrink-0" onClick={onChange}>{t('ff.change')}</button>
      </div>
      {security.on ? (
        <p className="text-xs text-ok font-semibold mt-1.5 flex items-center gap-1"><Icon name="lock" size={12} /> {t('ff.isLocked')}</p>
      ) : (
        <button type="button" className="text-sm text-brand font-semibold mt-1.5 flex items-center gap-1.5 min-h-[2.5rem]" onClick={() => requestSetup()}>
          <Icon name="finger" size={16} /> {t('ff.lockThis')}
        </button>
      )}
    </div>
  );
}

const TAG = { saved: 'ff.tag.saved', digilocker: 'ff.tag.locker', llform: 'ff.tag.llform' };

// ---------- The standard fields, all on one screen, every one editable
export function PersonFields({ form, set, errors = {}, fields = PERSON, prefix = 'pf' }) {
  const { t, L } = useI18n();
  const d = form?.data || {};
  const from = form?.from || {};
  const Label = ({ k, htmlFor }) => (
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <label htmlFor={htmlFor} className="font-semibold text-sm">
        {t('pf.' + k)}{OPTIONAL.includes(k) && <span className="text-muted font-normal"> · {t('pf.optional')}</span>}
      </label>
      {TAG[from[k]] && <span className="text-[0.7rem] font-bold rounded-full bg-ok-soft text-ok px-2 py-0.5 shrink-0 flex items-center gap-1"><Icon name="check" size={11} strokeWidth={3} />{t(TAG[from[k]])}</span>}
    </div>
  );
  const Err = ({ k }) => (errors[k] ? <p id={`${prefix}-${k}-err`} role="alert" className="text-sm text-bad font-semibold mt-1">{errors[k]}</p> : null);
  const aria = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${prefix}-${k}-err` } : {});

  return (
    <div className="grid gap-4">
      {fields.map((k) => {
        const id = `${prefix}-${k}`;
        if (k === 'gender') {
          return (
            <div key={k}>
              <Label k={k} />
              <Choices cols={3} name={t('pf.gender')} value={d.gender} onChange={(v) => set('gender', v)} options={['male', 'female', 'other'].map((g) => ({ value: g, label: t('pf.g.' + g) }))} />
              <Err k={k} />
            </div>
          );
        }
        if (k === 'state') {
          return (
            <div key={k}>
              <Label k={k} htmlFor={id} />
              <select id={id} className="field" value={d.state || ''} onChange={(e) => set('state', e.target.value)} {...aria(k)}>
                <option value="">{t('c.select')}</option>
                {config.states.map((s) => <option key={s.id} value={s.id}>{L(s)}</option>)}
              </select>
              <Err k={k} />
            </div>
          );
        }
        if (k === 'address') {
          return (
            <div key={k}>
              <Label k={k} htmlFor={id} />
              <textarea id={id} rows={2} autoComplete="street-address" className="field py-3" value={d.address || ''} onChange={(e) => set('address', e.target.value)} {...aria(k)} />
              <Err k={k} />
            </div>
          );
        }
        if (k === 'mobile') {
          return (
            <div key={k}>
              <Label k={k} htmlFor={id} />
              <div className="flex items-center gap-2">
                <span className="field w-auto grid place-items-center bg-sunk font-semibold" aria-hidden="true">+91</span>
                <input id={id} inputMode="numeric" autoComplete="tel-national" className="field tracking-wider" value={d.mobile || ''} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} {...aria(k)} />
              </div>
              <Err k={k} />
            </div>
          );
        }
        const type = k === 'dob' ? 'date' : k === 'email' ? 'email' : 'text';
        return (
          <div key={k}>
            <Label k={k} htmlFor={id} />
            <input
              id={id}
              type={type}
              className="field"
              max={k === 'dob' ? todayStr() : undefined}
              inputMode={k === 'pincode' ? 'numeric' : undefined}
              autoComplete={{ name: 'name', email: 'email', pincode: 'postal-code' }[k] || 'off'}
              value={d[k] || ''}
              onChange={(e) => set(k, k === 'pincode' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value)}
              {...aria(k)}
            />
            {k === 'name' && <p className="text-xs text-muted mt-1">{t('ff.nameHint')}</p>}
            {k === 'dob' && d.dob && <p className="text-xs text-muted mt-1">{t('ff.age', { n: ageOn(d.dob) })}</p>}
            <Err k={k} />
          </div>
        );
      })}
    </div>
  );
}

export function validatePerson(d = {}, fields = PERSON, t) {
  const e = {};
  fields.forEach((k) => { if (!OPTIONAL.includes(k) && !String(d[k] || '').trim()) e[k] = t('ff.req'); });
  if (d.name && d.name.trim().length < 3) e.name = t('ff.req');
  if (d.mobile && !validMobile(d.mobile)) e.mobile = t('ap.err.mobile');
  if (d.pincode && !validPin(d.pincode)) e.pincode = t('pf.err.pin');
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = t('ff.email');
  return e;
}

// Which details differ from what is saved (or everything, when nothing is saved / it is locked)
export function changedFields(d = {}, profile = {}, fields = PERSON) {
  return fields.filter((k) => d[k] && String(d[k]) !== String(profile[k] || ''));
}

// ---------- "Save these details for next time?" (locked with your PIN)
export function SaveSheet({ list, onAnswer }) {
  const { t } = useI18n();
  const { security } = useStore();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="sv-h">
      <button className="absolute inset-0 bg-ink/35 scrim-in" onClick={() => onAnswer(null)} aria-label={t('c.close')} tabIndex={-1} />
      <div className="relative w-full max-w-app bg-bg rounded-t-4xl p-5 pb-6 sheet-in shadow-lift">
        <div className="w-10 h-1.5 rounded-full bg-line mx-auto mb-4" aria-hidden="true" />
        <h2 id="sv-h" className="font-display text-[1.7rem] leading-tight">{t('sv.saveQ')}</h2>
        <p className="text-muted mt-1">{security.on ? t('ff.saveSubOn') : t('ff.saveSubNew')}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {list.map((f) => <li key={f} className="chip">{t('pf.' + f)}</li>)}
        </ul>
        <div className="mt-5 grid gap-2">
          <button className="btn-primary" onClick={() => onAnswer(true)} autoFocus><Icon name="lock" size={18} /> {t('sv.saveYes')}</button>
          <button className="btn-secondary" onClick={() => onAnswer(false)}>{t('sv.saveNo')}</button>
        </div>
      </div>
    </div>
  );
}

// What a finished form adds to "Your details" when the person says "Save"
export function detailsPatch(form) {
  const d = form?.data || {};
  const f = form?.files || {};
  const patch = {};
  PERSON.forEach((k) => { if (d[k]) patch[k] = d[k]; });
  if (form?.idName) patch.idName = form.idName;
  const lic = validDl(form?.extra || '') ? form.extra : form?.licenceNo;
  if (lic) patch.licenceNo = lic;
  if (f.photo?.url) patch.photo = f.photo.url;
  if (f.signature?.url) patch.sign = f.signature.url;
  const files = {};
  ['age', 'address', 'licence'].forEach((k) => { if (f[k]) files[k] = f[k]; });
  if (Object.keys(files).length) patch.files = files;
  return patch;
}
