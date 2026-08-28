"use client";

import { useActionState, useState, type ReactNode } from "react";

import { signOutCreator } from "@/app/creator/auth/actions";
import {
  createCreatorAction,
  generateCreatorProfileAction,
  type CreateCreatorState,
  type GenerateCreatorProfileState,
} from "@/app/creator/onboarding/actions";
import { ArrowIcon } from "@/components/brand/dossier";
import type { CreatorGenerationMode, CreatorOnboardingDraft } from "@/lib/creator/onboarding";

const creatorSteps = ["Access", "LinkedIn", "Review", "Confirm"] as const;
const initialGenerationState: GenerateCreatorProfileState = {
  error: null,
  draft: null,
  mode: null,
};
const initialCreateState: CreateCreatorState = { error: null };

const inputClass =
  "min-h-13 w-full rounded-[var(--nn-radius-sm)] border border-nn-line-strong bg-nn-white px-4 py-3 text-nn-ink outline-none transition-colors placeholder:text-nn-muted/55 hover:border-nn-blue focus:border-nn-blue focus:ring-3 focus:ring-nn-blue/25";
const labelClass =
  "mb-2 block text-[0.72rem] font-bold tracking-[0.13em] text-nn-muted uppercase";

function Wordmark() {
  return (
    <span className="inline-flex items-baseline text-nn-ink">
      <span className="nn-display text-[1.7rem] leading-none">naano</span>
      <span
        aria-hidden="true"
        className="ml-[3px] inline-block h-[7px] w-[7px] translate-y-[-1px] rounded-full bg-nn-blue"
      />
    </span>
  );
}

