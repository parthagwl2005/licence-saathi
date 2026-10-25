import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Bi, Listen, Tabs } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import Sign from '../components/Sign.jsx';
import Illus from '../components/Illus.jsx';
import { signs, signCategories } from '../data/signs.js';
import { ruleLessons } from '../data/content.js';
import { sample } from '../utils.js';

export default function Learn() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'signs';
  const setTab = (v) => setParams({ tab: v }, { replace: true });

  return (
    <Screen title="ln.title">
      <Tabs
        label={t('ln.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'signs', label: t('ln.signs') },
          { value: 'rules', label: t('ln.rules') },
          { value: 'cards', label: t('ln.cards') },
        ]}
      />
      <div className="mt-3">
        {tab === 'signs' && <SignLessons />}
        {tab === 'rules' && <RuleLessons />}
        {tab === 'cards' && <Flashcards />}
      </div>
    </Screen>
  );
}

function Pager({ idx, total, onPrev, onNext }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 mt-3">
      <button className="btn-secondary px-4" onClick={onPrev} disabled={idx === 0} aria-label={t('ln.prev')}>
        <Icon name="back" />
      </button>
      <span className="flex-1 text-center text-sm font-semibold text-muted" aria-live="polite">{t('ln.of', { n: idx + 1, total })}</span>
      <button className="btn-primary px-4" onClick={onNext} disabled={idx === total - 1} aria-label={t('ln.next')}>
        {t('ln.next')} <Icon name="right" />
      </button>
    </div>
  );
}

function SignLessons() {
  const { state, update } = useStore();
  const { L } = useI18n();
  const idx = Math.min(state.learn.signIdx || 0, signs.length - 1);
  const s = signs[idx];
  const setIdx = (i) => update((st) => { st.learn.signIdx = i; st.learn.seen[signs[i].id] = true; });
  const cat = signCategories.find((c) => c.id === s.cat);

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="group">
        {signCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setIdx(signs.findIndex((x) => x.cat === c.id))}
            aria-pressed={c.id === s.cat}
            className={`chip shrink-0 ${c.id === s.cat ? 'bg-ink text-bg border-ink hover:bg-ink' : ''}`}
          >
            {L(c)}
          </button>
        ))}
      </div>
      <article className="card mt-3 p-3 flex flex-col items-center text-center" key={s.id}>
        <p className="text-xs font-semibold text-muted">{L(cat.desc)}</p>
        <Sign id={s.id} size={120} className="my-2 drop-shadow-sm" />
        <h2 className="text-2xl font-bold"><Bi v={s.name} /></h2>
        <p className="mt-1 text-lg leading-snug">{L(s.meaning)}</p>
        <div className="mt-2"><Listen text={`${L(s.name)}. ${L(s.meaning)}`} /></div>
      </article>
      <Pager idx={idx} total={signs.length} onPrev={() => setIdx(idx - 1)} onNext={() => setIdx(idx + 1)} />
    </div>
  );
}

function RuleLessons() {
  const { state, update } = useStore();
  const { L } = useI18n();
  const idx = Math.min(state.learn.ruleIdx || 0, ruleLessons.length - 1);
  const r = ruleLessons[idx];
  const setIdx = (i) => update((st) => { st.learn.ruleIdx = i; });
  return (
    <div>
      <article className="card p-4" key={r.id}>
        <Illus name={r.illus} className="w-full h-auto max-h-[9.5rem] rounded-xl" />
        <h2 className="mt-3 text-2xl font-bold"><Bi v={r.title} /></h2>
        <p className="mt-1 text-lg leading-snug">{L(r.text)}</p>
        <div className="mt-3"><Listen text={`${L(r.title)}. ${L(r.text)}`} /></div>
      </article>
      <Pager idx={idx} total={ruleLessons.length} onPrev={() => setIdx(idx - 1)} onNext={() => setIdx(idx + 1)} />
    </div>
  );
}

// Flashcards: "Show again" puts the card back at the end of the deck.
function Flashcards() {
  const { t, L } = useI18n();
  const navigate = useNavigate();
  const fresh = () => sample(signs, signs.length).map((s) => s.id);
  const [deck, setDeck] = useState(fresh);
  const [known, setKnown] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = useMemo(() => signs.length, []);
  const s = signs.find((x) => x.id === deck[0]);

  if (!s) {
    return (
      <div className="card p-6 text-center" role="status">
        <div className="w-14 h-14 mx-auto rounded-full bg-ok text-on-brand grid place-items-center"><Icon name="check" size={30} strokeWidth={3} /></div>
        <p className="mt-3 text-xl font-bold">{t('ln.deckDone', { n: known, total })}</p>
        <div className="mt-4 flex flex-col gap-2">
          <button className="btn-primary" onClick={() => navigate('/mock')}>{t('ln.practise')}</button>
          <button className="btn-secondary" onClick={() => { setDeck(fresh()); setKnown(0); setFlipped(false); }}>{t('ln.restart')}</button>
        </div>
      </div>
    );
  }

  const answer = (knew) => {
    setFlipped(false);
    setDeck((d) => (knew ? d.slice(1) : [...d.slice(1), d[0]]));
    if (knew) setKnown((k) => k + 1);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-muted text-center" aria-live="polite">{t('ln.left', { n: deck.length })}</p>
      <button
        className="flip w-full mt-2 block"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? `${L(s.name)}. ${L(s.meaning)}` : t('ln.whatSign')}
      >
        <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flip-face card h-[17rem] flex flex-col items-center justify-center p-4">
            <Sign id={s.id} size={140} decorative />
            <p className="mt-3 text-muted text-sm">{t('ln.flip')}</p>
          </div>
          <div className="flip-face flip-back card h-[17rem] flex flex-col items-center justify-center p-4 text-center bg-brand-soft">
            <Sign id={s.id} size={64} decorative />
            <p className="mt-2 text-2xl font-bold">{L(s.name)}</p>
            <p className="mt-1 leading-snug">{L(s.meaning)}</p>
          </div>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="btn-secondary" onClick={() => answer(false)} disabled={!flipped}>
          <Icon name="refresh" size={18} /> {t('ln.again')}
        </button>
        <button className="btn-primary" onClick={() => answer(true)} disabled={!flipped}>
          <Icon name="check" size={18} /> {t('ln.knew')}
        </button>
      </div>
    </div>
  );
}
