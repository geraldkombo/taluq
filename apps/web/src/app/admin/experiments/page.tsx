/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import Link from 'next/link';
import { ExperimentsClient } from './ExperimentsClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminExperimentsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-amber-500 p-6">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <header className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold tracking-widest uppercase">
              Experiments
            </h1>
            <p className="mt-2 text-xs text-amber-500/60">
              Create, edit, and delete experiments
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-amber-500/20 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200/80 hover:bg-zinc-900/60"
          >
            Back to Admin
          </Link>
        </header>

        <ExperimentsClient />
      </div>
    </main>
  );
}

