import { BrandSidebar, type BrandNavigationHref } from "@/components/brand/sidebar";
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

function StatTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="bg-paper px-5 py-5 sm:px-6 sm:py-6">
      <dt className="text-[0.7rem] font-bold tracking-[0.12em] text-carbon/48 uppercase">
        {label}
      </dt>
      <dd className="display-type mt-3 text-4xl leading-none sm:text-5xl">
        {numberFormat.format(value)}
      </dd>
      <p className="mt-3 text-xs leading-5 text-carbon/52">{note}</p>
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
    <ol className="mt-7 grid border border-carbon/18 bg-carbon/18 md:grid-cols-5">
      {stages.map((stage, index) => (
        <li
          key={stage.label}
          className={`relative min-h-44 bg-paper px-5 py-5 ${
            index < stages.length - 1 ? "border-carbon/18 border-b md:border-r md:border-b-0" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="display-type text-xl text-aubergine">
              {String(index + 1).padStart(2, "0")}
            </span>
            {index < stages.length - 1 ? (
              <span className="text-lg text-carbon/28" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
          <p className="mt-6 text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
            {stage.label}
          </p>
          <p
            className={`display-type mt-2 leading-none ${
              typeof stage.value === "string" && stage.value === "Not connected"
                ? "text-2xl text-carbon/54"
                : "text-4xl"
            }`}
          >
            {stage.value}
          </p>
          <p className="mt-3 text-xs leading-5 text-carbon/50">{stage.note}</p>
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
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar
        workspaceName={workspaceName}
        activeHref={"/brand/analytics" as BrandNavigationHref}
      />

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Attribution analytics
            </p>
            <p className="text-sm text-carbon/55">All-time evidence · workspace-scoped under RLS</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />
            Qualified signal
          </span>
        </header>

        <div className="px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <div className="grid gap-7 border-carbon/18 border-b pb-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                Attribution dossier · 05
              </p>
              <h1 className="display-type mt-3 max-w-4xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                See which creators turned attention into company signal.
              </h1>
            </div>
            <div className="border-carbon/18 border-l-2 border-l-aubergine bg-mist/38 px-5 py-4">
              <p className="text-sm leading-6 text-carbon/64">
                Every number below is derived from published posts and immutable click events tied
                back to this workspace’s collaborations.
              </p>
              {snapshot.isIllustrative ? (
                <p className="mt-3 text-[0.68rem] font-bold tracking-[0.1em] text-aubergine uppercase">
                  Demo dataset · illustrative observations
                </p>
              ) : null}
            </div>
          </div>

          <section className="pt-10" aria-labelledby="headline-stats-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  Headline evidence
                </p>
                <h2 id="headline-stats-title" className="display-type mt-2 text-4xl">
                  The qualified-click payoff.
                </h2>
              </div>
              <p className="text-xs text-carbon/50">All available history</p>
            </div>

            <dl className="mt-7 grid gap-px border border-carbon/18 bg-carbon/18 sm:grid-cols-2 xl:grid-cols-4">
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

          <section className="pt-14" aria-labelledby="funnel-title">
            <div className="grid gap-5 border-carbon/18 border-b pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  Signal funnel
                </p>
                <h2 id="funnel-title" className="display-type mt-2 text-4xl sm:text-5xl">
                  From post reach to attributable demand.
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-carbon/58">
                Stage rates use the preceding observed stage. Company engagement only counts
                qualified events with a named company.
              </p>
            </div>
            <Funnel funnel={snapshot.funnel} />
          </section>

          <section className="pt-14" aria-labelledby="creator-attribution-title">
            <div className="flex flex-wrap items-end justify-between gap-4 border-carbon/18 border-b pb-6">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  Creator attribution
                </p>
                <h2 id="creator-attribution-title" className="display-type mt-2 text-4xl sm:text-5xl">
                  Who actually drove business interest.
                </h2>
              </div>
              <span className="bg-signal px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">
                {numberFormat.format(snapshot.creators.length)} creators
              </span>
            </div>

            {snapshot.creators.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-carbon/16 border-b text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                      <th className="py-4 pr-6">Creator</th>
                      <th className="px-4 py-4 text-right">Posts</th>
                      <th className="px-4 py-4 text-right">Clicks</th>
                      <th className="px-4 py-4 text-right">Qualified clicks</th>
                      <th className="py-4 pl-4 text-right">Companies driven</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.creators.map((creator, index) => (
                      <tr key={creator.id} className="border-carbon/14 border-b last:border-b-0">
                        <td className="py-5 pr-6">
                          <div className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                            <span className="display-type text-2xl text-aubergine/72">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-bold">{creator.displayName}</span>
                              <span className="mt-1 block truncate text-xs text-carbon/48">
                                {creator.headline}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="display-type px-4 py-5 text-right text-2xl">
                          {numberFormat.format(creator.posts)}
                        </td>
                        <td className="display-type px-4 py-5 text-right text-2xl">
                          {numberFormat.format(creator.clicks)}
                        </td>
                        <td className="display-type px-4 py-5 text-right text-2xl text-aubergine">
                          {numberFormat.format(creator.qualifiedClicks)}
                        </td>
                        <td className="display-type py-5 pl-4 text-right text-2xl">
                          {numberFormat.format(creator.companiesDriven)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-carbon/18 border-b py-10">
                <p className="display-type text-3xl">No attributed creator activity yet.</p>
                <p className="mt-2 text-sm text-carbon/55">
                  Published posts and tracked clicks will appear here when available.
                </p>
              </div>
            )}
          </section>

          <section className="pt-14" aria-labelledby="companies-title">
            <div className="grid gap-5 border-carbon/18 border-b pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  Companies engaged
                </p>
                <h2 id="companies-title" className="display-type mt-2 text-4xl sm:text-5xl">
                  Qualified accounts behind the clicks.
                </h2>
              </div>
              <p className="text-xs leading-5 text-carbon/50">
                Distinct company names from qualified click events only
              </p>
            </div>

            {snapshot.companies.length ? (
              <ol className="border-carbon/18 border-b">
                {snapshot.companies.map((company, index) => (
                  <li
                    key={company.name}
                    className="grid gap-5 border-carbon/14 border-b py-6 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)_repeat(3,minmax(110px,auto))] sm:items-center"
                  >
                    <span className="display-type text-3xl text-aubergine">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-bold">{company.name}</h3>
                      <p className="mt-1 text-xs text-carbon/48">Qualified company signal</p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase">
                        Qualified clicks
                      </p>
                      <p className="display-type mt-1 text-2xl">
                        {numberFormat.format(company.qualifiedClicks)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase">
                        Creators
                      </p>
                      <p className="display-type mt-1 text-2xl">
                        {numberFormat.format(company.creators)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase">
                        Last signal
                      </p>
                      <p className="mt-2 text-sm">
                        {dateFormat.format(new Date(company.lastEngagedAt))}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="border-carbon/18 border-b py-10">
                <p className="display-type text-3xl">No qualified companies yet.</p>
                <p className="mt-2 text-sm text-carbon/55">
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
