import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Logo } from '../components/Shell.jsx';
import Icon from '../components/Icon.jsx';

// First screen: pick the language before anything else. Shown in both languages so everyone can read it.
export default function Onboarding() {
  const { update } = useStore();
  const [lang, setLang] = useState('hi');
  const [helper, setHelper] = useState(true);

  const go = () =>
    update((s) => {
      s.settings.lang = lang;
      s.settings.helper = helper;
    });

  const Opt = ({ id, main, sub }) => (
    <button
      type="button"
      role="radio"
      aria-checked={lang === id}
      onClick={() => setLang(id)}
      lang={id}
      className={`w-full flex items-center gap-4 text-left min-h-[4.75rem] px-5 rounded-3xl border-2 transition-all active:scale-[0.98] ${lang === id ? 'border-brand bg-brand-soft' : 'border-transparent bg-surface shadow-soft'}`}
    >
      <span className={`w-7 h-7 shrink-0 rounded-full border-2 grid place-items-center ${lang === id ? 'border-brand bg-brand text-on-brand' : 'border-muted'}`}>
        {lang === id && <Icon name="check" size={16} strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-2xl font-bold">{main}</span>
        <span className="block text-sm text-muted">{sub}</span>
      </span>
    </button>
  );

  return (
    <div className="h-full max-w-app md:max-w-[42rem] mx-auto flex flex-col px-5 py-6 bg-bg">
      <div className="flex items-center gap-2">
        <Logo size={40} />
        <div>
          <div className="font-bold text-lg leading-tight">लाइसेंस साथी</div>
          <div className="text-sm text-muted leading-tight">Licence Saathi</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5">
        <div>
          <p className="font-display text-[2.8rem] leading-none rise">नमस्ते <span className="text-muted">Namaste</span></p>
          <h1 className="mt-2 text-xl font-semibold leading-snug">
            आपके लिए कौन सी भाषा आसान है?
            <span className="block text-base font-normal text-muted">Which language is easiest for you?</span>
          </h1>
        </div>

        <div role="radiogroup" aria-label="Language / भाषा" className="space-y-3">
          <Opt id="hi" main="हिंदी" sub="Hindi" />
          <Opt id="en" main="English" sub="अंग्रेज़ी" />
        </div>

        <label className="flex items-start gap-3 min-h-[3rem] cursor-pointer">
          <input type="checkbox" checked={helper} onChange={(e) => setHelper(e.target.checked)} className="mt-1 w-6 h-6 accent-[rgb(var(--brand))]" />
          <span>
            <span className="block font-medium">दूसरी भाषा भी छोटे अक्षरों में दिखाएँ</span>
            <span className="block text-sm text-muted">Also show the other language in small text</span>
          </span>
        </label>
      </div>

      <button onClick={go} className="btn-primary w-full text-lg min-h-[3.5rem]">
        <span lang={lang}>{lang === 'hi' ? 'शुरू करें' : 'Start'}</span>
        <Icon name="right" />
      </button>
      <p className="text-xs text-muted text-center mt-3">
        नमूना डेटा वाला प्रोटोटाइप · Prototype with sample data
      </p>
    </div>
  );
}
