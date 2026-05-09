# TALUQ: COMPLIANCE & SOCIAL IMPACT REPORT

**Provider:** Gerald Shikunyi Kombo (Digital Services)
**Date:** April 2026
**Framework:** VASP 2026 & Digital Superhighway Standards

## 1. The Triple-Audit Gate (50 KES Minimum)
To ensure robust regulatory compliance under VASP 2026 and prevent high-frequency micro-transaction laundering, Taluq enforces a **50.00 KES minimum deposit audit gate** across all Web3-to-Fiat settlement operations.
- **IP Edge Verification:** Paystack 2026 Edge Nodes are verified via strictly filtered IP addressing (e.g., 52.31.139.75).
- **Cryptographic Signature:** All incoming webhooks are validated using HMAC SHA512.
- **Minimum Threshold Kill-Switch:** Any transaction payload failing to meet the **50.00 KES minimum** is rejected. A `ForensicAlert` is logged in Prisma, and an immediate kill-switch halts mint processing for that payload.

## 2. Institutional Anti-Fraud & Privacy Architecture
- **Zero Phonebook Access (Anti-Scraping):** To combat the predatory practices of "Zip Apps" (loan apps that scrape user contacts for shaming and harassment), Taluq enforces strict `Permissions-Policy` headers (`contacts=()`) at the server level. Taluq mathematically guarantees it cannot and will not access a user's phonebook.
- **Bypassing Mobile Money Friction:** By utilizing Paystack’s robust Bank/Card rails and Virtual Card API, Taluq directly interfaces with institutional accounts and global tech (Uber, Netflix, OpenAI), effectively avoiding the frictional vulnerabilities, delays, and exorbitant fees associated with legacy mobile money (M-Pesa/Airtel Money).
- **Forensic Observability:** `api/webhook/paystack/route.ts` rejects non-compliant payloads, and `bridge/settlement.ts` ensures direct utility off-ramping strictly to verified recipients (KPLC, Nairobi Water, Landlord Escrow, SHIF, KRA).
- **Traceability:** Every mint carries a Solana Transaction Hash and embedded metadata explicitly tying operations to `Gerald Shikunyi Kombo (Digital Services)`.

## 3. Total Lifestyle Impact (Omni-Settlement yKES)
In response to the April 2026 Kenyan economy, notably the 4.72 KES EPRA tariff shock, high housing costs, and rising global tech subscriptions, Taluq resolves the "Micro-Leakage" crisis through the **yKES Yield Protocol**:
- **Solana 2.0 Web3.js Framework:** Built utilizing the Token-2022 Interest-Bearing extensions.
- **Autonomous Earmarking (Epoch vs On-Demand):** The yield generated from users' base liquidity is programmatically allocated across their entire financial lifecycle:
  - **Shelter:** Rent/Mortgage Escrow
  - **Utilities:** Power (KPLC), Water (Nairobi Water)
  - **Statutory:** SHIF, KRA eCitizen
  - **Mobility & Logistics:** Uber, Bolt, SGR, JamboJet
  - **Tech & Entertainment:** Starlink, OpenAI, Netflix, Spotify
  - **Savings:** Auto-compounding Wealth Vault
- **The 'Invisible' UX:** Once earmarked yield hits the respective institutional threshold or end-of-month epoch, the system autonomously settles the bill or funds the virtual card. It requires zero user interaction, staying completely out of the user's way, while natively protecting their purchasing power against macroeconomic inflation.

## 4. Deployment Architecture
Taluq utilizes a high-availability `pnpm` monorepo configuration managed via **Nixpacks** on Railway (`railway.json`), ensuring robust zero-downtime deployments required for VASP 2026 grade infrastructure.

---
*Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved.*
