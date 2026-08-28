import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const pageSize = 1_000;
const activatedStatuses = new Set([
  "accepted",
  "brief_pending",
  "content_submitted",
  "revision_requested",
  "approved",
  "scheduled",
  "published",
  "completed",
]);

type CollaborationRow = {
  id: string;
  creatorId: string;
  status: string;
};

type PostRow = {
  id: string;
  creatorId: string;
  impressions: number;
  isDemo: boolean;
};

type ClickRow = {
  id: string;
  creatorId: string;
  company: string | null;
  isQualified: boolean;
  context: Json;
  occurredAt: string;
};

type CreatorRow = {
  id: string;
  displayName: string;
  headline: string;
};

export type CreatorAttribution = {
  id: string;
  displayName: string;
  headline: string;
  posts: number;
  clicks: number;
  qualifiedClicks: number;
  companiesDriven: number;
  isDemo: boolean;
};

export type EngagedCompany = {
  name: string;
  qualifiedClicks: number;
  creators: number;
  lastEngagedAt: string;
  industry: string | null;
  companySize: string | null;
  isDemo: boolean;
};

export type BrandAttributionSnapshot = {
  stats: {
    creatorsActivated: number;
    postsPublished: number;
    qualifiedClicks: number;
    companiesEngaged: number;
  };
  funnel: {
    impressions: number;
    clicks: number;
    qualifiedClicks: number;
    companiesEngaged: number;
    pipeline: null;
  };
  creators: CreatorAttribution[];
  companies: EngagedCompany[];
  isIllustrative: boolean;
};

function isDemoContext(context: Json) {
  return typeof context === "object" && context !== null && !Array.isArray(context) && context.demo === true;
}

function getContextString(context: Json, key: string) {
  if (typeof context !== "object" || context === null || Array.isArray(context)) return null;
  const value = context[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeCompany(company: string | null) {
  const name = company?.trim();
  return name ? { key: name.toLocaleLowerCase("en"), name } : null;
}

function buildSnapshot({
  collaborations,
  posts,
  clicks,
  creators,
}: {
  collaborations: CollaborationRow[];
  posts: PostRow[];
  clicks: ClickRow[];
  creators: CreatorRow[];
}): BrandAttributionSnapshot {
  const creatorDetails = new Map(creators.map((creator) => [creator.id, creator]));
  const activatedCreatorIds = new Set(
    collaborations
      .filter((collaboration) => activatedStatuses.has(collaboration.status))
      .map((collaboration) => collaboration.creatorId),
  );
  const creatorTotals = new Map<
    string,
    { posts: number; clicks: number; qualifiedClicks: number; companies: Set<string>; isDemo: boolean }
  >();
  const companyTotals = new Map<
    string,
    {
      name: string;
      qualifiedClicks: number;
      creators: Set<string>;
      lastEngagedAt: string;
      industry: string | null;
      companySize: string | null;
      isDemo: boolean;
    }
  >();

  function getCreatorTotals(creatorId: string) {
    const existing = creatorTotals.get(creatorId);
    if (existing) return existing;

    const totals = {
      posts: 0,
      clicks: 0,
      qualifiedClicks: 0,
      companies: new Set<string>(),
      isDemo: false,
    };
    creatorTotals.set(creatorId, totals);
    return totals;
  }

  for (const creatorId of activatedCreatorIds) getCreatorTotals(creatorId);

  for (const post of posts) {
    const totals = getCreatorTotals(post.creatorId);
    totals.posts += 1;
    totals.isDemo ||= post.isDemo;
  }

  for (const click of clicks) {
    const totals = getCreatorTotals(click.creatorId);
    totals.clicks += 1;
    totals.isDemo ||= isDemoContext(click.context);
    if (!click.isQualified) continue;

    totals.qualifiedClicks += 1;
    const company = normalizeCompany(click.company);
    if (!company) continue;

    totals.companies.add(company.key);
    const current = companyTotals.get(company.key);
    if (current) {
      current.qualifiedClicks += 1;
      current.creators.add(click.creatorId);
      if (click.occurredAt > current.lastEngagedAt) current.lastEngagedAt = click.occurredAt;
      current.industry ??= getContextString(click.context, "industry");
      current.companySize ??= getContextString(click.context, "companySize");
      current.isDemo ||= isDemoContext(click.context);
    } else {
      companyTotals.set(company.key, {
        name: company.name,
        qualifiedClicks: 1,
        creators: new Set([click.creatorId]),
        lastEngagedAt: click.occurredAt,
        industry: getContextString(click.context, "industry"),
        companySize: getContextString(click.context, "companySize"),
        isDemo: isDemoContext(click.context),
      });
    }
  }

  const creatorAttribution = [...creatorTotals.entries()]
    .map(([creatorId, totals]) => {
      const creator = creatorDetails.get(creatorId);
      return {
        id: creatorId,
        displayName: creator?.displayName || "Creator profile",
        headline: creator?.headline || "LinkedIn creator",
        posts: totals.posts,
        clicks: totals.clicks,
        qualifiedClicks: totals.qualifiedClicks,
        companiesDriven: totals.companies.size,
        isDemo: totals.isDemo,
      };
    })
    .sort(
      (left, right) =>
        right.qualifiedClicks - left.qualifiedClicks ||
        right.clicks - left.clicks ||
        left.displayName.localeCompare(right.displayName),
    );
  const engagedCompanies = [...companyTotals.values()]
    .map((company) => ({
      name: company.name,
      qualifiedClicks: company.qualifiedClicks,
      creators: company.creators.size,
      lastEngagedAt: company.lastEngagedAt,
      industry: company.industry,
      companySize: company.companySize,
      isDemo: company.isDemo,
    }))
    .sort(
      (left, right) =>
        right.qualifiedClicks - left.qualifiedClicks || left.name.localeCompare(right.name),
    );
  const qualifiedClicks = clicks.reduce(
    (total, click) => total + (click.isQualified ? 1 : 0),
    0,
  );

  return {
    stats: {
      creatorsActivated: activatedCreatorIds.size,
      postsPublished: posts.length,
      qualifiedClicks,
      companiesEngaged: engagedCompanies.length,
    },
    funnel: {
      impressions: posts.reduce((total, post) => total + post.impressions, 0),
      clicks: clicks.length,
      qualifiedClicks,
      companiesEngaged: engagedCompanies.length,
      pipeline: null,
    },
    creators: creatorAttribution,
    companies: engagedCompanies,
    isIllustrative:
      posts.some((post) => post.isDemo) || clicks.some((click) => isDemoContext(click.context)),
  };
}

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

async function loadCollaborations(supabase: ServerSupabaseClient, workspaceId: string) {
  const rows: CollaborationRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("collaborations")
      .select("id, creator_id, status")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error("Unable to load attribution collaborations");
    rows.push(
      ...(data ?? []).map((row) => ({
        id: row.id,
        creatorId: row.creator_id,
        status: row.status,
      })),
    );
    if (!data || data.length < pageSize) return rows;
  }
}

async function loadPosts(supabase: ServerSupabaseClient, workspaceId: string) {
  const rows: PostRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("posts")
      .select("id, linkedin_url, impressions, collaborations!inner(workspace_id, creator_id)")
      .eq("collaborations.workspace_id", workspaceId)
      .not("published_at", "is", null)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error("Unable to load attributed posts");
    rows.push(
      ...(data ?? []).map((row) => ({
        id: row.id,
        creatorId: row.collaborations.creator_id,
        impressions: row.impressions ?? 0,
        isDemo: row.linkedin_url?.includes("naano-simulated-performance-demo") ?? false,
      })),
    );
    if (!data || data.length < pageSize) return rows;
  }
}

