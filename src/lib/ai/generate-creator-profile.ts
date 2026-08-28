import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  generatedCreatorProfileSchema,
  type CreatorGenerationMode,
  type GeneratedCreatorProfile,
} from "@/lib/creator/onboarding";

export type CreatorProfileGeneration = {
  profile: GeneratedCreatorProfile;
  mode: CreatorGenerationMode;
};

function stripSourceMarkers(value: string) {
  return value
    .replace(/\s*\(\s*\[[^\]]+\]\s*\(https?:\/\/[^)]+\)\s*\)/gi, "")
    .replace(/\s*\[[^\]]+\]\s*\(https?:\/\/[^)]+\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The model occasionally returns a `suggestedCountry` or `suggestedIndustry`
 * that overruns the schema's max length (it works on retry), which throws a
 * Zod error and fails onboarding on the first try. Clamp overlong values to the
 * allowed length before validation — cutting on a word boundary when there is a
 * sensible one so the trimmed value stays readable rather than mid-word garbage.
 */
function clampLength(value: string, max: number) {
  if (value.length <= max) return value;
  const slice = value.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return trimmed.trim();
}

function createPlaceholderProfile(): GeneratedCreatorProfile {
  return generatedCreatorProfileSchema.parse({
    headline: "[Placeholder] B2B LinkedIn creator",
    suggestedCountry: "[Placeholder] Add your country",
    suggestedIndustries: ["Placeholder — B2B"],
    suggestedPricePerPostCents: 25_000,
    audienceSummary:
      "[Placeholder] AI analysis is unavailable. Replace this with a short description of the professionals you reach and the topics you are known for.",
  });
}

export async function generateCreatorProfile(
  linkedinUrl: string,
): Promise<CreatorProfileGeneration> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { profile: createPlaceholderProfile(), mode: "placeholder" };
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.responses.parse({
    model: "gpt-5-mini",
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content:
          "You are a precise B2B creator marketplace analyst. Research only public information about the supplied LinkedIn profile and prioritize evidence connected to that profile. Return a concise creator headline, a likely country, one to three industries, a reasonable suggested sponsored-post price in euro cents, and an audience/positioning summary. Do not invent follower counts, audience percentages, customers, credentials, or performance metrics. When evidence is thin, use cautious language and conservative pricing. Return plain text only inside every text field: no citations, source markers, URLs, markdown, or parenthetical links.",
      },
      {
        role: "user",
        content: `Analyze this public LinkedIn creator profile: ${linkedinUrl}`,
      },
    ],
    text: {
      format: zodTextFormat(generatedCreatorProfileSchema, "creator_profile"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no creator profile");
  }

  const sanitizedProfile = generatedCreatorProfileSchema.parse({
    headline: clampLength(stripSourceMarkers(response.output_parsed.headline), 180),
    suggestedCountry: clampLength(stripSourceMarkers(response.output_parsed.suggestedCountry), 80),
    suggestedIndustries: response.output_parsed.suggestedIndustries.map((industry) =>
      clampLength(stripSourceMarkers(industry), 60),
    ),
    suggestedPricePerPostCents: response.output_parsed.suggestedPricePerPostCents,
    audienceSummary: clampLength(stripSourceMarkers(response.output_parsed.audienceSummary), 600),
  });

  return { mode: "ai", profile: sanitizedProfile };
}
