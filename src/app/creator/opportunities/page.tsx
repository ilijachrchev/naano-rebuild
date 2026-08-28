import { redirect } from "next/navigation";

import { InviteDecisionForm } from "@/components/creator/invite-decision-form";
import { CreatorShell } from "@/components/creator/shell";
import { getCreatorContext } from "@/lib/creator/context";
import { getIncomingInvites } from "@/lib/creator/data";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const deadlineFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

function formatMoney(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amountCents / 100);
  } catch {
    return `${currency} ${(amountCents / 100).toFixed(2)}`;
  }
}

function formatDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : "Not specified";
}

function formatDeadline(value: string | null) {
  return value ? `${deadlineFormat.format(new Date(value))} UTC` : "Not specified";
}

export default async function CreatorOpportunitiesPage() {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/creator/auth");
  if (!context.registeredAsCreator) redirect("/auth");
  if (!context.creator) redirect("/creator/onboarding");

  const invites = await getIncomingInvites(context.creator.id);

  return (
    <CreatorShell
      creatorName={context.creator.displayName}
      activeHref="/creator/opportunities"
      eyebrow="Incoming opportunities"
      detail="Brand invitations awaiting your decision"
      marker={`${invites.length} open`}
    >
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="max-w-2xl">
          <h1 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            A clean yes or no on every invitation.
          </h1>
          <p className="mt-5 text-lg text-nn-muted">
            Review the fixed offer as sent. Your response changes collaboration state only; pricing
            and terms remain locked.
          </p>
        </div>

        {invites.length === 0 ? (
          <div className="nn-card mt-10 p-8 sm:p-10">
            <h2 className="nn-display text-2xl text-nn-ink">No brand invitations need a response.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-nn-muted">
              New requested collaborations will appear here through the same shared marketplace
              record brands use.
            </p>
          </div>
        ) : (
          <ol className="mt-10 grid list-none gap-6 p-0">
            {invites.map((invite) => {
              const discounted = invite.offer.feeCents < invite.offer.listPriceCents;

              return (
                <li
                  key={invite.id}
                  className="nn-card grid gap-7 p-7 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(250px,0.5fr)]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="nn-display text-2xl text-nn-ink">{invite.campaignName}</h2>
                      {invite.region ? <span className="nn-chip">{invite.region}</span> : null}
                    </div>
                    {invite.objective ? (
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-nn-muted">{invite.objective}</p>
                    ) : null}
                    <dl className="mt-6 grid gap-4 border-nn-line border-t pt-6 sm:grid-cols-3">
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Deliverable</dt>
                        <dd className="mt-2 text-sm leading-6 text-nn-ink">{invite.deliverables}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Post by</dt>
                        <dd className="mt-2 text-sm font-semibold text-nn-ink">{formatDate(invite.postBy)}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Approval</dt>
                        <dd className="mt-2 text-sm font-semibold text-nn-ink">{invite.approvalRequired ? "Required" : "Not required"}</dd>
                      </div>
                    </dl>
                  </div>
                  <aside className="rounded-[var(--nn-radius-sm)] bg-nn-blue-50 p-6">
                    <p className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Fixed offer</p>
                    <p className="nn-display nn-num mt-3 text-4xl text-nn-ink">
                      {formatMoney(invite.offer.feeCents, invite.offer.currency)}
                    </p>
                    {discounted ? (
                      <p className="mt-1 text-xs text-nn-muted">
                        Listed at {formatMoney(invite.offer.listPriceCents, invite.offer.currency)}
                      </p>
                    ) : null}
                    <p className="mt-5 text-xs leading-5 text-nn-muted">
                      Respond by <strong className="text-nn-ink">{formatDeadline(invite.responseDeadline)}</strong>
                    </p>
                    <InviteDecisionForm collaborationId={invite.id} expired={invite.expired} />
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
