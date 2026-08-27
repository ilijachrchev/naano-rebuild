import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  campaignBriefSchema,
  type BriefGenerationMode,
  type CampaignBriefFields,
} from "@/lib/campaigns/brief";
import type { Json } from "@/types/database";

type CampaignInput = {
  name: string;
  objective: string;
};

type BrandProfileInput = {
  workspaceName: string;
  website: string | null;
  tagline: string | null;
  industry: string | null;
  companySize: string | null;
  valueProp: string | null;
  description: string | null;
  productSummary: string | null;
  features: Json | null;
  differentiators: Json | null;
  icps: Json | null;
};

export type GeneratedCampaignBrief = {
  brief: CampaignBriefFields;
  mode: BriefGenerationMode;
};

function createPlaceholderBrief(campaign: CampaignInput): CampaignBriefFields {
  return {
    title: `[Placeholder] ${campaign.name}`,
    objectives: `Placeholder — shape this campaign around the saved objective: ${campaign.objective}`,
    keyMessages: [
      "Placeholder — state the clearest customer outcome the brand can support.",
      "Placeholder — connect that outcome to the audience described in the saved brand profile.",
      "Placeholder — end with one specific, measurable next step for the reader.",
    ],
    guidelines:
      "Placeholder — replace these notes after OPENAI_API_KEY is configured. Keep claims evidence-based, write for LinkedIn, and preserve the brand positioning saved in the workspace profile.",
  };
}

export async function generateCampaignBrief(
  campaign: CampaignInput,
  brandProfile: BrandProfileInput,
): Promise<GeneratedCampaignBrief> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { brief: createPlaceholderBrief(campaign), mode: "placeholder" };
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.responses.parse({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content:
          "You are a precise B2B LinkedIn campaign strategist. Create an editable creator brief from the supplied campaign objective and saved brand profile. Return a concise title, specific objectives, two to five evidence-based key messages, and practical creator guidelines. Do not invent customers, metrics, proof points, or product capabilities. Keep the output useful to a creator writing one sponsored LinkedIn post, and return plain text only inside every field.",
      },
      {
        role: "user",
        content: JSON.stringify({ campaign, brandProfile }),
      },
    ],
    text: {
      format: zodTextFormat(campaignBriefSchema, "campaign_brief"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no campaign brief");
  }

  return { brief: response.output_parsed, mode: "ai" };
}
