import { config } from "../config";
import { logger } from "../logger";

export interface OffMappedProduct {
  name: string;
  brand: string | null;
  category: string | null;
  barcode: string;
  energyKcalPer100g: number | null;
  energyKcalPerKg: number | null;
  energyKcalPerServing: number | null;
  servingSizeG: number | null;
  offProductUrl: string;
  raw: unknown;
}

export class OffNotFoundError extends Error {
  constructor(barcode: string) {
    super(`Product with barcode ${barcode} was not found in Open Food Facts`);
  }
}

export class OffUnavailableError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// Parse a serving size string like "100 g" or "30g" into grams.
function parseServingGrams(value: unknown): number | null {
  if (typeof value !== "string") return numberOrNull(value);
  const match = value.match(/([\d.]+)\s*g/i);
  if (match) return numberOrNull(match[1]);
  const bare = value.match(/^([\d.]+)$/);
  return bare ? numberOrNull(bare[1]) : null;
}

export function mapOffProduct(barcode: string, payload: any): OffMappedProduct {
  const product = payload?.product ?? {};
  const nutriments = product.nutriments ?? {};

  // Open Food Facts may expose kcal directly, or only in kJ. Prefer kcal.
  let energyKcalPer100g = numberOrNull(nutriments["energy-kcal_100g"]);
  if (energyKcalPer100g === null) {
    const kj100 = numberOrNull(nutriments["energy-kj_100g"]) ?? numberOrNull(nutriments["energy_100g"]);
    if (kj100 !== null) {
      energyKcalPer100g = Math.round((kj100 / 4.184) * 100) / 100;
    }
  }

  const energyKcalPerServing = numberOrNull(nutriments["energy-kcal_serving"]);
  const servingSizeG = parseServingGrams(product.serving_size ?? product.serving_quantity);

  const categories: string[] | undefined = product.categories_tags;
  const category = Array.isArray(categories) && categories.length > 0 ? categories[0] : null;

  return {
    name: product.product_name || product.generic_name || `Product ${barcode}`,
    brand: product.brands || null,
    category,
    barcode,
    energyKcalPer100g,
    energyKcalPerKg: energyKcalPer100g !== null ? Math.round(energyKcalPer100g * 10 * 100) / 100 : null,
    energyKcalPerServing,
    servingSizeG,
    offProductUrl: `${config.off.baseUrl}/product/${barcode}`,
    raw: payload,
  };
}

export async function lookupBarcode(barcode: string): Promise<OffMappedProduct> {
  const url = `${config.off.baseUrl}/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.off.timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": config.off.userAgent,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } catch (err) {
    logger.error("Open Food Facts request failed", {
      barcode,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new OffUnavailableError("Could not reach Open Food Facts. Please try again later.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new OffUnavailableError(`Open Food Facts returned status ${response.status}`);
  }

  const data: any = await response.json();
  if (!data || data.status === 0 || !data.product) {
    throw new OffNotFoundError(barcode);
  }

  return mapOffProduct(barcode, data);
}
