import { z } from "zod";

import type { Json } from "@/types/database";

export const campaignBriefSchema = z.object({
  title: z.string().trim().min(2).max(120),
  objectives: z.string().trim().min(10).max(2_000),
  keyMessages: z.array(z.string().trim().min(2).max(240)).min(2).max(8),
  guidelines: z.string().trim().min(10).max(2_000),
});

export type CampaignBriefFields = z.infer<typeof campaignBriefSchema>;
export type BriefGenerationMode = "ai" | "placeholder" | "edited";

export function parseKeyMessages(value: Json | null): string[] {
  const parsed = z.array(z.string()).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function getBriefGenerationMode(value: Json | null): BriefGenerationMode {
  if (!value || Array.isArray(value) || typeof value !== "object") return "ai";

  const generation = value.generation;
  if (!generation || Array.isArray(generation) || typeof generation !== "object") return "ai";

  if (generation.mode === "placeholder") return "placeholder";
  if (generation.mode === "edited") return "edited";
  return "ai";
}

export function getPlaceholderBaseline(value: Json | null): CampaignBriefFields | null {
  if (getBriefGenerationMode(value) !== "placeholder") return null;
  if (!value || Array.isArray(value) || typeof value !== "object") return null;

  const generation = value.generation;
  if (generation && !Array.isArray(generation) && typeof generation === "object") {
    const storedBaseline = campaignBriefSchema.safeParse(generation.placeholderBaseline);
    if (storedBaseline.success) return storedBaseline.data;
  }

  const legacyBaseline = campaignBriefSchema.safeParse(value);
  return legacyBaseline.success ? legacyBaseline.data : null;
}

export function haveAllBriefFieldsChanged(
  baseline: CampaignBriefFields,
  brief: CampaignBriefFields,
) {
  return (
    brief.title !== baseline.title &&
    brief.objectives !== baseline.objectives &&
    brief.guidelines !== baseline.guidelines &&
    JSON.stringify(brief.keyMessages) !== JSON.stringify(baseline.keyMessages)
  );
}

export function buildBriefContent(
  brief: CampaignBriefFields,
  mode: BriefGenerationMode,
  placeholderBaseline: CampaignBriefFields | null = null,
): Json {
  const generation: Record<string, Json | undefined> = {
    mode,
    note:
      mode === "placeholder"
        ? "Starter brief created while AI drafting was unavailable."
        : mode === "edited"
          ? "Starter brief reviewed and rewritten."
          : "Created from the saved campaign objective and brand profile.",
  };

  if (mode === "placeholder") {
    generation.placeholderBaseline = placeholderBaseline ?? brief;
  }

  return {
    ...brief,
    generation,
  };
}

export function updateBriefContent(
  current: Json | null,
  brief: CampaignBriefFields,
): { content: Json; mode: BriefGenerationMode } {
  const currentMode = getBriefGenerationMode(current);
  const placeholderBaseline = getPlaceholderBaseline(current);
  const mode =
    currentMode === "placeholder" &&
    placeholderBaseline &&
    haveAllBriefFieldsChanged(placeholderBaseline, brief)
      ? "edited"
      : currentMode;

  return {
    content: buildBriefContent(brief, mode, placeholderBaseline),
    mode,
  };
}
