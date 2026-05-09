# ⚡ [ T A L U Q ]
**Taluq: The Sovereign Settlement Engine derived from the Kilwa Sultanate.**

[![Status](https://img.shields.io/badge/Status-Production_Ready-green?style=for-the-badge)](https://github.com/geraldkombo)
[![Network](https://img.shields.io/badge/Network-Solana_Mainnet_Beta-purple?style=for-the-badge)](https://solana.com)
[![UX](https://img.shields.io/badge/UX-Zero_Blue_Amber-orange?style=for-the-badge)](https://github.com/geraldkombo)

---

## 🏛️ Technical Whitepaper: East Africa's Financial Renaissance

Taluq is a **Sovereign Settlement Engine** derived from the fiscal legacy of the **Kilwa Sultanate**. Just as **Sultan al-Hassan ibn Talut (1277–1294)** and the **Mahdali Dynasty** established the first independent mints in East Africa to ensure regional trade sovereignty, Taluq leverages the **Solana Blockchain** to reclaim financial autonomy for the modern Kenyan citizen.

### 🛡️ The Sovereign Shield: Solving the May 2026 Crisis

In May 2026, the Kenyan economy is facing three systemic "Liquidity Shocks" that extract wealth from the common citizen:

1.  **SHIF (Social Health Insurance Fund):** A mandatory **2.75% gross salary deduction** that has significantly reduced the disposable income of every Kenyan worker.
2.  **EPRA (Energy and Petroleum Regulatory Authority):** Recent policy shifts have led to a **+28.69 Ksh/liter petrol hike**, cascading into increased costs for transport and logistics.
3.  **KPLC (Kenya Power):** Aggressive tariff adjustments of **+4.72/kWh** have made electricity access a critical financial burden for households.

### ⚙️ The Mechanism: Autonomous Yield Harvesting

Taluq is the only ethical alternative to the 200+ predatory lending apps currently extracting wealth in Kenya. Instead of issuing high-interest debt, Taluq grows user wealth:

*   **Yield Generation:** Fiat deposited via Paystack is converted into `yKES`, a stablecoin natively backed by US Treasury primitives (USDY).
*   **Autonomous Harvesting:** Using **Solana Token-2022 Interest-Bearing extensions**, Taluq programmatically harvests the **5-7% background yield** without touching the user's principal.
*   **Sovereign Settlement:** This harvested yield is automatically routed to settle **SHIF**, **KPLC**, and **EPRA-driven petrol hikes** autonomously.

---

## 🛠️ Architectural Core

### 1. The Triple-Audit Gate (Security)
Taluq employs a military-grade security stack to ensure the integrity of the fiat-to-web3 bridge:
*   **IP Edge Verification:** Strict filtering for Paystack and RPC nodes.
*   **HMAC SHA512:** Cryptographic validation for all incoming payment webhooks.
*   **Forensic Kill-Switch:** Real-time monitoring that halts the Solana minting engine if deposit thresholds are compromised.

### 2. Ambient Geo-Shield (Cognitive UX)
The interface is a **Messaging-First "Chat Wallet"** built on the **Zero-Blue Standard** (#f59e0b on #000000). 
*   **Geo-Aware Alerts:** Features an `AmbientGeoShield` that triggers **ElevenLabs** voice alerts based on GPS triggers:
    *   **Nairobi Expressway:** Confirms yield-bearing asset security.
    *   **Times Tower (KRA):** Verifies KRA compliance and privacy shields.
    *   **Mombasa Road (EPRA):** Enables real-time settlement for petrol hikes.
*   **Biometric Lock:** Integrated WebAuthn/Passkeys for session security.

---

## 🚀 Technical Implementation

### Smart Contracts (Anchor)
The Anchor program (`packages/anchor`) manages:
*   **Token-2022 Interest-Bearing Mints:** Dynamic rate updates based on T-Bill oracles.
*   **Settlement Escrows:** PDAs that hold harvested yield for utility payments.
*   **Phone-Linked Identity:** Silent wallets derived from hashed phone numbers.

### Web Application (Next.js 15)
*   **Atomic Webhooks:** `/api/webhook/paystack` ensures atomic updates between Solana and the **Neon Postgres** database.
*   **PWA Architecture:** Optimized for low-bandwidth "Kenyan Bundles" with cache-first persistence.

---

## 🧭 Strategic Documentation
*   🇰🇪 **[THE KENYAN MANIFESTO](./THE_KENYAN_MANIFESTO.md):** The philosophical foundation of financial dignity.
*   🧭 **[ROADMAP](./ROADMAP.md):** From Pilot to Sovereign Scale.
*   📱 **[MOBILE STRATEGY](./MOBILE_STRATEGY.md):** Optimizing for the African mobile landscape.

---
*Intellectual Property Rights Reserved. Gerald Shikunyi Kombo (Digital Services).*
