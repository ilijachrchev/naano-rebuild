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

  return {
    mode: "ai",
    profile: {
      headline: stripSourceMarkers(response.output_parsed.headline),
      suggestedCountry: stripSourceMarkers(response.output_parsed.suggestedCountry),
      suggestedIndustries: response.output_parsed.suggestedIndustries.map(stripSourceMarkers),
      suggestedPricePerPostCents: response.output_parsed.suggestedPricePerPostCents,
      audienceSummary: stripSourceMarkers(response.output_parsed.audienceSummary),
    },
  };
}
