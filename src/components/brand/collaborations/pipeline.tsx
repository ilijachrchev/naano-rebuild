import Link from "next/link";

import { BrandSidebar } from "@/components/brand/sidebar";
import {
  PIPELINE_STAGES,
  type BrandCollaborationPipeline,
  type PipelineFilter,
} from "@/lib/collaborations/data";
import {
  formatCollaborationDate,
  formatCollaborationMoney,
} from "@/lib/collaborations/format";

const stageLabels = {
  requested: "Requested",
  negotiating: "Negotiating",
  accepted: "Accepted",
  published: "Published",
  completed: "Completed",
  declined: "Declined",
} as const;

function getFilterHref(filter: PipelineFilter) {
  return filter === "all" ? "/brand/collaborations" : `/brand/collaborations?status=${filter}`;
}

export function BrandCollaborationsPipelineView({
  workspaceName,
  pipeline,
}: {
  workspaceName: string;
  pipeline: BrandCollaborationPipeline;
}) {
  const filters: { id: PipelineFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: pipeline.total },
    ...PIPELINE_STAGES.map((stage) => ({
      id: stage,
      label: stageLabels[stage],
      count: pipeline.counts[stage],
    })),
  ];

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref="/brand/collaborations" />

      <section className="dossier-paper min-h-screen min-w-0">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Collaboration dossier
            </p>
            <p className="text-sm text-carbon/55">Every creator partnership, from request to results</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />
            {pipeline.total} records
          </span>
        </header>

        <div className="px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <div className="grid gap-7 border-carbon/18 border-b pb-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                Partnership pipeline · 04
              </p>
              <h1 className="display-type mt-3 max-w-4xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                Move every creator deal toward publication.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-carbon/64 xl:border-carbon/18 xl:border-l xl:pl-8">
              Track the current offer, delivery date, and next decision without losing the history
              behind each collaboration.
            </p>
          </div>

          <nav
            aria-label="Filter collaborations by status"
            className="mt-8 overflow-hidden border-carbon/18 border-y sm:overflow-x-auto"
          >
            <ul className="grid grid-cols-2 sm:flex sm:min-w-max">
              {filters.map((filter) => {
                const active = filter.id === pipeline.activeFilter;

                return (
                  <li
                    key={filter.id}
                    className="border-carbon/16 border-r border-b last:col-span-2 last:border-b-0 sm:border-b-0 sm:last:col-span-1 sm:last:border-r-0"
                  >
                    <Link
                      href={getFilterHref(filter.id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-14 items-center justify-between gap-3 px-4 text-[0.7rem] font-bold tracking-[0.1em] uppercase transition-colors sm:min-h-16 sm:justify-start sm:px-5 ${
                        active ? "bg-signal text-carbon" : "text-carbon/56 hover:bg-mist/45 hover:text-carbon"
                      }`}
                    >
                      {filter.label}
                      <span className={`display-type text-xl ${active ? "text-carbon" : "text-aubergine"}`}>
                        {String(filter.count).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section className="mt-9">
            <div className="hidden grid-cols-[minmax(220px,1.35fr)_minmax(160px,1fr)_130px_130px_130px_minmax(175px,1fr)] gap-5 border-carbon/18 border-b px-3 pb-3 text-[0.68rem] font-bold tracking-[0.1em] text-carbon/46 uppercase xl:grid">
              <span>Creator</span>
              <span>Campaign</span>
              <span>Status</span>
              <span>Offer</span>
              <span>Post by</span>
              <span>Next action</span>
            </div>

            {pipeline.items.length ? (
              <ol className="border-carbon/18 border-b">
                {pipeline.items.map((collaboration, index) => (
                  <li key={collaboration.id} className="border-carbon/14 border-b last:border-b-0">
                    <Link
                      href={`/brand/collaborations/${collaboration.id}?status=${pipeline.activeFilter}`}
                      className="group grid gap-5 px-3 py-6 transition-colors hover:bg-mist/35 xl:grid-cols-[minmax(220px,1.35fr)_minmax(160px,1fr)_130px_130px_130px_minmax(175px,1fr)] xl:items-center"
                    >
                      <div className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                        <span className="display-type text-2xl text-aubergine/72">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold group-hover:text-aubergine">
                            {collaboration.creator.displayName}
                          </span>
                          <span className="mt-1 block truncate text-xs text-carbon/48">
                            {collaboration.creator.headline}
                          </span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase xl:hidden">
                          Campaign
                        </span>
                        <span className="mt-1 block text-sm font-semibold xl:mt-0">
                          {collaboration.campaign?.name ?? "No campaign"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase xl:hidden">
                          Status
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs font-bold tracking-[0.07em] uppercase xl:mt-0">
                          <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
                          {collaboration.statusLabel}
                        </span>
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase xl:hidden">
                          Offered amount
                        </span>
                        <span className="display-type mt-1 block text-xl xl:mt-0">
                          {formatCollaborationMoney(collaboration.offeredAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase xl:hidden">
                          Post by
                        </span>
                        <span className="mt-1 block text-sm xl:mt-0">
                          {formatCollaborationDate(collaboration.postBy)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/42 uppercase xl:hidden">
                          Next action
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-3 text-sm font-semibold xl:mt-0">
                          {collaboration.nextAction}
                          <span className="text-lg text-aubergine transition-transform group-hover:translate-x-1" aria-hidden="true">
                            →
                          </span>
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="border-carbon/18 border-y px-4 py-12">
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  No records in this stage
                </p>
                <h2 className="display-type mt-3 text-4xl">This part of the pipeline is clear.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-carbon/58">
                  Choose another status to review the collaborations currently moving through the workspace.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
