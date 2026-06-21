import { useEffect, useState, type FormEvent } from "react";
import { dietApi, foodsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Food, PetFoodProfile } from "../api/types";
import { EmptyState, ErrorBanner, Modal, Spinner, Button, Chip, TextField, SelectField } from "./ui";
import { num } from "../utils/format";
import { useUnits } from "../hooks/useUnits";
import { Plus, Trash2 } from "lucide-react";

export default function DietTab({ petId }: { petId: string }) {
  const u = useUnits();
  const [profiles, setProfiles] = useState<PetFoodProfile[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    foodId: "",
    isPrimary: false,
    targetDailyKcal: "",
    targetDailyGrams: "",
    mealsPerDay: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [p, f] = await Promise.all([dietApi.list(petId), foodsApi.list()]);
      setProfiles(p);
      setFoods(f);
      setForm((prev) => ({ ...prev, foodId: prev.foodId || f[0]?.id || "" }));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [petId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await dietApi.create(petId, {
        foodId: form.foodId,
        isPrimary: form.isPrimary,
        targetDailyKcal: form.targetDailyKcal ? Number(form.targetDailyKcal) : null,
        targetDailyGrams: form.targetDailyGrams ? u.toG(Number(form.targetDailyGrams)) : null,
        mealsPerDay: form.mealsPerDay ? Number(form.mealsPerDay) : null,
        notes: form.notes || null,
      });
      setOpen(false);
      setForm({ foodId: foods[0]?.id ?? "", isPrimary: false, targetDailyKcal: "", targetDailyGrams: "", mealsPerDay: "", notes: "" });
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this food from the pet's diet?")) return;
    await dietApi.remove(id);
    await load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <ErrorBanner message={error} />
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="flex items-center gap-1.5">
          <Plus className="h-4.5 w-4.5" />
          <span>Add food</span>
        </Button>
      </div>

      {profiles.length === 0 ? (
        <EmptyState title="No diet set up yet" hint="Add foods this pet eats to plan their daily portions." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => {
            const perMeal =
              p.targetDailyGrams && p.mealsPerDay ? p.targetDailyGrams / p.mealsPerDay : null;
            return (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-charcoal-900">{p.food.name}</h3>
                    {p.food.brand && <p className="text-sm text-text-muted">{p.food.brand}</p>}
                  </div>
                  {p.isPrimary && <Chip tone="sage">Primary</Chip>}
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-text-faint">Daily kcal</dt>
                    <dd className="font-bold text-charcoal-900">{num(p.targetDailyKcal)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-faint">Daily {u.massUnit}</dt>
                    <dd className="font-bold text-charcoal-900">
                      {p.targetDailyGrams != null ? num(u.fromG(p.targetDailyGrams), u.system === "imperial" ? 1 : 0) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-faint">Meals/day</dt>
                    <dd className="font-bold text-charcoal-900">{num(p.mealsPerDay, 1)}</dd>
                  </div>
                </dl>
                {perMeal && (
                  <p className="mt-3 rounded-md bg-oat-200/60 px-3 py-2 text-sm text-charcoal-700">
                    ≈ <b>{u.mass(perMeal, 1)}</b> per meal
                  </p>
                )}
                <div className="mt-4 flex justify-between items-center">
                  {p.notes ? <span className="text-xs italic text-text-muted">{p.notes}</span> : <span />}
                  <button
                    onClick={() => remove(p.id)}
                    className="text-text-faint hover:text-alert transition p-1"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add food">
        <form onSubmit={submit} className="space-y-4">
          <ErrorBanner message={formError} />
          
          <SelectField
            label="Food"
            value={form.foodId}
            onChange={(e) => setForm({ ...form, foodId: e.target.value })}
            required
          >
            {foods.length === 0 && <option value="">No foods yet — add one on the foods page</option>}
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.brand ? ` (${f.brand})` : ""}
              </option>
            ))}
          </SelectField>

          <label className="flex items-center gap-2 text-sm font-bold text-text-body cursor-pointer">
            <input
              type="checkbox"
              className="rounded-md border-border-input bg-surface-app text-primary focus:ring-primary/32"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
            />
            <span>This is their main diet (not a treat)</span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <TextField
              type="number"
              min="0"
              label="Daily kcal"
              value={form.targetDailyKcal}
              onChange={(e) => setForm({ ...form, targetDailyKcal: e.target.value })}
            />
            
            <TextField
              type="number"
              min="0"
              label={`Daily ${u.massUnit}`}
              value={form.targetDailyGrams}
              onChange={(e) => setForm({ ...form, targetDailyGrams: e.target.value })}
            />
            
            <TextField
              type="number"
              min="0"
              step="0.5"
              label="Meals/day"
              value={form.mealsPerDay}
              onChange={(e) => setForm({ ...form, mealsPerDay: e.target.value })}
            />
          </div>

          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. wet food in morning, dry at night"
          />

          <Button type="submit" loading={submitting} fullWidth disabled={foods.length === 0}>
            Add to diet
          </Button>
        </form>
      </Modal>
    </div>
  );
}

