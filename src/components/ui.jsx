import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/index.js';
import { useStore } from '../store.jsx';
import { glossary } from '../data/content.js';
import { canSpeak, speak, stopSpeaking } from '../utils.js';
import Icon from './Icon.jsx';

// Main-language text with an optional small helper line in the other language.
export function Tx({ k, vars, className = '', helperClass = '', inline = false, size = 'text-[0.78em]' }) {
  const { t, th, other } = useI18n();
  const h = th(k, vars);
  return (
    <span className={className}>
      {t(k, vars)}
      {h && (
        <span lang={other} className={`${inline ? 'ml-1.5' : 'block'} ${size} font-sans font-normal leading-snug opacity-90 ${helperClass}`}>
          {h}
        </span>
      )}
    </span>
  );
}

// Same, for {en, hi} content objects
export function Bi({ v, vars, className = '', helperClass = '', size = 'text-[0.78em]' }) {
  const { L, Lh, other } = useI18n();
  const h = Lh(v, vars);
  return (
    <span className={className}>
      {L(v, vars)}
      {h && (
        <span lang={other} className={`block ${size} font-sans font-normal leading-snug opacity-90 ${helperClass}`}>
          {h}
        </span>
      )}
    </span>
  );
}

export function BackButton({ back }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <button
      onClick={() => (typeof back === 'function' ? back() : typeof back === 'string' ? navigate(back) : navigate(-1))}
      className="shrink-0 w-11 h-11 rounded-full grid place-items-center bg-surface border border-line/70 shadow-soft hover:bg-sunk active:scale-95 transition-transform"
      aria-label={t('nav.back')}
    >
      <Icon name="back" />
    </button>
  );
}

