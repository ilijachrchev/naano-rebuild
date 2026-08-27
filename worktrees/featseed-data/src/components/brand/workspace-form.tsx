"use client";

import { useActionState } from "react";

import {
  createWorkspaceAction,
  type FormActionState,
} from "@/app/actions/brand";
import { ArrowIcon } from "@/components/brand/dossier";

const initialState: FormActionState = { error: null };

export function WorkspaceForm() {
  const [state, action, pending] = useActionState(createWorkspaceAction, initialState);

  return (
    <form action={action} className="mt-10 max-w-xl space-y-6">
      <label className="block">
        <span className="field-label">Workspace name</span>
        <input
          className="field-input field-input-light"
          name="name"
          autoComplete="organization"
          placeholder="Acme"
          required
        />
      </label>
      <label className="block">
        <span className="field-label">Company website</span>
        <input
          className="field-input field-input-light"
          name="website"
          inputMode="url"
          autoComplete="url"
          placeholder="acme.com"
          required
        />
      </label>

      {state.error ? (
        <p role="alert" className="border-danger border bg-danger/8 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <button className="primary-button w-full sm:w-auto sm:min-w-72" type="submit" disabled={pending}>
        <span>{pending ? "Creating workspace…" : "Create workspace"}</span>
        <ArrowIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
