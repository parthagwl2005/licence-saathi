import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Listen, ProgressBar, Toggle } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Sign from '../components/Sign.jsx';
import { signs } from '../data/signs.js';
import { rounds, ROUNDS_PER_GAME, QUICK_SECONDS } from '../data/roadgame.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);

// "Road sense": you drive, something happens on the road, you choose what to do.
// No lives, no crash, no harsh sound: a wrong answer just explains the right one (stress-friendly learning).
export default function RoadGame() {
  const { state, update } = useStore();
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const still = state.settings.motion === false || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState('intro'); // intro | drive | ask | result | end
  const [quick, setQuick] = useState(false);
  const [order, setOrder] = useState([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [left, setLeft] = useState(QUICK_SECONDS);
  const round = order[i];
  const best = state.game?.best || 0;

  const start = () => {
    setOrder(shuffle(rounds).slice(0, ROUNDS_PER_GAME).map((r) => ({ ...r, options: shuffle(r.options) })));
    setI(0);
    setAnswers([]);
    setPicked(null);
    setPhase('drive');
  };

  // Drive for a moment, then the situation appears and the question is asked
  useEffect(() => {
    if (phase !== 'drive') return;
    const id = setTimeout(() => { setLeft(QUICK_SECONDS); setPhase('ask'); }, still ? 200 : 1400);
    return () => clearTimeout(id);
  }, [phase, i, still]);

  // Optional challenge timer (off by default)
  useEffect(() => {
    if (!quick || phase !== 'ask') return;
    if (left <= 0) { choose(null); return; }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quick, phase, left]);

  const choose = (opt) => {
    const ok = !!opt && opt.id === round.answer;
    setPicked(opt ? opt.id : 'none');
    setAnswers((a) => [...a, { id: round.id, picked: opt?.id || 'none', ok }]);
    setPhase('result');
  };

  const next = () => {
    if (i + 1 < order.length) {
      setI(i + 1);
      setPicked(null);
      setPhase('drive');
      return;
    }
    const score = answers.filter((a) => a.ok).length;
    update((s) => { s.game = { best: Math.max(s.game?.best || 0, score), plays: (s.game?.plays || 0) + 1, last: score, at: new Date().toISOString().slice(0, 10) }; });
    setPhase('end');
  };

  // ---------- Intro
  if (phase === 'intro') {
    return (
      <Screen title="rg.title" sub={t('rg.sub')} back="/" footer={<button className="btn-primary w-full" onClick={start}><Icon name="play" size={18} /> {t('rg.start')}</button>}>
        <RoadScene scene={{ light: 'green' }} action="go" still={still} />
        <ul className="mt-4 grid gap-2">
          {['rg.i1', 'rg.i2', 'rg.i3'].map((k) => (
            <li key={k} className="flex gap-2 items-start"><Icon name="check" size={18} strokeWidth={3} className="text-ok shrink-0 mt-0.5" /> <span>{t(k, { n: ROUNDS_PER_GAME })}</span></li>
          ))}
        </ul>
        <div className="card p-4 mt-4">
          <Toggle id="rg-quick" label={t('rg.quick', { s: QUICK_SECONDS })} checked={quick} onChange={setQuick} />
          <p className="text-xs text-muted">{t('rg.quickSub')}</p>
        </div>
        {best > 0 && <p className="mt-3 text-sm text-muted">{t('rg.best', { n: best, total: ROUNDS_PER_GAME })}</p>}
      </Screen>
    );
  }

  // ---------- End
  if (phase === 'end') {
    const score = answers.filter((a) => a.ok).length;
    const stars = score >= ROUNDS_PER_GAME - 1 ? 3 : score >= ROUNDS_PER_GAME / 2 + 1 ? 2 : score >= ROUNDS_PER_GAME / 2 - 1 ? 1 : 0;
    const wrong = answers.filter((a) => !a.ok).map((a) => rounds.find((r) => r.id === a.id));
    return (
      <Screen
        title="rg.title"
        back="/"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary px-3" onClick={() => navigate('/learn')}>{t('ln.title')}</button>
            <button className="btn-primary px-3" onClick={start}><Icon name="refresh" size={18} /> {t('rg.again')}</button>
          </div>
        }
      >
        <div className="text-center mt-2 rise" role="status">
          <p className="text-[2.6rem] leading-none" aria-label={t('rg.stars', { n: stars })}>
            {[0, 1, 2].map((k) => <span key={k} className={k < stars ? 'text-sun' : 'text-line'}>★</span>)}
          </p>
          <h2 className="font-display text-[2.2rem] leading-tight mt-2">{t('rg.score', { n: score, total: answers.length })}</h2>
          <p className="text-muted mt-1">{t(score === answers.length ? 'rg.perfect' : score >= answers.length / 2 ? 'rg.good' : 'rg.keep')}</p>
        </div>
        {wrong.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold">{t('rg.review')}</h3>
            <ul className="mt-2 grid gap-2">
              {wrong.map((r) => (
                <li key={r.id} className="card p-4">
                  <p className="font-semibold leading-snug">{L(r.q)}</p>
                  <p className="text-ok font-semibold mt-1 flex gap-1.5 items-start"><Icon name="check" size={16} strokeWidth={3} className="shrink-0 mt-1" /> {L(r.options.find((x) => x.id === r.answer).t)}</p>
                  <p className="text-sm text-muted mt-1">{L(r.why)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Screen>
    );
  }

  // ---------- Playing
  const ok = picked && picked === round.answer;
  const action = phase === 'result' ? (ok ? round.action : 'slow') : 'go';
  return (
    <Screen
      title="rg.title"
      back={() => setPhase('intro')}
      footer={phase === 'result' ? (
        <button className="btn-primary w-full" onClick={next} autoFocus>{i + 1 < order.length ? t('c.next') : t('rg.finish')} <Icon name="right" size={18} /></button>
      ) : null}
    >
      <ProgressBar value={i + 1} max={order.length} label={t('c.step', { n: i + 1, total: order.length })} />
      <div className="mt-3"><RoadScene key={round.id + i} scene={round.scene} action={action} still={still} entering={phase === 'drive'} /></div>

      {phase === 'drive' && <p className="mt-4 text-muted text-center" aria-live="polite">{t('rg.driving')}</p>}

      {phase === 'ask' && (
        <div className="mt-4 fade-in">
          <div className="flex items-start gap-2">
            <h2 className="text-lg font-semibold leading-snug flex-1" aria-live="polite">{L(round.q)}</h2>
            {quick && <span className={`shrink-0 w-11 h-11 rounded-full grid place-items-center font-bold tabular-nums ${left <= 3 ? 'bg-warn-soft text-warn' : 'bg-sunk'}`} aria-label={t('mk.secs', { s: left })}>{left}</span>}
          </div>
          <p className="text-sm text-muted">{t('rg.what')}</p>
          <div className="mt-3 grid gap-2">
            {round.options.map((opt) => (
              <button key={opt.id} className="w-full text-left rounded-2xl bg-surface shadow-soft px-4 py-3 min-h-[3.25rem] font-medium active:scale-[0.99] border-2 border-transparent hover:border-brand/40" onClick={() => choose(opt)}>
                {L(opt.t)}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className={`mt-4 rounded-3xl p-4 fade-in ${ok ? 'bg-ok-soft' : 'bg-warn-soft'}`} role="status">
          <p className={`font-bold text-lg flex items-center gap-2 ${ok ? 'text-ok' : 'text-warn'}`}>
            <Icon name={ok ? 'check' : 'info'} size={20} strokeWidth={3} /> {ok ? t('rg.right') : picked === 'none' ? t('rg.time') : t('rg.notQuite')}
          </p>
          {!ok && <p className="mt-2"><span className="text-sm text-muted">{t('rg.better')}</span><br /><b>{L(round.options.find((x) => x.id === round.answer).t)}</b></p>}
          <p className="mt-2 leading-snug">{L(round.why)}</p>
          <div className="mt-2"><Listen small text={`${L(round.options.find((x) => x.id === round.answer).t)}. ${L(round.why)}`} /></div>
        </div>
      )}
    </Screen>
  );
}

// ---------- The road picture (inline SVG). India drives on the LEFT: your car is in the left lane.
export function RoadScene({ scene = {}, action = 'go', still = false, entering = false }) {
  const { t, L } = useI18n();
  const signName = scene.sign ? L(signs.find((x) => x.id === scene.sign)?.name) : '';
  const spd = action === 'stop' ? '0s' : action === 'slow' ? '1.8s' : '0.55s';
  const enter = entering && !still ? 'g-enter' : '';
  const dashes = useMemo(() => Array.from({ length: 9 }, (_, k) => k * 40 - 40), []);
  const label = [
    scene.light && t('rg.s.light.' + scene.light),
    scene.car && t('rg.s.car.' + scene.car),
    scene.zebra && t('rg.s.zebra'),
    scene.ambulance && t('rg.s.ambulance'),
    scene.uturn && t('rg.s.uturn'),
    scene.hump && t('rg.s.hump'),
    scene.rain && t('rg.s.rain'),
    scene.sign && t('rg.s.sign', { name: signName }),
  ].filter(Boolean).join('. ');
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#8FB98B] shadow-soft" style={{ aspectRatio: '300 / 250' }} role="img" aria-label={label || t('rg.s.road')}>
      <svg viewBox="0 0 300 250" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {/* road */}
        <rect x="50" y="0" width="200" height="250" fill={scene.rain ? '#3e4347' : '#4a4f54'} />
        <rect x="52" y="0" width="3" height="250" fill="#f4f1ea" />
        <rect x="245" y="0" width="3" height="250" fill="#f4f1ea" />
        {/* centre dashes, moving to show you are driving */}
        <g className={still || action === 'stop' ? '' : 'g-road'} style={{ '--spd': spd }}>
          {dashes.map((y) => (scene.uturn && y > 30 && y < 120 ? null : <rect key={y} x="148" y={y} width="4" height="22" fill="#f4f1ea" />))}
        </g>
        {scene.uturn && (
          <g className={enter}>
            <rect x="140" y="40" width="20" height="80" fill="#4a4f54" />
            <path d="M120 112 V78 a22 22 0 0 1 44 0 V100" fill="none" stroke="#f4f1ea" strokeWidth="5" strokeLinecap="round" />
            <path d="M156 94 l8 10 l8 -10" fill="none" stroke="#f4f1ea" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        {/* zebra crossing + person */}
        {scene.zebra && (
          <g className={enter}>
            {Array.from({ length: 10 }, (_, k) => <rect key={k} x={56 + k * 19.5} y="96" width="11" height="28" fill="#f4f1ea" />)}
            <g className={still ? '' : 'g-walk'}>
              <circle cx="205" cy="98" r="6" fill="#2b2b2b" />
              <rect x="199" y="104" width="12" height="16" rx="5" fill="#C8553D" />
            </g>
          </g>
        )}
        {/* traffic light on the left, stop line across your lane */}
        {scene.light && (
          <g className={enter}>
            <rect x="52" y="128" width="98" height="5" fill="#f4f1ea" />
            <rect x="14" y="40" width="26" height="74" rx="8" fill="#1b1916" />
            <rect x="25" y="114" width="4" height="40" fill="#1b1916" />
            <circle cx="27" cy="55" r="8" fill="#E5484D" opacity={scene.light === 'red' ? 1 : 0.18} />
            <circle cx="27" cy="77" r="8" fill="#F5A524" opacity={scene.light === 'amber' ? 1 : 0.18} />
            <circle cx="27" cy="99" r="8" fill="#30A46C" opacity={scene.light === 'green' ? 1 : 0.18} />
          </g>
        )}
        {/* speed breaker */}
        {scene.hump && (
          <g className={enter}>
            {Array.from({ length: 10 }, (_, k) => <rect key={k} x={52 + k * 19.6} y="104" width="19.6" height="9" fill={k % 2 ? '#1b1916' : '#F5C518'} />)}
          </g>
        )}
        {/* car in front, in your lane */}
        {scene.car && (
          <g className={enter}>
            <rect x="82" y="42" width="36" height="58" rx="9" fill="#C8553D" />
            <rect x="87" y="52" width="26" height="14" rx="4" fill="#2b3a44" />
            <rect x="85" y="92" width="8" height="5" rx="2" fill="#7a1f1f" />
            <rect x="107" y="92" width="8" height="5" rx="2" fill="#7a1f1f" />
            {(scene.car === 'left' || scene.car === 'hazard') && <circle className={still ? '' : 'g-ind'} cx="84" cy="96" r="5" fill="#FFB020" />}
            {(scene.car === 'right' || scene.car === 'hazard') && <circle className={still ? '' : 'g-ind'} cx="116" cy="96" r="5" fill="#FFB020" />}
          </g>
        )}
        {/* your car */}
        <g className="g-car" style={{ transform: action === 'left' && scene.ambulance ? 'translateX(-24px)' : 'none' }}>
          <rect x="82" y="148" width="36" height="58" rx="9" fill="#1E4D3F" />
          <rect x="87" y="156" width="26" height="13" rx="4" fill="#cfe3ec" />
          <rect x="87" y="186" width="26" height="10" rx="3" fill="#2b3a44" />
          <rect x="84" y="200" width="8" height="5" rx="2" fill={action === 'stop' ? '#ff3b3b' : '#7a1f1f'} />
          <rect x="108" y="200" width="8" height="5" rx="2" fill={action === 'stop' ? '#ff3b3b' : '#7a1f1f'} />
        </g>
        {/* ambulance behind */}
        {scene.ambulance && (
          <g className="g-car" style={{ transform: action === 'left' ? 'translate(18px, -150px)' : 'none' }}>
            <rect x="82" y="214" width="36" height="56" rx="7" fill="#ffffff" stroke="#c9c2b6" />
            <rect x="96" y="226" width="8" height="20" fill="#E5484D" />
            <rect x="90" y="232" width="20" height="8" fill="#E5484D" />
            <rect className={still ? '' : 'g-siren'} x="86" y="210" width="12" height="6" rx="2" fill="#E5484D" />
            <rect className={still ? '' : 'g-siren2'} x="102" y="210" width="12" height="6" rx="2" fill="#3b82f6" />
          </g>
        )}
        {/* rain */}
        {scene.rain && (
          <g className={still ? '' : 'g-rain'} opacity="0.55">
            {Array.from({ length: 28 }, (_, k) => <line key={k} x1={(k * 37) % 300} y1={(k * 53) % 250 - 20} x2={(k * 37) % 300 - 6} y2={(k * 53) % 250} stroke="#e8f1ff" strokeWidth="2" />)}
          </g>
        )}
      </svg>
      {scene.sign && (
        <div className={`absolute left-[3%] top-[6%] w-[22%] ${enter}`}>
          <Sign id={scene.sign} size="100%" className="w-full h-auto drop-shadow" decorative />
        </div>
      )}
    </div>
  );
}
