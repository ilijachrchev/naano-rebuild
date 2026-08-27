import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreatorProfile = {
  id: string;
  displayName: string;
  headline: string;
  country: string;
  followers: number;
  industries: string[];
  pricePerPostCents: number | null;
  estimatedImpressions: number;
  marketplaceVisible: boolean;
};

export type CreatorContext = {
  userId: string | null;
  creator: CreatorProfile | null;
};

export async function getCreatorContext(): Promise<CreatorContext> {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) return { userId: null, creator: null };

  const { data: creator, error } = await supabase
    .from("creators")
    .select(
      "id, display_name, headline, country, followers, industries, price_per_post_cents, est_impressions, marketplace_visible",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load creator profile");
  if (!creator) return { userId, creator: null };

  return {
    userId,
    creator: {
      id: creator.id,
      displayName: creator.display_name?.trim() || "Creator profile",
      headline: creator.headline?.trim() || "LinkedIn creator",
      country: creator.country?.trim() || "Location not set",
      followers: creator.followers ?? 0,
      industries: creator.industries ?? [],
      pricePerPostCents: creator.price_per_post_cents,
      estimatedImpressions: creator.est_impressions ?? 0,
      marketplaceVisible: creator.marketplace_visible ?? false,
    },
  };
}
