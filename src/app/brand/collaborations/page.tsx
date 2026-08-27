import { redirect } from "next/navigation";

import { BrandComingSoon } from "@/components/brand/coming-soon";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";

export default async function BrandCollaborationsPage() {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  return (
    <BrandComingSoon
      workspaceName={context.workspace!.name}
      activeHref="/brand/collaborations"
      section="Collaborations"
    />
  );
}
