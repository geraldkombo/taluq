/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */

import crypto from "crypto";

export function validateAdminCredentials(params: {
  email: string;
  password: string;
  expectedEmail: string;
  expectedPassword: string;
}) {
  const email = params.email.trim().toLowerCase();
  const expectedEmail = params.expectedEmail.trim().toLowerCase();
  if (!email || !expectedEmail) return false;
  if (email !== expectedEmail) return false;

  const a = Buffer.from(String(params.password));
  const b = Buffer.from(String(params.expectedPassword));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

