import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { AppShell, PageHeader, Panel } from "@/components/AppShell";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | SBU Productivity Assistant" },
      {
        name: "description",
        content:
          "Generate professional, context-aware emails with formal, informal or persuasive tone for clients, managers or your team.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "AI-drafted workplace emails tuned to your tone and audience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Informal", "Persuasive"] as const;
const audiences = ["Client", "Manager", "Team"] as const;

function EmailPage() {
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<(typeof tones)[number]>("Formal");
  const [audience, setAudience] = useState<(typeof audiences)[number]>("Client");
  const [sender, setSender] = useState("");
  const [copied, setCopied] = useState(false);

  const fn = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: (input: {
      context: string;
      tone: (typeof tones)[number];
      audience: (typeof audiences)[number];
      sender?: string;
    }) => fn({ data: input }),
  });

  const draft = mutation.data?.email ?? "";

  return (
    <AppShell>
      <PageHeader
        title="Smart Email Generator"
        subtitle="Describe the situation — get a ready-to-send draft in the right tone for the right audience."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (context.trim().length < 5) return;
              setCopied(false);
              mutation.mutate({ context, tone, audience, sender: sender || undefined });
            }}
          >
            <div className="space-y-2">
              <label htmlFor="context" className="label-eyebrow block">
                Context &amp; Goal
              </label>
              <textarea
                id="context"
                rows={6}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="field resize-y"
                placeholder="Politely decline a supplier proposal but keep the door open for Q4..."
              />
            </div>

            <div className="space-y-2">
              <span className="label-eyebrow block">Tone</span>
              <div className="flex gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={
                      tone === t
                        ? "flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground shadow-glow"
                        : "flex-1 rounded-lg border border-surface-muted bg-muted py-2 text-xs text-muted-foreground transition-colors hover:text-card-foreground"
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="label-eyebrow block">Audience</span>
              <div className="flex gap-2">
                {audiences.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAudience(a)}
                    className={
                      audience === a
                        ? "flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground shadow-glow"
                        : "flex-1 rounded-lg border border-surface-muted bg-muted py-2 text-xs text-muted-foreground transition-colors hover:text-card-foreground"
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sender" className="label-eyebrow block">
                Sign off as (optional)
              </label>
              <input
                id="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="field"
                placeholder="Sibusiso, Operations Lead"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || context.trim().length < 5}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-card-foreground py-3 font-semibold text-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {mutation.isPending ? "Drafting…" : "Generate Draft"}
            </button>
          </form>
        </Panel>

        <Panel className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-card-foreground">AI Draft</h2>
            {draft && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(draft);
                  setCopied(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-muted bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:text-card-foreground"
              >
                <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {mutation.isError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}

          {!draft && !mutation.isPending && !mutation.isError && (
            <p className="text-sm text-subtle">
              Your generated email will appear here, subject line first.
            </p>
          )}

          {draft && (
            <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-card-foreground">
              {draft}
            </pre>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
