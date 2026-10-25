import { useState } from 'react';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Stuck, Listen, Tabs } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import TestRunner from '../components/TestRunner.jsx';
import { testDay, stuck } from '../data/content.js';
import { questions } from '../data/questions.js';
import { config } from '../data/config.js';
import { sample } from '../utils.js';
import { scoreTest } from '../journey.js';

export default function TestDay() {
  const { t, L } = useI18n();
  const [run, setRun] = useState(null); // null | { qs } | { done }
  const [tab, setTab] = useState('screen');
  const tryPass = Math.ceil((3 * config.test.passMark) / config.test.count);

  if (run?.qs) {
    return (
      <TestRunner
        variant="official"
        questions={run.qs}
        onQuit={() => setRun(null)}
        onFinish={(answers) => setRun({ done: scoreTest(run.qs, answers, tryPass) })}
      />
    );
  }

  const start = () => setRun({ qs: sample(questions, 3) });

  return (
    <Screen
      title="td.title"
      sub={t('td.sub')}
      back
      footer={
        <button className="btn-primary w-full" onClick={start}>
          <Icon name="play" size={18} /> <Tx k={run?.done ? 'td.tryAgain' : 'td.try'} />
        </button>
      }
    >
      {run?.done && (
        <div className={`mb-3 rounded-2xl p-3 flex items-center gap-2 font-semibold ${run.done.pass ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`} role="status">
          <Icon name={run.done.pass ? 'check' : 'x'} strokeWidth={3} />
          {t('td.tryDone', { score: run.done.score, total: run.done.total })} · {run.done.pass ? t('mk.passShort') : t('mk.failShort')}
        </div>
      )}

      <Tabs
        label={t('td.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'screen', label: t('td.screen') },
          { value: 'before', label: t('td.before') },
          { value: 'during', label: t('td.during') },
        ]}
      />

      {tab === 'screen' && (
        <div className="mt-3">
          {/* Mini picture of the official test screen with numbered parts */}
          <div className="rounded-xl border border-line overflow-hidden text-[0.8rem] bg-[#f2f2f2] text-black" aria-hidden="true">
            <div className="bg-[#1d3c6e] text-white px-2 py-1.5 flex justify-between">
              <span>{t('td.official')}</span>
              <span className="flex items-center gap-1"><Icon name="camera" size={12} /></span>
            </div>
            <div className="bg-white px-2 py-1 flex justify-between border-b border-[#bbb] font-semibold">
              <span className="flex items-center gap-1"><B n={2} /> {t('td.qNo', { n: 4, total: config.test.count })}</span>
              <span className="flex items-center gap-1">00:{config.test.secondsPerQuestion} <B n={1} /></span>
            </div>
            <div className="bg-white m-1.5 p-2 border border-[#bbb]">
              <p className="font-semibold">{L(questions.find((q) => q.id === 'r1').q)}</p>
              <div className="mt-1.5 space-y-1">
                {questions.find((q) => q.id === 'r1').options.map((o, k) => (
                  <div key={k} className="flex items-center gap-2 border border-[#ccc] px-1.5 py-1">
                    <span className="w-3 h-3 rounded-full border border-black" /> {L(o)} {k === 0 && <B n={3} />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end p-1.5"><span className="bg-[#1d3c6e] text-white px-3 py-1 flex items-center gap-1">{t('c.next')} <B n={4} light /></span></div>
          </div>
          <ol className="mt-3 space-y-1.5">
            {testDay.screenParts.map((p, i) => (
              <li key={p.id} className="flex gap-2 items-start">
                <B n={i + 1} />
                <span><strong>{L(p.t)}</strong>: {L(p.d)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(tab === 'before' || tab === 'during') && (
        <div className="mt-3">
          <ul className="card divide-y divide-line">
            {testDay[tab].map((x, i) => (
              <li key={i} className="flex gap-3 items-start p-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-brand-soft text-brand grid place-items-center"><Icon name="check" size={16} strokeWidth={3} /></span>
                <span>{L(x)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2"><Listen small text={testDay[tab].map((x) => L(x)).join(' ')} /></div>
        </div>
      )}

      <Stuck items={stuck.testDay} className="mt-3" />
    </Screen>
  );
}

function B({ n, light }) {
  return (
    <span className={`inline-grid place-items-center w-5 h-5 shrink-0 rounded-full text-[0.7rem] font-bold ${light ? 'bg-white text-[#1d3c6e]' : 'bg-[#D97706] text-white'}`}>{n}</span>
  );
}
