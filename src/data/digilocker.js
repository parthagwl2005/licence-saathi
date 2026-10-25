// DigiLocker DEMO. No real DigiLocker account is contacted. Two sample people stand in for a real locker,
// so the whole flow (sign in, consent, fetch, read, fill) can be tried safely.
// In a real version this would use the DigiLocker partner API with the person's consent.
import { checkDl, formatDl } from '../components/NumberInput.jsx';

const o = (en, hi) => ({ en, hi });

// ---------- Aadhaar numbers end with a Verhoeff check digit; we check it like the real system does
const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
const INV = [0,4,3,2,1,5,6,7,8,9];
function verhoeffDigit(num) {
  let c = 0;
  const d = String(num).split('').reverse().map(Number);
  for (let i = 0; i < d.length; i++) c = D[c][P[(i + 1) % 8][d[i]]];
  return INV[c];
}
export function validAadhaar(n) {
  const s = String(n).replace(/\s/g, '');
  if (!/^[2-9]\d{11}$/.test(s)) return false;
  let c = 0;
  s.split('').reverse().map(Number).forEach((x, i) => { c = D[c][P[i % 8][x]]; });
  return c === 0;
}
const withCheck = (eleven) => eleven + verhoeffDigit(eleven);
export const maskAadhaar = (n) => 'XXXX XXXX ' + String(n).slice(-4);

// ---------- The two demo lockers
export const accounts = [
  {
    id: 'sunil',
    who: o('Sunil Kumar, 38', 'सुनील कुमार, 38'),
    note: o('Has a driving licence (try: lost licence)', 'ड्राइविंग लाइसेंस है (आज़माएँ: खोया लाइसेंस)'),
    mobile: '9812345621',
    person: { name: 'Sunil Kumar', relation: 'Mahesh Kumar', dob: '1988-05-12', gender: 'male', address: 'House 45, Sector 14, Gurugram, Haryana', pincode: '122001', state: 'HR' },
    aadhaar: withCheck('49218376451'),
    dl: { no: 'HR2620190012345', issued: '2019-06-10', valid: '2038-05-11', classes: 'MCWG, LMV', rto: 'Gurugram (HR-26)' },
    class10: { board: 'CBSE', year: '2004', roll: '4417728' },
  },
  {
    id: 'ramesh',
    who: o('Ramesh Kumar, 19', 'रमेश कुमार, 19'),
    note: o('First licence (try: learner\'s licence)', 'पहला लाइसेंस (आज़माएँ: लर्नर लाइसेंस)'),
    mobile: '9876501234',
    person: { name: 'Ramesh Kumar', relation: 'Suresh Kumar', dob: '2007-03-14', gender: 'male', address: 'House 12, Sector 5, Gurugram, Haryana', pincode: '122001', state: 'HR' },
    aadhaar: withCheck('73550912846'),
    dl: null,
    class10: { board: 'HBSE', year: '2023', roll: '2309184' },
  },
];

export const docTypes = {
  aadhaar: { name: o('Aadhaar card', 'आधार कार्ड'), use: o('Proof of age and address', 'उम्र और पते का प्रमाण') },
  dl: { name: o('Driving licence', 'ड्राइविंग लाइसेंस'), use: o('Your licence number and classes', 'आपका लाइसेंस नंबर और श्रेणियाँ') },
  class10: { name: o('Class 10 marksheet', '10वीं की मार्कशीट'), use: o('Proof of age', 'उम्र का प्रमाण') },
};
export const docsOf = (acct) => ['aadhaar', acct.dl ? 'dl' : null, 'class10'].filter(Boolean);

