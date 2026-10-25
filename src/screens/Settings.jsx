import { useEffect, useState } from 'react';
import { useStore, exportCode, importCode } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tabs, Toggle } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { requestUnlock, requestChangePin } from '../components/Lock.jsx';
import { phoneAvailable } from '../vault.js';

export default function Settings() {
  const { state, update, replace, reset } = useStore();
  const { t } = useI18n();
  const st = state.settings;
  const set = (k, v) => update((s) => { s.settings[k] = v; });
  const [paste, setPaste] = useState('');
  const [msg, setMsg] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const code = showCode ? exportCode(state) : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode(state));
      setMsg(t('se.copied'));
    } catch {
      setShowCode(true);
    }
  };
  const load = () => {
    try {
      replace(importCode(paste));
      setPaste('');
      setMsg(t('se.loaded'));
    } catch {
      setMsg(t('se.bad'));
    }
  };

  return (
    <Screen title="se.title" back>
      <section className="card p-4 space-y-3">
        <div>
          <p className="label">{t('se.lang')}</p>
          <Tabs
            label={t('se.lang')}
            value={st.lang}
            onChange={(v) => set('lang', v)}
            tabs={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }]}
          />
        </div>
        <Toggle id="helper" label={t('se.helper')} checked={st.helper} onChange={(v) => set('helper', v)} />
      </section>

      <section className="card p-4 mt-3 space-y-3">
        <div>
          <p className="label">{t('se.size')}</p>
          <Tabs
            label={t('se.size')}
            value={String(st.size)}
            onChange={(v) => set('size', Number(v))}
            tabs={[
              { value: '0', label: <span aria-label={t('se.s0')}>A</span> },
              { value: '1', label: <span className="text-base" aria-label={t('se.s1')}>A+</span> },
              { value: '2', label: <span className="text-lg" aria-label={t('se.s2')}>A++</span> },
            ]}
          />
        </div>
        <div>
          <p className="label">{t('se.theme')}</p>
          <Tabs
            label={t('se.theme')}
            value={st.theme || 'auto'}
            onChange={(v) => set('theme', v)}
            tabs={[{ value: 'auto', label: t('se.auto') }, { value: 'light', label: t('se.light') }, { value: 'dark', label: t('se.dark') }]}
          />
        </div>
        <Toggle id="contrast" label={t('se.contrast')} checked={st.contrast} onChange={(v) => set('contrast', v)} />
        <Toggle id="motion" label={t('se.motion')} checked={st.motion !== false} onChange={(v) => set('motion', v)} />
      </section>

      <InstallCard />

      <section className="card p-4 mt-3 space-y-1">
        <Toggle id="demobusy" label={t('se.demoBusy')} checked={!!st.demoBusy} onChange={(v) => set('demoBusy', v)} />
        <p className="text-xs text-muted">{t('se.demoBusySub')}</p>
        <Toggle id="calm" label={t('se.calm')} checked={!!st.calm} onChange={(v) => set('calm', v)} />
        <p className="text-xs text-muted">{t('se.calmSub')}</p>
        <Toggle id="spacing" label={t('se.spacing')} checked={!!st.spacing} onChange={(v) => set('spacing', v)} />
        <p className="text-xs text-muted">{t('se.spacingSub')}</p>
        <Toggle id="speak" label={t('se.speak')} checked={st.speak} onChange={(v) => set('speak', v)} />
        <Toggle id="ai" label={t('se.ai')} checked={st.ai !== false} onChange={(v) => set('ai', v)} />
      </section>

      <SecuritySection />

      <section className="card p-4 mt-3">
        <h2 className="font-bold flex items-center gap-2"><Icon name="copy" size={18} /> {t('se.device')}</h2>
        <p className="text-sm text-muted mt-0.5">{t('se.deviceSub')}</p>
        <button className="btn-secondary w-full mt-2" onClick={copy}>{t('se.copy')}</button>
        {showCode && <textarea readOnly className="field mt-2 py-2 text-xs font-mono h-20" value={code} aria-label={t('se.copy')} onFocus={(e) => e.target.select()} />}
        <label htmlFor="paste" className="label mt-3">{t('se.paste')}</label>
        <div className="flex gap-2">
          <input id="paste" className="field font-mono text-sm" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="LS1.…" />
          <button className="btn-primary px-4 shrink-0" onClick={load} disabled={!paste.trim()}>{t('se.load')}</button>
        </div>
        {msg && <p className="mt-2 text-sm font-semibold" role="status">{msg}</p>}
        <p className="text-xs text-muted mt-2">{t('se.privacy')}</p>
      </section>

      <section className="mt-3">
        {confirmReset ? (
          <div className="card p-3 border-bad/40">
            <p className="font-semibold">{t('se.resetQ')}</p>
            <div className="flex gap-2 mt-2">
              <button className="btn-secondary flex-1" onClick={() => setConfirmReset(false)}>{t('c.cancel')}</button>
              <button className="btn flex-1 bg-bad text-on-brand" onClick={reset}>{t('se.reset')}</button>
            </div>
          </div>
        ) : (
          <button className="btn-ghost w-full text-bad" onClick={() => setConfirmReset(true)}>
            <Icon name="refresh" size={18} /> {t('se.reset')}
          </button>
        )}
      </section>
    </Screen>
  );
}

