"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  simulatePostPerformanceAction,
  type SimulatePerformanceActionState,
} from "@/app/brand/collaborations/actions";

const initialState: SimulatePerformanceActionState = {
  status: "idle",
  message: null,
};

export function SimulatePerformanceForm({ collaborationId }: { collaborationId: string }) {
  const [state, formAction, pending] = useActionState(
    simulatePostPerformanceAction,
    initialState,
  );

  return (
    <form action={formAction} className="xl:text-right">
      <input type="hidden" name="collaborationId" value={collaborationId} />
      <button
        type="submit"
        disabled={pending}
        className="nn-btn nn-btn-primary w-full sm:w-auto disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Simulating demo performance…" : "Simulate post performance (demo)"}
      </button>
      <div aria-live="polite">
        {state.message ? (
          <p
            className={`mt-3 max-w-xl text-sm leading-6 xl:ml-auto ${
              state.status === "error" ? "text-danger" : "font-bold text-nn-blue"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        {state.status === "success" ? (
          <Link
            href="/brand/analytics"
            className="mt-2 inline-block text-sm font-bold text-nn-ink underline decoration-nn-blue decoration-2 underline-offset-4 hover:text-nn-blue"
          >
            Open demo analytics →
          </Link>
        ) : null}
      </div>
    </form>
  );
}
