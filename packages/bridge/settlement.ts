/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */

/**
 * Utility Settlement Bridge
 * 
 * Handles automated off-ramping. Once yKES interest hits a bill threshold,
 * triggers direct settlement to Utility Providers (KPLC / Nairobi Water / ISPs) via 
 * Paystack's bank/card rails, completely bypassing mobile money friction.
 */

import crypto from 'crypto';

export enum SettlementRail {
  DIRECT_BANK = 'DIRECT_BANK',
  VIRTUAL_CARD = 'VIRTUAL_CARD', // Used for Netflix, OpenAI, Uber (Global Tech)
  ESCROW = 'ESCROW',             // Used for Rent / High-value items
  AUTO_COMPOUND = 'AUTO_COMPOUND', // Used for Savings vault
  MERCHANT_TILL = 'MERCH_TILL'   // Seamless B2B Till integration
}

export interface UtilityProvider {
  name: string;
  rail: SettlementRail;
  paystackBankCode?: string;
  paystackAccountNumber?: string;
  virtualCardMerchantId?: string; // For Virtual Card API (Netflix, Uber, etc)
  minimumThreshold: number;
}

export const PROVIDERS: Record<string, UtilityProvider> = {
  RENT_ESCROW: {
    name: 'Landlord / Mortgage Escrow',
    rail: SettlementRail.ESCROW,
    paystackBankCode: '001', // Local Bank
    paystackAccountNumber: '0000000000',
    minimumThreshold: 2500000, // 25,000 KES
  },
  KPLC: {
    name: 'Kenya Power and Lighting Company',
    rail: SettlementRail.DIRECT_BANK,
    paystackBankCode: '044', 
    paystackAccountNumber: '0000000000',
    minimumThreshold: 350000, 
  },
  NAIROBI_WATER: {
    name: 'Nairobi City Water',
    rail: SettlementRail.DIRECT_BANK,
    paystackBankCode: '011',
    paystackAccountNumber: '1111111111',
    minimumThreshold: 350000,
  },
  SHIF: {
    name: 'Social Health Insurance Fund (SHIF)',
    rail: SettlementRail.DIRECT_BANK,
    paystackBankCode: '005',
    paystackAccountNumber: '5555555555',
    minimumThreshold: 275000, 
  },
  ECITIZEN: {
    name: 'eCitizen Services (KRA/Housing Levy)',
    rail: SettlementRail.DIRECT_BANK,
    paystackBankCode: '006',
    paystackAccountNumber: '6666666666',
    minimumThreshold: 100000,
  },
  STARLINK: {
    name: 'Starlink Kenya',
    rail: SettlementRail.VIRTUAL_CARD,
    virtualCardMerchantId: 'MERCH_STARLINK',
    minimumThreshold: 650000, 
  },
  OPENAI_GEMINI: {
    name: 'OpenAI / Google Gemini Advanced',
    rail: SettlementRail.VIRTUAL_CARD,
    virtualCardMerchantId: 'MERCH_AI_COMPUTE',
    minimumThreshold: 300000, 
  },
  NETFLIX_YOUTUBE: {
    name: 'Netflix & YouTube Music / Spotify',
    rail: SettlementRail.VIRTUAL_CARD,
    virtualCardMerchantId: 'MERCH_ENTERTAINMENT',
    minimumThreshold: 150000,
  },
  UBER_BOLT: {
    name: 'Uber / Bolt Rides',
    rail: SettlementRail.VIRTUAL_CARD,
    virtualCardMerchantId: 'MERCH_MOBILITY',
    minimumThreshold: 100000,
  },
  GLOVO_NAIVAS: {
    name: 'Glovo / Naivas Groceries',
    rail: SettlementRail.VIRTUAL_CARD,
    virtualCardMerchantId: 'MERCH_DINING',
    minimumThreshold: 250000,
  },
  SGR_FLIGHTS: {
    name: 'SGR / JamboJet Logistics',
    rail: SettlementRail.DIRECT_BANK,
    paystackBankCode: '010',
    paystackAccountNumber: '9999999999',
    minimumThreshold: 450000,
  },
  SAVINGS_VAULT: {
    name: 'Auto-Compound Wealth Vault',
    rail: SettlementRail.AUTO_COMPOUND,
    minimumThreshold: 0, // Continuous
  },
  CHAMA_VAULT: {
    name: 'Chama Multi-Sig Treasury',
    rail: SettlementRail.ESCROW,
    paystackBankCode: '008', // SACCO / Co-op Bank
    paystackAccountNumber: '8888888888',
    minimumThreshold: 500000,
  },
  GOVERNMENT_NTSA: {
    name: 'NTSA Traffic Fines',
    rail: SettlementRail.DIRECT_BANK,
    paystackBankCode: '006', // eCitizen
    paystackAccountNumber: '6666666666',
    minimumThreshold: 100000,
  }
};

