import { useEffect } from 'react';
import { useStore } from './store.jsx';
import { useI18n } from './i18n/index.js';

// Send queue: if the internet is off or the server is busy, applications wait here
// and the app keeps trying on its own (3s, 6s, 12s... up to 1 minute apart).
// In this prototype "the server" is simulated; Settings has a demo switch to make it busy.

export function toast(msg) {
  window.dispatchEvent(new CustomEvent('ls-toast', { detail: msg }));
}

// Try to send now. Returns 'sent' or the reason it is waiting ('offline' | 'busy').
export function trySend(state, tries = 0) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  if (state.settings.demoBusy && tries < 2) return 'busy';
  return 'sent';
}

const backoff = (tries) => Math.min(60000, 3000 * 2 ** tries);

export function queueItem(item, reason) {
  return { ...item, reason, tries: 0, nextAt: Date.now() + backoff(0) };
}

// Runs in the background while the app is open
export function QueueRunner() {
  const { state, update } = useStore();
  const { t } = useI18n();
  const outbox = state.outbox || [];

  useEffect(() => {
    if (!outbox.length) return;
    const tick = () => {
      const now = Date.now();
      const due = outbox.filter((x) => x.nextAt <= now);
      if (!due.length) return;
      let sent = 0;
      update((s) => {
        s.outbox = (s.outbox || []).flatMap((x) => {
          if (x.nextAt > now) return [x];
          const r = trySend(s, x.tries + 1);
          if (r === 'sent') {
            s.requests = [...(s.requests || []), x.request];
            sent++;
            return [];
          }
          return [{ ...x, reason: r, tries: x.tries + 1, nextAt: now + backoff(x.tries + 1) }];
        });
      });
      if (sent) toast(t('q.sent'));
    };
    const id = setInterval(tick, 1500);
    window.addEventListener('online', tick);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', tick);
    };
  }, [outbox, update, t]);

  return null;
}
