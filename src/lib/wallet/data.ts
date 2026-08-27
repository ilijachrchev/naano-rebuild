import "server-only";

import { calculateWalletAvailableCents } from "@/lib/wallet/balance";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type WalletTransactionType = Database["public"]["Enums"]["wallet_txn_type"];
type FundHoldStatus = Database["public"]["Enums"]["fund_hold_status"];
type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

type WalletTransactionRow = {
  id: string;
  type: WalletTransactionType;
  amount_cents: number;
  currency: string;
  collaboration_id: string | null;
  created_at: string;
};

type FundHoldRow = {
  id: string;
  status: FundHoldStatus;
  amount_cents: number;
  currency: string;
  collaboration_id: string;
  created_at: string;
};

type WalletRows = {
  transactions: WalletTransactionRow[];
  holds: FundHoldRow[];
};

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
const pageSize = 1_000;
const maxSnapshotAttempts = 3;

async function getWalletTransactions(
  supabase: ServerSupabaseClient,
  workspaceId: string,
) {
  const transactions: WalletTransactionRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("id, type, amount_cents, currency, collaboration_id, created_at")
      .eq("workspace_id", workspaceId)
      .eq("currency", walletCurrency)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error("Unable to load wallet activity");

    transactions.push(...(data ?? []));
    if (!data || data.length < pageSize) return transactions;
  }
}

async function getFundHolds(supabase: ServerSupabaseClient, workspaceId: string) {
  const holds: FundHoldRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("fund_holds")
      .select("id, status, amount_cents, currency, collaboration_id, created_at")
      .eq("workspace_id", workspaceId)
      .eq("currency", walletCurrency)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error("Unable to load wallet activity");

    holds.push(...(data ?? []));
    if (!data || data.length < pageSize) return holds;
  }
}

async function readWalletRows(
  supabase: ServerSupabaseClient,
  workspaceId: string,
): Promise<WalletRows> {
  const [transactions, holds] = await Promise.all([
    getWalletTransactions(supabase, workspaceId),
    getFundHolds(supabase, workspaceId),
  ]);

  return { transactions, holds };
}

function walletRowsMatch(left: WalletRows, right: WalletRows) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function getStableWalletRows(
  supabase: ServerSupabaseClient,
  workspaceId: string,
): Promise<WalletRows> {
  let previous = await readWalletRows(supabase, workspaceId);

  for (let attempt = 0; attempt < maxSnapshotAttempts; attempt += 1) {
    const current = await readWalletRows(supabase, workspaceId);
    if (walletRowsMatch(previous, current)) return current;
    previous = current;
  }

  throw new Error("Wallet activity changed while it was loading");
}

export async function getWalletSnapshot(workspaceId: string): Promise<WalletSnapshot> {
  const supabase = await createServerSupabaseClient();
  const { transactions, holds } = await getStableWalletRows(supabase, workspaceId);
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
