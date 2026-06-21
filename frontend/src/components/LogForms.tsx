import { useState, type FormEvent } from "react";
import type { Food } from "../api/types";
import { ErrorBanner, TextField, SelectField, Button } from "./ui";
import { toLocalInputValue } from "../utils/format";
import { useUnits } from "../hooks/useUnits";

// --- Meal form ---
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
  const u = useUnits();
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
      
      <SelectField 
        label="Food" 
        value={v.foodId} 
        onChange={(e) => set("foodId", e.target.value)} 
        required
      >
        {foods.length === 0 && <option value="">No foods yet — add one first</option>}
        {foods.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
            {f.brand ? ` (${f.brand})` : ""}
          </option>
        ))}
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          type="number"
          step="0.1"
          min="0"
          label={`Amount (${u.massUnit})`}
          value={v.amountGrams}
          onChange={(e) => set("amountGrams", e.target.value)}
          placeholder={u.system === "imperial" ? "e.g. 3.2" : "e.g. 90"}
        />
        
        <TextField 
          type="number" 
          step="0.1" 
          min="0" 
          label={`or Servings${selectedFood?.servingSizeG ? ` (${selectedFood.servingSizeG} g each)` : ""}`} 
          value={v.amountServings} 
          onChange={(e) => set("amountServings", e.target.value)} 
          placeholder="e.g. 1" 
        />
      </div>

      <TextField 
        type="datetime-local" 
        label="When" 
        value={v.loggedAt} 
        onChange={(e) => set("loggedAt", e.target.value)} 
      />

      <TextField 
        label="Notes" 
        value={v.notes} 
        onChange={(e) => set("notes", e.target.value)} 
      />

      <Button 
        type="submit" 
        loading={submitting} 
        fullWidth 
        disabled={foods.length === 0}
      >
        Log this meal
      </Button>
    </form>
  );
}

// --- Weight form ---
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
  const u = useUnits();
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
        <TextField
          type="number"
          step="0.01"
          min="0"
          label={`Weight (${u.weightUnit})`}
          value={v.weightKg}
          onChange={(e) => set("weightKg", e.target.value)}
          required
        />
        
        <SelectField 
          label="Body condition (1–9)" 
          value={v.bodyConditionScore} 
          onChange={(e) => set("bodyConditionScore", e.target.value)}
        >
          <option value="">—</option>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </SelectField>
      </div>

      <TextField 
        type="datetime-local" 
        label="When" 
        value={v.weighedAt} 
        onChange={(e) => set("weighedAt", e.target.value)} 
      />

      <TextField 
        label="Notes" 
        value={v.notes} 
        onChange={(e) => set("notes", e.target.value)} 
      />

      <Button type="submit" loading={submitting} fullWidth>
        Log weigh-in
      </Button>
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
        <SelectField 
          label="Type" 
          value={v.type} 
          onChange={(e) => set("type", e.target.value)}
        >
          <option value="vet_visit">Vet visit</option>
          <option value="symptom">Symptom</option>
          <option value="medication">Medication</option>
          <option value="lab_result">Lab result</option>
          <option value="other">Other</option>
        </SelectField>
        
        <TextField 
          type="datetime-local" 
          label="When" 
          value={v.eventAt} 
          onChange={(e) => set("eventAt", e.target.value)} 
        />
      </div>

      <TextField 
        label="Title" 
        value={v.title} 
        onChange={(e) => set("title", e.target.value)} 
        required 
      />

      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={3}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <Button type="submit" loading={submitting} fullWidth>
        Log health note
      </Button>
    </form>
  );
}

