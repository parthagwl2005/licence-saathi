import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Bi, ProgressBar, Stuck, Listen, Term } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { documents, stuck } from '../data/content.js';
import { config } from '../data/config.js';

export function docsFor(elig) {
  const age = Number(elig.age) || 0;
  return documents.filter(
    (d) =>
      d.when === 'always' ||
      (d.when === 'over40' && age >= config.doctorCertAge) ||
      (d.when === 'parent' && config.parentConsent.includes(elig.vehicle) && age < 18)
  );
}

export default function Documents() {
  const { state, update } = useStore();
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const answered = state.elig.age && state.elig.vehicle;
  const list = docsFor(state.elig);
  const doneN = list.filter((d) => state.docs[d.id]).length;

  if (!answered) {
    return (
      <Screen title="dc.title" back="/" footer={<button className="btn-primary w-full" onClick={() => navigate('/eligibility')}><Tx k="dc.goEl" /></button>}>
        <p className="mt-6 text-lg">{t('dc.needAnswers')}</p>
      </Screen>
    );
  }

  return (
    <Screen
      title="dc.title"
      back="/eligibility"
      footer={
        <button className="btn-primary w-full" onClick={() => navigate('/apply')}>
          <Tx k="dc.goApply" /> <Icon name="right" size={18} />
        </button>
      }
    >
      <ProgressBar value={doneN} max={list.length} label={t('dc.count', { done: doneN, total: list.length })} />
      {doneN === list.length && (
        <p className="mt-2 text-ok font-semibold flex items-center gap-1" role="status"><Icon name="check" size={18} strokeWidth={3} /> {t('dc.allReady')}</p>
      )}

      <ul className="mt-3 space-y-2">
        {list.map((d) => {
          const have = !!state.docs[d.id];
          const isOpen = open === d.id;
          return (
            <li key={d.id} className={`card overflow-hidden ${have ? 'border-ok/50' : ''}`}>
              <div className="flex items-center gap-2 pr-2">
                <label className="flex items-center gap-3 pl-3 py-2 min-h-[3.25rem] cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={have}
                    onChange={(e) => update((s) => { s.docs[d.id] = e.target.checked; })}
                    className="w-6 h-6 shrink-0 accent-[rgb(var(--ok))]"
                    aria-describedby={`doc-${d.id}-what`}
                  />
                  <span className="min-w-0">
                    <Bi v={d.name} className="font-semibold" />
                    {have && <span className="text-ok text-sm font-semibold flex items-center gap-1"><Icon name="check" size={14} strokeWidth={3} /> {t('dc.ready')}</span>}
                  </span>
                </label>
                <button
                  onClick={() => setOpen(isOpen ? null : d.id)}
                  aria-expanded={isOpen}
                  aria-controls={`doc-${d.id}-what`}
                  aria-label={`${L(d.name)}: ${t('c.whatMeans')}`}
                  className="w-11 h-11 shrink-0 rounded-full grid place-items-center hover:bg-sunk"
                >
                  <Icon name="down" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div id={`doc-${d.id}-what`} hidden={!isOpen} className="px-3 pb-3 border-t border-line pt-2 bg-sunk/50">
                <p>{L(d.what)}</p>
                <p className="mt-2 text-sm font-semibold text-muted">{t('dc.examples')}</p>
                <ul className="mt-1 space-y-1">
                  {d.examples.map((x, i) => (
                    <li key={i} className="flex gap-2 text-sm"><Icon name="check" size={16} className="text-ok shrink-0 mt-0.5" /> {L(x)}</li>
                  ))}
                </ul>
                <div className="mt-2"><Listen small text={`${L(d.name)}. ${L(d.what)} ${d.examples.map((x) => L(x)).join(', ')}`} /></div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-sm text-muted">
        <Term id="Form 1">Form 1</Term> · <Term id="Form 1A">Form 1A</Term>
      </p>
      <Stuck items={stuck.documents} className="mt-3" />
    </Screen>
  );
}
