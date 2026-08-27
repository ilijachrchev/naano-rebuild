"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { generateBrandProfile } from "@/lib/ai/generate-brand-profile";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FormActionState = {
  error: string | null;
};

const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Enter your company name.").max(120),
  website: z
    .string()
    .trim()
    .min(1, "Enter your company website.")
    .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
    .pipe(
      z
        .url("Enter a valid company website.")
        .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
          message: "Enter an HTTP or HTTPS website.",
        }),
    ),
});

const onboardingSchema = z.object({
  workspaceId: z.uuid(),
});

async function getAuthenticatedUserId() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  if (!userId) return { supabase, userId: null, accountRole: null };

  const { data: userData, error } = await supabase.auth.getUser();
  return {
    supabase,
    userId,
    accountRole: error ? null : userData.user.app_metadata?.role,
  };
}

export async function createWorkspaceAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your workspace details." };
  }

  const { supabase, userId, accountRole } = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/auth");
  }
  if (accountRole === "creator") {
    redirect("/creator/onboarding");
  }

  const { data: existingMembership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    redirect(`/brand/onboarding?workspace=${existingMembership.workspace_id}`);
  }

  const admin = createAdminSupabaseClient();
  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({
      name: parsed.data.name,
      website: parsed.data.website,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (workspaceError || !workspace) {
    return { error: "We couldn't create your workspace. Please try again." };
  }

  const { error: membershipError } = await admin.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
  });

  if (membershipError) {
    await admin.from("workspaces").delete().eq("id", workspace.id);
    return { error: "We couldn't finish your workspace setup. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(`/brand/onboarding?workspace=${workspace.id}`);
}

export async function generateBrandProfileAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const parsed = onboardingSchema.safeParse({ workspaceId: formData.get("workspaceId") });

  if (!parsed.success) {
    return { error: "This workspace link is invalid. Return to setup and try again." };
  }

  const { supabase, userId, accountRole } = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/auth");
  }
  if (accountRole === "creator") {
    redirect("/creator");
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, website")
    .eq("id", parsed.data.workspaceId)
    .maybeSingle();

  if (workspaceError || !workspace?.website) {
    return { error: "We couldn't access that workspace or its website." };
  }

  let generatedProfile;

  try {
    generatedProfile = await generateBrandProfile(workspace.website);
  } catch (error) {
    console.error("Brand profile generation failed", error);
    return {
      error: "We couldn't analyze that website just now. Check the URL and try again.",
    };
  }

  const admin = createAdminSupabaseClient();
  const { error: saveError } = await admin.from("brand_profiles").upsert({
    workspace_id: workspace.id,
    value_prop: generatedProfile.valueProp,
    icps: generatedProfile.icps,
    scanned_at: new Date().toISOString(),
  });

  if (saveError) {
    return { error: "Your profile was generated, but we couldn't save it. Please try again." };
  }

  revalidatePath("/brand");
  redirect("/brand");
}
