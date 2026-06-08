import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { foodsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Food } from "../api/types";
import { ErrorBanner, Spinner } from "../components/ui";
import { num } from "../utils/format";

export default function FoodDetailPage() {
  const { foodId = "" } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    energyKcalPer100g: "",
    energyKcalPerServing: "",
    servingSizeG: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const f = await foodsApi.get(foodId);
      setFood(f);
      setForm({
        name: f.name,
        brand: f.brand ?? "",
        category: f.category ?? "",
        energyKcalPer100g: f.energyKcalPer100g != null ? String(f.energyKcalPer100g) : "",
        energyKcalPerServing: f.energyKcalPerServing != null ? String(f.energyKcalPerServing) : "",
        servingSizeG: f.servingSizeG != null ? String(f.servingSizeG) : "",
      });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodId]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await foodsApi.update(foodId, {
        name: form.name,
        brand: form.brand || null,
        category: form.category || null,
        energyKcalPer100g: form.energyKcalPer100g ? Number(form.energyKcalPer100g) : null,
        energyKcalPerServing: form.energyKcalPerServing ? Number(form.energyKcalPerServing) : null,
        servingSizeG: form.servingSizeG ? Number(form.servingSizeG) : null,
      });
      setEditing(false);
      await load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this food?")) return;
    try {
      await foodsApi.remove(foodId);
      navigate("/foods");
    } catch (err) {
      setError(apiError(err));
    }
  };

  if (loading) return <Spinner />;
  if (!food) return <ErrorBanner message={error || "Food not found"} />;

  const readOnly = food.source === "open_food_facts";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/foods" className="text-sm font-semibold text-teal-deep hover:underline">
        ← Back to foods
      </Link>

      <ErrorBanner message={error} />

      {editing && !readOnly ? (
        <form onSubmit={save} className="card space-y-4">
          <h1 className="text-xl font-extrabold text-cocoa">Edit food</h1>
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Brand</label>
              <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">kcal / 100g</label>
              <input type="number" min="0" className="input" value={form.energyKcalPer100g} onChange={(e) => setForm({ ...form, energyKcalPer100g: e.target.value })} />
            </div>
            <div>
              <label className="label">kcal / serving</label>
              <input type="number" min="0" className="input" value={form.energyKcalPerServing} onChange={(e) => setForm({ ...form, energyKcalPerServing: e.target.value })} />
            </div>
            <div>
              <label className="label">Serving (g)</label>
              <input type="number" min="0" className="input" value={form.servingSizeG} onChange={(e) => setForm({ ...form, servingSizeG: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="card space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-cocoa">{food.name}</h1>
              {food.brand && <p className="text-cocoa/60">{food.brand}</p>}
            </div>
            <span
              className={`chip ${
                readOnly ? "bg-blush/70 text-cocoa" : "bg-teal-soft/30 text-teal-deep"
              }`}
            >
              {readOnly ? "Open Food Facts" : "Manual"}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Category" value={food.category} />
            <Field label="Barcode" value={food.barcode} />
            <Field label="kcal / 100g" value={food.energyKcalPer100g != null ? num(food.energyKcalPer100g) : null} />
            <Field label="kcal / kg" value={food.energyKcalPerKg != null ? num(food.energyKcalPerKg) : null} />
            <Field label="kcal / serving" value={food.energyKcalPerServing != null ? num(food.energyKcalPerServing) : null} />
            <Field label="Serving size" value={food.servingSizeG != null ? `${num(food.servingSizeG)} g` : null} />
          </dl>

          {readOnly && (
            <p className="rounded-xl bg-sand/60 px-3 py-2 text-sm text-cocoa/70">
              This food comes from Open Food Facts and is read-only.
              {food.offProductUrl && (
                <>
                  {" "}
                  <a href={food.offProductUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-deep hover:underline">
                    View on Open Food Facts ↗
                  </a>
                </>
              )}
            </p>
          )}

          {!readOnly && (
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn-ghost text-red-400 hover:bg-blush/40" onClick={remove}>
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-cocoa/50">{label}</dt>
      <dd className="font-semibold text-cocoa">{value ?? "—"}</dd>
    </div>
  );
}
