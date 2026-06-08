import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { assertPetOwnership } from "../utils/access";

// Nested under /api/pets/:petId
export const exportsNestedRouter = Router({ mergeParams: true });
exportsNestedRouter.use(requireAuth);

function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" && "toString" in value ? value.toString() : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(row.map(csvField).join(","));
  return lines.join("\n");
}

exportsNestedRouter.get<{ petId: string }>("/export/weights.csv", async (req, res) => {
  const pet = await assertPetOwnership(req.params.petId, req.user!.userId);
  const logs = await prisma.weightLog.findMany({
    where: { petId: pet.id },
    orderBy: { weighedAt: "asc" },
  });
  const csv = toCsv(
    ["weighed_at", "weight_kg", "body_condition_score", "notes"],
    logs.map((l) => [l.weighedAt.toISOString(), l.weightKg, l.bodyConditionScore, l.notes])
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${pet.name}-weights.csv"`);
  res.send(csv);
});

exportsNestedRouter.get<{ petId: string }>("/export/meals.csv", async (req, res) => {
  const pet = await assertPetOwnership(req.params.petId, req.user!.userId);
  const logs = await prisma.mealLog.findMany({
    where: { petId: pet.id },
    include: { food: { select: { name: true } } },
    orderBy: { loggedAt: "asc" },
  });
  const csv = toCsv(
    ["logged_at", "food", "amount_grams", "amount_servings", "computed_kcal", "notes"],
    logs.map((l) => [
      l.loggedAt.toISOString(),
      l.food.name,
      l.amountGrams,
      l.amountServings,
      l.computedKcal,
      l.notes,
    ])
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${pet.name}-meals.csv"`);
  res.send(csv);
});
