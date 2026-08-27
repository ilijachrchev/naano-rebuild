import { redirect } from "next/navigation";

import { BrandAnalyticsDashboard } from "@/components/brand/analytics/dashboard";
import { loadBrandAttributionSnapshot } from "@/lib/analytics/data";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";

export default async function BrandAnalyticsPage() {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const snapshot = await loadBrandAttributionSnapshot(workspace.id);

  return <BrandAnalyticsDashboard workspaceName={workspace.name} snapshot={snapshot} />;
}
