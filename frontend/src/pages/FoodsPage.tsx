import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { foodsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Food } from "../api/types";
import { EmptyState, ErrorBanner, Modal, Spinner } from "../components/ui";
import BarcodeScanner from "../components/BarcodeScanner";
import { num } from "../utils/format";

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "manual" | "barcode">(null);

  const load = async (searchTerm = search) => {
    setLoading(true);
    try {
      setFoods(await foodsApi.list({ search: searchTerm || undefined }));
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-cocoa">Foods &amp; Treats</h1>
          <p className="text-cocoa/60">Everything your buddies nibble on.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setModal("manual")}>
            + Add food manually
          </button>
          <button className="btn-primary" onClick={() => setModal("barcode")}>
            📷 Add by barcode
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex gap-2"
      >
        <input
          className="input"
          placeholder="Search by name, brand, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary">Search</button>
      </form>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : foods.length === 0 ? (
        <EmptyState title="No foods yet" hint="Add a food manually or scan a barcode to get started." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((f) => (
            <Link key={f.id} to={`/foods/${f.id}`} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-cocoa">{f.name}</h3>
                  {f.brand && <p className="text-sm text-cocoa/60">{f.brand}</p>}
                </div>
                <span
                  className={`chip ${
                    f.source === "open_food_facts"
                      ? "bg-blush/70 text-cocoa"
                      : "bg-teal-soft/30 text-teal-deep"
                  }`}
                >
                  {f.source === "open_food_facts" ? "OFF" : "Manual"}
                </span>
              </div>
              <p className="mt-2 text-sm text-cocoa/70">
                {f.energyKcalPer100g != null ? `${num(f.energyKcalPer100g)} kcal / 100g` : "No energy data"}
              </p>
              {f.barcode && <p className="text-xs text-cocoa/40">#{f.barcode}</p>}
            </Link>
          ))}
        </div>
      )}

      <ManualFoodModal open={modal === "manual"} onClose={() => setModal(null)} onCreated={() => { setModal(null); load(""); }} />
      <BarcodeModal open={modal === "barcode"} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(""); }} />
    </div>
  );
}

function ManualFoodModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    energyKcalPer100g: "",
    energyKcalPerServing: "",
    servingSizeG: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await foodsApi.create({
        name: form.name,
        brand: form.brand || null,
        category: form.category || null,
        energyKcalPer100g: form.energyKcalPer100g ? Number(form.energyKcalPer100g) : null,
        energyKcalPerServing: form.energyKcalPerServing ? Number(form.energyKcalPerServing) : null,
        servingSizeG: form.servingSizeG ? Number(form.servingSizeG) : null,
      });
      setForm({ name: "", brand: "", category: "", energyKcalPer100g: "", energyKcalPerServing: "", servingSizeG: "" });
      onCreated();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add food manually">
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner message={error} />
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
            <input
              className="input"
              placeholder="e.g. dry_dog_food"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">kcal / 100g</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.energyKcalPer100g}
              onChange={(e) => setForm({ ...form, energyKcalPer100g: e.target.value })}
            />
          </div>
          <div>
            <label className="label">kcal / serving</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.energyKcalPerServing}
              onChange={(e) => setForm({ ...form, energyKcalPerServing: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Serving (g)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.servingSizeG}
              onChange={(e) => setForm({ ...form, servingSizeG: e.target.value })}
            />
          </div>
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Saving..." : "Save food"}
        </button>
      </form>
    </Modal>
  );
}

function BarcodeModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [barcode, setBarcode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Food | null>(null);

  const lookup = async (code?: string) => {
    const value = (code ?? barcode).trim();
    if (!value) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { food } = await foodsApi.lookupByBarcode(value);
      setResult(food);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setBarcode("");
    setResult(null);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Add by barcode">
      <div className="space-y-4">
        <p className="text-sm text-cocoa/60">
          Scan or type a product barcode and we'll fetch the details from Open Food Facts.
        </p>
        <BarcodeScanner
          onDetected={(code) => {
            setBarcode(code);
            lookup(code);
          }}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup();
          }}
          className="flex gap-2"
        >
          <input
            className="input"
            placeholder="e.g. 3033710065967"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <button className="btn-primary" disabled={busy}>
            {busy ? "Looking..." : "Look up"}
          </button>
        </form>

        <ErrorBanner message={error} />

        {result && (
          <div className="card bg-sand/40">
            <h3 className="font-extrabold text-cocoa">{result.name}</h3>
            {result.brand && <p className="text-sm text-cocoa/60">{result.brand}</p>}
            <p className="mt-2 text-sm">
              {result.energyKcalPer100g != null
                ? `${num(result.energyKcalPer100g)} kcal / 100g`
                : "No energy data found — you can edit it after saving."}
            </p>
            <div className="mt-3 flex gap-2">
              <Link to={`/foods/${result.id}`} className="btn-primary" onClick={onSaved}>
                View food
              </Link>
              <button className="btn-secondary" onClick={() => { setResult(null); setBarcode(""); }}>
                Scan another
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
