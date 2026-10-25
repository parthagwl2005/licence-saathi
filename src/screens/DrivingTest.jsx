import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Listen, Tabs } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Illus from '../components/Illus.jsx';
import { drivingTest } from '../data/content.js';

export default function DrivingTest() {
  const { state } = useStore();
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const isCar = (state.app.form.vehicles || []).includes('car') && !(state.app.form.vehicles || []).includes('motorcycle');
  const [tab, setTab] = useState(isCar ? 'car' : 'twoWheeler');
  const [view, setView] = useState('steps');
  const [open, setOpen] = useState(0);
  const steps = drivingTest[tab];

  return (
    <Screen
      title="dt.title"
      back
      footer={
        <button className="btn-primary w-full" onClick={() => navigate('/permanent')}>
          <Tx k="pm.checklist" /> <Icon name="right" size={18} />
        </button>
      }
    >
      <p className="text-sm rounded-xl bg-sunk px-3 py-2 flex items-center gap-2 mb-3"><Icon name="info" size={16} className="shrink-0" /> {t('dt.varies')}</p>
      <Tabs label={t('dt.title')} value={tab} onChange={setTab} tabs={[{ value: 'twoWheeler', label: t('dt.2w') }, { value: 'car', label: t('dt.car') }]} />

      <div className="flex gap-1.5 mt-3">
        <button className={`chip ${view === 'steps' ? 'bg-ink text-bg border-ink hover:bg-ink' : ''}`} aria-pressed={view === 'steps'} onClick={() => setView('steps')}>{t('dt.steps')}</button>
        <button className={`chip ${view === 'fail' ? 'bg-ink text-bg border-ink hover:bg-ink' : ''}`} aria-pressed={view === 'fail'} onClick={() => setView('fail')}>{t('dt.fail')}</button>
      </div>

      {view === 'steps' ? (
        <>
          <ol className="mt-3 space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="card p-2.5 flex gap-3 items-center">
                <div className="relative shrink-0">
                  <Illus name={s.illus} className="w-24 h-auto rounded-lg" />
                  <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-brand text-on-brand text-xs font-bold grid place-items-center">{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold leading-snug">{L(s.t)}</p>
                  <p className="text-sm leading-snug mt-0.5">{L(s.d)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2"><Listen small text={steps.map((s, i) => `${i + 1}. ${L(s.t)}. ${L(s.d)}`).join(' ')} /></div>
        </>
      ) : (
        <ol className="mt-3 space-y-2">
          {drivingTest.failReasons.map((r, i) => (
            <li key={i} className="card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-3 text-left min-h-[3.25rem]"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span className="w-7 h-7 shrink-0 rounded-full bg-bad-soft text-bad font-bold text-sm grid place-items-center">{i + 1}</span>
                <span className="flex-1 font-semibold">{L(r.t)}</span>
                <Icon name="down" className={`transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-3 pb-3 -mt-1 flex gap-2 items-start">
                  <Icon name="check" size={18} strokeWidth={3} className="text-ok shrink-0 mt-0.5" />
                  <p><span className="font-semibold">{t('dt.fix')}:</span> {L(r.fix)}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Screen>
  );
}
