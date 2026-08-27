"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  buildBriefContent,
  campaignBriefSchema,
  updateBriefContent,
} from "@/lib/campaigns/brief";
import { generateCampaignBrief } from "@/lib/campaigns/generate-brief";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CampaignActionState = {
  error: string | null;
  message?: string | null;
};

const createCampaignSchema = z.object({
  workspaceId: z.uuid(),
  name: z.string().trim().min(2, "Enter a campaign name.").max(120),
  objective: z
    .string()
    .trim()
    .min(10, "Describe the campaign objective in a little more detail.")
    .max(2_000),
  region: z.string().trim().max(80).optional(),
});

const generateBriefSchema = z.object({
  campaignId: z.uuid(),
});

const saveBriefSchema = campaignBriefSchema.extend({
  briefId: z.uuid(),
  campaignId: z.uuid(),
  status: z.enum(["draft", "ready"]),
});

async function getAuthenticatedClient() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub ?? null };
}

export async function createCampaignAction(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const parsed = createCampaignSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    objective: formData.get("objective"),
    region: formData.get("region") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the campaign details." };
  }

  const { supabase, userId } = await getAuthenticatedClient();
  if (!userId) redirect("/auth");

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", parsed.data.workspaceId)
    .maybeSingle();

  if (workspaceError || !workspace) {
    return { error: "We couldn't access that workspace." };
  }

  const admin = createAdminSupabaseClient();
  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .insert({
      workspace_id: workspace.id,
      name: parsed.data.name,
      objective: parsed.data.objective,
      region: parsed.data.region || null,
      channel: "linkedin",
      status: "draft",
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    return { error: "We couldn't save the campaign. Please try again." };
  }

  revalidatePath("/brand/campaigns");
  redirect(`/brand/campaigns?campaign=${campaign.id}`);
}

export async function generateBriefAction(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const parsed = generateBriefSchema.safeParse({ campaignId: formData.get("campaignId") });

  if (!parsed.success) return { error: "This campaign link is invalid." };

  const { supabase, userId } = await getAuthenticatedClient();
  if (!userId) redirect("/auth");

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, workspace_id, name, objective")
    .eq("id", parsed.data.campaignId)
    .maybeSingle();

  if (campaignError || !campaign?.workspace_id || !campaign.objective) {
    return { error: "We couldn't access that campaign or its objective." };
  }

  const [{ data: existingBrief, error: briefError }, { data: workspace }, { data: profile }] =
    await Promise.all([
      supabase
        .from("briefs")
        .select("id")
        .eq("campaign_id", campaign.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workspaces")
        .select("name, website")
        .eq("id", campaign.workspace_id)
        .maybeSingle(),
      supabase
        .from("brand_profiles")
        .select(
          "tagline, industry, company_size, value_prop, description, product_summary, features, differentiators, icps",
        )
        .eq("workspace_id", campaign.workspace_id)
        .maybeSingle(),
    ]);

  if (briefError) return { error: "We couldn't check this campaign's brief." };
  if (existingBrief) redirect(`/brand/campaigns?campaign=${campaign.id}`);
  if (!workspace || !profile) {
    return { error: "Complete and save the workspace brand profile before creating a brief." };
  }

  let generated;

  try {
    generated = await generateCampaignBrief(
      { name: campaign.name, objective: campaign.objective },
      {
        workspaceName: workspace.name,
        website: workspace.website,
        tagline: profile.tagline,
        industry: profile.industry,
        companySize: profile.company_size,
        valueProp: profile.value_prop,
        description: profile.description,
        productSummary: profile.product_summary,
        features: profile.features,
        differentiators: profile.differentiators,
        icps: profile.icps,
      },
    );
  } catch (error) {
    console.error("Campaign brief generation failed", error);
    return { error: "We couldn't generate the brief just now. Please try again." };
  }

  const admin = createAdminSupabaseClient();
  const { error: saveError } = await admin.from("briefs").insert({
    campaign_id: campaign.id,
    workspace_id: campaign.workspace_id,
    title: generated.brief.title,
    source: "ai",
    objectives: generated.brief.objectives,
    key_messages: generated.brief.keyMessages,
    guidelines: generated.brief.guidelines,
    content: buildBriefContent(generated.brief, generated.mode),
    status: "draft",
  });

  if (saveError) {
    return { error: "The brief was generated, but we couldn't save it. Please try again." };
  }

  revalidatePath("/brand/campaigns");
  redirect(`/brand/campaigns?campaign=${campaign.id}`);
}

export async function saveBriefAction(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const keyMessages = String(formData.get("keyMessages") ?? "")
    .split("\n")
    .map((message) => message.trim())
    .filter(Boolean);
  const parsed = saveBriefSchema.safeParse({
    briefId: formData.get("briefId"),
    campaignId: formData.get("campaignId"),
    title: formData.get("title"),
    objectives: formData.get("objectives"),
    keyMessages,
    guidelines: formData.get("guidelines"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the brief details." };
  }

  const { supabase, userId } = await getAuthenticatedClient();
  if (!userId) redirect("/auth");

  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("id, campaign_id, workspace_id, content")
    .eq("id", parsed.data.briefId)
    .eq("campaign_id", parsed.data.campaignId)
    .maybeSingle();

  if (briefError || !brief?.workspace_id) {
    return { error: "We couldn't access that brief." };
  }

  const fields = {
    title: parsed.data.title,
    objectives: parsed.data.objectives,
    keyMessages: parsed.data.keyMessages,
    guidelines: parsed.data.guidelines,
  };
  const admin = createAdminSupabaseClient();
  const { error: saveError } = await admin
    .from("briefs")
    .update({
      title: fields.title,
      objectives: fields.objectives,
      key_messages: fields.keyMessages,
      guidelines: fields.guidelines,
      content: updateBriefContent(brief.content, fields),
      status: parsed.data.status,
    })
    .eq("id", brief.id)
    .eq("campaign_id", parsed.data.campaignId)
    .eq("workspace_id", brief.workspace_id);

  if (saveError) return { error: "We couldn't save the brief. Please try again." };

  revalidatePath("/brand/campaigns");
  return { error: null, message: "Brief saved." };
}
