export type Species = "dog" | "cat" | "other";
export type Sex = "male" | "female" | "unknown";
export type FoodSource = "manual" | "open_food_facts";
export type HealthEventType =
  | "vet_visit"
  | "symptom"
  | "medication"
  | "lab_result"
  | "other";

export interface User {
  id: string;
  email: string;
}

export interface WeightLog {
  id: string;
  petId: string;
  weighedAt: string;
  weightKg: number;
  bodyConditionScore: number | null;
  notes: string | null;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: Species;
  breed: string | null;
  sex: Sex;
  dateOfBirth: string | null;
  idealWeightMinKg: number | null;
  idealWeightMaxKg: number | null;
  vetDailyEnergyKcal: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastWeight?: WeightLog | null;
  _count?: {
    mealLogs: number;
    weightLogs: number;
    healthEvents: number;
    petFoodProfiles?: number;
  };
}

export interface Food {
  id: string;
  userId: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  barcode: string | null;
  energyKcalPer100g: number | null;
  energyKcalPerKg: number | null;
  energyKcalPerServing: number | null;
  servingSizeG: number | null;
  source: FoodSource;
  offProductUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetFoodProfile {
  id: string;
  petId: string;
  foodId: string;
  isPrimary: boolean;
  targetDailyKcal: number | null;
  targetDailyGrams: number | null;
  mealsPerDay: number | null;
  notes: string | null;
  food: Food;
}

export interface MealLog {
  id: string;
  petId: string;
  foodId: string;
  loggedAt: string;
  amountGrams: number | null;
  amountServings: number | null;
  computedKcal: number | null;
  notes: string | null;
  food: { id: string; name: string; brand: string | null };
}

export interface HealthEvent {
  id: string;
  petId: string;
  eventAt: string;
  type: HealthEventType;
  title: string;
  description: string | null;
}

export interface DailySummary {
  date: string;
  totalKcal: number;
  totalGrams: number;
  targetKcal: number | null;
  remainingKcal: number | null;
  breakdown: Array<{
    foodId: string;
    foodName: string;
    kcal: number;
    grams: number;
    meals: number;
  }>;
}

export interface WeightTrend {
  changeKg: number;
  avgDailyChangeKg: number;
  days: number;
}
