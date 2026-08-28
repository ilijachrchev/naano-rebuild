"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { BookingOfferForm } from "@/components/brand/creators/booking-offer-form";
import type { BookingBriefOption } from "@/lib/booking/data";
import type {
  AudienceSegment,
  MarketplaceCreator,
} from "@/lib/marketplace/creators";

type SortOption = "match" | "followers" | "views" | "price-ascending" | "price-descending";
type PriceOption = "all" | "under-500" | "500-1000" | "over-1000";
type ProfileTab = "overview" | "audience" | "content";

const numberFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const currencyFormatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatCurrency(cents: number | null) {
  return cents === null ? "Unavailable" : currencyFormatter.format(cents / 100);
}

function matchesPrice(creator: MarketplaceCreator, price: PriceOption) {
  const postPrice = creator.pricePerPostCents;
  if (price === "all") return true;
  if (postPrice === null) return false;
  if (price === "under-500") return postPrice < 50_000;
  if (price === "500-1000") {
    return postPrice >= 50_000 && postPrice <= 100_000;
  }
  return postPrice > 100_000;
}

const selectClass =
  "mt-2 min-h-11 w-full cursor-pointer rounded-[0.7rem] border border-nn-line-strong bg-nn-white px-3 text-sm text-nn-ink transition-colors hover:border-nn-blue focus:border-nn-blue focus:outline-none";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.85rem] border border-nn-line bg-nn-white px-4 py-4">
      <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">{label}</p>
      <p className="nn-num display-type mt-2 text-2xl leading-none text-nn-ink">{value}</p>
    </div>
  );
}

