import { BrandSidebar } from "@/components/brand/sidebar";
import type { BrandAttributionSnapshot } from "@/lib/analytics/data";

const numberFormat = new Intl.NumberFormat("en");
const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatRate(value: number, previous: number) {
  if (previous === 0) return "—";
  const rate = (value / previous) * 100;
  return `${rate < 0.1 ? rate.toFixed(2) : rate.toFixed(1)}% of prior stage`;
}

function formatCompanyProfile(company: BrandAttributionSnapshot["companies"][number]) {
  return [
    company.isDemo ? "Simulated/demo company" : "Qualified company signal",
    company.industry,
    company.companySize,
  ]
    .filter(Boolean)
    .join(" · ");
}

function StatTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-6">
      <dt className="text-[0.7rem] font-bold tracking-[0.12em] text-nn-muted uppercase">{label}</dt>
      <dd className="nn-num display-type mt-3 text-4xl leading-none text-nn-ink sm:text-5xl">
        {numberFormat.format(value)}
      </dd>
      <p className="mt-3 text-xs leading-5 text-nn-muted">{note}</p>
    </div>
  );
}

function Funnel({ funnel }: { funnel: BrandAttributionSnapshot["funnel"] }) {
  const stages = [
    {
      label: "Impressions",
      value: numberFormat.format(funnel.impressions),
      note: `${numberFormat.format(funnel.impressions)} observed on published posts`,
    },
    {
      label: "Clicks",
      value: numberFormat.format(funnel.clicks),
      note: formatRate(funnel.clicks, funnel.impressions),
    },
    {
      label: "Qualified clicks",
      value: numberFormat.format(funnel.qualifiedClicks),
      note: formatRate(funnel.qualifiedClicks, funnel.clicks),
    },
    {
      label: "Companies engaged",
      value: numberFormat.format(funnel.companiesEngaged),
      note: `${formatRate(funnel.companiesEngaged, funnel.qualifiedClicks)} · distinct names`,
    },
    {
      label: "Pipeline",
      value: "Not connected",
      note: "No opportunity or pipeline records exist in the current schema",
    },
  ];

  return (
    <ol className="mt-7 grid gap-4 md:grid-cols-5">
      {stages.map((stage, index) => (
        <li
          key={stage.label}
          className="relative min-h-44 rounded-[1.25rem] border border-nn-line bg-nn-white px-5 py-5"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="nn-num display-type text-xl text-nn-blue">
              {String(index + 1).padStart(2, "0")}
            </span>
            {index < stages.length - 1 ? (
              <span className="text-lg text-nn-blue/40" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
          <p className="mt-6 text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
            {stage.label}
          </p>
          <p
            className={`nn-num display-type mt-2 leading-none ${
              stage.value === "Not connected" ? "text-2xl text-nn-muted" : "text-4xl text-nn-ink"
            }`}
          >
            {stage.value}
          </p>
          <p className="mt-3 text-xs leading-5 text-nn-muted">{stage.note}</p>
        </li>
      ))}
    </ol>
  );
}

export function BrandAnalyticsDashboard({
  workspaceName,
  snapshot,
}: {
  workspaceName: string;
  snapshot: BrandAttributionSnapshot;
}) {
  return (
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref="/brand/analytics" />

      <section className="min-h-screen bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Analytics</p>
            <p className="text-sm text-nn-muted">All-time evidence · workspace-scoped under RLS</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" />
            Qualified signal
          </span>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <h1 className="display-type max-w-3xl text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
              See which creators turned attention into company signal.
            </h1>
            <div>
              <p className="max-w-md text-lg leading-8 text-nn-muted">
                Every number below is derived from published posts and immutable click events tied
                back to this workspace’s collaborations.
              </p>
              {snapshot.isIllustrative ? (
                <p className="mt-4 text-[0.72rem] font-bold tracking-[0.1em] text-nn-blue uppercase">
                  Simulated/demo data included · illustrative only
                </p>
              ) : null}
            </div>
          </div>

          <section className="mt-16" aria-labelledby="headline-stats-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="headline-stats-title" className="display-type text-4xl text-nn-ink">
                The qualified-click payoff.
              </h2>
              <p className="text-xs text-nn-muted">
                All available history{snapshot.isIllustrative ? " · demo included" : ""}
              </p>
            </div>

            <dl className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                label="Creators activated"
                value={snapshot.stats.creatorsActivated}
                note="Creators with an accepted-or-later collaboration"
              />
              <StatTile
                label="Posts published"
                value={snapshot.stats.postsPublished}
                note="Published post records with measured delivery"
              />
              <StatTile
                label="Qualified clicks"
                value={snapshot.stats.qualifiedClicks}
                note="Click events that passed qualification"
              />
              <StatTile
                label="Companies engaged"
                value={snapshot.stats.companiesEngaged}
                note="Distinct named companies on qualified clicks"
              />
            </dl>
          </section>

          <section className="mt-16" aria-labelledby="funnel-title">
            <div className="grid gap-5 border-nn-line border-b pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <h2 id="funnel-title" className="display-type text-4xl text-nn-ink sm:text-5xl">
                From post reach to attributable demand.
              </h2>
              <p className="max-w-lg text-sm leading-6 text-nn-muted">
                Stage rates use the preceding observed stage. Company engagement only counts
                qualified events with a named company.
              </p>
            </div>
            <Funnel funnel={snapshot.funnel} />
          </section>

          <section className="mt-16" aria-labelledby="creator-attribution-title">
            <div className="flex flex-wrap items-end justify-between gap-4 border-nn-line border-b pb-6">
              <h2 id="creator-attribution-title" className="display-type text-4xl text-nn-ink sm:text-5xl">
                Who actually drove business interest.
              </h2>
              <span className="nn-chip">{numberFormat.format(snapshot.creators.length)} creators</span>
            </div>

            {snapshot.creators.length ? (
              <div className="nn-card mt-6 overflow-x-auto rounded-[1.25rem]">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-nn-line border-b text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                      <th className="px-6 py-4">Creator</th>
                      <th className="px-4 py-4 text-right">Posts</th>
                      <th className="px-4 py-4 text-right">Clicks</th>
                      <th className="px-4 py-4 text-right">Qualified clicks</th>
                      <th className="px-6 py-4 text-right">Companies driven</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.creators.map((creator, index) => (
                      <tr key={creator.id} className="border-nn-line border-b last:border-b-0">
                        <td className="px-6 py-5">
                          <div className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                            <span className="nn-num display-type text-2xl text-nn-blue">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-nn-ink">{creator.displayName}</span>
                                {creator.isDemo ? (
                                  <span className="nn-chip px-2 py-0.5 text-[0.62rem]">Demo activity</span>
                                ) : null}
                              </span>
                              <span className="mt-1 block truncate text-xs text-nn-muted">
                                {creator.headline}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="nn-num display-type px-4 py-5 text-right text-2xl text-nn-ink">
                          {numberFormat.format(creator.posts)}
                        </td>
                        <td className="nn-num display-type px-4 py-5 text-right text-2xl text-nn-ink">
                          {numberFormat.format(creator.clicks)}
                        </td>
                        <td className="nn-num display-type px-4 py-5 text-right text-2xl text-nn-blue">
                          {numberFormat.format(creator.qualifiedClicks)}
                        </td>
                        <td className="nn-num display-type px-6 py-5 text-right text-2xl text-nn-ink">
                          {numberFormat.format(creator.companiesDriven)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-10">
                <p className="display-type text-3xl text-nn-ink">No attributed creator activity yet.</p>
                <p className="mt-2 text-sm text-nn-muted">
                  Published posts and tracked clicks will appear here when available.
                </p>
              </div>
            )}
          </section>

          <section className="mt-16" aria-labelledby="companies-title">
            <div className="grid gap-5 border-nn-line border-b pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <h2 id="companies-title" className="display-type text-4xl text-nn-ink sm:text-5xl">
                Qualified accounts behind the clicks.
              </h2>
              <p className="text-xs leading-5 text-nn-muted">
                Distinct company names from qualified click events only
              </p>
            </div>

            {snapshot.companies.length ? (
              <ol className="mt-6 grid gap-4">
                {snapshot.companies.map((company, index) => (
                  <li
                    key={company.name}
                    className="grid gap-5 rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-6 lg:grid-cols-[64px_minmax(0,1fr)_repeat(3,minmax(110px,auto))] lg:items-center"
                  >
                    <span className="nn-num display-type text-3xl text-nn-blue">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-bold text-nn-ink">{company.name}</h3>
                      <p className="mt-1 text-xs text-nn-muted">
                        {formatCompanyProfile(company)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                        Qualified clicks
                      </p>
                      <p className="nn-num display-type mt-1 text-2xl text-nn-ink">
                        {numberFormat.format(company.qualifiedClicks)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                        Creators
                      </p>
                      <p className="nn-num display-type mt-1 text-2xl text-nn-ink">
                        {numberFormat.format(company.creators)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                        Last signal
                      </p>
                      <p className="mt-2 text-sm text-nn-ink">
                        {dateFormat.format(new Date(company.lastEngagedAt))}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-6 rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-10">
                <p className="display-type text-3xl text-nn-ink">No qualified companies yet.</p>
                <p className="mt-2 text-sm text-nn-muted">
                  Named companies will appear after their clicks pass qualification.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
