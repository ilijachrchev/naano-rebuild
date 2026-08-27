import { redirect } from "next/navigation";

import { BrandCollaborationsPipelineView } from "@/components/brand/collaborations/pipeline";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { loadBrandCollaborationPipeline } from "@/lib/collaborations/data";

export default async function BrandCollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const { status } = await searchParams;
  const pipeline = await loadBrandCollaborationPipeline({ workspaceId: workspace.id, status });

  return (
    <BrandCollaborationsPipelineView workspaceName={workspace.name} pipeline={pipeline} />
  );
}
