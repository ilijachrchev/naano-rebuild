"use client";

import { useActionState } from "react";

import {
  submitCollaborationContentAction,
  type SubmitContentActionState,
} from "@/app/creator/collaborations/actions";

const initialState: SubmitContentActionState = {
  status: "idle",
  message: null,
};

export function SubmitContentForm({ collaborationId }: { collaborationId: string }) {
  const [state, formAction, pending] = useActionState(
    submitCollaborationContentAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 border-carbon/16 border-t pt-5">
      <input type="hidden" name="collaborationId" value={collaborationId} />
      <label
        htmlFor={`content-url-${collaborationId}`}
        className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase"
      >
        Published post link
      </label>
      <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id={`content-url-${collaborationId}`}
          name="contentUrl"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://www.linkedin.com/posts/..."
          required
          disabled={pending}
          className="min-h-13 w-full rounded-sm border border-carbon/24 bg-white/55 px-4 py-3 text-sm text-carbon outline-none transition-colors placeholder:text-carbon/35 hover:border-aubergine focus:border-signal focus:bg-white focus:ring-3 focus:ring-signal/35 disabled:opacity-60"
        />
        <button type="submit" disabled={pending} className="primary-button min-h-13 py-3">
          {pending ? "Submitting…" : "Submit content"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <div aria-live="polite">
        {state.message ? (
          <p
            className={`mt-3 text-sm ${
              state.status === "error" ? "text-danger" : "font-bold text-aubergine"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
