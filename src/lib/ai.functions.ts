import { createServerFn } from "@tanstack/react-start";
import {
  emailSchema,
  notesSchema,
  plannerSchema,
  runEmail,
  runPlan,
  runSummary,
} from "./ai.server";

export const generateEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) => emailSchema.parse(input))
  .handler(async ({ data }) => runEmail(data));

export const summarizeNotes = createServerFn({ method: "POST" })
  .validator((input: unknown) => notesSchema.parse(input))
  .handler(async ({ data }) => runSummary(data));

export const buildPlan = createServerFn({ method: "POST" })
  .validator((input: unknown) => plannerSchema.parse(input))
  .handler(async ({ data }) => runPlan(data));
