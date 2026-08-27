import { z } from "zod";

import type { Json } from "@/types/database";

export const campaignBriefSchema = z.object({
  title: z.string().trim().min(2).max(120),
  objectives: z.string().trim().min(10).max(2_000),
  keyMessages: z.array(z.string().trim().min(2).max(240)).min(2).max(8),
  guidelines: z.string().trim().min(10).max(2_000),
});

export type CampaignBriefFields = z.infer<typeof campaignBriefSchema>;
export type BriefGenerationMode = "ai" | "placeholder";

export function parseKeyMessages(value: Json | null): string[] {
  const parsed = z.array(z.string()).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function getBriefGenerationMode(value: Json | null): BriefGenerationMode {
  if (!value || Array.isArray(value) || typeof value !== "object") return "ai";

  const generation = value.generation;
  if (!generation || Array.isArray(generation) || typeof generation !== "object") return "ai";

  return generation.mode === "placeholder" ? "placeholder" : "ai";
}

export function buildBriefContent(
  brief: CampaignBriefFields,
  mode: BriefGenerationMode,
): Json {
  return {
    ...brief,
    generation: {
      mode,
      note:
        mode === "placeholder"
          ? "Placeholder generated because OPENAI_API_KEY is not configured."
          : "Generated from the saved campaign objective and brand profile.",
    },
  };
}

export function updateBriefContent(
  current: Json | null,
  brief: CampaignBriefFields,
): Json {
  const generationMode = getBriefGenerationMode(current);
  return buildBriefContent(brief, generationMode);
}
