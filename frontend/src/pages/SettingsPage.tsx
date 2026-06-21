import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import type { UnitSystem } from "../api/types";
import { ErrorBanner } from "../components/ui";

const OPTIONS: { value: UnitSystem; label: string; hint: string }[] = [
  { value: "imperial", label: "Imperial", hint: "Pounds (lb) and ounces (oz)" },
  { value: "metric", label: "Metric", hint: "Kilograms (kg) and grams (g)" },
];

export default function SettingsPage() {
  const { user, setUnitSystem } = useAuth();
  const [busy, setBusy] = useState<UnitSystem | null>(null);
  const [error, setError] = useState("");

  const current = user?.unitSystem ?? "imperial";

  const choose = async (value: UnitSystem) => {
    if (value === current) return;
    setBusy(value);
    setError("");
    try {
      await setUnitSystem(value);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">Settings</h1>
        <p className="text-charcoal-500">Tweak how KibbleKarma works for you.</p>
      </div>

      <ErrorBanner message={error} />

      <div className="card space-y-4">
        <div>
          <h2 className="font-extrabold text-charcoal-900">Units</h2>
          <p className="text-sm text-text-muted">
            Choose how weights and food amounts are shown. Energy is always in kcal.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const active = current === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => choose(opt.value)}
                disabled={busy !== null}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition disabled:opacity-60 ${
                  active
                    ? "border-primary bg-terracotta-50"
                    : "border-oat-300 hover:border-primary/50 hover:bg-oat-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-charcoal-900">{opt.label}</span>
                  {active && <span className="text-xs font-bold text-primary">Selected</span>}
                </div>
                <p className="text-sm text-text-muted mt-0.5">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="font-extrabold text-charcoal-900">Account</h2>
        <p className="text-sm text-text-muted mt-1">
          Signed in as <span className="font-bold text-charcoal-700">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}
