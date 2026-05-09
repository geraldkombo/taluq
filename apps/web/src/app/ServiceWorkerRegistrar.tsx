/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(() => {
        navigator.serviceWorker.ready.then((reg) => {
          if (!reg.active) return;
          reg.active.postMessage({ type: 'REGISTER_SYNC' });
        });
      })
      .catch(() => {});
  }, []);

  return null;
}

