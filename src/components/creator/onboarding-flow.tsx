"use client";

import { useActionState, useState } from "react";

import { signOutCreator } from "@/app/creator/auth/actions";
import {
  createCreatorAction,
  generateCreatorProfileAction,
  type CreateCreatorState,
  type GenerateCreatorProfileState,
} from "@/app/creator/onboarding/actions";
import {
  ArrowIcon,
  BrandMark,
  DossierShell,
  DossierTabs,
  EvidenceMark,
} from "@/components/brand/dossier";
import type { CreatorGenerationMode, CreatorOnboardingDraft } from "@/lib/creator/onboarding";

const creatorSteps = ["Access", "LinkedIn", "Review", "Confirm"] as const;
const initialGenerationState: GenerateCreatorProfileState = {
  error: null,
  draft: null,
  mode: null,
};
const initialCreateState: CreateCreatorState = { error: null };

function CreatorOnboardingAside({
  activeStep,
  sourceUrl,
}: {
  activeStep: number;
  sourceUrl?: string;
}) {
  const copy =
    activeStep === 1
      ? {
          eyebrow: "Creator profile · 01",
          title: "Start with the professional signal you already have.",
          detail: "One server-side analysis uses public LinkedIn evidence to shape a draft card.",
        }
      : activeStep === 2
        ? {
            eyebrow: "Creator profile · 02",
            title: "Keep the useful signal. Correct the assumptions.",
            detail: "Your country, industries, and sponsored-post rate stay under your control.",
          }
        : {
            eyebrow: "Creator profile · 03",
            title: "Publish one honest, bookable card.",
            detail: "Confirmation makes the listing visible to brands immediately.",
          };

  return (
    <>
      <div>
        <BrandMark inverse />
        <p className="mt-14 text-xs font-bold tracking-[0.12em] text-signal uppercase">
          {copy.eyebrow}
        </p>
        <h1 className="display-type mt-4 max-w-xl text-5xl leading-[0.92] sm:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-7 max-w-md text-base leading-7 text-mineral/68">{copy.detail}</p>
      </div>
      <div className="mt-10 border-white/22 border-t pt-5">
        {sourceUrl ? (
          <>
            <p className="text-xs font-bold tracking-[0.1em] text-mineral/48 uppercase">
              Public source
            </p>
            <p className="mt-2 break-all text-sm text-mineral">{sourceUrl}</p>
          </>
        ) : (
          <p className="text-sm leading-6 text-mineral/58">
            Private payout, tax, and compliance details are not collected in this flow.
          </p>
        )}
        <form action={signOutCreator} className="mt-5">
          <button className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-mineral/65 hover:text-signal">
            Sign out
          </button>
        </form>
      </div>
    </>
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
    <DossierShell
      activeStep={1}
      steps={creatorSteps}
      aside={<CreatorOnboardingAside activeStep={1} />}
    >
      <DossierTabs activeStep={1} steps={creatorSteps} />
      <div className="px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="max-w-3xl border-carbon/18 border-b pb-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <h2 className="display-type max-w-2xl text-5xl leading-[0.95] sm:text-6xl">
              Bring your public creator signal into focus.
            </h2>
            <span className="inline-flex bg-signal px-3 py-1 text-xs font-bold tracking-[0.11em] uppercase">
              Ready to analyze
            </span>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 text-carbon/66">
            Paste the public profile URL brands already use to understand your work. The analysis runs once on the server and returns an editable draft.
          </p>

          <form action={action} className="mt-9">
            <label className="block">
              <span className="field-label text-carbon">Public LinkedIn profile URL</span>
              <input
                className="field-input field-input-light"
                name="linkedinUrl"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://www.linkedin.com/in/your-name"
                required
              />
            </label>

            {state.error ? (
              <p role="alert" className="mt-4 border border-danger/55 bg-danger/8 px-4 py-3 text-sm text-danger">
                {state.error}
              </p>
            ) : null}

            <button className="primary-button mt-6 w-full sm:w-auto" type="submit" disabled={pending}>
              <span>{pending ? "Reading public signals…" : "Generate creator draft"}</span>
              <ArrowIcon className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] uppercase">One public input</p>
            <p className="display-type mt-3 text-3xl leading-tight text-aubergine">LinkedIn profile URL</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.12em] uppercase">Draft outputs</p>
            <ol className="mt-3 divide-carbon/16 divide-y border-carbon/18 border-y">
              {["Creator headline", "Up to three industries", "Suggested post price", "Audience positioning"].map(
                (item, index) => (
                  <li key={item} className="flex items-center gap-4 py-3 text-sm font-semibold">
                    <span className="display-type text-xl text-aubergine">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>
      </div>
    </DossierShell>
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
      <DossierShell
        activeStep={activeStep}
        steps={creatorSteps}
        aside={<CreatorOnboardingAside activeStep={activeStep} sourceUrl={draft.linkedinUrl} />}
      >
        <DossierTabs activeStep={activeStep} steps={creatorSteps} />
        <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="flex flex-wrap items-start justify-between gap-5 border-carbon/18 border-b pb-9">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Generated evidence</p>
              <h2 className="display-type mt-3 max-w-3xl text-5xl leading-[0.95] sm:text-6xl">
                Review the market-facing details.
              </h2>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-xs font-bold tracking-[0.11em] uppercase ${
                mode === "placeholder" ? "border border-danger/45 text-danger" : "bg-signal"
              }`}
            >
              {mode === "placeholder" ? "Placeholder · API key missing" : "AI draft · review required"}
            </span>
          </div>

          <section className="grid gap-px border-carbon/18 border-y bg-carbon/18 lg:grid-cols-2">
            <div className="bg-paper p-6">
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Headline</p>
              <p className="display-type mt-3 text-3xl leading-tight">{draft.headline}</p>
            </div>
            <div className="bg-paper p-6">
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Audience positioning</p>
              <p className="mt-3 text-sm leading-6 text-carbon/66">{draft.audienceSummary}</p>
            </div>
          </section>

          <form
            className="mt-9"
            onSubmit={(event) => {
              event.preventDefault();
              setConfirmed(true);
            }}
          >
            <div className="grid gap-7 lg:grid-cols-2">
              <label className="block">
                <span className="field-label text-carbon">Country</span>
                <input
                  className="field-input field-input-light"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  maxLength={80}
                  pattern="^(?!\[Placeholder\]).+$"
                  title="Replace the placeholder with your country."
                  required
                />
              </label>
              <label className="block">
                <span className="field-label text-carbon">Price per sponsored post · EUR</span>
                <input
                  className="field-input field-input-light"
                  value={pricePerPost}
                  onChange={(event) => setPricePerPost(event.target.value)}
                  inputMode="decimal"
                  pattern="\d+(?:[.,]\d{1,2})?"
                  placeholder="250.00"
                  required
                />
              </label>
            </div>

            <fieldset className="mt-7">
              <legend className="field-label text-carbon">Industries · up to three</legend>
              <div className="grid gap-3 lg:grid-cols-3">
                {industries.map((industry, index) => (
                  <input
                    key={index}
                    aria-label={`Industry ${index + 1}`}
                    className="field-input field-input-light"
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

            <button className="primary-button mt-8 w-full sm:w-auto" type="submit">
              <span>Review final card</span>
              <ArrowIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </DossierShell>
    );
  }

  return (
    <DossierShell
      activeStep={activeStep}
      steps={creatorSteps}
      aside={<CreatorOnboardingAside activeStep={activeStep} sourceUrl={draft.linkedinUrl} />}
    >
      <DossierTabs activeStep={activeStep} steps={creatorSteps} />
      <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="flex flex-wrap items-start justify-between gap-5 border-carbon/18 border-b pb-9">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Final confirmation</p>
            <h2 className="display-type mt-3 max-w-3xl text-5xl leading-[0.95] sm:text-6xl">
              Ready to enter the marketplace.
            </h2>
          </div>
          <EvidenceMark>Visible on publish</EvidenceMark>
        </div>

        <article className="mt-9 border border-carbon/20 bg-paper">
          <div className="border-carbon/16 border-b px-6 py-6">
            <p className="display-type text-4xl leading-none">{draft.headline}</p>
            <p className="mt-3 text-sm text-carbon/55">{country}</p>
          </div>
          <div className="grid gap-px bg-carbon/16 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="bg-paper px-6 py-6">
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Audience positioning</p>
              <p className="mt-3 text-sm leading-6 text-carbon/66">{draft.audienceSummary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedIndustries.map((industry, index) => (
                  <span key={`${industry}-${index}`} className="border border-carbon/18 px-2.5 py-1 text-xs font-semibold">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-mist/45 px-6 py-6">
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Post rate</p>
              <p className="display-type mt-3 text-5xl">€{pricePerPost}</p>
              <p className="mt-3 text-xs leading-5 text-carbon/54">
                Followers and estimated views start at zero until verified; no audience metrics are fabricated.
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
            <p role="alert" className="mb-4 border border-danger/55 bg-danger/8 px-4 py-3 text-sm text-danger">
              {createState.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-4">
            <button className="primary-button" type="submit" disabled={creating}>
              <span>{creating ? "Publishing creator card…" : "Publish creator card"}</span>
              <ArrowIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmed(false)}
              className="min-h-[3.65rem] cursor-pointer border border-carbon bg-transparent px-5 font-bold hover:bg-carbon hover:text-mineral"
            >
              Edit details
            </button>
          </div>
        </form>
      </div>
    </DossierShell>
  );
}

export function CreatorOnboardingFlow() {
  return <AnalyzeStep />;
}
