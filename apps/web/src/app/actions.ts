/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
'use server';

import { PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';

import { getSolanaConnection } from '@/lib/server/solana';
import { deriveSilentWalletKeypair } from '@/lib/server/silentWallet';

export async function getSilentWalletInfo(phoneNumberE164: string) {
  const tkesMint = process.env.TKES_MINT_ADDRESS;
  if (!tkesMint) throw new Error('Missing TKES_MINT_ADDRESS');

  const connection = getSolanaConnection();
  const wallet = deriveSilentWalletKeypair(phoneNumberE164).publicKey;
  const mint = new PublicKey(tkesMint);
  const ata = getAssociatedTokenAddressSync(mint, wallet, false, TOKEN_2022_PROGRAM_ID);

  const balance = await connection.getTokenAccountBalance(ata, 'confirmed').catch(() => null);

  return {
    wallet: wallet.toBase58(),
    ata: ata.toBase58(),
    balance: balance?.value?.uiAmountString ?? '0.00',
  };
}

export async function getAtaBalance(ataBase58: string) {
  const connection = getSolanaConnection();
  const ata = new PublicKey(ataBase58);
  const balance = await connection.getTokenAccountBalance(ata, 'confirmed').catch(() => null);
  return balance?.value?.uiAmountString ?? '0.00';
}

export async function getRecentTransactions() {
  const { prisma } = await import('@/lib/prisma');
  const txs = await prisma.transaction.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      reference: true,
      amount: true,
      phoneNumber: true,
      createdAt: true,
      solanaSignature: true,
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return txs.map((tx: any) => ({
    ...tx,
    amount: tx.amount.toString(),
    createdAt: tx.createdAt.toISOString(),
  }));
}

