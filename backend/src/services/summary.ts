import { prisma } from "../prisma";
import { round2 } from "../utils/calories";

// Build [start, end) bounds for a YYYY-MM-DD date in server local time.
function dayBounds(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map((p) => parseInt(p, 10));
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export interface DailySummary {
  date: string;
  totalKcal: number;
  totalGrams: number;
  targetKcal: number | null;
  remainingKcal: number | null;
  breakdown: Array<{
    foodId: string;
    foodName: string;
    kcal: number;
    grams: number;
    meals: number;
  }>;
}

export async function getDailySummary(petId: string, dateStr: string): Promise<DailySummary> {
  const { start, end } = dayBounds(dateStr);

  const [pet, meals] = await Promise.all([
    prisma.pet.findUnique({ where: { id: petId }, select: { vetDailyEnergyKcal: true } }),
    prisma.mealLog.findMany({
      where: { petId, loggedAt: { gte: start, lt: end } },
      include: { food: { select: { id: true, name: true } } },
    }),
  ]);

  let totalKcal = 0;
  let totalGrams = 0;
  const byFood = new Map<string, { foodName: string; kcal: number; grams: number; meals: number }>();

  for (const meal of meals) {
    const kcal = meal.computedKcal ? Number(meal.computedKcal.toString()) : 0;
    const grams = meal.amountGrams ? Number(meal.amountGrams.toString()) : 0;
    totalKcal += kcal;
    totalGrams += grams;

    const entry = byFood.get(meal.foodId) ?? {
      foodName: meal.food.name,
      kcal: 0,
      grams: 0,
      meals: 0,
    };
    entry.kcal += kcal;
    entry.grams += grams;
    entry.meals += 1;
    byFood.set(meal.foodId, entry);
  }

  const targetKcal = pet?.vetDailyEnergyKcal ? Number(pet.vetDailyEnergyKcal.toString()) : null;
  const remainingKcal = targetKcal !== null ? round2(targetKcal - totalKcal) : null;

  return {
    date: dateStr,
    totalKcal: round2(totalKcal),
    totalGrams: round2(totalGrams),
    targetKcal,
    remainingKcal,
    breakdown: Array.from(byFood.entries()).map(([foodId, v]) => ({
      foodId,
      foodName: v.foodName,
      kcal: round2(v.kcal),
      grams: round2(v.grams),
      meals: v.meals,
    })),
  };
}

export interface WeightTrend {
  series: Array<{ weighedAt: string; weightKg: number; bodyConditionScore: number | null }>;
  trend30d: { changeKg: number; avgDailyChangeKg: number; days: number } | null;
}

export async function getWeightSeries(
  petId: string,
  from?: Date,
  to?: Date
): Promise<WeightTrend> {
  const logs = await prisma.weightLog.findMany({
    where: {
      petId,
      ...(from || to ? { weighedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    orderBy: { weighedAt: "asc" },
  });

  const series = logs.map((l) => ({
    weighedAt: l.weighedAt.toISOString(),
    weightKg: Number(l.weightKg.toString()),
    bodyConditionScore: l.bodyConditionScore ? Number(l.bodyConditionScore.toString()) : null,
  }));

  // Simple 30-day trend: compare earliest vs latest sample within the window.
  let trend30d: WeightTrend["trend30d"] = null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = logs.filter((l) => l.weighedAt >= cutoff);
  if (recent.length >= 2) {
    const first = recent[0];
    const last = recent[recent.length - 1];
    const changeKg = Number(last.weightKg.toString()) - Number(first.weightKg.toString());
    const days = Math.max(
      1,
      (last.weighedAt.getTime() - first.weighedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    trend30d = {
      changeKg: round2(changeKg),
      avgDailyChangeKg: round2(changeKg / days),
      days: Math.round(days),
    };
  }

  return { series, trend30d };
}
