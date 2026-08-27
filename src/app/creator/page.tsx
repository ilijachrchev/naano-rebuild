import Link from "next/link";
import { redirect } from "next/navigation";

import { CreatorShell } from "@/components/creator/shell";
import { getCreatorContext } from "@/lib/creator/context";
import { getCreatorOverviewStats } from "@/lib/creator/data";

const numberFormat = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const eurFormat = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

function initials(displayName: string) {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CR"
  );
}

export default async function CreatorOverviewPage() {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/creator/auth");
  if (!context.registeredAsCreator) redirect("/auth");
  if (!context.creator) redirect("/creator/onboarding");

  const creator = context.creator;
  const stats = await getCreatorOverviewStats(creator.id);

  return (
    <CreatorShell
      creatorName={creator.displayName}
      activeHref="/creator"
      eyebrow="Creator desk"
      detail="Your marketplace card and live handshake"
      marker={creator.marketplaceVisible ? "Listed" : "Private"}
    >
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-10 border-carbon/18 border-b pb-12 xl:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Supply dossier · 01
            </p>
            <h1 className="display-type mt-3 text-5xl leading-[0.92] sm:text-6xl">
              Your creator signal, ready for brands.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-carbon/62">
              One card powers discovery, incoming invitations, and the earnings record on the other side of every collaboration.
            </p>
          </div>

          <article className="border-carbon/22 border-t pt-7 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
              <div className="display-type flex h-24 w-24 shrink-0 items-center justify-center bg-aubergine text-4xl text-white">
                {initials(creator.displayName)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="display-type text-4xl leading-none">{creator.displayName}</h2>
                  {creator.marketplaceVisible ? (
                    <span className="bg-signal px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.1em] uppercase">
                      Marketplace ready
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-xl text-base leading-7 text-carbon/70">{creator.headline}</p>
                <p className="mt-2 text-sm text-carbon/52">{creator.country}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {creator.industries.map((industry) => (
                    <span key={industry} className="border border-carbon/18 px-2.5 py-1 text-xs font-semibold">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-3 border-carbon/18 border-y">
              <div className="border-carbon/16 border-r px-3 py-5 first:pl-0">
                <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Followers</dt>
                <dd className="display-type mt-2 text-3xl">{numberFormat.format(creator.followers)}</dd>
              </div>
              <div className="border-carbon/16 border-r px-3 py-5">
                <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Est. views</dt>
                <dd className="display-type mt-2 text-3xl">{numberFormat.format(creator.estimatedImpressions)}</dd>
              </div>
              <div className="px-3 py-5 pr-0">
                <dt className="text-[0.65rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Post rate</dt>
                <dd className="display-type mt-2 text-3xl">
                  {creator.pricePerPostCents === null ? "—" : eurFormat.format(creator.pricePerPostCents / 100)}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <section className="pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Live record</p>
              <h2 className="display-type mt-2 text-4xl">The handshake at a glance.</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/creator/collaborations" className="text-sm font-bold text-aubergine hover:text-aubergine-deep">
                Open collaborations <span aria-hidden="true">→</span>
              </Link>
              <Link href="/creator/referrals" className="text-sm font-bold text-aubergine hover:text-aubergine-deep">
                Referral program <span aria-hidden="true">→</span>
              </Link>
              {stats.incomingInvites > 0 ? (
                <Link href="/creator/opportunities" className="primary-button min-h-0 py-3">
                  Review invitations <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>

          <dl className="mt-7 grid border-carbon/20 border-y md:grid-cols-4">
            {[
              ["Incoming", stats.incomingInvites.toString(), "Awaiting your response"],
              ["Active", stats.activeCollaborations.toString(), "Accepted through published"],
              ["Recorded", eurFormat.format(stats.totalEarningsCents / 100), "All payout records"],
              ["Available", eurFormat.format(stats.availableEarningsCents / 100), "Ready in the demo ledger"],
            ].map(([label, value, note]) => (
              <div key={label} className="border-carbon/16 border-b px-5 py-6 last:border-b-0 md:border-r md:border-b-0 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">{label}</dt>
                <dd className="display-type mt-3 text-4xl">{value}</dd>
                <p className="mt-2 text-xs leading-5 text-carbon/52">{note}</p>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </CreatorShell>
  );
}
