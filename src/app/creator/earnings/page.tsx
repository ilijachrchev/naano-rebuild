import { redirect } from "next/navigation";

import { CreatorShell } from "@/components/creator/shell";
import { getCreatorContext } from "@/lib/creator/context";
import { getCreatorPayouts } from "@/lib/creator/data";

const moneyFormat = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const statusLabels = {
  pending: "Pending",
  in_transit: "In transit",
  available: "Available",
  withdrawn: "Withdrawn",
} as const;

export default async function CreatorEarningsPage() {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/creator/auth");
  if (!context.registeredAsCreator) redirect("/auth");
  if (!context.creator) redirect("/creator/onboarding");

  const payouts = await getCreatorPayouts(context.creator.id);
  const totalCents = payouts.reduce((total, payout) => total + payout.amountCents, 0);
  const availableCents = payouts
    .filter((payout) => payout.status === "available")
    .reduce((total, payout) => total + payout.amountCents, 0);

  return (
    <CreatorShell
      creatorName={context.creator.displayName}
      activeHref="/creator/earnings"
      eyebrow="Creator earnings"
      detail="Payout records visible only to this creator"
      marker={`${payouts.length} records`}
    >
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="max-w-2xl">
          <h1 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            Earnings tied back to the work.
          </h1>
        </div>

        <dl className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="nn-card p-7">
            <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Recorded</dt>
            <dd className="nn-display nn-num mt-3 text-[clamp(2.5rem,5vw,3.5rem)] text-nn-ink">
              {moneyFormat.format(totalCents / 100)}
            </dd>
          </div>
          <div className="nn-card p-7">
            <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Available</dt>
            <dd className="nn-display nn-num mt-3 text-[clamp(2.5rem,5vw,3.5rem)] text-nn-blue">
              {moneyFormat.format(availableCents / 100)}
            </dd>
          </div>
        </dl>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="nn-display text-[clamp(1.75rem,3vw,2.5rem)] text-nn-ink">Read-only by design.</h2>
            <p className="max-w-md text-sm leading-6 text-nn-muted">
              Payout processing and withdrawal controls are mocked for this demo; these rows are the
              creator-scoped record already in Supabase.
            </p>
          </div>

          {payouts.length === 0 ? (
            <div className="nn-card mt-8 p-8 text-sm text-nn-muted">
              No payout records yet. Completed collaborations will appear here when a payout is created.
            </div>
          ) : (
            <div className="nn-card mt-8 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-nn-line border-b text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                    <th className="px-6 py-4">Record</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-nn-line border-b last:border-b-0">
                      <td className="px-6 py-5">
                        <p className="nn-num font-mono text-xs text-nn-ink">{payout.id.slice(0, 8)}</p>
                        <p className="mt-1 text-xs text-nn-muted">
                          Collaboration {payout.collaborationId?.slice(0, 8) ?? "—"}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-nn-muted">
                        {payout.createdAt ? dateFormat.format(new Date(payout.createdAt)) : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase ${payout.status === "available" ? "text-nn-blue" : "text-nn-muted"}`}>
                          <span className={`h-2 w-2 rounded-full ${payout.status === "available" ? "bg-nn-blue" : "bg-nn-line-strong"}`} aria-hidden="true" />
                          {statusLabels[payout.status]}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-nn-muted capitalize">{payout.method ?? "Not connected"}</td>
                      <td className="nn-display nn-num px-6 py-5 text-right text-2xl text-nn-ink">
                        {moneyFormat.format(payout.amountCents / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </CreatorShell>
  );
}
