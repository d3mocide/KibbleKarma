import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { assertPetOwnership } from "../utils/access";
import { serialize } from "../utils/serialize";

export const petsRouter = Router();
petsRouter.use(requireAuth);

const petBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.enum(["dog", "cat", "other"]).default("dog"),
  breed: z.string().nullish(),
  sex: z.enum(["male", "female", "unknown"]).default("unknown"),
  dateOfBirth: z.coerce.date().nullish(),
  idealWeightMinKg: z.coerce.number().positive().nullish(),
  idealWeightMaxKg: z.coerce.number().positive().nullish(),
  vetDailyEnergyKcal: z.coerce.number().positive().nullish(),
  notes: z.string().nullish(),
});

petsRouter.get("/", async (req, res) => {
  const pets = await prisma.pet.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "asc" },
    include: {
      weightLogs: { orderBy: { weighedAt: "desc" }, take: 1 },
      _count: { select: { mealLogs: true, weightLogs: true, healthEvents: true } },
    },
  });

  const result = pets.map((pet) => {
    const { weightLogs, ...rest } = pet;
    return { ...rest, lastWeight: weightLogs[0] ?? null };
  });

  res.json({ pets: serialize(result) });
});

petsRouter.post("/", async (req, res) => {
  const data = petBodySchema.parse(req.body);
  const pet = await prisma.pet.create({
    data: { ...data, userId: req.user!.userId },
  });
  res.status(201).json({ pet: serialize(pet) });
});

petsRouter.get("/:id", async (req, res) => {
  await assertPetOwnership(req.params.id, req.user!.userId);
  const pet = await prisma.pet.findUnique({
    where: { id: req.params.id },
    include: {
      weightLogs: { orderBy: { weighedAt: "desc" }, take: 1 },
      _count: { select: { mealLogs: true, weightLogs: true, healthEvents: true, petFoodProfiles: true } },
    },
  });
  if (!pet) throw new HttpError(404, "Pet not found");
  const { weightLogs, ...rest } = pet;
  res.json({ pet: serialize({ ...rest, lastWeight: weightLogs[0] ?? null }) });
});

petsRouter.put("/:id", async (req, res) => {
  await assertPetOwnership(req.params.id, req.user!.userId);
  const data = petBodySchema.partial().parse(req.body);
  const pet = await prisma.pet.update({ where: { id: req.params.id }, data });
  res.json({ pet: serialize(pet) });
});

petsRouter.delete("/:id", async (req, res) => {
  await assertPetOwnership(req.params.id, req.user!.userId);
  await prisma.pet.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
