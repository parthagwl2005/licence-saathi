import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tabs } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { ErrorCard } from '../components/Help.jsx';
import { errors, helpTopics, officialHelp, safetyTips, privacy } from '../data/errors.js';
import { ownApps } from './Track.jsx';
import { toast } from '../queue.js';

// Help & safety: what went wrong and the one fix, a request written for you, scam tips and our privacy promise.
export default function HelpCenter() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'wrong');
  return (
    <Screen title="hc.title" back>
      <Tabs label={t('hc.title')} value={tab} onChange={setTab}
        tabs={[{ value: 'wrong', label: t('hc.wrong') }, { value: 'safe', label: t('hc.safe') }, { value: 'privacy', label: t('hc.privacy') }]} />
      {tab === 'wrong' && (
        <button className="mt-4 w-full rounded-3xl bg-brand text-on-brand p-4 flex items-center gap-3 text-left" onClick={() => navigate('/fix')}>
          <span className="w-11 h-11 rounded-full bg-on-brand/15 grid place-items-center shrink-0"><Icon name="sparkle" size={20} /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold leading-tight">{t('fx.homeT')}</span><span className="block text-sm opacity-90 leading-snug">{t('fx.homeSub')}</span></span>
          <Icon name="right" size={18} />
        </button>
      )}
      <div className="mt-4">
        {tab === 'wrong' && <Wrong initial={params.get('topic')} />}
        {tab === 'safe' && <List items={safetyTips} icon="alert" tone="warn" />}
        {tab === 'privacy' && <List items={privacy} icon="check" tone="ok" />}
      </div>
    </Screen>
  );
}

function List({ items, icon, tone }) {
  const { L } = useI18n();
  return (
    <ul className="grid gap-2.5">
      {items.map((x, i) => (
        <li key={i} className="card p-4 flex gap-3 items-start rise" style={{ '--i': i }}>
          <span className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${tone === 'ok' ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}><Icon name={icon} size={18} strokeWidth={2.5} /></span>
          <span className="leading-snug pt-1.5">{L(x)}</span>
        </li>
      ))}
    </ul>
  );
}

function Wrong({ initial }) {
  const { state } = useStore();
  const { t, L, fmtDate } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(initial && errors[initial] ? initial : null);
  const apps = ownApps(state);
  const last = apps.slice(-1)[0];
  const vars = { no: last?.no || '____', name: state.profile.name || '____', dob: state.profile.dob ? fmtDate(state.profile.dob) : '____' };

  const copy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t('se.copied'));
    } catch {
      document.getElementById(id)?.select();
    }
  };

  return (
    <div>
      <p className="font-semibold mb-2">{t('hc.whatHappened')}</p>
      <ul className="grid gap-2">
        {helpTopics.map((k) => {
          const e = errors[k];
          const isOpen = open === k;
          return (
            <li key={k}>
              <button
                className={`w-full text-left rounded-2xl px-4 min-h-[3.25rem] flex items-center gap-3 transition-colors ${isOpen ? 'bg-brand-soft' : 'bg-surface shadow-soft'}`}
                onClick={() => setOpen(isOpen ? null : k)}
                aria-expanded={isOpen}
              >
                <Icon name={e.icon} size={18} className="text-brand shrink-0" />
                <span className="flex-1 font-medium leading-snug py-2">{L(e.title)}</span>
                <Icon name="down" className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="mt-2">
                  <ErrorCard code={k}>
                    {e.complaint && (
                      <div>
                        <label htmlFor={'cm-' + k} className="label">{t('hc.written')}</label>
                        <textarea id={'cm-' + k} readOnly rows={3} className="field py-3 text-sm" value={L(e.complaint, vars)} onFocus={(ev) => ev.target.select()} />
                        <button className="btn-primary w-full mt-2" onClick={() => copy(L(e.complaint, vars), 'cm-' + k)}>
                          <Icon name="copy" size={18} /> {t('hc.copy')}
                        </button>
                        <p className="text-xs text-muted mt-2">{t('hc.sendTo')}</p>
                      </div>
                    )}
                    {k === 'findno' && (
                      <button className="btn-secondary w-full mt-2" onClick={() => navigate('/lost')}>{t('hc.backLost')}</button>
                    )}
                  </ErrorCard>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="font-semibold mt-6 mb-2">{t('hc.official')}</p>
      <ul className="card divide-y divide-line/70">
        {officialHelp.map((o) => (
          <li key={o.url}>
            <a href={o.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 min-h-[3.25rem] py-2">
              <span className="flex-1 min-w-0">
                <span className="block font-medium leading-snug">{L(o.name)}</span>
                <span className="block text-xs text-muted">{o.url.replace('https://', '')}</span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
