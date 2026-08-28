import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CollaborationMessage = {
  id: string;
  senderId: string | null;
  body: string;
  createdAt: string | null;
};

export type CollaborationMessageScope = {
  collaborationId: string;
  workspaceId: string;
  creatorId: string;
};

/**
 * Conversations use their collaboration's UUID as their own UUID. This keeps
 * the existing schema while making the relationship deterministic and one-to-one.
 */
export async function loadCollaborationMessages({
  collaborationId,
  workspaceId,
  creatorId,
}: CollaborationMessageScope): Promise<CollaborationMessage[]> {
  const supabase = await createServerSupabaseClient();
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, workspace_id, creator_id")
    .eq("id", collaborationId)
    .maybeSingle();

  if (conversationError) throw new Error("Unable to load this conversation");
  if (!conversation) return [];

  if (
    conversation.workspace_id !== workspaceId ||
    conversation.creator_id !== creatorId
  ) {
    throw new Error("Conversation scope does not match its collaboration");
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  if (messagesError) throw new Error("Unable to load conversation messages");

  return messages.map((message) => ({
    id: message.id,
    senderId: message.sender_id,
    body: message.body ?? "",
    createdAt: message.created_at,
  }));
}
