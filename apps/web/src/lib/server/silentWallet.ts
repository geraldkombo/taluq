/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import 'server-only';

import crypto from 'crypto';
import { Keypair } from '@solana/web3.js';

export function deriveSilentWalletKeypair(phoneNumberE164: string): Keypair {
  // Deterministic, seedless wallet derivation (server-only) using HKDF-SHA-256.
  // The pepper never leaves the backend, so the derived private key is never exposed to the client.
  const pepper = process.env.TALUQ_PEPPER;
  if (!pepper) {
    throw new Error('Missing TALUQ_PEPPER');
  }

  const inputKeyMaterial = Buffer.from(phoneNumberE164, 'utf8');
  const salt = Buffer.from(pepper, 'utf8');
  const info = Buffer.from('taluq-silent-wallet-hkdf-sha256-v1', 'utf8');

  const seed = crypto.hkdfSync('sha256', inputKeyMaterial, salt, info, 32);
  return Keypair.fromSeed(new Uint8Array(seed));
}
