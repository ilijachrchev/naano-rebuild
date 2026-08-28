"use server";

import { createHash } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getBrandContext } from "@/lib/brand/context";
import { isCollaborationReadyForSettlement } from "@/lib/collaborations/settlement";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SettleCollaborationActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

const settlementSchema = z.object({
  workspaceId: z.uuid(),
  collaborationId: z.uuid(),
});

export type SimulatePerformanceActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

const simulationSchema = z.object({
  collaborationId: z.uuid(),
});

const demoCompanies = {
  northstar: {
    name: "Northstar Analytics (Demo)",
    companySize: "201–500 employees",
    industry: "B2B software",
  },
  harborline: {
    name: "Harborline Systems (Demo)",
    companySize: "51–200 employees",
    industry: "Cybersecurity",
  },
  atlas: {
    name: "Atlas Manufacturing (Demo)",
    companySize: "1,001–5,000 employees",
    industry: "Industrial technology",
  },
} as const;

const demoClickProfiles = [
  { company: demoCompanies.northstar, visitorRole: "VP Marketing" },
  { company: demoCompanies.northstar, visitorRole: "Demand Generation Director" },
  { company: demoCompanies.northstar, visitorRole: "Revenue Operations Manager" },
  { company: demoCompanies.harborline, visitorRole: "Chief Marketing Officer" },
  { company: demoCompanies.harborline, visitorRole: "Growth Lead" },
  { company: demoCompanies.atlas, visitorRole: "Digital Marketing Director" },
  { company: demoCompanies.atlas, visitorRole: "Brand Partnerships Manager" },
  { filterReason: "Automated traffic pattern" },
  { filterReason: "Repeat visit inside qualification window" },
] as const;

function stableUuid(value: string) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16]!, 16) & 0x3) | 0x8).toString(16);
  const id = hex.join("");

  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

function simulationId(collaborationId: string, record: string) {
  return stableUuid(`naano:simulate-post-performance:v1:${collaborationId}:${record}`);
}

