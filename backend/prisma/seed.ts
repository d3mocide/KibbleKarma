import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeMealKcal } from "../src/utils/calories";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@kibblekarma.app";
const DEMO_PASSWORD = "password123";

async function main() {
  console.log("Seeding KibbleKarma demo data...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, passwordHash },
  });

  // Start fresh for this demo user so re-seeding is idempotent.
  await prisma.pet.deleteMany({ where: { userId: user.id } });
  await prisma.food.deleteMany({ where: { userId: user.id } });

  const pet = await prisma.pet.create({
    data: {
      userId: user.id,
      name: "Biscuit",
      species: "dog",
      breed: "Corgi",
      sex: "female",
      dateOfBirth: new Date("2021-04-12"),
      idealWeightMinKg: 11,
      idealWeightMaxKg: 13,
      vetDailyEnergyKcal: 700,
      notes: "Loves naps in the sun and chasing leaves.",
    },
  });

  const kibble = await prisma.food.create({
    data: {
      userId: user.id,
      name: "Cozy Crunch Dry Dog Food",
      brand: "Naptime Naturals",
      category: "dry_dog_food",
      energyKcalPer100g: 360,
      energyKcalPerKg: 3600,
      servingSizeG: 100,
      source: "manual",
    },
  });

  const treats = await prisma.food.create({
    data: {
      userId: user.id,
      name: "Peanut Butter Nibbles",
      brand: "Snack Snoozers",
      category: "treat",
      energyKcalPerServing: 15,
      servingSizeG: 5,
      source: "manual",
    },
  });

  await prisma.petFoodProfile.create({
    data: {
      petId: pet.id,
      foodId: kibble.id,
      isPrimary: true,
      targetDailyKcal: 650,
      targetDailyGrams: 180,
      mealsPerDay: 2,
      notes: "Main diet, split into breakfast and dinner.",
    },
  });

  await prisma.petFoodProfile.create({
    data: {
      petId: pet.id,
      foodId: treats.id,
      isPrimary: false,
      targetDailyKcal: 50,
      mealsPerDay: 2,
      notes: "Training treats only.",
    },
  });

  // Weight logs over the last ~12 weeks.
  const now = new Date();
  const weights = [12.8, 12.7, 12.6, 12.6, 12.5, 12.4, 12.4, 12.3, 12.3, 12.2, 12.2, 12.1];
  for (let i = 0; i < weights.length; i++) {
    const weighedAt = new Date(now);
    weighedAt.setDate(now.getDate() - (weights.length - 1 - i) * 7);
    await prisma.weightLog.create({
      data: {
        petId: pet.id,
        weighedAt,
        weightKg: weights[i],
        bodyConditionScore: 5,
      },
    });
  }

  // Meal logs over the last 3 days.
  for (let d = 2; d >= 0; d--) {
    const breakfast = new Date(now);
    breakfast.setDate(now.getDate() - d);
    breakfast.setHours(8, 0, 0, 0);
    const dinner = new Date(breakfast);
    dinner.setHours(18, 0, 0, 0);

    const grams = 90;
    await prisma.mealLog.create({
      data: {
        petId: pet.id,
        foodId: kibble.id,
        loggedAt: breakfast,
        amountGrams: grams,
        computedKcal: computeMealKcal(kibble, { amountGrams: grams }),
      },
    });
    await prisma.mealLog.create({
      data: {
        petId: pet.id,
        foodId: kibble.id,
        loggedAt: dinner,
        amountGrams: grams,
        computedKcal: computeMealKcal(kibble, { amountGrams: grams }),
      },
    });
    await prisma.mealLog.create({
      data: {
        petId: pet.id,
        foodId: treats.id,
        loggedAt: dinner,
        amountServings: 2,
        computedKcal: computeMealKcal(treats, { amountServings: 2 }),
      },
    });
  }

  await prisma.healthEvent.create({
    data: {
      petId: pet.id,
      eventAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14),
      type: "vet_visit",
      title: "Annual checkup",
      description: "All healthy! Vet recommended keeping weight around 12 kg.",
    },
  });
  await prisma.healthEvent.create({
    data: {
      petId: pet.id,
      eventAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
      type: "symptom",
      title: "Slightly upset tummy",
      description: "Skipped breakfast, back to normal by dinner.",
    },
  });

  console.log("Seed complete!");
  console.log(`Demo login -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
