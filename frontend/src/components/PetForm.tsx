import { useState, type FormEvent } from "react";
import type { Pet } from "../api/types";
import { ErrorBanner, TextField, SelectField, Button } from "./ui";
import { useUnits } from "../hooks/useUnits";
import type { Units } from "../utils/units";

export interface PetFormValues {
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  sex: "male" | "female" | "unknown";
  dateOfBirth: string;
  idealWeightMinKg: string;
  idealWeightMaxKg: string;
  vetDailyEnergyKcal: string;
  notes: string;
}

// Weight fields are entered/displayed in the user's units; round the converted
// display value so form inputs don't show long floating-point tails.
function weightToInput(kg: number | null | undefined, u: Units): string {
  if (kg == null) return "";
  return String(Math.round(u.fromKg(kg) * 100) / 100);
}

function toForm(pet: Pet | null | undefined, u: Units): PetFormValues {
  return {
    name: pet?.name ?? "",
    species: pet?.species ?? "dog",
    breed: pet?.breed ?? "",
    sex: pet?.sex ?? "unknown",
    dateOfBirth: pet?.dateOfBirth ? pet.dateOfBirth.slice(0, 10) : "",
    idealWeightMinKg: weightToInput(pet?.idealWeightMinKg, u),
    idealWeightMaxKg: weightToInput(pet?.idealWeightMaxKg, u),
    vetDailyEnergyKcal: pet?.vetDailyEnergyKcal != null ? String(pet.vetDailyEnergyKcal) : "",
    notes: pet?.notes ?? "",
  };
}

// Build the API payload, dropping empty optional fields. Weight inputs are in
// the user's display units and converted back to metric (kg) for storage.
export function petFormToPayload(v: PetFormValues, u: Units): Partial<Pet> {
  return {
    name: v.name,
    species: v.species,
    sex: v.sex,
    breed: v.breed || null,
    dateOfBirth: v.dateOfBirth || null,
    idealWeightMinKg: v.idealWeightMinKg ? u.toKg(Number(v.idealWeightMinKg)) : null,
    idealWeightMaxKg: v.idealWeightMaxKg ? u.toKg(Number(v.idealWeightMaxKg)) : null,
    vetDailyEnergyKcal: v.vetDailyEnergyKcal ? Number(v.vetDailyEnergyKcal) : null,
    notes: v.notes || null,
  };
}

export default function PetForm({
  pet,
  onSubmit,
  submitting,
  error,
}: {
  pet?: Pet | null;
  onSubmit: (values: PetFormValues) => void;
  submitting: boolean;
  error: string;
}) {
  const u = useUnits();
  const [v, setV] = useState<PetFormValues>(() => toForm(pet, u));
  const set = (k: keyof PetFormValues, val: string) => setV((prev) => ({ ...prev, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(v);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorBanner message={error} />
      
      <TextField 
        label="Name" 
        value={v.name} 
        onChange={(e) => set("name", e.target.value)} 
        required 
      />
      
      <div className="grid grid-cols-2 gap-3">
        <SelectField 
          label="Species" 
          value={v.species} 
          onChange={(e) => set("species", e.target.value)}
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="other">Other</option>
        </SelectField>
        
        <SelectField 
          label="Sex" 
          value={v.sex} 
          onChange={(e) => set("sex", e.target.value)}
        >
          <option value="unknown">Unknown</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </SelectField>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <TextField 
          label="Breed" 
          value={v.breed} 
          onChange={(e) => set("breed", e.target.value)} 
        />
        
        <TextField 
          type="date" 
          label="Date of birth" 
          value={v.dateOfBirth} 
          onChange={(e) => set("dateOfBirth", e.target.value)} 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <TextField
          type="number"
          step="0.1"
          min="0"
          label={`Ideal min (${u.weightUnit})`}
          value={v.idealWeightMinKg}
          onChange={(e) => set("idealWeightMinKg", e.target.value)}
        />

        <TextField
          type="number"
          step="0.1"
          min="0"
          label={`Ideal max (${u.weightUnit})`}
          value={v.idealWeightMaxKg}
          onChange={(e) => set("idealWeightMaxKg", e.target.value)}
        />
        
        <TextField 
          type="number" 
          step="1" 
          min="0" 
          label="Daily kcal" 
          value={v.vetDailyEnergyKcal} 
          onChange={(e) => set("vetDailyEnergyKcal", e.target.value)} 
        />
      </div>
      
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={2}
          value={v.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>
      
      <Button type="submit" loading={submitting} fullWidth>
        {pet ? "Save changes" : "Add buddy"}
      </Button>
    </form>
  );
}

