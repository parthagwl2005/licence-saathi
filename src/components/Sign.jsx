import { signById } from '../data/signs.js';
import { useI18n } from '../i18n/index.js';

// Indian road signs drawn as inline SVG (viewBox 0 0 100 100). No image downloads.
const RED = '#C8102E';
const BLUE = '#0B4EA2';
const INK = '#111';

const Ring = ({ children, fill = '#fff' }) => (
  <>
    <circle cx="50" cy="50" r="44" fill={fill} stroke={RED} strokeWidth="10" />
    {children}
  </>
);
const Slash = () => <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="9" />;
const Tri = ({ children }) => (
  <>
    <polygon points="50,8 94,86 6,86" fill="#fff" stroke={RED} strokeWidth="9" strokeLinejoin="round" />
    {children}
  </>
);
const Info = ({ children }) => (
  <>
    <rect x="8" y="8" width="84" height="84" rx="10" fill={BLUE} />
    {children}
  </>
);
const Car = ({ x, y, fill = INK, w = 22 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="0" y="6" width={w} height="10" rx="3" fill={fill} />
    <path d={`M4 6 L7 0 H${w - 7} L${w - 4} 6 Z`} fill={fill} />
    <circle cx="5" cy="17" r="3" fill={fill} />
    <circle cx={w - 5} cy="17" r="3" fill={fill} />
  </g>
);
const Person = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK} stroke={INK} strokeWidth="4" strokeLinecap="round">
    <circle cx="0" cy="0" r="5" stroke="none" />
    <line x1="0" y1="7" x2="0" y2="22" />
    <line x1="0" y1="12" x2="-7" y2="18" />
    <line x1="0" y1="12" x2="7" y2="16" />
    <line x1="0" y1="22" x2="-6" y2="32" />
    <line x1="0" y1="22" x2="6" y2="32" />
  </g>
);

const draw = {
  stop: () => (
    <>
      <polygon points="31,6 69,6 94,31 94,69 69,94 31,94 6,69 6,31" fill={RED} stroke="#fff" strokeWidth="3" />
      <text x="50" y="60" textAnchor="middle" fontSize="27" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">STOP</text>
    </>
  ),
  'give-way': () => <polygon points="8,12 92,12 50,90" fill="#fff" stroke={RED} strokeWidth="9" strokeLinejoin="round" />,
  'no-entry': () => (
    <>
      <circle cx="50" cy="50" r="46" fill={RED} />
      <rect x="20" y="42" width="60" height="16" fill="#fff" />
    </>
  ),
  'no-u-turn': () => (
    <Ring>
      <path d="M60 74 V42 A11 11 0 0 0 38 42 V58" fill="none" stroke={INK} strokeWidth="7" />
      <polygon points="29,56 47,56 38,70" fill={INK} />
      <Slash />
    </Ring>
  ),
  'no-overtaking': () => (
    <Ring>
      <Car x={22} y={40} fill={INK} w={24} />
      <Car x={53} y={40} fill={RED} w={24} />
      <Slash />
    </Ring>
  ),
  'no-parking': () => (
    <Ring>
      <text x="50" y="66" textAnchor="middle" fontSize="44" fontWeight="800" fill={INK} fontFamily="Arial, sans-serif">P</text>
      <Slash />
    </Ring>
  ),
  'horn-prohibited': () => (
    <Ring>
      <polygon points="28,44 40,44 62,30 62,70 40,56 28,56" fill={INK} />
      <path d="M68 40 Q74 50 68 60" fill="none" stroke={INK} strokeWidth="4" />
      <Slash />
    </Ring>
  ),
  'speed-50': () => (
    <Ring>
      <text x="50" y="63" textAnchor="middle" fontSize="38" fontWeight="800" fill={INK} fontFamily="Arial, sans-serif">50</text>
    </Ring>
  ),
  'no-right-turn': () => (
    <Ring>
      <path d="M40 76 V48 H58" fill="none" stroke={INK} strokeWidth="8" />
      <polygon points="56,37 72,48 56,59" fill={INK} />
      <Slash />
    </Ring>
  ),
  'keep-left': () => (
    <>
      <circle cx="50" cy="50" r="45" fill={BLUE} stroke="#fff" strokeWidth="3" />
      <line x1="66" y1="30" x2="40" y2="60" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <polygon points="26,74 30,50 48,66" fill="#fff" />
    </>
  ),
  'right-curve': () => (
    <Tri>
      <path d="M44 78 V60 Q44 46 58 42" fill="none" stroke={INK} strokeWidth="7" />
      <polygon points="56,33 68,42 56,51" fill={INK} />
    </Tri>
  ),
  hump: () => (
    <Tri>
      <path d="M26 74 Q50 40 74 74 Z" fill={INK} />
    </Tri>
  ),
  'cross-road': () => (
    <Tri>
      <line x1="50" y1="38" x2="50" y2="78" stroke={INK} strokeWidth="8" />
      <line x1="32" y1="60" x2="68" y2="60" stroke={INK} strokeWidth="8" />
    </Tri>
  ),
  school: () => (
    <Tri>
      <Person x={42} y={42} s={0.95} />
      <Person x={58} y={46} s={0.8} />
    </Tri>
  ),
  'pedestrian-crossing': () => (
    <Tri>
      <Person x={50} y={38} s={0.95} />
      <rect x="30" y="74" width="40" height="5" fill={INK} />
    </Tri>
  ),
  'narrow-road': () => (
    <Tri>
      <path d="M36 80 L44 60 L44 42" fill="none" stroke={INK} strokeWidth="6" />
      <path d="M64 80 L56 60 L56 42" fill="none" stroke={INK} strokeWidth="6" />
    </Tri>
  ),
  slippery: () => (
    <Tri>
      <Car x={38} y={38} fill={INK} w={24} />
      <path d="M36 70 q4 -6 8 0 t8 0" fill="none" stroke={INK} strokeWidth="4" />
      <path d="M52 76 q4 -6 8 0 t8 0" fill="none" stroke={INK} strokeWidth="4" />
    </Tri>
  ),
  hospital: () => (
    <Info>
      <rect x="26" y="26" width="48" height="48" rx="4" fill="#fff" />
      <rect x="44" y="32" width="12" height="36" fill={RED} />
      <rect x="32" y="44" width="36" height="12" fill={RED} />
    </Info>
  ),
  parking: () => (
    <Info>
      <text x="50" y="72" textAnchor="middle" fontSize="60" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">P</text>
    </Info>
  ),
  fuel: () => (
    <Info>
      <rect x="30" y="26" width="28" height="50" rx="4" fill="#fff" />
      <rect x="35" y="32" width="18" height="12" fill={BLUE} />
      <path d="M58 40 H66 V64 a4 4 0 0 0 8 0 V44 L68 36" fill="none" stroke="#fff" strokeWidth="5" />
      <rect x="26" y="74" width="36" height="5" fill="#fff" />
    </Info>
  ),
  eating: () => (
    <Info>
      <path d="M38 24 V48 M32 24 V40 a6 6 0 0 0 12 0 V24 M38 48 V78" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 78 V24 c-8 6 -10 16 -8 26 h8" fill="#fff" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
    </Info>
  ),
};

export default function Sign({ id, size = 120, className = '', decorative = false }) {
  const { L } = useI18n();
  const s = signById[id];
  const D = draw[id];
  if (!D) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : s ? L(s.name) : id}
    >
      <D />
    </svg>
  );
}
