import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/index.js';
import { Tabs } from './ui.jsx';
import Icon from './Icon.jsx';
import { findNumber } from '../data/rules.js';

// "Where do I find this?" — simple diagrams of documents with the right spot highlighted.
// These are deliberately simplified sample drawings, not copies of real government cards.
const SPOT = 'rgb(var(--sun))';
const LINE = 'rgb(var(--ink))';

function Card({ children, title }) {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" role="img" aria-label={title}>
      <rect x="6" y="6" width="308" height="188" rx="16" fill="rgb(var(--surface))" stroke={LINE} strokeOpacity=".35" strokeWidth="2" />
      <rect x="6" y="6" width="308" height="34" rx="16" fill="rgb(var(--brand))" />
      <rect x="6" y="26" width="308" height="14" fill="rgb(var(--brand))" />
      <text x="160" y="186" textAnchor="middle" fontSize="11" fontWeight="700" fill={LINE} opacity=".35" letterSpacing="3">SAMPLE · नमूना</text>
      {children}
    </svg>
  );
}
const Bar = ({ x, y, w, o = 0.35 }) => <rect x={x} y={y} width={w} height="7" rx="3.5" fill={LINE} opacity={o} />;
const Pulse = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="8" fill="none" stroke={SPOT} strokeWidth="3.5" />
    <rect className="a-blink" x={x} y={y} width={w} height={h} rx="8" fill={SPOT} opacity=".18" />
  </g>
);

const drawings = {
  dl: (t) => (
    <Card title={t('dg.dlTitle')}>
      <text x="20" y="28" fontSize="12" fontWeight="700" fill="rgb(var(--on-brand))">DRIVING LICENCE</text>
      <rect x="20" y="54" width="62" height="78" rx="6" fill={LINE} opacity=".12" />
      <circle cx="51" cy="82" r="14" fill={LINE} opacity=".25" />
      <text x="96" y="64" fontSize="10" fill={LINE} opacity=".6">DL No.</text>
      <text x="96" y="80" fontSize="15" fontWeight="700" fontFamily="monospace" fill={LINE}>XX00 0000 0000000</text>
      <Pulse x="90" y="52" w="210" h="36" />
      <Bar x={96} y={98} w={120} /><Bar x={96} y={112} w={90} /><Bar x={96} y={126} w={140} /><Bar x={20} y={146} w={180} o={0.2} />
    </Card>
  ),
  rc: (t) => (
    <Card title={t('dg.rcTitle')}>
      <text x="20" y="28" fontSize="12" fontWeight="700" fill="rgb(var(--on-brand))">REGISTRATION CERTIFICATE</text>
      <Bar x={20} y={56} w={120} />
      <text x="20" y="88" fontSize="10" fill={LINE} opacity=".6">Chassis No.</text>
      <text x="20" y="104" fontSize="13" fontWeight="700" fontFamily="monospace" fill={LINE}>XXXXXXXXXXXXXXXXX</text>
      <Pulse x="14" y="76" w="200" h="36" />
      <text x="20" y="132" fontSize="10" fill={LINE} opacity=".6">Engine No.</text>
      <text x="20" y="148" fontSize="13" fontWeight="700" fontFamily="monospace" fill={LINE}>XXXXXXXXXX</text>
      <Bar x={230} y={56} w={70} /><Bar x={230} y={70} w={50} />
    </Card>
  ),
};

export default function DocGuide({ doc = 'dl', onClose }) {
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const [tab, setTab] = useState(doc);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="dg-h">
      <button className="absolute inset-0 bg-ink/35 scrim-in" onClick={onClose} aria-label={t('c.close')} tabIndex={-1} />
      <div className="relative w-full max-w-app bg-bg rounded-t-4xl p-5 pb-6 sheet-in shadow-lift max-h-[88vh] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-line mx-auto mb-3" aria-hidden="true" />
        <div className="flex items-start justify-between gap-2">
          <h2 id="dg-h" className="font-display text-[1.7rem] leading-tight">{t('dg.title')}</h2>
          <button onClick={onClose} className="w-11 h-11 rounded-full grid place-items-center hover:bg-sunk shrink-0" aria-label={t('c.close')}><Icon name="x" /></button>
        </div>
        <div className="mt-3">
          <Tabs label={t('dg.title')} value={tab} onChange={setTab} tabs={[{ value: 'dl', label: t('dg.dl') }, { value: 'rc', label: t('dg.rc') }]} />
        </div>
        <div className="mt-3 rounded-3xl bg-sunk p-3">{drawings[tab](t)}</div>
        <p className="mt-2 text-sm">{t(tab === 'dl' ? 'dg.dlHint' : 'dg.rcHint')}</p>
        {tab === 'dl' && (
          <>
            <h3 className="font-semibold mt-4">{t('dg.lostCard')}</h3>
            <ul className="mt-2 divide-y divide-line/70">
              {findNumber.map((f) => (
                <li key={f.id} className="py-2.5 flex gap-3">
                  <Icon name={f.to ? 'chat' : 'check'} size={18} className="text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{L(f.t)}</p>
                    <p className="text-sm text-muted leading-snug">{L(f.d)}</p>
                    {f.to && <button className="text-sm font-semibold text-brand mt-1 min-h-[2.25rem]" onClick={() => { onClose(); navigate(f.to); }}>{t('dg.writeIt')} →</button>}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
