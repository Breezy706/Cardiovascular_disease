import { createFileRoute } from "@tanstack/react-router";
import { Users, HeartPulse, ShieldCheck, Gauge, CalendarCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { PatientsTable } from "@/components/patients-table";
import { usePatients } from "@/lib/use-patients";
import { computeStats, computeChartData } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});

function DashboardPage() {
  const { patients, loading, error } = usePatients();
  const stats = computeStats(patients);
  const chartData = computeChartData(patients);
  const recentPatients = patients.slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of predictions, patient risk distribution, and recent activity.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not reach the database API ({error}). Showing local fallback data — make sure the Flask backend is running and MySQL is reachable.
        </div>
      )}
      {loading && !error && (
        <div className="text-sm text-muted-foreground">Loading live data…</div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Predictions" value={stats.totalPredictions.toLocaleString()} delta={`${patients.length} on record`} icon={Users} tone="info" />
        <StatCard label="High Risk Patients" value={stats.highRisk} delta={`${stats.totalPredictions ? Math.round((stats.highRisk / stats.totalPredictions) * 100) : 0}% of total`} icon={HeartPulse} tone="danger" />
        <StatCard label="Low Risk Patients" value={stats.lowRisk} delta={`${stats.totalPredictions ? Math.round((stats.lowRisk / stats.totalPredictions) * 100) : 0}% of total`} icon={ShieldCheck} tone="success" />
        <StatCard label="Average Risk Score" value={`${(stats.averageRiskScore * 100).toFixed(1)}%`} delta="Across all predictions" icon={Gauge} tone="info" />
        <StatCard label="Today's Predictions" value={stats.todayPredictions} delta={stats.todayPredictions > 0 ? "Recorded today" : "None yet today"} icon={CalendarCheck} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Prediction trend</h2>
            <p className="text-sm text-muted-foreground">Monthly high vs low risk predictions</p>
          </div>
        </div>
        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No predictions yet — run a prediction to see the trend.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="high" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="low" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="high" name="High risk" stroke="var(--destructive)" fill="url(#high)" strokeWidth={2} />
                <Area type="monotone" dataKey="low" name="Low risk" stroke="var(--primary)" fill="url(#low)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Recent predictions</h2>
            <p className="text-sm text-muted-foreground">Latest patient assessments</p>
          </div>
        </div>
        <PatientsTable rows={recentPatients} />
      </section>
    </div>
  );
}