async function loadClicks(supabase: ServerSupabaseClient, workspaceId: string) {
  const rows: ClickRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("click_events")
      .select(
        "id, company, is_qualified, context, occurred_at, tracking_links!inner(collaboration_id, collaborations!inner(workspace_id, creator_id))",
      )
      .eq("tracking_links.collaborations.workspace_id", workspaceId)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error("Unable to load attributed clicks");
    rows.push(
      ...(data ?? []).map((row) => ({
        id: row.id,
        creatorId: row.tracking_links.collaborations.creator_id,
        company: row.company,
        isQualified: row.is_qualified,
        context: row.context,
        occurredAt: row.occurred_at,
      })),
    );
    if (!data || data.length < pageSize) return rows;
  }
}

async function loadCreators(supabase: ServerSupabaseClient, creatorIds: string[]) {
  if (!creatorIds.length) return [];

  const rows: CreatorRow[] = [];
  for (let from = 0; from < creatorIds.length; from += pageSize) {
    const { data, error } = await supabase
      .from("creators")
      .select("id, display_name, headline")
      .in("id", creatorIds.slice(from, from + pageSize))
      .order("id", { ascending: true });

    if (error) throw new Error("Unable to load attribution creators");
    rows.push(
      ...(data ?? []).map((row) => ({
        id: row.id,
        displayName: row.display_name?.trim() || "Creator profile",
        headline: row.headline?.trim() || "LinkedIn creator",
      })),
    );
  }
  return rows;
}

export async function loadBrandAttributionSnapshot(
  workspaceId: string,
): Promise<BrandAttributionSnapshot> {
  const supabase = await createServerSupabaseClient();
  const [collaborations, posts, clicks] = await Promise.all([
    loadCollaborations(supabase, workspaceId),
    loadPosts(supabase, workspaceId),
    loadClicks(supabase, workspaceId),
  ]);
  const creatorIds = [
    ...new Set([
      ...collaborations.map((row) => row.creatorId),
      ...posts.map((row) => row.creatorId),
      ...clicks.map((row) => row.creatorId),
    ]),
  ];
  const creators = await loadCreators(supabase, creatorIds);

  return buildSnapshot({ collaborations, posts, clicks, creators });
}
