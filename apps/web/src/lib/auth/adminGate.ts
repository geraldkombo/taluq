/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */

export function shouldBypassAdminAuth({
  nodeEnv,
  bypassFlag,
}: {
  nodeEnv: string | undefined;
  bypassFlag: string | undefined;
}) {
  // Never allow bypass in production.
  if (nodeEnv === 'production') return false;

  // Only allow bypass when explicitly enabled.
  // Convention: "1" enables bypass (used by tests and .env.example).
  return bypassFlag === '1';
}

