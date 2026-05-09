# Paystack Office Visit Checklist (Kenya)

**Merchant Profile:** Taluq (The Sovereign Settlement Engine)

You’re going to Paystack to move from **Test Mode** to a production-ready integration. This is the fastest way to unblock Taluq’s fiat bridge.

## What to Carry
- National ID / Passport (owner/director)
- KRA PIN certificate (owner/director)
- Business registration documents (if available)
- A business bank account name + account details (for settlement)
- Your production domain and the webhook path: `/api/webhook/paystack`

## What to Ask For (Exact Questions)
1. “What is the fastest path to enabling **Live Mode** for a remittance + utility payments product?”
2. “What documents do you require for **KYB/KYC** in Kenya?”
3. “What are the **transaction limits** and what triggers a review?”
4. “What is the **settlement schedule** (T+0 / T+1) and is there a minimum payout threshold?”
5. “How do you recommend we structure customer identifiers if we use **phone numbers** as the primary identity?”
6. “Which Paystack endpoints are best for **Bank transfer vs Card** in Kenya for lowest friction?”
7. “Confirm webhook requirements: signature header, retries, and recommended IP allowlist.”

## Your Technical Notes (So You Speak Like a CTO)
- Webhook endpoint: `POST /api/webhook/paystack`
- Signature header: `x-paystack-signature`
- Verification method: HMAC-SHA512 using `PAYSTACK_SECRET_KEY`
- Minimum deposit enforced: 50 KES
- Security posture: HTTPS required in production + IP allowlist + strict schema validation

## After the Visit (Immediate Actions)
- Replace `PAYSTACK_SECRET_KEY` from `sk_test...` to `sk_live...` in Railway environment variables
- Point Paystack Webhook URL to your Railway domain (HTTPS)
- Run a small live transaction and verify:
  - webhook receives `charge.success`
  - DB transaction status becomes `COMPLETED`
  - Solana mint signature is recorded on the receipt

