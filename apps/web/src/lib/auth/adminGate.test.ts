/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import test from "node:test";
import assert from "node:assert/strict";

import { shouldBypassAdminAuth } from "./adminGate";
import { resolveAdminPassword } from "./adminPassword";
import { resolveAdminJwtSecret } from "./adminSecret";

test("shouldBypassAdminAuth allows bypass only outside production and when flag=1", () => {
  assert.equal(shouldBypassAdminAuth({ nodeEnv: "development", bypassFlag: "1" }), true);
  assert.equal(shouldBypassAdminAuth({ nodeEnv: "test", bypassFlag: "1" }), true);
  assert.equal(shouldBypassAdminAuth({ nodeEnv: "production", bypassFlag: "1" }), false);
  assert.equal(shouldBypassAdminAuth({ nodeEnv: "development", bypassFlag: "0" }), false);
});

test("resolveAdminPassword defaults to taluq123 outside production", () => {
  assert.equal(resolveAdminPassword({ nodeEnv: "development", envPassword: "" }), "taluq123");
  assert.equal(resolveAdminPassword({ nodeEnv: "test", envPassword: undefined }), "taluq123");
  assert.equal(resolveAdminPassword({ nodeEnv: "production", envPassword: "" }), "");
  assert.equal(resolveAdminPassword({ nodeEnv: "production", envPassword: "x" }), "x");
});

test("resolveAdminJwtSecret defaults outside production", () => {
  assert.equal(resolveAdminJwtSecret({ nodeEnv: "development", envSecret: "" }) !== "", true);
  assert.equal(resolveAdminJwtSecret({ nodeEnv: "production", envSecret: "" }), "");
  assert.equal(resolveAdminJwtSecret({ nodeEnv: "production", envSecret: "s" }), "s");
});
