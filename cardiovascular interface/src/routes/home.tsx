import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/home")({
  component: () => (
    <AppShell fullBleed>
      <HomePage />
    </AppShell>
  ),
});

function HomePage() {
  return (
    // 100vh minus the navbar height (h-16 = 4rem), so the image fills the
    // whole visible area with no scrolling — stretched to fit exactly,
    // no black bars.
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <img
        src="/project-image.jpeg"
        alt="Predicting Risk of Cardiovascular Diseases"
        className="h-full w-full object-fill"
      />
    </div>
  );
}
