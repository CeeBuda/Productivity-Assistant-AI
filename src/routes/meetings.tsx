import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell, PageHeader, Panel } from "@/components/AppShell";
import { summarizeNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | SBU Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn lengthy meeting notes into a concise summary with key points, decisions, action items, owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Structured meeting intelligence: summary, decisions, owners and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const fn = useServerFn(summarizeNotes);
  const mutation = useMutation({
    mutationFn: (input: { notes: string }) => fn({ data: input }),
  });
  const result = mutation.data;

  return (
    <AppShell>
      <PageHeader
        title="Meeting Notes Summarizer"
        subtitle="Paste raw notes or a transcript — get an executive summary, decision log and assigned action items."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (notes.trim().length < 20) return;
              mutation.mutate({ notes });
            }}
          >
            <label htmlFor="notes" className="label-eyebrow block">
              Raw notes
            </label>
            <textarea
              id="notes"
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field resize-y"
              placeholder={
                "Sarah: We need to finalize the budget by Friday.\nMike: Vendors want a 10% deposit upfront.\nSarah: Approved — process it Thursday."
              }
            />
            <button
              type="submit"
              disabled={mutation.isPending || notes.trim().length < 20}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {mutation.isPending ? "Summarizing…" : "Summarize Notes"}
            </button>
          </form>
        </Panel>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
          {mutation.isError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:col-span-2">
              {(mutation.error as Error).message}
            </p>
          )}

          {!result && !mutation.isError && (
            <Panel className="sm:col-span-2">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">
                Key Outputs
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Executive Summary",
                  "Key Points",
                  "Decision Log",
                  "Action Items (owner + deadline)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="leading-none text-accent">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {result && (
            <>
              <Panel className="sm:col-span-2">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-subtle">
                  Executive Summary
                </h2>
                <p className="text-sm leading-relaxed text-card-foreground">{result.summary}</p>
              </Panel>

              <Panel>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-subtle">
                  Key Points
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.keyPoints.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="leading-none text-accent">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-subtle">
                  Decisions
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.decisions.length === 0 && <li className="text-subtle">None recorded.</li>}
                  {result.decisions.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="leading-none text-primary">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel className="sm:col-span-2">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-subtle">
                  Action Items
                </h2>
                <div className="divide-y divide-border">
                  {result.actionItems.map((a, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{a.task}</p>
                        <p className="text-xs text-subtle">Owner: {a.owner}</p>
                      </div>
                      <span className="rounded-lg border border-surface-muted bg-muted px-2 py-1 text-xs text-accent">
                        {a.deadline}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
