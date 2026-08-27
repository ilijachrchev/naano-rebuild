"use client";

import { useActionState, useState } from "react";

import {
  brandAuthAction,
  type BrandAuthState,
} from "@/app/auth/actions";
import { ArrowIcon } from "@/components/brand/dossier";

const initialState: BrandAuthState = { error: null, message: null };

export function AuthForm() {
  const [intent, setIntent] = useState<"sign-in" | "sign-up">("sign-up");
  const [state, action, pending] = useActionState(brandAuthAction, initialState);

  return (
    <div>
      <div className="mb-8 flex border-white/22 border-b" aria-label="Account action">
        {(["sign-up", "sign-in"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={intent === value}
            onClick={() => setIntent(value)}
            className={`relative flex-1 cursor-pointer border-0 bg-transparent px-2 pb-3 text-left text-sm font-bold transition-colors ${
              intent === value ? "text-mineral" : "text-mineral/52 hover:text-mineral"
            }`}
          >
            {value === "sign-up" ? "Create account" : "Sign in"}
            {intent === value ? <span className="absolute right-0 bottom-[-1px] left-0 h-px bg-signal" /> : null}
          </button>
        ))}
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="intent" value={intent} />
        {intent === "sign-up" ? (
          <label className="block">
            <span className="field-label">Your name</span>
            <input className="field-input" name="fullName" autoComplete="name" placeholder="Maya Chen" required />
          </label>
        ) : null}
        <label className="block">
          <span className="field-label">Work email</span>
          <input
            className="field-input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </label>
        <label className="block">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            name="password"
            type="password"
            minLength={6}
            autoComplete={intent === "sign-up" ? "new-password" : "current-password"}
            placeholder="At least 6 characters"
            required
          />
        </label>

        {state.error ? (
          <p role="alert" className="border-danger/70 border bg-danger/12 px-4 py-3 text-sm text-[#ffd7df]">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p role="status" className="border-signal/60 border bg-signal/10 px-4 py-3 text-sm text-mineral">
            {state.message}
          </p>
        ) : null}

        <button className="primary-button w-full" type="submit" disabled={pending}>
          <span>{pending ? "Opening your dossier…" : intent === "sign-up" ? "Create brand account" : "Continue"}</span>
          <ArrowIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
