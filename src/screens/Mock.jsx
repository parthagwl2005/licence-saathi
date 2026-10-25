import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Stuck, Listen, Pill } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Sign from '../components/Sign.jsx';
import TestRunner from '../components/TestRunner.jsx';
import { questions, topics } from '../data/questions.js';
import { config } from '../data/config.js';
import { stuck } from '../data/content.js';
import { sample } from '../utils.js';
import { readiness, scoreTest } from '../journey.js';

export default function Mock() {
  const { state, update } = useStore();
  const [mode, setMode] = useState('home'); // home | practice | test | result
  const [qs, setQs] = useState([]);
  const [result, setResult] = useState(null);

  const startTest = () => {
    setQs(sample(questions, config.test.count));
    setMode('test');
  };
  const finish = (answers) => {
    const r = scoreTest(qs, answers, config.test.passMark);
    update((s) => {
      s.tests.push({ at: new Date().toISOString(), ...r });
      s.tests = s.tests.slice(-20);
    });
    setResult({ ...r, answers, qs });
    setMode('result');
  };

  if (mode === 'test') return <TestRunner questions={qs} onFinish={finish} onQuit={() => setMode('home')} />;
  if (mode === 'practice') return <Practice onEnd={() => setMode('home')} />;
  if (mode === 'result') return <Result r={result} onAgain={startTest} onHome={() => setMode('home')} />;
  return <MockHome tests={state.tests} onPractice={() => setMode('practice')} onTest={startTest} />;
}

function Meter({ tests }) {
  const { t } = useI18n();
  const r = readiness(tests, config.test.passMark, config.test.count);
  const label = !r ? null : r.level === 'ready' ? t('mk.ready') : r.level === 'almost' ? t('mk.almost') : t('mk.notReady');
  const tone = !r ? 'neutral' : r.level === 'ready' ? 'ok' : r.level === 'almost' ? 'warn' : 'bad';
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold"><Tx k="mk.meter" inline /></span>
        {r && <Pill tone={tone} icon={r.level === 'ready' ? 'check' : 'clock'}>{label}</Pill>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-3 rounded-full bg-sunk overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r?.pct || 0} aria-label={t('mk.meter')}>
          <div className={`h-full rounded-full ${tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : tone === 'bad' ? 'bg-bad' : 'bg-line'}`} style={{ width: `${r?.pct || 0}%` }} />
        </div>
        <span className="font-bold w-12 text-right">{r ? `${r.pct}%` : '–'}</span>
      </div>
      <p className="text-xs text-muted mt-1">{t('mk.meterHint')}</p>
    </div>
  );
}

