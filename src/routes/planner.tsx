import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell, PageHeader, Panel } from "@/components/AppShell";
import { buildPlan } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | SBU Productivity Assistant" },
      {
        name: "description",
        content:
          "Generate structured daily or weekly plans, prioritized by urgency and importance, with time optimization strategies.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Prioritized schedules and deep-work blocks generated from your task list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

const horizons = ["Daily", "Weekly"] as const;

const priorityStyles: Record<string, string> = {
  High: "border-primary bg-background",
  Medium: "border-surface-muted bg-muted/20",
  Low: "border-surface-muted bg-muted/10 opacity-80",
};

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<(typeof horizons)[number]>("Daily");
  const [hours, setHours] = useState(8);

  const fn = useServerFn(buildPlan);
  const mutation = useMutation({
    mutationFn: (input: { tasks: string; horizon: (typeof horizons)[number]; hours: number }) =>
      fn({ data: input }),
  });
  const plan = mutation.data;

  return (
    <AppShell>
      <PageHeader
        title="AI Task Planner"
        subtitle="List what's on your plate — get a prioritized schedule and strategies to protect your focus."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-5">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (tasks.trim().length < 5) return;
              mutation.mutate({ tasks, horizon, hours });
            }}
          >
            <div className="space-y-2">
              <label htmlFor="tasks" className="label-eyebrow block">
                Your tasks
              </label>
              <textarea
                id="tasks"
                rows={10}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                className="field resize-y"
                placeholder={
                  "Finish Q4 strategy brief (due Thursday)\nClient follow-up calls\nReview architecture spec\nTeam standup 15m"
                }
              />
            </div>

            <div className="space-y-2">
              <span className="label-eyebrow block">Horizon</span>
              <div className="flex gap-2">
                {horizons.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorizon(h)}
                    className={
                      horizon === h
                        ? "flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground shadow-glow"
                        : "flex-1 rounded-lg border border-surface-muted bg-muted py-2 text-xs text-muted-foreground transition-colors hover:text-card-foreground"
                    }
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="hours" className="label-eyebrow block">
                Working hours per day: {hours}
              </label>
              <input
                id="hours"
                type="range"
                min={2}
                max={14}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || tasks.trim().length < 5}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-card-foreground py-3 font-semibold text-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {mutation.isPending ? "Planning…" : "Generate Schedule"}
            </button>
          </form>
        </Panel>

        <div className="space-y-6 lg:col-span-7">
          {mutation.isError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}

          {!plan && !mutation.isError && (
            <Panel>
              <p className="text-sm text-subtle">
                Your generated {horizon.toLowerCase()} plan will appear here with time blocks,
                priorities and optimization tips.
              </p>
            </Panel>
          )}

          {plan && (
            <>
              <Panel>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">
                  {horizon} Plan — {plan.focus}
                </h2>
                <div className="space-y-3">
                  {plan.blocks.map((b, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 rounded-r-xl border-l-2 p-3 ${
                        priorityStyles[b.priority] ?? priorityStyles["Medium"]
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {b.title}
                        </p>
                        <p className="text-[11px] text-subtle">
                          {b.priority} priority • {b.duration} — {b.rationale}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{b.time}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-subtle">
                  Time Optimization Strategies
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.strategies.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="leading-none text-accent">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
