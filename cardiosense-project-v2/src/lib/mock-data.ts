export type Risk = "High" | "Low" | "Moderate";

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  bp: number;
  chol: number;
  risk: Risk;
  probability: number;
  date: string; // ISO date string, e.g. "2026-06-30"
}

/**
 * Fallback data, used ONLY if the MySQL-backed API can't be reached (e.g.
 * the Flask backend isn't running). Once the API responds, everything
 * (Dashboard, History, Reports) reads from the real database instead.
 * Jamal Washington has been removed per request.
 */
export const SEED_PATIENTS: PatientRecord[] = [
  { id: "P-10428", name: "Marcus Chen", age: 58, sex: "M", bp: 148, chol: 244, risk: "High", probability: 0.87, date: "2026-06-30" },
  { id: "P-10427", name: "Priya Nair", age: 42, sex: "F", bp: 122, chol: 198, risk: "Low", probability: 0.14, date: "2026-06-30" },
  { id: "P-10426", name: "Elena Rossi", age: 63, sex: "F", bp: 156, chol: 271, risk: "High", probability: 0.91, date: "2026-06-29" },
  { id: "P-10424", name: "Sofia Alvarez", age: 37, sex: "F", bp: 118, chol: 176, risk: "Low", probability: 0.09, date: "2026-06-28" },
  { id: "P-10423", name: "Henrik Lindqvist", age: 71, sex: "M", bp: 162, chol: 289, risk: "High", probability: 0.94, date: "2026-06-28" },
  { id: "P-10422", name: "Aiko Tanaka", age: 45, sex: "F", bp: 128, chol: 210, risk: "Low", probability: 0.21, date: "2026-06-27" },
];
