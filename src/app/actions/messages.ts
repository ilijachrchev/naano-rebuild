"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SendMessageActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

const sendMessageSchema = z.object({
  collaborationId: z.uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Write a message before sending.")
    .max(2000, "Messages can be at most 2,000 characters."),
});

export async function sendCollaborationMessageAction(
  _previousState: SendMessageActionState,
  formData: FormData,
): Promise<SendMessageActionState> {
  const parsed = sendMessageSchema.safeParse({
    collaborationId: formData.get("collaborationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check your message and try again.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) {
    return { status: "error", message: "Sign in again before sending a message." };
  }

  const { data: collaboration, error: collaborationError } = await supabase
    .from("collaborations")
    .select("id, workspace_id, creator_id")
    .eq("id", parsed.data.collaborationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (collaborationError) {
    return { status: "error", message: "We couldn't verify this collaboration. Try again." };
  }

  if (!collaboration) {
    return { status: "error", message: "You don't have access to this collaboration." };
  }

  const isCreator = collaboration.creator_id === userId;
  let isWorkspaceMember = false;

  if (!isCreator) {
    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", collaboration.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      return { status: "error", message: "We couldn't verify your workspace access. Try again." };
    }

    isWorkspaceMember = membership !== null;
  }

  if (!isCreator && !isWorkspaceMember) {
    return { status: "error", message: "Only collaboration participants can send messages." };
  }

  const admin = createAdminSupabaseClient();
  const { data: existingConversation, error: conversationLookupError } = await admin
    .from("conversations")
    .select("id, workspace_id, creator_id")
    .eq("id", collaboration.id)
    .maybeSingle();

  if (conversationLookupError) {
    return { status: "error", message: "We couldn't open this conversation. Try again." };
  }

  if (
    existingConversation &&
    (existingConversation.workspace_id !== collaboration.workspace_id ||
      existingConversation.creator_id !== collaboration.creator_id)
  ) {
    console.error("Conversation scope mismatch", { collaborationId: collaboration.id });
    return { status: "error", message: "This conversation could not be verified." };
  }

  if (!existingConversation) {
    const { error: conversationInsertError } = await admin.from("conversations").insert({
      id: collaboration.id,
      workspace_id: collaboration.workspace_id,
      creator_id: collaboration.creator_id,
    });

    if (conversationInsertError && conversationInsertError.code !== "23505") {
      return { status: "error", message: "We couldn't start this conversation. Try again." };
    }

    if (conversationInsertError?.code === "23505") {
      const { data: racedConversation, error: racedConversationError } = await admin
        .from("conversations")
        .select("workspace_id, creator_id")
        .eq("id", collaboration.id)
        .maybeSingle();

      if (
        racedConversationError ||
        !racedConversation ||
        racedConversation.workspace_id !== collaboration.workspace_id ||
        racedConversation.creator_id !== collaboration.creator_id
      ) {
        return { status: "error", message: "This conversation could not be verified." };
      }
    }
  }

  const { error: messageError } = await admin.from("messages").insert({
    conversation_id: collaboration.id,
    sender_id: userId,
    body: parsed.data.body,
  });

  if (messageError) {
    return { status: "error", message: "We couldn't send that message. Try again." };
  }

  revalidatePath(`/brand/collaborations/${collaboration.id}`);
  revalidatePath("/creator/collaborations");
  revalidatePath(`/creator/collaborations/${collaboration.id}`);

  return { status: "success", message: "Message sent." };
}
