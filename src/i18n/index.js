import { useStore } from '../store.jsx';
import en from './en.js';
import hi from './hi.js';

const dicts = { en, hi };

const fill = (str, vars) =>
  vars ? String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`)) : String(str);

// Language helpers.
//  t(key)   -> text in the main language
//  th(key)  -> the same text in the other language (helper line), or null if helper lines are off
//  L(obj)   -> pick {en, hi} content in the main language
//  Lh(obj)  -> helper-language version of {en, hi} content
export function useI18n() {
  const { state } = useStore();
  const lang = state.settings.lang || 'en';
  const other = lang === 'en' ? 'hi' : 'en';
  const helper = !!state.settings.helper;

  const t = (k, vars) => fill(dicts[lang][k] ?? dicts.en[k] ?? k, vars);
  const th = (k, vars) => (helper ? fill(dicts[other][k] ?? dicts.en[k] ?? k, vars) : null);
  const L = (obj, vars) => (obj ? fill(obj[lang] ?? obj.en ?? '', vars) : '');
  const Lh = (obj, vars) => (helper && obj ? fill(obj[other] ?? '', vars) : null);
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const fmtDate = (d, opts) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')) : d;
    return date.toLocaleDateString(locale, opts || { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const num = (n) => Number(n).toLocaleString(locale);

  return { lang, other, helper, t, th, L, Lh, fmtDate, num, locale };
}
