/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import test from "node:test";
import assert from "node:assert/strict";

import { formatRecentTransactions } from "./history";

test("formatRecentTransactions formats tx list into compact lines", () => {
  const out = formatRecentTransactions([
    {
      id: "tx1",
      amountKes: 200,
      phoneE164: "+254712345678",
      createdAtIso: "2026-05-01T10:00:00.000Z",
    },
    {
      id: "tx2",
      amountKes: 50,
      phoneE164: "+254700000000",
      createdAtIso: "2026-05-01T11:00:00.000Z",
    },
  ]);

  assert.equal(out.length, 2);
  assert.ok(out[0].includes("200.00 KES"));
  assert.ok(out[0].includes("****5678"));
  assert.ok(out[0].includes("/receipt/tx1"));
});

