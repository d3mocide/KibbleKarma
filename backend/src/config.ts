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
  databaseUrl: required("DATABASE_URL", "postgresql://nibbles:naps@localhost:5432/nibbles_and_naps"),
  jwt: {
    secret: required("JWT_SECRET", "dev-insecure-secret-change-me"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  off: {
    baseUrl: process.env.OFF_BASE_URL ?? "https://world.openfoodfacts.org",
    userAgent:
      process.env.OFF_USER_AGENT ??
      "NibblesAndNaps/1.0 (https://github.com/d3mocide/nibbles-and-naps)",
    timeoutMs: parseInt(process.env.OFF_TIMEOUT_MS ?? "8000", 10),
  },
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
} as const;
