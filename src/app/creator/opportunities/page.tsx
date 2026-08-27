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
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-7 border-carbon/18 border-b pb-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Supply dossier · 02
            </p>
            <h1 className="display-type mt-3 max-w-4xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
              A clean yes or no on every invitation.
            </h1>
          </div>
          <div className="border-carbon/18 border-l-2 border-l-aubergine bg-mist/38 px-5 py-4">
            <p className="text-sm leading-6 text-carbon/64">
              Review the fixed offer as sent. Your response changes collaboration state only; pricing and terms remain locked.
            </p>
          </div>
        </div>

        {invites.length === 0 ? (
          <section className="mt-10 border-carbon/20 border-y py-12">
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Inbox clear</p>
            <h2 className="display-type mt-4 text-4xl">No brand invitations need a response.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-carbon/58">
              New requested collaborations will appear here through the same shared marketplace record brands use.
            </p>
          </section>
        ) : (
          <ol className="mt-10 border-carbon/20 border-y">
            {invites.map((invite, index) => {
              const discounted = invite.offer.feeCents < invite.offer.listPriceCents;

              return (
                <li key={invite.id} className="grid gap-7 border-carbon/16 border-b py-8 last:border-b-0 xl:grid-cols-[72px_minmax(0,1fr)_minmax(250px,0.55fr)]">
                  <span className="display-type text-4xl text-aubergine">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="display-type text-4xl leading-none">{invite.campaignName}</h2>
                      {invite.region ? (
                        <span className="border border-carbon/18 px-2.5 py-1 text-xs font-semibold">{invite.region}</span>
                      ) : null}
                    </div>
                    {invite.objective ? (
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-carbon/64">{invite.objective}</p>
                    ) : null}
                    <dl className="mt-6 grid gap-4 border-carbon/16 border-t pt-5 sm:grid-cols-3">
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/46 uppercase">Deliverable</dt>
                        <dd className="mt-2 text-sm leading-6">{invite.deliverables}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/46 uppercase">Post by</dt>
                        <dd className="mt-2 text-sm font-semibold">{formatDate(invite.postBy)}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/46 uppercase">Approval</dt>
                        <dd className="mt-2 text-sm font-semibold">{invite.approvalRequired ? "Required" : "Not required"}</dd>
                      </div>
                    </dl>
                  </div>
                  <aside className="bg-mist/45 p-5">
                    <p className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Fixed offer</p>
                    <p className="display-type mt-3 text-4xl">
                      {formatMoney(invite.offer.feeCents, invite.offer.currency)}
                    </p>
                    {discounted ? (
                      <p className="mt-1 text-xs text-carbon/50">
                        Listed at {formatMoney(invite.offer.listPriceCents, invite.offer.currency)}
                      </p>
                    ) : null}
                    <p className="mt-5 text-xs leading-5 text-carbon/54">
                      Respond by <strong className="text-carbon">{formatDeadline(invite.responseDeadline)}</strong>
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
