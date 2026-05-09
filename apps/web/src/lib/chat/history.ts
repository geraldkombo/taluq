/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */

export type RecentTransaction = {
  id: string;
  amountKes: number;
  phoneE164: string;
  createdAtIso: string;
};

function maskPhone(phoneE164: string) {
  const digits = phoneE164.replace(/\D/g, "");
  const last4 = digits.slice(-4) || "0000";
  return `****${last4}`;
}

export function formatRecentTransactions(txs: RecentTransaction[]) {
  return txs.map((tx) => {
    const amount = Number(tx.amountKes).toFixed(2);
    const masked = maskPhone(tx.phoneE164);
    return `${amount} KES • ${masked} • /receipt/${tx.id}`;
  });
}

