import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PatientsTable } from "@/components/patients-table";
import { usePatients } from "@/lib/use-patients";

export const Route = createFileRoute("/history")({
  component: () => (
    <AppShell>
      <HistoryPage />
    </AppShell>
  ),
});

function HistoryPage() {
  const { patients, loading, error } = usePatients();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | "High" | "Low">("All");

  const rows = patients.filter((r) => {
    const matchQ = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "All" || r.risk === filter;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prediction history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search and filter past patient predictions.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not reach the database API ({error}). Showing local fallback data — make sure the Flask backend is running.
        </div>
      )}
      {loading && !error && (
        <div className="text-sm text-muted-foreground">Loading live data…</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-card p-1">
          {(["All", "High", "Low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No predictions match your search yet.
        </div>
      ) : (
        <PatientsTable rows={rows} />
      )}
    </div>
  );
}
