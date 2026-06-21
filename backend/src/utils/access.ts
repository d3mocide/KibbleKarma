import { prisma } from "../prisma";
import { HttpError } from "../middleware/error";

// Ensure the pet exists and belongs to the given user. Throws otherwise.
export async function assertPetOwnership(petId: string, userId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== userId) {
    throw new HttpError(404, "Pet not found");
  }
  return pet;
}

// Validate that a food is usable by the user. Foods are per-user: each user
// owns their own catalog entries, including ones created from barcode/OFF
// lookups.
export async function assertFoodAccessible(foodId: string, userId: string) {
  const food = await prisma.food.findUnique({ where: { id: foodId } });
  if (!food || food.userId !== userId) {
    throw new HttpError(404, "Food not found");
  }
  return food;
}
