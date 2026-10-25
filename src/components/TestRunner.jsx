import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.js';
import { config } from '../data/config.js';
import { Listen } from './ui.jsx';
import Icon from './Icon.jsx';
import Sign from './Sign.jsx';

const LETTERS = ['A', 'B', 'C', 'D'];

// Timed test that works like the real online learner's test.
// variant 'app' = calm Licence Saathi style, 'official' = plain government-style layout for rehearsal.
export default function TestRunner({ questions, onFinish, onQuit, variant = 'app' }) {
  const { t, L } = useI18n();
  const sec = config.test.secondsPerQuestion;
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [left, setLeft] = useState(sec);
  const [showPalette, setShowPalette] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const q = questions[i];
  const last = i === questions.length - 1;

  const advance = () => {
    if (last) onFinish(answersRef.current);
    else {
      setI((n) => n + 1);
      setLeft(sec);
    }
  };

  // Countdown; when it hits zero the test moves on, like the real one
  useEffect(() => {
    if (left <= 0) {
      advance();
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const choose = (k) => setAnswers((a) => a.map((v, n) => (n === i ? k : v)));
  const answeredN = answers.filter((a) => a !== null).length;
  const low = left <= 10;

  if (variant === 'official') {
    return (
      <div className="h-full flex flex-col bg-[#f2f2f2] text-black font-sans">
        <div className="bg-[#1d3c6e] text-white px-3 py-2 flex items-center gap-2 text-sm">
          <span className="font-bold flex-1 truncate">{t('td.official')}</span>
          <span className="flex items-center gap-1 bg-black/30 rounded px-2 py-0.5"><Icon name="camera" size={14} /> {t('td.camera')}</span>
        </div>
        <div className="px-3 py-2 flex items-center justify-between border-b border-[#bbb] bg-white text-sm font-semibold">
          <span>{t('td.qNo', { n: i + 1, total: questions.length })}</span>
          <span className={low ? 'text-[#b00]' : ''}>{t('td.timeLeft')}: 00:{String(left).padStart(2, '0')}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 bg-white m-2 border border-[#bbb]">
          {q.sign && <Sign id={q.sign} size={96} className="mb-2" />}
          <p className="font-semibold text-lg">{L(q.q)}</p>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label={L(q.q)}>
            {q.options.map((o, k) => (
              <label key={k} className="flex items-center gap-3 min-h-[3rem] px-2 border border-[#ccc] cursor-pointer has-[:checked]:bg-[#e6eefb]">
                <input type="radio" name={`oq-${i}`} checked={answers[i] === k} onChange={() => choose(k)} className="w-5 h-5" />
                <span>{L(o)}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="p-2 flex gap-2 bg-[#f2f2f2]">
          <button className="flex-1 min-h-[3rem] bg-[#e0e0e0] border border-[#999] font-semibold" onClick={onQuit}>{t('td.exit')}</button>
          <button className="flex-1 min-h-[3rem] bg-[#1d3c6e] text-white font-semibold" onClick={advance}>{last ? t('td.submit') : t('c.next')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col fade-in">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold flex-1">{t('mk.q', { n: i + 1, total: questions.length })}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold text-sm ${low ? 'bg-bad-soft text-bad' : 'bg-sunk text-ink'}`}
            aria-label={t('mk.secs', { s: left })}
          >
            <Icon name="clock" size={16} /> {left}s
          </span>
          <button className="chip min-h-[2.5rem]" onClick={() => setShowPalette((v) => !v)} aria-expanded={showPalette}>
            {answeredN}/{questions.length}
          </button>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-sunk overflow-hidden" aria-hidden="true">
          <div className={`h-full ${low ? 'bg-bad' : 'bg-brand'} transition-all duration-1000 ease-linear`} style={{ width: `${(left / sec) * 100}%` }} />
        </div>
        {showPalette && (
          <div className="mt-2 grid grid-cols-8 gap-1.5" aria-label={t('mk.palette')}>
            {questions.map((_, n) => (
              <span
                key={n}
                className={`h-8 rounded-lg grid place-items-center text-xs font-bold border ${n === i ? 'border-brand border-2' : 'border-line'} ${answers[n] !== null ? 'bg-brand text-on-brand' : 'bg-surface text-muted'}`}
                aria-label={`${n + 1}: ${answers[n] !== null ? '✓' : t('mk.unanswered')}`}
              >
                {n + 1}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        <div className="card p-3" key={q.id}>
          {q.sign && <Sign id={q.sign} size={100} className="mx-auto mb-2" />}
          <p className="text-lg font-semibold leading-snug">{L(q.q)}</p>
          <div className="mt-2"><Listen small text={`${L(q.q)} ${q.options.map((o, k) => `${LETTERS[k]}. ${L(o)}`).join('. ')}`} /></div>
        </div>
        <div className="mt-3 space-y-2" role="radiogroup" aria-label={L(q.q)}>
          {q.options.map((o, k) => {
            const on = answers[i] === k;
            return (
              <button
                key={k}
                role="radio"
                aria-checked={on}
                onClick={() => choose(k)}
                className={`w-full flex items-center gap-3 text-left min-h-[3.25rem] px-3 py-2 rounded-2xl border-2 ${on ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:bg-sunk'}`}
              >
                <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center font-bold text-sm ${on ? 'bg-brand text-on-brand' : 'bg-sunk'}`}>{LETTERS[k]}</span>
                <span className="font-medium">{L(o)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-line flex gap-2">
        {confirm ? (
          <>
            <p className="flex-1 text-sm font-semibold">{t('mk.confirmFinish')}</p>
            <button className="btn-secondary px-3" onClick={() => setConfirm(false)}>{t('c.cancel')}</button>
            <button className="btn-primary px-3" onClick={() => onFinish(answersRef.current)}>{t('mk.finish')}</button>
          </>
        ) : (
          <>
            <button className="btn-secondary px-3" onClick={() => (answeredN < questions.length ? setConfirm(true) : onFinish(answersRef.current))}>
              {t('mk.finish')}
            </button>
            <button className="btn-primary flex-1" onClick={advance}>
              {last ? t('mk.finish') : t('c.next')} <Icon name="right" size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
