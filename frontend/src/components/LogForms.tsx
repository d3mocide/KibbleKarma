import { useState, type FormEvent } from "react";
import type { Food } from "../api/types";
import { ErrorBanner } from "./ui";
import { toLocalInputValue } from "../utils/format";

// --- Meal (nibble) form ---
export interface MealFormValues {
  foodId: string;
  loggedAt: string;
  amountGrams: string;
  amountServings: string;
  notes: string;
}

export function MealForm({
  foods,
  onSubmit,
  submitting,
  error,
}: {
  foods: Food[];
  onSubmit: (v: MealFormValues) => void;
  submitting: boolean;
  error: string;
}) {
  const [v, setV] = useState<MealFormValues>({
    foodId: foods[0]?.id ?? "",
    loggedAt: toLocalInputValue(),
    amountGrams: "",
    amountServings: "",
    notes: "",
  });
  const set = (k: keyof MealFormValues, val: string) => setV((p) => ({ ...p, [k]: val }));
  const selectedFood = foods.find((f) => f.id === v.foodId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(v);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorBanner message={error} />
      <div>
        <label className="label">Food</label>
        <select className="input" value={v.foodId} onChange={(e) => set("foodId", e.target.value)} required>
          {foods.length === 0 && <option value="">No foods yet — add one first</option>}
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
              {f.brand ? ` (${f.brand})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (grams)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="input"
            value={v.amountGrams}
            onChange={(e) => set("amountGrams", e.target.value)}
            placeholder="e.g. 90"
          />
        </div>
        <div>
          <label className="label">
            or Servings
            {selectedFood?.servingSizeG ? ` (${selectedFood.servingSizeG} g each)` : ""}
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="input"
            value={v.amountServings}
            onChange={(e) => set("amountServings", e.target.value)}
            placeholder="e.g. 1"
          />
        </div>
      </div>
      <div>
        <label className="label">When</label>
        <input
          type="datetime-local"
          className="input"
          value={v.loggedAt}
          onChange={(e) => set("loggedAt", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Notes</label>
        <input className="input" value={v.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={submitting || foods.length === 0}>
        {submitting ? "Logging..." : "Log this nibble"}
      </button>
    </form>
  );
}

// --- Weight (weigh-in) form ---
export interface WeightFormValues {
  weightKg: string;
  weighedAt: string;
  bodyConditionScore: string;
  notes: string;
}

export function WeightForm({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (v: WeightFormValues) => void;
  submitting: boolean;
  error: string;
}) {
  const [v, setV] = useState<WeightFormValues>({
    weightKg: "",
    weighedAt: toLocalInputValue(),
    bodyConditionScore: "",
    notes: "",
  });
  const set = (k: keyof WeightFormValues, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(v);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            value={v.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Body condition (1–9)</label>
          <select
            className="input"
            value={v.bodyConditionScore}
            onChange={(e) => set("bodyConditionScore", e.target.value)}
          >
            <option value="">—</option>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">When</label>
        <input
          type="datetime-local"
          className="input"
          value={v.weighedAt}
          onChange={(e) => set("weighedAt", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Notes</label>
        <input className="input" value={v.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={submitting}>
        {submitting ? "Saving..." : "Log weigh-in"}
      </button>
    </form>
  );
}

// --- Health event form ---
export interface EventFormValues {
  type: string;
  title: string;
  eventAt: string;
  description: string;
}

export function EventForm({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (v: EventFormValues) => void;
  submitting: boolean;
  error: string;
}) {
  const [v, setV] = useState<EventFormValues>({
    type: "vet_visit",
    title: "",
    eventAt: toLocalInputValue(),
    description: "",
  });
  const set = (k: keyof EventFormValues, val: string) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(v);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" value={v.type} onChange={(e) => set("type", e.target.value)}>
            <option value="vet_visit">Vet visit</option>
            <option value="symptom">Symptom</option>
            <option value="medication">Medication</option>
            <option value="lab_result">Lab result</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">When</label>
          <input
            type="datetime-local"
            className="input"
            value={v.eventAt}
            onChange={(e) => set("eventAt", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Title</label>
        <input className="input" value={v.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={3}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <button className="btn-primary w-full" disabled={submitting}>
        {submitting ? "Saving..." : "Log health note"}
      </button>
    </form>
  );
}