function MockHome({ tests, onPractice, onTest }) {
  const { t, fmtDate } = useI18n();
  const navigate = useNavigate();
  const recent = tests.slice(-4).reverse();
  return (
    <Screen title="mk.title">
      <div className="grid gap-2.5">
        <button onClick={onTest} className="text-left rounded-2xl bg-brand text-on-brand p-4 flex items-center gap-3 hover:brightness-110">
          <span className="w-11 h-11 rounded-xl bg-on-brand/15 grid place-items-center shrink-0"><Icon name="clock" /></span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-lg"><Tx k="mk.test" helperClass="opacity-90" /></span>
            <span className="block text-sm opacity-90">{t('mk.testSub', { count: config.test.count, sec: config.test.secondsPerQuestion, pass: config.test.passMark })}</span>
          </span>
          <Icon name="right" />
        </button>
        <button onClick={onPractice} className="card text-left p-4 flex items-center gap-3 hover:border-brand">
          <span className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><Icon name="sparkle" /></span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-lg"><Tx k="mk.practice" /></span>
            <span className="block text-sm text-muted">{t('mk.practiceSub')}</span>
          </span>
          <Icon name="right" />
        </button>
      </div>

      <div className="mt-3"><Meter tests={tests} /></div>

      <section className="mt-3">
        <h2 className="font-bold text-sm text-muted mb-1.5">{t('mk.history')}</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">{t('mk.noHistory')}</p>
        ) : (
          <ul className="card divide-y divide-line">
            {recent.map((x, n) => (
              <li key={n} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="flex-1">{fmtDate(new Date(x.at), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-semibold">{x.score}/{x.total}</span>
                <Pill tone={x.pass ? 'ok' : 'bad'} icon={x.pass ? 'check' : 'x'}>{x.pass ? t('mk.passShort') : t('mk.failShort')}</Pill>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button onClick={() => navigate('/test-day')} className="mt-3 w-full card p-3 flex items-center gap-3 text-left">
        <span className="w-9 h-9 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0"><Icon name="camera" size={20} /></span>
        <span className="flex-1 font-semibold"><Tx k="td.title" inline /> · <span className="font-normal text-muted">{t('td.sub')}</span></span>
        <Icon name="right" />
      </button>
      <Stuck items={stuck.test} className="mt-3" />
    </Screen>
  );
}

// Practice mode: instant feedback, no timer
function Practice({ onEnd }) {
  const { t, L } = useI18n();
  const [deck] = useState(() => sample(questions, questions.length));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [stats, setStats] = useState({ c: 0, n: 0 });
  const q = deck[i % deck.length];
  const answered = picked !== null;
  const right = picked === q.answer;

  const pick = (k) => {
    if (answered) return;
    setPicked(k);
    setStats((s) => ({ c: s.c + (k === q.answer ? 1 : 0), n: s.n + 1 }));
  };
  const next = () => { setPicked(null); setI(i + 1); };

  return (
    <div className="h-full flex flex-col fade-in">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <button onClick={onEnd} className="w-11 h-11 -ml-2 rounded-full grid place-items-center hover:bg-sunk" aria-label={t('mk.end')}><Icon name="x" /></button>
        <span className="font-bold flex-1"><Tx k="mk.practice" inline /></span>
        <span className="text-sm font-semibold text-muted" aria-live="polite">{t('mk.soFar', stats)}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        <div className="card p-3" key={q.id + i}>
          {q.sign && <Sign id={q.sign} size={100} className="mx-auto mb-2" />}
          <p className="text-lg font-semibold leading-snug">{L(q.q)}</p>
          <p className="text-xs text-muted mt-1">{L(topics[q.topic])}</p>
          <div className="mt-2"><Listen small text={`${L(q.q)} ${q.options.map((o) => L(o)).join('. ')}`} /></div>
        </div>
        <div className="mt-3 space-y-2">
          {q.options.map((o, k) => {
            const isRight = answered && k === q.answer;
            const isWrong = answered && k === picked && !right;
            return (
              <button
                key={k}
                onClick={() => pick(k)}
                disabled={answered}
                aria-pressed={picked === k}
                className={`w-full flex items-center gap-3 text-left min-h-[3.25rem] px-3 py-2 rounded-2xl border-2 ${
                  isRight ? 'border-ok bg-ok-soft' : isWrong ? 'border-bad bg-bad-soft' : 'border-line bg-surface hover:bg-sunk'
                } ${answered && !isRight && !isWrong ? 'opacity-60' : ''}`}
              >
                <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center ${isRight ? 'bg-ok text-on-brand' : isWrong ? 'bg-bad text-on-brand' : 'bg-sunk'}`}>
                  {isRight ? <Icon name="check" size={16} strokeWidth={3} /> : isWrong ? <Icon name="x" size={16} strokeWidth={3} /> : String.fromCharCode(65 + k)}
                </span>
                <span className="font-medium flex-1">{L(o)}</span>
                {isRight && <span className="text-ok font-bold text-sm">{t('mk.correct')}</span>}
                {isWrong && <span className="text-bad font-bold text-sm">{t('mk.wrong')}</span>}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`mt-3 rounded-2xl p-3 ${right ? 'bg-ok-soft' : 'bg-bad-soft'}`} role="status">
            <p className={`font-bold flex items-center gap-1 ${right ? 'text-ok' : 'text-bad'}`}>
              <Icon name={right ? 'check' : 'x'} size={18} strokeWidth={3} /> {right ? t('mk.correct') : t('mk.wrong')}
            </p>
            <p className="mt-0.5">{L(q.why)}</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-line flex gap-2">
        <button className="btn-secondary" onClick={onEnd}>{t('mk.end')}</button>
        <button className="btn-primary flex-1" onClick={next} disabled={!answered}>{t('c.next')} <Icon name="right" size={18} /></button>
      </div>
    </div>
  );
}

// Result: score, pass/fail, mistakes one at a time (less scrolling), topics to revise
export function Result({ r, onAgain, onHome, passMark = config.test.passMark }) {
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const wrong = r.qs.map((q, k) => ({ q, a: r.answers[k] })).filter((x) => x.a !== x.q.answer);
  const [m, setM] = useState(0);
  const revise = [...new Set(wrong.map((x) => x.q.topic))];
  const w = wrong[m];

  return (
    <Screen
      title="mk.title"
      back={onHome}
      footer={
        <div className="flex gap-2">
          <button className="btn-secondary flex-1" onClick={() => navigate('/learn')}>{t('ln.title')}</button>
          <button className="btn-primary flex-1" onClick={onAgain}>{t('mk.again')}</button>
        </div>
      }
    >
      <div className={`rounded-2xl p-4 text-center border-2 ${r.pass ? 'bg-ok-soft border-ok/40' : 'bg-bad-soft border-bad/30'}`} role="status">
        <div className={`w-14 h-14 mx-auto rounded-full grid place-items-center text-on-brand ${r.pass ? 'bg-ok' : 'bg-bad'}`}>
          <Icon name={r.pass ? 'check' : 'x'} size={30} strokeWidth={3} />
        </div>
        <p className={`mt-2 text-2xl font-bold ${r.pass ? 'text-ok' : 'text-bad'}`}>{r.pass ? t('mk.pass') : t('mk.fail')}</p>
        <p className="text-lg font-semibold">{t('mk.score', { score: r.score, total: r.total })}</p>
        <p className="text-sm text-muted">{t('mk.need', { pass: passMark })}</p>
      </div>

      {revise.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-bold text-muted">{t('mk.revise')}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {revise.map((tp) => (
              <button key={tp} className="chip" onClick={() => navigate(tp === 'signs' ? '/learn?tab=signs' : '/learn?tab=rules')}>{L(topics[tp])}</button>
            ))}
          </div>
        </div>
      )}

      <h3 className="mt-3 font-bold">{t('mk.mistakes')}</h3>
      {!w ? (
        <p className="mt-1 text-ok font-semibold">{t('mk.noMistakes')}</p>
      ) : (
        <div className="card mt-1.5 p-3">
          <div className="flex items-center justify-between text-sm text-muted mb-1">
            <span>{t('mk.mistakeN', { n: m + 1, total: wrong.length })}</span>
            <span className="flex gap-1">
              <button className="w-10 h-10 rounded-full grid place-items-center border border-line disabled:opacity-30" disabled={m === 0} onClick={() => setM(m - 1)} aria-label={t('ln.prev')}><Icon name="back" size={18} /></button>
              <button className="w-10 h-10 rounded-full grid place-items-center border border-line disabled:opacity-30" disabled={m === wrong.length - 1} onClick={() => setM(m + 1)} aria-label={t('ln.next')}><Icon name="right" size={18} /></button>
            </span>
          </div>
          <div className="flex gap-3">
            {w.q.sign && <Sign id={w.q.sign} size={64} className="shrink-0" />}
            <p className="font-semibold">{L(w.q.q)}</p>
          </div>
          <p className="mt-2 text-sm text-bad font-semibold flex items-start gap-1">
            <Icon name="x" size={16} strokeWidth={3} className="shrink-0 mt-0.5" />
            {w.a === null ? t('mk.none') : t('mk.yours', { a: L(w.q.options[w.a]) })}
          </p>
          <p className="mt-1 text-sm text-ok font-semibold flex items-start gap-1">
            <Icon name="check" size={16} strokeWidth={3} className="shrink-0 mt-0.5" />
            {t('mk.right', { a: L(w.q.options[w.q.answer]) })}
          </p>
          <p className="mt-1 text-sm">{L(w.q.why)}</p>
        </div>
      )}
    </Screen>
  );
}
