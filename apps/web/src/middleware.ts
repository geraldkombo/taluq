/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

import { shouldBypassAdminAuth } from '@/lib/auth/adminGate';
import { resolveAdminJwtSecret } from '@/lib/auth/adminSecret';

const ADMIN_COOKIE = 'taluq_admin';
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitBucket = { count: number; resetAt: number };

function getRateLimitStore(): Map<string, RateLimitBucket> {
  const g = globalThis as unknown as { __taluqRateLimit?: Map<string, RateLimitBucket> };
  if (!g.__taluqRateLimit) g.__taluqRateLimit = new Map();
  return g.__taluqRateLimit;
}

function getClientIp(req: NextRequest) {
  const header = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (header) return header.split(',')[0].trim();
  // `ip` may be undefined depending on runtime/proxy
  return req.ip ?? 'UNKNOWN';
}

async function verifyAdminJwt(token: string): Promise<boolean> {
  const secret = resolveAdminJwtSecret({
    nodeEnv: process.env.NODE_ENV,
    envSecret: process.env.ADMIN_JWT_SECRET,
  });
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limiting (10 requests per minute per IP).
  // NOTE: This is best-effort in-memory enforcement per edge instance.
  {
    const ip = getClientIp(req);
    const now = Date.now();
    const store = getRateLimitStore();
    const bucket = store.get(ip);

    if (!bucket || now >= bucket.resetAt) {
      store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
      bucket.count += 1;
      if (bucket.count > RATE_LIMIT_MAX) {
        const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
          },
        });
      }
    }
  }

  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login') return NextResponse.next();

  if (
    shouldBypassAdminAuth({
      nodeEnv: process.env.NODE_ENV,
      bypassFlag: process.env.ADMIN_AUTH_BYPASS,
    })
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));

  const ok = await verifyAdminJwt(token);
  if (!ok) return NextResponse.redirect(new URL('/admin/login', req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)'],
};
