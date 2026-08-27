import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark, DossierShell, DossierTabs, EvidenceMark } from "@/components/brand/dossier";
import { CreatorAuthForm } from "@/components/creator/auth-form";
import { getCreatorContext } from "@/lib/creator/context";

const creatorSteps = ["Access", "LinkedIn", "Review", "Listed"] as const;

export default async function CreatorAuthPage() {
  const context = await getCreatorContext();

  if (context.creator) redirect("/creator");
  if (context.userId && context.registeredAsCreator) redirect("/creator/onboarding");
  if (context.userId) redirect("/auth");

  return (
    <DossierShell
      activeStep={0}
      steps={creatorSteps}
      aside={
        <>
          <div>
            <BrandMark inverse />
            <div className="mt-12 h-px bg-mineral/35" />
            <p className="mt-7 text-xs font-bold tracking-[0.12em] text-signal uppercase">
              Creator access
            </p>
            <h1 className="display-type mt-4 max-w-xl text-[clamp(3.25rem,4.5vw,4.5rem)] leading-[0.89] text-balance">
              Turn your LinkedIn signal into a bookable creator card<span className="text-signal">.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-mineral/68">
              This entry is for creators. Your account opens the creator desk, not a brand workspace.
            </p>
          </div>
          <div className="mt-10">
            <CreatorAuthForm />
            <p className="mt-6 text-sm text-mineral/58">
              Joining for a brand?{" "}
              <Link href="/auth" className="font-bold text-mineral hover:text-signal">
                Use brand access
              </Link>
            </p>
          </div>
        </>
      }
    >
      <DossierTabs activeStep={0} steps={creatorSteps} />
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="flex items-center justify-between gap-6 border-carbon/20 border-b pb-8">
          <h2 className="display-type text-4xl sm:text-5xl">One public profile becomes marketplace evidence.</h2>
          <span className="hidden h-3 w-3 bg-signal sm:block" aria-hidden="true" />
        </div>

        <div className="divide-carbon/18 divide-y">
          <section className="grid gap-6 py-9 xl:grid-cols-[1fr_180px]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Input</p>
              <p className="mt-3 font-mono text-lg">linkedin.com/in/your-name</p>
            </div>
            <EvidenceMark>Public URL</EvidenceMark>
          </section>
          <section className="grid gap-6 py-9 xl:grid-cols-[1fr_180px]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] uppercase">One analysis</p>
              <p className="display-type mt-3 max-w-2xl text-3xl leading-[1.02] sm:text-4xl">
                Positioning, industries, and a starting post rate.
              </p>
            </div>
            <EvidenceMark>Draft shaped</EvidenceMark>
          </section>
          <section className="grid gap-6 py-9 xl:grid-cols-[1fr_180px]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Your decision</p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-carbon/66">
                Review the result before anything is listed. You control location, categories, and price.
              </p>
            </div>
            <EvidenceMark>Review first</EvidenceMark>
          </section>
        </div>
      </div>
    </DossierShell>
  );
}
