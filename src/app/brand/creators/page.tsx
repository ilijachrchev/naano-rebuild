import { redirect } from "next/navigation";

import { CreatorMarketplace } from "@/components/brand/creators/creator-marketplace";
import { BrandSidebar } from "@/components/brand/sidebar";
import { getBookingBriefOptions } from "@/lib/booking/data";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { getMarketplaceCreators } from "@/lib/marketplace/creators";

function getDefaultPostBy() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  return date.toISOString().slice(0, 10);
}

export default async function BrandCreatorsPage() {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const [creators, briefs] = await Promise.all([
    getMarketplaceCreators(workspace.id),
    getBookingBriefOptions(workspace.id),
  ]);

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand/creators" />

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Creator marketplace</p>
            <p className="text-sm text-carbon/55">Seeded profiles, filtered through row-level security</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" /> Matched
          </span>
        </header>

        <div className="px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <div className="grid gap-7 border-carbon/18 border-b pb-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Discovery dossier · 02</p>
              <h1 className="display-type mt-3 max-w-4xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                Creators matched to your market signal.
              </h1>
            </div>
            <div className="border-carbon/18 border-l-2 border-l-aubergine bg-mist/38 px-5 py-4">
              <p className="text-sm leading-6 text-carbon/64">
                Compare reach, expected efficiency, and audience evidence before opening a creator dossier. Booking and invitations are intentionally out of scope.
              </p>
            </div>
          </div>

          <div className="mt-9">
            <CreatorMarketplace
              creators={creators}
              briefs={briefs}
              workspaceId={workspace.id}
              defaultPostBy={getDefaultPostBy()}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
