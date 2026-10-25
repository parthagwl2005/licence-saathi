import { useState } from 'react';
import { useI18n } from '../i18n/index.js';
import Icon from './Icon.jsx';
import DocGuide from './DocGuide.jsx';

// Driving licence number: 2-letter state + 2-digit RTO + 4-digit year + 7-digit number (15 characters).
const STATES = ['AN','AP','AR','AS','BR','CG','CH','DD','DL','GA','GJ','HP','HR','JH','JK','KA','KL','LA','LD','MH','ML','MN','MP','MZ','NL','OD','OR','PB','PY','RJ','SK','TN','TR','TS','UK','UP','WB'];
const TO_DIGIT = { O: '0', Q: '0', D: '0', I: '1', L: '1', Z: '2', S: '5', B: '8', G: '6' };
const TO_LETTER = { '0': 'O', '1': 'I', '5': 'S', '8': 'B', '2': 'Z' };
export const DL_GROUPS = [[0, 2], [2, 4], [4, 8], [8, 15]];

// Clean what was typed or scanned: capitals, no spaces or dashes, and fix look-alike characters by position
export function normalizeDl(raw) {
  const chars = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15).split('');
  let fixed = false;
  const out = chars.map((c, i) => {
    if (i < 2 && TO_LETTER[c]) { fixed = true; return TO_LETTER[c]; }
    if (i >= 2 && TO_DIGIT[c]) { fixed = true; return TO_DIGIT[c]; }
    return c;
  });
  return { value: out.join(''), fixed };
}

export function checkDl(v) {
  const year = Number(v.slice(4, 8));
  return [
    v.length >= 2 && STATES.includes(v.slice(0, 2)),
    v.length >= 4 && /^\d{2}$/.test(v.slice(2, 4)),
    v.length >= 8 && /^\d{4}$/.test(v.slice(4, 8)) && year >= 1950 && year <= new Date().getFullYear(),
    v.length === 15 && /^\d{7}$/.test(v.slice(8, 15)),
  ];
}
export const validDl = (v) => checkDl(v).every(Boolean);
export const formatDl = (v) => [v.slice(0, 4), v.slice(4, 8), v.slice(8, 15)].filter(Boolean).join(' ');

export default function NumberInput({ id = 'dlno', value, onChange, label }) {
  const { t } = useI18n();
  const [note, setNote] = useState(false);
  const [guide, setGuide] = useState(false);
  const ok = checkDl(value || '');
  const names = [t('ni.state'), t('ni.rto'), t('ni.year'), t('ni.number')];
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="label mb-1.5">{label || t('ni.label')}</label>
        <button type="button" className="text-sm font-semibold text-brand min-h-[2.5rem] px-1 flex items-center gap-1" onClick={() => setGuide(true)}>
          <Icon name="info" size={16} /> {t('ni.where')}
        </button>
      </div>
      <input
        id={id}
        className="field font-mono text-[min(1.125rem,5.2vw)] tracking-wide uppercase"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        placeholder="HR26 2019 0012345"
        value={formatDl(value || '')}
        aria-describedby={`${id}-parts`}
        onChange={(e) => {
          const { value: v, fixed } = normalizeDl(e.target.value);
          if (fixed) setNote(true);
          onChange(v);
        }}
      />
      <div id={`${id}-parts`} className="grid grid-cols-[1fr_1fr_1.4fr_2fr] gap-1.5 mt-2" aria-live="polite">
        {DL_GROUPS.map(([a, b], i) => {
          const part = (value || '').slice(a, b);
          return (
            <div key={i} className={`rounded-xl px-2 py-1.5 text-center border ${ok[i] ? 'border-ok/40 bg-ok-soft' : part ? 'border-warn/40 bg-warn-soft' : 'border-line bg-sunk'}`}>
              <div className="font-mono font-bold tracking-wider text-sm min-h-[1.25rem]">{part || '·'.repeat(b - a)}</div>
              <div className={`text-[0.68rem] font-semibold flex items-center justify-center gap-0.5 ${ok[i] ? 'text-ok' : 'text-muted'}`}>
                {ok[i] && <Icon name="check" size={10} strokeWidth={3} />}
                {names[i]}
              </div>
            </div>
          );
        })}
      </div>
      {note && <p className="text-xs text-ok font-semibold mt-1.5 flex items-center gap-1"><Icon name="check" size={12} strokeWidth={3} /> {t('ni.fixed')}</p>}
      {value && value.length === 15 && !validDl(value) && <p className="text-sm text-warn font-semibold mt-1.5" role="status">{t('ni.check')}</p>}
      {guide && <DocGuide doc="dl" onClose={() => setGuide(false)} />}
    </div>
  );
}
