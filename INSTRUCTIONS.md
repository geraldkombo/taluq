# TALUQ — Instructions (Start Here)

## What’s inside
- Product overview and docs hub: [README.md](./README.md)
- Step-by-step to go live (Railway + Paystack): [LAUNCH_PLAYBOOK.md](./LAUNCH_PLAYBOOK.md)
- Paystack office checklist (Live Mode): [PAYSTACK_OFFICE_VISIT.md](./PAYSTACK_OFFICE_VISIT.md)
- Pitch kit + outreach copy/paste: [PITCH_KIT.md](./PITCH_KIT.md), [OUTREACH_TEMPLATES.md](./OUTREACH_TEMPLATES.md)
- 2–3 minute demo script: [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

## Run locally (fast path)
### 1) Install
```bash
pnpm install
```

### 2) Configure environment
```bash
cp apps/web/.env.example apps/web/.env
```
Edit `apps/web/.env` and set real values (Postgres URL, Paystack key, Solana key, mint address, pepper).

### 3) Initialize database schema
```bash
pnpm -C apps/web dlx prisma db push
```

### 4) Start dev server
```bash
pnpm dev
```
Open `http://localhost:3000`.

## Using the Chat Wallet
- Home (`/`) is the Chat Wallet.
- Direct route: `/chat`
- Commands: `balance`, `send <phone> <amount>`, `receive`, `deposit <amount>`, `help`, `lock`

## Deploy (recommended)
Use Railway (always-on container + built-in Postgres). Follow [LAUNCH_PLAYBOOK.md](./LAUNCH_PLAYBOOK.md).
