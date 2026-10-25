// Simple flat illustrations for lessons (inline SVG, viewBox 0 0 160 100).
const ROAD = '#4B5563';
const SKY = '#E7EFEA';
const TEAL = '#0B5E4F';
const AMBER = '#D97706';
const RED = '#C8102E';
const INK = '#16201D';

const Frame = ({ children }) => (
  <>
    <rect width="160" height="100" rx="14" fill={SKY} />
    {children}
  </>
);
const Road = ({ dashes = true }) => (
  <>
    <rect x="0" y="40" width="160" height="44" fill={ROAD} />
    {dashes && <line x1="0" y1="62" x2="160" y2="62" stroke="#fff" strokeWidth="3" strokeDasharray="12 10" />}
  </>
);
const Car = ({ x, y, c = TEAL, flip = false }) => (
  <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
    <rect x="0" y="6" width="34" height="11" rx="4" fill={c} />
    <path d="M6 6 L11 -1 H24 L29 6 Z" fill={c} />
    <rect x="12" y="0.5" width="10" height="5" rx="1" fill="#CFE3F5" />
    <circle cx="8" cy="18" r="4" fill={INK} />
    <circle cx="26" cy="18" r="4" fill={INK} />
  </g>
);
const Arrow = ({ d, c = AMBER }) => (
  <>
    <path d={d} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 0" />
  </>
);

