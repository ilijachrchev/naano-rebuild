import { redirect } from "next/navigation";

import { CreatorProfileMissing } from "@/components/creator/no-profile";
import { CreatorShell } from "@/components/creator/shell";
import { getCreatorContext } from "@/lib/creator/context";
import { getCreatorPayouts } from "@/lib/creator/data";

const moneyFormat = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

const statusLabels = {
  pending: "Pending",
  in_transit: "In transit",
  available: "Available",
  withdrawn: "Withdrawn",
} as const;

export default async function CreatorEarningsPage() {
  const context = await getCreatorContext();
  if (!context.userId) redirect("/auth");
  if (!context.creator) return <CreatorProfileMissing />;

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
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-10 border-carbon/18 border-b pb-12 xl:grid-cols-[0.82fr_1.18fr] xl:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Supply dossier · 03</p>
            <h1 className="display-type mt-3 text-5xl leading-[0.92] sm:text-6xl">
              Earnings tied back to the work.
            </h1>
          </div>
          <dl className="grid grid-cols-2 border-carbon/20 border-y">
            <div className="border-carbon/16 border-r px-5 py-6 first:pl-0">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Recorded</dt>
              <dd className="display-type mt-3 text-4xl sm:text-5xl">{moneyFormat.format(totalCents / 100)}</dd>
            </div>
            <div className="px-5 py-6 pr-0">
              <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">Available</dt>
              <dd className="display-type mt-3 text-4xl sm:text-5xl">{moneyFormat.format(availableCents / 100)}</dd>
            </div>
          </dl>
        </div>

        <section className="pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Payout ledger</p>
              <h2 className="display-type mt-2 text-4xl">Read-only by design.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-carbon/56">
              Payout processing and withdrawal controls are mocked for this demo; these rows are the creator-scoped record already in Supabase.
            </p>
          </div>

          {payouts.length === 0 ? (
            <div className="mt-8 border-carbon/20 border-y py-10 text-sm text-carbon/58">
              No payout records yet. Completed collaborations will appear here when a payout is created.
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto border-carbon/20 border-y">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-carbon/16 border-b text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                    <th className="px-4 py-4 first:pl-0">Record</th>
                    <th className="px-4 py-4">Created</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Method</th>
                    <th className="px-4 py-4 text-right last:pr-0">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-carbon/14 border-b last:border-b-0">
                      <td className="px-4 py-5 first:pl-0">
                        <p className="font-mono text-xs">{payout.id.slice(0, 8)}</p>
                        <p className="mt-1 text-xs text-carbon/45">
                          Collaboration {payout.collaborationId?.slice(0, 8) ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-5 text-sm">
                        {payout.createdAt ? dateFormat.format(new Date(payout.createdAt)) : "—"}
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase ${payout.status === "available" ? "text-aubergine" : "text-carbon/62"}`}>
                          <span className={`h-2 w-2 rounded-full ${payout.status === "available" ? "bg-signal" : "bg-carbon/25"}`} aria-hidden="true" />
                          {statusLabels[payout.status]}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-sm capitalize">{payout.method ?? "Not connected"}</td>
                      <td className="display-type px-4 py-5 text-right text-2xl last:pr-0">
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
