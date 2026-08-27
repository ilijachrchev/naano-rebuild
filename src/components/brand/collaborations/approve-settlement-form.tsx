"use client";

import { useActionState } from "react";

import {
  approveAndSettleCollaborationAction,
  type SettleCollaborationActionState,
} from "@/app/brand/collaborations/actions";

const initialState: SettleCollaborationActionState = {
  status: "idle",
  message: null,
};

export function ApproveSettlementForm({
  workspaceId,
  collaborationId,
}: {
  workspaceId: string;
  collaborationId: string;
}) {
  const [state, formAction, pending] = useActionState(
    approveAndSettleCollaborationAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="collaborationId" value={collaborationId} />
      <button type="submit" disabled={pending} className="primary-button w-full justify-between sm:w-auto">
        {pending ? "Settling…" : "Approve & pay"}
        <span aria-hidden="true">→</span>
      </button>
      <div aria-live="polite">
        {state.message ? (
          <p
            className={`mt-3 max-w-xl text-sm ${
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
