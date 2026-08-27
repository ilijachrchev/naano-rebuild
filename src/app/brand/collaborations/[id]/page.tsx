import { notFound, redirect } from "next/navigation";

import { BrandCollaborationDetailView } from "@/components/brand/collaborations/detail";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import {
  PIPELINE_STAGES,
  loadBrandCollaborationDetail,
  type PipelineFilter,
  type PipelineStage,
} from "@/lib/collaborations/data";

function normalizeBackFilter(value: string | undefined): PipelineFilter {
  return PIPELINE_STAGES.includes(value as PipelineStage) ? (value as PipelineStage) : "all";
}

export default async function BrandCollaborationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const [{ id }, { status }] = await Promise.all([params, searchParams]);
  const collaboration = await loadBrandCollaborationDetail({
    workspaceId: workspace.id,
    collaborationId: id,
  });

  if (!collaboration) notFound();

  return (
    <BrandCollaborationDetailView
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      collaboration={collaboration}
      backFilter={normalizeBackFilter(status)}
    />
  );
}
