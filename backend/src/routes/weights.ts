import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { assertPetOwnership } from "../utils/access";
import { serialize } from "../utils/serialize";
import { getWeightSeries } from "../services/summary";

const weightBodySchema = z.object({
  weighedAt: z.coerce.date().optional(),
  weightKg: z.coerce.number().positive("Weight must be positive"),
  bodyConditionScore: z.coerce.number().min(1).max(9).nullish(),
  notes: z.string().nullish(),
});

// Nested under /api/pets/:petId
export const weightsNestedRouter = Router({ mergeParams: true });
weightsNestedRouter.use(requireAuth);

weightsNestedRouter.get<{ petId: string }>("/weights", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const { series, trend30d } = await getWeightSeries(req.params.petId, from, to);
  res.json({ weights: series, trend30d });
});

weightsNestedRouter.post<{ petId: string }>("/weights", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const data = weightBodySchema.parse(req.body);
  const weight = await prisma.weightLog.create({
    data: {
      petId: req.params.petId,
      weighedAt: data.weighedAt ?? new Date(),
      weightKg: data.weightKg,
      bodyConditionScore: data.bodyConditionScore ?? null,
      notes: data.notes ?? null,
    },
  });
  res.status(201).json({ weight: serialize(weight) });
});

// Standalone /api/weights/:id
export const weightsRouter = Router();
weightsRouter.use(requireAuth);

async function loadOwnedWeight(id: string, userId: string) {
  const weight = await prisma.weightLog.findUnique({ where: { id }, include: { pet: true } });
  if (!weight || weight.pet.userId !== userId) {
    throw new HttpError(404, "Weight log not found");
  }
  return weight;
}

weightsRouter.put("/:id", async (req, res) => {
  const existing = await loadOwnedWeight(req.params.id, req.user!.userId);
  const data = weightBodySchema.partial().parse(req.body);
  const weight = await prisma.weightLog.update({
    where: { id: req.params.id },
    data: {
      weighedAt: data.weighedAt ?? existing.weighedAt,
      weightKg: data.weightKg ?? existing.weightKg,
      bodyConditionScore:
        data.bodyConditionScore !== undefined ? data.bodyConditionScore : existing.bodyConditionScore,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    },
  });
  res.json({ weight: serialize(weight) });
});

weightsRouter.delete("/:id", async (req, res) => {
  await loadOwnedWeight(req.params.id, req.user!.userId);
  await prisma.weightLog.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
