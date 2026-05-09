/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import Link from 'next/link';
import { ChatWallet } from '@/components/ChatWallet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function AdminVoiceChatPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-amber-500">
      <div className="mx-auto w-full max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold tracking-widest uppercase">
              Voice Chat (Admin)
            </h1>
            <p className="mt-2 text-xs text-amber-500/60">
              ElevenLabs TTS is enabled here for authenticated admins only
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-amber-500/20 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200/80 hover:bg-zinc-900/60"
          >
            Back to Admin
          </Link>
        </header>
      </div>

      <ChatWallet enableTts />
    </main>
  );
}

