import Link from "next/link";
import { redirect } from "next/navigation";

import { CreatorShell } from "@/components/creator/shell";
import { SubmitContentForm } from "@/components/creator/submit-content-form";
import { getCreatorContext } from "@/lib/creator/context";
import {
  getCreatorCollaborations,
  type CreatorCollaboration,
} from "@/lib/creator/data";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatMoney(offer: CreatorCollaboration["offer"]) {
  if (!offer) return "Not set";

  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: offer.currency,
      maximumFractionDigits: 2,
    }).format(offer.feeCents / 100);
  } catch {
    return `${offer.currency} ${(offer.feeCents / 100).toFixed(2)}`;
  }
}

function formatDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : "Not scheduled";
}

const statusContent = {
  accepted: {
    label: "Accepted",
    next: "Publish the sponsored post, then submit its public link.",
  },
  content_submitted: {
    label: "Awaiting brand approval",
    next: "Your published post is with the brand for approval and settlement.",
  },
  completed: {
    label: "Completed",
    next: "The fee has been recorded in your payout ledger.",
  },
} as const;

export default async function CreatorCollaborationsPage() {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/creator/auth");
  if (!context.registeredAsCreator) redirect("/auth");
  if (!context.creator) redirect("/creator/onboarding");

  const collaborations = await getCreatorCollaborations(context.creator.id);

  return (
    <CreatorShell
      creatorName={context.creator.displayName}
      activeHref="/creator/collaborations"
      eyebrow="Creator collaborations"
      detail={`${context.creator.displayName} · ${collaborations.length} records`}
      marker="Settlement workflow"
    >
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="max-w-2xl">
          <h1 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            Take accepted work through to payout.
          </h1>
          <p className="mt-5 text-lg text-nn-muted">
            Submit the public LinkedIn post once it is live. The same collaboration record then
            moves to the brand for approval and settlement.
          </p>
        </div>

        {collaborations.length === 0 ? (
          <div className="nn-card mt-10 p-8 sm:p-10">
            <h2 className="nn-display text-2xl text-nn-ink">Accepted collaborations will appear here.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-nn-muted">
              Review incoming brand invitations under Opportunities to begin a collaboration.
            </p>
          </div>
        ) : (
          <ol className="mt-10 grid list-none gap-6 p-0">
            {collaborations.map((collaboration) => {
              const status = statusContent[collaboration.status];

              return (
                <li
                  key={collaboration.id}
                  className="nn-card grid gap-7 p-7 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(250px,0.5fr)]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="nn-display text-2xl text-nn-ink">
                        {collaboration.campaignName}
                      </h2>
                      <span className="nn-chip">
                        <span className="h-2 w-2 rounded-full bg-nn-blue" aria-hidden="true" />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-nn-muted">
                      {collaboration.deliverables}
                    </p>
                    <dl className="mt-6 grid gap-4 border-nn-line border-t pt-6 sm:grid-cols-3">
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                          Fee
                        </dt>
                        <dd className="nn-display nn-num mt-2 text-2xl text-nn-ink">
                          {formatMoney(collaboration.offer)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                          Post by
                        </dt>
                        <dd className="mt-2 text-sm font-semibold text-nn-ink">
                          {formatDate(collaboration.postBy)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                          Approval
                        </dt>
                        <dd className="mt-2 text-sm font-semibold text-nn-ink">
                          {collaboration.approvalRequired ? "Required" : "Not required"}
                        </dd>
                      </div>
                    </dl>
                    {collaboration.status === "accepted" ? (
                      <SubmitContentForm collaborationId={collaboration.id} />
                    ) : null}
                    {collaboration.contentUrl ? (
                      <p className="mt-5 text-sm">
                        <a
                          href={collaboration.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-nn-blue hover:text-nn-blue-strong"
                        >
                          View submitted post <span aria-hidden="true">↗</span>
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <aside className="rounded-[var(--nn-radius-sm)] bg-nn-blue-50 p-6">
                    <p className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                      Next action
                    </p>
                    <p className="mt-3 text-sm leading-6 text-nn-ink">{status.next}</p>
                    <Link
                      href={`/creator/collaborations/${collaboration.id}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-nn-blue hover:text-nn-blue-strong"
                    >
                      Open collaboration <span aria-hidden="true">→</span>
                    </Link>
                  </aside>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </CreatorShell>
  );
}
