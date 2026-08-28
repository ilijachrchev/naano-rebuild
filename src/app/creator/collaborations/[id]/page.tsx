import { notFound, redirect } from "next/navigation";

import { CreatorCollaborationDetailView } from "@/components/creator/collaboration-detail";
import { loadCollaborationMessages } from "@/lib/collaboration-messages";
import { getCreatorContext } from "@/lib/creator/context";
import { getCreatorCollaboration } from "@/lib/creator/data";

export default async function CreatorCollaborationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/creator/auth");
  if (!context.registeredAsCreator) redirect("/auth");
  if (!context.creator) redirect("/creator/onboarding");

  const { id } = await params;
  const collaboration = await getCreatorCollaboration(context.creator.id, id);

  if (!collaboration) notFound();

  const messages = await loadCollaborationMessages({
    collaborationId: collaboration.id,
    workspaceId: collaboration.workspaceId,
    creatorId: context.creator.id,
  });

  return (
    <CreatorCollaborationDetailView
      creatorId={context.creator.id}
      creatorName={context.creator.displayName}
      collaboration={collaboration}
      messages={messages}
    />
  );
}
