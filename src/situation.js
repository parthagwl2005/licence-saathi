// Where is this person right now, and what have they already done?
// Home changes its top card to match (colour, facts, the one next step), so nobody has to remember.
import { todayStr, addDays, daysBetween, llDates } from './utils.js';
import { ownApps, stagesFor } from './screens/Track.jsx';
import { serviceById } from './data/services.js';
import { rtos } from './data/rtos.js';
import { config } from './data/config.js';

const daysAgo = (d, today) => Math.max(0, daysBetween(d, today));

// Returns { kind, tint, eyebrow, h, sub, facts[], next{ k, to }, also[], bar? } (text as i18n keys + vars)
export function situation(state) {
  const today = todayStr();
  const apps = ownApps(state);
  const ll = apps.find((a) => a.type === 'll');
  const dl = apps.find((a) => a.type === 'dl');
  const reqs = apps.filter((a) => a.type === 'req');
  const lastReq = reqs[reqs.length - 1];
  const rto = (id) => rtos.find((r) => r.id === id);

  // 5. Driving test passed: the card is on its way
  if (state.drivingPassed) {
    const at = state.drivingPassedAt || today;
    return {
      kind: 'passed', tint: 'sage',
      eyebrow: ['sit.passed.eyebrow'], h: ['sit.passed.h'], sub: ['sit.passed.sub'],
      facts: [
        { k: 'sit.f.passedOn', date: at },
        { k: 'sit.f.printed', date: addDays(at, 3), done: addDays(at, 3) <= today },
        { k: 'sit.f.posted', date: addDays(at, 5), done: addDays(at, 5) <= today },
        dl && { k: 'sit.f.appNo', text: dl.no, mono: true },
      ].filter(Boolean),
      next: { k: 'sit.btn.track', to: '/track?no=' + (dl?.no || '') },
    };
  }

  // 4. Driving test booked
  if (state.slot.date && state.dl.submitted) {
    const n = daysBetween(today, state.slot.date);
    const r = rto(state.slot.rto);
    const d = state.ll.date ? llDates(state.ll.date) : null;
    return {
      kind: 'booked', tint: 'lilac',
      eyebrow: ['sit.booked.eyebrow'],
      h: n > 0 ? ['sit.booked.h', { n }] : n === 0 ? ['sit.booked.hToday'] : ['sit.booked.hPast'],
      sub: ['sit.booked.sub'],
      facts: [
        { k: 'sit.f.testOn', date: state.slot.date, extra: state.slot.time },
        r && { k: 'sit.f.where', textL: r.name },
        { k: 'sit.f.dlApplied', date: state.dl.paidAt, ago: daysAgo(state.dl.paidAt, today) },
        d && { k: 'sit.f.validTill', date: d.expires, left: daysBetween(today, d.expires) },
      ].filter(Boolean),
      next: n < 0 ? { k: 'sit.btn.passed', to: '/permanent' } : { k: 'sit.btn.testInfo', to: '/driving-test' },
      also: n >= 0 ? [{ k: 'sit.btn.addCal', ics: { title: ['sit.ics.test', { rto: r ? r.code : '' }], date: state.slot.date, time: state.slot.time || '09:00', note: ['sit.ics.testNote'] } }] : [],
    };
  }

  // 3. Permanent licence applied, test not booked yet
  if (state.dl.submitted) {
    const d = state.ll.date ? llDates(state.ll.date) : null;
    return {
      kind: 'dlApplied', tint: 'sky',
      eyebrow: ['sit.dl.eyebrow'], h: ['sit.dl.h'], sub: d ? ['sit.dl.sub', { date: d.expires }] : ['sit.dl.sub0'],
      facts: [
        { k: 'sit.f.applied', date: state.dl.paidAt, ago: daysAgo(state.dl.paidAt, today) },
        { k: 'sit.f.accepted', date: dl?.done.docs, pending: !dl?.done.docs },
        { k: 'sit.f.appNo', text: state.dl.appNo, mono: true },
        d && { k: 'sit.f.validTill', date: d.expires, left: daysBetween(today, d.expires) },
      ].filter(Boolean),
      next: { k: 'sit.btn.book', to: '/permanent' },
    };
  }

  // 2. Holding a learner's licence
  if (state.ll.date) {
    const d = llDates(state.ll.date);
    const held = daysAgo(state.ll.date, today);
    const toApply = daysBetween(today, d.applyFrom);
    const left = daysBetween(today, d.expires);
    const total = daysBetween(state.ll.date, d.expires);
    const expired = left < 0;
    const can = !expired && toApply <= 0;
    return {
      kind: 'llHeld', tint: expired ? 'blush' : can ? 'sage' : 'butter',
      eyebrow: ['sit.ll.eyebrow'],
      h: expired ? ['sit.ll.hExpired'] : can ? ['sit.ll.hNow'] : ['sit.ll.h', { n: toApply }],
      sub: expired ? ['sit.ll.subExpired'] : can ? ['sit.ll.subNow', { date: d.expires }] : ['sit.ll.sub'],
      facts: [
        { k: 'sit.f.held', days: held },
        { k: 'sit.f.issued', date: state.ll.date },
        { k: 'sit.f.applyFrom', date: d.applyFrom, now: can },
        { k: 'sit.f.validTill', date: d.expires, left },
      ],
      bar: { pos: Math.min(1, held / total), mark: config.dlWaitDays / total, warn: left >= 0 && left < 30 },
      next: expired ? { k: 'sit.btn.applyLLAgain', to: '/service/ll' } : can ? { k: 'sit.btn.applyDL', to: '/permanent' } : { k: 'sit.btn.prepare', to: '/driving-test' },
      also: expired ? [] : can
        ? [{ k: 'sit.btn.remindExp', ics: { title: ['sit.ics.exp', { date: d.expires }], date: addDays(d.expires, -15), time: '10:00', note: ['sit.ics.note'] } }]
        : [{ k: 'sit.btn.remind30', vars: { date: d.applyFrom }, ics: { title: ['sit.ics.dl'], date: d.applyFrom, time: '10:00', note: ['sit.ics.note'] } }, { k: 'sit.btn.game', to: '/road-game' }],
    };
  }

  // 1. Learner's licence applied, not issued yet
  if (state.app.submitted && ll) {
    return {
      kind: 'llApplied', tint: 'butter',
      eyebrow: ['sit.lla.eyebrow'], h: ['sit.lla.h'], sub: ['sit.lla.sub'],
      facts: [
        { k: 'sit.f.applied', date: ll.done.applied, ago: daysAgo(ll.done.applied, today) },
        { k: 'sit.f.accepted', date: ll.done.docs, pending: !ll.done.docs },
        { k: 'sit.f.appNo', text: ll.no, mono: true },
      ],
      next: { k: 'sit.btn.practise', to: '/mock' },
      also: [{ k: 'sit.btn.gotLL', to: '/permanent' }],
    };
  }

  // 0b. A lost / renew / address request, with no licence journey
  if (lastReq) {
    const st = stagesFor('req');
    const at = st.findIndex((x) => !lastReq.done[x]);
    const last = at < 0 ? st[st.length - 1] : st[Math.max(0, at - 1)];
    const nextStage = at < 0 ? null : st[at];
    const svc = serviceById[lastReq.service];
    const nextDate = nextStage ? addDays(lastReq.at, { applied: 0, docs: 1, processing: 2, printed: 6, posted: 8 }[nextStage]) : null;
    return {
      kind: 'request', tint: svc?.tint || 'blush', service: lastReq.service,
      eyebrow: ['sit.req.eyebrow', { service: svc?.title }], h: ['sit.req.h.' + last], sub: lastReq.service === 'duplicate' ? ['sit.req.subLost'] : ['sit.req.sub'],
      facts: [
        { k: 'sit.f.applied', date: lastReq.at, ago: daysAgo(lastReq.at, today) },
        { k: 'sit.f.accepted', date: lastReq.done.docs, pending: !lastReq.done.docs },
        nextStage && { k: 'sit.f.nextStage', stage: nextStage, date: nextDate },
        { k: 'sit.f.appNo', text: lastReq.no, mono: true },
      ].filter(Boolean),
      next: { k: 'sit.btn.track', to: '/track?no=' + lastReq.no },
    };
  }

  // 0c. A request saved but still waiting to send (no internet or a busy server)
  const waiting = (state.outbox || []).filter((x) => x.request).map((x) => x.request);
  const q = waiting[waiting.length - 1];
  if (q) {
    const svc = serviceById[q.service];
    return {
      kind: 'request', tint: svc?.tint || 'blush', service: q.service,
      eyebrow: ['sit.req.eyebrow', { service: svc?.title }], h: ['sit.req.h.waiting'], sub: ['sit.req.subWaiting'],
      facts: [
        { k: 'sit.f.savedOn', date: q.at, ago: daysAgo(q.at, today) },
        { k: 'sit.f.appNo', text: q.no, mono: true },
      ],
      next: { k: 'sit.btn.track', to: '/track?no=' + q.no },
    };
  }

  return { kind: 'start' };
}