const scenes = {
  keepLeft: () => (
    <Frame>
      <Road />
      <Car x={30} y={64} />
      <Car x={100} y={42} c="#9CA3AF" flip />
      <text x="8" y="26" fontSize="14" fontWeight="700" fill={TEAL}>← LEFT</text>
    </Frame>
  ),
  overtake: () => (
    <Frame>
      <Road />
      <Car x={40} y={64} c="#9CA3AF" />
      <Car x={92} y={42} />
      <Arrow d="M30 72 C 60 72, 70 50, 120 50" />
      <polygon points="118,44 128,50 118,56" fill={AMBER} />
    </Frame>
  ),
  helmet: () => (
    <Frame>
      <path d="M48 66 a32 32 0 0 1 64 0 z" fill={TEAL} />
      <rect x="44" y="64" width="72" height="10" rx="5" fill={INK} />
      <path d="M86 50 h22 v12 h-22 z" fill="#CFE3F5" />
      <path d="M58 74 q22 18 44 0" fill="none" stroke={INK} strokeWidth="3" />
    </Frame>
  ),
  seatbelt: () => (
    <Frame>
      <rect x="54" y="20" width="52" height="70" rx="12" fill="#9CA3AF" />
      <circle cx="80" cy="30" r="10" fill="#6B4F3A" />
      <rect x="64" y="42" width="32" height="40" rx="8" fill={TEAL} />
      <line x1="62" y1="40" x2="100" y2="86" stroke={AMBER} strokeWidth="7" strokeLinecap="round" />
    </Frame>
  ),
  phone: () => (
    <Frame>
      <rect x="62" y="16" width="36" height="68" rx="7" fill={INK} />
      <rect x="66" y="24" width="28" height="48" rx="2" fill="#CFE3F5" />
      <circle cx="80" cy="50" r="40" fill="none" stroke={RED} strokeWidth="7" />
      <line x1="52" y1="22" x2="108" y2="78" stroke={RED} strokeWidth="7" />
    </Frame>
  ),
  signal: () => (
    <Frame>
      <rect x="64" y="8" width="32" height="84" rx="10" fill={INK} />
      <circle cx="80" cy="26" r="10" fill={RED} />
      <circle cx="80" cy="50" r="10" fill="#7a5a14" />
      <circle cx="80" cy="74" r="10" fill="#1f4d2b" />
    </Frame>
  ),
  ambulance: () => (
    <Frame>
      <Road />
      <g transform="translate(78 44)">
        <rect x="0" y="0" width="54" height="24" rx="4" fill="#fff" stroke={INK} strokeWidth="1.5" />
        <rect x="34" y="-6" width="10" height="6" fill={RED} />
        <rect x="14" y="6" width="12" height="4" fill={RED} />
        <rect x="18" y="2" width="4" height="12" fill={RED} />
        <circle cx="12" cy="26" r="4.5" fill={INK} />
        <circle cx="42" cy="26" r="4.5" fill={INK} />
      </g>
      <Car x={18} y={64} />
      <Arrow d="M40 62 C 30 74 22 78 14 80" />
    </Frame>
  ),
  zebra: () => (
    <Frame>
      <Road dashes={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="66" y={42 + i * 7} width="28" height="4" fill="#fff" />
      ))}
      <g transform="translate(80 20)" stroke={INK} strokeWidth="3" strokeLinecap="round">
        <circle cx="0" cy="0" r="5" fill={INK} stroke="none" />
        <line x1="0" y1="6" x2="0" y2="20" />
        <line x1="0" y1="10" x2="-6" y2="16" />
        <line x1="0" y1="10" x2="6" y2="14" />
        <line x1="0" y1="20" x2="-5" y2="30" />
        <line x1="0" y1="20" x2="6" y2="29" />
      </g>
      <Car x={14} y={52} />
    </Frame>
  ),
  quiet: () => (
    <Frame>
      <rect x="20" y="30" width="56" height="54" fill="#fff" stroke={INK} strokeWidth="2" />
      <rect x="42" y="42" width="12" height="30" fill={RED} />
      <rect x="33" y="51" width="30" height="12" fill={RED} />
      <circle cx="116" cy="56" r="26" fill="#fff" stroke={RED} strokeWidth="6" />
      <polygon points="102,50 110,50 124,40 124,72 110,62 102,62" fill={INK} />
      <line x1="98" y1="38" x2="134" y2="74" stroke={RED} strokeWidth="6" />
    </Frame>
  ),
  checkIn: () => (
    <Frame>
      <rect x="36" y="24" width="88" height="62" rx="4" fill="#fff" stroke={INK} strokeWidth="2" />
      <rect x="36" y="16" width="88" height="14" rx="3" fill={TEAL} />
      <text x="80" y="27" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">RTO</text>
      <rect x="70" y="56" width="20" height="30" fill={TEAL} />
      <rect x="46" y="40" width="16" height="12" fill="#CFE3F5" />
      <rect x="98" y="40" width="16" height="12" fill="#CFE3F5" />
    </Frame>
  ),
  track8: () => (
    <Frame>
      <path d="M80 50 C 60 20, 26 20, 26 50 C 26 80, 60 80, 80 50 C 100 20, 134 20, 134 50 C 134 80, 100 80, 80 50 Z" fill="none" stroke={ROAD} strokeWidth="14" />
      <path d="M80 50 C 60 20, 26 20, 26 50 C 26 80, 60 80, 80 50 C 100 20, 134 20, 134 50 C 134 80, 100 80, 80 50 Z" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 6" />
      <circle cx="45" cy="26" r="5" fill={AMBER} />
    </Frame>
  ),
  trackH: () => (
    <Frame>
      <path d="M50 14 V86 M110 14 V86 M50 50 H110" stroke={ROAD} strokeWidth="16" fill="none" />
      {[[40, 14], [60, 14], [100, 14], [120, 14], [40, 86], [60, 86], [100, 86], [120, 86]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={AMBER} />
      ))}
    </Frame>
  ),
  road: () => (
    <Frame>
      <path d="M50 100 L72 20 H88 L110 100 Z" fill={ROAD} />
      <path d="M80 96 V26" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" />
      <Car x={58} y={70} />
      <rect x="122" y="18" width="12" height="32" rx="4" fill={INK} />
      <circle cx="128" cy="26" r="3.5" fill={RED} />
      <circle cx="128" cy="34" r="3.5" fill="#7a5a14" />
      <circle cx="128" cy="42" r="3.5" fill="#22a04b" />
    </Frame>
  ),
};

export default function Illus({ name, className = '' }) {
  const S = scenes[name];
  if (!S) return null;
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden="true" focusable="false">
      <S />
    </svg>
  );
}
