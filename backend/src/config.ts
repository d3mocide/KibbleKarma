import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL", "postgresql://kibble:karma@localhost:5432/kibble_karma"),
  jwt: {
    secret: required("JWT_SECRET", "dev-insecure-secret-change-me"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  off: {
    baseUrl: process.env.OFF_BASE_URL ?? "https://world.openpetfoodfacts.org",
    userAgent:
      process.env.OFF_USER_AGENT ??
      "KibbleKarma/1.0 (self-hosted)",
    timeoutMs: parseInt(process.env.OFF_TIMEOUT_MS ?? "8000", 10),
  },
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  // When false (default), registration is only allowed for the very first
  // user (first-run owner enrollment). Set true to allow additional signups.
  allowOpenRegistration: process.env.ALLOW_OPEN_REGISTRATION === "true",
} as const;
