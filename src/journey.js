import { ageOn } from './utils.js';
// The six stages of the licence journey and where each one is done in the app.
export const stageRoutes = ['/eligibility', '/apply', '/mock', '/permanent', '/driving-test', '/track'];

export function stageDone(s) {
  return [
    s.elig.ok === true || !!s.app.submitted || !!(s.profile?.dob && ageOn(s.profile.dob) >= 16),
    !!s.app.submitted,
    !!s.ll.date,
    !!(s.dl.submitted && s.slot.date),
    !!s.drivingPassed,
    false, // the licence arriving is shown on the tracker
  ];
}

export function currentStage(s) {
  // Stages happen in order, so the furthest finished stage decides where you are
  const done = stageDone(s);
  const last = done.lastIndexOf(true);
  return Math.min(5, Math.max(last + 1, s.stageMin || 0));
}

// Score a test: right answers, and pass if score reaches the pass mark
export function scoreTest(qs, answers, passMark) {
  const score = qs.reduce((n, q, k) => n + (answers[k] === q.answer ? 1 : 0), 0);
  return { score, total: qs.length, pass: score >= passMark };
}

// Readiness from the last three real-mode tests: average score as a percentage
export function readiness(tests, passMark, count) {
  const last = tests.slice(-3);
  if (!last.length) return null;
  const pct = Math.round((last.reduce((a, x) => a + x.score / x.total, 0) / last.length) * 100);
  const passPct = (passMark / count) * 100;
  const allPassed = last.length === 3 && last.every((x) => x.pass);
  const level = allPassed && pct >= 80 ? 'ready' : pct >= passPct ? 'almost' : 'notReady';
  return { pct, level, n: last.length };
}
