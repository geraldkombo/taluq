/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

import { getAtaBalance } from '@/app/actions';

type Status = 'connecting' | 'websocket' | 'polling' | 'offline';

export function useHybridAtaBalance(params: { rpcUrl: string; ata?: string }) {
  const [balance, setBalance] = useState('0.00');
  const [status, setStatus] = useState<Status>('connecting');
  const lastBalanceRef = useRef('0.00');
  const [increased, setIncreased] = useState(false);

  const ataKey = useMemo(() => (params.ata ? new PublicKey(params.ata) : null), [params.ata]);
  const connection = useMemo(() => new Connection(params.rpcUrl, { commitment: 'confirmed' }), [params.rpcUrl]);

  useEffect(() => {
    let subId: number | null = null;
    let pollTimer: number | null = null;
    let destroyed = false;

    async function poll() {
      if (!params.ata) return;
      try {
        const next = await getAtaBalance(params.ata);
        if (destroyed) return;
        const prev = lastBalanceRef.current;
        lastBalanceRef.current = next;
        setBalance(next);
        setIncreased(Number(next) > Number(prev));
        setStatus('polling');
      } catch {
        if (destroyed) return;
        setStatus('offline');
      }
    }

    function startPolling() {
      if (pollTimer) return;
      poll();
      pollTimer = window.setInterval(poll, 3500);
    }

    function stopPolling() {
      if (!pollTimer) return;
      window.clearInterval(pollTimer);
      pollTimer = null;
    }

    async function start() {
      if (!ataKey) {
        setBalance('0.00');
        setStatus('connecting');
        return;
      }

      await poll();

      try {
        subId = connection.onAccountChange(
          ataKey,
          () => {
            poll();
          },
          'confirmed',
        );
        setStatus('websocket');
        stopPolling();

        const ws = (connection as unknown as { _rpcWebSocket?: WebSocket })._rpcWebSocket;
        if (ws) {
          ws.onclose = () => startPolling();
          ws.onerror = () => startPolling();
          ws.onopen = () => {
            stopPolling();
            setStatus('websocket');
          };
        }
      } catch {
        startPolling();
      }
    }

    start();

    return () => {
      destroyed = true;
      if (subId !== null) {
        try {
          connection.removeAccountChangeListener(subId);
        } catch {}
      }
      if (pollTimer) window.clearInterval(pollTimer);
    };
  }, [ataKey, params.ata, connection]);

  return { balance, status, increased };
}
