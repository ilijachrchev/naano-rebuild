import { redirect } from "next/navigation";

import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { getCreatorContext } from "@/lib/creator/context";

export default async function Home() {
  const creatorContext = await getCreatorContext();

  if (creatorContext.creator) redirect("/creator");
  if (creatorContext.userId && creatorContext.registeredAsCreator) {
    redirect("/creator/onboarding");
  }

  const context = await getBrandContext();
  redirect(getBrandDestination(context));
}
