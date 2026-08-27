"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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