// "Install app" appears only when the browser offers it
function InstallCard() {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState(() => window.__installPrompt || null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const on = () => setPrompt(window.__installPrompt);
    window.addEventListener('ls-install', on);
    return () => window.removeEventListener('ls-install', on);
  }, []);
  if (!prompt || done) return null;
  return (
    <section className="card p-4 mt-3 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t('se.install')}</p>
        <p className="text-sm text-muted">{t('se.installSub')}</p>
      </div>
      <button
        className="btn-primary px-4 shrink-0"
        onClick={async () => {
          prompt.prompt();
          await prompt.userChoice.catch(() => {});
          window.__installPrompt = null;
          setDone(true);
        }}
      >
        {t('se.installBtn')}
      </button>
    </section>
  );
}

// Lock and privacy: like a bank app, saved details open only with your PIN or your phone's screen lock
function SecuritySection() {
  const { security } = useStore();
  const { t } = useI18n();
  const [canPhone, setCanPhone] = useState(false);
  const [sure, setSure] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => { phoneAvailable().then(setCanPhone); }, []);
  const needOpen = async () => security.unlocked || requestUnlock();
  return (
    <section className="card p-4 mt-3" aria-labelledby="sec-h">
      <h2 id="sec-h" className="font-bold flex items-center gap-2"><Icon name="shield" size={18} /> {t('pf.secT')}</h2>
      <p className="text-sm text-muted mt-0.5">{security.on ? (security.phone ? t('pf.secOnPhone') : t('pf.secOn')) : t('pf.secOff')}</p>
      {security.on && (
        <div className="mt-3 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary px-3 text-sm" onClick={security.unlocked ? security.lock : () => requestUnlock()}>
              <Icon name={security.unlocked ? 'lock' : 'unlock'} size={16} /> {security.unlocked ? t('pf.lockNow') : t('pf.unlock')}
            </button>
            <button className="btn-secondary px-3 text-sm" onClick={async () => { if (await needOpen()) { const ok = await requestChangePin(); if (ok) setNote(t('se.pinChanged')); } }}>
              {security.pin ? t('se.changePin') : t('se.addPin')}
            </button>
          </div>
          {canPhone ? (
            <div className="space-y-1">
              <Toggle id="phonelock" label={t('se.phoneLock')} checked={security.phone} onChange={async (v) => {
                setNote('');
                if (!v) { try { await security.disablePhone(); } catch { setNote(t('se.needPin')); } return; }
                if (!(await needOpen())) return;
                try { await security.enablePhone(); } catch { setNote(t('lk.phoneFail')); }
              }} />
              <p className="text-xs text-muted">{t('se.phoneLockSub')}</p>
            </div>
          ) : (
            <p className="text-xs text-muted">{t('se.phoneNo')}</p>
          )}
          {!sure ? (
            <button className="btn-ghost text-bad justify-start px-0" onClick={() => setSure(true)}>{t('lk.forget')}</button>
          ) : (
            <div className="rounded-2xl bg-bad-soft p-3" role="alert">
              <p className="font-semibold">{t('lk.forgetSure')}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button className="btn-secondary px-3 min-h-[2.75rem] text-sm" onClick={() => setSure(false)}>{t('c.cancel')}</button>
                <button className="btn-primary px-3 min-h-[2.75rem] text-sm" onClick={async () => { await security.forget(); setSure(false); setNote(t('se.forgotten')); }}>{t('lk.forgetYes')}</button>
              </div>
            </div>
          )}
        </div>
      )}
      {note && <p className="text-sm font-semibold text-ok mt-2" role="status">{note}</p>}
    </section>
  );
}
