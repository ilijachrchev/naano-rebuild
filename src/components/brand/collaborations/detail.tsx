import Link from "next/link";

import { ApproveSettlementForm } from "@/components/brand/collaborations/approve-settlement-form";
import { BrandSidebar } from "@/components/brand/sidebar";
import { MessageThread } from "@/components/collaborations/message-thread";
import type { CollaborationMessage } from "@/lib/collaboration-messages";
import type {
  BrandCollaborationDetail,
  PipelineFilter,
} from "@/lib/collaborations/data";
import {
  formatCollaborationDate,
  formatCollaborationDateTime,
  formatCollaborationMoney,
} from "@/lib/collaborations/format";

function actorLabel(role: "brand" | "creator" | "system") {
  if (role === "brand") return "Brand team";
  if (role === "creator") return "Creator";
  return "System";
}

export function BrandCollaborationDetailView({
  workspaceId,
  workspaceName,
  currentUserId,
  collaboration,
  messages,
  backFilter,
}: {
  workspaceId: string;
  workspaceName: string;
  currentUserId: string;
  collaboration: BrandCollaborationDetail;
  messages: CollaborationMessage[];
  backFilter: PipelineFilter;
}) {
  const backHref =
    backFilter === "all"
      ? "/brand/collaborations"
      : `/brand/collaborations?status=${backFilter}`;

  return (
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref="/brand/collaborations" />

      <section className="min-h-screen min-w-0 bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Collaborations</p>
            <p className="text-sm text-nn-muted">Terms, negotiation record, and delivery timeline</p>
          </div>
          <Link
            href={backHref}
            className="text-xs font-bold tracking-[0.09em] text-nn-muted uppercase hover:text-nn-blue"
          >
            ← Back to pipeline
          </Link>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-8 border-nn-line border-b pb-12 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-nn-muted uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" />
                {collaboration.statusLabel}
              </p>
              <h1 className="display-type mt-4 text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
                {collaboration.creator.displayName}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-nn-muted">
                {collaboration.creator.headline}
              </p>
            </div>
            <div className="nn-card rounded-[1.25rem] p-6 sm:p-8">
              <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Campaign</p>
              <p className="display-type mt-3 text-3xl text-nn-ink">
                {collaboration.campaign?.name ?? "No campaign attached"}
              </p>
              <p className="mt-5 text-sm font-semibold text-nn-blue">Next · {collaboration.nextAction}</p>
            </div>
          </div>

          <dl className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Offered amount</dt>
              <dd className="nn-num display-type mt-2 text-3xl text-nn-ink">
                {formatCollaborationMoney(collaboration.offeredAmount)}
              </dd>
            </div>
            <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Post by</dt>
              <dd className="mt-3 text-sm font-bold text-nn-ink">
                {formatCollaborationDate(collaboration.postBy)}
              </dd>
            </div>
            <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Origin</dt>
              <dd className="mt-3 text-sm font-bold text-nn-ink">
                {collaboration.origin === "brand_invite" ? "Brand invitation" : "Creator application"}
              </dd>
            </div>
            <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-5 py-5">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Approval</dt>
              <dd className="mt-3 text-sm font-bold text-nn-ink">
                {collaboration.approvalRequired ? "Required before publishing" : "Not required"}
              </dd>
            </div>
          </dl>

          <section className="border-nn-line border-b py-10">
            <h2 className="text-sm font-bold text-nn-ink">Delivery terms</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-nn-ink">
              {collaboration.deliverables ?? "No delivery description was recorded."}
            </p>
            {collaboration.respondBy && collaboration.stage === "requested" ? (
              <p className="mt-3 text-xs font-bold tracking-[0.08em] text-nn-muted uppercase">
                Response due · {formatCollaborationDateTime(collaboration.respondBy)}
              </p>
            ) : null}
            {collaboration.contentUrl ? (
              <p className="mt-5 text-sm">
                <a
                  href={collaboration.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-nn-blue hover:text-nn-blue-strong"
                >
                  Review submitted post <span aria-hidden="true">↗</span>
                </a>
              </p>
            ) : null}
          </section>

          {collaboration.settlementEligible ? (
            <section className="grid gap-7 border-nn-line border-b py-10 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="rounded-[1.25rem] bg-nn-blue-50 px-6 py-6">
                <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-blue uppercase">
                  Settlement ready
                </p>
                <h2 className="display-type mt-2 text-3xl text-nn-ink">Approve the work and release the fee.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-nn-ink">
                  This atomically captures the reserved funds, charges the wallet, records the creator payout,
                  and completes the collaboration.
                </p>
              </div>
              <ApproveSettlementForm workspaceId={workspaceId} collaborationId={collaboration.id} />
            </section>
          ) : null}

          <div className="grid gap-12 pt-12 xl:grid-cols-2">
            <section>
              <div className="flex items-end justify-between gap-4 border-nn-line border-b pb-5">
                <h2 className="display-type text-3xl text-nn-ink">Negotiation record</h2>
                <span className="nn-chip">{collaboration.offers.length}</span>
              </div>

              {collaboration.offers.length ? (
                <ol className="grid gap-4 pt-5">
                  {collaboration.offers.map((offer, index) => (
                    <li
                      key={offer.id}
                      className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 rounded-[1.25rem] border border-nn-line bg-nn-white px-5 py-5"
                    >
                      <span className="nn-num display-type text-2xl text-nn-blue">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-nn-ink">
                              {offer.proposerRole === "brand" ? "Brand offer" : "Creator offer"}
                            </p>
                            <p className="mt-1 text-xs text-nn-muted">
                              {formatCollaborationDateTime(offer.createdAt)}
                            </p>
                          </div>
                          <p className="nn-num display-type text-2xl text-nn-ink">
                            {formatCollaborationMoney(offer.offeredAmount)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold tracking-[0.08em] uppercase">
                          <span className="text-nn-muted">
                            List {formatCollaborationMoney(offer.listPrice)}
                          </span>
                          {offer.isAccepted ? (
                            <span className="rounded-full bg-nn-blue px-2.5 py-1 text-white">Accepted terms</span>
                          ) : null}
                          {offer.isCurrent && !offer.isAccepted ? (
                            <span className="rounded-full border border-nn-line px-2.5 py-1 text-nn-muted">
                              Current offer
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="pt-7 text-sm leading-6 text-nn-muted">
                  No offer snapshots are visible for this collaboration.
                </p>
              )}
            </section>

            <section className="xl:border-nn-line xl:border-l xl:pl-10">
              <div className="flex items-end justify-between gap-4 border-nn-line border-b pb-5">
                <h2 className="display-type text-3xl text-nn-ink">Lifecycle timeline</h2>
                <span className="nn-chip">{collaboration.timeline.length}</span>
              </div>

              {collaboration.timeline.length ? (
                <ol className="pt-5">
                  {collaboration.timeline.map((event, index) => (
                    <li
                      key={event.id}
                      className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-nn-line border-b py-5 last:border-b-0"
                    >
                      <span className="nn-num display-type flex h-8 w-8 items-center justify-center rounded-full bg-nn-blue-50 text-base text-nn-blue">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-nn-ink">{event.label}</p>
                        <p className="mt-1 text-xs text-nn-muted">
                          {actorLabel(event.actorRole)} · {formatCollaborationDateTime(event.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="pt-7 text-sm leading-6 text-nn-muted">
                  No timeline events are visible for this collaboration.
                </p>
              )}
            </section>
          </div>

          <MessageThread
            collaborationId={collaboration.id}
            creatorId={collaboration.creator.id}
            creatorName={collaboration.creator.displayName}
            currentUserId={currentUserId}
            messages={messages}
          />
        </div>
      </section>
    </main>
  );
}
