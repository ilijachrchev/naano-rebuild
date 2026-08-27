import "server-only";

import {
  getBriefGenerationMode,
  getPlaceholderBaseline,
  parseKeyMessages,
  type BriefGenerationMode,
  type CampaignBriefFields,
} from "@/lib/campaigns/brief";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CampaignListItem = {
  id: string;
  name: string;
  objective: string;
  region: string | null;
  status: string;
  createdAt: string | null;
};

export type EditableBrief = {
  id: string;
  campaignId: string;
  title: string;
  objectives: string;
  keyMessages: string[];
  guidelines: string;
  status: "draft" | "ready";
  generationMode: BriefGenerationMode;
  placeholderBaseline: CampaignBriefFields | null;
};

export type CampaignsData = {
  campaigns: CampaignListItem[];
  briefsByCampaignId: Record<string, EditableBrief>;
};

export async function loadCampaignsData(workspaceId: string): Promise<CampaignsData> {
  const supabase = await createServerSupabaseClient();
  const [{ data: campaigns, error: campaignsError }, { data: briefs, error: briefsError }] =
    await Promise.all([
      supabase
        .from("campaigns")
        .select("id, name, objective, region, status, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("briefs")
        .select(
          "id, campaign_id, title, objectives, key_messages, guidelines, status, content, created_at",
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
    ]);

  if (campaignsError || briefsError) {
    throw new Error("Unable to load campaigns");
  }

  const briefsByCampaignId: Record<string, EditableBrief> = {};

  for (const brief of briefs ?? []) {
    if (!brief.campaign_id || briefsByCampaignId[brief.campaign_id]) continue;

    const generationMode = getBriefGenerationMode(brief.content);

    briefsByCampaignId[brief.campaign_id] = {
      id: brief.id,
      campaignId: brief.campaign_id,
      title: brief.title ?? "Untitled brief",
      objectives: brief.objectives ?? "",
      keyMessages: parseKeyMessages(brief.key_messages),
      guidelines: brief.guidelines ?? "",
      status: brief.status === "ready" && generationMode !== "placeholder" ? "ready" : "draft",
      generationMode,
      placeholderBaseline: getPlaceholderBaseline(brief.content),
    };
  }

  return {
    campaigns: (campaigns ?? []).map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      objective: campaign.objective ?? "",
      region: campaign.region,
      status: campaign.status ?? "draft",
      createdAt: campaign.created_at,
    })),
    briefsByCampaignId,
  };
}
