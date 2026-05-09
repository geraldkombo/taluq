/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const SignatureHeader = 'x-paystack-signature';

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const signature = req.headers[SignatureHeader];
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ ok: false, error: 'Missing signature' });
    return;
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ ok: false, error: 'Missing PAYSTACK_SECRET_KEY' });
    return;
  }

  const rawBodyBuf = await readRawBody(req);
  const rawBody = rawBodyBuf.toString('utf8');

  // Verify HMAC-SHA512
  const expectedSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    res.status(401).json({ ok: false, error: 'Invalid signature' });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON' });
    return;
  }

  const data = payload?.data;
  const reference = typeof data?.reference === 'string' ? data.reference : null;
  const paystackId = data?.id != null ? String(data.id) : null;
  if (!reference || !paystackId) {
    res.status(400).json({ ok: false, error: 'Missing reference/id' });
    return;
  }

  const existing = await prisma.transaction.findFirst({
    where: {
      OR: [{ reference }, { paystackId }],
    },
    select: { id: true },
  });

  if (existing) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  const rawPayloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
  const receivedAmount = typeof data?.amount === 'number' ? data.amount / 100 : 0;
  const phone = data?.customer?.phone ? String(data.customer.phone) : 'UNKNOWN';

  try {
    await prisma.transaction.create({
      data: {
        reference,
        paystackId,
        phoneNumber: phone,
        amount: new Prisma.Decimal(receivedAmount),
        expectedAmount: new Prisma.Decimal(receivedAmount),
        status: 'COMPLETED',
        hmacSignature: signature,
        rawPayloadHash,
      },
    });
    // Log only when this transaction is new
    console.info('[receive_paid] New Paystack transaction', { reference, paystackId });
  } catch (error) {
    // Idempotency safety for races
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }
    res.status(500).json({ ok: false, error: 'Internal Server Error' });
    return;
  }

  res.status(200).json({ ok: true, created: true });
}

