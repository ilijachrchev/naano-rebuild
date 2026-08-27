import "server-only";

import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const percentageBreakdownSchema = z.record(z.string(), z.number().min(0).max(100));

const audienceSnapshotSchema = z
  .object({
    job_title: percentageBreakdownSchema.optional(),
    jobTitle: percentageBreakdownSchema.optional(),
    seniority: percentageBreakdownSchema.optional(),
    sample_n: z.number().int().nonnegative().optional(),
    sampleN: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export type AudienceSegment = {
  label: string;
  percentage: number;
};

export type MarketplaceCreator = {
  id: string;
  displayName: string;
  avatarInitials: string;
  headline: string;
  country: string;
  followers: number;
  industries: string[];
  pricePerPostCents: number;
  estimatedViews: number;
  estimatedCpmCents: number | null;
  matchScore: number;
  audience: {
    jobTitles: AudienceSegment[];
    seniority: AudienceSegment[];
    sampleSize: number | null;
  };
  samplePost: {
    url: string | null;
    impressions: number;
    reactions: number;
    comments: number;
    reposts: number;
    publishedAt: string | null;
  } | null;
};

function toSegments(breakdown: Record<string, number> | undefined): AudienceSegment[] {
  return Object.entries(breakdown ?? {})
    .map(([label, percentage]) => ({ label, percentage }))
    .sort((left, right) => right.percentage - left.percentage);
}

function parseAudienceSnapshot(value: Json | null): MarketplaceCreator["audience"] {
  const parsed = audienceSnapshotSchema.safeParse(value);

  if (!parsed.success) {
    return { jobTitles: [], seniority: [], sampleSize: null };
  }

  return {
    jobTitles: toSegments(parsed.data.job_title ?? parsed.data.jobTitle),
    seniority: toSegments(parsed.data.seniority),
    sampleSize: parsed.data.sample_n ?? parsed.data.sampleN ?? null,
  };
}

function getInitials(displayName: string) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "CR";
}

export async function getMarketplaceCreators(): Promise<MarketplaceCreator[]> {
  const supabase = await createServerSupabaseClient();
  const [{ data: creatorRows, error: creatorError }, { data: postRows, error: postError }] =
    await Promise.all([
      supabase
        .from("creators")
        .select(
          "id, display_name, headline, country, followers, industries, price_per_post_cents, est_impressions, audience_snapshot, match_default",
        )
        .eq("marketplace_visible", true)
        .order("match_default", { ascending: false }),
      supabase
        .from("posts")
        .select(
          "id, linkedin_url, impressions, reactions, comments, reposts, published_at, collaborations!inner(creator_id)",
        )
        .order("published_at", { ascending: false }),
    ]);

  if (creatorError) {
    throw new Error("Unable to load marketplace creators");
  }

  if (postError) {
    throw new Error("Unable to load RLS-visible creator posts");
  }

  const latestPostByCreator = new Map<string, (typeof postRows)[number]>();

  for (const post of postRows) {
    const creatorId = post.collaborations.creator_id;
    if (!latestPostByCreator.has(creatorId)) latestPostByCreator.set(creatorId, post);
  }

  return creatorRows.map((creator) => {
    const displayName = creator.display_name?.trim() || "Creator profile";
    const estimatedViews = creator.est_impressions ?? 0;
    const pricePerPostCents = creator.price_per_post_cents ?? 0;
    const samplePost = latestPostByCreator.get(creator.id);

    return {
      id: creator.id,
      displayName,
      avatarInitials: getInitials(displayName),
      headline: creator.headline?.trim() || "LinkedIn creator",
      country: creator.country?.trim() || "Not specified",
      followers: creator.followers ?? 0,
      industries: creator.industries ?? [],
      pricePerPostCents,
      estimatedViews,
      estimatedCpmCents:
        estimatedViews > 0 ? Math.round((pricePerPostCents * 1_000) / estimatedViews) : null,
      matchScore: creator.match_default ?? 0,
      audience: parseAudienceSnapshot(creator.audience_snapshot),
      samplePost: samplePost
        ? {
            url: samplePost.linkedin_url,
            impressions: samplePost.impressions ?? 0,
            reactions: samplePost.reactions ?? 0,
            comments: samplePost.comments ?? 0,
            reposts: samplePost.reposts ?? 0,
            publishedAt: samplePost.published_at,
          }
        : null,
    };
  });
}
