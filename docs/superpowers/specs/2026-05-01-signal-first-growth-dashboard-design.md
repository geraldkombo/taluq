# Taluq — Signal‑First Growth Dashboard (May 2026) Design

## Objective
Build a “Signal‑First” growth dashboard inside Taluq Admin that replaces vanity metrics with decision-grade signals, using:
- The 90‑Day Purge (delete charts that didn’t drive decisions/experiments in last 90 days)
- AARRR funnel and Time‑to‑Activation
- “The Loop” (an experimentation feed: anomaly → question → hypothesis → experiment → learning)
- Offline→Online attribution with dual timestamping (`event_at` vs `synced_at`)

## Scope
### In Scope
- New admin area: `/admin/growth`
- New event layer in Prisma to store growth signals and attribution parameters
- Dashboard queries grouped by `event_at` (not `synced_at`) to avoid delayed-sync spikes
- Activation definition (Taluq): **Any of**
  - first deposit confirmed
  - first send completed
  - first receive paid
- UI modules:
  - 90‑Day Purge panel
  - The Loop (experimentation feed)
  - AARRR funnel + time‑to‑activation
  - Attribution bridge (source_id/channel/campaign/creative/segment)
  - 50/50 rule view (Harvesting vs Seeding)

### Out of Scope (V1)
- External analytics tooling (AppsFlyer etc.) as source of truth
- Full NL/LLM interpretation of messages (strict event schema only)
- Multi‑tenant dashboard across multiple products (Taluq only, V1)

## Data Model (Prisma)
### GrowthEvent (source of truth for growth)
**Purpose:** capture business signals with attribution and dual timestamps.

Fields:
- `id` (cuid)
- `tenant` (default `"taluq"`)
- `user_key` (string)
  - default for Taluq: normalized E164 phone
  - optional future hardening: store a salted hash instead of raw phone
- `event_name` (string, constrained set)
  - examples: `acquired`, `activated`, `deposit_initiated`, `deposit_completed`, `send_initiated`, `send_completed`, `receive_link_copied`, `receive_paid`, `chat_command`
- `event_at` (DateTime) — human reality timestamp
- `synced_at` (DateTime @default(now())) — system reality timestamp
- `source_id` (string | null) — flyer QR id, whatsapp referral id
- `channel` (string | null) — `whatsapp` | `flyer_qr` | `sms` | `direct`
- `campaign` (string | null)
- `creative` (string | null)
- `segment` (string | null)
- `metadata` (Json-ish string | null) — strictly bounded payload

Indexes:
- `@@index([event_at])`
- `@@index([event_name, event_at])`
- `@@index([source_id, event_at])`

### Experiment (the loop object)
Fields:
- `id` (cuid)
- `name`
- `status` (`DRAFT` | `RUNNING` | `DONE`)
- `question`
- `hypothesis`
- `metric_primary` (e.g. `cost_per_activated_user`)
- `start_at`, `end_at`
- `createdAt`

### Learning (outcome)
Fields:
- `id` (cuid)
- `experimentId`
- `outcome` (string: win/loss/neutral)
- `delta` (string, e.g. “Activation +15% in Kwale grid”)
- `notes`
- `createdAt`

## Core Definitions
### Acquisition
User becomes “acquired” when they successfully link a phone (silent wallet info loaded).

### Activation (Taluq)
Activation occurs when **any** of these first-time events happens:
- first `deposit_completed`
- first `send_completed`
- first `receive_paid`

### Time‑to‑Activation
`activated.event_at - acquired.event_at`

## Attribution Bridge (Offline→Online)
### Dual timestamp rule
All growth charts, cohorts, and funnel computations group by `event_at`.

### Source parameters
We standardize:
- `source_id`: stable id printed on flyers/QR, or appended to WhatsApp links
- `channel`: where the user came from
- `campaign`, `creative`, `segment`: optional knobs for experiments

## Dashboard UX (Admin)
Route: `/admin/growth`

### 1) 90‑Day Purge Panel
- Only show metrics with linked experiments/learned outcomes in last 90 days.
- UI default: “show signals only”; optional toggle “show all” for debugging.

### 2) The Loop (Experimentation Feed)
Structure:
1. DATA: anomaly
2. QUESTION
3. HYPOTHESIS
4. EXPERIMENT
5. LEARNING

Each item links to:
- the exact segment/channel filters used
- the before/after metric snapshot

### 3) AARRR View
Acquisition → Activation → Retention → Referral → Revenue

Taluq signals (V1):
- Acquisition: count of `acquired`
- Activation: count of `activated` + distribution of time‑to‑activation
- Retention: users with any “core action” (send/deposit/receive) on D1/D7/D30 from first acquisition
- Referral: acquisition events with non-null `source_id` that map to a known referrer campaign
- Revenue: sum of `deposit_completed` amounts and volume

### 4) Attribution Bridge View
- Leaderboard: `source_id` ranked by activated users and cost per activated user (if cost is provided)
- “Sync distortion” panel: compare event_at vs synced_at lag distribution

### 5) 50/50 Rule View
Split the dashboard into:
- Harvesting (existing demand): activation + retention optimization
- Seeding (future demand): source_id/channel growth and experiments

## Instrumentation Plan (where we emit GrowthEvents)
Emit events from:
- Phone linking success (acquired)
- Receive link copied (receive_link_copied)
- Paystack webhook success (deposit_completed, and activated if first)
- Send completion (send_completed, and activated if first)
- Receive paid event (receive_paid, and activated if first) — V1 may be stubbed until receive payments are real

## Admin Credentials (Email + Password)
Admin login requires:
- `ADMIN_EMAIL` (default: `gerald@geraldkombo.com`)
- `ADMIN_PASSWORD` (must be set by you)

Strong password requirement:
- 20+ characters, random, unique
- never commit it, only set in environment variables

## Acceptance Criteria
- `/admin/growth` loads behind admin auth
- GrowthEvent records exist for acquisition and at least one activation path
- All dashboard aggregations group by `event_at`
- 90‑Day Purge hides non-used charts by default
- `pnpm lint`, `pnpm build`, and `pnpm -C apps/web test` pass

