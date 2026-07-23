import type { PatientRecord } from "@/lib/mock-data";
import { RiskBadge } from "./risk-badge";

export function PatientsTable({ rows }: { rows: PatientRecord[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Patient ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Age / Sex</th>
              <th className="px-4 py-3 font-medium">BP</th>
              <th className="px-4 py-3 font-medium">Cholesterol</th>
              <th className="px-4 py-3 font-medium">Probability</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.age} / {r.sex}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.bp} mmHg</td>
                <td className="px-4 py-3 text-muted-foreground">{r.chol} mg/dL</td>
                <td className="px-4 py-3 text-muted-foreground">{(r.probability * 100).toFixed(0)}%</td>
                <td className="px-4 py-3"><RiskBadge risk={r.risk} /></td>
                <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
