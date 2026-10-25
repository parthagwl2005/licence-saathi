// Saved details are kept encrypted on this phone (AES-GCM, 256-bit).
// The key that opens them is itself locked two ways:
//   1. with your 4-digit PIN (PBKDF2, 150,000 rounds; a wrong PIN simply fails to open it), and
//   2. optionally with your phone's own screen lock (fingerprint, face or phone PIN), like a bank app.
// Nothing is sent anywhere. Forget the PIN and the details cannot be opened; you start again.

const VKEY = 'licence-saathi.v2.vault';
const DB = 'licence-saathi-keys';
const STORE = 'k';
const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = () => globalThis.crypto?.subtle;

export const PIN_LEN = 4;
const ROUNDS = 150000;

// ---------- small helpers
function b64(buf) {
  const a = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
  return btoa(s);
}
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

function readRec() {
  try { return JSON.parse(localStorage.getItem(VKEY) || 'null'); } catch { return null; }
}
function writeRec(rec) {
  try { localStorage.setItem(VKEY, JSON.stringify(rec)); } catch { /* storage full: keep working this session */ }
}

function idb(mode, fn) {
  return new Promise((res, rej) => {
    if (!globalThis.indexedDB) return rej(new Error('no-idb'));
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => rej(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => { open.result.close(); res(req?.result); };
      tx.onerror = () => rej(tx.error);
    };
  });
}

// ---------- the key that actually encrypts the details lives only in memory while unlocked
let dataKey = null;

const pinKey = async (pin, salt) => {
  const base = await subtle().importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return subtle().deriveKey({ name: 'PBKDF2', salt, iterations: ROUNDS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']);
};
const wrap = async (key, by) => {
  const iv = rand(12);
  return { iv: b64(iv), ct: b64(await subtle().wrapKey('raw', key, by, { name: 'AES-GCM', iv })) };
};
const unwrap = (w, by) =>
  subtle().unwrapKey('raw', unb64(w.ct), by, { name: 'AES-GCM', iv: unb64(w.iv) }, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);

async function seal(payload) {
  const iv = rand(12);
  const ct = await subtle().encrypt({ name: 'AES-GCM', iv }, dataKey, enc.encode(JSON.stringify(payload)));
  return { iv: b64(iv), ct: b64(ct) };
}
async function open(data) {
  if (!data) return null;
  const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(data.iv) }, dataKey, unb64(data.ct));
  return JSON.parse(dec.decode(pt));
}

// ---------- public API
export const supported = () => !!subtle();
export const exists = () => { const r = readRec(); return !!(r?.pinWrap || r?.devWrap); };
export const hasPin = () => !!readRec()?.pinWrap;
export const isOpen = () => !!dataKey;
export const phoneOn = () => !!readRec()?.credId;

// First time: choose a PIN and lock whatever is saved now
// Or lock with the phone's own screen lock only (fingerprint, face or phone PIN). A backup PIN can be added later.
export async function createWithPhone(payload, label) {
  dataKey = await subtle().generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  writeRec({ v: 1, tries: 0, until: 0, data: await seal(payload) });
  try {
    await enablePhone(label);
  } catch (e) {
    dataKey = null;
    try { localStorage.removeItem(VKEY); } catch { /* ignore */ }
    throw e;
  }
}

export async function create(pin, payload) {
  dataKey = await subtle().generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const salt = rand(16);
  const rec = { v: 1, salt: b64(salt), pinWrap: await wrap(dataKey, await pinKey(pin, salt)), tries: 0, until: 0 };
  rec.data = await seal(payload);
  writeRec(rec);
}

// How long until another PIN try is allowed (ms), after too many wrong tries
export function waitMs() {
  const rec = readRec();
  return rec ? Math.max(0, (rec.until || 0) - Date.now()) : 0;
}

