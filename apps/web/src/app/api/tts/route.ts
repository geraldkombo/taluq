/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';

import { shouldBypassAdminAuth } from '@/lib/auth/adminGate';
import { resolveAdminJwtSecret } from '@/lib/auth/adminSecret';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_COOKIE = 'taluq_admin';

async function requireAdmin(): Promise<boolean> {
  if (
    shouldBypassAdminAuth({
      nodeEnv: process.env.NODE_ENV,
      bypassFlag: process.env.ADMIN_AUTH_BYPASS,
    })
  ) {
    return true;
  }

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

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

const BodySchema = z.object({
  text: z.string().min(1).max(600),
  voiceId: z.string().optional(),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const voiceId = parsed.data.voiceId || process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    return NextResponse.json({ ok: false, error: 'Missing ELEVENLABS_VOICE_ID' }, { status: 500 });
  }

  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: parsed.data.text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const msg = await upstream.text().catch(() => 'Upstream error');
    return NextResponse.json(
      { ok: false, error: 'ElevenLabs request failed', detail: msg.slice(0, 600) },
      { status: 502 },
    );
  }

  // Stream audio to the client.
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}

