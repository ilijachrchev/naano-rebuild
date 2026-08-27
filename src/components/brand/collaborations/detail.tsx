import Link from "next/link";

import { BrandSidebar } from "@/components/brand/sidebar";
import type {
  BrandCollaborationDetail,
  CollaborationMoney,
  PipelineFilter,
} from "@/lib/collaborations/data";

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatMoney(money: CollaborationMoney | null) {
  if (!money) return "Not set";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(money.cents / 100);
}

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not scheduled";
}

function formatDateTime(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Date unavailable";
}

function actorLabel(role: "brand" | "creator" | "system") {
  if (role === "brand") return "Brand team";
  if (role === "creator") return "Creator";
  return "System";
}

export function BrandCollaborationDetailView({
  workspaceName,
  collaboration,
  backFilter,
}: {
  workspaceName: string;
  collaboration: BrandCollaborationDetail;
  backFilter: PipelineFilter;
}) {
  const backHref =
    backFilter === "all"
      ? "/brand/collaborations"
      : `/brand/collaborations?status=${backFilter}`;

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref="/brand/collaborations" />

      <section className="dossier-paper min-h-screen min-w-0">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Collaboration dossier
            </p>
            <p className="text-sm text-carbon/55">Terms, negotiation record, and delivery timeline</p>
          </div>
          <Link
            href={backHref}
            className="text-xs font-bold tracking-[0.09em] text-carbon/56 uppercase hover:text-aubergine"
          >
            ← Back to pipeline
          </Link>
        </header>

        <div className="px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <div className="grid gap-8 border-carbon/18 border-b pb-10 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />
                {collaboration.statusLabel}
              </p>
              <h1 className="display-type mt-4 text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                {collaboration.creator.displayName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-carbon/62">
                {collaboration.creator.headline}
              </p>
            </div>
            <div className="border-carbon/18 border-t pt-6 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-8">
              <p className="text-[0.7rem] font-bold tracking-[0.11em] text-carbon/46 uppercase">Campaign</p>
              <p className="display-type mt-3 text-3xl">
                {collaboration.campaign?.name ?? "No campaign attached"}
              </p>
              <p className="mt-5 text-sm font-semibold text-aubergine">Next · {collaboration.nextAction}</p>
            </div>
          </div>

          <dl className="grid border-carbon/18 border-b sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-carbon/16 border-b px-0 py-6 sm:border-r sm:px-5 xl:border-b-0 xl:first:pl-0">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/44 uppercase">Offered amount</dt>
              <dd className="display-type mt-2 text-3xl">{formatMoney(collaboration.offeredAmount)}</dd>
            </div>
            <div className="border-carbon/16 border-b px-0 py-6 sm:px-5 xl:border-r xl:border-b-0">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/44 uppercase">Post by</dt>
              <dd className="mt-3 text-sm font-bold">{formatDate(collaboration.postBy)}</dd>
            </div>
            <div className="border-carbon/16 border-b px-0 py-6 sm:border-r sm:px-5 xl:border-b-0">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/44 uppercase">Origin</dt>
              <dd className="mt-3 text-sm font-bold">
                {collaboration.origin === "brand_invite" ? "Brand invitation" : "Creator application"}
              </dd>
            </div>
            <div className="px-0 py-6 sm:px-5 xl:pr-0">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/44 uppercase">Approval</dt>
              <dd className="mt-3 text-sm font-bold">
                {collaboration.approvalRequired ? "Required before publishing" : "Not required"}
              </dd>
            </div>
          </dl>

          <section className="border-carbon/18 border-b py-8">
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Delivery terms</p>
            <p className="mt-3 max-w-3xl text-base leading-7">
              {collaboration.deliverables ?? "No delivery description was recorded."}
            </p>
            {collaboration.respondBy && collaboration.stage === "requested" ? (
              <p className="mt-3 text-xs font-bold tracking-[0.08em] text-carbon/52 uppercase">
                Response due · {formatDateTime(collaboration.respondBy)}
              </p>
            ) : null}
          </section>

          <div className="grid gap-12 pt-10 xl:grid-cols-2">
            <section>
              <div className="flex items-end justify-between gap-4 border-carbon/18 border-b pb-5">
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Offer history</p>
                  <h2 className="display-type mt-2 text-4xl">Negotiation record</h2>
                </div>
                <span className="bg-signal px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">
                  {collaboration.offers.length}
                </span>
              </div>

              {collaboration.offers.length ? (
                <ol>
                  {collaboration.offers.map((offer, index) => (
                    <li key={offer.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-carbon/14 border-b py-5">
                      <span className="display-type text-2xl text-aubergine/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold">
                              {offer.proposerRole === "brand" ? "Brand offer" : "Creator offer"}
                            </p>
                            <p className="mt-1 text-xs text-carbon/50">{formatDateTime(offer.createdAt)}</p>
                          </div>
                          <p className="display-type text-2xl">{formatMoney(offer.offeredAmount)}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold tracking-[0.08em] uppercase">
                          <span className="text-carbon/46">List {formatMoney(offer.listPrice)}</span>
                          {offer.isAccepted ? <span className="bg-signal px-2 py-1">Accepted terms</span> : null}
                          {offer.isCurrent && !offer.isAccepted ? (
                            <span className="border border-carbon/20 px-2 py-1">Current offer</span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="border-carbon/18 border-b py-7 text-sm leading-6 text-carbon/56">
                  No offer snapshots are visible for this collaboration.
                </p>
              )}
            </section>

            <section className="xl:border-carbon/18 xl:border-l xl:pl-10">
              <div className="flex items-end justify-between gap-4 border-carbon/18 border-b pb-5">
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Timeline</p>
                  <h2 className="display-type mt-2 text-4xl">Lifecycle evidence</h2>
                </div>
                <span className="bg-signal px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">
                  {collaboration.timeline.length}
                </span>
              </div>

              {collaboration.timeline.length ? (
                <ol>
                  {collaboration.timeline.map((event, index) => (
                    <li key={event.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-carbon/14 border-b py-5">
                      <span className="display-type flex h-8 w-8 items-center justify-center rounded-full bg-signal text-base">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-bold">{event.label}</p>
                        <p className="mt-1 text-xs text-carbon/50">
                          {actorLabel(event.actorRole)} · {formatDateTime(event.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="border-carbon/18 border-b py-7 text-sm leading-6 text-carbon/56">
                  No timeline events are visible for this collaboration.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
