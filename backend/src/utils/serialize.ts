import { Prisma } from "@prisma/client";

// Recursively convert Prisma.Decimal values to plain numbers so JSON
// responses are easy for the frontend to consume (no string decimals).
export function serialize<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (value instanceof Prisma.Decimal) {
    return Number(value.toString()) as unknown as T;
  }

  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item)) as unknown as T;
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serialize(val);
    }
    return out as T;
  }

  return value;
}
