-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('metric', 'imperial');

-- AlterTable: per-user display unit preference (defaults to imperial)
ALTER TABLE "users" ADD COLUMN "unit_system" "UnitSystem" NOT NULL DEFAULT 'imperial';

-- Per-user food catalog: assign any previously-shared (ownerless) foods to a
-- concrete owner so each food belongs to a single user. Prefer the user who
-- already references the food via a diet profile or meal log; otherwise fall
-- back to the first (owner) account.
UPDATE "foods" f
SET "user_id" = sub.user_id
FROM (
  SELECT f2.id AS food_id,
    COALESCE(
      (SELECT p."user_id" FROM "pet_food_profiles" pfp
         JOIN "pets" p ON p.id = pfp."pet_id"
        WHERE pfp."food_id" = f2.id LIMIT 1),
      (SELECT p."user_id" FROM "meal_logs" ml
         JOIN "pets" p ON p.id = ml."pet_id"
        WHERE ml."food_id" = f2.id LIMIT 1),
      (SELECT u.id FROM "users" u ORDER BY u."created_at" ASC LIMIT 1)
    ) AS user_id
  FROM "foods" f2
  WHERE f2."user_id" IS NULL
) sub
WHERE f.id = sub.food_id AND sub.user_id IS NOT NULL;
