import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

export const PIPELINE_STAGES = [
  "requested",
  "negotiating",
  "accepted",
  "published",
  "completed",
  "declined",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export type PipelineFilter = "all" | PipelineStage;
export type CollaborationStatus = Enums<"collab_status">;

export type CollaborationMoney = {
  cents: number;
  currency: string;
};

export type BrandCollaborationListItem = {
  id: string;
  creator: {
    id: string;
    displayName: string;
    headline: string;
  };
  campaign: {
    id: string;
    name: string;
  } | null;
  origin: Enums<"collab_origin">;
  status: CollaborationStatus;
  statusLabel: string;
  stage: PipelineStage;
  offeredAmount: CollaborationMoney | null;
  postBy: string | null;
  nextAction: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BrandCollaborationPipeline = {
  activeFilter: PipelineFilter;
  counts: Record<PipelineStage, number>;
  total: number;
  items: BrandCollaborationListItem[];
};

export type CollaborationOfferHistoryItem = {
  id: string;
  proposerRole: Enums<"user_role">;
  offeredAmount: CollaborationMoney;
  listPrice: CollaborationMoney;
  createdAt: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  isCurrent: boolean;
  isAccepted: boolean;
};

export type CollaborationTimelineItem = {
  id: string;
  type: string;
  label: string;
  actorRole: "brand" | "creator" | "system";
  createdAt: string | null;
};

export type BrandCollaborationDetail = BrandCollaborationListItem & {
  offerType: Enums<"offer_type"> | null;
  deliverables: string | null;
  approvalRequired: boolean;
  respondBy: string | null;
  publishedAt: string | null;
  offers: CollaborationOfferHistoryItem[];
  timeline: CollaborationTimelineItem[];
};

type CollaborationRow = Pick<
  Tables<"collaborations">,
  | "id"
  | "workspace_id"
  | "creator_id"
  | "campaign_id"
  | "brief_id"
  | "origin"
  | "offer_type"
  | "current_offer_id"
  | "accepted_offer_id"
  | "deliverables"
  | "post_by"
  | "approval_required"
  | "status"
  | "respond_by"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

type CreatorRow = Pick<Tables<"creators">, "id" | "display_name" | "headline">;
type CampaignRow = Pick<Tables<"campaigns">, "id" | "name">;
type OfferRow = Pick<
  Tables<"collaboration_offers">,
  | "id"
  | "collaboration_id"
  | "proposer_role"
  | "list_price_cents"
  | "fee_cents"
  | "currency"
  | "expires_at"
  | "accepted_at"
  | "created_at"
>;
type EventRow = Pick<
  Tables<"collaboration_events">,
  "id" | "actor_id" | "type" | "created_at"
>;

const statusLabels: Record<CollaborationStatus, string> = {
  requested: "Requested",
  negotiating: "Negotiating",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
  expired: "Expired",
  brief_pending: "Brief pending",
  content_submitted: "Content submitted",
  revision_requested: "Revision requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusStages: Record<CollaborationStatus, PipelineStage> = {
  requested: "requested",
  negotiating: "negotiating",
  accepted: "accepted",
  brief_pending: "accepted",
  content_submitted: "accepted",
  revision_requested: "accepted",
  approved: "accepted",
  scheduled: "accepted",
  published: "published",
  completed: "completed",
  declined: "declined",
  withdrawn: "declined",
  expired: "declined",
  cancelled: "declined",
};

const eventLabels: Record<string, string> = {
  offer_made: "Offer made",
  countered: "Counter-offer made",
  accepted: "Offer accepted",
  declined: "Collaboration declined",
  withdrawn: "Request withdrawn",
  expired: "Request expired",
  brief_pending: "Brief requested",
  content_submitted: "Content submitted",
  revision_requested: "Revision requested",
  approved: "Content approved",
  scheduled: "Post scheduled",
  published: "Post published",
  completed: "Collaboration completed",
  cancelled: "Collaboration cancelled",
};

function normalizeFilter(value: string | undefined): PipelineFilter {
  return PIPELINE_STAGES.includes(value as PipelineStage) ? (value as PipelineStage) : "all";
}

function getNextAction(
  collaboration: CollaborationRow,
  latestOffer: OfferRow | undefined,
): string {
  switch (collaboration.status) {
    case "requested":
      return collaboration.origin === "creator_application"
        ? "Review application"
        : "Await creator response";
    case "negotiating":
      return latestOffer?.proposer_role === "creator"
        ? "Review counter-offer"
        : "Await creator response";
    case "accepted":
      return collaboration.brief_id ? "Await creator content" : "Attach campaign brief";
    case "brief_pending":
      return "Finalize campaign brief";
    case "content_submitted":
      return "Review submitted content";
    case "revision_requested":
      return "Await creator revision";
    case "approved":
    case "scheduled":
      return "Await publication";
    case "published":
      return "Review attributed results";
    case "completed":
      return "No action required";
    case "declined":
    case "withdrawn":
    case "expired":
    case "cancelled":
      return "Closed";
  }
}

function compareNullableDates(left: string | null, right: string | null, ascending: boolean) {
  if (left === right) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return ascending ? left.localeCompare(right) : right.localeCompare(left);
}

function getOffersByCollaboration(offers: OfferRow[]) {
  const result = new Map<string, OfferRow[]>();

  for (const offer of offers) {
    const collaborationOffers = result.get(offer.collaboration_id) ?? [];
    collaborationOffers.push(offer);
    result.set(offer.collaboration_id, collaborationOffers);
  }

  for (const collaborationOffers of result.values()) {
    collaborationOffers.sort(
      (left, right) =>
        right.created_at.localeCompare(left.created_at) || right.id.localeCompare(left.id),
    );
  }

  return result;
}

function toListItem(
  collaboration: CollaborationRow,
  creator: CreatorRow | undefined,
  campaign: CampaignRow | undefined,
  offers: OfferRow[],
): BrandCollaborationListItem {
  const offersById = new Map(offers.map((offer) => [offer.id, offer]));
  const acceptedOffer = collaboration.accepted_offer_id
    ? offersById.get(collaboration.accepted_offer_id)
    : undefined;
  const currentOffer = collaboration.current_offer_id
    ? offersById.get(collaboration.current_offer_id)
    : undefined;
  const latestOffer = currentOffer ?? offers[0];
  const canonicalOffer = acceptedOffer ?? latestOffer;

  return {
    id: collaboration.id,
    creator: {
      id: collaboration.creator_id,
      displayName: creator?.display_name?.trim() || "Creator profile",
      headline: creator?.headline?.trim() || "LinkedIn creator",
    },
    campaign: collaboration.campaign_id
      ? {
          id: collaboration.campaign_id,
          name: campaign?.name.trim() || "Campaign unavailable",
        }
      : null,
    origin: collaboration.origin,
    status: collaboration.status,
    statusLabel: statusLabels[collaboration.status],
    stage: statusStages[collaboration.status],
    offeredAmount: canonicalOffer
      ? { cents: canonicalOffer.fee_cents, currency: canonicalOffer.currency }
      : null,
    postBy: collaboration.post_by,
    nextAction: getNextAction(collaboration, latestOffer),
    createdAt: collaboration.created_at,
    updatedAt: collaboration.updated_at,
  };
}

function sortPipelineItems(items: BrandCollaborationListItem[]) {
  const stageOrder = new Map(PIPELINE_STAGES.map((stage, index) => [stage, index]));

  return items.sort(
    (left, right) =>
      (stageOrder.get(left.stage) ?? 0) - (stageOrder.get(right.stage) ?? 0) ||
      compareNullableDates(left.postBy, right.postBy, true) ||
      compareNullableDates(left.updatedAt, right.updatedAt, false) ||
      left.id.localeCompare(right.id),
  );
}

async function loadRelatedRows(collaborations: CollaborationRow[]) {
  const supabase = await createServerSupabaseClient();
  const creatorIds = [...new Set(collaborations.map((row) => row.creator_id))];
  const campaignIds = [
    ...new Set(
      collaborations
        .map((row) => row.campaign_id)
        .filter((id): id is string => id !== null),
    ),
  ];
  const collaborationIds = collaborations.map((row) => row.id);

  const [creatorResult, campaignResult, offerResult] = await Promise.all([
    creatorIds.length
      ? supabase.from("creators").select("id, display_name, headline").in("id", creatorIds)
      : Promise.resolve({ data: [] as CreatorRow[], error: null }),
    campaignIds.length
      ? supabase.from("campaigns").select("id, name").in("id", campaignIds)
      : Promise.resolve({ data: [] as CampaignRow[], error: null }),
    collaborationIds.length
      ? supabase
          .from("collaboration_offers")
          .select(
            "id, collaboration_id, proposer_role, list_price_cents, fee_cents, currency, expires_at, accepted_at, created_at",
          )
          .in("collaboration_id", collaborationIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as OfferRow[], error: null }),
  ]);

  if (creatorResult.error || campaignResult.error || offerResult.error) {
    throw new Error("Unable to load collaboration relationships");
  }

  return {
    creatorsById: new Map((creatorResult.data ?? []).map((row) => [row.id, row])),
    campaignsById: new Map((campaignResult.data ?? []).map((row) => [row.id, row])),
    offersByCollaboration: getOffersByCollaboration(offerResult.data ?? []),
  };
}

export async function loadBrandCollaborationPipeline({
  workspaceId,
  status,
}: {
  workspaceId: string;
  status?: string;
}): Promise<BrandCollaborationPipeline> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select(
      "id, workspace_id, creator_id, campaign_id, brief_id, origin, offer_type, current_offer_id, accepted_offer_id, deliverables, post_by, approval_required, status, respond_by, published_at, created_at, updated_at",
    )
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error("Unable to load collaborations");

  const collaborations = data ?? [];
  const { creatorsById, campaignsById, offersByCollaboration } =
    await loadRelatedRows(collaborations);
  const allItems = sortPipelineItems(
    collaborations.map((collaboration) =>
      toListItem(
        collaboration,
        creatorsById.get(collaboration.creator_id),
        collaboration.campaign_id ? campaignsById.get(collaboration.campaign_id) : undefined,
        offersByCollaboration.get(collaboration.id) ?? [],
      ),
    ),
  );
  const activeFilter = normalizeFilter(status);
  const counts = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage, 0])) as Record<
    PipelineStage,
    number
  >;

  for (const item of allItems) counts[item.stage] += 1;

  return {
    activeFilter,
    counts,
    total: allItems.length,
    items:
      activeFilter === "all"
        ? allItems
        : allItems.filter((item) => item.stage === activeFilter),
  };
}

