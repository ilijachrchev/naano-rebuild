import { redirect } from "next/navigation";

import { DossierShell, DossierTabs, BrandMark } from "@/components/brand/dossier";
import { WorkspaceForm } from "@/components/brand/workspace-form";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";

export default async function WorkspaceSetupPage() {
  const context = await getBrandContext();

  if (!context.userId) redirect("/auth");
  if (context.workspace) redirect(getBrandDestination(context));

  return (
    <DossierShell
      activeStep={1}
      aside={
        <>
          <div>
            <BrandMark inverse />
            <h1 className="display-type mt-16 max-w-lg text-5xl leading-[0.93] sm:text-6xl">
              Name the team behind the signal<span className="text-signal">.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-mineral/68">
              Your workspace keeps brand intelligence, collaborators, and campaign activity together.
            </p>
          </div>
          <p className="mt-10 border-white/22 border-t pt-5 text-xs leading-5 tracking-[0.08em] text-mineral/52 uppercase">
            The website is saved once and becomes the source for the next step.
          </p>
        </>
      }
    >
      <DossierTabs activeStep={1} />
      <div className="px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="max-w-2xl">
          <h2 className="display-type text-5xl leading-[0.95] sm:text-6xl">What should this dossier be called?</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-carbon/66">
            Use the company name your team recognizes. We’ll use the website to research your positioning—nothing is published yet.
          </p>
        </div>
        <WorkspaceForm />

        <div className="mt-16 grid max-w-3xl gap-px border border-carbon/18 bg-carbon/18 sm:grid-cols-3">
          {["Workspace created", "Website retained", "Owner access linked"].map((item, index) => (
            <div key={item} className="bg-paper px-5 py-5">
              <span className="display-type text-2xl text-aubergine">{String(index + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-sm font-bold">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </DossierShell>
  );
}