function AudienceBreakdown({ title, segments }: { title: string; segments: AudienceSegment[] }) {
  return (
    <section>
      <h3 className="text-xs font-bold tracking-[0.12em] text-nn-muted uppercase">{title}</h3>
      {segments.length ? (
        <ol className="mt-4 grid gap-4">
          {segments.map((segment) => (
            <li
              key={segment.label}
              className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-4"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-semibold text-nn-ink">{segment.label}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-nn-blue-50" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-nn-blue"
                    style={{ width: `${Math.min(segment.percentage, 100)}%` }}
                  />
                </div>
              </div>
              <span className="nn-num display-type text-right text-xl text-nn-ink">
                {segment.percentage}%
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-nn-muted">No breakdown is available.</p>
      )}
    </section>
  );
}

function CreatorProfileModal({
  creator,
  briefs,
  workspaceId,
  defaultPostBy,
  minPostBy,
  onDismiss,
}: {
  creator: MarketplaceCreator | null;
  briefs: BookingBriefOption[];
  workspaceId: string;
  defaultPostBy: string;
  minPostBy: string;
  onDismiss: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [showOffer, setShowOffer] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (creator && !dialog.open) {
      setActiveTab("overview");
      setShowOffer(false);
      setIdempotencyKey(null);
      dialog.showModal();
    } else if (!creator && dialog.open) {
      dialog.close();
    }
  }, [creator]);

  if (!creator) return <dialog ref={dialogRef} />;

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "audience", label: "Audience" },
    { id: "content", label: "Content" },
  ];
  const post = creator.samplePost;
  const totalEngagement = post ? post.reactions + post.comments + post.reposts : 0;
  const engagementRate = post?.impressions ? (totalEngagement / post.impressions) * 100 : null;

  function openOffer() {
    setIdempotencyKey(crypto.randomUUID());
    setShowOffer(true);
  }

  function closeOffer() {
    setShowOffer(false);
    setIdempotencyKey(null);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    document.getElementById(`tab-${nextTab.id}`)?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="creator-profile-title"
      onClose={onDismiss}
      className="m-auto max-h-[calc(100vh-2rem)] w-[min(920px,calc(100%-2rem))] overflow-hidden rounded-[1.25rem] border border-nn-line bg-nn-white p-0 text-nn-ink shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)] backdrop:bg-nn-ink/60"
    >
      <div className="grid max-h-[calc(100vh-2rem)] grid-rows-[auto_auto_1fr]">
        <header className="flex items-start justify-between gap-6 border-nn-line border-b px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <span className="display-type flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.85rem] bg-nn-blue-50 text-2xl text-nn-blue">
              {creator.avatarInitials}
            </span>
            <div className="min-w-0">
              <span className="nn-chip">{creator.matchScore}% match</span>
              <h2 id="creator-profile-title" className="display-type mt-2 text-4xl leading-none text-nn-ink sm:text-5xl">
                {creator.displayName}
              </h2>
              <p className="mt-2 text-sm text-nn-muted">{creator.country}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close creator profile"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-nn-line-strong bg-transparent text-2xl leading-none text-nn-muted transition-colors hover:border-nn-blue hover:text-nn-blue"
          >
            ×
          </button>
        </header>

        {showOffer ? (
          <div className="flex min-h-14 items-center justify-between border-nn-line border-b bg-nn-blue-50 px-5 sm:px-8">
            <p className="text-[0.72rem] font-bold tracking-[0.12em] text-nn-blue uppercase">Offer</p>
            <button
              type="button"
              onClick={closeOffer}
              className="cursor-pointer border-0 bg-transparent text-xs font-bold text-nn-blue hover:text-nn-blue-strong"
            >
              Back to profile
            </button>
          </div>
        ) : (
          <div role="tablist" aria-label="Creator profile sections" className="flex border-nn-line border-b px-5 sm:px-8">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`-mb-px min-h-14 cursor-pointer border-0 border-b-2 bg-transparent px-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-nn-blue text-nn-blue"
                    : "border-transparent text-nn-muted hover:text-nn-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto bg-nn-white px-5 py-7 sm:px-8 sm:py-9">
          {showOffer && idempotencyKey ? (
            <BookingOfferForm
              key={`${creator.id}-${idempotencyKey}`}
              workspaceId={workspaceId}
              idempotencyKey={idempotencyKey}
              creator={creator}
              briefs={briefs}
              defaultPostBy={defaultPostBy}
              minPostBy={minPostBy}
              onBack={closeOffer}
            />
          ) : null}

          {!showOffer && activeTab === "overview" ? (
            <section id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
              <p className="display-type max-w-3xl text-3xl leading-[1.08] text-nn-ink sm:text-4xl">
                {creator.headline}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {creator.industries.map((industry) => (
                  <span
                    key={industry}
                    className="rounded-full border border-nn-line px-3 py-1 text-xs font-semibold text-nn-muted"
                  >
                    {industry}
                  </span>
                ))}
              </div>
              <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Followers" value={formatCount(creator.followers)} />
                <Stat label="Est. views" value={formatCount(creator.estimatedViews)} />
                <Stat
                  label="Est. CPM"
                  value={creator.estimatedCpmCents === null ? "—" : formatCurrency(creator.estimatedCpmCents)}
                />
                <Stat label="Post cost" value={formatCurrency(creator.pricePerPostCents)} />
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-nn-line border-t pt-6">
                <p className="max-w-lg text-sm leading-6 text-nn-muted">
                  Attach a ready campaign brief and reserve the fixed fee from your wallet.
                </p>
                <button
                  type="button"
                  onClick={openOffer}
                  disabled={creator.pricePerPostCents === null}
                  className="primary-button"
                >
                  <span>{creator.pricePerPostCents === null ? "Rate unavailable" : "Make an offer"}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          ) : null}

          {!showOffer && activeTab === "audience" ? (
            <section id="panel-audience" role="tabpanel" aria-labelledby="tab-audience">
              <div className="flex flex-wrap items-end justify-between gap-4 border-nn-line border-b pb-6">
                <h2 className="display-type text-4xl text-nn-ink">Who this creator reaches.</h2>
                {creator.audience.sampleSize !== null ? (
                  <span className="nn-chip">Sample {formatCount(creator.audience.sampleSize)}</span>
                ) : null}
              </div>
              {creator.audience.positioningSummary ? (
                <div className="mt-7 rounded-[1.25rem] bg-nn-blue-50 px-5 py-5">
                  <p className="text-[0.7rem] font-bold tracking-[0.12em] text-nn-blue uppercase">
                    Creator positioning
                  </p>
                  <p className="mt-2 text-sm leading-6 text-nn-ink">
                    {creator.audience.positioningSummary}
                  </p>
                </div>
              ) : null}
              <div className="mt-8 grid gap-10 lg:grid-cols-2">
                <AudienceBreakdown title="Job title" segments={creator.audience.jobTitles} />
                <AudienceBreakdown title="Seniority" segments={creator.audience.seniority} />
              </div>
            </section>
          ) : null}

          {!showOffer && activeTab === "content" ? (
            <section id="panel-content" role="tabpanel" aria-labelledby="tab-content">
              <h2 className="text-xs font-bold tracking-[0.12em] text-nn-muted uppercase">Sample post</h2>
              {post ? (
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-nn-line bg-nn-white">
                  <div className="border-nn-line border-b px-5 py-5 sm:px-7">
                    <p className="display-type text-2xl text-nn-ink">Published LinkedIn post</p>
                    <p className="mt-3 text-sm text-nn-muted">
                      {post.publishedAt
                        ? `Published ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.publishedAt))}`
                        : "Publication date unavailable"}
                    </p>
                    {post.url ? (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-bold text-nn-blue hover:text-nn-blue-strong"
                      >
                        View post on LinkedIn ↗
                      </a>
                    ) : null}
                  </div>
                  <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                    <Stat label="Reactions" value={formatCount(post.reactions)} />
                    <Stat label="Comments" value={formatCount(post.comments)} />
                    <Stat label="Reposts" value={formatCount(post.reposts)} />
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4 border-nn-line border-t bg-nn-blue-50 px-5 py-4 text-sm sm:px-7">
                    <span className="font-semibold text-nn-ink">
                      {formatCount(totalEngagement)} total engagements
                    </span>
                    <span className="text-nn-muted">
                      {engagementRate === null ? "Rate unavailable" : `${engagementRate.toFixed(1)}% engagement rate`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-10">
                  <p className="display-type text-2xl text-nn-ink">No sample post is visible.</p>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-nn-muted">
                    This profile has no published post available to this workspace under row-level security.
                  </p>
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function CreatorCard({ creator, onOpen }: { creator: MarketplaceCreator; onOpen: () => void }) {
  return (
    <article className="nn-card flex min-h-full flex-col rounded-[1.25rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="display-type flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.85rem] bg-nn-blue-50 text-xl text-nn-blue">
            {creator.avatarInitials}
          </span>
          <div className="min-w-0">
            <h2 className="display-type truncate text-2xl leading-none text-nn-ink">{creator.displayName}</h2>
            <p className="mt-1 text-xs text-nn-muted">{creator.country}</p>
          </div>
        </div>
        <span className="nn-chip shrink-0">{creator.matchScore}%</span>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-nn-muted">{creator.headline}</p>
        <div className="mt-4 flex min-h-12 flex-wrap content-start gap-1.5">
          {creator.industries.map((industry) => (
            <span
              key={industry}
              className="rounded-full border border-nn-line px-2.5 py-1 text-[0.7rem] font-semibold text-nn-muted"
            >
              {industry}
            </span>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-nn-line border-t pt-5">
          <div>
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Followers</dt>
            <dd className="nn-num display-type mt-1 text-2xl text-nn-ink">{formatCount(creator.followers)}</dd>
          </div>
          <div>
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Est. views</dt>
            <dd className="nn-num display-type mt-1 text-2xl text-nn-ink">{formatCount(creator.estimatedViews)}</dd>
          </div>
          <div>
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Est. CPM</dt>
            <dd className="nn-num display-type mt-1 text-2xl text-nn-ink">
              {creator.estimatedCpmCents === null ? "—" : formatCurrency(creator.estimatedCpmCents)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-nn-muted uppercase">Post cost</dt>
            <dd className="nn-num display-type mt-1 text-2xl text-nn-ink">{formatCurrency(creator.pricePerPostCents)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onOpen}
          className="mt-6 flex min-h-12 cursor-pointer items-center justify-between rounded-[0.85rem] border border-nn-line-strong bg-transparent px-4 text-sm font-bold text-nn-ink transition-colors hover:border-nn-blue hover:text-nn-blue"
        >
          View creator <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

export function CreatorMarketplace({
  creators,
  briefs,
  workspaceId,
  defaultPostBy,
  minPostBy,
}: {
  creators: MarketplaceCreator[];
  briefs: BookingBriefOption[];
  workspaceId: string;
  defaultPostBy: string;
  minPostBy: string;
}) {
  const [industry, setIndustry] = useState("all");
  const [country, setCountry] = useState("all");
  const [price, setPrice] = useState<PriceOption>("all");
  const [sort, setSort] = useState<SortOption>("match");
  const [selectedCreator, setSelectedCreator] = useState<MarketplaceCreator | null>(null);

  const industries = useMemo(
    () => [...new Set(creators.flatMap((creator) => creator.industries))].sort(),
    [creators],
  );
  const countries = useMemo(
    () => [...new Set(creators.map((creator) => creator.country))].sort(),
    [creators],
  );

  const visibleCreators = useMemo(() => {
    const filtered = creators.filter(
      (creator) =>
        (industry === "all" || creator.industries.includes(industry)) &&
        (country === "all" || creator.country === country) &&
        matchesPrice(creator, price),
    );

    return filtered.sort((left, right) => {
      if (sort === "followers") return right.followers - left.followers;
      if (sort === "views") return right.estimatedViews - left.estimatedViews;
      if (sort === "price-ascending" || sort === "price-descending") {
        if (left.pricePerPostCents === null && right.pricePerPostCents === null) {
          return right.matchScore - left.matchScore;
        }
        if (left.pricePerPostCents === null) return 1;
        if (right.pricePerPostCents === null) return -1;
        return sort === "price-ascending"
          ? left.pricePerPostCents - right.pricePerPostCents
          : right.pricePerPostCents - left.pricePerPostCents;
      }
      return right.matchScore - left.matchScore;
    });
  }, [country, creators, industry, price, sort]);

  const filtersActive = industry !== "all" || country !== "all" || price !== "all";

  function clearFilters() {
    setIndustry("all");
    setCountry("all");
    setPrice("all");
  }

  return (
    <>
      <section aria-labelledby="creator-filters" className="nn-card rounded-[1.25rem] p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="creator-filters" className="text-sm font-bold text-nn-ink">
            Refine the matches
          </h2>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-nn-blue hover:text-nn-blue-strong"
            >
              Clear filters
            </button>
          ) : null}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="block text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Industry</span>
            <select value={industry} onChange={(event) => setIndustry(event.target.value)} className={selectClass}>
              <option value="all">All industries</option>
              {industries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Country</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className={selectClass}>
              <option value="all">All countries</option>
              {countries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Post price</span>
            <select
              value={price}
              onChange={(event) => setPrice(event.target.value as PriceOption)}
              className={selectClass}
            >
              <option value="all">Any price</option>
              <option value="under-500">Under €500</option>
              <option value="500-1000">€500–€1,000</option>
              <option value="over-1000">Over €1,000</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-[0.72rem] font-bold tracking-[0.12em] text-nn-muted uppercase">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className={selectClass}
            >
              <option value="match">Best match</option>
              <option value="followers">Most followers</option>
              <option value="views">Most estimated views</option>
              <option value="price-ascending">Lowest post cost</option>
              <option value="price-descending">Highest post cost</option>
            </select>
          </label>
        </div>
      </section>

      <div className="mt-9 flex items-end justify-between gap-4">
        <p className="display-type text-3xl text-nn-ink" role="status" aria-live="polite">
          {visibleCreators.length} profiles in view
        </p>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-nn-muted sm:block">
          Match is the seeded baseline until campaign-specific scoring is connected.
        </p>
      </div>

      {visibleCreators.length ? (
        <div className="mt-6 grid auto-rows-fr gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {visibleCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} onOpen={() => setSelectedCreator(creator)} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-nn-line bg-nn-white px-6 py-14 text-center">
          <p className="display-type text-3xl text-nn-ink">No creators in this cut.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-nn-muted">
            {creators.length
              ? "Try widening the filters to bring more matched profiles back into view."
              : "Marketplace-visible creator records will appear here as soon as the seeded data is available under RLS."}
          </p>
          {filtersActive ? (
            <button type="button" onClick={clearFilters} className="nn-btn nn-btn-primary mt-6">
              Clear filters
            </button>
          ) : null}
        </div>
      )}

      <CreatorProfileModal
        creator={selectedCreator}
        briefs={briefs}
        workspaceId={workspaceId}
        defaultPostBy={defaultPostBy}
        minPostBy={minPostBy}
        onDismiss={() => setSelectedCreator(null)}
      />
    </>
  );
}
