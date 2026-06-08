import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  dietApi,
  eventsApi,
  foodsApi,
  mealsApi,
  petsApi,
  weightsApi,
} from "../api/endpoints";
import { apiError, api } from "../api/client";
import type {
  DailySummary,
  Food,
  HealthEvent,
  MealLog,
  Pet,
  WeightLog,
  WeightTrend,
} from "../api/types";
import { ErrorBanner, Modal, Spinner, speciesIcon } from "../components/ui";
import WeightChart from "../components/WeightChart";
import DietTab from "../components/DietTab";
import PetForm, { petFormToPayload, type PetFormValues } from "../components/PetForm";
import {
  EventForm,
  MealForm,
  WeightForm,
  type EventFormValues,
  type MealFormValues,
  type WeightFormValues,
} from "../components/LogForms";
import { ageFromDob, formatDateTime, num, todayStr } from "../utils/format";

type Tab = "overview" | "diet" | "meals" | "weights" | "health";
type LogModal = null | "meal" | "weight" | "event" | "editPet";

const eventLabels: Record<string, string> = {
  vet_visit: "🩺 Vet visit",
  symptom: "🤒 Symptom",
  medication: "💊 Medication",
  lab_result: "🧪 Lab result",
  other: "📝 Note",
};

export default function PetDashboardPage() {
  const { petId = "" } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [trend, setTrend] = useState<WeightTrend | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [petFoods, setPetFoods] = useState<Food[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [modal, setModal] = useState<LogModal>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [computedHint, setComputedHint] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [petData, weightData, summaryData, mealData, eventData, profiles, allFoods] =
        await Promise.all([
          petsApi.get(petId),
          weightsApi.list(petId),
          mealsApi.dailySummary(petId, todayStr()),
          mealsApi.list(petId, { limit: 25 }),
          eventsApi.list(petId),
          dietApi.list(petId),
          foodsApi.list(),
        ]);
      setPet(petData);
      setWeights(weightData.weights);
      setTrend(weightData.trend30d);
      setSummary(summaryData);
      setMeals(mealData.meals);
      setEvents(eventData);
      // The pet's diet foods first, then any remaining foods from the full list.
      const dietFoods = profiles.map((p) => p.food);
      const dietIds = new Set(dietFoods.map((f) => f.id));
      setPetFoods([...dietFoods, ...allFoods.filter((f) => !dietIds.has(f.id))]);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = () => {
    setModal(null);
    setFormError("");
    setComputedHint("");
  };

  const logMeal = async (v: MealFormValues) => {
    setSubmitting(true);
    setFormError("");
    try {
      const meal = await mealsApi.create(petId, {
        foodId: v.foodId,
        loggedAt: v.loggedAt ? new Date(v.loggedAt).toISOString() : undefined,
        amountGrams: v.amountGrams ? Number(v.amountGrams) : null,
        amountServings: v.amountServings ? Number(v.amountServings) : null,
        notes: v.notes || null,
      });
      setComputedHint(
        meal.computedKcal != null
          ? `Logged ${num(meal.computedKcal, 1)} kcal 🎉`
          : "Logged! (no energy data for this food yet)"
      );
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const logWeight = async (v: WeightFormValues) => {
    setSubmitting(true);
    setFormError("");
    try {
      await weightsApi.create(petId, {
        weightKg: Number(v.weightKg),
        weighedAt: v.weighedAt ? new Date(v.weighedAt).toISOString() : undefined,
        bodyConditionScore: v.bodyConditionScore ? Number(v.bodyConditionScore) : null,
        notes: v.notes || null,
      });
      closeModal();
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const logEvent = async (v: EventFormValues) => {
    setSubmitting(true);
    setFormError("");
    try {
      await eventsApi.create(petId, {
        type: v.type,
        title: v.title,
        eventAt: v.eventAt ? new Date(v.eventAt).toISOString() : undefined,
        description: v.description || null,
      });
      closeModal();
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const editPet = async (v: PetFormValues) => {
    setSubmitting(true);
    setFormError("");
    try {
      await petsApi.update(petId, petFormToPayload(v));
      closeModal();
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deletePet = async () => {
    if (!confirm("Delete this pet and all their logs? This can't be undone.")) return;
    await petsApi.remove(petId);
    navigate("/");
  };

  const downloadCsv = (kind: "weights" | "meals") => {
    api
      .get(`/pets/${petId}/export/${kind}.csv`, { responseType: "blob" })
      .then((res) => {
        const url = URL.createObjectURL(res.data as Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pet?.name ?? "pet"}-${kind}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => setError(apiError(err)));
  };

  if (loading) return <Spinner label="Fetching the cuddles..." />;
  if (error && !pet) return <ErrorBanner message={error} />;
  if (!pet) return null;

  const remaining = summary?.remainingKcal ?? null;
  let trackMsg = "Log a nibble to start today's tally.";
  let trackTone = "bg-sand/60 text-cocoa";
  if (summary && summary.targetKcal != null && remaining != null) {
    if (remaining > summary.targetKcal * 0.15) {
      trackMsg = `A few more nibbles to go — ${num(remaining)} kcal left.`;
      trackTone = "bg-teal-soft/20 text-teal-deep";
    } else if (remaining >= -summary.targetKcal * 0.05) {
      trackMsg = "They're right on track! 🎯";
      trackTone = "bg-teal-soft/30 text-teal-deep";
    } else {
      trackMsg = `A little over today (${num(Math.abs(remaining))} kcal past target).`;
      trackTone = "bg-blush/70 text-cocoa";
    }
  } else if (summary && summary.totalKcal > 0) {
    trackMsg = `${num(summary.totalKcal)} kcal logged today. Set a daily target to track progress.`;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "diet", label: "Diet" },
    { id: "meals", label: "Nibbles" },
    { id: "weights", label: "Weigh-ins" },
    { id: "health", label: "Health" },
  ];

  return (
    <div className="space-y-5">
      <Link to="/" className="text-sm font-semibold text-teal-deep hover:underline">
        ← Back to all pets
      </Link>

      {/* Header */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{speciesIcon(pet.species)}</span>
          <div>
            <h1 className="text-2xl font-extrabold text-cocoa">{pet.name}</h1>
            <p className="capitalize text-cocoa/60">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
              {ageFromDob(pet.dateOfBirth) ? ` · ${ageFromDob(pet.dateOfBirth)}` : ""}
              {pet.sex !== "unknown" ? ` · ${pet.sex}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setModal("editPet")}>
            Edit
          </button>
          <button className="btn-ghost text-red-400 hover:bg-blush/40" onClick={deletePet}>
            Delete
          </button>
        </div>
      </div>

      {/* Quick log buttons */}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => setModal("meal")}>
          🍖 Log a nibble
        </button>
        <button className="btn-secondary" onClick={() => setModal("weight")}>
          ⚖️ Log a weigh-in
        </button>
        <button className="btn-secondary" onClick={() => setModal("event")}>
          📝 Log a health note
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-sand">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-bold transition ${
              tab === t.id
                ? "border-b-2 border-teal-deep text-teal-deep"
                : "text-cocoa/50 hover:text-cocoa"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-extrabold text-cocoa">Weight trend</h2>
              {trend && (
                <span className="chip bg-sand text-cocoa/70">
                  {trend.changeKg >= 0 ? "▲" : "▼"} {num(Math.abs(trend.changeKg), 2)} kg / {trend.days}d
                </span>
              )}
            </div>
            <WeightChart pet={pet} weights={weights} />
          </div>

          <div className="card">
            <h2 className="font-extrabold text-cocoa">Today's Nibbles</h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-cocoa/60">Calories</span>
                <span className="text-2xl font-extrabold text-teal-deep">
                  {num(summary?.totalKcal)}
                  {summary?.targetKcal != null && (
                    <span className="text-base font-semibold text-cocoa/40">
                      {" "}
                      / {num(summary.targetKcal)}
                    </span>
                  )}
                </span>
              </div>
              {summary?.targetKcal != null && (
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-teal-soft transition-all"
                    style={{
                      width: `${Math.min(100, (summary.totalKcal / summary.targetKcal) * 100)}%`,
                    }}
                  />
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-cocoa/60">Grams</span>
                <span className="font-bold">{num(summary?.totalGrams, 1)} g</span>
              </div>
            </div>
            <p className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold ${trackTone}`}>{trackMsg}</p>
            {summary && summary.breakdown.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {summary.breakdown.map((b) => (
                  <li key={b.foodId} className="flex justify-between text-cocoa/70">
                    <span>{b.foodName}</span>
                    <span className="font-semibold">{num(b.kcal)} kcal</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card lg:col-span-3">
            <h2 className="mb-3 font-extrabold text-cocoa">Recent health notes</h2>
            {events.length === 0 ? (
              <p className="text-sm text-cocoa/50">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {events.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-xl bg-sand/40 px-3 py-2">
                    <div>
                      <span className="font-semibold text-cocoa">{eventLabels[e.type] ?? e.type}</span>
                      <span className="ml-2 text-cocoa/70">{e.title}</span>
                    </div>
                    <span className="text-xs text-cocoa/50">{formatDateTime(e.eventAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "diet" && <DietTab petId={petId} />}

      {tab === "meals" && (
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-cocoa">Nibble history</h2>
            <button className="btn-ghost text-sm" onClick={() => downloadCsv("meals")}>
              ⬇ Export CSV
            </button>
          </div>
          {meals.length === 0 ? (
            <p className="text-sm text-cocoa/50">No nibbles logged yet.</p>
          ) : (
            <ul className="divide-y divide-sand">
              {meals.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-semibold text-cocoa">{m.food.name}</p>
                    <p className="text-xs text-cocoa/50">
                      {formatDateTime(m.loggedAt)} ·{" "}
                      {m.amountGrams ? `${num(m.amountGrams, 1)} g` : `${num(m.amountServings, 1)} servings`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-teal-deep">{num(m.computedKcal, 1)} kcal</span>
                    <button
                      onClick={async () => {
                        await mealsApi.remove(m.id);
                        await load();
                      }}
                      className="text-cocoa/40 hover:text-red-500"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "weights" && (
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-cocoa">Weigh-in history</h2>
            <button className="btn-ghost text-sm" onClick={() => downloadCsv("weights")}>
              ⬇ Export CSV
            </button>
          </div>
          {weights.length === 0 ? (
            <p className="text-sm text-cocoa/50">No weigh-ins yet.</p>
          ) : (
            <ul className="divide-y divide-sand">
              {[...weights].reverse().map((w) => (
                <li key={w.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-semibold text-cocoa">{num(w.weightKg, 2)} kg</p>
                    <p className="text-xs text-cocoa/50">
                      {formatDateTime(w.weighedAt)}
                      {w.bodyConditionScore ? ` · BCS ${w.bodyConditionScore}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await weightsApi.remove(w.id);
                      await load();
                    }}
                    className="text-cocoa/40 hover:text-red-500"
                    title="Delete"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "health" && (
        <div className="card">
          <h2 className="mb-3 font-extrabold text-cocoa">Health timeline</h2>
          {events.length === 0 ? (
            <p className="text-sm text-cocoa/50">No health notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="rounded-xl bg-sand/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cocoa">{eventLabels[e.type] ?? e.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cocoa/50">{formatDateTime(e.eventAt)}</span>
                      <button
                        onClick={async () => {
                          await eventsApi.remove(e.id);
                          await load();
                        }}
                        className="text-cocoa/40 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-cocoa">{e.title}</p>
                  {e.description && <p className="text-sm text-cocoa/70">{e.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === "meal"} onClose={closeModal} title="Log a nibble">
        <MealForm foods={petFoods} onSubmit={logMeal} submitting={submitting} error={formError} />
        {computedHint && (
          <p className="mt-3 rounded-xl bg-teal-soft/20 px-3 py-2 text-sm font-semibold text-teal-deep">
            {computedHint} Today's total: {num(summary?.totalKcal)} kcal.
          </p>
        )}
      </Modal>
      <Modal open={modal === "weight"} onClose={closeModal} title="Log a weigh-in">
        <WeightForm onSubmit={logWeight} submitting={submitting} error={formError} />
      </Modal>
      <Modal open={modal === "event"} onClose={closeModal} title="Log a health note">
        <EventForm onSubmit={logEvent} submitting={submitting} error={formError} />
      </Modal>
      <Modal open={modal === "editPet"} onClose={closeModal} title={`Edit ${pet.name}`}>
        <PetForm pet={pet} onSubmit={editPet} submitting={submitting} error={formError} />
      </Modal>
    </div>
  );
}
