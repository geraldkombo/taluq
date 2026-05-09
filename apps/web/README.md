# Taluq Web App (apps/web)

This is the Next.js (App Router) web application for Taluq.

## Local development

### 1) Install (repo root)
From the monorepo root:
```bash
pnpm install
```

### 2) Configure environment variables
```bash
cp apps/web/.env.example apps/web/.env
```
Edit `apps/web/.env` and set real values.

### 3) Initialize Prisma schema
```bash
pnpm -C apps/web dlx prisma db push
```

### 4) Start dev server
```bash
pnpm -C apps/web dev
```
Open `http://localhost:3000`.

## Production deployment (Railway recommended)
Use the repo-level guide:
- `../../DEPLOYMENT_GUIDE.md`

## Optional: ElevenLabs TTS (admin-only)
If `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` are set, admins can use:
- `/admin/voice-chat` (UI)
- `POST /api/tts` (streams `audio/mpeg`)