const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ---------- Digital copies, drawn on the phone and clearly marked as samples
export function drawDoc(kind, acct) {
  const c = document.createElement('canvas');
  c.width = 900;
  c.height = 560;
  const x = c.getContext('2d');
  const p = acct.person;
  const head = { aadhaar: ['#7a3e12', 'AADHAAR (SAMPLE)'], dl: ['#1E4D3F', 'DRIVING LICENCE (SAMPLE)'], class10: ['#2f4858', 'CLASS 10 MARKSHEET (SAMPLE)'] }[kind];
  x.fillStyle = '#fffdf8';
  x.fillRect(0, 0, 900, 560);
  x.fillStyle = head[0];
  x.fillRect(0, 0, 900, 84);
  x.fillStyle = '#fff';
  x.font = 'bold 36px Arial';
  x.fillText(head[1], 36, 56);
  // photo box
  x.fillStyle = '#e4e8e6';
  x.fillRect(36, 120, 170, 210);
  x.fillStyle = '#6b4f3a';
  x.beginPath(); x.arc(121, 195, 46, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#2f4858';
  x.fillRect(66, 262, 110, 68);
  x.fillStyle = '#111';
  x.font = '30px Arial';
  const rows = {
    aadhaar: [`Name: ${p.name}`, `S/O: ${p.relation}`, `DOB: ${fmt(p.dob)}   Gender: ${p.gender === 'female' ? 'Female' : 'Male'}`, `Address: ${p.address}`, `PIN: ${p.pincode}`],
    dl: [`DL No: ${acct.dl ? formatDl(acct.dl.no) : ''}`, `Name: ${p.name}`, `S/O: ${p.relation}`, `DOB: ${fmt(p.dob)}`, `Valid till: ${acct.dl ? fmt(acct.dl.valid) : ''}`, `Class: ${acct.dl?.classes || ''}`],
    class10: [`Name: ${p.name}`, `Father: ${p.relation}`, `DOB: ${fmt(p.dob)}`, `Board: ${acct.class10.board}   Year: ${acct.class10.year}`, `Roll no: ${acct.class10.roll}`],
  }[kind];
  rows.forEach((r, i) => x.fillText(r.length > 44 ? r.slice(0, 44) + '…' : r, 236, 150 + i * 50));
  if (kind === 'aadhaar') {
    x.font = 'bold 44px Courier New, monospace';
    x.fillText(acct.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'), 236, 470);
  }
  x.fillStyle = '#b4532a';
  x.font = 'bold 24px Arial';
  x.fillText('Not a real document. Demo only.', 36, 530);
  return c.toDataURL('image/png');
}

// ---------- Read the documents that were shared: fill what can be filled, check every number
export function readLocker(acct, picked) {
  const p = acct.person;
  const fields = {};
  const from = {};
  const take = (k, v, doc) => { if (v && !fields[k]) { fields[k] = v; from[k] = doc; } };
  for (const d of picked) {
    if (d === 'aadhaar') ['name', 'relation', 'dob', 'gender', 'address', 'pincode', 'state'].forEach((k) => take(k, p[k], 'aadhaar'));
    if (d === 'dl' && acct.dl) { ['name', 'relation', 'dob'].forEach((k) => take(k, p[k], 'dl')); take('licenceNo', acct.dl.no, 'dl'); }
    if (d === 'class10') ['name', 'relation', 'dob'].forEach((k) => take(k, p[k], 'class10'));
  }
  take('mobile', acct.mobile, 'locker');

  const numbers = [];
  if (picked.includes('aadhaar')) numbers.push({ id: 'aadhaar', value: maskAadhaar(acct.aadhaar), ok: validAadhaar(acct.aadhaar), note: 'notKept' });
  if (picked.includes('dl') && acct.dl) numbers.push({ id: 'dl', value: formatDl(acct.dl.no), ok: checkDl(acct.dl.no).every(Boolean), note: 'dlOk' });
  if (picked.includes('aadhaar')) numbers.push({ id: 'pin', value: p.pincode, ok: /^[1-9]\d{5}$/.test(p.pincode), note: 'pinOk' });
  if (picked.includes('class10')) numbers.push({ id: 'roll', value: acct.class10.roll, ok: true, note: 'rollOk' });

  // The shared copies become this form's documents
  const files = {};
  const copy = (kind) => ({ name: `${kind}-digilocker.png`, kb: 60, url: drawDoc(kind, acct), at: new Date().toISOString().slice(0, 10), via: 'digilocker' });
  if (picked.includes('aadhaar')) { files.address = copy('aadhaar'); files.age = files.address; }
  if (picked.includes('class10')) files.age = copy('class10');
  if (picked.includes('dl') && acct.dl) files.licence = copy('dl');

  return { fields, from, numbers, files, idName: picked.includes('aadhaar') || picked.includes('dl') ? p.name : '' };
}
