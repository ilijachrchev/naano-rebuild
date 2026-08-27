"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createCampaignAction,
  generateBriefAction,
  saveBriefAction,
  type CampaignActionState,
} from "@/app/brand/campaigns/actions";
import { ArrowIcon } from "@/components/brand/dossier";
import {
  campaignBriefSchema,
  haveAllBriefFieldsChanged,
  type CampaignBriefFields,
} from "@/lib/campaigns/brief";
import type { EditableBrief } from "@/lib/campaigns/data";

const initialState: CampaignActionState = { error: null, message: null };

type BriefDraft = {
  title: string;
  objectives: string;
  keyMessages: string;
  guidelines: string;
  status: "draft" | "ready";
};

function getInitialBriefDraft(
  brief: Pick<EditableBrief, "title" | "objectives" | "keyMessages" | "guidelines" | "status">,
): BriefDraft {
  return {
    title: brief.title,
    objectives: brief.objectives,
    keyMessages: brief.keyMessages.join("\n"),
    guidelines: brief.guidelines,
    status: brief.status,
  };
}

function parseBriefDraft(draft: BriefDraft): CampaignBriefFields | null {
  const parsed = campaignBriefSchema.safeParse({
    title: draft.title,
    objectives: draft.objectives,
    keyMessages: draft.keyMessages
      .split("\n")
      .map((message) => message.trim())
      .filter(Boolean),
    guidelines: draft.guidelines,
  });

  return parsed.success ? parsed.data : null;
}

function SubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();

  return (
    <button type="submit" disabled={status.pending} className="primary-button w-full sm:w-auto">
      <span>{status.pending ? pending : idle}</span>
      <ArrowIcon className="h-5 w-5" />
    </button>
  );
}

function ActionFeedback({ state }: { state: CampaignActionState }) {
  if (!state.error && !state.message) return null;

  return (
    <p
      aria-live="polite"
      className={`border-l-2 px-4 py-3 text-sm leading-6 ${
        state.error
          ? "border-l-danger bg-danger/8 text-danger"
          : "border-l-aubergine bg-mist/55 text-carbon/70"
      }`}
    >
      {state.error ?? state.message}
    </p>
  );
}

export function CreateCampaignForm({ workspaceId }: { workspaceId: string }) {
  const [state, formAction] = useActionState(createCampaignAction, initialState);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div>
        <label className="field-label" htmlFor="campaign-name">
          Campaign name
        </label>
        <input
          className="field-input field-input-light"
          id="campaign-name"
          name="name"
          placeholder="Q4 category campaign"
          minLength={2}
          maxLength={120}
          required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="campaign-objective">
          Objective
        </label>
        <textarea
          className="field-input field-input-light min-h-36 resize-y font-sans leading-6"
          id="campaign-objective"
          name="objective"
          placeholder="What should this campaign change for the business and its audience?"
          minLength={10}
          maxLength={2000}
          required
        />
        <p className="mt-2 text-xs leading-5 text-carbon/52">
          This objective becomes the primary instruction for the AI brief.
        </p>
      </div>
      <div>
        <label className="field-label" htmlFor="campaign-region">
          Region <span className="font-normal tracking-normal normal-case">(optional)</span>
        </label>
        <input
          className="field-input field-input-light"
          id="campaign-region"
          name="region"
          placeholder="Europe"
          maxLength={80}
        />
      </div>
      <ActionFeedback state={state} />
      <SubmitButton idle="Save campaign" pending="Saving campaign…" />
    </form>
  );
}

export function GenerateBriefForm({ campaignId }: { campaignId: string }) {
  const [state, formAction] = useActionState(generateBriefAction, initialState);

  return (
    <form action={formAction} className="mt-7">
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="border border-carbon/18 bg-paper px-5 py-5 sm:px-6">
        <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
          Built from your saved brand profile
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-carbon/64">
          Create with AI combines this campaign objective with the workspace’s saved brand profile.
          The result stays in draft so every field can be reviewed and edited.
        </p>
      </div>
      <div className="mt-5">
        <ActionFeedback state={state} />
      </div>
      <div className="mt-5">
        <SubmitButton idle="Create with AI" pending="Creating the brief…" />
      </div>
    </form>
  );
}

