"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SubmitContentActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

const submitContentSchema = z.object({
  collaborationId: z.uuid(),
  contentUrl: z
    .string()
    .trim()
    .min(1, "Paste the published post link.")
    .max(2048, "That post link is too long.")
    .refine((value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Enter a complete http:// or https:// post link."),
});

export async function submitCollaborationContentAction(
  _previousState: SubmitContentActionState,
  formData: FormData,
): Promise<SubmitContentActionState> {
  const parsed = submitContentSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
    contentUrl: formData.get("contentUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the published post link.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) redirect("/creator/auth");

  const { data: collaboration, error: collaborationError } = await supabase
    .from("collaborations")
    .select("id, creator_id, status")
    .eq("id", parsed.data.collaborationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (collaborationError) {
    return { status: "error", message: "We couldn't verify this collaboration. Try again." };
  }

  if (!collaboration || collaboration.creator_id !== userId) {
    return { status: "error", message: "You don't have access to this collaboration." };
  }

  if (collaboration.status !== "accepted") {
    return {
      status: "error",
      message: "Content can only be submitted for an accepted collaboration.",
    };
  }

  const admin = createAdminSupabaseClient();
  const { data: submittedCollaborationId, error: submitError } = await admin.rpc(
    "submit_collaboration_content",
    {
      p_creator_id: userId,
      p_collaboration_id: collaboration.id,
      p_content_url: parsed.data.contentUrl,
    },
  );

  if (submitError || submittedCollaborationId !== collaboration.id) {
    if (submitError?.code === "42501") {
      return { status: "error", message: "You no longer have access to this collaboration." };
    }
    if (submitError?.code === "55000") {
      return {
        status: "error",
        message: "This collaboration changed and is no longer ready for content submission.",
      };
    }

    console.error("Collaboration content submission failed", {
      code: submitError?.code,
      details: submitError?.details,
      hint: submitError?.hint,
    });
    return {
      status: "error",
      message: "We couldn't submit the post link. The collaboration was not changed.",
    };
  }

  revalidatePath("/creator");
  revalidatePath("/creator/collaborations");
  revalidatePath("/brand/collaborations");
  revalidatePath(`/brand/collaborations/${collaboration.id}`);

  return {
    status: "success",
    message: "Content submitted. The collaboration is awaiting brand approval.",
  };
}
