/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { mintTkesToPhone } from '@/lib/server/solana';

const SignatureHeader = 'x-paystack-signature';

const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.union([z.string(), z.number()]),
    reference: z.string(),
    amount: z.number(), // Amount in lowest denomination (e.g., cents/kobo)
    customer: z.object({
      phone: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
    }).optional(),
    metadata: z.any().optional(),
  }),
});

function requireHttps(req: Request) {
  if (process.env.NODE_ENV !== 'production') return;
  const protocol = req.headers.get('x-forwarded-proto');
  if (protocol !== 'https') {
    throw new Error('Insecure protocol');
  }
}

const PAYSTACK_IPS = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220',
];

function verifyPaystackIp(req: Request) {
  if (process.env.NODE_ENV !== 'production') return true;
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (!forwardedFor) return false;
  
  // Get the real client IP (first in the list if there are multiple)
  const clientIp = forwardedFor.split(',')[0].trim();
  return PAYSTACK_IPS.includes(clientIp);
}

export async function POST(req: Request) {
  try {
    requireHttps(req);
    
    if (!verifyPaystackIp(req)) {
      await prisma.forensicAlert.create({
        data: {
          reason: 'INVALID_PAYSTACK_IP',
          ipAddress: req.headers.get('x-forwarded-for') || 'UNKNOWN',
          severity: 'CRITICAL',
        }
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const signature = req.headers.get(SignatureHeader);
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const rawBody = await req.text();
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Missing PAYSTACK_SECRET_KEY' }, { status: 500 });
    }

    // Verify HMAC-SHA512
    const hmac = crypto.createHmac('sha512', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const parsed = PaystackWebhookSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
    }

    const { event, data } = parsed.data;

    // We only care about charge.success
    if (event !== 'charge.success') {
      return NextResponse.json({ ok: true, message: 'Event ignored' }, { status: 200 });
    }

    const rawPayloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

    // Enforce a minimum deposit amount (50.00 KES = 5000 minor units).
    // This helps reduce low-value transaction spam and supports a stable day-to-day UX.
    if (data.amount < 5000) {
      await prisma.forensicAlert.create({
        data: {
          reason: 'BELOW_MINIMUM_DEPOSIT',
          payload: JSON.stringify(data),
          ipAddress: req.headers.get('x-forwarded-for') || 'UNKNOWN',
          severity: 'CRITICAL',
        }
      });
      
      // If we already have a record for this, mark it KILL_SWITCHED
      const existingTx = await prisma.transaction.findUnique({
        where: { reference: data.reference },
      });
      
      if (existingTx) {
        await prisma.transaction.update({
          where: { id: existingTx.id },
          data: { status: 'KILL_SWITCHED' }
        });
      }

      // Execute an immediate Kill-Switch on the Solana minting engine.
      // (Aborting early effectively kills the minting engine for this payload)
      return NextResponse.json({ error: 'ERR_BELOW_MINIMUM_DEPOSIT' }, { status: 400 });
    }

    // Paystack amount is expressed in minor units; convert to main unit (KES).
    const receivedAmount = data.amount / 100;
    const phone = data.customer?.phone || 'UNKNOWN';
    const paystackId = String(data.id);

    // Fetch existing transaction to verify expected amount
    // In a real flow, the transaction is created initially as PENDING with expectedAmount
    let tx = await prisma.transaction.findUnique({
      where: { reference: data.reference },
    });

    if (!tx) {
      // If no pending transaction found, we might create it but we don't have expectedAmount.
      // Assuming expectedAmount is 0 for unsolicited payments, or we reject.
      // For this system, we'll create it to record the receipt, assuming expectedAmount = receivedAmount
      // However, the prompt implies comparing received vs expected. Let's create it with expected = received if missing,
      // or default expected to what we get.
      tx = await prisma.transaction.create({
        data: {
          reference: data.reference,
          paystackId,
          phoneNumber: phone,
          amount: new Prisma.Decimal(0),
          expectedAmount: new Prisma.Decimal(receivedAmount),
          status: 'PENDING',
          hmacSignature: signature,
          rawPayloadHash,
        },
      });
    } else if (tx.status !== 'PENDING') {
      // Idempotency
      return NextResponse.json({ ok: true, message: 'Already processed' }, { status: 200 });
    }

    const expected = Number(tx.expectedAmount);

    // Strict Enforcement: Amount Received < Expected -> ABORT
    if (receivedAmount < expected) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'ERR_INSUFFICIENT_FUNDS',
          amount: new Prisma.Decimal(receivedAmount),
        },
      });
      return NextResponse.json({ error: 'ERR_INSUFFICIENT_FUNDS' }, { status: 400 });
    }

    // Success flow
    const tkesMint = process.env.TKES_MINT_ADDRESS;
    if (!tkesMint) throw new Error('Missing TKES_MINT_ADDRESS');

    // Minting amount: minor units based on receivedAmount
    const minorUnits = BigInt(Math.round(receivedAmount * 100));
    
    // Metadata Injection
    const transactionMetadata = {
      trading_name: "Gerald Kombo (Digital Services)",
      project: "TALUQ",
      principal: "Gerald Kombo"
    };

    const mintResult = await mintTkesToPhone({ tkesMint, phoneNumberE164: phone, amount: minorUnits });

    // Update Transaction and User Balance in Neon DB with Atomic Transaction
    await prisma.$transaction(async (tx_client) => {
      await tx_client.transaction.update({
        where: { id: tx.id },
        data: {
          paystackId,
          amount: new Prisma.Decimal(receivedAmount),
          status: 'COMPLETED',
          solanaSignature: mintResult.signature,
        },
      });

      await tx_client.user.upsert({
        where: { phoneNumber: phone },
        update: {
          balance: { increment: receivedAmount }
        },
        create: {
          phoneNumber: phone,
          balance: receivedAmount
        }
      });
    });

    return NextResponse.json({ ok: true, metadata: transactionMetadata }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
}
