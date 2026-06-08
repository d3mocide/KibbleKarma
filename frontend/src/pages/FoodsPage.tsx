import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { foodsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Food } from "../api/types";
import { EmptyState, ErrorBanner, Modal, Spinner, Button, Chip, TextField, SelectField } from "../components/ui";
import BarcodeScanner from "../components/BarcodeScanner";
import { num } from "../utils/format";
import { Plus, ScanBarcode, Search } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">Foods &amp; treats</h1>
          <p className="text-charcoal-500">Everything your buddies eat.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => setModal("manual")} className="flex items-center justify-center gap-1.5 w-full sm:w-auto">
            <Plus className="h-4.5 w-4.5" />
            <span>Add food manually</span>
          </Button>
          <Button onClick={() => setModal("barcode")} className="flex items-center justify-center gap-1.5 w-full sm:w-auto">
            <ScanBarcode className="h-4.5 w-4.5" />
            <span>Add by barcode</span>
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex gap-2"
      >
        <TextField
          placeholder="Search by name, brand, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary" className="flex items-center gap-1.5 flex-shrink-0">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </Button>
      </form>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : foods.length === 0 ? (
        <EmptyState title="No foods yet" hint="Add a food manually or scan a barcode to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((f) => (
            <Link key={f.id} to={`/foods/${f.id}`} className="card hover:shadow-cozy-lg transition duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-charcoal-900 leading-tight">{f.name}</h3>
                  {f.brand && <p className="text-sm text-text-muted mt-0.5">{f.brand}</p>}
                </div>
                <Chip tone={f.source === "open_food_facts" ? "butter" : "sage"}>
                  {f.source === "open_food_facts" ? "OFF" : "Manual"}
                </Chip>
              </div>
              <p className="mt-3 text-sm text-charcoal-700">
                {f.energyKcalPer100g != null ? `${num(f.energyKcalPer100g)} kcal / 100g` : "No energy data"}
              </p>
              {f.barcode && <p className="text-xs text-text-faint mt-1">#{f.barcode}</p>}
            </Link>
          ))}
        </div>
      )}

      <ManualFoodModal open={modal === "manual"} onClose={() => setModal(null)} onCreated={() => { setModal(null); load(""); }} />
      <BarcodeModal open={modal === "barcode"} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(""); }} />
    </div>
  );
}

// Manual food modal
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
            placeholder="e.g. dry_dog_food" 
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

        <Button type="submit" loading={busy} fullWidth>
          Save food
        </Button>
      </form>
    </Modal>
  );
}

// Barcode modal
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
        <p className="text-sm text-text-muted">
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
          <TextField
            placeholder="e.g. 3033710065967"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <Button type="submit" loading={busy} className="flex-shrink-0">
            Look up
          </Button>
        </form>

        <ErrorBanner message={error} />

        {result && (
          <div className="card bg-oat-200/40 border-0 p-4">
            <h3 className="font-extrabold text-charcoal-900 leading-tight">{result.name}</h3>
            {result.brand && <p className="text-sm text-text-muted mt-0.5">{result.brand}</p>}
            <p className="mt-3 text-sm text-charcoal-700">
              {result.energyKcalPer100g != null
                ? `${num(result.energyKcalPer100g)} kcal / 100g`
                : "No energy data found — you can edit it after saving."}
            </p>
            <div className="mt-4 flex gap-2">
              <Link to={`/foods/${result.id}`} className="btn-primary" onClick={onSaved}>
                View food
              </Link>
              <Button variant="secondary" onClick={() => { setResult(null); setBarcode(""); }}>
                Scan another
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

