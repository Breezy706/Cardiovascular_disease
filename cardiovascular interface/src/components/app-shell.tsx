import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Home,
  LayoutDashboard,
  Stethoscope,
  FileBarChart,
  History,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-6 md:gap-8">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CardioSense</span>
          </Link>

          {/* Menyu ya skrini kubwa */}
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.to)
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

          <div className="ml-auto flex items-center gap-2 sm:gap-3 md:ml-0">
            <div className="text-right">
              <p className="text-xs font-medium leading-tight sm:text-sm">Dr. Hauran Ali</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">Cardiology</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground sm:h-9 sm:w-9 sm:text-sm">
              HA
            </div>

            {/* Kitufe cha vistari vitatu (simu tu) */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Orodha inayofunguka kwenye simu */}
        {open && (
          <nav className="border-t border-border bg-card md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-3 py-2 sm:px-6">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "inline-flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                      isActive(item.to)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className={fullBleed ? "w-full" : "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8"}>
        {children}
      </main>
    </div>
  );
}
