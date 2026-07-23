import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Home, LayoutDashboard, Stethoscope, FileBarChart, History } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/prediction", label: "Prediction", icon: Stethoscope },
  { to: "/history", label: "History", icon: History },
  { to: "/reports", label: "Reports", icon: FileBarChart },
] as const;

interface AppShellProps {
  children: ReactNode;
  /**
   * When true, the main content area spans the full browser width with no
   * padding or max-width constraint — use for pages like Home that should
   * show edge-to-edge content (e.g. a full-width hero image).
   */
  fullBleed?: boolean;
}

export function AppShell({ children, fullBleed = false }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CardioSense</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">Dr. Hauran Ali</p>
              <p className="text-xs text-muted-foreground">Cardiology</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              HA
            </div>
          </div>
        </div>
      </header>
      <main className={fullBleed ? "w-full" : "mx-auto max-w-7xl px-6 py-8"}>
        {children}
      </main>
    </div>
  );
}
