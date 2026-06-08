import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { assertPetOwnership, assertFoodAccessible } from "../utils/access";
import { serialize } from "../utils/serialize";
import { computeMealKcal } from "../utils/calories";
import { getDailySummary } from "../services/summary";

const mealBaseSchema = z.object({
  foodId: z.string().uuid(),
  loggedAt: z.coerce.date().optional(),
  amountGrams: z.coerce.number().positive().nullish(),
  amountServings: z.coerce.number().positive().nullish(),
  notes: z.string().nullish(),
});

const mealBodySchema = mealBaseSchema.refine(
  (d) => d.amountGrams != null || d.amountServings != null,
  { message: "Provide an amount in grams or servings" }
);

// Nested under /api/pets/:petId
export const mealsNestedRouter = Router({ mergeParams: true });
mealsNestedRouter.use(requireAuth);

mealsNestedRouter.get<{ petId: string }>("/meals", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const take = Math.min(parseInt(String(req.query.limit ?? "100"), 10) || 100, 500);
  const skip = parseInt(String(req.query.offset ?? "0"), 10) || 0;

  const where = {
    petId: req.params.petId,
    ...(from || to ? { loggedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };

  const [meals, total] = await Promise.all([
    prisma.mealLog.findMany({
      where,
      include: { food: { select: { id: true, name: true, brand: true } } },
      orderBy: { loggedAt: "desc" },
      take,
      skip,
    }),
    prisma.mealLog.count({ where }),
  ]);

  res.json({ meals: serialize(meals), total });
});

mealsNestedRouter.post<{ petId: string }>("/meals", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const data = mealBodySchema.parse(req.body);
  const food = await assertFoodAccessible(data.foodId, req.user!.userId);

  const computedKcal = computeMealKcal(food, {
    amountGrams: data.amountGrams,
    amountServings: data.amountServings,
  });

  const meal = await prisma.mealLog.create({
    data: {
      petId: req.params.petId,
      foodId: data.foodId,
      loggedAt: data.loggedAt ?? new Date(),
      amountGrams: data.amountGrams ?? null,
      amountServings: data.amountServings ?? null,
      computedKcal,
      notes: data.notes ?? null,
    },
    include: { food: { select: { id: true, name: true, brand: true } } },
  });

  res.status(201).json({ meal: serialize(meal) });
});

// Daily summary lives under the nested pet router as well.
mealsNestedRouter.get<{ petId: string }>("/daily-summary", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const date =
    typeof req.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : new Date().toISOString().slice(0, 10);
  const summary = await getDailySummary(req.params.petId, date);
  res.json({ summary });
});

// Standalone /api/meals/:id
export const mealsRouter = Router();
mealsRouter.use(requireAuth);

async function loadOwnedMeal(id: string, userId: string) {
  const meal = await prisma.mealLog.findUnique({ where: { id }, include: { pet: true } });
  if (!meal || meal.pet.userId !== userId) {
    throw new HttpError(404, "Meal not found");
  }
  return meal;
}

mealsRouter.put("/:id", async (req, res) => {
  const existing = await loadOwnedMeal(req.params.id, req.user!.userId);
  const data = mealBaseSchema.partial().parse(req.body);

  const foodId = data.foodId ?? existing.foodId;
  const food = await assertFoodAccessible(foodId, req.user!.userId);

  const amountGrams = data.amountGrams !== undefined ? data.amountGrams : existing.amountGrams;
  const amountServings =
    data.amountServings !== undefined ? data.amountServings : existing.amountServings;

  const computedKcal = computeMealKcal(food, { amountGrams, amountServings });

  const meal = await prisma.mealLog.update({
    where: { id: req.params.id },
    data: {
      foodId,
      loggedAt: data.loggedAt ?? existing.loggedAt,
      amountGrams: amountGrams ?? null,
      amountServings: amountServings ?? null,
      computedKcal,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    },
    include: { food: { select: { id: true, name: true, brand: true } } },
  });

  res.json({ meal: serialize(meal) });
});

mealsRouter.delete("/:id", async (req, res) => {
  await loadOwnedMeal(req.params.id, req.user!.userId);
  await prisma.mealLog.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
