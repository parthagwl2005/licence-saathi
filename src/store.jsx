import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as vault from './vault.js';

// Everything the user does is saved on this device (localStorage), so a reload never loses progress.
// Saved personal details are NOT kept here in plain text: they live in the encrypted vault (src/vault.js).
const KEY = 'licence-saathi.v2';
const OLD_KEYS = ['licence-saathi.v1'];

export const emptyProfile = {
  name: '', relation: '', dob: '', gender: '', mobile: '', email: '', address: '', pincode: '', state: '', blood: '',
  licenceNo: '', photo: '', sign: '', files: {}, idName: '', updatedAt: '',
};

export const defaultState = {
  settings: { lang: null, helper: true, size: 0, contrast: false, speak: true, theme: 'auto', motion: true, demoBusy: false },
  // "Your details": filled once, reused by every form. Documents are stored only on this device.
  // Starts blank. Filled only when the person saves details, and then kept encrypted behind a PIN.
  profile: emptyProfile, // files: { age: {name, kb, url}, address: {...}, licence: {...} }
  // Forms in progress, one per service: { source: 'saved'|'digilocker'|'manual', data, from, files, extra }
  forms: {},
  security: { on: false, phone: false, pin: false },
  lockedForms: [], // ids of forms saved inside the locked vault (names only, no content)
  requests: [], // other services applied for: { id, service, no, at, amount, extra }
  outbox: [], // applications waiting to be sent (no internet or busy server)
  lost: { step: 0 }, // lost-licence flow answers
  stageMin: 0, // set when the user tells us where they are on Home
  elig: { age: '', vehicle: '', state: '', dob: '', ok: null },
  docs: {}, // { [docId]: true }
  app: { step: 0, form: { vehicles: [], fitness: {} }, submitted: false, appNo: '', paidAt: '', amount: 0, startedAt: '' },
  learn: { signIdx: 0, ruleIdx: 0, seen: {} },
  tests: [], // { at, score, total, pass }
  ll: { date: '' },
  dl: { submitted: false, appNo: '', llNo: '', paidAt: '' },
  slot: { rto: '', date: '', time: '' },
  dlCheck: {},
  drivingPassed: false,
  chat: [],
};

function merge(base, saved) {
  if (!saved || typeof saved !== 'object') return base;
  const out = { ...base };
  for (const k of Object.keys(saved)) {
    const b = base[k];
    const s = saved[k];
    out[k] = b && typeof b === 'object' && !Array.isArray(b) && s && typeof s === 'object' && !Array.isArray(s) ? { ...b, ...s } : s;
  }
  return out;
}

function load() {
  try {
    // Forget anything an older version saved in plain text
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(KEY);
    const s = raw ? merge(defaultState, JSON.parse(raw)) : defaultState;
    // The vault is the only source of saved details; it starts locked
    const on = vault.exists();
    return { ...s, profile: emptyProfile, forms: on ? {} : s.forms || {}, lockedForms: on ? s.lockedForms || [] : [], security: { on, phone: on && vault.phoneOn(), pin: on && vault.hasPin() } };
  } catch {
    return defaultState;
  }
}

