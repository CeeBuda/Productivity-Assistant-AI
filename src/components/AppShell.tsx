import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Mail, FileText, CalendarClock } from "lucide-react";

const nav = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/email", label: "Email Forge", icon: Mail },
  { to: "/meetings", label: "Meeting Decipher", icon: FileText },
  { to: "/planner", label: "Task Architect", icon: CalendarClock },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <aside className="flex w-full flex-col border-b border-border bg-surface md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-b-0">
        <div className="border-b border-border p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-primary shadow-glow">
              <span className="font-display text-sm font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-card-foreground">
              SBU Assistant
            </span>
          </Link>
        </div>

        <nav className="flex flex-row gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col md:overflow-visible">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-card-foreground"
              activeProps={{
                className:
                  "border-accent/20 bg-muted/50 text-accent hover:text-accent hover:bg-muted/50",
              }}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-border p-4 md:block">
          <div className="rounded-2xl bg-muted/30 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-subtle">
              Daily Efficiency
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full w-3/4 bg-accent" />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">75% tasks completed</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8 md:mb-10">
      <h1 className="font-display text-3xl font-light text-card-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>
    </header>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-border bg-surface p-6 shadow-panel ${className}`}
    >
      {children}
    </section>
  );
}
