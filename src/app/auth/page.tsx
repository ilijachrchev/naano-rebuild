import { redirect } from "next/navigation";

import { AuthForm } from "@/components/brand/auth-form";
import {
  BrandMark,
  DossierShell,
  DossierTabs,
  EvidenceMark,
} from "@/components/brand/dossier";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { getCreatorContext } from "@/lib/creator/context";

export default async function AuthPage() {
  const creatorContext = await getCreatorContext();

  if (creatorContext.creator) redirect("/creator");
  if (creatorContext.userId && creatorContext.registeredAsCreator) {
    redirect("/creator/onboarding");
  }

  const context = await getBrandContext();

  if (context.userId) {
    redirect(getBrandDestination(context));
  }

  return (
    <DossierShell
      activeStep={0}
      aside={
        <>
          <div>
            <BrandMark inverse />
            <div className="mt-12 h-px bg-mineral/35" />
            <h1 className="display-type mt-7 max-w-xl text-[clamp(3.25rem,4.5vw,4.5rem)] leading-[0.89] text-balance">
              Turn your website into a creator brief<span className="text-signal">.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-mineral/68">
              Start with what your company already says. naano uses it to shape the audience you should reach.
            </p>
          </div>
          <div className="mt-10">
            <AuthForm />
          </div>
        </>
      }
    >
      <DossierTabs activeStep={0} />
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="flex items-center justify-between gap-6 border-carbon/20 border-b pb-8">
          <h2 className="display-type text-4xl sm:text-5xl">Your site becomes matching context.</h2>
          <span className="hidden h-3 w-3 bg-signal sm:block" aria-hidden="true" />
        </div>

        <div className="divide-carbon/18 divide-y">
          <section className="grid gap-6 py-9 xl:grid-cols-[1fr_180px]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Input</p>
              <p className="mt-3 font-mono text-lg">https://yourcompany.com</p>
            </div>
            <EvidenceMark>URL captured</EvidenceMark>
          </section>
          <section className="grid gap-6 py-9 xl:grid-cols-[1fr_180px]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Value proposition</p>
              <p className="display-type mt-3 max-w-2xl text-3xl leading-[1.02] sm:text-4xl">
                One precise reason your best-fit customer should care.
              </p>
            </div>
            <EvidenceMark>Position found</EvidenceMark>
          </section>
          <section className="grid gap-6 py-9 xl:grid-cols-[1fr_180px]">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Audience signals</p>
              <ol className="mt-4 divide-carbon/15 divide-y border-carbon/18 border-y">
                {["Role and buying context", "Company shape and pain", "Why your product fits"].map((item, index) => (
                  <li key={item} className="flex items-center gap-4 py-3 text-sm">
                    <span className="display-type flex h-8 w-8 items-center justify-center border border-aubergine/45 text-lg">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <EvidenceMark>3 ICPs shaped</EvidenceMark>
          </section>
        </div>
      </div>
    </DossierShell>
  );
}
