import { useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
// Small animated illustrations for service tiles (inline SVG, viewBox 0 0 80 64).
// Animations use CSS classes from index.css (transform/opacity only) and stop for reduced motion.
const INK = 'rgb(var(--ink))';
const BRAND = 'rgb(var(--brand))';
const SUN = 'rgb(var(--sun))';
const PAPER = 'rgb(var(--surface))';
const RED = '#C8102E';

const art = {
  lplate: () => (
    <g className="a-swing">
      <line x1="40" y1="4" x2="40" y2="12" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="24" y="12" width="32" height="34" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M34 20v18h12" fill="none" stroke={RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  card: () => (
    <g>
      <defs>
        <clipPath id="cardclip"><rect x="14" y="14" width="52" height="34" rx="6" /></clipPath>
      </defs>
      <g className="a-float">
        <rect x="14" y="14" width="52" height="34" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />
        <rect x="20" y="22" width="12" height="15" rx="2" fill={BRAND} opacity=".85" />
        <rect x="36" y="23" width="22" height="3" rx="1.5" fill={INK} opacity=".7" />
        <rect x="36" y="29" width="16" height="3" rx="1.5" fill={INK} opacity=".35" />
        <rect x="36" y="35" width="19" height="3" rx="1.5" fill={INK} opacity=".35" />
        <g clipPath="url(#cardclip)">
          <rect className="a-shine" x="0" y="8" width="10" height="50" fill="#fff" opacity=".55" transform="skewX(-20)" />
        </g>
      </g>
    </g>
  ),
  addcar: () => (
    <g>
      <line x1="6" y1="50" x2="74" y2="50" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".3" />
      <g className="a-drive">
        <rect x="18" y="30" width="38" height="12" rx="4" fill={BRAND} />
        <path d="M24 30l5-8h16l5 8z" fill={BRAND} />
        <rect x="30" y="24" width="12" height="5" rx="1" fill={PAPER} opacity=".8" />
        <circle cx="26" cy="44" r="4.5" fill={INK} />
        <circle cx="48" cy="44" r="4.5" fill={INK} />
      </g>
      <g className="a-bounce">
        <circle cx="64" cy="18" r="9" fill={SUN} />
        <path d="M64 13v10M59 18h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  ),
  renew: () => (
    <g>
      <rect x="27" y="22" width="26" height="20" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="31" y="27" width="7" height="9" rx="1.5" fill={BRAND} />
      <rect x="41" y="28" width="9" height="2.5" rx="1.2" fill={INK} opacity=".5" />
      <g className="a-spin">
        <path d="M58 32a18 18 0 0 1-30 13" fill="none" stroke={BRAND} strokeWidth="3" strokeLinecap="round" />
        <path d="M22 32a18 18 0 0 1 30-13" fill="none" stroke={SUN} strokeWidth="3" strokeLinecap="round" />
        <path d="M52 13l1 7-7-1" fill="none" stroke={SUN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 51l-1-7 7 1" fill="none" stroke={BRAND} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  ),
  lost: () => (
    <g>
      <rect x="10" y="20" width="40" height="26" rx="5" fill={PAPER} stroke={INK} strokeWidth="2" strokeDasharray="4 3" />
      <rect x="15" y="26" width="9" height="12" rx="2" fill={INK} opacity=".2" />
      <g className="a-drive">
        <circle cx="48" cy="28" r="11" fill={PAPER} fillOpacity=".6" stroke={BRAND} strokeWidth="3" />
        <line x1="56" y1="36" x2="65" y2="45" stroke={BRAND} strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  ),
  pin: () => (
    <g>
      <path d="M18 52V36l14-11 14 11v16z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="28" y="42" width="8" height="10" fill={BRAND} opacity=".8" />
      <ellipse cx="57" cy="54" rx="7" ry="2" fill={INK} opacity=".15" />
      <g className="a-bounce">
        <path d="M57 50c-8-9-11-14-11-19a11 11 0 0 1 22 0c0 5-3 10-11 19z" fill={SUN} />
        <circle cx="57" cy="31" r="4" fill="#fff" />
      </g>
    </g>
  ),
  plane: () => (
    <g>
      <circle cx="40" cy="34" r="20" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M20 34h40M40 14c-8 8-8 32 0 40M40 14c8 8 8 32 0 40" fill="none" stroke={INK} strokeWidth="1.5" opacity=".35" />
      <path d="M10 46 Q40 0 72 22" fill="none" stroke={BRAND} strokeWidth="1.5" strokeDasharray="3 4" opacity=".6" />
      <g>
        <path d="M0 0l10 4-10 4 2-4z" fill={SUN} transform="translate(-5 -4)">
          <animateMotion dur="4s" repeatCount="indefinite" rotate="auto" path="M10 46 Q40 0 72 22" />
        </path>
      </g>
    </g>
  ),
  route: () => (
    <g>
      <path id="routep" d="M10 50 C 26 50 22 18 40 18 S 58 46 70 14" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="4 4" opacity=".35" />
      <circle cx="10" cy="50" r="4" fill={BRAND} />
      <path d="M70 14c-4-5-6-8-6-10a6 6 0 0 1 12 0c0 2-2 5-6 10z" fill={SUN} transform="translate(0 2)" />
      <circle r="4.5" fill={BRAND}>
        <animateMotion dur="3.6s" repeatCount="indefinite" path="M10 50 C 26 50 22 18 40 18 S 58 46 70 14" />
      </circle>
    </g>
  ),
  steer: () => (
    <g className="a-swing" style={{ transformOrigin: '50% 50%' }}>
      <circle cx="40" cy="32" r="21" fill="none" stroke={INK} strokeWidth="5" />
      <circle cx="40" cy="32" r="6" fill={BRAND} />
      <path d="M21 30h13M46 30h13M40 38v15" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  signal: () => (
    <g>
      <rect x="31" y="6" width="18" height="46" rx="8" fill={INK} />
      <circle className="l-red" cx="40" cy="16" r="5" fill="#E5484D" />
      <circle className="l-amb" cx="40" cy="29" r="5" fill="#F5A524" />
      <circle className="l-grn" cx="40" cy="42" r="5" fill="#30A46C" />
      <line x1="40" y1="52" x2="40" y2="60" stroke={INK} strokeWidth="3" />
    </g>
  ),
  ticks: () => (
    <g>
      <rect x="20" y="8" width="40" height="50" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="26" y={18 + i * 12} width="7" height="7" rx="2" fill="none" stroke={INK} strokeWidth="1.5" opacity=".5" />
          <path className="a-draw" style={{ '--i': i }} d={`M26 ${21 + i * 12}l3 3 6-7`} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="38" y={20 + i * 12} width="16" height="3" rx="1.5" fill={INK} opacity=".3" />
        </g>
      ))}
    </g>
  ),
  screen: () => (
    <g>
      <rect x="12" y="10" width="56" height="36" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M6 52h68" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle className="a-blink" cx="40" cy="14" r="1.6" fill={RED} />
      <rect x="18" y="20" width="26" height="3" rx="1.5" fill={INK} opacity=".55" />
      <rect x="18" y="27" width="20" height="3" rx="1.5" fill={INK} opacity=".25" />
      <rect x="18" y="34" width="22" height="3" rx="1.5" fill={INK} opacity=".25" />
      <circle cx="56" cy="30" r="7" fill="none" stroke={INK} strokeWidth="2" opacity=".2" />
      <circle cx="56" cy="30" r="7" fill="none" stroke={SUN} strokeWidth="2.5" strokeDasharray="44" strokeDashoffset="14" className="a-spin" />
    </g>
  ),
  eight: () => (
    <g>
      <path d="M40 32 C 30 16, 10 16, 10 32 C 10 48, 30 48, 40 32 C 50 16, 70 16, 70 32 C 70 48, 50 48, 40 32 Z" fill="none" stroke={INK} strokeWidth="7" opacity=".14" />
      <path d="M40 32 C 30 16, 10 16, 10 32 C 10 48, 30 48, 40 32 C 50 16, 70 16, 70 32 C 70 48, 50 48, 40 32 Z" fill="none" stroke={INK} strokeWidth="1" strokeDasharray="3 3" opacity=".4" />
      <circle r="4.5" fill={BRAND}>
        <animateMotion dur="5s" repeatCount="indefinite" path="M40 32 C 30 16, 10 16, 10 32 C 10 48, 30 48, 40 32 C 50 16, 70 16, 70 32 C 70 48, 50 48, 40 32 Z" />
      </circle>
    </g>
  ),
  office: () => (
    <g>
      <path d="M14 54V26l26-14 26 14v28z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 54V32M32 54V32M48 54V32M58 54V32" stroke={INK} strokeWidth="3" opacity=".35" />
      <path d="M10 56h60" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <text x="40" y="27" textAnchor="middle" fontSize="8" fontWeight="800" fill={INK}>RTO</text>
      <g className="a-bounce">
        <circle cx="62" cy="16" r="10" fill="rgb(var(--ok))" />
        <path d="M57 16l3.5 3.5L67 12.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  ),
  help: () => (
    <g>
      <g className="a-float">
        <path d="M14 14h40a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H32l-10 8v-8h-8a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <rect x="16" y="24" width="30" height="3" rx="1.5" fill={INK} opacity=".55" />
        <rect x="16" y="31" width="22" height="3" rx="1.5" fill={INK} opacity=".3" />
      </g>
      <g className="a-bounce">
        <circle cx="62" cy="44" r="9" fill={BRAND} />
        <path d="M58.5 44.5l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  ),
  idscan: () => (
    <g>
      <rect x="10" y="12" width="60" height="40" rx="7" fill={PAPER} stroke={INK} strokeWidth="2" />
      <circle cx="26" cy="28" r="6" fill={BRAND} opacity=".85" />
      <path d="M17 44c2-6 16-6 18 0" fill={BRAND} opacity=".85" />
      <rect x="40" y="24" width="22" height="3" rx="1.5" fill={INK} opacity=".7" />
      <rect x="40" y="31" width="16" height="3" rx="1.5" fill={INK} opacity=".35" />
      <rect x="40" y="38" width="19" height="3" rx="1.5" fill={INK} opacity=".35" />
      <g className="a-scan">
        <rect x="8" y="14" width="64" height="2.5" rx="1.2" fill={SUN} />
      </g>
    </g>
  ),
};

export default function TileArt({ name, className = '' }) {
  const A = art[name];
  const ref = useRef(null);
  const { state } = useStore();
  const still = state.settings.motion === false || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  // Path animations (SMIL) are not covered by CSS, so pause them here when motion is off
  useEffect(() => {
    const svg = ref.current;
    if (!svg?.pauseAnimations) return;
    if (still) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }, [still]);
  if (!A) return null;
  return (
    <svg ref={ref} viewBox="0 0 80 64" className={className} aria-hidden="true" focusable="false">
      <A />
    </svg>
  );
}
