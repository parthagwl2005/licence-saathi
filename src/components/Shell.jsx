import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/index.js';
import { useStore } from '../store.jsx';
import { completeness, hasBasics } from '../profile.js';
import Icon from './Icon.jsx';
import { OfflineLine } from './Help.jsx';

export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="rgb(var(--brand))" />
      <path d="M17 41h30M21 41l4.5-12h13L43 41" stroke="rgb(var(--on-brand))" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="44" r="3.5" fill="rgb(var(--on-brand))" />
      <circle cx="40" cy="44" r="3.5" fill="rgb(var(--on-brand))" />
    </svg>
  );
}

export default function Shell({ children }) {
  const { t, lang } = useI18n();
  const { state, update, security } = useStore();
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuBtn = useRef(null);
  const setLang = (l) => update((s) => { s.settings.lang = l; });

  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);


  return (
    <div className="h-full flex flex-col max-w-app md:max-w-[46rem] mx-auto bg-bg relative">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-2">{t('nav.skip')}</a>
      <header className="flex items-center gap-2 px-4 h-[3.75rem] shrink-0 bg-bg/85 backdrop-blur border-b border-line/50">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-[1.05rem] min-h-[2.75rem] pr-2 rounded-xl min-w-0" aria-label={t('app.name')}>
          <Logo size={30} />
          <span className="truncate">{t('app.name')}</span>
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="min-h-[2.75rem] min-w-[2.75rem] px-3 rounded-full bg-surface border border-line/70 font-semibold text-sm hover:bg-sunk active:scale-95 transition-transform"
            aria-label={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
            lang={lang === 'en' ? 'hi' : 'en'}
          >
            {lang === 'en' ? 'हिं' : 'EN'}
          </button>
          <button
            ref={menuBtn}
            onClick={() => setOpen(true)}
            className="w-11 h-11 rounded-full grid place-items-center bg-surface border border-line/70 hover:bg-sunk active:scale-95 transition-transform"
            aria-label={t('nav.menu')}
            aria-expanded={open}
            aria-controls="drawer"
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <OfflineLine />
      <main id="main" className="flex-1 min-h-0">
        <div key={loc.pathname} className="h-full fade-in">{children}</div>
      </main>

      {open && <Drawer onClose={() => { setOpen(false); menuBtn.current?.focus(); }} />}
    </div>
  );

  function Drawer({ onClose }) {
    const ref = useRef(null);
    const p = state.profile;
    const c = completeness(p);
    useEffect(() => {
      ref.current?.querySelector('button, a')?.focus();
      const esc = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', esc);
      return () => document.removeEventListener('keydown', esc);
    }, []);
    const go = (to) => {
      onClose();
      navigate(to);
    };
    const items = [
      { to: '/profile', icon: security.on && !security.unlocked ? 'lock' : 'user', k: 'nav.details', meta: security.on && !security.unlocked ? t('h.locked') : `${c.pct}%` },
      { to: '/#services', icon: 'grid', k: 'nav.services' },
      { to: '/service/ll', icon: 'file', k: 'nav.applyLL' },
      { to: '/lost', icon: 'alert', k: 'nav.lost' },
      { to: '/rto-check', icon: 'map', k: 'nav.rto' },
      { to: '/learn', icon: 'book', k: 'nav.learn' },
      { to: '/mock', icon: 'test', k: 'nav.test' },
      { to: '/track', icon: 'route', k: 'nav.track' },
      { to: '/chat', icon: 'chat', k: 'nav.ask' },
      { to: '/fix', icon: 'sparkle', k: 'nav.fix' },
      { to: '/help', icon: 'info', k: 'nav.help' },
      { to: '/settings', icon: 'gear', k: 'nav.settings' },
    ];
    return (
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
        <button className="absolute inset-0 bg-ink/35 scrim-in w-full cursor-default" onClick={onClose} aria-label={t('c.close')} tabIndex={-1} />
        <aside id="drawer" ref={ref} className="absolute right-0 top-0 h-full w-[20rem] max-w-[86vw] bg-bg drawer-in shadow-lift flex flex-col">
          <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-line/60">
            {p.photo ? (
              <img src={p.photo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-12 h-12 rounded-full bg-brand-soft text-brand grid place-items-center shrink-0"><Icon name="user" /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight truncate">{hasBasics(p) ? p.name : t('nav.details')}</p>
              <p className="text-xs text-muted">{t('pf.count', { done: c.done, total: c.total })}</p>
            </div>
            <button onClick={onClose} className="w-11 h-11 rounded-full grid place-items-center hover:bg-sunk shrink-0" aria-label={t('c.close')}>
              <Icon name="x" />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-line/60">
            <p className="label">{t('se.lang')}</p>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-sunk" role="radiogroup" aria-label={t('se.lang')}>
              {[['en', 'English'], ['hi', 'हिंदी']].map(([l, name]) => (
                <button
                  key={l}
                  role="radio"
                  aria-checked={lang === l}
                  lang={l}
                  onClick={() => setLang(l)}
                  className={`min-h-[2.75rem] rounded-full font-semibold text-sm transition-all ${lang === l ? 'bg-surface shadow-soft' : 'text-muted'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label={t('nav.main')}>
            {items.map((it, i) => (
              <button
                key={it.to}
                onClick={() => go(it.to)}
                className="w-full flex items-center gap-3 px-3 min-h-[3.25rem] rounded-2xl hover:bg-sunk text-left rise"
                style={{ '--i': i }}
              >
                <span className="w-9 h-9 rounded-xl bg-surface border border-line/70 grid place-items-center shrink-0"><Icon name={it.icon} size={19} /></span>
                <span className="flex-1 font-medium min-w-0 truncate">{t(it.k)}</span>
                {it.meta && <span className="text-xs font-semibold text-muted tabular-nums">{it.meta}</span>}
              </button>
            ))}
          </nav>
          <p className="px-5 py-4 text-xs text-muted border-t border-line/60 leading-relaxed">{t('footer')}</p>
        </aside>
      </div>
    );
  }
}
