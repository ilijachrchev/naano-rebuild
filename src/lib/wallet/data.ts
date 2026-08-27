import "server-only";

import { calculateWalletAvailableCents } from "@/lib/wallet/balance";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type WalletTransactionType = Database["public"]["Enums"]["wallet_txn_type"];
type FundHoldStatus = Database["public"]["Enums"]["fund_hold_status"];

export type WalletActivity =
  | {
      id: string;
      kind: WalletTransactionType;
      amountCents: number;
      currency: string;
      collaborationId: string | null;
      createdAt: string;
    }
  | {
      id: string;
      kind: "hold";
      amountCents: number;
      currency: string;
      collaborationId: string;
      createdAt: string;
      status: FundHoldStatus;
    };

export type WalletSnapshot = {
  availableCents: number;
  activity: WalletActivity[];
};

const walletCurrency = "EUR";

export async function getWalletSnapshot(workspaceId: string): Promise<WalletSnapshot> {
  const supabase = await createServerSupabaseClient();
  const [transactionsResult, holdsResult] = await Promise.all([
    supabase
      .from("wallet_transactions")
      .select("id, type, amount_cents, currency, collaboration_id, created_at")
      .eq("workspace_id", workspaceId)
      .eq("currency", walletCurrency),
    supabase
      .from("fund_holds")
      .select("id, status, amount_cents, currency, collaboration_id, created_at")
      .eq("workspace_id", workspaceId)
      .eq("currency", walletCurrency),
  ]);

  if (transactionsResult.error || holdsResult.error) {
    throw new Error("Unable to load wallet activity");
  }

  const transactions = transactionsResult.data ?? [];
  const holds = holdsResult.data ?? [];
  const availableCents = calculateWalletAvailableCents(
    transactions.map((transaction) => ({
      type: transaction.type,
      amountCents: transaction.amount_cents,
    })),
    holds.map((hold) => ({
      status: hold.status,
      amountCents: hold.amount_cents,
    })),
  );

  const activity: WalletActivity[] = [
    ...transactions.map((transaction) => ({
      id: transaction.id,
      kind: transaction.type,
      amountCents: transaction.amount_cents,
      currency: transaction.currency,
      collaborationId: transaction.collaboration_id,
      createdAt: transaction.created_at,
    })),
    ...holds.map((hold) => ({
      id: hold.id,
      kind: "hold" as const,
      amountCents: hold.amount_cents,
      currency: hold.currency,
      collaborationId: hold.collaboration_id,
      createdAt: hold.created_at,
      status: hold.status,
    })),
  ].sort(
    (left, right) =>
      Date.parse(right.createdAt) - Date.parse(left.createdAt) || left.id.localeCompare(right.id),
  );

  return { availableCents, activity };
}
