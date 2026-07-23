import { cn } from "@/lib/utils";
import type { Risk } from "@/lib/mock-data";

const map: Record<Risk, string> = {
  High: "bg-destructive/10 text-destructive ring-destructive/20",
  Moderate: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  Low: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
};

export function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        map[risk],
      )}
    >
      {risk}
    </span>
  );
}
