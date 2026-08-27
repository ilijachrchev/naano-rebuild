import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreatorOverviewStats = {
  incomingInvites: number;
  activeCollaborations: number;
  totalEarningsCents: number;
  availableEarningsCents: number;
};

export type IncomingInvite = {
  id: string;
  campaignName: string;
  objective: string | null;
  region: string | null;
  deliverables: string;
  postBy: string | null;
  approvalRequired: boolean;
  responseDeadline: string | null;
  expired: boolean;
  offer: {
    listPriceCents: number;
    feeCents: number;
    currency: string;
    expiresAt: string | null;
  };
};

export type CreatorPayout = {
  id: string;
  collaborationId: string | null;
  amountCents: number;
  status: "pending" | "in_transit" | "available" | "withdrawn";
  method: "bank" | "stripe" | null;
  createdAt: string | null;
  paidAt: string | null;
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

export async function getIncomingInvites(creatorId: string): Promise<IncomingInvite[]> {
  const supabase = await createServerSupabaseClient();
  const { data: collaborations, error: collaborationsError } = await supabase
    .from("collaborations")
    .select(
      "id, campaign_id, current_offer_id, deliverables, post_by, approval_required, respond_by",
    )
    .eq("creator_id", creatorId)
    .eq("origin", "brand_invite")
    .eq("status", "requested")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (collaborationsError) throw new Error("Unable to load incoming invitations");

  const offerIds = collaborations
    .map((collaboration) => collaboration.current_offer_id)
    .filter((id): id is string => Boolean(id));
  const campaignIds = collaborations
    .map((collaboration) => collaboration.campaign_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: offers, error: offersError }, { data: campaigns, error: campaignsError }] =
    await Promise.all([
      offerIds.length
        ? supabase
            .from("collaboration_offers")
            .select("id, list_price_cents, fee_cents, currency, expires_at")
            .in("id", offerIds)
        : Promise.resolve({ data: [], error: null }),
      campaignIds.length
        ? supabase
            .from("campaigns")
            .select("id, name, objective, region")
            .in("id", campaignIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (offersError) throw new Error("Unable to load invitation terms");
  if (campaignsError) throw new Error("Unable to load RLS-visible campaigns");

  const offersById = new Map(offers.map((offer) => [offer.id, offer]));
  const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));

  return collaborations.flatMap((collaboration) => {
    const offer = collaboration.current_offer_id
      ? offersById.get(collaboration.current_offer_id)
      : null;

    if (!offer) return [];

    const campaign = collaboration.campaign_id
      ? campaignsById.get(collaboration.campaign_id)
      : null;

    return [
      {
        id: collaboration.id,
        campaignName: campaign?.name ?? "Direct collaboration invite",
        objective: campaign?.objective ?? null,
        region: campaign?.region ?? null,
        deliverables: collaboration.deliverables?.trim() || "Sponsored LinkedIn post",
        postBy: collaboration.post_by,
        approvalRequired: collaboration.approval_required ?? false,
        responseDeadline: [collaboration.respond_by, offer.expires_at]
          .filter((deadline): deadline is string => Boolean(deadline))
          .sort()[0] ?? null,
        expired: [collaboration.respond_by, offer.expires_at].some(
          (deadline) => deadline !== null && new Date(deadline).getTime() <= Date.now(),
        ),
        offer: {
          listPriceCents: offer.list_price_cents,
          feeCents: offer.fee_cents,
          currency: offer.currency,
          expiresAt: offer.expires_at,
        },
      },
    ];
  });
}

export async function getCreatorPayouts(creatorId: string): Promise<CreatorPayout[]> {
  const supabase = await createServerSupabaseClient();
  const { data: payouts, error } = await supabase
    .from("payouts")
    .select("id, collaboration_id, amount_cents, status, method, created_at, paid_at")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load creator payouts");

  return payouts.map((payout) => ({
    id: payout.id,
    collaborationId: payout.collaboration_id,
    amountCents: payout.amount_cents,
    status: payout.status,
    method: payout.method,
    createdAt: payout.created_at,
    paidAt: payout.paid_at,
  }));
}
