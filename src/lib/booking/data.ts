import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BookingBriefOption = {
  id: string;
  title: string;
};

export async function getBookingBriefOptions(
  workspaceId: string,
): Promise<BookingBriefOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("id, title, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load booking briefs");

  return (data ?? []).map((brief) => ({
    id: brief.id,
    title: brief.title?.trim() || "Untitled brief",
  }));
}
