import { useEffect, useState } from "react";
import { getPatients, loadPatients, subscribe } from "./store";
import type { PatientRecord } from "./mock-data";

interface UsePatientsResult {
  patients: PatientRecord[];
  loading: boolean;
  error: string | null;
}

/**
 * Returns the live list of patients/predictions from the MySQL-backed API.
 * Automatically re-renders the component whenever a new prediction is
 * saved anywhere in the app (e.g. from the "New prediction" form).
 */
export function usePatients(): UsePatientsResult {
  const [patients, setPatients] = useState<PatientRecord[]>(() => getPatients());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe(() => setPatients(getPatients()));
    loadPatients()
      .then(() => setError(null))
      .catch((err) => setError(err.message ?? "Failed to load patients"))
      .finally(() => setLoading(false));
    return unsubscribe;
  }, []);

  return { patients, loading, error };
}
