import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  generatedBrandProfileSchema,
  type GeneratedBrandProfile,
} from "@/lib/brand/profile";

function stripSourceMarkers(value: string) {
  return value
    .replace(/\s*\(\s*\[[^\]]+\]\s*\(https?:\/\/[^)]+\)\s*\)/gi, "")
    .replace(/\s*\[[^\]]+\]\s*\(https?:\/\/[^)]+\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateBrandProfile(
  website: string,
): Promise<GeneratedBrandProfile> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.responses.parse({
    model: "gpt-5-mini",
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content:
          "You are a precise B2B positioning analyst. Research the supplied company website and prioritize evidence from that domain. Return one value proposition of at most 28 words and exactly three distinct ideal customer profiles. Keep every field concise, specific, and useful for matching the brand with LinkedIn creators. Do not invent customers, metrics, or capabilities; when evidence is thin, describe the narrowest defensible positioning. Return plain text only inside every field: no citations, source markers, URLs, markdown, or parenthetical links.",
      },
      {
        role: "user",
        content: `Analyze this company website: ${website}`,
      },
    ],
    text: {
      format: zodTextFormat(generatedBrandProfileSchema, "brand_profile"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no brand profile");
  }

  return {
    valueProp: stripSourceMarkers(response.output_parsed.valueProp),
    icps: response.output_parsed.icps.map((icp) => ({
      role: stripSourceMarkers(icp.role),
      companyType: stripSourceMarkers(icp.companyType),
      pain: stripSourceMarkers(icp.pain),
      productFit: stripSourceMarkers(icp.productFit),
      tags: icp.tags.map(stripSourceMarkers),
    })),
  };
}