export function Screen({ title, titleNode, sub, back, children, footer, action }) {
  return (
    <div className="flex flex-col h-full fade-in">
      <div className="px-5 pt-4 pb-3 flex items-start gap-3">
        {back && <BackButton back={back} />}
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="font-display text-[1.85rem] leading-[1.1] tracking-[-0.01em] break-words">
            {titleNode || <Tx k={title} size="text-sm" helperClass="mt-0.5 text-muted" />}
          </h1>
          {sub && <div className="text-sm text-muted mt-1">{sub}</div>}
        </div>
        {action && <div className="shrink-0 mt-1">{action}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6" tabIndex={0}>{children}</div>
      {footer && <div className="px-5 py-3 border-t border-line/70 bg-bg/90 backdrop-blur">{footer}</div>}
    </div>
  );
}

export function Listen({ text, lang: forceLang, small = false, className = '' }) {
  const { state } = useStore();
  const { t, lang } = useI18n();
  const [on, setOn] = useState(false);
  useEffect(() => () => on && stopSpeaking(), [on]);
  if (!state.settings.speak || !canSpeak()) return null;
  const click = () => {
    if (on) {
      stopSpeaking();
      setOn(false);
    } else {
      setOn(true);
      speak(text, forceLang || lang, () => setOn(false));
    }
  };
  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface text-brand font-semibold ${small ? 'min-h-[2.25rem] px-3 text-sm' : 'min-h-[2.75rem] px-4'} hover:bg-brand-soft ${className}`}
    >
      <Icon name={on ? 'stop' : 'speaker'} size={18} />
      {on ? t('c.stopListen') : t('c.listen')}
    </button>
  );
}

// "People often get stuck here"
export function Stuck({ items, className = '' }) {
  const { t, L } = useI18n();
  if (!items?.length) return null;
  return (
    <aside className={`rounded-2xl bg-warn-soft px-4 py-3 ${className}`} aria-label={t('c.stuck')}>
      <div className="flex items-center gap-1.5 text-warn font-semibold text-sm">
        <Icon name="alert" size={16} /> {t('c.stuck')}
      </div>
      <ul className="mt-1 space-y-0.5 text-sm text-ink">
        {items.map((it, i) => (
          <li key={i} className="flex gap-1.5">
            <span aria-hidden="true">•</span>
            <span>{L(it)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Jargon term with a one-line explanation on tap
export function Term({ id, children }) {
  const { L, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const text = glossary[id];
  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="underline decoration-dotted decoration-2 underline-offset-4 decoration-brand font-semibold"
        aria-expanded={open}
        aria-label={`${children || id}: ${t('c.whatMeans')}`}
      >
        {children || id}
      </button>
      {open && text && (
        <span role="note" className="absolute z-30 left-0 top-full mt-1 w-60 max-w-[80vw] rounded-xl bg-ink text-bg text-sm font-normal p-3 shadow-lg text-left">
          <strong>{id}:</strong> {L(text)}
        </span>
      )}
    </span>
  );
}

export function ProgressBar({ value, max, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && <div className="text-sm font-semibold text-muted mb-1">{label}</div>}
      <div className="h-2.5 rounded-full bg-sunk overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Big tappable radio options
export function Choices({ name, value, onChange, options, multi = false, cols = 1 }) {
  const isOn = (v) => (multi ? (value || []).includes(v) : value === v);
  const toggle = (v) => {
    if (!multi) return onChange(v);
    const cur = value || [];
    onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={name} className={`grid gap-2 ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : ''}`}>
      {options.map((o) => {
        const on = isOn(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => toggle(o.value)}
            className={`${cols === 3 ? 'flex flex-col justify-center items-center text-center gap-1.5 px-1.5 py-2.5' : 'flex items-center gap-3 text-left px-4 py-2'} min-h-[3.5rem] rounded-2xl border-2 transition-all active:scale-[0.98] ${on ? 'border-brand bg-brand-soft' : 'border-transparent bg-surface shadow-soft hover:bg-sunk'}`}
          >
            <span className={`shrink-0 w-6 h-6 grid place-items-center border-2 ${multi ? 'rounded-md' : 'rounded-full'} ${on ? 'border-brand bg-brand text-on-brand' : 'border-muted'}`}>
              {on && <Icon name="check" size={14} strokeWidth={3} />}
            </span>
            <span className="min-w-0 max-w-full font-medium leading-tight break-words">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ label, checked, onChange, id }) {
  const { t } = useI18n();
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 min-h-[3rem] cursor-pointer">
      <span className="font-medium">{label}</span>
      <span className="relative inline-flex items-center">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="w-14 h-8 rounded-full bg-sunk border-2 border-line peer-checked:bg-brand peer-checked:border-brand transition-colors peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-brand" />
        <span className="absolute left-1 w-6 h-6 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-6" />
        <span className="sr-only">{checked ? t('se.on') : t('se.off')}</span>
      </span>
    </label>
  );
}

// Card that sends the user to their one next step
export function NextCard({ title, meta, to, icon = 'right' }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="w-full text-left rounded-3xl bg-brand text-on-brand p-4 flex items-center gap-3 shadow-soft hover:shadow-lift active:scale-[0.98] transition-all">
      <div className="min-w-0 flex-1">
        <div className="font-bold text-lg leading-snug">{title}</div>
        {meta && <div className="text-sm opacity-90 mt-0.5 flex items-center gap-1"><Icon name="clock" size={14} /> {meta}</div>}
      </div>
      <span className="shrink-0 w-10 h-10 rounded-full bg-on-brand/15 grid place-items-center">
        <Icon name={icon} />
      </span>
    </button>
  );
}

export function Pill({ tone = 'neutral', children, icon }) {
  const tones = {
    ok: 'bg-ok-soft text-ok',
    bad: 'bg-bad-soft text-bad',
    warn: 'bg-warn-soft text-warn',
    brand: 'bg-brand-soft text-brand',
    neutral: 'bg-sunk text-muted',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold ${tones[tone]}`}>
      {icon && <Icon name={icon} size={14} strokeWidth={3} />}
      {children}
    </span>
  );
}

// Segmented tabs
export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 p-1 rounded-full bg-sunk">
      {tabs.map((tb) => (
        <button
          key={tb.value}
          role="tab"
          aria-selected={value === tb.value}
          onClick={() => onChange(tb.value)}
          className={`flex-1 min-w-0 min-h-[2.75rem] px-2 rounded-full text-sm font-semibold transition-all leading-tight ${value === tb.value ? 'bg-surface text-ink shadow-soft' : 'text-muted'}`}
        >
          {tb.label}
        </button>
      ))}
    </div>
  );
}
