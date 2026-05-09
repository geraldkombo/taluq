/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */

export function resolveAdminJwtSecret(params: { nodeEnv?: string; envSecret?: string }) {
  if (params.envSecret) return params.envSecret;
  if (params.nodeEnv === "production") return "";
  return "taluq_dev_jwt_secret";
}

