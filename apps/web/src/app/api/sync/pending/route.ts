/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST() {
  await prisma.websocketHealthEvent.create({
    data: {
      endpoint: 'service-worker',
      status: 'SYNC',
      detail: 'Background sync triggered',
    },
  });

  return NextResponse.json({ ok: true });
}

