import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/index.js';
import { useStore } from '../store.jsx';
import { errors } from '../data/errors.js';
import { downloadIcs } from '../summary.js';
import { todayStr, addDays, parse, toStr } from '../utils.js';
import { toast } from '../queue.js';
import Icon from './Icon.jsx';
import { requestSetup } from './Lock.jsx';

// A calm explanation of a problem: what happened, that it isn't their fault, and one fix.
export function ErrorCard({ code, children, compact = false }) {
  const { L } = useI18n();
  const e = errors[code];
  if (!e) return null;
  return (
    <div className="rounded-3xl bg-warn-soft p-4 fade-in" role="status">
      <div className="flex gap-3 items-start">
        <span className="w-10 h-10 rounded-full bg-surface grid place-items-center shrink-0 text-warn"><Icon name={e.icon} size={20} /></span>
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{L(e.title)}</p>
          {!compact && <p className="text-sm mt-1 leading-snug">{L(e.what)}</p>}
          <p className="text-sm mt-1.5 font-semibold text-brand leading-snug flex gap-1.5"><Icon name="right" size={16} className="shrink-0 mt-0.5" />{L(e.fix)}</p>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

// Waiting-to-send note, shown on Home and Track while the queue is trying
export function OutboxNote() {
  const { state } = useStore();
  const { t } = useI18n();
  const n = (state.outbox || []).length;
  if (!n) return null;
  const reason = state.outbox[0].reason;
  return (
    <p className="rounded-2xl bg-warn-soft text-sm px-3 py-2 flex items-center gap-2 font-semibold" role="status">
      <span className="w-2 h-2 rounded-full bg-warn a-blink shrink-0" aria-hidden="true" />
      {t(reason === 'offline' ? 'q.waitOffline' : 'q.waitBusy', { n })}
    </p>
  );
}

// "Pause for now": saves (already saved) and offers a reminder the person chooses
export function PauseButton({ className = '' }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={`chip min-h-[2.5rem] ${className}`} onClick={() => setOpen(true)}>
        <Icon name="clock" size={15} /> {t('pr.pause')}
      </button>
      {open && <PauseSheet onClose={() => setOpen(false)} />}
    </>
  );
}

function nextSunday() {
  const d = parse(todayStr());
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  return toStr(d);
}

export function PauseSheet({ onClose }) {
  const { t } = useI18n();
  const { state, security } = useStore();
  const navigate = useNavigate();
  const hasForm = Object.keys(state.forms || {}).length > 0;
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  const now = new Date();
  const opts = [
    { k: 'pr.tonight', date: now.getHours() < 21 ? todayStr() : addDays(todayStr(), 1), time: '21:00' },
    { k: 'pr.tomorrow', date: addDays(todayStr(), 1), time: '09:00' },
    { k: 'pr.sunday', date: nextSunday(), time: '10:00' },
  ];
  const done = (o) => {
    if (o) downloadIcs({ title: t('pr.icsTitle'), date: o.date, time: o.time, minutes: 15, note: t('pr.icsNote') });
    onClose();
    navigate('/');
    toast(t('pr.saved'));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="pr-h">
      <button className="absolute inset-0 bg-ink/35 scrim-in" onClick={onClose} aria-label={t('c.close')} tabIndex={-1} />
      <div className="relative w-full max-w-app bg-bg rounded-t-4xl p-5 pb-6 sheet-in shadow-lift">
        <div className="w-10 h-1.5 rounded-full bg-line mx-auto mb-4" aria-hidden="true" />
        <h2 id="pr-h" className="font-display text-[1.8rem] leading-tight">{t('pr.title')}</h2>
        <p className="text-muted mt-1">{t('pr.sub')}</p>
        {hasForm && !security.on && (
          <button className="mt-3 w-full rounded-2xl bg-brand-soft text-brand font-semibold px-4 py-3 flex items-center gap-3 text-left" onClick={() => requestSetup()}>
            <Icon name="finger" size={20} className="shrink-0" /> <span className="flex-1">{t('pr.lock')}</span>
          </button>
        )}
        {hasForm && security.on && <p className="mt-3 text-sm font-semibold text-ok flex items-center gap-1.5"><Icon name="lock" size={16} /> {t('pr.locked')}</p>}
        <p className="mt-4 label">{t('pr.when')}</p>
        <div className="grid gap-2">
          {opts.map((o) => (
            <button key={o.k} className="btn-secondary justify-between px-5" onClick={() => done(o)}>
              <span>{t(o.k)}</span> <Icon name="calendar" size={18} />
            </button>
          ))}
          <button className="btn-ghost" onClick={() => done(null)}>{t('pr.noReminder')}</button>
        </div>
      </div>
    </div>
  );
}

// Toasts from anywhere in the app
export function Toaster() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let to;
    const on = (e) => {
      setMsg(e.detail);
      clearTimeout(to);
      to = setTimeout(() => setMsg(''), 2600);
    };
    window.addEventListener('ls-toast', on);
    return () => window.removeEventListener('ls-toast', on);
  }, []);
  if (!msg) return null;
  return (
    <div className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 pointer-events-none">
      <div role="status" className="pop bg-ink text-bg rounded-full px-5 py-2.5 font-semibold shadow-lift flex items-center gap-2 max-w-full">
        <Icon name="check" size={18} strokeWidth={3} className="shrink-0" /> <span className="min-w-0">{msg}</span>
      </div>
    </div>
  );
}

// Offline line: one small line, hidden when back online
export function OfflineLine() {
  const { t } = useI18n();
  const [off, setOff] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOff(false);
    const offH = () => setOff(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', offH);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', offH);
    };
  }, []);
  if (!off) return null;
  return (
    <p className="shrink-0 bg-ink text-bg text-sm px-4 py-2 flex items-center gap-2" role="status">
      <span className="w-2 h-2 rounded-full bg-sun shrink-0" aria-hidden="true" /> {t('off.line')}
    </p>
  );
}
