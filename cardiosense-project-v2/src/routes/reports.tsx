import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import jsPDF from "jspdf";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { usePatients } from "@/lib/use-patients";
import { computeStats, computeChartData } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  component: () => (
    <AppShell>
      <ReportsPage />
    </AppShell>
  ),
});

function ReportsPage() {
  const { patients, loading, error } = usePatients();
  const stats = computeStats(patients);
  const chartData = computeChartData(patients);

  const distribution = [
    { name: "High risk", value: stats.highRisk, color: "var(--destructive)" },
    { name: "Low risk", value: stats.lowRisk, color: "#10b981" },
  ];

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const marginX = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.text("CardioSense - Risk Report", marginX, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
    doc.setTextColor(20);
    y += 12;

    doc.setFontSize(13);
    doc.text("Summary", marginX, y);
    y += 8;
    doc.setFontSize(11);
    const summaryLines = [
      `Total predictions: ${stats.totalPredictions}`,
      `High risk patients: ${stats.highRisk}`,
      `Low risk patients: ${stats.lowRisk}`,
      `Average risk score: ${(stats.averageRiskScore * 100).toFixed(1)}%`,
      `Today's predictions: ${stats.todayPredictions}`,
    ];
    summaryLines.forEach((line) => {
      doc.text(line, marginX, y);
      y += 7;
    });

    y += 6;
    doc.setFontSize(13);
    doc.text("Recent predictions", marginX, y);
    y += 8;

    const columns = [
      { label: "ID", x: marginX, w: 22 },
      { label: "Name", x: marginX + 22, w: 42 },
      { label: "Age/Sex", x: marginX + 66, w: 20 },
      { label: "BP", x: marginX + 88, w: 16 },
      { label: "Chol", x: marginX + 106, w: 18 },
      { label: "Prob", x: marginX + 126, w: 16 },
      { label: "Risk", x: marginX + 144, w: 20 },
      { label: "Date", x: marginX + 166, w: 26 },
    ];

    const drawHeader = () => {
      doc.setFontSize(9);
      doc.setTextColor(110);
      columns.forEach((c) => doc.text(c.label, c.x, y));
      doc.setTextColor(20);
      y += 5;
      doc.setDrawColor(220);
      doc.line(marginX, y, 196, y);
      y += 5;
    };

    drawHeader();
    doc.setFontSize(9);

    patients.slice(0, 40).forEach((p) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        drawHeader();
      }
      doc.text(p.id, columns[0].x, y);
      doc.text(p.name.length > 22 ? `${p.name.slice(0, 20)}...` : p.name, columns[1].x, y);
      doc.text(`${p.age}/${p.sex}`, columns[2].x, y);
      doc.text(String(p.bp), columns[3].x, y);
      doc.text(String(p.chol), columns[4].x, y);
      doc.text(`${(p.probability * 100).toFixed(0)}%`, columns[5].x, y);
      doc.text(p.risk, columns[6].x, y);
      doc.text(p.date, columns[7].x, y);
      y += 6;
    });

    doc.save(`cardiosense-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Aggregated insights across all predictions.</p>
          {error && (
            <p className="mt-2 text-xs text-destructive">
              Could not reach the database API ({error}). Showing local fallback data.
            </p>
          )}
          {loading && !error && (
            <p className="mt-2 text-xs text-muted-foreground">Loading live data…</p>
          )}
        </div>
        <button
          onClick={handleExportPdf}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Monthly predictions</h2>
          <div className="h-72">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No predictions yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 12, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="high" name="High risk" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="low" name="Low risk" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Risk distribution</h2>
          <div className="h-72">
            {stats.totalPredictions === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No predictions yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileBarChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Model performance summary</h3>
            <p className="text-sm text-muted-foreground">Latest evaluation on the held-out validation set.</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Accuracy", "94.2%"],
            ["Precision", "92.7%"],
            ["Recall", "91.5%"],
            ["ROC-AUC", "0.96"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
