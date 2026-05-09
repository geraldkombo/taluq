/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */

export type ParsedChatCommand =
  | { kind: "balance" }
  | { kind: "receive" }
  | { kind: "help" }
  | { kind: "lock" }
  | { kind: "history" }
  | { kind: "deposit"; amountKes?: number }
  | { kind: "send"; phoneE164?: string; amountKes?: number }
  | { kind: "unknown" };

export function normalizeKenyanPhone(input: string) {
  const raw = input.trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+") && digits.startsWith("254") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("254") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+254${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+254${digits.slice(1)}`;
  }

  return raw;
}

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export function parseChatCommand(input: string): ParsedChatCommand {
  const q = input.trim();
  if (!q) return { kind: "unknown" };

  const lower = q.toLowerCase();
  if (lower === "balance" || lower === "bal") return { kind: "balance" };
  if (lower === "receive" || lower === "remit") return { kind: "receive" };
  if (lower === "help" || lower === "menu") return { kind: "help" };
  if (lower === "lock") return { kind: "lock" };
  if (lower === "history") return { kind: "history" };

  const parts = q.split(/\s+/);
  const head = parts[0]?.toLowerCase();

  if (head === "deposit") {
    const amountKes = parts[1] ? parseNumber(parts[1]) : undefined;
    return { kind: "deposit", amountKes };
  }

  if (head === "send") {
    const phoneRaw = parts[1] ?? "";
    const amountRaw = parts[2] ?? "";
    const phoneE164 = phoneRaw ? normalizeKenyanPhone(phoneRaw) : undefined;
    const amountKes = amountRaw ? parseNumber(amountRaw) : undefined;
    return { kind: "send", phoneE164, amountKes };
  }

  return { kind: "unknown" };
}

export function shouldRequireSendConfirmation(amountKes: number, thresholdKes = 2000) {
  return amountKes >= thresholdKes;
}

