import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { assertFoodAccessible } from "../utils/access";
import { serialize } from "../utils/serialize";
import { lookupBarcode, OffNotFoundError, OffUnavailableError } from "../services/off";

export const foodsRouter = Router();
foodsRouter.use(requireAuth);

const foodBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().nullish(),
  category: z.string().nullish(),
  barcode: z.string().nullish(),
  energyKcalPer100g: z.coerce.number().nonnegative().nullish(),
  energyKcalPerServing: z.coerce.number().nonnegative().nullish(),
  servingSizeG: z.coerce.number().positive().nullish(),
});

// Derive per-kg from per-100g when provided.
function withDerived(input: z.infer<typeof foodBodySchema>) {
  const energyKcalPerKg =
    input.energyKcalPer100g !== null && input.energyKcalPer100g !== undefined
      ? Math.round(input.energyKcalPer100g * 10 * 100) / 100
      : null;
  return { ...input, energyKcalPerKg };
}

foodsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";

  const where: Prisma.FoodWhereInput = {
    // Foods are per-user: each account has its own catalog.
    userId: req.user!.userId,
  };
  const and: Prisma.FoodWhereInput[] = [];
  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (category) {
    and.push({ category: { contains: category, mode: "insensitive" } });
  }
  if (and.length > 0) where.AND = and;

  const foods = await prisma.food.findMany({
    where,
    orderBy: { name: "asc" },
    take: 200,
  });
  res.json({ foods: serialize(foods) });
});

foodsRouter.post("/", async (req, res) => {
  const data = withDerived(foodBodySchema.parse(req.body));
  const food = await prisma.food.create({
    data: { ...data, source: "manual", userId: req.user!.userId },
  });
  res.status(201).json({ food: serialize(food) });
});

// Barcode lookup must be declared before "/:id" so it isn't captured by it.
const barcodeSchema = z.object({ barcode: z.string().min(4).max(64) });

foodsRouter.post("/lookup-by-barcode", async (req, res) => {
  const { barcode } = barcodeSchema.parse(req.body);
  const trimmed = barcode.trim();

  // Return the user's existing record for this barcode if we already have it.
  const existing = await prisma.food.findFirst({
    where: {
      barcode: trimmed,
      userId: req.user!.userId,
    },
  });
  if (existing) {
    return res.json({ food: serialize(existing), existing: true });
  }

  try {
    const mapped = await lookupBarcode(trimmed);
    const food = await prisma.food.create({
      data: {
        userId: req.user!.userId, // each user owns their own catalog entry
        name: mapped.name,
        brand: mapped.brand,
        category: mapped.category,
        barcode: mapped.barcode,
        energyKcalPer100g: mapped.energyKcalPer100g,
        energyKcalPerKg: mapped.energyKcalPerKg,
        energyKcalPerServing: mapped.energyKcalPerServing,
        servingSizeG: mapped.servingSizeG,
        source: "open_food_facts",
        offProductUrl: mapped.offProductUrl,
        rawOffData: mapped.raw as Prisma.InputJsonValue,
      },
    });
    return res.status(201).json({ food: serialize(food), existing: false });
  } catch (err) {
    if (err instanceof OffNotFoundError) {
      throw new HttpError(404, "We couldn't find that barcode in Open Food Facts. Try adding it manually.");
    }
    if (err instanceof OffUnavailableError) {
      throw new HttpError(502, err.message);
    }
    throw err;
  }
});

foodsRouter.get("/:id", async (req, res) => {
  const food = await assertFoodAccessible(req.params.id, req.user!.userId);
  res.json({ food: serialize(food) });
});

foodsRouter.put("/:id", async (req, res) => {
  const food = await assertFoodAccessible(req.params.id, req.user!.userId);
  if (food.source === "open_food_facts") {
    throw new HttpError(403, "Open Food Facts foods are read-only and cannot be edited");
  }
  const data = withDerived(foodBodySchema.parse(req.body));
  const updated = await prisma.food.update({ where: { id: req.params.id }, data });
  res.json({ food: serialize(updated) });
});

foodsRouter.delete("/:id", async (req, res) => {
  // assertFoodAccessible only resolves the user's own foods or shared/OFF
  // foods, so any food the user can see here may be removed from the catalog.
  // Foods still referenced by meal logs are protected by the FK constraint
  // below and surface as a 409.
  await assertFoodAccessible(req.params.id, req.user!.userId);
  try {
    await prisma.food.delete({ where: { id: req.params.id } });
  } catch {
    throw new HttpError(409, "This food is in use by meal logs and cannot be deleted");
  }
  res.status(204).send();
});
