/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import test from "node:test";
import assert from "node:assert/strict";

import { validateAdminCredentials } from "./admin";

test("validateAdminCredentials matches email (case-insensitive) and password", () => {
  assert.equal(
    validateAdminCredentials({
      email: "gerald@geraldkombo.com",
      password: "pass123",
      expectedEmail: "gerald@geraldkombo.com",
      expectedPassword: "pass123",
    }),
    true,
  );
});

test("validateAdminCredentials rejects wrong email", () => {
  assert.equal(
    validateAdminCredentials({
      email: "other@gmail.com",
      password: "pass123",
      expectedEmail: "gerald@geraldkombo.com",
      expectedPassword: "pass123",
    }),
    false,
  );
});

