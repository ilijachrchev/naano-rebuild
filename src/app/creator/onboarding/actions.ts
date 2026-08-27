"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateCreatorProfile } from "@/lib/ai/generate-creator-profile";
import {
  creatorListingSchema,
  linkedinProfileUrlSchema,
  type CreatorGenerationMode,
  type CreatorOnboardingDraft,
} from "@/lib/creator/onboarding";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type GenerateCreatorProfileState = {
  error: string | null;
  draft: CreatorOnboardingDraft | null;
  mode: CreatorGenerationMode | null;
};

export type CreateCreatorState = {
  error: string | null;
};

async function getAuthenticatedUserId() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  if (!userId) return { supabase, userId: null, registeredAsCreator: false };

  const { data: userData, error } = await supabase.auth.getUser();
  return {
    supabase,
    userId,
    registeredAsCreator: !error && userData.user.app_metadata?.role === "creator",
  };
}

export async function generateCreatorProfileAction(
  _previousState: GenerateCreatorProfileState,
  formData: FormData,
): Promise<GenerateCreatorProfileState> {
  const parsedUrl = linkedinProfileUrlSchema.safeParse(formData.get("linkedinUrl"));

  if (!parsedUrl.success) {
    return {
      error: parsedUrl.error.issues[0]?.message ?? "Check your LinkedIn profile URL.",
      draft: null,
      mode: null,
    };
  }

  const { supabase, userId, registeredAsCreator } = await getAuthenticatedUserId();
  if (!userId) redirect("/creator/auth");

  const { data: existingCreator, error: creatorError } = await supabase
    .from("creators")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (creatorError) {
    return { error: "We couldn't check your creator profile.", draft: null, mode: null };
  }
  if (existingCreator) redirect("/creator");
  if (!registeredAsCreator) redirect("/auth");

  try {
    const generation = await generateCreatorProfile(parsedUrl.data);
    return {
      error: null,
      draft: { linkedinUrl: parsedUrl.data, ...generation.profile },
      mode: generation.mode,
    };
  } catch (error) {
    console.error("Creator profile generation failed", error);
    return {
      error: "We couldn't analyze that public profile just now. Check the URL and try again.",
      draft: null,
      mode: null,
    };
  }
}

export async function createCreatorAction(
  _previousState: CreateCreatorState,
  formData: FormData,
): Promise<CreateCreatorState> {
  const parsed = creatorListingSchema.safeParse({
    linkedinUrl: formData.get("linkedinUrl"),
    headline: formData.get("headline"),
    audienceSummary: formData.get("audienceSummary"),
    country: formData.get("country"),
    industries: formData.getAll("industries"),
    pricePerPostCents: formData.get("pricePerPost"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your creator listing details.",
    };
  }

  const { supabase, userId, registeredAsCreator } = await getAuthenticatedUserId();
  if (!userId) redirect("/creator/auth");

  const [{ data: existingCreator, error: creatorError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase.from("creators").select("id").eq("id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);

  if (creatorError || profileError) {
    return { error: "We couldn't verify your account details." };
  }
  if (existingCreator) redirect("/creator");
  if (!registeredAsCreator) redirect("/auth");

  const displayName = profile?.full_name?.trim();
  if (!displayName) {
    return { error: "Your account needs a name before we can publish your creator card." };
  }

  const admin = createAdminSupabaseClient();
  const { data: creator, error: insertError } = await admin
    .from("creators")
    .insert({
      id: userId,
      display_name: displayName,
      headline: parsed.data.headline,
      country: parsed.data.country,
      linkedin_url: parsed.data.linkedinUrl,
      followers: 0,
      industries: parsed.data.industries,
      price_per_post_cents: parsed.data.pricePerPostCents,
      est_impressions: 0,
      audience_snapshot: {
        positioning_summary: parsed.data.audienceSummary,
        job_title: {},
        seniority: {},
      },
      match_default: 0,
      marketplace_visible: true,
    })
    .select("id")
    .single();

  if (insertError || creator?.id !== userId) {
    console.error("Creator listing creation failed", insertError);
    return { error: "We couldn't publish your creator card. Please try again." };
  }

  revalidatePath("/creator");
  revalidatePath("/brand/creators");
  redirect("/creator");
}
