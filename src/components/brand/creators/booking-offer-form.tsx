"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createBrandInviteAction,
  type BookingActionState,
} from "@/app/brand/creators/actions";
import { ArrowIcon } from "@/components/brand/dossier";
import type { BookingBriefOption } from "@/lib/booking/data";
import type { MarketplaceCreator } from "@/lib/marketplace/creators";

const initialState: BookingActionState = { status: "idle", message: null };
const discountTiers = [5, 10, 15] as const;
const currencyFormatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatPostBy(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a date";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function parseEuroCents(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null;

  const [euros, decimals = ""] = normalized.split(".");
  const cents = Number(euros) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

function SubmitOfferButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} className="primary-button w-full sm:w-auto">
      <span>{pending ? "Reserving funds…" : "Send offer and reserve funds"}</span>
      <ArrowIcon className="h-5 w-5" />
    </button>
  );
}

export function BookingOfferForm({
  workspaceId,
  creator,
  briefs,
  defaultPostBy,
  minPostBy,
  onBack,
}: {
  workspaceId: string;
  creator: MarketplaceCreator;
  briefs: BookingBriefOption[];
  defaultPostBy: string;
  minPostBy: string;
  onBack: () => void;
}) {
  const [state, formAction] = useActionState(createBrandInviteAction, initialState);
  const [pricingMode, setPricingMode] = useState<"listed-rate" | "negotiate">("listed-rate");
  const [discount, setDiscount] = useState<(typeof discountTiers)[number] | "custom">(10);
  const [customEuros, setCustomEuros] = useState("");
  const [briefId, setBriefId] = useState(briefs[0]?.id ?? "");
  const [postBy, setPostBy] = useState(defaultPostBy);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const listPriceCents = creator.pricePerPostCents;

  const feeCents = useMemo(() => {
    if (listPriceCents === null) return null;
    if (pricingMode === "listed-rate") return listPriceCents;
    if (discount === "custom") return parseEuroCents(customEuros);
    return Math.max(1, Math.round((listPriceCents * (100 - discount)) / 100));
  }, [customEuros, discount, listPriceCents, pricingMode]);

  const discountPercentage =
    listPriceCents && feeCents && feeCents < listPriceCents
      ? Math.round((1 - feeCents / listPriceCents) * 100)
      : 0;
  const customFeeError =
    pricingMode === "negotiate" && discount === "custom"
      ? !customEuros.trim()
        ? "Enter a custom offer amount."
        : feeCents === null
          ? "Use a valid EUR amount with no more than two decimal places."
          : listPriceCents !== null && feeCents >= listPriceCents
            ? `Enter an amount below ${formatCurrency(listPriceCents)}.`
            : feeCents <= 0
              ? "The offer must be greater than zero."
              : null
      : null;
  const selectedBrief = briefs.find((brief) => brief.id === briefId) ?? null;
  const formattedPostBy = formatPostBy(postBy);
  const canSubmit =
    briefs.length > 0 &&
    listPriceCents !== null &&
    feeCents !== null &&
    feeCents > 0 &&
    (pricingMode === "listed-rate" || feeCents < listPriceCents);

  if (state.status === "success") {
    return (
      <section className="py-2" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal font-bold" aria-hidden="true">
            ✓
          </span>
          <p className="text-xs font-bold tracking-[0.12em] uppercase">Offer reserved</p>
        </div>
        <h3 className="display-type mt-5 max-w-2xl text-4xl leading-none sm:text-5xl">
          {creator.displayName} has 48 hours to respond.
        </h3>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-carbon/64">{state.message}</p>
        <div className="mt-8 flex flex-wrap gap-3 border-carbon/18 border-t pt-6">
          <Link href="/brand/collaborations" className="primary-button">
            <span>View collaborations</span>
            <ArrowIcon className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={onBack}
            className="min-h-14 cursor-pointer border border-carbon bg-transparent px-5 text-sm font-bold hover:bg-carbon hover:text-mineral"
          >
            Back to dossier
          </button>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="creatorId" value={creator.id} />
      <input type="hidden" name="pricingMode" value={pricingMode} />
      <input type="hidden" name="feeCents" value={feeCents ?? ""} />

      <section aria-labelledby={`offer-price-${creator.id}`}>
        <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Offer terms · 01</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-carbon/18 border-b pb-5">
          <div>
            <h3 id={`offer-price-${creator.id}`} className="display-type text-4xl">
              Set the fee.
            </h3>
            <p className="mt-2 text-sm text-carbon/58">
              Listed rate {listPriceCents === null ? "unavailable" : formatCurrency(listPriceCents)} per post.
            </p>
          </div>
          {feeCents !== null ? (
            <div className="text-right">
              <p className="text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Offer</p>
              <p className="display-type mt-1 text-4xl text-aubergine">{formatCurrency(feeCents)}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-px border border-carbon/18 bg-carbon/18 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={pricingMode === "listed-rate"}
            onClick={() => setPricingMode("listed-rate")}
            className={`min-h-20 cursor-pointer px-5 text-left ${
              pricingMode === "listed-rate" ? "bg-signal text-carbon" : "bg-paper hover:bg-mist/55"
            }`}
          >
            <span className="block text-xs font-bold tracking-[0.1em] uppercase">Book at listed rate</span>
            <span className="mt-1 block text-sm opacity-70">Send the creator’s published fee.</span>
          </button>
          <button
            type="button"
            aria-pressed={pricingMode === "negotiate"}
            onClick={() => setPricingMode("negotiate")}
            className={`min-h-20 cursor-pointer px-5 text-left ${
              pricingMode === "negotiate" ? "bg-signal text-carbon" : "bg-paper hover:bg-mist/55"
            }`}
          >
            <span className="block text-xs font-bold tracking-[0.1em] uppercase">Negotiate lower</span>
            <span className="mt-1 block text-sm opacity-70">Propose a discounted fixed fee.</span>
          </button>
        </div>

        {pricingMode === "negotiate" && listPriceCents !== null ? (
          <div className="mt-5 border border-carbon/18 bg-mist/30 px-5 py-5">
            <p className="field-label">Discount from listed rate</p>
            <div className="grid gap-px bg-carbon/18 sm:grid-cols-4">
              {discountTiers.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={discount === tier}
                  onClick={() => setDiscount(tier)}
                  className={`min-h-12 cursor-pointer text-sm font-bold ${
                    discount === tier ? "bg-signal" : "bg-paper hover:bg-white"
                  }`}
                >
                  {tier}% lower
                </button>
              ))}
              <button
                type="button"
                aria-pressed={discount === "custom"}
                onClick={() => setDiscount("custom")}
                className={`min-h-12 cursor-pointer text-sm font-bold ${
                  discount === "custom" ? "bg-signal" : "bg-paper hover:bg-white"
                }`}
              >
                Custom
              </button>
            </div>
            {discount === "custom" ? (
              <div className="mt-5 max-w-xs">
                <label className="field-label" htmlFor={`custom-fee-${creator.id}`}>
                  Custom offer in EUR
                </label>
                <input
                  id={`custom-fee-${creator.id}`}
                  className="field-input field-input-light"
                  type="text"
                  inputMode="decimal"
                  value={customEuros}
                  onChange={(event) => setCustomEuros(event.target.value)}
                  placeholder="650.00"
                  aria-describedby={`custom-fee-help-${creator.id}`}
                  aria-invalid={customFeeError ? true : undefined}
                />
                <p
                  id={`custom-fee-help-${creator.id}`}
                  className={`mt-2 text-xs leading-5 ${customFeeError ? "text-danger" : "text-carbon/54"}`}
                >
                  {customFeeError ?? `Enter an amount below ${formatCurrency(listPriceCents)}.`}
                </p>
              </div>
            ) : null}
            {feeCents !== null && discountPercentage > 0 ? (
              <p className="mt-4 text-xs font-bold tracking-[0.09em] text-aubergine uppercase">
                {discountPercentage}% below listed rate
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby={`offer-delivery-${creator.id}`}>
        <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Delivery · 02</p>
        <h3 id={`offer-delivery-${creator.id}`} className="display-type mt-3 text-4xl">
          Attach the working brief.
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor={`brief-${creator.id}`}>
              Ready brief
            </label>
            <select
              id={`brief-${creator.id}`}
              name="briefId"
              className="field-input field-input-light cursor-pointer"
              value={briefId}
              onChange={(event) => setBriefId(event.target.value)}
              required
              disabled={!briefs.length}
            >
              {!briefs.length ? <option value="">No ready briefs</option> : null}
              {briefs.map((brief) => (
                <option key={brief.id} value={brief.id}>
                  {brief.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor={`post-by-${creator.id}`}>
              Post by
            </label>
            <input
              id={`post-by-${creator.id}`}
              name="postBy"
              className="field-input field-input-light"
              type="date"
              value={postBy}
              min={minPostBy}
              onChange={(event) => setPostBy(event.target.value)}
              required
            />
            <p className="mt-2 text-xs leading-5 text-carbon/52">Defaults to 14 days from today.</p>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 border border-carbon/18 bg-paper px-4 py-4">
          <input
            type="checkbox"
            name="approvalRequired"
            className="mt-1 h-4 w-4 accent-aubergine"
            checked={approvalRequired}
            onChange={(event) => setApprovalRequired(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-bold">Require content approval before publishing</span>
            <span className="mt-1 block text-xs leading-5 text-carbon/54">
              The creator must submit content for review before the post can go live.
            </span>
          </span>
        </label>
      </section>

      <section aria-labelledby={`reservation-summary-${creator.id}`}>
        <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Reservation · 03</p>
        <h3 id={`reservation-summary-${creator.id}`} className="display-type mt-3 text-4xl">
          Review what will be reserved.
        </h3>
        <dl className="mt-5 grid gap-px border border-carbon/18 bg-carbon/18 sm:grid-cols-2">
          <div className="bg-paper px-4 py-4">
            <dt className="text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Fee</dt>
            <dd className="display-type mt-2 text-2xl">{feeCents === null ? "Check amount" : formatCurrency(feeCents)}</dd>
          </div>
          <div className="bg-paper px-4 py-4">
            <dt className="text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Campaign brief</dt>
            <dd className="mt-2 text-sm font-bold">{selectedBrief?.title ?? "No ready brief"}</dd>
          </div>
          <div className="bg-paper px-4 py-4">
            <dt className="text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Post by</dt>
            <dd className="mt-2 text-sm font-bold">{formattedPostBy}</dd>
          </div>
          <div className="bg-paper px-4 py-4">
            <dt className="text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Content approval</dt>
            <dd className="mt-2 text-sm font-bold">{approvalRequired ? "Required" : "Not required"}</dd>
          </div>
        </dl>
      </section>

      {!briefs.length ? (
        <div className="border-l-2 border-l-aubergine bg-mist/55 px-4 py-4 text-sm leading-6">
          Prepare and mark a campaign brief ready before inviting a creator.{" "}
          <Link href="/brand/campaigns" className="font-bold text-aubergine underline underline-offset-4">
            Open campaigns
          </Link>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          aria-live="polite"
          className="border-l-2 border-l-danger bg-danger/8 px-4 py-4 text-sm leading-6 text-danger"
        >
          <p>{state.message}</p>
          {state.errorCode === "INSUFFICIENT_FUNDS" ? (
            <Link href="/brand/wallet" className="mt-2 inline-block font-bold underline underline-offset-4">
              Review wallet
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-carbon/18 border-t pt-6">
        <p className="max-w-lg text-xs leading-5 text-carbon/52">
          Sending reserves the offer amount immediately. The creator has 48 hours to respond.
        </p>
        <SubmitOfferButton disabled={!canSubmit} />
      </div>
    </form>
  );
}
