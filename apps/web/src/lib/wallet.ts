/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

/**
 * Deterministic seedless wallet derivation utilizing an HKDF-SHA-256 hash.
 * Securely maps wallets to phone numbers without exposing private keys.
 */
export function deriveWalletFromPhone(phoneNumber: string, pepper: string): Keypair {
  // Step 1: Combine phone number with high-entropy off-chain secret pepper
  const inputKeyMaterial = Buffer.from(phoneNumber);
  const salt = Buffer.from(pepper);
  const info = Buffer.from('taluq-wallet-derivation-v1');

  // Step 2: Extract and Expand using HKDF-SHA-256 (32 bytes for Ed25519 seed)
  const seed = crypto.hkdfSync('sha256', inputKeyMaterial, salt, info, 32);

  // Step 3: Derive Ed25519 Keypair from the deterministic seed
  return Keypair.fromSeed(new Uint8Array(seed));
}
