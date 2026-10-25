import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { useI18n } from '../i18n/index.js';
import { Screen, Tx, Choices } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import TileArt from '../components/TileArt.jsx';
import Ring from '../components/Ring.jsx';
import { Upload } from './Apply.jsx';
import { config } from '../data/config.js';
import { completeness, hasBasics, maskMobile, validMobile, validPin, readId, sampleIdCard, fileToDoc, parseIdText } from '../profile.js';
import { fileToDataURL, shrinkImage, todayStr, ageOn } from '../utils.js';
import { useSavedDetails, requestUnlock } from '../components/Lock.jsx';
import DigiLocker from '../components/DigiLocker.jsx';
import { PERSON } from '../components/FillForm.jsx';
import { formatDl, normalizeDl, validDl } from '../components/NumberInput.jsx';

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function Profile() {
  const { state, update, security } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const p = state.profile;
  const c = completeness(p);
  const [scan, setScan] = useState(null); // null | {stage:'reading', img, pct} | {stage:'confirm', img, data, saw} | {stage:'error'}
  const [toast, setToast] = useState('');

  const savedApi = useSavedDetails();
  const [locker, setLocker] = useState(false);
  const [forgetAsk, setForgetAsk] = useState(false);
  // Saving needs a PIN the first time (details are kept encrypted), and an unlocked vault after that
  const save = async (patch, msg = t('pf.saved')) => {
    if (!(await savedApi.save(patch))) return false;
    update((s) => {
      // Fill once: keep the eligibility answers in step with the saved details
      if (patch.dob) s.elig.age = String(ageOn(patch.dob));
      if (patch.dob) s.elig.dob = patch.dob;
      if (patch.state) s.elig.state = patch.state;
    });
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
    return true;
  };

  // Locked: nothing is shown until the PIN or phone lock opens it
  if (security.on && !security.unlocked) {
    return (
      <Screen title="pf.title" back="/">
        <div className="card p-6 text-center rise">
          <span className="w-16 h-16 mx-auto rounded-full bg-brand-soft text-brand grid place-items-center"><Icon name="lock" size={30} /></span>
          <h2 className="font-display text-[1.8rem] leading-tight mt-3">{t('pf.lockedT')}</h2>
          <p className="text-muted mt-1">{t('pf.lockedSub')}</p>
          <button className="btn-primary w-full mt-5" onClick={() => requestUnlock()}><Icon name="unlock" size={18} /> {t('pf.unlock')}</button>
        </div>
        <p className="text-sm text-muted mt-4 flex gap-1.5 items-start"><Icon name="shield" size={16} className="shrink-0 mt-0.5" /> {t('pf.lockedNote')}</p>
      </Screen>
    );
  }

  const startScan = async (img) => {
    setScan({ stage: 'reading', img, pct: 0.02 });
    try {
      const data = await readId(img, (pct) => setScan((sc) => (sc && sc.stage === 'reading' ? { ...sc, pct } : sc)));
      const { sawIdNumber, ...fields } = data;
      setScan({ stage: 'confirm', img, data: { name: '', relation: '', dob: '', gender: '', address: '', pincode: '', state: '', ...fields }, saw: sawIdNumber });
    } catch (e) {
      // Where the ID reader can't load (e.g. a restricted preview), the sample card still works,
      // because we already know exactly what is printed on it.
      if (e?.code === 'LOAD' && img === sampleIdCard.last && sampleIdCard.text) {
        const { sawIdNumber, ...fields } = parseIdText(sampleIdCard.text);
        setScan({ stage: 'confirm', img, data: { name: '', relation: '', dob: '', gender: '', address: '', pincode: '', state: '', ...fields }, saw: sawIdNumber });
        return;
      }
      setScan({ stage: 'error', img, off: e?.code === 'LOAD' });
    }
  };

  return (
    <Screen
      title="pf.title"
      back="/"
      footer={
        hasBasics(p) && !scan ? (
          <button className="btn-primary w-full" onClick={() => navigate('/#services')}>
            <Tx k="pf.toServices" /> <Icon name="right" size={18} />
          </button>
        ) : null
      }
    >
      {/* Summary */}
      <div className="card p-4 flex items-center gap-4 rise">
        <Ring pct={c.pct} size={64}>
          <span className="text-sm font-bold tabular-nums">{c.pct}%</span>
        </Ring>
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{c.pct === 100 ? t('pf.complete') : t('pf.fillOnce')}</p>
          <p className="text-sm text-muted">{t('pf.count', { done: c.done, total: c.total })}</p>
        </div>
      </div>

      {/* Scan card, shown first until the basics are in */}
      {!scan && (
        <ScanCard compact={hasBasics(p)} onImage={startScan} onType={() => document.getElementById('sec-about')?.scrollIntoView({ behavior: 'smooth' })} />
      )}
      {!scan && (
        <button className="mt-2 w-full card p-4 flex items-center gap-3 text-left rise" style={{ '--i': 1 }} onClick={() => setLocker(true)}>
          <span className="w-11 h-11 shrink-0 rounded-full bg-brand-soft text-brand grid place-items-center"><Icon name="cloud" size={20} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-tight">{t('ff.locker')}</span>
            <span className="block text-sm text-muted leading-snug">{t('pf.lockerSub')}</span>
          </span>
          <Icon name="right" size={18} className="text-muted shrink-0" />
        </button>
      )}
      {locker && (
        <DigiLocker
          useLabel={t('pf.lockerSave')}
          onClose={() => setLocker(false)}
          onUse={async (res) => {
            const patch = { idName: res.idName, files: res.files };
            PERSON.forEach((k) => { if (res.fields[k]) patch[k] = res.fields[k]; });
            if (res.fields.licenceNo) patch.licenceNo = res.fields.licenceNo;
            setLocker(false);
            await save(patch, t('pf.savedLocker'));
          }}
        />
      )}
      {scan && <ScanSheet key={scan.stage} scan={scan} onCancel={() => setScan(null)} onRetry={() => setScan(null)} onSave={async (d) => { if (await save({ ...d, idName: d.name }, t('pf.savedScan'))) setScan(null); }} />}

      {!scan && (
        <div className="mt-4 space-y-3">
          <Section id="sec-about" title="pf.about" i={1}
            rows={[['pf.name', p.name], ['pf.relation', p.relation], ['pf.dob', p.dob && fmt(p.dob)], ['pf.gender', p.gender && t('pf.g.' + p.gender)], ['pf.blood', p.blood], ['pf.licenceNo', p.licenceNo && formatDl(p.licenceNo)]]}
            editor={(close) => <AboutForm p={p} onSave={async (d) => { if (await save(d)) close(); }} onCancel={close} />}
          />
          <Section id="sec-contact" title="pf.contact" i={2}
            rows={[['pf.mobile', maskMobile(p.mobile)], ['pf.email', p.email], ['pf.address', p.address], ['pf.pincode', p.pincode], ['pf.state', stateName(p.state)]]}
            editor={(close) => <ContactForm p={p} onSave={async (d) => { if (await save(d)) close(); }} onCancel={close} />}
          />
          <div className="card p-4 rise" style={{ '--i': 3 }}>
            <h2 className="font-semibold mb-3"><Tx k="pf.photoSign" inline /></h2>
            <div className="grid grid-cols-2 gap-2">
              <Upload kind="photo" value={p.photo} onDone={(v) => save({ photo: v })} max={config.upload.photoMaxKB} />
              <Upload kind="sign" value={p.sign} onDone={(v) => save({ sign: v })} max={config.upload.signMaxKB} />
            </div>
          </div>
          <Docs p={p} onSave={(files) => save({ files })} i={4} />
          <section className="card p-4 rise" style={{ '--i': 5 }} aria-labelledby="sec-h">
            <h2 id="sec-h" className="font-semibold flex items-center gap-2"><Icon name="shield" size={18} className="text-brand" /> {t('pf.secT')}</h2>
            <p className="text-sm text-muted mt-1">{security.on ? (security.phone ? t('pf.secOnPhone') : t('pf.secOn')) : t('pf.secOff')}</p>
            {security.on && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="btn-secondary px-3 min-h-[2.75rem] text-sm" onClick={security.lock}><Icon name="lock" size={16} /> {t('pf.lockNow')}</button>
                <button className="btn-secondary px-3 min-h-[2.75rem] text-sm text-bad" onClick={() => setForgetAsk(true)}>{t('lk.forget')}</button>
              </div>
            )}
            {forgetAsk && (
              <div className="mt-3 rounded-2xl bg-bad-soft p-3" role="alert">
                <p className="font-semibold">{t('lk.forgetSure')}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button className="btn-secondary px-3 min-h-[2.75rem] text-sm" onClick={() => setForgetAsk(false)}>{t('c.cancel')}</button>
                  <button className="btn-primary px-3 min-h-[2.75rem] text-sm" onClick={async () => { await security.forget(); setForgetAsk(false); navigate('/'); }}>{t('lk.forgetYes')}</button>
                </div>
              </div>
            )}
          </section>
          <p className="text-xs text-muted flex gap-1.5 items-start px-1"><Icon name="info" size={14} className="mt-0.5 shrink-0" /> {t('pf.privacy')}</p>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 pointer-events-none">
          <div role="status" className="pop bg-ink text-bg rounded-full px-5 py-2.5 font-semibold shadow-lift flex items-center gap-2 max-w-full">
            <Icon name="check" size={18} strokeWidth={3} className="shrink-0" /> {toast}
          </div>
        </div>
      )}
    </Screen>
  );

  function fmt(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString(state.settings.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function stateName(id) {
    const s = config.states.find((x) => x.id === id);
    return s ? s[state.settings.lang === 'hi' ? 'hi' : 'en'] : '';
  }
}

function ScanCard({ compact, onImage, onType }) {
  const { t } = useI18n();
  const input = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    onImage(await fileToDataURL(f));
  };
  return (
    <div className={`mt-3 rounded-3xl bg-sage p-4 rise ${compact ? '' : 'pb-5'}`} style={{ '--i': 1 }}>
      <div className="flex items-center gap-3">
        <TileArt name="idscan" className="w-20 h-16 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{t('pf.scanTitle')}</p>
          <p className="text-sm text-muted leading-snug">{t('pf.scanSub')}</p>
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" capture="environment" className="sr-only" onChange={pick} tabIndex={-1} aria-label={t('pf.scan')} />
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="btn-primary px-3" onClick={() => input.current?.click()}>
          <Icon name="camera" size={18} /> {t('pf.scan')}
        </button>
        <button className="btn-secondary px-3" onClick={() => onImage(sampleIdCard())}>{t('pf.sample')}</button>
      </div>
      {!compact && (
        <button className="w-full mt-1 min-h-[2.75rem] text-sm font-semibold text-brand underline-offset-4 hover:underline" onClick={onType}>
          {t('pf.typeIt')}
        </button>
      )}
    </div>
  );
}

