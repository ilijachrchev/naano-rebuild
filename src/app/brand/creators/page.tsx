import { redirect } from "next/navigation";

import { CreatorMarketplace } from "@/components/brand/creators/creator-marketplace";
import { BrandSidebar } from "@/components/brand/sidebar";
import { getBookingBriefOptions } from "@/lib/booking/data";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { getMarketplaceCreators } from "@/lib/marketplace/creators";

function getBookingDates() {
  const date = new Date();
  const minPostBy = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 14);
  return { minPostBy, defaultPostBy: date.toISOString().slice(0, 10) };
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
  const bookingDates = getBookingDates();

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand/creators" />

      <section className="min-h-screen bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Creators</p>
            <p className="text-sm text-nn-muted">Seeded profiles, filtered through row-level security</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" /> Matched
          </span>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <h1 className="display-type max-w-3xl text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
              Creators matched to your market signal.
            </h1>
            <p className="max-w-md text-lg leading-8 text-nn-muted">
              Compare audience evidence, then open a creator to attach a brief, set the terms, and
              reserve the offer from your wallet.
            </p>
          </div>

          <div className="mt-12">
            <CreatorMarketplace
              creators={creators}
              briefs={briefs}
              workspaceId={workspace.id}
              defaultPostBy={bookingDates.defaultPostBy}
              minPostBy={bookingDates.minPostBy}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
