import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { foodsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Food } from "../api/types";
import { ErrorBanner, Spinner, Button, Chip, TextField } from "../components/ui";
import { num } from "../utils/format";
import { ArrowLeft } from "lucide-react";

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
      <Link to="/foods" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover transition">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to foods</span>
      </Link>

      <ErrorBanner message={error} />

      {editing && !readOnly ? (
        <form onSubmit={save} className="card space-y-4">
          <h1 className="text-xl font-extrabold text-charcoal-900 tracking-tight">Edit food</h1>
          
          <TextField 
            label="Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
          />
          
          <div className="grid grid-cols-2 gap-3">
            <TextField 
              label="Brand" 
              value={form.brand} 
              onChange={(e) => setForm({ ...form, brand: e.target.value })} 
            />
            <TextField 
              label="Category" 
              value={form.category} 
              onChange={(e) => setForm({ ...form, category: e.target.value })} 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <TextField 
              type="number" 
              min="0" 
              label="kcal / 100g" 
              value={form.energyKcalPer100g} 
              onChange={(e) => setForm({ ...form, energyKcalPer100g: e.target.value })} 
            />
            <TextField 
              type="number" 
              min="0" 
              label="kcal / serving" 
              value={form.energyKcalPerServing} 
              onChange={(e) => setForm({ ...form, energyKcalPerServing: e.target.value })} 
            />
            <TextField 
              type="number" 
              min="0" 
              label="Serving (g)" 
              value={form.servingSizeG} 
              onChange={(e) => setForm({ ...form, servingSizeG: e.target.value })} 
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={busy}>
              Save changes
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="card space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-charcoal-900 leading-tight">{food.name}</h1>
              {food.brand && <p className="text-sm text-text-muted mt-0.5">{food.brand}</p>}
            </div>
            <Chip tone={readOnly ? "butter" : "sage"}>
              {readOnly ? "Open Food Facts" : "Manual"}
            </Chip>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm border-t border-oat-300 pt-4">
            <Field label="Category" value={food.category} />
            <Field label="Barcode" value={food.barcode} />
            <Field label="kcal / 100g" value={food.energyKcalPer100g != null ? num(food.energyKcalPer100g) : null} />
            <Field label="kcal / kg" value={food.energyKcalPerKg != null ? num(food.energyKcalPerKg) : null} />
            <Field label="kcal / serving" value={food.energyKcalPerServing != null ? num(food.energyKcalPerServing) : null} />
            <Field label="Serving size" value={food.servingSizeG != null ? `${num(food.servingSizeG)} g` : null} />
          </dl>

          {readOnly && (
            <div className="rounded-md bg-oat-200/60 px-4 py-3 text-sm text-charcoal-700 leading-relaxed">
              <span>This food comes from Open Food Facts and is read-only.</span>
              {food.offProductUrl && (
                <div className="mt-1.5">
                  <a href={food.offProductUrl} target="_blank" rel="noreferrer" className="font-bold text-primary hover:text-primary-hover transition">
                    View on Open Food Facts ↗
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-oat-300">
            {!readOnly && (
              <Button onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            <Button variant="ghost" className="text-alert hover:bg-terracotta-50" onClick={remove}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-text-faint text-xs font-bold uppercase tracking-wider mb-0.5">{label}</dt>
      <dd className="font-bold text-charcoal-700">{value ?? "—"}</dd>
    </div>
  );
}

