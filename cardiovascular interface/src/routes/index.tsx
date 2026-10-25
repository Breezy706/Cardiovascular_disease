import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, LayoutDashboard } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  component: () => (
    <AppShell fullBleed>
      <HomePage />
    </AppShell>
  ),
});

function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      {/* Picha: PC inajaza skrini, simu inaonyeshwa nzima */}
      <div className="w-full overflow-hidden md:h-[calc(100vh-4rem)]">
        <img
          src="/project-image.jpeg"
          alt="Predicting Risk of Cardiovascular Diseases"
          className="block h-auto w-full md:h-full md:object-fill"
        />
      </div>

      {/* Maudhui ya simu tu: yanajaza nafasi iliyobaki */}
      <section className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center md:hidden">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            Check cardiovascular risk in seconds
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter a patient's clinical details and get an instant risk estimate
            from our machine learning model.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link
            to="/prediction"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Stethoscope className="h-4 w-4" />
            Start Prediction
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            View Dashboard
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          For educational purposes only. Not a medical diagnosis.
        </p>
      </section>
    </div>
  );
}
