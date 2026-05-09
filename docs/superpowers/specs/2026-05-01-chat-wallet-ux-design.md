# Taluq — Chat Wallet UX (May 1st, 2026) Design

## Objective
Make Taluq feel like the fastest, most trustworthy money interface in Kenya by turning the wallet into a chat-first command surface:
- WhatsApp-speed interaction
- Zero seed phrases / zero crypto vocabulary
- Offline-first resilience
- Biometric idle lock by default

## Decision (Approved)
**Vibe:** A — Minimal (premium, low cognitive load).

## Scope
### In Scope
- Chat Wallet as primary UX for `/` and `/chat`
- Command grammar + quick actions
- Safety rails (confirmation thresholds, parsing, receipts)
- Activity + receipts surfaced through chat
- UI polish pass (hierarchy, spacing, motion, micro-feedback)

### Out of Scope (for this iteration)
- Full NL intent model (LLM)
- Real Paystack checkout UI inside chat (we keep the existing deposit flow stub until Live Mode)
- Full merchant till checkout
- Full chama creation flows

## User Experience
### Entry
1. User opens Taluq (PWA).
2. Phone linking: user enters phone (Kenyan number) and Taluq derives silent wallet info server-side.
3. Chat opens automatically after linking.

### Chat Interaction Model
The conversation thread is the UI. Every action results in:
- A user message (typed or chip)
- A Taluq response bubble
- Optional action links (copy, view receipt, retry)

### Commands (V1)
Supported commands must be short, deterministic, and forgiving:
- `balance` / `bal`
- `send <phone> <amount>`
  - accepts: `07XXXXXXXX`, `+2547XXXXXXXX`, `2547XXXXXXXX`
- `receive`
  - returns global receive link for the linked phone identity
- `deposit <amount>` (or `deposit`)
  - opens deposit sheet; if `<amount>` provided, prefill
- `history`
  - shows last N actions (from local cache first; then from server when available)
- `help`
  - lists commands and examples
- `lock`
  - immediately locks the vault

### Quick Actions (Chips)
Chips must always exist above the input:
- Balance
- Send
- Receive
- Deposit
- Help

Chips are treated as user messages (so the chat reads naturally).

## Safety Rails (Must-Haves)
### Biometric Idle Lock
- Auto-lock after 60 seconds of inactivity.
- Unlock uses WebAuthn when available; otherwise fallback unlock for demo environments.

### Send Confirmation
- For transfers above a configurable threshold (default: 2,000 KES), enforce a confirm step:
  - show parsed recipient + amount
  - require explicit “Confirm”

### Parsing & Validation
- Phone normalization is mandatory before any action.
- Amount parsing strips non-numeric characters; enforce min values:
  - deposit: min 50 KES
  - send: min 1 KES

### Receipts and Status
- Every action creates a durable status message:
  - queued → sent/confirmed → failed
- Receipt deep-link exists for server-recorded transactions.

## Offline & Persistence
- Persist chat history + linked phone in local storage.
- If offline:
  - allow commands that do not require server (help, lock)
  - allow “queued” actions with clear disclaimers

## UI/Visual Quality (May 1st, 2026)
- Palette: OLED black background with amber primary and green for receive/success.
- Typography: mono with tight tracking for headers; normal tracking for message text.
- Layout: fixed header, scrollable chat, fixed input dock.
- Motion:
  - subtle message “pop” animation
  - bottom sheet spring-in
  - haptic + 3000Hz chirp on success events

## Technical Architecture (Frontend)
### Components
- `ChatWallet` component: state machine for chat, sheets, idle lock, and persistence.
- Sheets: Deposit, Send.
- Chat list: scroll-to-bottom behavior; message bubble rendering.

### Data Sources
- Wallet identity: `getSilentWalletInfo(phone)`
- Balance: `useHybridAtaBalance({ rpcUrl, ata })`
- Receipt: existing `/receipt/[tx_id]` route

## Acceptance Criteria
- Home loads into Chat Wallet.
- Linking a phone produces a working vault session.
- `balance`, `send`, `receive`, `deposit`, `help`, `lock` behave as defined.
- Idle lock triggers at 60 seconds and unlocks via WebAuthn when available.
- No secrets are ever logged or hardcoded.
- `pnpm lint` and `pnpm build` pass.

