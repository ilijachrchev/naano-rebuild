import type { Enums } from "@/types/database";

export function isCollaborationReadyForSettlement(
  status: Enums<"collab_status">,
  approvalRequired: boolean | null,
) {
  return status === "content_submitted" || (status === "accepted" && approvalRequired === false);
}
