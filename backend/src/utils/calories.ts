import { Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

function toNum(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? n : null;
}

export interface FoodEnergyFields {
  energyKcalPerKg?: DecimalLike;
  energyKcalPerServing?: DecimalLike;
  energyKcalPer100g?: DecimalLike;
}

export interface MealAmounts {
  amountGrams?: DecimalLike;
  amountServings?: DecimalLike;
}

/**
 * Compute kcal for a meal following the spec's precedence order:
 *  1. grams + energy_kcal_per_kg
 *  2. servings + energy_kcal_per_serving
 *  3. grams + energy_kcal_per_100g
 * Returns null when no combination is available.
 */
export function computeMealKcal(food: FoodEnergyFields, amounts: MealAmounts): number | null {
  const grams = toNum(amounts.amountGrams);
  const servings = toNum(amounts.amountServings);
  const perKg = toNum(food.energyKcalPerKg);
  const perServing = toNum(food.energyKcalPerServing);
  const per100g = toNum(food.energyKcalPer100g);

  if (grams !== null && perKg !== null) {
    return round2((grams / 1000.0) * perKg);
  }
  if (servings !== null && perServing !== null) {
    return round2(servings * perServing);
  }
  if (grams !== null && per100g !== null) {
    return round2((grams / 100.0) * per100g);
  }
  return null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
