"use client";

import { useActionState } from "react";

import {
  generateBrandProfileAction,
  type FormActionState,
} from "@/app/actions/brand";
import { ArrowIcon } from "@/components/brand/dossier";

const initialState: FormActionState = { error: null };

export function BrandProfileForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(generateBrandProfileAction, initialState);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {state.error ? (
        <p role="alert" className="mb-5 border-danger border bg-danger/8 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button className="primary-button w-full sm:w-auto sm:min-w-80" type="submit" disabled={pending}>
        <span>{pending ? "Reading your market signal…" : "Generate brand profile"}</span>
        <ArrowIcon className="h-5 w-5" />
      </button>
      {pending ? (
        <div role="status" className="mt-8 max-w-xl" aria-live="polite">
          <div className="mb-3 flex justify-between text-xs font-bold tracking-[0.1em] uppercase">
            <span>Researching website</span>
            <span>One live AI pass</span>
          </div>
          <div className="h-px overflow-hidden bg-carbon/18">
            <div className="scan-line h-px bg-aubergine" />
          </div>
          <p className="mt-3 text-sm leading-6 text-carbon/65">
            We’re resolving your positioning and three audience signals. This can take around half a minute.
          </p>
        </div>
      ) : null}
    </form>
  );
}
