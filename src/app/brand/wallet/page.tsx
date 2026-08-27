import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { BrandSidebar } from "@/components/brand/sidebar";
import { TopUpForm } from "@/components/brand/wallet/top-up-form";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { getWalletSnapshot, type WalletActivity } from "@/lib/wallet/data";

const moneyFormat = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});
const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const transactionLabels = {
  topup: "Top-up",
  charge: "Charge",
  refund: "Refund",
} as const;

const holdLabels = {
  reserved: "Reserved",
  captured: "Captured",
  released: "Released",
  refunded: "Refunded",
} as const;

function formatActivityAmount(activity: WalletActivity) {
  const amount = moneyFormat.format(activity.amountCents / 100);

  if (activity.kind === "hold") {
    return activity.status === "reserved" ? `−${amount}` : amount;
  }

  if (activity.kind === "topup" || activity.kind === "refund") return `+${amount}`;
  return `−${amount}`;
}

function getActivityDescription(activity: WalletActivity) {
  if (activity.kind === "hold") {
    return {
      label: "Funds hold",
      status: holdLabels[activity.status],
      isCredit: false,
    };
  }

  return {
    label: transactionLabels[activity.kind],
    status: activity.kind === "topup" ? "Credited" : "Posted",
    isCredit: activity.kind === "topup" || activity.kind === "refund",
  };
}

export default async function BrandWalletPage() {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const workspace = context.workspace!;
  const wallet = await getWalletSnapshot(workspace.id);
  const topUpRequestId = randomUUID();

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand/wallet" />

      <section className="dossier-paper min-h-screen min-w-0">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Brand wallet
            </p>
            <p className="text-sm text-carbon/55">EUR funds and reservation history</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" /> RLS
            protected
          </span>
        </header>

        <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-10 border-carbon/18 border-b pb-12 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
            <section>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                Funding dossier · 05
              </p>
              <h1 className="display-type mt-3 max-w-3xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                Funds ready for creator work.
              </h1>

              <dl className="mt-9 border-carbon/20 border-y py-7">
                <dt className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                  Available balance
                </dt>
                <dd className="display-type mt-3 text-6xl leading-none sm:text-7xl">
                  {moneyFormat.format(wallet.availableCents / 100)}
                </dd>
                <dd className="mt-4 max-w-xl text-sm leading-6 text-carbon/58">
                  Top-ups and refunds, less posted charges and funds reserved for open creator
                  offers.
                </dd>
              </dl>

              <div className="mt-6 grid gap-px border border-carbon/18 bg-carbon/18 sm:grid-cols-3">
                <div className="bg-paper px-4 py-4">
                  <p className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">
                    Currency
                  </p>
                  <p className="mt-2 font-bold">EUR only</p>
                </div>
                <div className="bg-paper px-4 py-4">
                  <p className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">
                    Activity
                  </p>
                  <p className="mt-2 font-bold">{wallet.activity.length} records</p>
                </div>
                <div className="bg-paper px-4 py-4">
                  <p className="text-[0.66rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">
                    Ledger
                  </p>
                  <p className="mt-2 font-bold">Append-only</p>
                </div>
              </div>
            </section>

            <aside className="border border-carbon/20 bg-paper p-5 sm:p-7">
              <TopUpForm
                key={topUpRequestId}
                idempotencyKey={topUpRequestId}
              />
            </aside>
          </div>

          <section className="pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
                  Wallet activity
                </p>
                <h2 className="display-type mt-2 text-4xl">Every movement, in order.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-carbon/56">
                Transaction and hold records are read through workspace-scoped row-level
                security. Ledger entries cannot be edited or deleted.
              </p>
            </div>

            {wallet.activity.length === 0 ? (
              <div className="mt-8 border-carbon/20 border-y py-10 text-sm text-carbon/58">
                No wallet activity yet. Add demo funds to create the first top-up record.
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto border-carbon/20 border-y">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-carbon/16 border-b text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                      <th className="px-4 py-4 first:pl-0">Activity</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Reference</th>
                      <th className="px-4 py-4 text-right last:pr-0">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.activity.map((activity) => {
                      const description = getActivityDescription(activity);

                      return (
                        <tr key={`${activity.kind}-${activity.id}`} className="border-carbon/14 border-b last:border-b-0">
                          <td className="px-4 py-5 first:pl-0">
                            <p className="font-bold">{description.label}</p>
                            <p className="mt-1 font-mono text-xs text-carbon/45">
                              {activity.id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="px-4 py-5 text-sm">
                            {dateFormat.format(new Date(activity.createdAt))}
                          </td>
                          <td className="px-4 py-5">
                            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-carbon/62 uppercase">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  description.isCredit ? "bg-signal" : "bg-carbon/25"
                                }`}
                                aria-hidden="true"
                              />
                              {description.status}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-sm text-carbon/58">
                            {activity.collaborationId
                              ? `Collab ${activity.collaborationId.slice(0, 8)}`
                              : "Wallet"}
                          </td>
                          <td
                            className={`display-type px-4 py-5 text-right text-2xl last:pr-0 ${
                              description.isCredit ? "text-aubergine" : "text-carbon"
                            }`}
                          >
                            {formatActivityAmount(activity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