// What has this person already done? Newest first. Each: { date, k, vars, to }
export function history(state) {
  const apps = ownApps(state);
  const out = [];
  const ll = apps.find((a) => a.type === 'll');
  const dl = apps.find((a) => a.type === 'dl');
  if (state.app.startedAt && !state.app.submitted) out.push({ date: state.app.startedAt, k: 'done.llStarted', to: '/apply' });
  if (ll) {
    out.push({ date: ll.done.applied, k: 'done.llApplied', vars: { no: ll.no }, to: '/track?no=' + ll.no });
    if (ll.done.docs && !state.ll.date) out.push({ date: ll.done.docs, k: 'done.llAccepted', to: '/track?no=' + ll.no });
  }
  const tests = state.tests || [];
  if (tests.length) {
    const best = Math.max(...tests.map((x) => x.score));
    out.push({ date: tests[tests.length - 1].at?.slice(0, 10), k: 'done.mock', vars: { count: tests.length, best, total: tests[0].total }, to: '/mock' });
  }
  if (state.game?.plays) out.push({ date: state.game.at, k: 'done.game', vars: { best: state.game.best }, to: '/road-game' });
  if (state.ll.date) out.push({ date: state.ll.date, k: 'done.llIssued', to: '/permanent' });
  if (dl) {
    out.push({ date: dl.done.applied, k: 'done.dlApplied', vars: { no: dl.no }, to: '/track?no=' + dl.no });
  }
  if (state.slot.date) out.push({ date: state.slot.bookedAt, k: 'done.booked', vars: { date: state.slot.date, time: state.slot.time }, to: '/permanent' });
  if (state.drivingPassed) out.push({ date: state.drivingPassedAt, k: 'done.passed', to: '/track' });
  for (const r of apps.filter((a) => a.type === 'req')) {
    out.push({ date: r.at, k: 'done.req', vars: { service: serviceById[r.service]?.title, no: r.no }, to: '/track?no=' + r.no });
    if (r.done.docs) out.push({ date: r.done.docs, k: 'done.reqAccepted', vars: { service: serviceById[r.service]?.title }, to: '/track?no=' + r.no });
  }
  if (state.security?.on) out.push({ date: null, k: state.security.phone ? 'done.lockedPhone' : 'done.lockedPin', to: '/settings' });
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
