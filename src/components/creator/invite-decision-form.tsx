"use client";

import { useActionState } from "react";

import {
  decideInviteAction,
  type InviteDecisionState,
} from "@/app/creator/opportunities/actions";

const initialState: InviteDecisionState = { error: null, message: null };

export function InviteDecisionForm({
  collaborationId,
  expired,
}: {
  collaborationId: string;
  expired: boolean;
}) {
  const [state, formAction, pending] = useActionState(decideInviteAction, initialState);

  return (
    <form action={formAction} className="mt-6 border-nn-line-strong border-t pt-5">
      <input type="hidden" name="collaborationId" value={collaborationId} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending || expired}
          className="nn-btn nn-btn-primary min-h-12 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Accept invitation"} <span aria-hidden="true">→</span>
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          disabled={pending || expired}
          className="nn-btn nn-btn-secondary min-h-12 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      <div aria-live="polite">
        {expired ? (
          <p className="mt-3 text-sm text-danger">The response window has ended.</p>
        ) : null}
        {state.error ? <p className="mt-3 text-sm text-danger">{state.error}</p> : null}
        {state.message ? (
          <p className="mt-3 text-sm font-bold text-nn-blue">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
