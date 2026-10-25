import { useEffect, useRef, useState } from 'react';
import { useStore, emptyProfile } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import Icon from './Icon.jsx';
import { PIN_LEN, phoneAvailable, waitMs } from '../vault.js';

// ---------- Open the lock screens from anywhere: await requestUnlock() / requestSetup(profile)
let host = null;
export const requestUnlock = () => new Promise((resolve) => (host ? host({ mode: 'unlock', resolve }) : resolve(false)));
export const requestSetup = (profile) => new Promise((resolve) => (host ? host({ mode: 'setup', profile, resolve }) : resolve(false)));
export const requestChangePin = () => new Promise((resolve) => (host ? host({ mode: 'change', resolve }) : resolve(false)));

// Open saved details if they exist. Returns true when they are ready to use.
export function useSavedDetails() {
  const { security, update } = useStore();
  const open = async () => {
    if (!security.on) return false;
    if (security.unlocked) return true;
    return requestUnlock();
  };
  // Save (or update) details: sets up a PIN the first time, unlocks if needed
  const save = async (patch) => {
    if (!security.on) return requestSetup({ ...emptyProfile, ...patch });
    if (!security.unlocked && !(await requestUnlock())) return false;
    update((s) => {
      const files = patch.files ? { ...(s.profile.files || {}), ...patch.files } : s.profile.files;
      Object.assign(s.profile, patch, { files, updatedAt: new Date().toISOString() });
    });
    return true;
  };
  return { open, save, on: security.on, unlocked: security.unlocked };
}

const EASY = /^(\d)\1+$|^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/;

export function LockHost() {
  const [req, setReq] = useState(null);
  useEffect(() => {
    host = (r) => setReq(r);
    return () => { host = null; };
  }, []);
  if (!req) return null;
  const done = (v) => { req.resolve(v); setReq(null); };
  if (req.mode === 'change') return <SetupSheet change onDone={done} />;
  return req.mode === 'setup' ? <SetupSheet profile={req.profile} onDone={done} /> : <UnlockSheet onDone={done} />;
}

