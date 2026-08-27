import { AttributeIcon, BookIcon, CheckIcon, ClickIcon, DiscoverIcon } from "./ui";

const STAGES = [
  { Icon: BookIcon, label: "Post published", meta: "Creator live · LinkedIn" },
  { Icon: ClickIcon, label: "Qualified click", meta: "Intent verified · bots filtered" },
  { Icon: DiscoverIcon, label: "Company identified", meta: "Northwind · 500–1k" },
] as const;

const ROW = 82; // px per stage row
const NODE = 44;

/**
 * The landing page's signature figure — a live attribution trace. One bold,
 * continuous blue thread runs top-to-bottom through the stages of a single
 * click and lands in the pipeline payoff. The flowing highlight and the live
 * node pulse are pure CSS and settle to a static state under reduced motion.
 */
export function HeroFigure() {
  const rows = STAGES.length + 1; // stages + the payoff row
  return (
    <div className="nn-card w-full p-6 sm:p-7">
      <div className="flex items-center justify-between border-b border-nn-line pb-4">
        <span className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="nn-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nn-blue" />
          </span>
          <span className="text-sm font-bold text-nn-ink">Attribution trace</span>
        </span>
        <span className="text-[0.7rem] font-bold tracking-[0.14em] text-nn-muted uppercase">
          Illustrative
        </span>
      </div>

      <div className="relative mt-6" style={{ height: rows * ROW }}>
        {/* The bold, continuous thread */}
        <span
          aria-hidden="true"
          className="nn-trace-line w-[3px]"
          style={{ left: NODE / 2 - 1.5, top: ROW / 2, height: (rows - 1) * ROW }}
        />

        <ol className="relative m-0 flex list-none flex-col p-0">
          {STAGES.map(({ Icon, label, meta }, i) => (
            <li key={label} className="flex items-center gap-4" style={{ height: ROW }}>
              <span
                className="relative z-10 flex items-center justify-center rounded-full bg-nn-blue text-nn-white shadow-[0_6px_16px_-6px_rgb(31_68_255_/_0.8)] ring-4 ring-nn-white"
                style={{ width: NODE, height: NODE }}
              >
                <Icon className="h-5 w-5" />
                <span className="absolute -right-1 -bottom-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-nn-white text-nn-blue ring-1 ring-nn-blue/20">
                  <CheckIcon className="h-3 w-3" />
                </span>
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-nn-line bg-nn-white px-4 py-3">
                <span className="min-w-0">
                  <span className="block text-[0.95rem] font-semibold text-nn-ink">
                    {label}
                  </span>
                  <span className="nn-num block truncate text-xs text-nn-muted">
                    {meta}
                  </span>
                </span>
                <span className="text-[0.7rem] font-bold tracking-[0.1em] text-nn-blue uppercase">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
            </li>
          ))}

          {/* The payoff — the thread lands here */}
          <li className="flex items-center gap-4" style={{ height: ROW }}>
            <span
              className="relative z-10 flex items-center justify-center rounded-full bg-nn-blue text-nn-white ring-4 ring-nn-white"
              style={{ width: NODE, height: NODE }}
            >
              <span className="nn-ping" />
              <AttributeIcon className="relative h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-nn-blue px-4 py-3 text-nn-white shadow-[0_14px_30px_-14px_rgb(31_68_255_/_0.85)]">
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-bold">Pipeline created</span>
                <span className="nn-num block truncate text-xs text-nn-white/85">
                  Opportunity · Northwind
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-nn-white/20 px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.06em] uppercase">
                Live
              </span>
            </span>
          </li>
        </ol>
      </div>

      <p className="mt-4 text-sm text-nn-muted">
        One click, traced end to end — so spend maps to pipeline, not guesswork.
      </p>
    </div>
  );
}
