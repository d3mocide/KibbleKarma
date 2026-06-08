import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { petsApi } from "../api/endpoints";
import { apiError } from "../api/client";
import type { Pet } from "../api/types";
import { EmptyState, ErrorBanner, Modal, Spinner, speciesIcon } from "../components/ui";
import PetForm, { petFormToPayload, type PetFormValues } from "../components/PetForm";
import { ageFromDob, num } from "../utils/format";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-cocoa">Your sleepy snackers</h1>
          <p className="text-cocoa/60">Everyone you're keeping happy and healthy.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Add a new buddy
        </button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="Fetching your crew..." />
      ) : pets.length === 0 ? (
        <EmptyState
          title="No buddies yet"
          hint="Add your first furry friend to start logging nibbles and naps."
          action={
            <button className="btn-primary mt-2" onClick={() => setModalOpen(true)}>
              Add a new buddy
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Link key={pet.id} to={`/pets/${pet.id}`} className="card hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{speciesIcon(pet.species)}</span>
                <div>
                  <h2 className="text-lg font-extrabold text-cocoa">{pet.name}</h2>
                  <p className="text-sm capitalize text-cocoa/60">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ""}
                    {ageFromDob(pet.dateOfBirth) ? ` · ${ageFromDob(pet.dateOfBirth)}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-sand/60 px-3 py-2 text-sm">
                <span className="text-cocoa/70">Last weigh-in</span>
                <span className="font-bold text-teal-deep">
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
