/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */

export function resolveAdminPassword(params: { nodeEnv?: string; envPassword?: string }) {
  if (params.envPassword) return params.envPassword;
  if (params.nodeEnv === "production") return "";
  return "taluq123";
}

