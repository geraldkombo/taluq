/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { adminLogin } from '../actions';

type State = { ok: boolean; error?: string };

const initialState: State = { ok: false };

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(adminLogin, initialState);

  useEffect(() => {
    if (state.ok) router.replace('/admin');
  }, [state.ok, router]);

  return (
    <main className="min-h-screen bg-zinc-950 text-amber-500 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-amber-500/15 bg-zinc-950/60 p-6">
        <h1 className="text-lg font-semibold tracking-widest uppercase">Admin</h1>
        <p className="mt-2 text-xs text-amber-500/60">
          Master authority dashboard access
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs tracking-widest uppercase text-amber-500/60">
              Email
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="gerald@geraldkombo.com…"
              className="mt-2 w-full rounded-xl bg-zinc-900/70 border border-amber-500/15 px-4 py-3 text-amber-200 focus:outline-none focus:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            />
          </label>

          <label className="block">
            <span className="text-xs tracking-widest uppercase text-amber-500/60">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl bg-zinc-900/70 border border-amber-500/15 px-4 py-3 text-amber-200 focus:outline-none focus:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            />
          </label>

          {state.error ? (
            <div className="text-xs text-red-400">{state.error}</div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 text-zinc-950 py-3 font-bold tracking-widest uppercase active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
