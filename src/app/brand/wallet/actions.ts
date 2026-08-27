"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getBrandContext } from "@/lib/brand/context";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type TopUpActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

const topUpSchema = z.object({
  idempotencyKey: z.uuid(),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount to add.")
    .max(17, "That amount is too large."),
});

function parseEuroCents(value: string) {
  const normalized = value.replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;

  const [euros, decimals = ""] = normalized.split(".");
  const amountCents = BigInt(euros) * BigInt(100) + BigInt(decimals.padEnd(2, "0"));

  if (amountCents <= BigInt(0) || amountCents > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(amountCents);
}

export async function simulateTopUpAction(
  _previousState: TopUpActionState,
  formData: FormData,
): Promise<TopUpActionState> {
  const parsed = topUpSchema.safeParse({
    idempotencyKey: formData.get("idempotencyKey"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the top-up details.",
    };
  }

  const amountCents = parseEuroCents(parsed.data.amount);
  if (amountCents === null) {
    return {
      status: "error",
      message: "Enter a positive euro amount with no more than two decimal places.",
    };
  }

  const context = await getBrandContext();
  if (!context.userId) redirect("/auth");
  if (!context.workspace) return { status: "error", message: "We couldn't access your wallet." };

  const admin = createAdminSupabaseClient();
  const { error: insertError } = await admin.from("wallet_transactions").insert({
    workspace_id: context.workspace.id,
    type: "topup",
    amount_cents: amountCents,
    currency: "EUR",
    collaboration_id: null,
    idempotency_key: parsed.data.idempotencyKey,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const supabase = await createServerSupabaseClient();
      const { data: existingTransaction, error: existingError } = await supabase
        .from("wallet_transactions")
        .select("workspace_id, type, amount_cents, currency")
        .eq("idempotency_key", parsed.data.idempotencyKey)
        .eq("workspace_id", context.workspace.id)
        .maybeSingle();

      if (
        !existingError &&
        existingTransaction?.type === "topup" &&
        existingTransaction.amount_cents === amountCents &&
        existingTransaction.currency === "EUR"
      ) {
        revalidatePath("/brand/wallet");
        return { status: "success", message: "Demo funds are already in your wallet." };
      }
    }

    console.error("Simulated wallet top-up failed", {
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
    });
    return {
      status: "error",
      message: "We couldn't add the demo funds. Your wallet was not changed.",
    };
  }

  revalidatePath("/brand/wallet");
  revalidatePath("/brand/creators");

  return { status: "success", message: "Demo funds added to your wallet." };
}
