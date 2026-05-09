# TALUQ DEPLOYMENT GUIDE (Step-by-Step)

This guide covers **local development** and **production deployment on Railway**, including Paystack webhooks and the optional ElevenLabs TTS feature.

## 0) Prerequisites
- **Node.js** (LTS recommended) + **pnpm**
- A **GitHub repo** for this project
- A **Railway** account (for hosting + Postgres)
- A **Paystack** account (start with Test Mode)
- (Optional) An **ElevenLabs** account (for admin-only text-to-speech)

## 1) Run locally (development)
### 1.1 Install dependencies (repo root)
```bash
pnpm install
```

### 1.2 Configure environment variables
```bash
cp apps/web/.env.example apps/web/.env
```
Edit `apps/web/.env` and set real values (see the `.env.example` comments).

### 1.3 Initialize database schema
Taluq uses Prisma.
```bash
pnpm -C apps/web dlx prisma db push
```

### 1.4 Start the dev server
```bash
pnpm -C apps/web dev
```
Open `http://localhost:3000`.

## 2) Create a Railway project (production)
### 2.1 Create the project + add Postgres
1. Create a new Railway project
2. Add the **Postgres** plugin
3. Connect your GitHub repo as a Railway service

### 2.2 Set Railway build/start commands
In the Railway service settings:
- **Install Command:** `pnpm install`
- **Build Command:** `pnpm -C apps/web build`
- **Start Command:** `pnpm -C apps/web start`

### 2.3 Set environment variables
Use `apps/web/.env.example` as the source of truth.

At minimum you need:
- `DATABASE_URL` (Railway Postgres plugin provides this)
- `PAYSTACK_SECRET_KEY` (use `sk_test_...` first)
- `TKES_MINT_ADDRESS`
- `SOLANA_RPC_URL`
- `SOLANA_ADMIN_SECRET_KEY_BASE58`
- `TALUQ_PEPPER`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`
- `NEXT_PUBLIC_SOLANA_RPC_URL` (for the browser)

Optional:
- `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (for admin-only TTS)
- `ADMIN_AUTH_BYPASS` (only for staging/dev; do not enable in production)

### 2.4 Run Prisma in production
After the first deploy, run this once in Railway (service shell / one-off command):
```bash
pnpm -C apps/web dlx prisma db push
```

## 3) Domain + HTTPS (required for webhooks)
The Paystack webhook endpoint refuses non-HTTPS traffic in production. Ensure:
- Railway’s assigned domain has HTTPS enabled, or
- your custom domain has valid TLS

## 4) Configure Paystack webhook (Test → Live)
In Paystack dashboard, set your webhook URL to:
```
https://YOUR_DOMAIN/api/webhook/paystack
```

Notes:
- In production, the webhook handler performs an **IP allowlist** check on `x-forwarded-for`.
- A **50.00 KES minimum deposit** is enforced (smaller amounts are rejected and logged as forensic alerts).

## 5) Admin login + (optional) Voice Chat / ElevenLabs
### 5.1 Admin login
Open:
- `https://YOUR_DOMAIN/admin/login`

Use:
- Email = `ADMIN_EMAIL`
- Password = `ADMIN_PASSWORD`

### 5.2 Voice Chat (Admin)
Open:
- `https://YOUR_DOMAIN/admin/voice-chat`

If ElevenLabs env vars are set, the UI can request audio from:
- `POST /api/tts` (admin-authenticated; streams `audio/mpeg`)

## 6) Production smoke test checklist
- Load home Chat Wallet and link phone
- Run commands: `balance`, `receive`, `history`
- Verify `/admin/login` works and the session cookie is set
- Trigger a Paystack **test** event and confirm a receipt appears
- If enabled: open `/admin/voice-chat` and verify TTS audio plays