// ---------- Big number pad, like a bank app
export function PinPad({ value, onChange, disabled, extraKey }) {
  const { t } = useI18n();
  const press = (d) => { if (!disabled && value.length < PIN_LEN) onChange(value + d); };
  const back = () => !disabled && onChange(value.slice(0, -1));
  useEffect(() => {
    const on = (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') back();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  const key = 'h-16 rounded-2xl text-2xl font-semibold bg-surface shadow-soft active:scale-95 transition-transform disabled:opacity-40 grid place-items-center';
  return (
    <div>
      <div className="flex justify-center gap-4 my-6" role="status" aria-live="polite" aria-label={t('lk.digits', { n: value.length, total: PIN_LEN })}>
        {Array.from({ length: PIN_LEN }, (_, i) => (
          <span key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${i < value.length ? 'bg-brand border-brand' : 'border-muted'}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[18rem] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className={key} onClick={() => press(d)} disabled={disabled}>{d}</button>
        ))}
        {extraKey || <span />}
        <button type="button" className={key} onClick={() => press('0')} disabled={disabled}>0</button>
        <button type="button" className={`${key} bg-transparent shadow-none`} onClick={back} disabled={disabled} aria-label={t('lk.delete')}>
          <Icon name="back" size={24} />
        </button>
      </div>
    </div>
  );
}

function Frame({ title, sub, onClose, children }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[70] bg-bg flex justify-center" role="dialog" aria-modal="true" aria-labelledby="lk-h">
      <div className="w-full max-w-app h-full flex flex-col px-5 pt-4 pb-6 overflow-y-auto">
        <div className="flex justify-end">
          <button className="w-12 h-12 rounded-full bg-surface shadow-soft grid place-items-center" onClick={onClose} aria-label={t('c.close')}>
            <Icon name="x" />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand grid place-items-center"><Icon name="lock" size={30} /></span>
          <h2 id="lk-h" className="font-display text-[2rem] leading-tight mt-3">{title}</h2>
          {sub && <p className="text-muted mt-1 leading-snug">{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- Unlock with PIN or the phone's own screen lock
function UnlockSheet({ onDone }) {
  const { t } = useI18n();
  const { security } = useStore();
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(waitMs());
  const [forgot, setForgot] = useState(false);
  const [sure, setSure] = useState(false);
  const tried = useRef(false);

  useEffect(() => {
    if (!wait) return;
    const id = setInterval(() => setWait(waitMs()), 500);
    return () => clearInterval(id);
  }, [wait]);

  const phone = async () => {
    setMsg('');
    const r = await security.unlockPhone();
    if (r.ok) onDone(true);
    else setMsg(t('lk.phoneFail'));
  };
  // Like a bank app: ask for the fingerprint / face straight away
  useEffect(() => {
    if (security.phone && !tried.current) { tried.current = true; phone(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pin.length !== PIN_LEN) return;
    (async () => {
      setBusy(true);
      const r = await security.unlockPin(pin);
      setBusy(false);
      if (r.ok) return onDone(true);
      setPin('');
      if (r.reason === 'wait' || r.wait) { setWait(r.wait || waitMs()); setMsg(''); }
      else setMsg(r.left ? t('lk.wrong', { n: r.left }) : t('lk.wrong0'));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (forgot) {
    return (
      <Frame title={t('lk.forgotT')} sub={t('lk.forgotD')} onClose={() => onDone(false)}>
        <div className="mt-6 grid gap-2">
          {!sure ? (
            <button className="btn-secondary" onClick={() => setSure(true)}>{t('lk.forget')}</button>
          ) : (
            <div className="card p-4 border-2 border-bad/40" role="alert">
              <p className="font-semibold">{t('lk.forgetSure')}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="btn-secondary min-h-[2.75rem] px-3" onClick={() => setSure(false)}>{t('c.cancel')}</button>
                <button className="btn-primary min-h-[2.75rem] px-3 bg-bad" onClick={async () => { await security.forget(); onDone(false); }}>{t('lk.forgetYes')}</button>
              </div>
            </div>
          )}
          <button className="btn-primary" onClick={() => { setForgot(false); setSure(false); }}><Icon name="back" size={18} /> {t('lk.backToPin')}</button>
        </div>
      </Frame>
    );
  }

  if (!security.pin) {
    return (
      <Frame title={t('lk.phoneT')} sub={t('lk.enterSub')} onClose={() => onDone(false)}>
        <button className="btn-primary mt-8" onClick={phone}><Icon name="finger" size={20} /> {t('lk.usePhone')}</button>
        <div className="min-h-[3rem] mt-4 text-center" aria-live="assertive">{msg && <p className="text-bad font-semibold">{msg}</p>}</div>
        <button className="mt-auto text-brand font-semibold underline min-h-[2.75rem]" onClick={() => setForgot(true)}>{t('lk.forgotPhone')}</button>
      </Frame>
    );
  }

  return (
    <Frame title={t('lk.enter')} sub={t('lk.enterSub')} onClose={() => onDone(false)}>
      <PinPad
        value={pin}
        onChange={(v) => { setMsg(''); setPin(v); }}
        disabled={busy || wait > 0}
        extraKey={security.phone ? (
          <button type="button" className="h-16 rounded-2xl grid place-items-center text-brand active:scale-95" onClick={phone} aria-label={t('lk.usePhone')}>
            <Icon name="finger" size={28} />
          </button>
        ) : null}
      />
      <div className="min-h-[3rem] mt-4 text-center" aria-live="assertive">
        {busy && <p className="text-muted">{t('lk.checking')}</p>}
        {msg && <p className="text-bad font-semibold">{msg}</p>}
        {wait > 0 && <p className="text-warn font-semibold">{t('lk.wait', { s: Math.ceil(wait / 1000) })}</p>}
      </div>
      <div className="mt-auto grid gap-2 pt-4">
        {security.phone && <button className="btn-secondary" onClick={phone}><Icon name="finger" size={18} /> {t('lk.usePhone')}</button>}
        <button className="text-brand font-semibold underline min-h-[2.75rem]" onClick={() => setForgot(true)}>{t('lk.forgot')}</button>
      </div>
    </Frame>
  );
}

// ---------- First time: choose a PIN, type it again, then offer the phone lock
function SetupSheet({ profile, onDone, change }) {
  const { t } = useI18n();
  const { security } = useStore();
  const [step, setStep] = useState(change ? 'pin' : 'check'); // check | how | pin | again | phone | backup
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [canPhone, setCanPhone] = useState(false);

  const [phoneMsg, setPhoneMsg] = useState('');
  useEffect(() => {
    phoneAvailable().then((ok) => { setCanPhone(ok); setStep((st) => (st === 'check' ? (ok ? 'how' : 'pin') : st)); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usePhone = async () => {
    setPhoneMsg('');
    setBusy(true);
    try {
      await security.setupPhone(profile);
      setBusy(false);
      setStep('backup');
    } catch {
      setBusy(false);
      setPhoneMsg(t('lk.phoneFail'));
    }
  };

  useEffect(() => {
    if (pin.length !== PIN_LEN) return;
    if (step === 'pin') {
      if (EASY.test(pin)) { setMsg(t('lk.easy')); setPin(''); return; }
      setFirst(pin); setPin(''); setMsg(''); setStep('again');
      return;
    }
    if (step === 'again') {
      if (pin !== first) { setMsg(t('lk.noMatch')); setPin(''); setFirst(''); setStep('pin'); return; }
      (async () => {
        setBusy(true);
        if (change) { await security.changePin(pin); setBusy(false); return onDone(true); }
        await security.setup(pin, profile);
        setBusy(false);
        if (canPhone) setStep('phone');
        else onDone(true);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (step === 'check') return null;

  if (step === 'how') {
    return (
      <Frame title={t('lk.setT')} sub={t('lk.howSub')} onClose={() => onDone(false)}>
        <div className="mt-6 grid gap-2">
          <button className="w-full text-left rounded-3xl p-4 bg-brand text-on-brand flex items-center gap-3 disabled:opacity-60" onClick={usePhone} disabled={busy}>
            <span className="w-11 h-11 rounded-full bg-on-brand/15 grid place-items-center shrink-0"><Icon name="finger" size={24} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-tight">{t('lk.howPhone')}</span>
              <span className="block text-sm opacity-90 leading-snug mt-0.5">{t('lk.howPhoneSub')}</span>
            </span>
          </button>
          <button className="w-full text-left rounded-3xl p-4 bg-surface shadow-soft flex items-center gap-3" onClick={() => setStep('pin')} disabled={busy}>
            <span className="w-11 h-11 rounded-full bg-brand-soft text-brand grid place-items-center shrink-0 font-bold">1234</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-tight">{t('lk.howPin')}</span>
              <span className="block text-sm text-muted leading-snug mt-0.5">{t('lk.howPinSub')}</span>
            </span>
          </button>
        </div>
        <div className="min-h-[3rem] mt-4 text-center" aria-live="assertive">
          {busy && <p className="text-muted">{t('lk.securing')}</p>}
          {phoneMsg && <p className="text-bad font-semibold">{phoneMsg}</p>}
        </div>
        <p className="mt-auto text-sm text-muted text-center flex gap-1.5 justify-center items-start pt-4">
          <Icon name="info" size={16} className="shrink-0 mt-0.5" /> {t('lk.how')}
        </p>
      </Frame>
    );
  }

  if (step === 'backup') {
    return (
      <Frame title={t('lk.backupQ')} sub={t('lk.backupSub')} onClose={() => onDone(true)}>
        <div className="mt-8 grid gap-2">
          <button className="btn-primary" onClick={() => { onDone(true); setTimeout(() => requestChangePin(), 50); }}>{t('lk.backupYes')}</button>
          <button className="btn-secondary" onClick={() => onDone(true)}>{t('lk.backupNo')}</button>
        </div>
      </Frame>
    );
  }

  if (step === 'phone') {
    return (
      <Frame title={t('lk.phoneQ')} sub={t('lk.phoneSub')} onClose={() => onDone(true)}>
        <div className="mt-8 grid gap-2">
          <button className="btn-primary" onClick={async () => { try { await security.enablePhone(); } catch { /* user cancelled */ } onDone(true); }}>
            <Icon name="finger" size={18} /> {t('lk.phoneYes')}
          </button>
          <button className="btn-secondary" onClick={() => onDone(true)}>{t('lk.phoneNo')}</button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame title={step === 'pin' ? (change ? (security.pin ? t('lk.newT') : t('lk.backupT')) : t('lk.setT')) : t('lk.againT')} sub={step === 'pin' ? (change ? t('lk.newSub') : t('lk.setSub')) : t('lk.againSub')} onClose={() => onDone(false)}>
      <PinPad value={pin} onChange={(v) => { setMsg(''); setPin(v); }} disabled={busy} />
      <div className="min-h-[3rem] mt-4 text-center" aria-live="assertive">
        {busy && <p className="text-muted">{t('lk.securing')}</p>}
        {msg && <p className="text-bad font-semibold">{msg}</p>}
      </div>
      <p className="mt-auto text-sm text-muted text-center flex gap-1.5 justify-center items-start pt-4">
        <Icon name="info" size={16} className="shrink-0 mt-0.5" /> {t('lk.how')}
      </p>
      {step === 'again' && (
        <button className="btn-secondary mt-3" onClick={() => { setStep('pin'); setFirst(''); setPin(''); }}><Icon name="back" size={18} /> {t('c.back')}</button>
      )}
      {step === 'pin' && !change && canPhone && (
        <button className="btn-secondary mt-3" onClick={() => setStep('how')}><Icon name="back" size={18} /> {t('c.back')}</button>
      )}
    </Frame>
  );
}
