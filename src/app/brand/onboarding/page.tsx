import { redirect } from "next/navigation";

import { BrandProfileForm } from "@/components/brand/profile-form";
import { BrandMark, DossierShell, DossierTabs } from "@/components/brand/dossier";
import { getBrandContext } from "@/lib/brand/context";

export default async function BrandOnboardingPage() {
  const context = await getBrandContext();

  if (!context.userId) redirect("/auth");
  if (!context.workspace) redirect("/brand/setup");
  if (context.brandProfile?.scannedAt) redirect("/brand");

  return (
    <DossierShell
      activeStep={2}
      aside={
        <>
          <div>
            <BrandMark inverse />
            <h1 className="display-type mt-16 max-w-lg text-5xl leading-[0.93] sm:text-6xl">
              Find the language your market recognizes<span className="text-signal">.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-mineral/68">
              One live analysis turns your public website into a value proposition and three usable ICPs.
            </p>
          </div>
          <div className="mt-10 border-white/22 border-t pt-5">
            <p className="text-xs font-bold tracking-[0.1em] text-mineral/48 uppercase">Source website</p>
            <p className="mt-2 break-all text-sm text-mineral">{context.workspace.website}</p>
          </div>
        </>
      }
    >
      <DossierTabs activeStep={2} />
      <div className="px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="max-w-3xl border-carbon/18 border-b pb-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <h2 className="display-type max-w-2xl text-5xl leading-[0.95] sm:text-6xl">Build {context.workspace.name}&apos;s matching profile.</h2>
            <span className="inline-flex bg-signal px-3 py-1 text-xs font-bold tracking-[0.11em] uppercase">Ready to analyze</span>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 text-carbon/66">
            The result is saved as brand intelligence. It gives creator matching a useful starting point instead of an empty directory.
          </p>
          <BrandProfileForm workspaceId={context.workspace.id} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] uppercase">One input</p>
            <p className="display-type mt-3 break-all text-3xl leading-tight text-aubergine">{context.workspace.website}</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.12em] uppercase">Four saved outputs</p>
            <ol className="mt-3 divide-carbon/16 divide-y border-carbon/18 border-y">
              {["Value proposition", "Primary ICP", "Adjacent ICP", "Expansion ICP"].map((item, index) => (
                <li key={item} className="flex items-center gap-4 py-3 text-sm font-semibold">
                  <span className="display-type text-xl text-aubergine">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </DossierShell>
  );
}
