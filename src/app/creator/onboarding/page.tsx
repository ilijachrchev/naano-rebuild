import { redirect } from "next/navigation";

import { CreatorOnboardingFlow } from "@/components/creator/onboarding-flow";
import { getCreatorContext } from "@/lib/creator/context";

export default async function CreatorOnboardingPage() {
  const context = await getCreatorContext();

  if (!context.userId) redirect("/creator/auth");
  if (context.creator) redirect("/creator");
  if (!context.registeredAsCreator) redirect("/auth");

  return <CreatorOnboardingFlow />;
}
