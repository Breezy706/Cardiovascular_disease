import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Cpu, FileText, HeartPulse, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  component: () => (
    <AppShell fullBleed>
      <HomePage />
    </AppShell>
  ),
});

const steps = [
  {
    icon: ClipboardList,
    title: "Enter patient details",
    text: "Fill in the clinical and demographic information.",
  },
  {
    icon: Cpu,
    title: "Model analyses the data",
    text: "A machine learning model estimates the risk.",
  },
  {
    icon: FileText,
    title: "Get the result",
    text: "See the risk level, probability and recommendations.",
  },
];

const factors = [
  "Age",
  "Sex",
  "Chest pain type",
  "Resting BP",
  "Cholesterol",
  "Fasting blood sugar",
  "Resting ECG",
  "Max heart rate",
  "Exercise angina",
  "Oldpeak",
  "ST slope",
];

function HomePage() {
  return (
    <div className="flex w-full flex-col">
      {/* Picha: PC inajaza skrini, simu inaonyeshwa nzima */}
      <div className="w-full overflow-hidden md:h-[calc(100vh-4rem)]">
        <img
          src="/project-image.jpeg"
          alt="Predicting Risk of Cardiovascular Diseases"
          className="block h-auto w-full md:h-full md:object-fill"
        />
      </div>

      {/* Maudhui ya simu tu */}
      <section className="space-y-8 px-5 py-8 md:hidden">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {i + 1}. {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Factors analysed</h2>
          <div className="flex flex-wrap gap-2">
            {factors.map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">How risk is classified</h2>
          <p className="text-sm text-muted-foreground">
            The model estimates a probability between 0 and 1. A threshold of
            0.5 (50%) is used to decide the risk level.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">High risk</p>
                <p className="text-sm text-muted-foreground">
                  Probability is 0.5 (50%) or higher.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-600">Low risk</p>
                <p className="text-sm text-muted-foreground">
                  Probability is below 0.5 (50%).
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
          For educational purposes only. This tool does not provide a medical
          diagnosis. Always consult a qualified healthcare professional.
        </p>
      </section>
    </div>
  );
}
