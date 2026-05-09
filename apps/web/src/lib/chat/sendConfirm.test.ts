/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import test from "node:test";
import assert from "node:assert/strict";

import { buildSendConfirmationText, isConfirmMessage } from "./sendConfirm";

test("isConfirmMessage matches confirm", () => {
  assert.equal(isConfirmMessage("confirm"), true);
  assert.equal(isConfirmMessage("CONFIRM"), true);
  assert.equal(isConfirmMessage("ok"), false);
});

test("buildSendConfirmationText creates a deterministic prompt", () => {
  const text = buildSendConfirmationText({ phoneE164: "+254712345678", amountKes: 2000 });
  assert.ok(text.includes("+254712345678"));
  assert.ok(text.includes("2000.00"));
});

