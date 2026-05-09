/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import Link from 'next/link';
import { getDashboardData } from './actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { merchants, transactions, wsEvents } = await getDashboardData();

  return (
    <main className="min-h-screen bg-zinc-950 text-amber-500 p-6">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <header className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold tracking-widest uppercase">
              Taluq Admin
            </h1>
            <p className="mt-2 text-xs text-amber-500/60">
              Merchant onboarding, WebSocket health, and transaction logs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/voice-chat"
              className="rounded-lg border border-amber-500/20 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200/80 hover:bg-zinc-900/60"
            >
              Voice Chat
            </Link>
            <Link
              href="/admin/experiments"
              className="rounded-lg border border-amber-500/20 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200/80 hover:bg-zinc-900/60"
            >
              Experiments
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/15 bg-zinc-950/60 p-5">
            <h2 className="text-sm font-semibold tracking-widest uppercase">
              Merchants
            </h2>
            <div className="mt-4 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-amber-500/60">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants.map((m) => (
                    <tr key={m.id} className="border-t border-amber-500/10">
                      <td className="py-2 pr-4 font-medium">{m.name}</td>
                      <td className="py-2 pr-4">{m.phoneNumber}</td>
                      <td className="py-2 pr-4">
                        <span className="font-mono text-amber-200/80">
                          {m.walletAddress.slice(0, 6)}…{m.walletAddress.slice(-6)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {merchants.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-amber-500/50">
                        No merchants yet
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/15 bg-zinc-950/60 p-5">
            <h2 className="text-sm font-semibold tracking-widest uppercase">
              WebSocket Health
            </h2>
            <div className="mt-4 space-y-2">
              {wsEvents.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-amber-500/10 bg-zinc-900/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs font-mono text-amber-200/80">
                      {e.endpoint}
                    </div>
                    <div className="text-[10px] tracking-widest uppercase text-amber-500/60">
                      {e.status}
                    </div>
                  </div>
                  {e.detail ? (
                    <div className="mt-2 text-xs text-amber-500/60">
                      {e.detail}
                    </div>
                  ) : null}
                </div>
              ))}
              {wsEvents.length === 0 ? (
                <div className="text-xs text-amber-500/50">No events yet</div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/15 bg-zinc-950/60 p-5">
          <h2 className="text-sm font-semibold tracking-widest uppercase">
            Transactions
          </h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-amber-500/60">
                <tr>
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Solana</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-amber-500/10">
                    <td className="py-2 pr-4 font-mono text-amber-200/80">
                      {t.reference.slice(0, 10)}…
                    </td>
                    <td className="py-2 pr-4">{t.phoneNumber}</td>
                    <td className="py-2 pr-4">{t.amount.toString()}</td>
                    <td className="py-2 pr-4">{t.status}</td>
                    <td className="py-2 pr-4 font-mono text-amber-200/80">
                      {t.solanaSignature ? `${t.solanaSignature.slice(0, 10)}…` : '-'}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-amber-500/50">
                      No transactions yet
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
