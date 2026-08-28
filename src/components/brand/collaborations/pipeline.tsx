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
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref="/brand/collaborations" />

      <section className="min-h-screen min-w-0 bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Collaborations</p>
            <p className="text-sm text-nn-muted">Every creator partnership, from request to results</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" />
            {pipeline.total} records
          </span>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <h1 className="display-type max-w-3xl text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
              Move every creator deal toward publication.
            </h1>
            <p className="max-w-md text-lg leading-8 text-nn-muted">
              Track the current offer, delivery date, and next decision without losing the history
              behind each collaboration.
            </p>
          </div>

          <nav aria-label="Filter collaborations by status" className="mt-10">
            <ul className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const active = filter.id === pipeline.activeFilter;

                return (
                  <li key={filter.id}>
                    <Link
                      href={getFilterHref(filter.id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold tracking-[0.08em] uppercase transition-colors ${
                        active
                          ? "border-nn-blue bg-nn-blue text-white"
                          : "border-nn-line bg-nn-white text-nn-muted hover:border-nn-blue hover:text-nn-blue"
                      }`}
                    >
                      {filter.label}
                      <span className={`nn-num ${active ? "text-white" : "text-nn-ink"}`}>
                        {String(filter.count).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section className="mt-9">
            {pipeline.items.length ? (
              <div className="nn-card overflow-hidden rounded-[1.25rem]">
                <div className="hidden grid-cols-[minmax(220px,1.35fr)_minmax(160px,1fr)_130px_130px_130px_minmax(175px,1fr)] gap-5 border-nn-line border-b px-6 py-4 text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase xl:grid">
                  <span>Creator</span>
                  <span>Campaign</span>
                  <span>Status</span>
                  <span>Offer</span>
                  <span>Post by</span>
                  <span>Next action</span>
                </div>

                <ol>
                  {pipeline.items.map((collaboration, index) => (
                    <li key={collaboration.id} className="border-nn-line border-b last:border-b-0">
                      <Link
                        href={`/brand/collaborations/${collaboration.id}?status=${pipeline.activeFilter}`}
                        className="group grid gap-5 px-6 py-6 transition-colors hover:bg-nn-blue-50 xl:grid-cols-[minmax(220px,1.35fr)_minmax(160px,1fr)_130px_130px_130px_minmax(175px,1fr)] xl:items-center"
                      >
                        <div className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                          <span className="nn-num display-type text-2xl text-nn-blue">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-nn-ink group-hover:text-nn-blue">
                              {collaboration.creator.displayName}
                            </span>
                            <span className="mt-1 block truncate text-xs text-nn-muted">
                              {collaboration.creator.headline}
                            </span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase xl:hidden">
                            Campaign
                          </span>
                          <span className="mt-1 block text-sm font-semibold text-nn-ink xl:mt-0">
                            {collaboration.campaign?.name ?? "No campaign"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase xl:hidden">
                            Status
                          </span>
                          <span className="mt-1 flex items-center gap-2 text-xs font-bold tracking-[0.07em] text-nn-muted uppercase xl:mt-0">
                            <span className="h-2 w-2 rounded-full bg-nn-blue" aria-hidden="true" />
                            {collaboration.statusLabel}
                          </span>
                        </div>

                        <div>
                          <span className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase xl:hidden">
                            Offered amount
                          </span>
                          <span className="nn-num display-type mt-1 block text-xl text-nn-ink xl:mt-0">
                            {formatCollaborationMoney(collaboration.offeredAmount)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase xl:hidden">
                            Post by
                          </span>
                          <span className="mt-1 block text-sm text-nn-ink xl:mt-0">
                            {formatCollaborationDate(collaboration.postBy)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase xl:hidden">
                            Next action
                          </span>
                          <span className="mt-1 flex items-center justify-between gap-3 text-sm font-semibold text-nn-ink xl:mt-0">
                            {collaboration.nextAction}
                            <span
                              className="text-lg text-nn-blue transition-transform group-hover:translate-x-1"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-12">
                <h2 className="display-type text-4xl text-nn-ink">This part of the pipeline is clear.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-nn-muted">
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
