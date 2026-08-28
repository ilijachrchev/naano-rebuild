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
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspace.name} activeHref="/brand/wallet" />

      <section className="min-h-screen min-w-0 bg-nn-paper">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Wallet</p>
            <p className="text-sm text-nn-muted">EUR funds and reservation history</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" /> RLS protected
          </span>
        </header>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
            <section>
              <h1 className="display-type max-w-2xl text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
                Funds ready for creator work.
              </h1>

              <div className="nn-card mt-9 rounded-[1.25rem] p-8">
                <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
                  Available balance
                </p>
                <p className="nn-num display-type mt-3 text-6xl leading-none text-nn-ink sm:text-7xl">
                  {moneyFormat.format(wallet.availableCents / 100)}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-nn-muted">
                  Top-ups and refunds, less posted charges and funds reserved for open creator offers.
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-4 py-4">
                  <p className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Currency</p>
                  <p className="mt-2 font-bold text-nn-ink">EUR only</p>
                </div>
                <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-4 py-4">
                  <p className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Activity</p>
                  <p className="mt-2 font-bold text-nn-ink">{wallet.activity.length} records</p>
                </div>
                <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-4 py-4">
                  <p className="text-[0.66rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Ledger</p>
                  <p className="mt-2 font-bold text-nn-ink">Append-only</p>
                </div>
              </div>
            </section>

            <aside className="nn-card rounded-[1.25rem] p-6 sm:p-8">
              <TopUpForm key={topUpRequestId} idempotencyKey={topUpRequestId} />
            </aside>
          </div>

          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="display-type text-4xl text-nn-ink">Every movement, in order.</h2>
              <p className="max-w-md text-sm leading-6 text-nn-muted">
                Transaction and hold records are read through workspace-scoped row-level security.
                Ledger entries cannot be edited or deleted.
              </p>
            </div>

            {wallet.activity.length === 0 ? (
              <div className="mt-8 rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-10 text-sm text-nn-muted">
                No wallet activity yet. Add demo funds to create the first top-up record.
              </div>
            ) : (
              <div className="nn-card mt-8 overflow-x-auto rounded-[1.25rem]">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-nn-line border-b text-[0.68rem] font-bold tracking-[0.1em] text-nn-muted uppercase">
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Reference</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.activity.map((activity) => {
                      const description = getActivityDescription(activity);

                      return (
                        <tr key={`${activity.kind}-${activity.id}`} className="border-nn-line border-b last:border-b-0">
                          <td className="px-6 py-5">
                            <p className="font-bold text-nn-ink">{description.label}</p>
                            <p className="mt-1 font-mono text-xs text-nn-muted">
                              {activity.id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="px-4 py-5 text-sm text-nn-ink">
                            {dateFormat.format(new Date(activity.createdAt))}
                          </td>
                          <td className="px-4 py-5">
                            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-nn-muted uppercase">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  description.isCredit ? "bg-nn-blue" : "bg-nn-line-strong"
                                }`}
                                aria-hidden="true"
                              />
                              {description.status}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-sm text-nn-muted">
                            {activity.collaborationId
                              ? `Collab ${activity.collaborationId.slice(0, 8)}`
                              : "Wallet"}
                          </td>
                          <td
                            className={`nn-num display-type px-6 py-5 text-right text-2xl ${
                              description.isCredit ? "text-nn-blue" : "text-nn-ink"
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
