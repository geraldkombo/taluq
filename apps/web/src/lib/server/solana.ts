/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import 'server-only';

import bs58 from 'bs58';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToCheckedInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

import { deriveSilentWalletKeypair } from './silentWallet';

export function getSolanaConnection(): Connection {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) throw new Error('Missing SOLANA_RPC_URL');
  return new Connection(rpcUrl, { commitment: 'confirmed' });
}

export function getProtocolAdminKeypair(): Keypair {
  const secret = process.env.SOLANA_ADMIN_SECRET_KEY_BASE58;
  if (!secret) {
    throw new Error('Missing SOLANA_ADMIN_SECRET_KEY_BASE58');
  }
  return Keypair.fromSecretKey(bs58.decode(secret));
}

export async function mintTkesToPhone(params: { tkesMint: string; phoneNumberE164: string; amount: bigint }) {
  const connection = getSolanaConnection();
  const admin = getProtocolAdminKeypair();

  const mint = new PublicKey(params.tkesMint);
  const userWallet = deriveSilentWalletKeypair(params.phoneNumberE164);
  const ata = getAssociatedTokenAddressSync(mint, userWallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

  const ixs = [
    createAssociatedTokenAccountIdempotentInstruction(
      admin.publicKey,
      ata,
      userWallet.publicKey,
      mint,
      TOKEN_2022_PROGRAM_ID,
    ),
    createMintToCheckedInstruction(
      mint,
      ata,
      admin.publicKey,
      params.amount,
      2,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  ];

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction({
    feePayer: admin.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(...ixs);

  tx.sign(admin);

  const signature = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

  return { signature, ata: ata.toBase58(), wallet: userWallet.publicKey.toBase58() };
}