function toOfferHistory(
  offers: OfferRow[],
  currentOfferId: string | null,
  acceptedOfferId: string | null,
): CollaborationOfferHistoryItem[] {
  return offers.map((offer) => ({
    id: offer.id,
    proposerRole: offer.proposer_role,
    offeredAmount: { cents: offer.fee_cents, currency: offer.currency },
    listPrice: { cents: offer.list_price_cents, currency: offer.currency },
    createdAt: offer.created_at,
    expiresAt: offer.expires_at,
    acceptedAt: offer.accepted_at,
    isCurrent: offer.id === currentOfferId,
    isAccepted: offer.id === acceptedOfferId,
  }));
}

function toTimeline(events: EventRow[], creatorId: string): CollaborationTimelineItem[] {
  return events
    .map((event) => ({
      id: event.id,
      type: event.type,
      label: eventLabels[event.type] ?? event.type.replaceAll("_", " "),
      actorRole:
        event.actor_id === null
          ? ("system" as const)
          : event.actor_id === creatorId
            ? ("creator" as const)
            : ("brand" as const),
      createdAt: event.created_at,
    }))
    .sort(
      (left, right) =>
        compareNullableDates(left.createdAt, right.createdAt, true) ||
        left.id.localeCompare(right.id),
    );
}

export async function loadBrandCollaborationDetail({
  workspaceId,
  collaborationId,
}: {
  workspaceId: string;
  collaborationId: string;
}): Promise<BrandCollaborationDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data: collaboration, error: collaborationError } = await supabase
    .from("collaborations")
    .select(
      "id, workspace_id, creator_id, campaign_id, brief_id, origin, offer_type, current_offer_id, accepted_offer_id, deliverables, post_by, approval_required, status, respond_by, published_at, created_at, updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("id", collaborationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (collaborationError) throw new Error("Unable to load collaboration");
  if (!collaboration) return null;

  const [creatorResult, campaignResult, offerResult, eventResult] = await Promise.all([
    supabase
      .from("creators")
      .select("id, display_name, headline")
      .eq("id", collaboration.creator_id)
      .maybeSingle(),
    collaboration.campaign_id
      ? supabase
          .from("campaigns")
          .select("id, name")
          .eq("id", collaboration.campaign_id)
          .maybeSingle()
      : Promise.resolve({ data: null as CampaignRow | null, error: null }),
    supabase
      .from("collaboration_offers")
      .select(
        "id, collaboration_id, proposer_role, list_price_cents, fee_cents, currency, expires_at, accepted_at, created_at",
      )
      .eq("collaboration_id", collaboration.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("collaboration_events")
      .select("id, actor_id, type, created_at")
      .eq("collaboration_id", collaboration.id)
      .order("created_at", { ascending: true, nullsFirst: false }),
  ]);

  if (creatorResult.error || campaignResult.error || offerResult.error || eventResult.error) {
    throw new Error("Unable to load collaboration details");
  }

  const offers = offerResult.data ?? [];
  const listItem = toListItem(
    collaboration,
    creatorResult.data ?? undefined,
    campaignResult.data ?? undefined,
    offers,
  );

  return {
    ...listItem,
    offerType: collaboration.offer_type,
    deliverables: collaboration.deliverables,
    approvalRequired: collaboration.approval_required ?? false,
    respondBy: collaboration.respond_by,
    publishedAt: collaboration.published_at,
    offers: toOfferHistory(
      offers,
      collaboration.current_offer_id,
      collaboration.accepted_offer_id,
    ),
    timeline: toTimeline(eventResult.data ?? [], collaboration.creator_id),
  };
}
