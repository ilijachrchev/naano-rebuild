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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper px-4 py-4">
      <p className="text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">{label}</p>
      <p className="display-type mt-2 text-2xl leading-none">{value}</p>
    </div>
  );
}

function AudienceBreakdown({ title, segments }: { title: string; segments: AudienceSegment[] }) {
  return (
    <section>
      <h3 className="text-xs font-bold tracking-[0.12em] uppercase">{title}</h3>
      {segments.length ? (
        <ol className="mt-4 border-carbon/18 border-y">
          {segments.map((segment) => (
            <li
              key={segment.label}
              className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-4 border-carbon/14 border-b py-3 last:border-b-0"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-semibold">{segment.label}</span>
                </div>
                <div className="mt-2 h-1 bg-mist" aria-hidden="true">
                  <div className="h-full bg-aubergine" style={{ width: `${Math.min(segment.percentage, 100)}%` }} />
                </div>
              </div>
              <span className="display-type text-right text-xl">{segment.percentage}%</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 border-carbon/18 border-y py-5 text-sm text-carbon/55">No breakdown is available.</p>
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
      className="m-auto max-h-[calc(100vh-2rem)] w-[min(920px,calc(100%-2rem))] overflow-hidden border border-carbon/28 bg-paper p-0 text-carbon backdrop:bg-carbon/76"
    >
      <div className="grid max-h-[calc(100vh-2rem)] grid-rows-[auto_auto_1fr]">
        <header className="flex items-start justify-between gap-6 border-carbon/18 border-b bg-carbon px-5 py-5 text-mineral sm:px-8 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <span className="display-type flex h-16 w-16 shrink-0 items-center justify-center border border-mineral/28 bg-mineral/8 text-2xl text-signal">
              {creator.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="text-[0.72rem] font-bold tracking-[0.12em] text-signal uppercase">
                {creator.matchScore}% match
              </p>
              <h2 id="creator-profile-title" className="display-type mt-1 text-4xl leading-none sm:text-5xl">
                {creator.displayName}
              </h2>
              <p className="mt-2 text-sm text-mineral/62">{creator.country}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close creator profile"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-mineral/28 bg-transparent text-2xl leading-none text-mineral transition-colors hover:border-signal hover:text-signal"
          >
            ×
          </button>
        </header>

        {showOffer ? (
          <div className="flex min-h-14 items-center justify-between border-carbon/18 border-b bg-mist/55 px-5 sm:px-8">
            <p className="text-[0.7rem] font-bold tracking-[0.11em] uppercase">
              <span className="mr-2 text-aubergine">04</span> Offer
            </p>
            <button
              type="button"
              onClick={closeOffer}
              className="cursor-pointer border-0 bg-transparent text-xs font-bold text-aubergine hover:text-aubergine-deep"
            >
              Back to dossier
            </button>
          </div>
        ) : (
          <div role="tablist" aria-label="Creator profile sections" className="flex border-carbon/18 border-b bg-mist/55">
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
                className={`min-h-14 cursor-pointer border-0 border-carbon/18 border-r px-5 text-[0.7rem] font-bold tracking-[0.11em] uppercase sm:min-w-40 ${
                  activeTab === tab.id ? "bg-paper text-carbon" : "bg-transparent text-carbon/52 hover:text-carbon"
                }`}
              >
                <span className={activeTab === tab.id ? "mr-2 text-aubergine" : "mr-2"}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="dossier-paper overflow-y-auto px-5 py-7 sm:px-8 sm:py-9">
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
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Creator overview</p>
              <p className="display-type mt-4 max-w-3xl text-4xl leading-[1.02] sm:text-5xl">{creator.headline}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {creator.industries.map((industry) => (
                  <span key={industry} className="border border-carbon/20 px-2.5 py-1 text-xs font-semibold">
                    {industry}
                  </span>
                ))}
              </div>
              <div className="mt-9 grid gap-px border border-carbon/18 bg-carbon/18 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Followers" value={formatCount(creator.followers)} />
                <Stat label="Est. views" value={formatCount(creator.estimatedViews)} />
                <Stat
                  label="Est. CPM"
                  value={creator.estimatedCpmCents === null ? "—" : formatCurrency(creator.estimatedCpmCents)}
                />
                <Stat label="Post cost" value={formatCurrency(creator.pricePerPostCents)} />
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-carbon/18 border-t pt-6">
                <p className="max-w-lg text-sm leading-6 text-carbon/58">
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
              <div className="flex flex-wrap items-end justify-between gap-4 border-carbon/18 border-b pb-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Audience evidence</p>
                  <h2 className="display-type mt-2 text-4xl">Who this creator reaches.</h2>
                </div>
                {creator.audience.sampleSize !== null ? (
                  <span className="border border-carbon/20 px-3 py-2 text-xs font-bold tracking-[0.09em] uppercase">
                    Sample {formatCount(creator.audience.sampleSize)}
                  </span>
                ) : null}
              </div>
              {creator.audience.positioningSummary ? (
                <div className="mt-7 border-carbon/18 border-l-2 border-l-aubergine bg-mist/38 px-5 py-4">
                  <p className="text-[0.68rem] font-bold tracking-[0.1em] text-carbon/48 uppercase">
                    Creator positioning
                  </p>
                  <p className="mt-2 text-sm leading-6 text-carbon/66">
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
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Sample post</p>
              {post ? (
                <div className="mt-4 border border-carbon/20 bg-paper">
                  <div className="border-carbon/16 border-b px-5 py-5 sm:px-7">
                    <p className="display-type text-3xl">Published LinkedIn post</p>
                    <p className="mt-3 text-sm text-carbon/58">
                      {post.publishedAt
                        ? `Published ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.publishedAt))}`
                        : "Publication date unavailable"}
                    </p>
                    {post.url ? (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex border-carbon/24 border-b pb-0.5 text-sm font-bold text-aubergine hover:border-aubergine"
                      >
                        View post on LinkedIn ↗
                      </a>
                    ) : null}
                  </div>
                  <div className="grid gap-px bg-carbon/18 sm:grid-cols-3">
                    <Stat label="Reactions" value={formatCount(post.reactions)} />
                    <Stat label="Comments" value={formatCount(post.comments)} />
                    <Stat label="Reposts" value={formatCount(post.reposts)} />
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4 border-carbon/16 border-t bg-mist/32 px-5 py-4 text-sm sm:px-7">
                    <span className="font-semibold">{formatCount(totalEngagement)} total engagements</span>
                    <span className="text-carbon/58">
                      {engagementRate === null ? "Rate unavailable" : `${engagementRate.toFixed(1)}% engagement rate`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 border border-carbon/20 bg-paper px-6 py-10">
                  <p className="display-type text-3xl">No sample post is visible.</p>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-carbon/58">
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
    <article className="flex min-h-full flex-col border border-carbon/20 bg-paper">
      <div className="flex items-start justify-between gap-4 border-carbon/16 border-b px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="display-type flex h-14 w-14 shrink-0 items-center justify-center border border-carbon/20 bg-mist/55 text-xl text-aubergine">
            {creator.avatarInitials}
          </span>
          <div className="min-w-0">
            <h2 className="display-type truncate text-3xl leading-none">{creator.displayName}</h2>
            <p className="mt-1 text-xs text-carbon/55">{creator.country}</p>
          </div>
        </div>
        <span className="shrink-0 bg-signal px-2.5 py-1 text-xs font-bold tracking-[0.08em] uppercase">
          {creator.matchScore}%
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-carbon/68">{creator.headline}</p>
        <div className="mt-4 flex min-h-12 flex-wrap content-start gap-1.5">
          {creator.industries.map((industry) => (
            <span key={industry} className="border border-carbon/18 px-2.5 py-1 text-[0.7rem] font-semibold">
              {industry}
            </span>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-2 border-carbon/18 border-y">
          <div className="border-carbon/14 border-r border-b py-4 pr-3">
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">Followers</dt>
            <dd className="display-type mt-1 text-2xl">{formatCount(creator.followers)}</dd>
          </div>
          <div className="border-carbon/14 border-b py-4 pl-3">
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">Est. views</dt>
            <dd className="display-type mt-1 text-2xl">{formatCount(creator.estimatedViews)}</dd>
          </div>
          <div className="border-carbon/14 border-r py-4 pr-3">
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">Est. CPM</dt>
            <dd className="display-type mt-1 text-2xl">
              {creator.estimatedCpmCents === null ? "—" : formatCurrency(creator.estimatedCpmCents)}
            </dd>
          </div>
          <div className="py-4 pl-3">
            <dt className="text-[0.72rem] font-bold tracking-[0.1em] text-carbon/45 uppercase">Post cost</dt>
            <dd className="display-type mt-1 text-2xl">{formatCurrency(creator.pricePerPostCents)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onOpen}
          className="mt-5 flex min-h-12 cursor-pointer items-center justify-between border border-carbon bg-transparent px-4 text-sm font-bold transition-colors hover:bg-carbon hover:text-mineral"
        >
          View creator dossier <span aria-hidden="true">→</span>
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
      <section aria-labelledby="creator-filters" className="border border-carbon/20 bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-carbon/16 border-b px-5 py-4">
          <div>
            <h2 id="creator-filters" className="text-xs font-bold tracking-[0.12em] uppercase">
              Refine the evidence
            </h2>
            <p className="mt-1 text-xs text-carbon/52">Filters update the matched set locally.</p>
          </div>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-aubergine hover:text-aubergine-deep"
            >
              Clear filters
            </button>
          ) : null}
        </div>
        <div className="grid gap-px bg-carbon/16 sm:grid-cols-2 xl:grid-cols-4">
          <label className="bg-paper px-4 py-4">
            <span className="block text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Industry</span>
            <select
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="mt-2 min-h-11 w-full cursor-pointer border border-carbon/24 bg-white/40 px-3 text-sm text-carbon hover:border-aubergine focus:border-aubergine"
            >
              <option value="all">All industries</option>
              {industries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="bg-paper px-4 py-4">
            <span className="block text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Country</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="mt-2 min-h-11 w-full cursor-pointer border border-carbon/24 bg-white/40 px-3 text-sm text-carbon hover:border-aubergine focus:border-aubergine"
            >
              <option value="all">All countries</option>
              {countries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="bg-paper px-4 py-4">
            <span className="block text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Post price</span>
            <select
              value={price}
              onChange={(event) => setPrice(event.target.value as PriceOption)}
              className="mt-2 min-h-11 w-full cursor-pointer border border-carbon/24 bg-white/40 px-3 text-sm text-carbon hover:border-aubergine focus:border-aubergine"
            >
              <option value="all">Any price</option>
              <option value="under-500">Under €500</option>
              <option value="500-1000">€500–€1,000</option>
              <option value="over-1000">Over €1,000</option>
            </select>
          </label>
          <label className="bg-paper px-4 py-4">
            <span className="block text-[0.72rem] font-bold tracking-[0.11em] text-carbon/48 uppercase">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="mt-2 min-h-11 w-full cursor-pointer border border-carbon/24 bg-white/40 px-3 text-sm text-carbon hover:border-aubergine focus:border-aubergine"
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

      <div className="mt-7 flex items-end justify-between gap-4 border-carbon/18 border-b pb-4">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Matched creators</p>
          <p className="display-type mt-1 text-3xl" role="status" aria-live="polite">
            {visibleCreators.length} profiles in view
          </p>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-carbon/50 sm:block">
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
        <div className="mt-6 border border-carbon/20 bg-paper px-6 py-14 text-center">
          <p className="display-type text-4xl">No creators in this cut.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-carbon/58">
            {creators.length
              ? "Try widening the filters to bring more matched profiles back into view."
              : "Marketplace-visible creator records will appear here as soon as the seeded data is available under RLS."}
          </p>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 min-h-11 cursor-pointer bg-aubergine px-5 font-bold text-white hover:bg-aubergine-deep"
            >
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
