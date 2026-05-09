/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import test from "node:test";
import assert from "node:assert/strict";

import { normalizeKenyanPhone, parseChatCommand, shouldRequireSendConfirmation } from "./command";

test("normalizeKenyanPhone normalizes 07XXXXXXXX to +2547XXXXXXXX", () => {
  assert.equal(normalizeKenyanPhone("0712345678"), "+254712345678");
});

test("normalizeKenyanPhone normalizes 7XXXXXXXX to +2547XXXXXXXX", () => {
  assert.equal(normalizeKenyanPhone("712345678"), "+254712345678");
});

test("parseChatCommand parses balance", () => {
  assert.deepEqual(parseChatCommand("balance"), { kind: "balance" });
  assert.deepEqual(parseChatCommand("bal"), { kind: "balance" });
});

test("parseChatCommand parses receive", () => {
  assert.deepEqual(parseChatCommand("receive"), { kind: "receive" });
});

test("parseChatCommand parses send with kenya formats", () => {
  assert.deepEqual(parseChatCommand("send 0712345678 200"), {
    kind: "send",
    phoneE164: "+254712345678",
    amountKes: 200,
  });
  assert.deepEqual(parseChatCommand("send +254712345678 150.5"), {
    kind: "send",
    phoneE164: "+254712345678",
    amountKes: 150.5,
  });
});

test("parseChatCommand parses deposit with amount", () => {
  assert.deepEqual(parseChatCommand("deposit 500"), { kind: "deposit", amountKes: 500 });
});

test("shouldRequireSendConfirmation enforces default threshold", () => {
  assert.equal(shouldRequireSendConfirmation(1999.99), false);
  assert.equal(shouldRequireSendConfirmation(2000), true);
});