function ScanSheet({ scan, onCancel, onRetry, onSave }) {
  const { t, L } = useI18n();
  const [d, setD] = useState(scan.data || {});
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <div className="mt-3 card p-4 fade-in" aria-live="polite">
      <div className="flex gap-3 items-start">
        <img src={scan.img} alt="" className="w-24 h-16 object-cover rounded-xl border border-line shrink-0" />
        <div className="min-w-0 flex-1">
          {scan.stage === 'reading' && (
            <>
              <p className="font-semibold">{t('pf.reading')}</p>
              <div className="mt-2 h-2 rounded-full bg-sunk overflow-hidden" role="progressbar" aria-valuenow={Math.round(scan.pct * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${Math.round(scan.pct * 100)}%` }} />
              </div>
              <p className="text-xs text-muted mt-1">{t('pf.onDevice')}</p>
            </>
          )}
          {scan.stage === 'confirm' && (
            <>
              <p className="font-display text-2xl leading-tight">{t('pf.isRight')}</p>
              <p className="text-sm text-muted">{t('pf.fixAny')}</p>
            </>
          )}
          {scan.stage === 'error' && <p className="font-semibold text-bad">{t(scan.off ? 'pf.scanOff' : 'pf.readFail')}</p>}
        </div>
      </div>

      {scan.stage === 'confirm' && (
        <div className="mt-4 space-y-3">
          {scan.saw && (
            <p className="text-sm rounded-2xl bg-ok-soft text-ok px-3 py-2 flex gap-2 items-start"><Icon name="check" size={16} strokeWidth={3} className="shrink-0 mt-0.5" /> {t('pf.notKept')}</p>
          )}
          <F id="sc-name" label={t('pf.name')} value={d.name} onChange={(v) => set('name', v)} found={!!scan.data.name} />
          <F id="sc-relation" label={t('pf.relation')} value={d.relation} onChange={(v) => set('relation', v)} found={!!scan.data.relation} />
          <F id="sc-dob" label={t('pf.dob')} type="date" value={d.dob} onChange={(v) => set('dob', v)} found={!!scan.data.dob} />
          <div>
            <p className="label">{t('pf.gender')}</p>
            <Choices cols={3} name={t('pf.gender')} value={d.gender} onChange={(v) => set('gender', v)}
              options={['male', 'female', 'other'].map((g) => ({ value: g, label: t('pf.g.' + g) }))} />
          </div>
          <F id="sc-addr" label={t('pf.address')} value={d.address} onChange={(v) => set('address', v)} found={!!scan.data.address} area />
          <div className="grid grid-cols-2 gap-2">
            <F id="sc-pin" label={t('pf.pincode')} value={d.pincode} onChange={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))} found={!!scan.data.pincode} numeric />
            <div>
              <label htmlFor="sc-state" className="label">{t('pf.state')}</label>
              <select id="sc-state" className="field" value={d.state} onChange={(e) => set('state', e.target.value)}>
                <option value="">{t('c.select')}</option>
                {config.states.map((s) => <option key={s.id} value={s.id}>{L(s)}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button className="btn-secondary px-3" onClick={scan.stage === 'confirm' || scan.stage === 'error' ? onRetry : onCancel}>
          {scan.stage === 'reading' ? t('c.cancel') : t('pf.scanAgain')}
        </button>
        {scan.stage === 'confirm' && (
          <button className="btn-primary px-3" onClick={() => onSave(Object.fromEntries(Object.entries(d).filter(([, v]) => v)))} disabled={!d.name || !d.dob}>
            <Icon name="check" size={18} /> {t('pf.yesSave')}
          </button>
        )}
      </div>
    </div>
  );
}

function F({ id, label, value, onChange, type = 'text', found, area, numeric, hint, error }) {
  const { t } = useI18n();
  const Cmp = area ? 'textarea' : 'input';
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="label">{label}</label>
        {found !== undefined && (
          <span className={`text-xs font-semibold mb-1.5 ${found ? 'text-ok' : 'text-muted'}`}>{found ? t('pf.found') : t('pf.notFound')}</span>
        )}
      </div>
      <Cmp
        id={id}
        type={area ? undefined : type}
        rows={area ? 2 : undefined}
        inputMode={numeric ? 'numeric' : undefined}
        max={type === 'date' ? todayStr() : undefined}
        className={`field ${area ? 'py-3' : ''} ${error ? 'border-bad' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p className="text-sm text-bad font-semibold mt-1" role="alert">{error}</p>}
    </div>
  );
}

function Section({ id, title, rows, editor, i }) {
  const { t } = useI18n();
  const [edit, setEdit] = useState(false);
  return (
    <section id={id} className="card p-4 rise scroll-mt-4" style={{ '--i': i }}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="font-semibold min-w-0"><Tx k={title} inline /></h2>
        {!edit && (
          <button className="chip min-h-[2.5rem] shrink-0" onClick={() => setEdit(true)} aria-label={`${t('c.edit')}: ${t(title)}`}>
            <Icon name="pen" size={14} /> {t('c.edit')}
          </button>
        )}
      </div>
      {edit ? (
        <div className="fade-in mt-2">{editor(() => setEdit(false))}</div>
      ) : (
        <dl className="divide-y divide-line/70">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-3 py-2 text-sm">
              <dt className="text-muted w-28 shrink-0">{t(k)}</dt>
              <dd className={`min-w-0 break-words font-medium ${v ? '' : 'text-muted italic font-normal'}`}>{v || t('pf.empty')}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function AboutForm({ p, onSave, onCancel }) {
  const { t } = useI18n();
  const [d, setD] = useState({ name: p.name, relation: p.relation, dob: p.dob, gender: p.gender, blood: p.blood, licenceNo: p.licenceNo });
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  return (
    <div className="space-y-3">
      <F id="pf-name" label={t('pf.name')} value={d.name} onChange={(v) => set('name', v)} hint={t('ap.q.nameHint')} />
      <F id="pf-relation" label={t('pf.relation')} value={d.relation} onChange={(v) => set('relation', v)} />
      <F id="pf-dob" label={t('pf.dob')} type="date" value={d.dob} onChange={(v) => set('dob', v)} />
      <div>
        <p className="label">{t('pf.gender')}</p>
        <Choices cols={3} name={t('pf.gender')} value={d.gender} onChange={(v) => set('gender', v)} options={['male', 'female', 'other'].map((g) => ({ value: g, label: t('pf.g.' + g) }))} />
      </div>
      <div>
        <label htmlFor="pf-blood" className="label">{t('pf.blood')}</label>
        <select id="pf-blood" className="field" value={d.blood || ''} onChange={(e) => set('blood', e.target.value)}>
          <option value="">{t('pf.optional')}</option>
          {BLOOD.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <F id="pf-licence" label={`${t('pf.licenceNo')} · ${t('pf.optional')}`} value={d.licenceNo ? formatDl(d.licenceNo) : ''} onChange={(v) => set('licenceNo', normalizeDl(v).value)} hint={t('pf.licenceHint')} />
      <SaveRow onSave={() => onSave(d)} onCancel={onCancel} disabled={!d.name?.trim() || !d.dob || (d.licenceNo && !validDl(d.licenceNo))} />
    </div>
  );
}

function ContactForm({ p, onSave, onCancel }) {
  const { t, L } = useI18n();
  const [d, setD] = useState({ mobile: p.mobile, email: p.email, address: p.address, pincode: p.pincode, state: p.state });
  const [tried, setTried] = useState(false);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const errM = tried && d.mobile && !validMobile(d.mobile) ? t('ap.err.mobile') : '';
  const errP = tried && d.pincode && !validPin(d.pincode) ? t('pf.err.pin') : '';
  return (
    <div className="space-y-3">
      <F id="pf-mobile" label={t('pf.mobile')} value={d.mobile} numeric onChange={(v) => set('mobile', v.replace(/\D/g, '').slice(0, 10))} error={errM} />
      <F id="pf-email" label={`${t('pf.email')} · ${t('pf.optional')}`} type="email" value={d.email} onChange={(v) => set('email', v.trim())} />
      <F id="pf-address" label={t('pf.address')} value={d.address} area onChange={(v) => set('address', v)} hint={t('ap.q.addressHint')} />
      <div className="grid grid-cols-2 gap-2">
        <F id="pf-pin" label={t('pf.pincode')} value={d.pincode} numeric onChange={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))} error={errP} />
        <div>
          <label htmlFor="pf-state" className="label">{t('pf.state')}</label>
          <select id="pf-state" className="field" value={d.state || ''} onChange={(e) => set('state', e.target.value)}>
            <option value="">{t('c.select')}</option>
            {config.states.map((s) => <option key={s.id} value={s.id}>{L(s)}</option>)}
          </select>
        </div>
      </div>
      <SaveRow
        onCancel={onCancel}
        onSave={() => {
          setTried(true);
          if ((d.mobile && !validMobile(d.mobile)) || (d.pincode && !validPin(d.pincode))) return;
          onSave(d);
        }}
      />
    </div>
  );
}

function SaveRow({ onSave, onCancel, disabled }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      <button className="btn-secondary px-3" onClick={onCancel}>{t('c.cancel')}</button>
      <button className="btn-primary px-3" onClick={onSave} disabled={disabled}><Icon name="check" size={18} /> {t('c.save')}</button>
    </div>
  );
}

// Proof of age, proof of address and (optional) current licence. Images are shrunk and kept on this device.
function Docs({ p, onSave, i }) {
  const { t } = useI18n();
  const { update } = useStore();
  const list = [
    { id: 'age', k: 'pf.doc.age', ex: 'pf.doc.ageEx' },
    { id: 'address', k: 'pf.doc.address', ex: 'pf.doc.addressEx' },
    { id: 'licence', k: 'pf.doc.licence', ex: 'pf.doc.licenceEx', optional: true },
  ];
  return (
    <section className="card p-4 rise" style={{ '--i': i }}>
      <h2 className="font-semibold"><Tx k="pf.docs" inline /></h2>
      <ul className="mt-2 divide-y divide-line/70">
        {list.map((d) => (
          <DocRow
            key={d.id}
            d={d}
            file={p.files?.[d.id]}
            onFile={(f) => {
              onSave({ ...(p.files || {}), [d.id]: f });
              if (fileToDoc[d.id]) update((s) => { s.docs[fileToDoc[d.id]] = !!f; });
            }}
          />
        ))}
      </ul>
      <p className="text-xs text-muted mt-2">{t('pf.docNote')}</p>
    </section>
  );
}

function DocRow({ d, file, onFile }) {
  const { t } = useI18n();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    let url = '';
    if (f.type.startsWith('image/')) url = await shrinkImage(await fileToDataURL(f), 120, 900);
    setBusy(false);
    onFile({ name: f.name, kb: Math.max(1, Math.round(f.size / 1024)), url, at: todayStr() });
  };
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={`w-9 h-9 shrink-0 rounded-full grid place-items-center ${file ? 'bg-ok-soft text-ok' : 'bg-sunk text-muted'}`}>
        <Icon name={file ? 'check' : 'file'} size={18} strokeWidth={file ? 3 : 2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{t(d.k)}{d.optional && <span className="text-muted font-normal text-sm"> · {t('pf.optional')}</span>}</p>
        <p className="text-xs text-muted truncate">{file ? `${file.name} · ${file.kb} KB` : t(d.ex)}</p>
      </div>
      <input ref={input} type="file" accept="image/*,application/pdf" className="sr-only" onChange={pick} tabIndex={-1} aria-label={t(d.k)} />
      <button className="chip shrink-0" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? '…' : file ? t('c.change') : t('pf.add')}
      </button>
    </li>
  );
}
