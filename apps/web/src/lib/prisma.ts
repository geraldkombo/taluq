/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var __taluqPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__taluqPrisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    ),
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.__taluqPrisma = prisma;