export async function unlockWithPin(pin) {
  const rec = readRec();
  if (!rec?.pinWrap) return { ok: false, reason: 'none' };
  const wait = waitMs();
  if (wait) return { ok: false, reason: 'wait', wait };
  try {
    dataKey = await unwrap(rec.pinWrap, await pinKey(pin, unb64(rec.salt)));
  } catch {
    rec.tries = (rec.tries || 0) + 1;
    // 5 wrong tries: wait 30 seconds, then the wait doubles each time (up to 15 minutes)
    if (rec.tries >= 5) rec.until = Date.now() + Math.min(15 * 60000, 30000 * 2 ** (rec.tries - 5));
    writeRec(rec);
    return { ok: false, reason: 'wrong', left: Math.max(0, 5 - rec.tries), wait: waitMs() };
  }
  rec.tries = 0;
  rec.until = 0;
  writeRec(rec);
  return { ok: true, payload: await open(rec.data) };
}

export async function save(payload) {
  if (!dataKey) return;
  const rec = readRec();
  if (!rec) return;
  rec.data = await seal(payload);
  writeRec(rec);
}

export async function changePin(pin) {
  if (!dataKey) throw new Error('locked');
  const rec = readRec() || { v: 1 };
  const salt = rand(16);
  rec.salt = b64(salt);
  rec.pinWrap = await wrap(dataKey, await pinKey(pin, salt));
  rec.tries = 0;
  rec.until = 0;
  writeRec(rec);
}

export function lock() {
  dataKey = null;
}

export async function erase() {
  dataKey = null;
  try { localStorage.removeItem(VKEY); } catch { /* ignore */ }
  try { await idb('readwrite', (s) => s.delete('device')); } catch { /* ignore */ }
}

// ---------- Phone screen lock (WebAuthn platform authenticator: fingerprint, face or phone PIN)
export async function phoneAvailable() {
  try {
    if (!window.PublicKeyCredential || !globalThis.indexedDB || !window.isSecureContext) return false;
    const fp = document.featurePolicy || document.permissionsPolicy;
    if (fp?.allowsFeature && (!fp.allowsFeature('publickey-credentials-get') || !fp.allowsFeature('publickey-credentials-create'))) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function enablePhone(label) {
  if (!dataKey) throw new Error('locked');
  const cred = await navigator.credentials.create({
    publicKey: {
      rp: { name: 'Licence Saathi' },
      user: { id: rand(16), name: label || 'Licence Saathi', displayName: label || 'Licence Saathi' },
      challenge: rand(32),
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      timeout: 60000,
    },
  });
  // A key that never leaves this browser (cannot be exported) unlocks the details after the phone check
  const device = await subtle().generateKey({ name: 'AES-GCM', length: 256 }, false, ['wrapKey', 'unwrapKey']);
  await idb('readwrite', (s) => s.put(device, 'device'));
  const rec = readRec();
  rec.credId = b64(cred.rawId);
  rec.devWrap = await wrap(dataKey, device);
  writeRec(rec);
}

export async function unlockWithPhone() {
  const rec = readRec();
  if (!rec?.credId || !rec.devWrap) return { ok: false, reason: 'none' };
  try {
    await navigator.credentials.get({
      publicKey: { challenge: rand(32), allowCredentials: [{ type: 'public-key', id: unb64(rec.credId) }], userVerification: 'required', timeout: 60000 },
    });
    const device = await idb('readonly', (s) => s.get('device'));
    if (!device) return { ok: false, reason: 'none' };
    dataKey = await unwrap(rec.devWrap, device);
    rec.tries = 0;
    rec.until = 0;
    writeRec(rec);
    return { ok: true, payload: await open(rec.data) };
  } catch {
    return { ok: false, reason: 'cancel' };
  }
}

export async function disablePhone() {
  const rec = readRec();
  if (rec && !rec.pinWrap) throw new Error('no-backup'); // would leave no way to open the details
  if (rec) { delete rec.credId; delete rec.devWrap; writeRec(rec); }
  try { await idb('readwrite', (s) => s.delete('device')); } catch { /* ignore */ }
}