// What is written in plain text: never the saved details; forms only while no lock is set.
// lockedForms lists WHICH forms are waiting (no content), so the app can say "your form is locked".
function plain(state, unlocked) {
  const { profile, ...rest } = state;
  if (state.security.on) {
    rest.forms = {};
    rest.lockedForms = unlocked ? Object.keys(state.forms || {}) : state.lockedForms || [];
  }
  return rest;
}

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(plain(state, unlocked)));
    } catch {
      /* storage full or blocked — app still works for this session */
    }
  }, [state, unlocked]);

  // While unlocked, every change to saved details or forms is encrypted and saved (debounced)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!unlocked || !state.security.on) return;
    clearTimeout(saveTimer.current);
    const payload = { profile: state.profile, forms: state.forms };
    saveTimer.current = setTimeout(() => { vault.save(payload); }, 250);
  }, [state.profile, state.forms, unlocked, state.security.on]);

  const apply = (payload) => {
    setState((s) => ({ ...s, profile: { ...emptyProfile, ...(payload?.profile || {}) }, forms: { ...(payload?.forms || {}), ...s.forms }, lockedForms: [] }));
    setUnlocked(true);
  };
  const lockNow = useCallback(() => {
    clearTimeout(saveTimer.current);
    vault.lock();
    setUnlocked(false);
    setState((s) => (s.security.on ? { ...s, profile: emptyProfile, forms: {}, lockedForms: Object.keys(s.forms || {}) } : s));
  }, []);

  // Locks itself when the app has been in the background for 2 minutes, like a bank app
  useEffect(() => {
    let hiddenAt = 0;
    const on = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 120000 && vault.isOpen()) lockNow();
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, [lockNow]);

  const security = {
    on: state.security.on,
    phone: state.security.phone,
    pin: state.security.pin,
    unlocked: unlocked && state.security.on,
    // First time: choose a PIN; whatever is in memory now becomes the saved details
    setup: async (pin, profile) => {
      const p = { ...emptyProfile, ...(profile || state.profile), updatedAt: new Date().toISOString() };
      await vault.create(pin, { profile: p, forms: state.forms });
      setState((s) => ({ ...s, profile: p, security: { on: true, phone: false, pin: true } }));
      setUnlocked(true);
    },
    // Or: lock with fingerprint / face / phone screen lock only
    setupPhone: async (profile) => {
      const p = { ...emptyProfile, ...(profile || state.profile), updatedAt: new Date().toISOString() };
      await vault.createWithPhone({ profile: p, forms: state.forms }, p.name);
      setState((s) => ({ ...s, profile: p, security: { on: true, phone: true, pin: false } }));
      setUnlocked(true);
    },
    unlockPin: async (pin) => {
      const r = await vault.unlockWithPin(pin);
      if (r.ok) apply(r.payload);
      return r;
    },
    unlockPhone: async () => {
      const r = await vault.unlockWithPhone();
      if (r.ok) apply(r.payload);
      return r;
    },
    lock: lockNow,
    changePin: async (pin) => {
      await vault.changePin(pin);
      setState((s) => ({ ...s, security: { ...s.security, pin: true } }));
    },
    enablePhone: async () => {
      await vault.enablePhone(state.profile.name);
      setState((s) => ({ ...s, security: { ...s.security, phone: true } }));
    },
    disablePhone: async () => {
      await vault.disablePhone();
      setState((s) => ({ ...s, security: { ...s.security, phone: false } }));
    },
    // Forget saved details completely (and any unfinished forms)
    forget: async () => {
      await vault.erase();
      setUnlocked(false);
      setState((s) => ({ ...s, profile: emptyProfile, forms: {}, lockedForms: [], security: { on: false, phone: false, pin: false } }));
    },
  };

  // Apply display settings to the page
  useEffect(() => {
    const el = document.documentElement;
    el.lang = state.settings.lang === 'hi' ? 'hi' : 'en';
    el.dataset.size = String(state.settings.size || 0);
    el.dataset.contrast = state.settings.contrast ? 'high' : 'normal';
    el.dataset.motion = state.settings.motion === false || state.settings.calm ? 'off' : 'on';
    el.dataset.calm = state.settings.calm ? 'on' : 'off';
    el.dataset.spacing = state.settings.spacing ? 'wide' : 'normal';
    const th = state.settings.theme || 'auto';
    const dark = th === 'dark' || (th === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    el.dataset.theme = dark && !state.settings.contrast ? 'dark' : 'light';
  }, [state.settings]);

  // Follow the phone's light/dark setting while on "auto"
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = () => setState((s) => ({ ...s, settings: { ...s.settings } }));
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  // update(draft => { draft.x = 1 })
  const update = useCallback((recipe) => {
    setState((s) => {
      const next = clone(s);
      recipe(next);
      return next;
    });
  }, []);

  const replace = useCallback((obj) => setState((s) => ({ ...merge(defaultState, obj), profile: s.profile, forms: s.forms, security: s.security })), []);
  const reset = useCallback(() => {
    vault.erase();
    setUnlocked(false);
    setState({ ...clone(defaultState), settings: { ...defaultState.settings, lang: null } });
  }, []);

  return <Ctx.Provider value={{ state, update, replace, reset, security }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

// ---- Move progress to another device without a server: the whole state as a copyable code.
export function exportCode(state) {
  // Saved details and forms stay locked on this phone: only progress travels in the code
  const { chat, profile, forms, security, ...rest } = state;
  const json = JSON.stringify(rest);
  return 'LS1.' + btoa(unescape(encodeURIComponent(json)));
}
export function importCode(code) {
  const c = code.trim();
  if (!c.startsWith('LS1.')) throw new Error('bad');
  const json = decodeURIComponent(escape(atob(c.slice(4))));
  const obj = JSON.parse(json);
  if (!obj || !obj.settings) throw new Error('bad');
  return obj;
}
