import { config } from './data/config.js';

// Fields every licence form asks for. Filled once in "Your details", reused everywhere.
export const PROFILE_FIELDS = ['name', 'dob', 'gender', 'mobile', 'address', 'pincode', 'state'];
export const PROFILE_FILES = ['age', 'address']; // proof of age, proof of address
export const REQUIRED = [...PROFILE_FIELDS, 'photo', 'sign', ...PROFILE_FILES.map((f) => 'file:' + f)];

const has = (p, key) => (key.startsWith('file:') ? !!p.files?.[key.slice(5)] : !!String(p[key] || '').trim());

export function completeness(p) {
  const done = REQUIRED.filter((k) => has(p, k)).length;
  return { done, total: REQUIRED.length, pct: Math.round((done / REQUIRED.length) * 100), missing: REQUIRED.filter((k) => !has(p, k)) };
}

export const hasBasics = (p) => !!(p.name && p.dob);
export const maskMobile = (m) => (m && m.length === 10 ? `${m.slice(0, 2)}••••••${m.slice(-2)}` : m || '');
export const validMobile = (m) => /^[6-9]\d{9}$/.test(m || '');
export const validPin = (m) => /^[1-9]\d{5}$/.test(m || '');

// Which saved documents count for which checklist items
export const fileToDoc = { age: 'age', address: 'address' };

// ---------- Reading an ID card on this device (no upload). Loaded only when someone taps "Scan".
let workerPromise = null;
async function getWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const base = new URL('ocr/', document.baseURI).href;
      return createWorker('eng', 1, {
        workerPath: base + 'worker.min.js',
        corePath: base,
        langPath: base,
        gzip: true,
        workerBlobURL: false,
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress.current) onProgress.current(0.35 + m.progress * 0.65);
          else if (onProgress.current && typeof m.progress === 'number') onProgress.current(Math.min(0.35, m.progress * 0.35));
        },
      });
    })().catch((e) => {
      workerPromise = null;
      throw e;
    });
  }
  return workerPromise;
}

const progressRef = { current: null };
export async function readId(image, onProgress) {
  progressRef.current = onProgress;
  let worker;
  try {
    worker = await getWorker(progressRef);
  } catch (e) {
    const err = new Error('Text reader could not load');
    err.code = 'LOAD';
    throw err;
  }
  const { data } = await worker.recognize(image);
  progressRef.current = null;
  return parseIdText(data.text || '');
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n) => String(n).padStart(2, '0');

// Pull name, date of birth, gender, address, PIN code and state out of the text on an ID card.
export function parseIdText(raw) {
  const text = raw.replace(/[|]/g, 'I').replace(/\r/g, '');
  const lines = text.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const out = {};

  // Date of birth: 14/03/2007, 14-03-2007, 14 Mar 2007
  let m = text.match(/\b(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(19\d{2}|20\d{2})\b/);
  if (m) out.dob = `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  else {
    m = text.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19\d{2}|20\d{2})\b/i);
    if (m) out.dob = `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(m[1])}`;
  }

  // Gender
  const g = text.match(/\b(female|male|transgender)\b/i) || text.match(/(महिला|पुरुष)/);
  if (g) {
    const v = g[1].toLowerCase();
    out.gender = v === 'female' || v === 'महिला' ? 'female' : v === 'male' || v === 'पुरुष' ? 'male' : 'other';
  }

  // Name: the line after "Name", else the line just above the date of birth
  const skip = /(government|india|identity|card|sample|dob|birth|gender|male|female|address|year|valid|not a real|s\/o|d\/o|w\/o|father|husband|\d{3,})/i;
  const nameLine = lines.findIndex((l) => /\bname\b\s*[:\-]/i.test(l));
  const cleanName = (s) => s.replace(/^.*?\bname\b\s*[:\-]?\s*/i, '').replace(/[^A-Za-z .]/g, '').replace(/\s+/g, ' ').trim();
  if (nameLine >= 0) {
    const same = cleanName(lines[nameLine]);
    out.name = same.length > 2 ? same : cleanName(lines[nameLine + 1] || '');
  } else {
    const dobLine = lines.findIndex((l) => /\d{1,2}\s*[\/\-.]\s*\d{1,2}\s*[\/\-.]\s*\d{4}/.test(l) || /dob|birth/i.test(l));
    for (let i = dobLine - 1; i >= 0; i--) {
      const c = cleanName(lines[i]);
      if (c.split(' ').length >= 2 && !skip.test(lines[i])) {
        out.name = c;
        break;
      }
    }
  }
  if (out.name) out.name = out.name.replace(/\b([a-z])/g, (x) => x.toUpperCase());

  // Father's / husband's name: "S/O: …", "D/O", "W/O", "C/O" or "Father: …"
  const rel = lines.map((l) => l.match(/\b(?:[SDWC]\s*\/\s*O|son of|daughter of|wife of|father(?:'s)?(?: name)?|husband(?:'s)?(?: name)?)\b\s*[:\-,]?\s*([A-Za-z .]{3,})/i)).find(Boolean);
  if (rel) out.relation = rel[1].replace(/\s+/g, ' ').trim().replace(/\b([a-z])/g, (x) => x.toUpperCase());

  // PIN code and address (text after "Address" up to the PIN code)
  const pin = text.match(/\b([1-9]\d{5})\b/);
  if (pin) out.pincode = pin[1];
  const ai = lines.findIndex((l) => /\baddress\b/i.test(l));
  if (ai >= 0) {
    const parts = [];
    for (let i = ai; i < lines.length && parts.length < 4; i++) {
      const l = i === ai ? lines[i].replace(/^.*?\baddress\b\s*[:\-]?\s*/i, '') : lines[i];
      if (l) parts.push(l);
      if (/\b[1-9]\d{5}\b/.test(l)) break;
    }
    out.address = parts.join(', ').replace(/\s*[-,]?\s*\b[1-9]\d{5}\b.*/, '').replace(/,\s*,/g, ',').trim();
  }

  // State, if its name appears
  const st = config.states.find((s) => new RegExp('\\b' + s.en + '\\b', 'i').test(text));
  if (st) out.state = st.id;

  // A 12-digit ID number is noticed only so we can tell the user we did NOT keep it
  out.sawIdNumber = /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(text);
  return out;
}

// Sample ID card for demos: clearly marked as not a real document. Drawn on a canvas, never downloaded.
export function sampleIdCard() {
  const c = document.createElement('canvas');
  c.width = 900;
  c.height = 560;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#1E4D3F';
  x.fillRect(0, 0, c.width, 90);
  x.fillStyle = '#ffffff';
  x.font = 'bold 40px Arial';
  x.fillText('SAMPLE IDENTITY CARD', 40, 60);
  x.fillStyle = '#d9e6df';
  x.fillRect(40, 130, 180, 220);
  x.fillStyle = '#6b4f3a';
  x.beginPath();
  x.arc(130, 210, 50, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = '#2f4858';
  x.fillRect(70, 280, 120, 70);
  x.fillStyle = '#111111';
  x.font = '34px Arial';
  const rows = ['Name: Ramesh Kumar', 'S/O: Suresh Kumar', 'DOB: 14/03/2007', 'Gender: Male', 'Address: House 12, Sector 5,', 'Gurugram, Haryana 122001'];
  rows.forEach((r, i) => x.fillText(r, 260, 150 + i * 52));
  x.fillStyle = '#9a3412';
  x.font = 'bold 26px Arial';
  x.fillText('Not a real document. For demo only.', 40, 520);
  const url = c.toDataURL('image/png');
  sampleIdCard.last = url;
  sampleIdCard.text = rows.join('\n');
  return url;
}
