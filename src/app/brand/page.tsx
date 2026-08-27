import { redirect } from "next/navigation";

import { BrandSidebar } from "@/components/brand/sidebar";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { parseBrandIcps } from "@/lib/brand/profile";

export default async function BrandDashboardPage() {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const brandProfile = context.brandProfile!;
  const icps = parseBrandIcps(brandProfile.icps);

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_1fr]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand" />

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 items-center justify-between border-carbon/16 border-b px-6 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Brand dossier</p>
            <p className="text-sm text-carbon/55">Profile saved and ready for matching</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" /> Ready
          </span>
        </header>

        <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-10 border-carbon/18 border-b pb-12 xl:grid-cols-[0.72fr_1.28fr]">
            <div>
              <h1 className="display-type text-5xl leading-[0.92] sm:text-6xl">Welcome to {workspace.name}.</h1>
              <p className="mt-5 max-w-md text-base leading-7 text-carbon/62">
                Your brand profile is ready. Creator matching can now start from your real positioning and audience context.
              </p>
              <div className="mt-8 border-carbon/18 border-l-2 border-l-aubergine bg-mist/40 px-4 py-3 text-sm leading-6 text-carbon/66">
                This dossier will become the matching brief for creator discovery.
              </div>
            </div>

            <div className="border-carbon/22 border-t pt-6 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10">
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Saved value proposition</p>
              <p className="display-type mt-5 max-w-3xl text-4xl leading-[1.02] sm:text-5xl">
                {brandProfile.valueProp}
              </p>
            </div>
          </div>

          <section className="pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="display-type text-4xl">Three audience signals</h2>
                <p className="mt-2 text-sm text-carbon/58">Saved from the website analysis.</p>
              </div>
              <span className="bg-signal px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">{icps.length} ICPs</span>
            </div>

            <ol className="mt-7 border-carbon/20 border-y">
              {icps.map((icp, index) => (
                <li key={`${icp.role}-${icp.companyType}`} className="grid gap-5 border-carbon/16 border-b px-0 py-6 last:border-b-0 md:grid-cols-[72px_1fr_1.25fr]">
                  <span className="display-type text-4xl text-aubergine">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-bold">{icp.role}</h3>
                    <p className="mt-1 text-sm text-carbon/58">{icp.companyType}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {icp.tags.map((tag) => (
                        <span key={tag} className="border border-carbon/18 px-2.5 py-1 text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Pain</p>
                      <p className="mt-2 text-sm leading-6">{icp.pain}</p>
                    </div>
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Product fit</p>
                      <p className="mt-2 text-sm leading-6">{icp.productFit}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
