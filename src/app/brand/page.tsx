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
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_1fr]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand" />

      <section className="min-h-screen bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Overview</p>
            <p className="text-sm text-nn-muted">Profile saved and ready for matching</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" /> Ready
          </span>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-10 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
            <div>
              <h1 className="display-type text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
                Welcome to {workspace.name}.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-nn-muted">
                Your brand profile is ready. Creator matching can now start from your real
                positioning and audience context.
              </p>
            </div>

            <div className="nn-card rounded-[1.25rem] p-8 sm:p-10">
              <p className="text-[0.72rem] font-bold tracking-[0.14em] text-nn-muted uppercase">
                Saved value proposition
              </p>
              <p className="display-type mt-5 text-3xl leading-[1.05] text-nn-ink sm:text-4xl">
                {brandProfile.valueProp}
              </p>
            </div>
          </div>

          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="display-type text-4xl text-nn-ink">Three audience signals</h2>
                <p className="mt-2 text-sm text-nn-muted">Saved from the website analysis.</p>
              </div>
              <span className="nn-chip">{icps.length} ICPs</span>
            </div>

            <ol className="mt-8 grid gap-5">
              {icps.map((icp, index) => (
                <li
                  key={`${icp.role}-${icp.companyType}`}
                  className="nn-card grid gap-6 rounded-[1.25rem] p-6 sm:p-8 md:grid-cols-[64px_1fr_1.15fr]"
                >
                  <span className="nn-num display-type text-4xl text-nn-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-nn-ink">{icp.role}</h3>
                    <p className="mt-1 text-sm text-nn-muted">{icp.companyType}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {icp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-nn-line px-3 py-1 text-xs font-semibold text-nn-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
                        Pain
                      </p>
                      <p className="mt-2 text-sm leading-6 text-nn-ink">{icp.pain}</p>
                    </div>
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
                        Product fit
                      </p>
                      <p className="mt-2 text-sm leading-6 text-nn-ink">{icp.productFit}</p>
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
