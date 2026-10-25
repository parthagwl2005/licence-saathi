import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.js';
import Icon from './Icon.jsx';
import { accounts, docTypes, docsOf, readLocker, drawDoc } from '../data/digilocker.js';
import { downloadBlob } from '../summary.js';
import { maskMobile } from '../profile.js';
import { formatDl } from './NumberInput.jsx';

const DEMO_OTP = '123456';

// Full-screen DigiLocker flow (demo): account → OTP → consent → fetch → what we got → use it
export default function DigiLocker({ onClose, onUse, useLabel }) {
  const { t, L, fmtDate } = useI18n();
  const [step, setStep] = useState('account');
  const [acct, setAcct] = useState(accounts[0]);
  const [otp, setOtp] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [picked, setPicked] = useState([]);
  const [got, setGot] = useState(0);
  const [res, setRes] = useState(null);
  const [view, setView] = useState(null); // { kind, url }

  useEffect(() => { setPicked(docsOf(acct)); }, [acct]);

  // Fetch the documents one by one, then read them
  useEffect(() => {
    if (step !== 'fetch') return;
    if (got < picked.length) {
      const id = setTimeout(() => setGot((g) => g + 1), 650);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => { setRes(readLocker(acct, picked)); setStep('result'); }, 500);
    return () => clearTimeout(id);
  }, [step, got, picked, acct]);

  const back = () => {
    if (step === 'otp') setStep('account');
    else if (step === 'consent') setStep('otp');
    else if (step === 'result') { setStep('consent'); setGot(0); }
    else onClose();
  };

  const fieldLabel = (k) => (k === 'licenceNo' ? t('sv.extra.licenceNo') : t('pf.' + k));
  const fieldValue = (k, v) => (k === 'licenceNo' ? formatDl(v) : k === 'dob' ? fmtDate(v) : k === 'gender' ? t('pf.g.' + v) : k === 'mobile' ? maskMobile(v) : k === 'state' ? (v === 'HR' ? L({ en: 'Haryana', hi: 'हरियाणा' }) : v) : v);
  const stepNo = { account: 1, otp: 2, consent: 3, fetch: 4, result: 4 }[step];

  return (
    <div className="fixed inset-0 z-[65] bg-bg flex justify-center" role="dialog" aria-modal="true" aria-labelledby="dg-h">
      <div className="w-full max-w-app h-full flex flex-col">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-line/70">
          <button className="w-12 h-12 shrink-0 rounded-full bg-surface shadow-soft grid place-items-center" onClick={back} aria-label={t('c.back')}>
            <Icon name="back" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 id="dg-h" className="font-semibold leading-tight flex items-center gap-1.5"><Icon name="cloud" size={20} className="text-brand shrink-0" /> {t('lkr.title')}</h1>
            <p className="text-xs text-muted">{t('lkr.step', { n: stepNo, total: 4 })} · {t('lkr.demo')}</p>
          </div>
          <button className="w-12 h-12 shrink-0 rounded-full grid place-items-center" onClick={onClose} aria-label={t('c.close')}><Icon name="x" /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4" tabIndex={0}>
          {step === 'account' && (
            <>
              <h2 className="font-display text-[1.9rem] leading-tight">{t('lkr.accT')}</h2>
              <p className="text-muted mt-1">{t('lkr.accSub')}</p>
              <div className="mt-4 grid gap-2" role="radiogroup" aria-label={t('lkr.accT')}>
                {accounts.map((a) => (
                  <button key={a.id} role="radio" aria-checked={acct.id === a.id} onClick={() => setAcct(a)}
                    className={`text-left rounded-3xl p-4 border-2 flex items-center gap-3 ${acct.id === a.id ? 'border-brand bg-brand-soft' : 'border-transparent bg-surface shadow-soft'}`}>
                    <span className={`w-6 h-6 shrink-0 rounded-full border-2 grid place-items-center ${acct.id === a.id ? 'border-brand bg-brand text-on-brand' : 'border-muted'}`}>{acct.id === a.id && <Icon name="check" size={14} strokeWidth={3} />}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{L(a.who)}</span>
                      <span className="block text-sm text-muted">{L(a.note)}</span>
                      <span className="block text-sm text-muted">{t('lkr.mobile')}: {maskMobile(a.mobile)}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted flex gap-1.5 items-start"><Icon name="info" size={16} className="shrink-0 mt-0.5" /> {t('lkr.demoNote')}</p>
            </>
          )}

          {step === 'otp' && (
            <>
              <h2 className="font-display text-[1.9rem] leading-tight">{t('lkr.otpT')}</h2>
              <p className="text-muted mt-1">{t('lkr.otpSub', { m: maskMobile(acct.mobile) })}</p>
              <label htmlFor="dg-otp" className="label mt-5">{t('lkr.otpLabel')}</label>
              <input id="dg-otp" inputMode="numeric" autoComplete="one-time-code" className="field text-2xl tracking-[0.5em] font-mono text-center" value={otp}
                onChange={(e) => { setOtpErr(''); setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); }} />
              {otpErr && <p role="alert" className="mt-2 text-bad font-semibold">{otpErr}</p>}
              <div className="mt-4 rounded-2xl bg-butter px-4 py-3 flex items-center gap-3">
                <span className="flex-1 text-sm"><b>{t('lkr.demoCode')}</b> {DEMO_OTP}</span>
                <button className="chip shrink-0" onClick={() => setOtp(DEMO_OTP)}>{t('lkr.fillCode')}</button>
              </div>
            </>
          )}

          {step === 'consent' && (
            <>
              <h2 className="font-display text-[1.9rem] leading-tight">{t('lkr.consentT')}</h2>
              <p className="text-muted mt-1">{t('lkr.consentSub')}</p>
              <ul className="mt-4 grid gap-2">
                {docsOf(acct).map((d) => {
                  const on = picked.includes(d);
                  return (
                    <li key={d}>
                      <button role="checkbox" aria-checked={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d) : [...p, d]))}
                        className={`w-full text-left rounded-3xl p-4 border-2 flex items-center gap-3 ${on ? 'border-brand bg-brand-soft' : 'border-transparent bg-surface shadow-soft'}`}>
                        <span className={`w-6 h-6 shrink-0 rounded-md border-2 grid place-items-center ${on ? 'border-brand bg-brand text-on-brand' : 'border-muted'}`}>{on && <Icon name="check" size={14} strokeWidth={3} />}</span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{L(docTypes[d].name)}</span>
                          <span className="block text-sm text-muted">{L(docTypes[d].use)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm text-muted flex gap-1.5 items-start"><Icon name="shield" size={16} className="shrink-0 mt-0.5" /> {t('lkr.consentNote')}</p>
            </>
          )}

          {step === 'fetch' && (
            <>
              <h2 className="font-display text-[1.9rem] leading-tight">{t('lkr.fetchT')}</h2>
              <ul className="mt-4 grid gap-2" aria-live="polite">
                {picked.map((d, i) => (
                  <li key={d} className="card px-4 py-3 flex items-center gap-3">
                    <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center ${i < got ? 'bg-ok text-on-brand' : 'bg-sunk'}`}>
                      {i < got ? <Icon name="check" size={16} strokeWidth={3} /> : <span className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />}
                    </span>
                    <span className="font-medium flex-1">{L(docTypes[d].name)}</span>
                    <span className="text-sm text-muted">{i < got ? t('lkr.got') : t('lkr.getting')}</span>
                  </li>
                ))}
              </ul>
              {got >= picked.length && <p className="mt-4 text-muted flex items-center gap-2"><Icon name="sparkle" size={18} className="text-brand" /> {t('lkr.reading')}</p>}
            </>
          )}

          {step === 'result' && res && (
            <>
              <h2 className="font-display text-[1.9rem] leading-tight">{t('lkr.resT')}</h2>
              <p className="text-muted mt-1">{t('lkr.resSub')}</p>

              <h3 className="eyebrow mt-5">{t('lkr.copies')}</h3>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {picked.map((d) => (
                  <li key={d}>
                    <button className="w-full card p-2 text-left" onClick={() => setView({ kind: d, url: drawDoc(d, acct) })} aria-label={`${t('lkr.view')}: ${L(docTypes[d].name)}`}>
                      <img src={drawDoc(d, acct)} alt="" className="w-full rounded-lg border border-line" />
                      <span className="block text-sm font-semibold mt-1.5 leading-tight">{L(docTypes[d].name)}</span>
                      <span className="text-xs text-brand font-semibold flex items-center gap-1"><Icon name="eye" size={13} /> {t('lkr.view')}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="eyebrow mt-5 flex items-center gap-1.5"><Icon name="sparkle" size={14} /> {t('lkr.read')}</h3>
              <div className="mt-2 card divide-y divide-line/70">
                {Object.entries(res.fields).map(([k, v]) => (
                  <div key={k} className="px-4 py-2.5 flex items-start gap-3">
                    <Icon name="check" size={16} strokeWidth={3} className="text-ok shrink-0 mt-1" />
                    <dl className="min-w-0 flex-1">
                      <dt className="text-xs text-muted">{fieldLabel(k)} · {t('lkr.fromDoc', { doc: res.from[k] === 'locker' ? t('lkr.title') : L(docTypes[res.from[k]].name) })}</dt>
                      <dd className="font-semibold break-words">{fieldValue(k, v)}</dd>
                    </dl>
                  </div>
                ))}
              </div>

              <h3 className="eyebrow mt-5">{t('lkr.numbers')}</h3>
              <ul className="mt-2 grid gap-2">
                {res.numbers.map((n) => (
                  <li key={n.id} className={`rounded-2xl px-4 py-3 ${n.ok ? 'bg-ok-soft' : 'bg-warn-soft'}`}>
                    <p className="text-xs font-semibold text-muted">{t('lkr.n.' + n.id)}</p>
                    <p className="font-mono font-bold tracking-wider">{n.value}</p>
                    <p className={`text-sm font-semibold flex items-center gap-1 ${n.ok ? 'text-ok' : 'text-warn'}`}>
                      <Icon name={n.ok ? 'check' : 'alert'} size={14} strokeWidth={3} /> {t('lkr.note.' + n.note)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-line/70 bg-bg/90 backdrop-blur grid gap-2">
          {step === 'account' && <button className="btn-primary" onClick={() => { setOtp(''); setStep('otp'); }}>{t('lkr.sendOtp')} <Icon name="right" size={18} /></button>}
          {step === 'otp' && <button className="btn-primary" disabled={otp.length !== 6} onClick={() => (otp === DEMO_OTP ? setStep('consent') : setOtpErr(t('lkr.otpWrong')))}>{t('lkr.verify')} <Icon name="right" size={18} /></button>}
          {step === 'consent' && (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <button className="btn-secondary px-4" onClick={onClose}>{t('lkr.deny')}</button>
              <button className="btn-primary" disabled={!picked.length} onClick={() => { setGot(0); setStep('fetch'); }}>{t('lkr.allow')}</button>
            </div>
          )}
          {step === 'result' && (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <button className="btn-secondary px-4" onClick={back}><Icon name="back" size={18} /> {t('c.back')}</button>
              <button className="btn-primary" onClick={() => onUse(res)}>{useLabel || t('lkr.use')} <Icon name="right" size={18} /></button>
            </div>
          )}
        </div>
      </div>

      {view && (
        <div className="fixed inset-0 z-[66] bg-ink/80 flex flex-col items-center justify-center p-4 gap-3" role="dialog" aria-modal="true" aria-label={L(docTypes[view.kind].name)}>
          <img src={view.url} alt={L(docTypes[view.kind].name)} className="w-full max-w-app rounded-xl bg-surface" />
          <div className="grid grid-cols-2 gap-2 w-full max-w-app">
            <button className="btn-secondary" onClick={() => setView(null)}>{t('c.close')}</button>
            <button className="btn-primary" onClick={async () => { const b = await (await fetch(view.url)).blob(); downloadBlob(`${view.kind}-digital-copy.png`, b); }}>
              <Icon name="download" size={18} /> {t('lkr.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
