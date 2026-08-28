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
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="max-w-2xl">
          <h1 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            Your creator signal, ready for brands.
          </h1>
          <p className="mt-5 text-lg text-nn-muted">
            One card powers discovery, incoming invitations, and the earnings record on the other
            side of every collaboration.
          </p>
        </div>

        <article className="nn-card mt-10 p-7 sm:p-9">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
            <div className="nn-display flex h-24 w-24 shrink-0 items-center justify-center rounded-[var(--nn-radius)] bg-nn-blue text-4xl text-white shadow-[0_16px_34px_-16px_rgb(31_68_255/0.6)]">
              {initials(creator.displayName)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="nn-display text-3xl text-nn-ink">{creator.displayName}</h2>
                {creator.marketplaceVisible ? (
                  <span className="nn-chip">Marketplace ready</span>
                ) : null}
              </div>
              <p className="mt-3 max-w-xl text-base leading-7 text-nn-muted">{creator.headline}</p>
              <p className="mt-2 text-sm text-nn-muted">{creator.country}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {creator.industries.map((industry) => (
                  <span key={industry} className="nn-chip">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--nn-radius-sm)] border border-nn-line bg-nn-line sm:grid-cols-3">
            {[
              ["Followers", numberFormat.format(creator.followers)],
              ["Est. views", numberFormat.format(creator.estimatedImpressions)],
              [
                "Post rate",
                creator.pricePerPostCents === null
                  ? "—"
                  : eurFormat.format(creator.pricePerPostCents / 100),
              ],
            ].map(([label, value]) => (
              <div key={label} className="bg-nn-white px-5 py-5">
                <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                  {label}
                </dt>
                <dd className="nn-display nn-num mt-2 text-3xl text-nn-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 className="nn-display text-[clamp(1.75rem,3vw,2.5rem)] text-nn-ink">
              The handshake at a glance.
            </h2>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/creator/collaborations"
                className="text-sm font-bold text-nn-blue hover:text-nn-blue-strong"
              >
                Open collaborations <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/creator/referrals"
                className="text-sm font-bold text-nn-blue hover:text-nn-blue-strong"
              >
                Referral program <span aria-hidden="true">→</span>
              </Link>
              {stats.incomingInvites > 0 ? (
                <Link href="/creator/opportunities" className="nn-btn nn-btn-primary">
                  Review invitations <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>

          <dl className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Incoming", stats.incomingInvites.toString(), "Awaiting your response"],
              ["Active", stats.activeCollaborations.toString(), "Accepted through published"],
              ["Recorded", eurFormat.format(stats.totalEarningsCents / 100), "All payout records"],
              ["Available", eurFormat.format(stats.availableEarningsCents / 100), "Ready in the demo ledger"],
            ].map(([label, value, note]) => (
              <div key={label} className="nn-card p-6">
                <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                  {label}
                </dt>
                <dd className="nn-display nn-num mt-3 text-4xl text-nn-ink">{value}</dd>
                <p className="mt-2 text-sm leading-5 text-nn-muted">{note}</p>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </CreatorShell>
  );
}