function StepThread({ activeStep }: { activeStep: number }) {
  return (
    <ol className="flex list-none flex-wrap items-center gap-x-2 gap-y-3 p-0">
      {creatorSteps.map((step, index) => {
        const done = index < activeStep;
        const current = index === activeStep;
        return (
          <li key={step} className="flex items-center gap-2.5">
            <span
              className={`nn-num flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                current
                  ? "bg-nn-blue text-white shadow-[0_8px_20px_-10px_rgb(31_68_255/0.55)]"
                  : done
                    ? "bg-nn-blue-100 text-nn-blue-strong"
                    : "border border-nn-line-strong text-nn-muted"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`hidden text-sm font-semibold sm:inline ${current ? "text-nn-ink" : "text-nn-muted"}`}
            >
              {step}
            </span>
            {index < creatorSteps.length - 1 ? (
              <span className="mx-1 hidden h-px w-8 bg-nn-line sm:inline-block" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function OnboardingIntro({
  activeStep,
  sourceUrl,
}: {
  activeStep: number;
  sourceUrl?: string;
}) {
  const copy =
    activeStep === 1
      ? {
          title: "Start with the professional signal you already have.",
          detail:
            "One server-side analysis uses public LinkedIn evidence to shape a draft card.",
        }
      : activeStep === 2
        ? {
            title: "Keep the useful signal. Correct the assumptions.",
            detail:
              "Your country, industries, and sponsored-post rate stay under your control.",
          }
        : {
            title: "Publish one honest, bookable card.",
            detail: "Confirmation makes the listing visible to brands immediately.",
          };

  return (
    <div className="lg:sticky lg:top-8">
      <h1 className="nn-display text-[clamp(1.9rem,3.6vw,3rem)] text-nn-ink">{copy.title}</h1>
      <p className="mt-5 max-w-md text-lg text-nn-muted">{copy.detail}</p>
      <div className="mt-8 border-nn-line border-t pt-6">
        {sourceUrl ? (
          <>
            <p className="text-[0.68rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
              Public source
            </p>
            <p className="mt-2 break-all text-sm text-nn-ink">{sourceUrl}</p>
          </>
        ) : (
          <p className="text-sm leading-6 text-nn-muted">
            Private payout, tax, and compliance details are not collected in this flow.
          </p>
        )}
      </div>
    </div>
  );
}

function OnboardingLayout({
  activeStep,
  sourceUrl,
  children,
}: {
  activeStep: number;
  sourceUrl?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-nn-paper text-nn-ink">
      <div className="nn-container flex min-h-screen flex-col py-8 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark />
          <form action={signOutCreator}>
            <button className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-nn-muted hover:text-nn-blue">
              Sign out
            </button>
          </form>
        </header>

        <div className="mt-8">
          <StepThread activeStep={activeStep} />
        </div>

        <div className="mt-10 grid flex-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start xl:gap-16">
          <OnboardingIntro activeStep={activeStep} sourceUrl={sourceUrl} />
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}

function AnalyzeStep() {
  const [state, action, pending] = useActionState(
    generateCreatorProfileAction,
    initialGenerationState,
  );

  if (state.draft && state.mode) {
    return <ReviewSteps draft={state.draft} mode={state.mode} />;
  }

  return (
    <OnboardingLayout activeStep={1}>
      <section className="nn-card p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="nn-display text-2xl text-nn-ink">
            Bring your public creator signal into focus.
          </h2>
          <span className="nn-chip">Ready to analyze</span>
        </div>
        <p className="mt-4 text-base leading-7 text-nn-muted">
          Paste the public profile URL brands already use to understand your work. The analysis runs
          once on the server and returns an editable draft.
        </p>

        <form action={action} className="mt-8">
          <label className="block">
            <span className={labelClass}>Public LinkedIn profile URL</span>
            <input
              className={inputClass}
              name="linkedinUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://www.linkedin.com/in/your-name"
              required
            />
          </label>

          {state.error ? (
            <p
              role="alert"
              className="mt-4 rounded-[var(--nn-radius-sm)] border border-danger/45 bg-danger/8 px-4 py-3 text-sm text-danger"
            >
              {state.error}
            </p>
          ) : null}

          <button
            className="nn-btn nn-btn-primary mt-6 w-full sm:w-auto disabled:cursor-wait disabled:opacity-70"
            type="submit"
            disabled={pending}
          >
            <span>{pending ? "Reading public signals…" : "Generate creator draft"}</span>
            <ArrowIcon className="h-5 w-5" />
          </button>
        </form>
      </section>

      <div className="mt-8 grid gap-8 sm:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
            One public input
          </p>
          <p className="nn-display mt-3 text-2xl leading-tight text-nn-blue">LinkedIn profile URL</p>
        </div>
        <div>
          <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
            Draft outputs
          </p>
          <ol className="mt-3 list-none divide-nn-line divide-y p-0">
            {["Creator headline", "Up to three industries", "Suggested post price", "Audience positioning"].map(
              (item, index) => (
                <li key={item} className="flex items-center gap-4 py-3 text-sm font-semibold text-nn-ink">
                  <span className="nn-display nn-num text-lg text-nn-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ),
            )}
          </ol>
        </div>
      </div>
    </OnboardingLayout>
  );
}

function ReviewSteps({
  draft,
  mode,
}: {
  draft: CreatorOnboardingDraft;
  mode: CreatorGenerationMode;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [country, setCountry] = useState(draft.suggestedCountry);
  const [industries, setIndustries] = useState(() => [
    draft.suggestedIndustries[0] ?? "",
    draft.suggestedIndustries[1] ?? "",
    draft.suggestedIndustries[2] ?? "",
  ]);
  const [pricePerPost, setPricePerPost] = useState(
    (draft.suggestedPricePerPostCents / 100).toFixed(2),
  );
  const [createState, createAction, creating] = useActionState(
    createCreatorAction,
    initialCreateState,
  );

  const selectedIndustries = industries.map((industry) => industry.trim()).filter(Boolean);
  const activeStep = confirmed ? 3 : 2;

  if (!confirmed) {
    return (
      <OnboardingLayout activeStep={activeStep} sourceUrl={draft.linkedinUrl}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="nn-display text-2xl text-nn-ink">Review the market-facing details.</h2>
          <span
            className={
              mode === "placeholder"
                ? "inline-flex rounded-full border border-danger/45 px-3 py-1 text-xs font-bold tracking-[0.11em] text-danger uppercase"
                : "nn-chip"
            }
          >
            {mode === "placeholder" ? "Placeholder · API key missing" : "AI draft · review required"}
          </span>
        </div>

        <section className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="nn-card p-6">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Headline</p>
            <p className="nn-display mt-3 text-xl leading-tight text-nn-ink">{draft.headline}</p>
          </div>
          <div className="nn-card p-6">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
              Audience positioning
            </p>
            <p className="mt-3 text-sm leading-6 text-nn-muted">{draft.audienceSummary}</p>
          </div>
        </section>

        <form
          className="nn-card mt-6 p-6 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            setConfirmed(true);
          }}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Country</span>
              <input
                className={inputClass}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                maxLength={80}
                pattern="^(?!\[Placeholder\]).+$"
                title="Replace the placeholder with your country."
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Price per sponsored post · EUR</span>
              <input
                className={inputClass}
                value={pricePerPost}
                onChange={(event) => setPricePerPost(event.target.value)}
                inputMode="decimal"
                pattern="\d+(?:[.,]\d{1,2})?"
                placeholder="250.00"
                required
              />
            </label>
          </div>

          <fieldset className="mt-6 border-0 p-0">
            <legend className={labelClass}>Industries · up to three</legend>
            <div className="grid gap-3 lg:grid-cols-3">
              {industries.map((industry, index) => (
                <input
                  key={index}
                  aria-label={`Industry ${index + 1}`}
                  className={inputClass}
                  value={industry}
                  onChange={(event) => {
                    const nextIndustries = [...industries];
                    nextIndustries[index] = event.target.value;
                    setIndustries(nextIndustries);
                  }}
                  maxLength={60}
                  placeholder={index === 0 ? "B2B SaaS" : "Optional"}
                  required={index === 0}
                />
              ))}
            </div>
          </fieldset>

          <button className="nn-btn nn-btn-primary mt-8 w-full sm:w-auto" type="submit">
            <span>Review final card</span>
            <ArrowIcon className="h-5 w-5" />
          </button>
        </form>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout activeStep={activeStep} sourceUrl={draft.linkedinUrl}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="nn-display text-2xl text-nn-ink">Ready to enter the marketplace.</h2>
        <span className="nn-chip">Visible on publish</span>
      </div>

      <article className="nn-card mt-6 overflow-hidden">
        <div className="border-nn-line border-b px-6 py-6">
          <p className="nn-display text-3xl leading-none text-nn-ink">{draft.headline}</p>
          <p className="mt-3 text-sm text-nn-muted">{country}</p>
        </div>
        <div className="grid gap-px bg-nn-line lg:grid-cols-[1.25fr_0.75fr]">
          <div className="bg-nn-white px-6 py-6">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">
              Audience positioning
            </p>
            <p className="mt-3 text-sm leading-6 text-nn-muted">{draft.audienceSummary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedIndustries.map((industry, index) => (
                <span key={`${industry}-${index}`} className="nn-chip">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-nn-blue-50 px-6 py-6">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Post rate</p>
            <p className="nn-display nn-num mt-3 text-4xl text-nn-ink">€{pricePerPost}</p>
            <p className="mt-3 text-xs leading-5 text-nn-muted">
              Followers and estimated views start at zero until verified; no audience metrics are
              fabricated.
            </p>
          </div>
        </div>
      </article>

      <form action={createAction} className="mt-8">
        <input type="hidden" name="linkedinUrl" value={draft.linkedinUrl} />
        <input type="hidden" name="headline" value={draft.headline} />
        <input type="hidden" name="audienceSummary" value={draft.audienceSummary} />
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="pricePerPost" value={pricePerPost} />
        {selectedIndustries.map((industry, index) => (
          <input key={`${industry}-${index}`} type="hidden" name="industries" value={industry} />
        ))}

        {createState.error ? (
          <p
            role="alert"
            className="mb-4 rounded-[var(--nn-radius-sm)] border border-danger/45 bg-danger/8 px-4 py-3 text-sm text-danger"
          >
            {createState.error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-4">
          <button
            className="nn-btn nn-btn-primary disabled:cursor-wait disabled:opacity-70"
            type="submit"
            disabled={creating}
          >
            <span>{creating ? "Publishing creator card…" : "Publish creator card"}</span>
            <ArrowIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmed(false)}
            className="nn-btn nn-btn-secondary"
          >
            Edit details
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}

export function CreatorOnboardingFlow() {
  return <AnalyzeStep />;
}
