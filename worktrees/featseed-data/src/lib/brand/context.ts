import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BrandContext = {
  userId: string | null;
  workspace: {
    id: string;
    name: string;
    website: string | null;
  } | null;
  brandProfile: {
    valueProp: string | null;
    icps: import("@/types/database").Json | null;
    scannedAt: string | null;
  } | null;
};

export async function getBrandContext(): Promise<BrandContext> {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) {
    return { userId: null, workspace: null, brandProfile: null };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error("Unable to load workspace membership");
  }

  if (!membership) {
    return { userId, workspace: null, brandProfile: null };
  }

  const [{ data: workspace, error: workspaceError }, { data: brandProfile, error: profileError }] =
    await Promise.all([
      supabase
        .from("workspaces")
        .select("id, name, website")
        .eq("id", membership.workspace_id)
        .maybeSingle(),
      supabase
        .from("brand_profiles")
        .select("value_prop, icps, scanned_at")
        .eq("workspace_id", membership.workspace_id)
        .maybeSingle(),
    ]);

  if (workspaceError || profileError) {
    throw new Error("Unable to load brand workspace");
  }

  return {
    userId,
    workspace,
    brandProfile: brandProfile
      ? {
          valueProp: brandProfile.value_prop,
          icps: brandProfile.icps,
          scannedAt: brandProfile.scanned_at,
        }
      : null,
  };
}

export function getBrandDestination(context: BrandContext) {
  if (!context.userId) return "/auth";
  if (!context.workspace) return "/brand/setup";
  if (!context.brandProfile?.scannedAt) {
    return `/brand/onboarding?workspace=${context.workspace.id}`;
  }
  return "/brand";
}