function logSimulationError(message: string, error: { code?: string; details?: string; hint?: string }) {
  console.error(message, {
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function approveAndSettleCollaborationAction(
  _previousState: SettleCollaborationActionState,
  formData: FormData,
): Promise<SettleCollaborationActionState> {
  const parsed = settlementSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    collaborationId: formData.get("collaborationId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "That settlement request is invalid." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) redirect("/auth");

  const [membershipResult, collaborationResult] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", parsed.data.workspaceId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("collaborations")
      .select("id, workspace_id, status, approval_required")
      .eq("id", parsed.data.collaborationId)
      .eq("workspace_id", parsed.data.workspaceId)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (membershipResult.error || !membershipResult.data) {
    return { status: "error", message: "You are not a member of this brand workspace." };
  }

  if (collaborationResult.error) {
    return { status: "error", message: "We couldn't verify this collaboration. Try again." };
  }

  const collaboration = collaborationResult.data;
  if (!collaboration) {
    return { status: "error", message: "You don't have access to this collaboration." };
  }

  if (
    !isCollaborationReadyForSettlement(
      collaboration.status,
      collaboration.approval_required,
    )
  ) {
    return {
      status: "error",
      message: "This collaboration is not ready for approval and settlement.",
    };
  }

  const admin = createAdminSupabaseClient();
  const { data: settledCollaborationId, error: settlementError } = await admin.rpc(
    "approve_and_settle_collaboration",
    {
      p_workspace_id: membershipResult.data.workspace_id,
      p_actor_id: userId,
      p_collaboration_id: collaboration.id,
    },
  );

  if (settlementError || settledCollaborationId !== collaboration.id) {
    if (settlementError?.code === "42501") {
      return { status: "error", message: "You are not authorized to settle this collaboration." };
    }
    if (settlementError?.code === "55000") {
      return {
        status: "error",
        message: "This collaboration changed and is no longer ready for settlement.",
      };
    }

    console.error("Collaboration settlement failed", {
      code: settlementError?.code,
      details: settlementError?.details,
      hint: settlementError?.hint,
    });
    return {
      status: "error",
      message:
        "We couldn't confirm settlement. Refresh the collaboration before trying again; no client-side payment was attempted.",
    };
  }

  revalidatePath("/brand");
  revalidatePath("/brand/collaborations");
  revalidatePath(`/brand/collaborations/${collaboration.id}`);
  revalidatePath("/brand/wallet");
  revalidatePath("/creator");
  revalidatePath("/creator/collaborations");
  revalidatePath("/creator/earnings");

  return {
    status: "success",
    message: "Approved and settled. The creator payout has been recorded.",
  };
}

export async function simulatePostPerformanceAction(
  _previousState: SimulatePerformanceActionState,
  formData: FormData,
): Promise<SimulatePerformanceActionState> {
  const parsed = simulationSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "That demo simulation request is invalid." };
  }

  const context = await getBrandContext();
  if (!context.userId) redirect("/auth");
  if (!context.workspace) {
    return { status: "error", message: "We couldn't access your brand workspace." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: collaboration, error: collaborationError } = await supabase
    .from("collaborations")
    .select("id, status, published_at")
    .eq("id", parsed.data.collaborationId)
    .eq("workspace_id", context.workspace.id)
    .is("deleted_at", null)
    .in("status", ["published", "completed"])
    .maybeSingle();

  if (collaborationError) {
    return {
      status: "error",
      message: "We couldn't verify this collaboration. Try again.",
    };
  }

  if (!collaboration) {
    return {
      status: "error",
      message: "Demo performance is only available for your published or completed collaborations.",
    };
  }

  const admin = createAdminSupabaseClient();
  const trackingLinkId = simulationId(collaboration.id, "tracking-link");
  const trackingToken = simulationId(collaboration.id, "tracking-token");
  const postId = simulationId(collaboration.id, "post");
  const clickIds = demoClickProfiles.map((_, index) =>
    simulationId(collaboration.id, `click-${index + 1}`),
  );

  const { error: trackingLinkError } = await admin.from("tracking_links").insert({
    id: trackingLinkId,
    token: trackingToken,
    collaboration_id: collaboration.id,
    destination_url: `https://naano.example/demo/collaboration/${collaboration.id}`,
    active: true,
  });

  if (trackingLinkError) {
    if (trackingLinkError.code !== "23505") {
      logSimulationError("Demo tracking link insert failed", trackingLinkError);
      return {
        status: "error",
        message: "We couldn't create the demo tracking link. No click events were added.",
      };
    }

    const { data: existingTrackingLink, error: existingTrackingLinkError } = await admin
      .from("tracking_links")
      .select("collaboration_id")
      .eq("id", trackingLinkId)
      .maybeSingle();

    if (existingTrackingLinkError || existingTrackingLink?.collaboration_id !== collaboration.id) {
      logSimulationError(
        "Demo tracking link idempotency verification failed",
        existingTrackingLinkError ?? trackingLinkError,
      );
      return {
        status: "error",
        message: "We couldn't verify the existing demo tracking link. No click events were added.",
      };
    }
  }

  const publishedAt = collaboration.published_at ?? new Date().toISOString();
  const { error: postError } = await admin.from("posts").insert({
    id: postId,
    collaboration_id: collaboration.id,
    linkedin_url: `https://www.linkedin.com/posts/naano-simulated-performance-demo-${collaboration.id}`,
    impressions: 18_640,
    reactions: 523,
    comments: 47,
    reposts: 31,
    published_at: publishedAt,
  });

  if (postError) {
    if (postError.code !== "23505") {
      logSimulationError("Demo post insert failed", postError);
      return {
        status: "error",
        message: "We couldn't add the simulated post. No click events were added.",
      };
    }

    const { data: existingPost, error: existingPostError } = await admin
      .from("posts")
      .select("collaboration_id")
      .eq("id", postId)
      .maybeSingle();

    if (existingPostError || existingPost?.collaboration_id !== collaboration.id) {
      logSimulationError(
        "Demo post idempotency verification failed",
        existingPostError ?? postError,
      );
      return {
        status: "error",
        message: "We couldn't verify the existing simulated post. No click events were added.",
      };
    }
  }

  const occurredAt = Date.now();
  const clickRows = demoClickProfiles.map((profile, index) => {
    const isQualified = "company" in profile;
    const clickContext = isQualified
      ? {
          visitorRole: profile.visitorRole,
          companySize: profile.company.companySize,
          industry: profile.company.industry,
        }
      : { filterReason: profile.filterReason };

    return {
      id: clickIds[index],
      tracking_link_id: trackingLinkId,
      ip_hash: createHash("sha256")
        .update(`naano-demo-click:${collaboration.id}:${index + 1}`)
        .digest("hex"),
      company: isQualified ? profile.company.name : null,
      is_qualified: isQualified,
      context: {
        demo: true,
        simulated: true,
        simulation: "post-performance",
        utmSource: "linkedin",
        ...clickContext,
      },
      occurred_at: new Date(occurredAt - (demoClickProfiles.length - index) * 37 * 60_000).toISOString(),
    };
  });

  const { error: clickError } = await admin.from("click_events").insert(clickRows);
  let alreadySimulated = false;

  if (clickError) {
    if (clickError.code !== "23505") {
      logSimulationError("Demo click-event batch insert failed", clickError);
      return {
        status: "error",
        message:
          "The simulated post was saved, but its demo clicks were not. Run the action again to retry safely.",
      };
    }

    const { data: existingClicks, error: existingClicksError } = await admin
      .from("click_events")
      .select("id, tracking_link_id")
      .in("id", clickIds);

    if (
      existingClicksError ||
      existingClicks?.length !== clickIds.length ||
      existingClicks.some((click) => click.tracking_link_id !== trackingLinkId)
    ) {
      logSimulationError(
        "Demo click-event idempotency verification failed",
        existingClicksError ?? clickError,
      );
      return {
        status: "error",
        message:
          "We found incomplete demo click data. Run the action again, or ask an administrator to inspect it.",
      };
    }

    alreadySimulated = true;
  }

  revalidatePath("/brand");
  revalidatePath("/brand/analytics");
  revalidatePath(`/brand/collaborations/${collaboration.id}`);

  return alreadySimulated
    ? {
        status: "success",
        message: "Demo performance already exists for this collaboration; nothing was duplicated.",
      }
    : {
        status: "success",
        message: "Demo post performance added. View the simulated results in Analytics.",
      };
}
