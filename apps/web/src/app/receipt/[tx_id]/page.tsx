/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function ReceiptPage({ params }: { params: Promise<{ tx_id: string }> }) {
  const resolvedParams = await params;
  const tx = await prisma.transaction.findUnique({
    where: { id: resolvedParams.tx_id },
  });

  if (!tx || tx.status !== 'COMPLETED') {
    notFound();
  }

  const initials = tx.phoneNumber.substring(0, 2).replace('+', 'A') || '??';
  const last4 = tx.phoneNumber.slice(-4) || '0000';

  return (
    <main className="min-h-screen bg-black text-[#f59e0b] font-mono p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm border-2 border-[#f59e0b] p-8 rounded-xl bg-black shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <header className="text-center mb-8 border-b-2 border-[#f59e0b] pb-6">
          <h1 className="text-3xl font-bold tracking-[0.3em] uppercase">[ T A L U Q ]</h1>
          <p className="text-xs mt-2 opacity-80 uppercase tracking-widest">
            Gerald Shikunyi Kombo (Digital Services)
          </p>
        </header>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#f59e0b]/20 pb-2">
            <span className="text-xs uppercase opacity-70 tracking-widest">Amount</span>
            <span className="text-xl font-bold">{Number(tx.amount).toFixed(2)} KES</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-[#f59e0b]/20 pb-2">
            <span className="text-xs uppercase opacity-70 tracking-widest">Payer ID</span>
            <span className="text-sm font-bold uppercase">{initials} &bull; ****{last4}</span>
          </div>

          <div className="flex justify-between items-center border-b border-[#f59e0b]/20 pb-2">
            <span className="text-xs uppercase opacity-70 tracking-widest">Date</span>
            <span className="text-xs font-bold text-right">
              {new Date(tx.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="pt-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] uppercase opacity-70 tracking-widest">Solana Tx Hash (Immutable Seal)</span>
            <div className="w-full break-all bg-[#f59e0b]/10 p-3 rounded text-[10px] text-center border border-[#f59e0b]/30">
              {tx.solanaSignature || 'Pending Network Confirmation'}
            </div>
          </div>
        </div>

        <footer className="mt-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#f59e0b] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">&#10003;</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-60">
            Cryptographic Visual Finality
          </p>
        </footer>
      </div>
    </main>
  );
}
