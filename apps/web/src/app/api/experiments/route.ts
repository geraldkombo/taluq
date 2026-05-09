/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { shouldBypassAdminAuth } from '@/lib/auth/adminGate';
import { resolveAdminJwtSecret } from '@/lib/auth/adminSecret';

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

const ExperimentInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const experiments = await prisma.experiment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ ok: true, experiments });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = ExperimentInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const created = await prisma.experiment.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      isActive: parsed.data.isActive ?? false,
    },
  });

  return NextResponse.json({ ok: true, experiment: created }, { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = ExperimentInputSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const updated = await prisma.experiment.update({
    where: { id },
    data: {
      ...(parsed.data.name != null ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description ?? null } : {}),
      ...(parsed.data.isActive != null ? { isActive: parsed.data.isActive } : {}),
    },
  });

  return NextResponse.json({ ok: true, experiment: updated });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  }

  await prisma.experiment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