export function BriefEditor({ brief }: { brief: EditableBrief }) {
  const [state, formAction] = useActionState(saveBriefAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const initialDraft = getInitialBriefDraft(brief);
  const [draft, setDraft] = useState(initialDraft);
  const savedDraft = state.savedBrief ? getInitialBriefDraft(state.savedBrief) : initialDraft;

  const parsedFields = parseBriefDraft(draft);
  const placeholderRewritten =
    brief.generationMode !== "placeholder" ||
    Boolean(
      brief.placeholderBaseline &&
        parsedFields &&
        haveAllBriefFieldsChanged(brief.placeholderBaseline, parsedFields),
    );
  const canMarkReady = brief.generationMode !== "placeholder" || placeholderRewritten;
  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  useEffect(() => {
    if (!dirty) return;

    const warning = "You have unsaved changes to this brief. Leave without saving them?";
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!target || target.getAttribute("target") === "_blank") return;

      const destination = new URL(target.getAttribute("href") ?? "", window.location.href);
      if (destination.href === window.location.href || window.confirm(warning)) return;

      event.preventDefault();
      event.stopPropagation();
    };
    const handleDocumentSubmit = (event: SubmitEvent) => {
      if (event.target === formRef.current || window.confirm(warning)) return;

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("submit", handleDocumentSubmit, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      document.removeEventListener("submit", handleDocumentSubmit, true);
    };
  }, [dirty]);

  function updateDraft(values: Partial<BriefDraft>) {
    setDraft((current) => ({ ...current, ...values }));
  }

  return (
    <form ref={formRef} action={formAction} className="mt-8">
      <input type="hidden" name="briefId" value={brief.id} />
      <input type="hidden" name="campaignId" value={brief.campaignId} />

      {brief.generationMode === "placeholder" && !placeholderRewritten ? (
        <div className="mb-7 border border-danger/35 border-l-2 border-l-danger bg-danger/6 px-5 py-4">
          <p className="text-xs font-bold tracking-[0.12em] text-danger uppercase">
            Placeholder brief
          </p>
          <p className="mt-2 text-sm leading-6 text-carbon/68">
            AI drafting is temporarily unavailable, so we created a clearly marked starter brief.
            Replace every field before marking it ready.
          </p>
        </div>
      ) : null}

      <div className="grid gap-px border border-carbon/18 bg-carbon/18">
        <div className="bg-paper p-5 sm:p-6">
          <label className="field-label" htmlFor={`brief-title-${brief.id}`}>
            Brief title
          </label>
          <input
            className="field-input field-input-light"
            id={`brief-title-${brief.id}`}
            name="title"
            value={draft.title}
            onChange={(event) => updateDraft({ title: event.target.value })}
            minLength={2}
            maxLength={120}
            required
          />
        </div>

        <div className="bg-paper p-5 sm:p-6">
          <label className="field-label" htmlFor={`brief-objectives-${brief.id}`}>
            Objectives
          </label>
          <textarea
            className="field-input field-input-light min-h-40 resize-y font-sans leading-6"
            id={`brief-objectives-${brief.id}`}
            name="objectives"
            value={draft.objectives}
            onChange={(event) => updateDraft({ objectives: event.target.value })}
            minLength={10}
            maxLength={2000}
            required
          />
        </div>

        <div className="bg-paper p-5 sm:p-6">
          <label className="field-label" htmlFor={`brief-messages-${brief.id}`}>
            Key messages
          </label>
          <textarea
            className="field-input field-input-light min-h-44 resize-y font-sans leading-6"
            id={`brief-messages-${brief.id}`}
            name="keyMessages"
            value={draft.keyMessages}
            onChange={(event) => updateDraft({ keyMessages: event.target.value })}
            required
          />
          <p className="mt-2 text-xs leading-5 text-carbon/52">Use one message per line.</p>
        </div>

        <div className="bg-paper p-5 sm:p-6">
          <label className="field-label" htmlFor={`brief-guidelines-${brief.id}`}>
            Creator guidelines
          </label>
          <textarea
            className="field-input field-input-light min-h-44 resize-y font-sans leading-6"
            id={`brief-guidelines-${brief.id}`}
            name="guidelines"
            value={draft.guidelines}
            onChange={(event) => updateDraft({ guidelines: event.target.value })}
            minLength={10}
            maxLength={2000}
            required
          />
        </div>
      </div>

      <div className="mt-6 grid items-end gap-5 sm:grid-cols-[minmax(0,220px)_1fr]">
        <div>
          <label className="field-label" htmlFor={`brief-status-${brief.id}`}>
            Brief status
          </label>
          <select
            className="field-input field-input-light cursor-pointer"
            id={`brief-status-${brief.id}`}
            name="status"
            value={draft.status}
            onChange={(event) =>
              updateDraft({ status: event.target.value === "ready" ? "ready" : "draft" })
            }
          >
            <option value="draft">Draft</option>
            <option value="ready" disabled={!canMarkReady}>
              Ready
            </option>
          </select>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end sm:justify-self-end">
          {dirty ? (
            <span
              aria-live="polite"
              className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-carbon/58 uppercase"
            >
              <span className="h-2 w-2 rounded-full bg-signal" /> Unsaved changes
            </span>
          ) : null}
          <SubmitButton idle="Save brief" pending="Saving brief…" />
        </div>
      </div>
      <div className="mt-5">
        <ActionFeedback state={state} />
      </div>
    </form>
  );
}
