import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreatorOverviewStats = {
  incomingInvites: number;
  activeCollaborations: number;
  totalEarningsCents: number;
  availableEarningsCents: number;
};

const activeStatuses = [
  "accepted",
  "brief_pending",
  "content_submitted",
  "revision_requested",
  "approved",
  "scheduled",
  "published",
] as const;

export async function getCreatorOverviewStats(
  creatorId: string,
): Promise<CreatorOverviewStats> {
  const supabase = await createServerSupabaseClient();
  const [{ data: collaborations, error: collaborationsError }, { data: payouts, error: payoutsError }] =
    await Promise.all([
      supabase
        .from("collaborations")
        .select("origin, status")
        .eq("creator_id", creatorId),
      supabase
        .from("payouts")
        .select("amount_cents, status")
        .eq("creator_id", creatorId),
    ]);

  if (collaborationsError) throw new Error("Unable to load creator collaborations");
  if (payoutsError) throw new Error("Unable to load creator earnings");

  return {
    incomingInvites: collaborations.filter(
      (collaboration) =>
        collaboration.origin === "brand_invite" && collaboration.status === "requested",
    ).length,
    activeCollaborations: collaborations.filter((collaboration) =>
      activeStatuses.includes(collaboration.status as (typeof activeStatuses)[number]),
    ).length,
    totalEarningsCents: payouts.reduce((total, payout) => total + payout.amount_cents, 0),
    availableEarningsCents: payouts
      .filter((payout) => payout.status === "available")
      .reduce((total, payout) => total + payout.amount_cents, 0),
  };
}
