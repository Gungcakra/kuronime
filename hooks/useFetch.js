'use client';

import { useCallback, useEffect, useState } from 'react';

// ~13s of retries before giving up, so a slow or flaky upstream (or a route
// still compiling in dev) keeps the skeleton up instead of flashing an error
const RETRY_DELAYS = [600, 1200, 2500, 4000, 5000];

// Only a confirmed miss or a malformed request is final. Everything else
// (network failure, timeout, 5xx, a 404 from a route that isn't ready yet)
// is retried.
function isRetryable(err) {
  if (err.notFound) return false;
  return err.status !== 400;
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(signal.reason);
    }, { once: true });
  });
}

// Runs loader(signal) whenever deps change. Transient failures are retried
// silently so the UI stays in its loading state instead of flashing an error.
export function useFetch(loader, deps) {
  const key = JSON.stringify(deps);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      for (let i = 0; ; i++) {
        try {
          const data = await loader(signal);
          if (!signal.aborted) setState({ key, data, error: null });
          return;
        } catch (err) {
          if (signal.aborted) return;
          if (i >= RETRY_DELAYS.length || !isRetryable(err)) {
            setState({ key, data: null, error: err });
            return;
          }
          try {
            await wait(RETRY_DELAYS[i], signal);
          } catch {
            return;
          }
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => {
    setState(s => ({ ...s, key: null }));
    setAttempt(a => a + 1);
  }, []);

  // State from a previous key (or a pending retry) counts as still loading,
  // so stale data or a stale error is never rendered for the new request.
  const fresh = state.key === key;
  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : null,
    loading: !fresh,
    retry
  };
}
