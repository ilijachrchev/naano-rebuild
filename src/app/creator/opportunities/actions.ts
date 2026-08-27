"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InviteDecisionState = {
  error: string | null;
  message: string | null;
};

const decisionSchema = z.object({
  collaborationId: z.uuid(),
  decision: z.enum(["accept", "decline"]),
});

function hasExpired(...deadlines: Array<string | null>) {
  const now = Date.now();
  return deadlines.some((deadline) => deadline !== null && new Date(deadline).getTime() <= now);
}

export async function decideInviteAction(
  _previousState: InviteDecisionState,
  formData: FormData,
): Promise<InviteDecisionState> {
  const parsed = decisionSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    return { error: "That invitation response is invalid.", message: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;
  if (!userId) redirect("/auth");

  const { data: collaboration, error: collaborationError } = await supabase
    .from("collaborations")
    .select("id, creator_id, current_offer_id, respond_by")
    .eq("id", parsed.data.collaborationId)
    .eq("creator_id", userId)
    .eq("origin", "brand_invite")
    .eq("status", "requested")
    .is("deleted_at", null)
    .maybeSingle();

  if (collaborationError || !collaboration) {
    return { error: "This invitation is no longer available.", message: null };
  }

  if (!collaboration.current_offer_id) {
    return { error: "This invitation has no valid offer attached.", message: null };
  }

  const { data: offer, error: offerError } = await supabase
    .from("collaboration_offers")
    .select("id, accepted_at, expires_at")
    .eq("id", collaboration.current_offer_id)
    .eq("collaboration_id", collaboration.id)
    .maybeSingle();

  if (offerError || !offer) {
    return { error: "The invitation terms are no longer available.", message: null };
  }

  if (hasExpired(collaboration.respond_by, offer.expires_at)) {
    return { error: "The response window for this invitation has ended.", message: null };
  }

  const respondedAt = new Date().toISOString();
  const admin = createAdminSupabaseClient();

  if (parsed.data.decision === "accept" && !offer.accepted_at) {
    const { data: acceptedOffer, error: acceptOfferError } = await admin
      .from("collaboration_offers")
      .update({ accepted_at: respondedAt })
      .eq("id", offer.id)
      .eq("collaboration_id", collaboration.id)
      .is("accepted_at", null)
      .select("id")
      .maybeSingle();

    if (acceptOfferError || !acceptedOffer) {
      return { error: "We couldn't accept this offer. Please try again.", message: null };
    }
  }

  const collaborationUpdate =
    parsed.data.decision === "accept"
      ? {
          status: "accepted" as const,
          accepted_offer_id: offer.id,
          responded_at: respondedAt,
          updated_at: respondedAt,
        }
      : {
          status: "declined" as const,
          responded_at: respondedAt,
          updated_at: respondedAt,
        };

  const { data: updatedCollaboration, error: updateError } = await admin
    .from("collaborations")
    .update(collaborationUpdate)
    .eq("id", collaboration.id)
    .eq("creator_id", userId)
    .eq("current_offer_id", offer.id)
    .eq("origin", "brand_invite")
    .eq("status", "requested")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError || !updatedCollaboration) {
    return { error: "This invitation changed before your response was saved.", message: null };
  }

  revalidatePath("/creator");
  revalidatePath("/creator/opportunities");
  revalidatePath("/creator/earnings");

  return {
    error: null,
    message: parsed.data.decision === "accept" ? "Invitation accepted." : "Invitation declined.",
  };
}
