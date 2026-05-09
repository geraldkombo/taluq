/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
'use server';

import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { z } from 'zod';
import type { Merchant, Transaction, WebsocketHealthEvent } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { validateAdminCredentials } from '@/lib/auth/admin';
import { resolveAdminPassword } from '@/lib/auth/adminPassword';
import { resolveAdminJwtSecret } from '@/lib/auth/adminSecret';

const ADMIN_COOKIE = 'taluq_admin';

export async function adminLogin(_: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const expected = resolveAdminPassword({
    nodeEnv: process.env.NODE_ENV,
    envPassword: process.env.ADMIN_PASSWORD,
  });
  const secret = resolveAdminJwtSecret({
    nodeEnv: process.env.NODE_ENV,
    envSecret: process.env.ADMIN_JWT_SECRET,
  });
  const expectedEmail = process.env.ADMIN_EMAIL ?? 'gerald@geraldkombo.com';

  if (!expected || !secret || !expectedEmail) {
    return { ok: false, error: 'Server not configured' };
  }

  if (!validateAdminCredentials({ email, password, expectedEmail, expectedPassword: expected })) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(new TextEncoder().encode(secret));

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return { ok: true };
}

const MerchantSchema = z.object({
  name: z.string().min(2).max(80),
  phoneNumber: z.string().min(8).max(20),
  walletAddress: z.string().min(32).max(60),
});

export async function createMerchant(_: unknown, formData: FormData) {
  const input = MerchantSchema.safeParse({
    name: formData.get('name'),
    phoneNumber: formData.get('phoneNumber'),
    walletAddress: formData.get('walletAddress'),
  });

  if (!input.success) return { ok: false, error: 'Invalid input' };

  await prisma.merchant.create({ data: input.data });
  return { ok: true };
}

export async function getDashboardData() {
  const [merchants, transactions, wsEvents] = await Promise.all([
    prisma.merchant.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.websocketHealthEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  return {
    merchants: merchants as Merchant[],
    transactions: transactions as Transaction[],
    wsEvents: wsEvents as WebsocketHealthEvent[],
  };
}
