import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, ArrowRight } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SBU Productivity Assistant | AI Workplace Command Center" },
      {
        name: "description",
        content:
          "Draft professional emails, summarize meeting notes and build prioritized daily plans with the SBU Productivity Assistant.",
      },
      { property: "og:title", content: "SBU Productivity Assistant" },
      {
        property: "og:description",
        content:
          "AI email drafting, meeting summaries and smart scheduling in one executive workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommandCenter,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    copy: "Context-aware drafts with formal, informal or persuasive tone, adapted to clients, managers or your team.",
  },
  {
    to: "/meetings",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    copy: "Turn long notes into an executive summary with key points, decisions, owners and deadlines.",
  },
  {
    to: "/planner",
    icon: CalendarClock,
    title: "AI Task Planner",
    copy: "Prioritized daily or weekly schedules with deep-work blocks and time optimization strategies.",
  },
] as const;

function CommandCenter() {
  return (
    <AppShell>
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-card-foreground">
            Welcome to <span className="font-semibold">SBU Productivity Assistant</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Three AI tools for the work that eats your day: writing, recall and planning.
          </p>
        </div>
        <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-widest text-primary">
          AI Active
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {tools.map(({ to, icon: Icon, title, copy }, i) => (
          <Panel key={to} className={i === 2 ? "lg:col-span-2" : ""}>
            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-2xl bg-accent/10 p-3">
                <Icon className="size-5 text-accent" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">{title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{copy}</p>
            <Link
              to={to}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Open tool <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
