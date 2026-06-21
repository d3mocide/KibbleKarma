import { api } from "./client";
import type {
  DailySummary,
  Food,
  HealthEvent,
  MealLog,
  Pet,
  PetFoodProfile,
  UnitSystem,
  User,
  WeightLog,
  WeightTrend,
} from "./types";

// --- Auth ---
export const authApi = {
  status: () =>
    api
      .get<{ needsSetup: boolean; allowRegistration: boolean }>("/auth/status")
      .then((r) => r.data),
  register: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/register", { email, password }).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
  updatePreferences: (data: { unitSystem: UnitSystem }) =>
    api.patch<{ user: User }>("/auth/me", data).then((r) => r.data.user),
};

// --- Pets ---
export const petsApi = {
  list: () => api.get<{ pets: Pet[] }>("/pets").then((r) => r.data.pets),
  get: (id: string) => api.get<{ pet: Pet }>(`/pets/${id}`).then((r) => r.data.pet),
  create: (data: Partial<Pet>) => api.post<{ pet: Pet }>("/pets", data).then((r) => r.data.pet),
  update: (id: string, data: Partial<Pet>) =>
    api.put<{ pet: Pet }>(`/pets/${id}`, data).then((r) => r.data.pet),
  remove: (id: string) => api.delete(`/pets/${id}`).then(() => undefined),
};

// --- Foods ---
export const foodsApi = {
  list: (params?: { search?: string; category?: string }) =>
    api.get<{ foods: Food[] }>("/foods", { params }).then((r) => r.data.foods),
  get: (id: string) => api.get<{ food: Food }>(`/foods/${id}`).then((r) => r.data.food),
  create: (data: Partial<Food>) => api.post<{ food: Food }>("/foods", data).then((r) => r.data.food),
  update: (id: string, data: Partial<Food>) =>
    api.put<{ food: Food }>(`/foods/${id}`, data).then((r) => r.data.food),
  remove: (id: string) => api.delete(`/foods/${id}`).then(() => undefined),
  lookupByBarcode: (barcode: string) =>
    api
      .post<{ food: Food; existing: boolean }>("/foods/lookup-by-barcode", { barcode })
      .then((r) => r.data),
};

// --- Pet food profiles (diet) ---
export const dietApi = {
  list: (petId: string) =>
    api.get<{ profiles: PetFoodProfile[] }>(`/pets/${petId}/foods`).then((r) => r.data.profiles),
  create: (petId: string, data: Partial<PetFoodProfile> & { foodId: string }) =>
    api.post<{ profile: PetFoodProfile }>(`/pets/${petId}/foods`, data).then((r) => r.data.profile),
  update: (id: string, data: Partial<PetFoodProfile>) =>
    api.put<{ profile: PetFoodProfile }>(`/pet-food-profiles/${id}`, data).then((r) => r.data.profile),
  remove: (id: string) => api.delete(`/pet-food-profiles/${id}`).then(() => undefined),
};

// --- Meals ---
export const mealsApi = {
  list: (petId: string, params?: { from?: string; to?: string; limit?: number; offset?: number }) =>
    api
      .get<{ meals: MealLog[]; total: number }>(`/pets/${petId}/meals`, { params })
      .then((r) => r.data),
  create: (petId: string, data: Partial<MealLog> & { foodId: string }) =>
    api.post<{ meal: MealLog }>(`/pets/${petId}/meals`, data).then((r) => r.data.meal),
  update: (id: string, data: Partial<MealLog>) =>
    api.put<{ meal: MealLog }>(`/meals/${id}`, data).then((r) => r.data.meal),
  remove: (id: string) => api.delete(`/meals/${id}`).then(() => undefined),
  dailySummary: (petId: string, date: string) =>
    api
      .get<{ summary: DailySummary }>(`/pets/${petId}/daily-summary`, { params: { date } })
      .then((r) => r.data.summary),
};

// --- Weights ---
export const weightsApi = {
  list: (petId: string, params?: { from?: string; to?: string }) =>
    api
      .get<{ weights: WeightLog[]; trend30d: WeightTrend | null }>(`/pets/${petId}/weights`, { params })
      .then((r) => r.data),
  create: (petId: string, data: Partial<WeightLog> & { weightKg: number }) =>
    api.post<{ weight: WeightLog }>(`/pets/${petId}/weights`, data).then((r) => r.data.weight),
  update: (id: string, data: Partial<WeightLog>) =>
    api.put<{ weight: WeightLog }>(`/weights/${id}`, data).then((r) => r.data.weight),
  remove: (id: string) => api.delete(`/weights/${id}`).then(() => undefined),
};

// --- Health events ---
export const eventsApi = {
  list: (petId: string, params?: { from?: string; to?: string; type?: string }) =>
    api.get<{ events: HealthEvent[] }>(`/pets/${petId}/events`, { params }).then((r) => r.data.events),
  create: (
    petId: string,
    data: Omit<Partial<HealthEvent>, "type"> & { title: string; type: string }
  ) => api.post<{ event: HealthEvent }>(`/pets/${petId}/events`, data).then((r) => r.data.event),
  update: (id: string, data: Partial<HealthEvent>) =>
    api.put<{ event: HealthEvent }>(`/events/${id}`, data).then((r) => r.data.event),
  remove: (id: string) => api.delete(`/events/${id}`).then(() => undefined),
};
