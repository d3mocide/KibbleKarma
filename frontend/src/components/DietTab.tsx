import { useEffect, useState, type FormEvent } from "react";
import { dietApi, foodsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Food, PetFoodProfile } from "../api/types";
import { EmptyState, ErrorBanner, Modal, Spinner } from "./ui";
import { num } from "../utils/format";

export default function DietTab({ petId }: { petId: string }) {
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
        targetDailyGrams: form.targetDailyGrams ? Number(form.targetDailyGrams) : null,
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
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Add food for this pet
        </button>
      </div>

      {profiles.length === 0 ? (
        <EmptyState title="No diet set up yet" hint="Add foods this pet eats to plan their daily portions." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((p) => {
            const perMeal =
              p.targetDailyGrams && p.mealsPerDay ? p.targetDailyGrams / p.mealsPerDay : null;
            return (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-cocoa">{p.food.name}</h3>
                    {p.food.brand && <p className="text-sm text-cocoa/60">{p.food.brand}</p>}
                  </div>
                  {p.isPrimary && <span className="chip bg-teal-soft/30 text-teal-deep">Primary</span>}
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-cocoa/50">Daily kcal</dt>
                    <dd className="font-bold">{num(p.targetDailyKcal)}</dd>
                  </div>
                  <div>
                    <dt className="text-cocoa/50">Daily g</dt>
                    <dd className="font-bold">{num(p.targetDailyGrams)}</dd>
                  </div>
                  <div>
                    <dt className="text-cocoa/50">Meals/day</dt>
                    <dd className="font-bold">{num(p.mealsPerDay, 1)}</dd>
                  </div>
                </dl>
                {perMeal && (
                  <p className="mt-2 rounded-lg bg-sand/60 px-3 py-1.5 text-sm text-cocoa/80">
                    ≈ <b>{num(perMeal, 1)} g</b> per meal
                  </p>
                )}
                <button
                  onClick={() => remove(p.id)}
                  className="mt-3 text-xs font-semibold text-cocoa/50 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add food for this pet">
        <form onSubmit={submit} className="space-y-4">
          <ErrorBanner message={formError} />
          <div>
            <label className="label">Food</label>
            <select
              className="input"
              value={form.foodId}
              onChange={(e) => setForm({ ...form, foodId: e.target.value })}
              required
            >
              {foods.length === 0 && <option value="">No foods yet — add one on the Foods page</option>}
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                  {f.brand ? ` (${f.brand})` : ""}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-cocoa/80">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
            />
            This is their main diet (not a treat)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Daily kcal</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.targetDailyKcal}
                onChange={(e) => setForm({ ...form, targetDailyKcal: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Daily grams</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.targetDailyGrams}
                onChange={(e) => setForm({ ...form, targetDailyGrams: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Meals/day</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="input"
                value={form.mealsPerDay}
                onChange={(e) => setForm({ ...form, mealsPerDay: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button className="btn-primary w-full" disabled={submitting || foods.length === 0}>
            {submitting ? "Adding..." : "Add to diet"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
