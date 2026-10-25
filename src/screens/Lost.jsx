import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { BackButton, Choices, ProgressBar } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import TileArt from '../components/TileArt.jsx';
import NumberInput, { validDl } from '../components/NumberInput.jsx';
import { PauseButton } from '../components/Help.jsx';
import { rtoQuestions } from '../data/rules.js';

// Lost licence: calm first, then one small question per screen, then the one-screen apply.
const STEPS = 4;

export default function Lost() {
  const { state, update } = useStore();
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const lost = state.lost || {};
  const step = lost.step || 0;
  const set = (patch) => update((s) => { s.lost = { ...(s.lost || {}), ...patch }; });
  const go = (n) => set({ step: n });

  const canNext =
    step === 0 ? true :
    step === 1 ? !!lost.what :
    step === 2 ? !!(lost.aadhaar && lost.name) :
    step === 3 ? validDl(lost.licenceNo || '') : true;

  const finish = () => {
    set({ step: 3 });
    navigate('/service/duplicate/apply');
  };

  const onlineOk = lost.aadhaar === 'yes' && lost.name === 'yes';

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <BackButton back={step === 0 ? '/' : () => go(step - 1)} />
        <div className="flex-1 min-w-0">
          {step > 0 && <ProgressBar value={step} max={STEPS - 1} label={t('c.step', { n: step, total: STEPS - 1 })} />}
        </div>
        <PauseButton />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6" key={step} tabIndex={0}>
        {step === 0 && (
          <div className="fade-in">
            <div className="rounded-4xl bg-blush px-5 pt-5 pb-6">
              <TileArt name="lost" className="w-24 h-[4.8rem] -ml-1" />
              <h1 className="font-display text-[2.3rem] leading-[1.05] mt-2">{t('lo.title')}</h1>
              <p className="text-ink/75 mt-1 text-lg">{t('lo.calm')}</p>
            </div>
            <ul className="mt-4 grid gap-2.5">
              {[['check', 'lo.r1'], ['route', 'lo.r2'], ['clock', 'lo.r3']].map(([ic, k], i) => (
                <li key={k} className="card p-4 flex gap-3 items-start rise" style={{ '--i': i + 1 }}>
                  <span className="w-9 h-9 rounded-full bg-ok-soft text-ok grid place-items-center shrink-0"><Icon name={ic} size={18} strokeWidth={2.5} /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug">{t(k)}</span>
                    <span className="block text-sm text-muted leading-snug mt-0.5">{t(k + 'Sub')}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in pt-2">
            <h1 className="font-display text-[1.9rem] leading-tight">{t('lo.q1')}</h1>
            <div className="mt-4">
              <Choices name={t('lo.q1')} value={lost.what} onChange={(v) => set({ what: v })}
                options={[{ value: 'lost', label: t('lo.lost') }, { value: 'stolen', label: t('lo.stolen') }, { value: 'damaged', label: t('lo.damaged') }]} />
            </div>
            {lost.what === 'stolen' && (
              <div className="mt-4 card p-4 fade-in">
                <p className="font-semibold">{t('lo.policeT')}</p>
                <p className="text-sm text-muted mt-1">{t('lo.policeD')}</p>
                <label htmlFor="police" className="label mt-3">{t('lo.policeNo')}</label>
                <input id="police" className="field" value={lost.police || ''} onChange={(e) => set({ police: e.target.value })} />
              </div>
            )}
            {lost.what === 'lost' && <p className="mt-4 text-sm rounded-2xl bg-sunk px-4 py-3 fade-in">{t('lo.lostNote')}</p>}
            {lost.what === 'damaged' && <p className="mt-4 text-sm rounded-2xl bg-sunk px-4 py-3 fade-in">{t('lo.damagedNote')}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="fade-in pt-2">
            <h1 className="font-display text-[1.9rem] leading-tight">{t('lo.q2')}</h1>
            <p className="text-muted mt-1">{t('lo.q2Sub')}</p>
            {rtoQuestions.map((q) => (
              <fieldset key={q.id} className="card p-4 mt-3">
                <legend className="sr-only">{L(q.q)}</legend>
                <p className="font-semibold mb-2" aria-hidden="true">{L(q.q)}</p>
                <Choices cols={3} name={L(q.q)} value={lost[q.id]} onChange={(v) => set({ [q.id]: v })}
                  options={[{ value: 'yes', label: t('c.yes') }, { value: 'no', label: t('c.no') }, { value: 'unsure', label: t('rc.unsure') }]} />
                {lost[q.id] && lost[q.id] !== 'yes' && <p className="text-sm mt-3 rounded-2xl bg-warn-soft px-3 py-2 fade-in">{L(q.no)}</p>}
              </fieldset>
            ))}
            {lost.aadhaar && lost.name && (
              <div className={`mt-3 rounded-3xl p-4 flex gap-3 items-start pop ${onlineOk ? 'bg-ok-soft' : 'bg-sunk'}`} role="status">
                <Icon name={onlineOk ? 'check' : 'route'} size={22} strokeWidth={2.5} className={onlineOk ? 'text-ok shrink-0' : 'text-brand shrink-0'} />
                <div>
                  <p className="font-semibold">{t(onlineOk ? 'lo.noVisit' : 'lo.oneVisit')}</p>
                  <p className="text-sm mt-0.5">{t(onlineOk ? 'lo.noVisitSub' : 'lo.oneVisitSub')}</p>
                  {!onlineOk && <button className="text-sm font-semibold text-brand mt-1 min-h-[2.25rem]" onClick={() => navigate('/rto-check')}>{t('lo.seeVisit')} →</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="fade-in pt-2">
            <h1 className="font-display text-[1.9rem] leading-tight">{t('lo.q3')}</h1>
            <p className="text-muted mt-1">{t('lo.q3Sub')}</p>
            <div className="mt-4">
              <NumberInput value={lost.licenceNo || ''} onChange={(v) => set({ licenceNo: v })} />
            </div>
            <button className="mt-4 w-full rounded-2xl bg-brand-soft text-brand px-4 py-3 text-left flex items-center gap-3" onClick={finish}>
              <Icon name="cloud" size={18} className="shrink-0" />
              <span className="flex-1 text-sm font-semibold">{t('lo.later')}</span>
              <Icon name="right" size={18} />
            </button>
            <button className="mt-2 w-full rounded-2xl bg-sunk px-4 py-3 text-left flex items-center gap-3" onClick={() => navigate('/help?topic=findno')}>
              <Icon name="chat" size={18} className="text-brand shrink-0" />
              <span className="flex-1 text-sm font-semibold">{t('lo.cantFind')}</span>
              <Icon name="right" size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-line/70 bg-bg/90 backdrop-blur flex gap-2">
        {step > 0 && (
          <button className="btn-secondary px-4 shrink-0" onClick={() => go(step - 1)}><Icon name="back" size={18} /> {t('c.back')}</button>
        )}
        {step < 3 ? (
          <button className="btn-primary flex-1" disabled={!canNext} onClick={() => go(step + 1)}>
            {step === 0 ? t('lo.start') : t('c.next')} <Icon name="right" size={18} />
          </button>
        ) : (
          <button className="btn-primary flex-1" disabled={!canNext} onClick={finish}>
            {t('lo.checkApply')} <Icon name="right" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
