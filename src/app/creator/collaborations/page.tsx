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
      detail="Accepted work, submitted posts, and completed payouts"
      marker={`${collaborations.length} records`}
    >
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-7 border-carbon/18 border-b pb-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Supply dossier · 03
            </p>
            <h1 className="display-type mt-3 max-w-4xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
              Take accepted work through to payout.
            </h1>
          </div>
          <p className="max-w-2xl border-carbon/18 text-base leading-7 text-carbon/64 xl:border-l xl:pl-8">
            Submit the public LinkedIn post once it is live. The same collaboration record then
            moves to the brand for approval and settlement.
          </p>
        </div>

        {collaborations.length === 0 ? (
          <section className="mt-10 border-carbon/20 border-y py-12">
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              No active work
            </p>
            <h2 className="display-type mt-4 text-4xl">Accepted collaborations will appear here.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-carbon/58">
              Review incoming brand invitations under Opportunities to begin a collaboration.
            </p>
          </section>
        ) : (
          <ol className="mt-10 border-carbon/20 border-y">
            {collaborations.map((collaboration, index) => {
              const status = statusContent[collaboration.status];

              return (
                <li
                  key={collaboration.id}
                  className="grid gap-7 border-carbon/16 border-b py-8 last:border-b-0 xl:grid-cols-[72px_minmax(0,1fr)_minmax(270px,0.62fr)]"
                >
                  <span className="display-type text-4xl text-aubergine">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="display-type text-4xl leading-none">
                        {collaboration.campaignName}
                      </h2>
                      <span className="flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.09em] uppercase">
                        <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-carbon/64">
                      {collaboration.deliverables}
                    </p>
                    <dl className="mt-6 grid gap-4 border-carbon/16 border-t pt-5 sm:grid-cols-3">
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/46 uppercase">
                          Fee
                        </dt>
                        <dd className="display-type mt-2 text-2xl">
                          {formatMoney(collaboration.offer)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/46 uppercase">
                          Post by
                        </dt>
                        <dd className="mt-2 text-sm font-semibold">
                          {formatDate(collaboration.postBy)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/46 uppercase">
                          Approval
                        </dt>
                        <dd className="mt-2 text-sm font-semibold">
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
                          className="font-bold text-aubergine hover:text-aubergine-deep"
                        >
                          View submitted post <span aria-hidden="true">↗</span>
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <aside className="border-carbon/18 border-l-2 border-l-aubergine bg-mist/38 px-5 py-5">
                    <p className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                      Next action
                    </p>
                    <p className="mt-3 text-sm leading-6 text-carbon/68">{status.next}</p>
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
