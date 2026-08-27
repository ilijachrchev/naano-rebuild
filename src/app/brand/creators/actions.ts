"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BookingActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  errorCode?: "INSUFFICIENT_FUNDS";
  collaborationId?: string;
};

const bookingSchema = z.object({
  workspaceId: z.uuid(),
  creatorId: z.uuid(),
  briefId: z.uuid(),
  pricingMode: z.enum(["listed-rate", "negotiate"]),
  feeCents: z.coerce.number().int().positive().safe(),
  postBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid post-by date."),
  approvalRequired: z.boolean(),
});

function parseUtcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

function validatePostBy(value: string) {
  const postBy = parseUtcDate(value);
  if (postBy === null) return "Choose a valid post-by date.";

  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (postBy < today) return "The post-by date cannot be in the past.";
  return null;
}

export async function createBrandInviteAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = bookingSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    creatorId: formData.get("creatorId"),
    briefId: formData.get("briefId"),
    pricingMode: formData.get("pricingMode"),
    feeCents: formData.get("feeCents"),
    postBy: formData.get("postBy"),
    approvalRequired: formData.get("approvalRequired") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the offer details.",
    };
  }

  const postByError = validatePostBy(parsed.data.postBy);
  if (postByError) return { status: "error", message: postByError };

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) redirect("/auth");

  const [membershipResult, creatorResult, briefResult] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", parsed.data.workspaceId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("creators")
      .select("id, price_per_post_cents")
      .eq("id", parsed.data.creatorId)
      .eq("marketplace_visible", true)
      .maybeSingle(),
    supabase
      .from("briefs")
      .select("id")
      .eq("id", parsed.data.briefId)
      .eq("workspace_id", parsed.data.workspaceId)
      .eq("status", "ready")
      .maybeSingle(),
  ]);

  if (membershipResult.error || !membershipResult.data) {
    return { status: "error", message: "We couldn't access that workspace." };
  }

  const creator = creatorResult.data;
  if (creatorResult.error || !creator) {
    return { status: "error", message: "That creator is no longer available to book." };
  }

  if (briefResult.error || !briefResult.data) {
    return {
      status: "error",
      message: "Choose a ready brief from this workspace before sending the offer.",
    };
  }

  const listPriceCents = creator.price_per_post_cents;
  if (
    listPriceCents === null ||
    !Number.isSafeInteger(listPriceCents) ||
    listPriceCents <= 0
  ) {
    return { status: "error", message: "This creator does not have a bookable listed rate." };
  }

  if (parsed.data.pricingMode === "listed-rate" && parsed.data.feeCents !== listPriceCents) {
    return {
      status: "error",
      message: "The creator's listed rate changed. Review the latest rate and try again.",
    };
  }

  if (parsed.data.pricingMode === "negotiate" && parsed.data.feeCents >= listPriceCents) {
    return { status: "error", message: "A negotiated offer must be below the listed rate." };
  }

  const admin = createAdminSupabaseClient();
  const { data: collaborationId, error } = await admin.rpc("create_brand_invite", {
    p_workspace_id: parsed.data.workspaceId,
    p_proposer_id: userId,
    p_creator_id: creator.id,
    p_fee_cents: parsed.data.feeCents,
    p_list_price_cents: listPriceCents,
    p_currency: "EUR",
    p_offer_type: "single_post",
    p_post_by: parsed.data.postBy,
    p_approval_required: parsed.data.approvalRequired,
    p_brief_id: briefResult.data.id,
  });

  if (error) {
    if (error.message.toLowerCase().includes("insufficient wallet balance")) {
      return {
        status: "error",
        errorCode: "INSUFFICIENT_FUNDS",
        message:
          "Your wallet doesn't have enough available balance to reserve this offer. Add funds or lower the offer and try again.",
      };
    }

    console.error("Atomic brand invite failed", {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return {
      status: "error",
      message:
        "We couldn't confirm whether the offer was sent. Check Collaborations before trying again to avoid reserving the fee twice.",
    };
  }

  if (!collaborationId) {
    return {
      status: "error",
      message:
        "We couldn't confirm whether the offer was sent. Check Collaborations before trying again to avoid reserving the fee twice.",
    };
  }

  revalidatePath("/brand/creators");
  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/wallet");

  return {
    status: "success",
    collaborationId,
    message:
      "Offer sent. The fee is reserved in your wallet while the offer is pending, and the creator has been asked to respond within 48 hours.",
  };
}
