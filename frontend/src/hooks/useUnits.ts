import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { makeUnits, type Units } from "../utils/units";

// Resolve the signed-in user's display units. Defaults to imperial when the
// preference is somehow unavailable (matches the backend column default).
export function useUnits(): Units {
  const { user } = useAuth();
  const system = user?.unitSystem ?? "imperial";
  return useMemo(() => makeUnits(system), [system]);
}
