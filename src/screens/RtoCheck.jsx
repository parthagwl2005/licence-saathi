import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/index.js';
import { Screen, Choices } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { rtoServices, rtoQuestions, oneVisit, laws } from '../data/rules.js';

const startRoute = { ll: '/service/ll', duplicate: '/lost', renew: '/service/renew', address: '/service/address', dl: '/permanent', add: '/service/add' };

// "Do I need to visit the RTO?" — answered in three taps, based on the 2022 rule.
export default function RtoCheck() {
  const { t, L, fmtDate } = useI18n();
  const navigate = useNavigate();
  const [svc, setSvc] = useState('');
  const [ans, setAns] = useState({});
  const s = rtoServices.find((x) => x.id === svc);
  const answered = s && rtoQuestions.every((q) => ans[q.id]);
  const blocked = answered && rtoQuestions.some((q) => ans[q.id] !== 'yes');
  const result = !answered ? null : blocked ? 'visit' : s.online === true ? 'online' : 'test';

  return (
    <Screen title="rc.title" back>
      <p className="text-muted -mt-1 mb-4">{t('rc.sub')}</p>

      <p className="font-semibold mb-2">{t('rc.q0')}</p>
      <Choices name={t('rc.q0')} value={svc} onChange={(v) => { setSvc(v); }} options={rtoServices.map((x) => ({ value: x.id, label: L(x.name) }))} />

      {svc && rtoQuestions.map((q) => (
        <fieldset key={q.id} className="card p-4 mt-3 fade-in">
          <legend className="sr-only">{L(q.q)}</legend>
          <p className="font-semibold mb-2" aria-hidden="true">{L(q.q)}</p>
          <Choices cols={3} name={L(q.q)} value={ans[q.id]} onChange={(v) => setAns((a) => ({ ...a, [q.id]: v }))}
            options={[{ value: 'yes', label: t('c.yes') }, { value: 'no', label: t('c.no') }, { value: 'unsure', label: t('rc.unsure') }]} />
          {ans[q.id] && ans[q.id] !== 'yes' && <p className="text-sm mt-3 rounded-2xl bg-warn-soft px-3 py-2">{L(q.no)}</p>}
        </fieldset>
      ))}

      {result && (
        <section className="mt-4 pop" aria-live="polite">
          <div className={`rounded-3xl p-5 ${result === 'online' ? 'bg-ok-soft' : 'bg-sky'}`}>
            <span className={`w-12 h-12 rounded-full grid place-items-center ${result === 'online' ? 'bg-ok text-on-brand' : 'bg-surface text-brand'}`}>
              <Icon name={result === 'online' ? 'check' : 'route'} size={24} strokeWidth={2.5} />
            </span>
            <h2 className="font-display text-[1.9rem] leading-tight mt-3">{t('rc.r.' + result)}</h2>
            <p className="mt-1">{result === 'visit' ? t('rc.r.visitSub') : L(s.note)}</p>
            {result === 'online' && <p className="text-sm text-muted mt-2">{t('rc.why')}</p>}
            {result === 'test' && <p className="text-sm mt-2 rounded-2xl bg-surface/70 px-3 py-2">{t('rc.adtc')}</p>}
            <button className="btn-primary w-full mt-4" onClick={() => navigate(startRoute[svc])}>
              {t(result === 'online' ? 'rc.startOnline' : 'rc.start')} <Icon name="right" size={18} />
            </button>
          </div>

          {result !== 'online' && (
            <div className="card p-4 mt-3">
              <h3 className="font-semibold">{t('rc.visitTitle')}</h3>
              <p className="text-sm text-muted mt-0.5">{L(oneVisit.time)}</p>
              <p className="label mt-3">{t('rc.bring')}</p>
              <ul className="space-y-1.5">
                {oneVisit.bring.map((b, i) => <li key={i} className="flex gap-2 text-sm"><Icon name="check" size={16} className="text-ok shrink-0 mt-0.5" />{L(b)}</li>)}
              </ul>
              <p className="label mt-3">{t('rc.there')}</p>
              <ol className="space-y-1.5">
                {oneVisit.steps.map((b, i) => <li key={i} className="flex gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-sunk text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>{L(b)}</li>)}
              </ol>
            </div>
          )}
        </section>
      )}

      <details className="card mt-5 p-4 group">
        <summary className="font-semibold cursor-pointer list-none flex items-center justify-between min-h-[2.5rem]">
          {t('rc.laws')} <Icon name="down" className="group-open:rotate-180 transition-transform" />
        </summary>
        <ul className="mt-2 divide-y divide-line/70">
          {laws.map((l) => (
            <li key={l.id} className="py-3">
              <p className="text-xs font-semibold text-muted">{fmtDate(l.date)}</p>
              <p className="font-semibold leading-snug">{L(l.name)}</p>
              <p className="text-sm mt-0.5">{L(l.what)}</p>
              <p className="text-sm text-brand font-semibold mt-1">{L(l.helps)}</p>
              {l.source && <a href={l.source} target="_blank" rel="noreferrer" className="text-xs text-muted underline">{t('rc.source')} ↗</a>}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-2">{t('rc.verify')}</p>
      </details>
    </Screen>
  );
}
