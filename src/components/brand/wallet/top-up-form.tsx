"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  simulateTopUpAction,
  type TopUpActionState,
} from "@/app/brand/wallet/actions";
import { ArrowIcon } from "@/components/brand/dossier";

const initialState: TopUpActionState = { status: "idle", message: null };

function SubmitTopUpButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="primary-button w-full">
      <span>{pending ? "Adding demo funds…" : "Add demo funds"}</span>
      <ArrowIcon className="h-5 w-5" />
    </button>
  );
}

export function TopUpForm({
  idempotencyKey,
}: {
  idempotencyKey: string;
}) {
  const [state, formAction] = useActionState(simulateTopUpAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <div className="border-nn-line border-b pb-5">
        <h2 className="display-type text-3xl text-nn-ink">Add demo funds.</h2>
        <p className="mt-3 text-sm leading-6 text-nn-muted">
          No card is charged and no payment processor is connected. This adds a demo credit to
          the immutable EUR ledger.
        </p>
      </div>

      <div className="py-6">
        <label className="field-label" htmlFor="top-up-amount">
          Demo amount (EUR)
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold text-nn-muted"
            aria-hidden="true"
          >
            €
          </span>
          <input
            className="field-input field-input-light pl-9"
            id="top-up-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="500.00"
            pattern="[0-9]+([.,][0-9]{1,2})?"
            maxLength={17}
            title="Enter a positive euro amount with up to two decimal places."
            required
          />
        </div>
        <p className="mt-2 text-xs leading-5 text-nn-muted">
          Demo funds are immediately available for creator offer reservations.
        </p>
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={`mb-5 rounded-[0.85rem] px-4 py-3 text-sm leading-6 ${
            state.status === "error" ? "bg-danger/8 text-danger" : "bg-nn-blue-50 text-nn-ink"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitTopUpButton />
    </form>
  );
}
