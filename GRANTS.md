# Taluq: CBK VASPA 2026 Compliance & Protocol Strategy

This document outlines the design and compliance strategy for the Taluq enterprise-grade retail settlement layer, tailored for the Kenyan market and institutional review by the Solana Foundation.

## 1. Bifurcated Token Model (VASPA 2026 Compliance)

The Central Bank of Kenya's Virtual Asset Service Provider Act (VASPA 2026) mandates strict separation between non-yield-bearing stable utility assets and yield-bearing investment contracts. Taluq achieves this via a bifurcated architecture leveraging Solana's Token-2022 standard:

*   **tKES (Utility Stablecoin):**
    *   A 1:1 fiat-backed stablecoin.
    *   Strictly non-yield-bearing, utilized exclusively for high-velocity street retail and matatu payments.
    *   Fully compliant with VASPA 2026 utility token definitions, avoiding "security" classification.
*   **yKES (Yield-Bearing Vault Receipt):**
    *   A KYC-gated receipt representing deposited tKES in institutional yield strategies.
    *   Utilizes the Token-2022 `InterestBearingConfig` extension.
    *   The yield rate is mathematically driven by the live CBK 91-day T-Bill rate, fetched via a custom Switchboard oracle job.

## 2. UNICEF Open Source Mandate & Intellectual Property Strategy

In accordance with the UNICEF Open Source Mandate, core cryptographic infrastructure is published openly to foster African Web3 resilience, while maintaining strict proprietary ownership over the business logic and UI.

All intellectual property, work product, architecture, and code within the Taluq protocol are the sole property of **Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services)**. 

*   **Copyright & Registration:** Copyright registration is currently pending with the Kenya Copyright Board (KECOBO).
*   **Licensing:** All rights reserved. No part of this architecture may be reproduced, distributed, or utilized without explicit written authorization from the owner.

## 3. Architectural Security & UX Innovation

*   **Crankless Time-Locked Escrow:** A transient PDA vault holds retail funds for a 60-second cancellation grace period. Settlement is executed via a permissionless auto-settlement pattern relying on the `solana_clock::Clock::get()` sysvar, eliminating centralization risks of off-chain cranks.
*   **Silent Wallets (HKDF-SHA-256):** Taluq abstracts seed phrases entirely, driving Web3 adoption by deterministically deriving Ed25519 keypairs from the user's phone number and a high-entropy backend pepper. Private keys never touch the client device.
*   **Zero-Blue PWA UI:** Based on ergonomic research for night-shift matatu conductors, the PWA strictly utilizes an OLED Black (`#000000`) and Amber (`#f59e0b`) palette. This minimizes visual fatigue and ipRGC melatonin suppression.
