import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const MODEL_ID = "google/gemini-3.7-flash";

export function getModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");
  return createLovableAiGatewayProvider(key)(MODEL_ID);
}

export function toFriendlyAiError(error: unknown): Error {
  const status = (error as { statusCode?: number; status?: number })?.statusCode ??
    (error as { status?: number })?.status;
  if (status === 429) {
    return new Error("The AI service is busy right now. Please try again in a moment.");
  }
  if (status === 402) {
    return new Error("AI credits are exhausted. Add credits in Lovable to keep generating.");
  }
  if (status === 403) {
    return new Error("AI access is blocked for this workspace. Check your Lovable AI settings.");
  }
  return new Error(
    error instanceof Error ? error.message : "Something went wrong while generating.",
  );
}