/**
 * Process automated settlement of utility bills from yKES yield.
 */
export async function triggerUtilitySettlement(
  providerKey: keyof typeof PROVIDERS,
  yKesYieldAmount: number, // in KES
  customerReference: string
) {
  const provider = PROVIDERS[providerKey];
  
  if (!provider) {
    throw new Error(`Unknown utility provider: ${String(providerKey)}`);
  }

  if (yKesYieldAmount < provider.minimumThreshold / 100) {
    console.log(`Yield amount (${yKesYieldAmount} KES) below minimum threshold (${provider.minimumThreshold / 100} KES). Skipping settlement.`);
    return { success: false, reason: 'BELOW_THRESHOLD' };
  }

  // Generate idempotency key for Paystack
  const idempotencyKey = crypto.randomUUID();

  let payload: any = {
    amount: Math.floor(yKesYieldAmount * 100), // Kobo / Cents
    reason: `Automated Settlement for ${customerReference} by Gerald Shikunyi Kombo (Digital Services)`,
    reference: `TALUQ-UTILITY-${Date.now()}-${idempotencyKey.substring(0, 8)}`
  };

  if (provider.rail === SettlementRail.DIRECT_BANK || provider.rail === SettlementRail.ESCROW) {
    // Bank/Escrow logic via Paystack Transfer API
    payload = {
      ...payload,
      source: "balance",
      recipient: provider.paystackAccountNumber, // Abstracted behind recipient code
    };
    console.log(`[SETTLEMENT BRIDGE] Initiating ${provider.rail} off-ramp via Paystack to ${provider.name}...`);
  } else if (provider.rail === SettlementRail.VIRTUAL_CARD) {
    // Virtual Card logic via Paystack Virtual Card API
    payload = {
      ...payload,
      merchantId: provider.virtualCardMerchantId,
      action: "FUND_VIRTUAL_CARD",
    };
    console.log(`[SETTLEMENT BRIDGE] Funding Virtual Card for ${provider.name} via Paystack Issuing API...`);
  } else if (provider.rail === SettlementRail.AUTO_COMPOUND) {
    console.log(`[SETTLEMENT BRIDGE] Re-staking ${yKesYieldAmount} KES back into Principal Vault...`);
    return {
      success: true,
      transferReference: payload.reference,
      amountSettled: yKesYieldAmount,
      provider: provider.name,
      message: 'Yield successfully auto-compounded back into savings vault.',
      settledBy: 'Gerald Shikunyi Kombo (Digital Services)'
    };
  }

  console.log(`[SETTLEMENT BRIDGE] Payload:`, payload);

  // Mocking successful Paystack Response
  return {
    success: true,
    transferReference: payload.reference,
    amountSettled: yKesYieldAmount,
    provider: provider.name,
    message: `Utility bill settled successfully via ${provider.rail} rails, bypassing mobile money friction.`,
    settledBy: 'Gerald Shikunyi Kombo (Digital Services)'
  };
}
