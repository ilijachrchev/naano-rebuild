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
    <form action={formAction} className="mt-6 border-carbon/16 border-t pt-5">
      <input type="hidden" name="collaborationId" value={collaborationId} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending || expired}
          className="primary-button min-h-0 px-4 py-3"
        >
          {pending ? "Saving…" : "Accept invitation"} <span aria-hidden="true">→</span>
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          disabled={pending || expired}
          className="min-h-12 cursor-pointer border border-carbon/28 bg-transparent px-4 py-3 text-sm font-bold text-carbon hover:border-aubergine hover:text-aubergine disabled:cursor-not-allowed disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      {expired ? (
        <p className="mt-3 text-sm text-danger">The response window has ended.</p>
      ) : null}
      {state.error ? <p className="mt-3 text-sm text-danger">{state.error}</p> : null}
      {state.message ? <p className="mt-3 text-sm font-bold text-aubergine">{state.message}</p> : null}
    </form>
  );
}
