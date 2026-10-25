import { config } from './data/config.js';

// ---------- Dates (all as YYYY-MM-DD strings, local time)
export const todayStr = () => toStr(new Date());
export function toStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export const parse = (s) => new Date(s + 'T00:00:00');
export function addDays(s, n) {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}
export function addMonths(s, n) {
  const d = parse(s);
  d.setMonth(d.getMonth() + n);
  return toStr(d);
}
export function addYears(s, n) {
  const d = parse(s);
  d.setFullYear(d.getFullYear() + n);
  return toStr(d);
}
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export function ageOn(dob, on = todayStr()) {
  const a = parse(dob);
  const b = parse(on);
  let age = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) age--;
  return age;
}

// ---------- Licence rules
export const minAgeFor = (vehicle) => config.minAge[vehicle] ?? 18;
export const llDates = (llDate) => ({
  applyFrom: addDays(llDate, config.dlWaitDays),
  expires: addMonths(llDate, config.llValidityMonths),
});

// Made-up application number
export function newAppNo(prefix = 'LS') {
  const yy = String(new Date().getFullYear()).slice(2);
  return `${prefix}-${yy}-${Math.floor(10000 + Math.random() * 89999)}`;
}

// ---------- Read aloud with the browser's speech feature
export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
export function speak(text, lang, onEnd) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const code = lang === 'hi' ? 'hi-IN' : 'en-IN';
  u.lang = code;
  const voices = synth.getVoices();
  const v = voices.find((x) => x.lang === code) || voices.find((x) => x.lang?.startsWith(lang === 'hi' ? 'hi' : 'en'));
  if (v) u.voice = v;
  u.rate = 0.95;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  synth.speak(u);
}
export const stopSpeaking = () => canSpeak() && window.speechSynthesis.cancel();

// ---------- Shuffle (for picking test questions)
export function sample(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// ---------- Photo check: read size, and shrink to fit with a canvas
export function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
export const dataUrlKB = (url) => Math.round(((url.length - url.indexOf(',') - 1) * 3) / 4 / 1024);
export function shrinkImage(dataUrl, maxKB, maxSide = 420) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      let scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let quality = 0.85;
      let out = '';
      for (let i = 0; i < 12; i++) {
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        out = canvas.toDataURL('image/jpeg', quality);
        if (dataUrlKB(out) <= maxKB) break;
        if (quality > 0.5) quality -= 0.1;
        else scale *= 0.8;
      }
      res(out);
    };
    img.onerror = rej;
    img.src = dataUrl;
  });
}

// A tiny sample photo/signature for quick demos (drawn, not downloaded)
export function sampleImage(kind) {
  const c = document.createElement('canvas');
  c.width = kind === 'sign' ? 300 : 210;
  c.height = kind === 'sign' ? 100 : 270;
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, c.width, c.height);
  if (kind === 'sign') {
    x.strokeStyle = '#1b2a6b';
    x.lineWidth = 4;
    x.lineCap = 'round';
    x.beginPath();
    x.moveTo(20, 70);
    x.bezierCurveTo(60, 10, 80, 90, 120, 50);
    x.bezierCurveTo(150, 20, 170, 80, 200, 55);
    x.bezierCurveTo(230, 35, 250, 60, 280, 45);
    x.stroke();
  } else {
    x.fillStyle = '#e9edf0';
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#6b4f3a';
    x.beginPath();
    x.arc(105, 105, 52, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#2f4858';
    x.beginPath();
    x.ellipse(105, 270, 95, 95, 0, Math.PI, 0);
    x.fill();
  }
  return c.toDataURL('image/jpeg', 0.8);
}
