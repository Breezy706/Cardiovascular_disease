import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope, HeartPulse, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { addPatient, getPatients, nextPatientId } from "@/lib/store";
import type { PatientRecord } from "@/lib/mock-data";

export const Route = createFileRoute("/prediction")({
  component: () => (
    <AppShell>
      <PredictionPage />
    </AppShell>
  ),
});

interface Result {
  name: string;
  probability: number;
  label: "High" | "Low";
}

const HIGH_RISK_RECS = [
  "Consult a cardiologist immediately for a full clinical assessment.",
  "Adopt a strict low-sodium, low-saturated-fat diet (DASH / Mediterranean).",
  "Engage in supervised aerobic exercise 30 minutes, 5 days a week.",
  "Quit smoking and avoid second-hand smoke completely.",
  "Limit alcohol to <1 drink/day and eliminate sugary drinks.",
  "Monitor blood pressure, cholesterol, and blood sugar weekly.",
  "Take prescribed medication (statins, antihypertensives) consistently.",
  "Manage stress through mindfulness, therapy, or breathing exercises.",
  "Aim for a BMI between 18.5 and 24.9; reduce weight if overweight.",
  "Ensure 7–8 hours of quality sleep every night.",
];

const LOW_RISK_RECS = [
  "Maintain a balanced diet rich in vegetables, fruits, and whole grains.",
  "Continue regular physical activity — at least 150 min/week.",
  "Keep annual cardiovascular check-ups and lipid panels.",
  "Avoid smoking and limit alcohol intake.",
  "Manage stress and maintain healthy sleep habits.",
  "Keep blood pressure under 120/80 mmHg.",
  "Maintain cholesterol (LDL) below 100 mg/dL.",
  "Stay hydrated and limit processed foods.",
];

// Simple heuristic scoring that mirrors the Gradient Boosting model's tendencies.
// Replace with a call to the Flask API's /predict endpoint if you want the
// real trained model instead of this client-side heuristic.
function scorePatient(f: Record<string, string | number>): number {
  let s = 0;
  s += (Number(f.Age) - 40) * 0.012;
  s += f.Sex === "M" ? 0.15 : 0;
  const cpMap: Record<string, number> = { ASY: 0.35, ATA: -0.1, NAP: 0.05, TA: 0.1 };
  s += cpMap[String(f.ChestPainType)] ?? 0;
  s += (Number(f.RestingBP) - 120) * 0.005;
  s += (Number(f.Cholesterol) - 200) * 0.0015;
  s += Number(f.FastingBS) === 1 ? 0.2 : 0;
  const ecgMap: Record<string, number> = { Normal: 0, ST: 0.12, LVH: 0.15 };
  s += ecgMap[String(f.RestingECG)] ?? 0;
  s += (150 - Number(f.MaxHR)) * 0.006;
  s += f.ExerciseAngina === "Y" ? 0.25 : 0;
  s += Number(f.Oldpeak) * 0.15;
  const slopeMap: Record<string, number> = { Up: -0.15, Flat: 0.2, Down: 0.25 };
  s += slopeMap[String(f.ST_Slope)] ?? 0;
  // sigmoid
  return 1 / (1 + Math.exp(-s));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function PredictionPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const features: Record<string, string | number> = {};
    data.forEach((v, k) => { features[k] = v as string; });

    const probability = scorePatient(features);
    const label: Result["label"] = probability >= 0.5 ? "High" : "Low";
    const name = String(features.name || "Patient");
    setResult({ name, probability, label });
    setSaved(false);
    setSaveError(null);
    setSaving(true);

    // Persist this prediction to the MySQL database (via the Flask API) so
    // it appears live in History, Dashboard and Reports.
    try {
      const current = getPatients();
      const record: PatientRecord = {
        id: nextPatientId(current),
        name,
        age: Number(features.Age) || 0,
        sex: (features.Sex as PatientRecord["sex"]) || "M",
        bp: Number(features.RestingBP) || 0,
        chol: Number(features.Cholesterol) || 0,
        risk: label,
        probability: Number(probability.toFixed(4)),
        date: todayIso(),
      };
      await addPatient(record);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save to the database.");
    } finally {
      setSaving(false);
    }
  };

  const chartData = result
    ? [
        { name: "Low risk", value: Number(((1 - result.probability) * 100).toFixed(1)), fill: "#10b981" },
        { name: "High risk", value: Number((result.probability * 100).toFixed(1)), fill: "var(--destructive)" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New prediction</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter all 11 clinical features. Results are saved automatically to the database and appear in History, Dashboard and Reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={onSubmit}
          onChange={() => setSaved(false)}
          className="lg:col-span-2 space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Patient name" name="name" placeholder="Jane Doe" required />
            <Field label="Age" name="Age" type="number" placeholder="54" required />
            <SelectField label="Sex" name="Sex" options={[["M", "Male"], ["F", "Female"]]} />
            <SelectField label="Chest Pain Type" name="ChestPainType" options={[["ATA", "Atypical Angina"], ["NAP", "Non-Anginal Pain"], ["ASY", "Asymptomatic"], ["TA", "Typical Angina"]]} />
            <Field label="Resting BP (mmHg)" name="RestingBP" type="number" placeholder="130" required />
            <Field label="Cholesterol (mg/dL)" name="Cholesterol" type="number" placeholder="220" required />
            <SelectField label="Fasting Blood Sugar > 120 mg/dL" name="FastingBS" options={[["0", "No"], ["1", "Yes"]]} />
            <SelectField label="Resting ECG" name="RestingECG" options={[["Normal", "Normal"], ["ST", "ST-T abnormality"], ["LVH", "LV Hypertrophy"]]} />
            <Field label="Max Heart Rate" name="MaxHR" type="number" placeholder="150" required />
            <SelectField label="Exercise-Induced Angina" name="ExerciseAngina" options={[["N", "No"], ["Y", "Yes"]]} />
            <Field label="Oldpeak (ST depression)" name="Oldpeak" type="number" step="0.1" placeholder="1.0" required />
            <SelectField label="ST Slope" name="ST_Slope" options={[["Up", "Up"], ["Flat", "Flat"], ["Down", "Down"]]} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="reset"
              onClick={() => { setResult(null); setSaved(false); setSaveError(null); }}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Reset
            </button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Stethoscope className="h-4 w-4" />
              Run prediction
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-medium text-muted-foreground">Prediction result</h2>
            {result ? (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${result.label === "High" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"}`}>
                    <HeartPulse className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{(result.probability * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">{result.label} risk — {result.name}</p>
                  </div>
                </div>
                {saving && (
                  <p className="mt-3 text-xs font-medium text-muted-foreground">Saving to database…</p>
                )}
                {saved && !saving && (
                  <p className="mt-3 text-xs font-medium text-emerald-600">
                    ✓ Saved to database — visible now in History, Dashboard and Reports.
                  </p>
                )}
                {saveError && !saving && (
                  <p className="mt-3 text-xs font-medium text-destructive">
                    Could not save to database: {saveError}
                  </p>
                )}
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Complete the form and run a prediction to see the probability and risk chart.
              </p>
            )}
          </div>

          {result && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                {result.label === "High" ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                )}
                <h3 className="text-sm font-semibold">
                  Recommendations to {result.label === "High" ? "reduce" : "maintain low"} cardiovascular risk
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(result.label === "High" ? HIGH_RISK_RECS : LOW_RISK_RECS).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className={result.label === "High" ? "text-destructive" : "text-emerald-600"}>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required, step }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; step?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: Array<[string, string]> }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <select
        name={name}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
