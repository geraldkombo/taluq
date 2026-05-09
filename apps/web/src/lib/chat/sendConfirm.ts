/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */

export function isConfirmMessage(input: string) {
  return input.trim().toLowerCase() === "confirm";
}

export function buildSendConfirmationText(params: { phoneE164: string; amountKes: number }) {
  return `Confirm transfer: ${params.amountKes.toFixed(2)} KES → ${params.phoneE164}. Type "confirm".`;
}

