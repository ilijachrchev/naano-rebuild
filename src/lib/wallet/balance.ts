import type { Database } from "@/types/database";

type WalletTransactionType = Database["public"]["Enums"]["wallet_txn_type"];
type FundHoldStatus = Database["public"]["Enums"]["fund_hold_status"];

type BalanceTransaction = {
  type: WalletTransactionType;
  amountCents: number;
};

type BalanceHold = {
  status: FundHoldStatus;
  amountCents: number;
};

function toSafeCents(value: number) {
  if (!Number.isSafeInteger(value)) {
    throw new Error("Wallet amount is outside the supported range");
  }

  return BigInt(value);
}

/**
 * Mirrors public.wallet_available_cents(uuid, char(3)) in planning/schema.sql:
 * top-ups and refunds are credits; charges and reserved holds are debits.
 * Keep this display-side RLS calculation aligned with that SQL function.
 */
export function calculateWalletAvailableCents(
  transactions: readonly BalanceTransaction[],
  holds: readonly BalanceHold[],
) {
  let availableCents = BigInt(0);

  for (const transaction of transactions) {
    const amountCents = toSafeCents(transaction.amountCents);
    availableCents += transaction.type === "charge" ? -amountCents : amountCents;
  }

  for (const hold of holds) {
    if (hold.status === "reserved") {
      availableCents -= toSafeCents(hold.amountCents);
    }
  }

  const result = Number(availableCents);
  if (!Number.isSafeInteger(result)) {
    throw new Error("Wallet balance is outside the supported range");
  }

  return result;
}
