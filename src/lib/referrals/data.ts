import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculatePerformanceReward, type PerformanceReward } from "@/lib/referrals/reward";

type ReferralStatusMetadata = {
  brandName?: string;
  state?: string;
  workspaceId?: string;
};

export type ReferralBrand = {
  id: string;
  brandName: string;
  status: string;
  rewardMonths: number;
  reward: PerformanceReward;
  source: "live" | "demo";
};

export type CreatorReferralProgram = {
  code: string;
  codeSource: "live" | "demo";
  referrals: ReferralBrand[];
};

const demoReferrals = [
  {
    id: "demo-voltara",
    brandName: "Voltara Systems",
    status: "Campaign active",
    rewardMonths: 3,
    baseRatePct: 25,
    qualifiedClicks: 184,
  },
  {
    id: "demo-northstar",
    brandName: "Northstar Ops",
    status: "First campaign live",
    rewardMonths: 3,
    baseRatePct: 25,
    qualifiedClicks: 67,
  },
] as const;

export async function getCreatorReferralProgram({
  creatorId,
  creatorName,
}: {
  creatorId: string;
  creatorName: string;
}): Promise<CreatorReferralProgram> {
  const supabase = await createServerSupabaseClient();
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select("id, code, status, reward_pct, reward_months, created_at")
    .eq("referrer_id", creatorId)
    .eq("invited_type", "brand")
    .order("created_at", { ascending: false });

  if (referralsError) throw new Error("Unable to load creator referrals");

  const metadataByReferralId = new Map(
    referrals.map((referral) => [referral.id, parseReferralStatus(referral.status)]),
  );
  const workspaceIds = [
    ...new Set(
      [...metadataByReferralId.values()]
        .map((metadata) => metadata.workspaceId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const qualifiedClickDatesByWorkspace = await getQualifiedClickDatesByWorkspace({
    workspaceIds,
  });

  const liveReferrals = referrals.map((referral, index): ReferralBrand => {
    const metadata = metadataByReferralId.get(referral.id) ?? {};
    const rewardMonths = referral.reward_months ?? 3;
    const qualifiedClicks = metadata.workspaceId
      ? countClicksInRewardWindow({
          occurredAt: qualifiedClickDatesByWorkspace.get(metadata.workspaceId) ?? [],
          referralCreatedAt: referral.created_at,
          rewardMonths,
        })
      : 0;

    return {
      id: referral.id,
      brandName: metadata.brandName?.trim() || `Brand referral ${String(index + 1).padStart(2, "0")}`,
      status: formatStatus(metadata.state ?? referral.status),
      rewardMonths,
      reward: calculatePerformanceReward({
        baseRatePct: referral.reward_pct ?? 25,
        qualifiedClicks,
      }),
      source: "live",
    };
  });

  const liveCode = referrals.find((referral) => referral.code?.trim())?.code?.trim();

  return {
    code: liveCode ?? createDemoCode(creatorName, creatorId),
    codeSource: liveCode ? "live" : "demo",
    referrals: [
      ...liveReferrals,
      ...demoReferrals.map(
        (referral): ReferralBrand => ({
          id: referral.id,
          brandName: referral.brandName,
          status: referral.status,
          rewardMonths: referral.rewardMonths,
          reward: calculatePerformanceReward({
            baseRatePct: referral.baseRatePct,
            qualifiedClicks: referral.qualifiedClicks,
          }),
          source: "demo",
        }),
      ),
    ],
  };
}

async function getQualifiedClickDatesByWorkspace({
  workspaceIds,
}: {
  workspaceIds: string[];
}) {
  const clickDatesByWorkspace = new Map<string, string[]>();
  if (workspaceIds.length === 0) return clickDatesByWorkspace;

  const supabase = await createServerSupabaseClient();
  const { data: collaborations, error: collaborationsError } = await supabase
    .from("collaborations")
    .select("id, workspace_id")
    .in("workspace_id", workspaceIds)
    .is("deleted_at", null);

  if (collaborationsError) throw new Error("Unable to load referral attribution links");
  if (collaborations.length === 0) return clickDatesByWorkspace;

  const workspaceByCollaboration = new Map(
    collaborations.map((collaboration) => [collaboration.id, collaboration.workspace_id]),
  );
  const { data: trackingLinks, error: trackingLinksError } = await supabase
    .from("tracking_links")
    .select("id, collaboration_id")
    .in("collaboration_id", [...workspaceByCollaboration.keys()]);

  if (trackingLinksError) throw new Error("Unable to load referral attribution links");
  if (trackingLinks.length === 0) return clickDatesByWorkspace;

  const workspaceByTrackingLink = new Map(
    trackingLinks.map((link) => [link.id, workspaceByCollaboration.get(link.collaboration_id)]),
  );
  const { data: clicks, error: clicksError } = await supabase
    .from("click_events")
    .select("tracking_link_id, occurred_at")
    .in("tracking_link_id", [...workspaceByTrackingLink.keys()])
    .eq("is_qualified", true);

  if (clicksError) throw new Error("Unable to load RLS-visible qualified clicks");

  for (const click of clicks) {
    const workspaceId = workspaceByTrackingLink.get(click.tracking_link_id);
    if (!workspaceId) continue;
    const dates = clickDatesByWorkspace.get(workspaceId);
    if (dates) dates.push(click.occurred_at);
    else clickDatesByWorkspace.set(workspaceId, [click.occurred_at]);
  }

  return clickDatesByWorkspace;
}

function countClicksInRewardWindow({
  occurredAt,
  referralCreatedAt,
  rewardMonths,
}: {
  occurredAt: string[];
  referralCreatedAt: string | null;
  rewardMonths: number;
}) {
  if (!referralCreatedAt) return occurredAt.length;

  const periodStart = new Date(referralCreatedAt);
  if (Number.isNaN(periodStart.getTime())) return occurredAt.length;

  const periodEnd = new Date(periodStart);
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + Math.max(0, rewardMonths));

  return occurredAt.filter((value) => {
    const clickDate = new Date(value);
    return clickDate >= periodStart && clickDate < periodEnd;
  }).length;
}

function parseReferralStatus(value: string | null): ReferralStatusMetadata {
  if (!value?.trim().startsWith("{")) return { state: value ?? "pending" };

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      brandName: typeof parsed.brandName === "string" ? parsed.brandName : undefined,
      state: typeof parsed.state === "string" ? parsed.state : undefined,
      workspaceId: typeof parsed.workspaceId === "string" ? parsed.workspaceId : undefined,
    };
  } catch {
    return { state: value };
  }
}

function formatStatus(status: string | null) {
  return (status?.trim() || "pending")
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function createDemoCode(creatorName: string, creatorId: string) {
  const namePart = creatorName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12)
    .toUpperCase();
  return `NAANO-${namePart || "CREATOR"}-${creatorId.slice(0, 4).toUpperCase()}`;
}
