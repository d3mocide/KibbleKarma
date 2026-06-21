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
import { ErrorBanner, Modal, Spinner, Avatar, Button, Chip, StatMeter } from "../components/ui";
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
import { useUnits } from "../hooks/useUnits";
import { 
  ArrowLeft, 
  Bone, 
  Scale, 
  NotebookPen, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Trash2,
  Stethoscope,
  Thermometer,
  Pill,
  FlaskConical
} from "lucide-react";

type Tab = "overview" | "diet" | "meals" | "weights" | "health";
type LogModal = null | "meal" | "weight" | "event" | "editPet";

const eventText: Record<string, string> = {
  vet_visit: "Vet visit",
  symptom: "Symptom",
  medication: "Medication",
  lab_result: "Lab result",
  other: "Note",
};

export function HealthEventIcon({ type, className = "h-4.5 w-4.5" }: { type: string; className?: string }) {
  switch (type) {
    case "vet_visit":
      return <Stethoscope className={className} />;
    case "symptom":
      return <Thermometer className={className} />;
    case "medication":
      return <Pill className={className} />;
    case "lab_result":
      return <FlaskConical className={className} />;
    default:
      return <NotebookPen className={className} />;
  }
}

export default function PetDashboardPage() {
  const { petId = "" } = useParams();
  const navigate = useNavigate();
  const u = useUnits();

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
        amountGrams: v.amountGrams ? u.toG(Number(v.amountGrams)) : null,
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
        weightKg: u.toKg(Number(v.weightKg)),
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
      await petsApi.update(petId, petFormToPayload(v, u));
      closeModal();
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deletePet = async () => {
    if (!confirm("Delete this buddy and all their logs? This can't be undone.")) return;
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
        a.download = `${pet?.name ?? "buddy"}-${kind}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => setError(apiError(err)));
  };

  if (loading) return <Spinner label="Fetching the cuddles..." />;
  if (error && !pet) return <ErrorBanner message={error} />;
  if (!pet) return null;

  const remaining = summary?.remainingKcal ?? null;
  let trackMsg = "Log a meal to start today's tally.";
  let trackTone = "bg-oat-200 text-charcoal-700";
  if (summary && summary.targetKcal != null && remaining != null) {
    if (remaining > summary.targetKcal * 0.15) {
      trackMsg = `A few more meals to go — ${num(remaining)} kcal left.`;
      trackTone = "bg-butter-100 text-butter-600";
    } else if (remaining >= -summary.targetKcal * 0.05) {
      trackMsg = "They're right on track! 🎉";
      trackTone = "bg-sage-100 text-sage-700";
    } else {
      trackMsg = `A little over today (${num(Math.abs(remaining))} kcal past target).`;
      trackTone = "bg-terracotta-50 text-alert";
    }
  } else if (summary && summary.totalKcal > 0) {
    trackMsg = `${num(summary.totalKcal)} kcal logged today. Set a daily target to track progress.`;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "diet", label: "Diet" },
    { id: "meals", label: "Meals" },
    { id: "weights", label: "Weigh-ins" },
    { id: "health", label: "Health" },
  ];

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover transition">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to all buddies</span>
      </Link>

      {/* Header */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar 
            species={pet.species} 
            tone={pet.species === "dog" ? "terracotta" : pet.species === "cat" ? "sage" : "butter"} 
            size={56} 
            className="flex-shrink-0" 
          />
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">{pet.name}</h1>
            <p className="capitalize text-charcoal-500">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
              {ageFromDob(pet.dateOfBirth) ? ` · ${ageFromDob(pet.dateOfBirth)}` : ""}
              {pet.sex !== "unknown" ? ` · ${pet.sex}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModal("editPet")}>
            Edit
          </Button>
          <Button variant="ghost" className="text-alert hover:bg-terracotta-50" onClick={deletePet}>
            Delete
          </Button>
        </div>
      </div>

      {/* Quick log buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button onClick={() => setModal("meal")} className="flex items-center justify-center gap-1.5 w-full">
          <Bone className="h-4.5 w-4.5" />
          <span>Log a meal</span>
        </Button>
        <Button variant="secondary" onClick={() => setModal("weight")} className="flex items-center justify-center gap-1.5 w-full">
          <Scale className="h-4.5 w-4.5" />
          <span>Log a weigh-in</span>
        </Button>
        <Button variant="secondary" onClick={() => setModal("event")} className="flex items-center justify-center gap-1.5 w-full">
          <NotebookPen className="h-4.5 w-4.5" />
          <span>Log a health note</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-oat-300 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all duration-200 border-b-2 -mb-[2px] ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-charcoal-900"
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
              <h2 className="font-extrabold text-charcoal-900">Weight trend</h2>
              {trend && (
                <Chip tone="neutral" className="flex items-center gap-1">
                  {trend.changeKg >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-sage-600" /> : <TrendingDown className="h-3.5 w-3.5 text-terracotta-500" />}
                  <span>{u.weight(Math.abs(trend.changeKg), 2)} / {trend.days}d</span>
                </Chip>
              )}
            </div>
            <WeightChart pet={pet} weights={weights} />
          </div>

          <div className="card">
            <h2 className="font-extrabold text-charcoal-900">Today's meals</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-text-muted">Calories</span>
                <span className="text-2xl font-extrabold text-primary">
                  {num(summary?.totalKcal)}
                  {summary?.targetKcal != null && (
                    <span className="text-base font-semibold text-text-faint">
                      {" "}
                      / {num(summary.targetKcal)}
                    </span>
                  )}
                </span>
              </div>
              
              <StatMeter value={summary?.totalKcal ?? 0} max={summary?.targetKcal ?? null} />

              <div className="flex items-baseline justify-between">
                <span className="text-text-muted">Amount</span>
                <span className="font-bold text-charcoal-900">{u.mass(summary?.totalGrams, 1)}</span>
              </div>
            </div>
            <p className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${trackTone}`}>{trackMsg}</p>
            {summary && summary.breakdown.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {summary.breakdown.map((b) => (
                  <li key={b.foodId} className="flex justify-between text-charcoal-700">
                    <span>{b.foodName}</span>
                    <span className="font-bold">{num(b.kcal)} kcal</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card lg:col-span-3">
            <h2 className="mb-3 font-extrabold text-charcoal-900">Recent health notes</h2>
            {events.length === 0 ? (
              <p className="text-sm text-text-muted">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {events.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-md bg-oat-200/50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2.5">
                      <HealthEventIcon type={e.type} className="h-4.5 w-4.5 text-sage-600" />
                      <span className="font-bold text-charcoal-900">{eventText[e.type] ?? e.type}</span>
                      <span className="text-text-muted">{e.title}</span>
                    </div>
                    <span className="text-xs text-text-faint">{formatDateTime(e.eventAt)}</span>
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
            <h2 className="font-extrabold text-charcoal-900">Meal history</h2>
            <Button variant="ghost" size="sm" onClick={() => downloadCsv("meals")} className="flex items-center gap-1.5 text-xs">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
          {meals.length === 0 ? (
            <p className="text-sm text-text-muted">No meals logged yet.</p>
          ) : (
            <ul className="divide-y divide-oat-300">
              {meals.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-bold text-charcoal-900">{m.food.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatDateTime(m.loggedAt)} ·{" "}
                      {m.amountGrams ? u.mass(m.amountGrams, 1) : `${num(m.amountServings, 1)} servings`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary">{num(m.computedKcal, 1)} kcal</span>
                    <button
                      onClick={async () => {
                        await mealsApi.remove(m.id);
                        await load();
                      }}
                      className="text-text-faint hover:text-alert transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
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
            <h2 className="font-extrabold text-charcoal-900">Weigh-in history</h2>
            <Button variant="ghost" size="sm" onClick={() => downloadCsv("weights")} className="flex items-center gap-1.5 text-xs">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
          {weights.length === 0 ? (
            <p className="text-sm text-text-muted">No weigh-ins yet.</p>
          ) : (
            <ul className="divide-y divide-oat-300">
              {[...weights].reverse().map((w) => (
                <li key={w.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-bold text-charcoal-900">{u.weight(w.weightKg, 2)}</p>
                    <p className="text-xs text-text-muted">
                      {formatDateTime(w.weighedAt)}
                      {w.bodyConditionScore ? ` · BCS ${w.bodyConditionScore}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await weightsApi.remove(w.id);
                      await load();
                    }}
                    className="text-text-faint hover:text-alert transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "health" && (
        <div className="card">
          <h2 className="mb-3 font-extrabold text-charcoal-900">Health timeline</h2>
          {events.length === 0 ? (
            <p className="text-sm text-text-muted">No health notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="rounded-md bg-oat-200/50 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-charcoal-900">
                      <HealthEventIcon type={e.type} className="h-4.5 w-4.5 text-sage-600" />
                      <span>{eventText[e.type] ?? e.type}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-faint">{formatDateTime(e.eventAt)}</span>
                      <button
                        onClick={async () => {
                          await eventsApi.remove(e.id);
                          await load();
                        }}
                        className="text-text-faint hover:text-alert transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-charcoal-900">{e.title}</p>
                  {e.description && <p className="mt-1 text-sm text-text-muted leading-relaxed">{e.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === "meal"} onClose={closeModal} title="Log a meal">
        <MealForm foods={petFoods} onSubmit={logMeal} submitting={submitting} error={formError} />
        {computedHint && (
          <p className="mt-3 rounded-md bg-sage-100 px-3 py-2 text-sm font-semibold text-sage-700">
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

