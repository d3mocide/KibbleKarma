import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { petsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Pet } from "../api/types";
import { EmptyState, ErrorBanner, Modal, Spinner, Avatar, Button } from "../components/ui";
import PetForm, { petFormToPayload, type PetFormValues } from "../components/PetForm";
import { ageFromDob, num } from "../utils/format";
import { Plus } from "lucide-react";

export default function PetsListPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setPets(await petsApi.list());
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (values: PetFormValues) => {
    setSubmitting(true);
    setFormError("");
    try {
      await petsApi.create(petFormToPayload(values));
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">Your sleepy snackers</h1>
          <p className="text-charcoal-500">Everyone you're keeping happy and healthy.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-1.5 w-full sm:w-auto">
          <Plus className="h-4.5 w-4.5" />
          <span>Add a new buddy</span>
        </Button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Fetching your crew..." />
      ) : pets.length === 0 ? (
        <EmptyState
          title="No buddies yet"
          hint="Your pet is patiently waiting."
          action={
            <Button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 mt-2">
              <Plus className="h-4.5 w-4.5" />
              <span>Add a new buddy</span>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Link key={pet.id} to={`/pets/${pet.id}`} className="card hover:shadow-cozy-lg transition duration-200">
              <div className="flex items-center gap-3">
                <Avatar 
                  species={pet.species} 
                  tone={pet.species === "dog" ? "terracotta" : pet.species === "cat" ? "sage" : "butter"} 
                  size={48} 
                  className="flex-shrink-0" 
                />
                <div>
                  <h2 className="text-lg font-extrabold text-charcoal-900 leading-tight">{pet.name}</h2>
                  <p className="text-sm capitalize text-charcoal-500">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                    {ageFromDob(pet.dateOfBirth) ? ` · ${ageFromDob(pet.dateOfBirth)}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-md bg-oat-200/60 px-3 py-2 text-sm text-text-muted">
                <span>Last weigh-in</span>
                <span className="font-bold text-terracotta-500">
                  {pet.lastWeight ? `${num(pet.lastWeight.weightKg, 2)} kg` : "—"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a new buddy">
        <PetForm onSubmit={create} submitting={submitting} error={formError} />
      </Modal>
    </div>
  );
}
