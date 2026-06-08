import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { assertPetOwnership } from "../utils/access";
import { serialize } from "../utils/serialize";

const eventBodySchema = z.object({
  eventAt: z.coerce.date().optional(),
  type: z.enum(["vet_visit", "symptom", "medication", "lab_result", "other"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullish(),
});

// Nested under /api/pets/:petId
export const eventsNestedRouter = Router({ mergeParams: true });
eventsNestedRouter.use(requireAuth);

eventsNestedRouter.get<{ petId: string }>("/events", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;

  const events = await prisma.healthEvent.findMany({
    where: {
      petId: req.params.petId,
      ...(type ? { type } : {}),
      ...(from || to ? { eventAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    orderBy: { eventAt: "desc" },
  });
  res.json({ events: serialize(events) });
});

eventsNestedRouter.post<{ petId: string }>("/events", async (req, res) => {
  await assertPetOwnership(req.params.petId, req.user!.userId);
  const data = eventBodySchema.parse(req.body);
  const event = await prisma.healthEvent.create({
    data: {
      petId: req.params.petId,
      eventAt: data.eventAt ?? new Date(),
      type: data.type,
      title: data.title,
      description: data.description ?? null,
    },
  });
  res.status(201).json({ event: serialize(event) });
});

// Standalone /api/events/:id
export const eventsRouter = Router();
eventsRouter.use(requireAuth);

async function loadOwnedEvent(id: string, userId: string) {
  const event = await prisma.healthEvent.findUnique({ where: { id }, include: { pet: true } });
  if (!event || event.pet.userId !== userId) {
    throw new HttpError(404, "Health event not found");
  }
  return event;
}

eventsRouter.put("/:id", async (req, res) => {
  const existing = await loadOwnedEvent(req.params.id, req.user!.userId);
  const data = eventBodySchema.partial().parse(req.body);
  const event = await prisma.healthEvent.update({
    where: { id: req.params.id },
    data: {
      eventAt: data.eventAt ?? existing.eventAt,
      type: data.type ?? existing.type,
      title: data.title ?? existing.title,
      description: data.description !== undefined ? data.description : existing.description,
    },
  });
  res.json({ event: serialize(event) });
});

eventsRouter.delete("/:id", async (req, res) => {
  await loadOwnedEvent(req.params.id, req.user!.userId);
  await prisma.healthEvent.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
