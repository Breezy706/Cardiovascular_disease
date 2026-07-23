import { SEED_PATIENTS, type PatientRecord } from "./mock-data";

// Base URL of your Flask API (which talks to the MySQL database you
// manage through phpMyAdmin). Override by creating a ".env" file with
// VITE_API_BASE_URL if the backend runs somewhere other than localhost:5000.
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:5000";

const CHANGE_EVENT = "cardiosense:patients-changed";

let cache: PatientRecord[] = [];
let hasLoadedOnce = false;

function notify() {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

async function apiFetchPatients(): Promise<PatientRecord[]> {
  const res = await fetch(`${API_BASE}/patients`);
  if (!res.ok) throw new Error(`Failed to load patients (HTTP ${res.status})`);
  return res.json();
}

async function apiCreatePatient(record: PatientRecord): Promise<PatientRecord> {
  const res = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to save patient (HTTP ${res.status})`);
  }
  return res.json();
}

async function apiDeletePatient(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/patients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete patient (HTTP ${res.status})`);
}

/**
 * Load (or reload) the patient list from the MySQL-backed API.
 * Falls back to local seed data if the API can't be reached, so the UI
 * still renders something useful while you get the backend running.
 */
export async function loadPatients(): Promise<PatientRecord[]> {
  try {
    cache = await apiFetchPatients();
  } catch (err) {
    console.error(
      "CardioSense: could not reach the database API at",
      API_BASE,
      "- using local fallback data. Make sure the Flask backend (flask_backend/app.py) is running and MySQL is reachable.",
      err,
    );
    if (!hasLoadedOnce) cache = SEED_PATIENTS;
  }
  hasLoadedOnce = true;
  notify();
  return cache;
}

/** Synchronous snapshot of the last-loaded patients, for immediate render. */
export function getPatients(): PatientRecord[] {
  return cache;
}

/** Save a new prediction to the database, then refresh everyone's view. */
export async function addPatient(record: PatientRecord): Promise<void> {
  await apiCreatePatient(record);
  await loadPatients();
}

/** Delete a patient/prediction record from the database. */
export async function deletePatient(id: string): Promise<void> {
  await apiDeletePatient(id);
  await loadPatients();
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

/** Generate the next sequential patient ID, e.g. P-10429 (server also does this if omitted). */
export function nextPatientId(patients: PatientRecord[]): string {
  const nums = patients
    .map((p) => Number(p.id.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 10420;
  return `P-${max + 1}`;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Dashboard / Reports summary numbers, computed live from real data. */
export function computeStats(patients: PatientRecord[]) {
  const totalPredictions = patients.length;
  const highRisk = patients.filter((p) => p.risk === "High").length;
  const lowRisk = patients.filter((p) => p.risk === "Low").length;
  const averageRiskScore =
    totalPredictions === 0
      ? 0
      : patients.reduce((sum, p) => sum + p.probability, 0) / totalPredictions;
  const todayPredictions = patients.filter((p) => isToday(p.date)).length;

  return {
    totalPredictions,
    highRisk,
    lowRisk,
    averageRiskScore, // 0-1 probability, format as % where displayed
    todayPredictions,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Monthly high/low risk counts for the trend charts, computed live. */
export function computeChartData(patients: PatientRecord[]) {
  const buckets = new Map<string, { high: number; low: number }>();

  for (const p of patients) {
    const d = new Date(p.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = buckets.get(key) ?? { high: 0, low: 0 };
    if (p.risk === "High") entry.high += 1;
    else if (p.risk === "Low") entry.low += 1;
    buckets.set(key, entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => {
      const [ay, am] = a.split("-").map(Number);
      const [by, bm] = b.split("-").map(Number);
      return ay === by ? am - bm : ay - by;
    })
    .map(([key, v]) => {
      const monthIndex = Number(key.split("-")[1]);
      return { month: MONTHS[monthIndex], high: v.high, low: v.low };
    });
}
