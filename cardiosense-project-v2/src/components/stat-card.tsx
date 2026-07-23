import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "default" | "danger" | "success" | "info";
}

const toneMap = {
  default: "bg-primary/10 text-primary",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
} as const;

export function StatCard({ label, value, delta, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
