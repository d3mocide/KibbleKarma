import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { assertPetOwnership, assertFoodAccessible } from "../utils/access";
import { serialize } from "../utils/serialize";

const profileBodySchema = z.object({
  foodId: z.string().uuid(),
  isPrimary: z.boolean().default(false),
  targetDailyKcal: z.coerce.number().positive().nullish(),
  targetDailyGrams: z.coerce.number().positive().nullish(),
  mealsPerDay: z.coerce.number().positive().nullish(),
  notes: z.string().nullish(),
});

// Nested under /api/pets/:petId/foods
export const petFoodsNestedRouter = Router({ mergeParams: true });
petFoodsNestedRouter.use(requireAuth);

petFoodsNestedRouter.get<{ petId: string }>("/", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const profiles = await prisma.petFoodProfile.findMany({
    where: { petId: req.params.petId },
    include: { food: true },
    orderBy: { createdAt: "asc" },
  });
  res.json({ profiles: serialize(profiles) });
});

petFoodsNestedRouter.post<{ petId: string }>("/", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const data = profileBodySchema.parse(req.body);
  await assertFoodAccessible(data.foodId, req.user!.userId);
  const profile = await prisma.petFoodProfile.create({
    data: { ...data, petId: req.params.petId },
    include: { food: true },
  });
  res.status(201).json({ profile: serialize(profile) });
});

// Standalone /api/pet-food-profiles/:id
export const petFoodProfilesRouter = Router();
petFoodProfilesRouter.use(requireAuth);

async function loadOwnedProfile(id: string, userId: string) {
  const profile = await prisma.petFoodProfile.findUnique({
    where: { id },
    include: { pet: true },
  });
  if (!profile || profile.pet.userId !== userId) {
    throw new HttpError(404, "Pet food profile not found");
  }
  return profile;
}

petFoodProfilesRouter.put("/:id", async (req, res) => {
  await loadOwnedProfile(req.params.id, req.user!.userId);
  const data = profileBodySchema.partial().parse(req.body);
  if (data.foodId) {
    await assertFoodAccessible(data.foodId, req.user!.userId);
  }
  const profile = await prisma.petFoodProfile.update({
    where: { id: req.params.id },
    data,
    include: { food: true },
  });
  res.json({ profile: serialize(profile) });
});

petFoodProfilesRouter.delete("/:id", async (req, res) => {
  await loadOwnedProfile(req.params.id, req.user!.userId);
  await prisma.petFoodProfile.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
