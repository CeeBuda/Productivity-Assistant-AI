import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { getModel, toFriendlyAiError } from "./ai-gateway.server";

export const emailSchema = z.object({
  context: z.string().min(5).max(4000),
  tone: z.enum(["Formal", "Informal", "Persuasive"]),
  audience: z.enum(["Client", "Manager", "Team"]),
  sender: z.string().max(80).optional(),
});

export const notesSchema = z.object({
  notes: z.string().min(20).max(20000),
});

export const plannerSchema = z.object({
  tasks: z.string().min(5).max(8000),
  horizon: z.enum(["Daily", "Weekly"]),
  hours: z.number().min(2).max(14),
});

export const summaryResult = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
    }),
  ),
});

export const planResult = z.object({
  focus: z.string(),
  blocks: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
      duration: z.string(),
      rationale: z.string(),
    }),
  ),
  strategies: z.array(z.string()),
});

export type SummaryResult = z.infer<typeof summaryResult>;
export type PlanResult = z.infer<typeof planResult>;

export async function runEmail(data: z.infer<typeof emailSchema>) {
  try {
    const result = streamText({
      model: getModel(),
      system:
        "You are SBU Productivity Assistant, an expert workplace communication writer. Write ready-to-send professional emails. Always start with a 'Subject:' line, then the body. Keep it concise and free of placeholder brackets unless truly unavoidable.",
      prompt: `Write an email.
Context / goal: ${data.context}
Tone: ${data.tone}
Audience: ${data.audience}${data.sender ? `\nSign off as: ${data.sender}` : ""}
Adapt vocabulary, formality and framing to the audience and tone.`,
    });
    return { email: await result.text };
  } catch (error) {
    throw toFriendlyAiError(error);
  }
}

export async function runSummary(data: z.infer<typeof notesSchema>): Promise<SummaryResult> {
  try {
    const result = streamText({
      model: getModel(),
      system:
        "You summarize meeting notes for busy executives. Be faithful to the notes; never invent owners or dates. Use 'Unassigned' or 'No deadline' when not stated.",
      prompt: `Summarize these meeting notes into a concise executive summary, key points, decisions made, and action items with owner and deadline.\n\n${data.notes}`,
      output: Output.object({ schema: summaryResult }),
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("Could not structure that summary. Try again with a bit more detail.");
    }
    throw toFriendlyAiError(error);
  }
}

export async function runPlan(data: z.infer<typeof plannerSchema>): Promise<PlanResult> {
  try {
    const result = streamText({
      model: getModel(),
      system:
        "You are a scheduling strategist. Apply urgency/importance prioritization, protect deep-work blocks in the morning, batch shallow work, and include short breaks.",
      prompt: `Build a ${data.horizon.toLowerCase()} plan across roughly ${data.hours} working hours ${
        data.horizon === "Weekly" ? "per day" : ""
      }.
Tasks:
${data.tasks}

For a weekly horizon, prefix each block time with the weekday (e.g. "Mon 09:00"). Add 3-5 concrete time-optimization strategies.`,
      output: Output.object({ schema: planResult }),
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("Could not build a plan from that. Try listing tasks on separate lines.");
    }
    throw toFriendlyAiError(error);
  }
}
