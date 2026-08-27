import { Reveal } from "./motion";
import {
  AttributeIcon,
  BuildingIcon,
  CheckIcon,
  FilterIcon,
  XIcon,
} from "./ui";

const POINTS = [
  {
    Icon: FilterIcon,
    title: "Noise filtered out",
    body: "Bots, misclicks, and off-ICP traffic never count toward what you pay.",
  },
  {
    Icon: BuildingIcon,
    title: "Resolved to the company",
    body: "Each qualifying click is matched to the organization behind it — not just a device.",
  },
  {
    Icon: AttributeIcon,
    title: "Mapped to pipeline",
    body: "Qualified clicks attach to the opportunities they influenced.",
  },
];

type Row =
  | { qualified: true; company: string; initials: string; detail: string; opp?: boolean }
  | { qualified: false; detail: string };

const ROWS: Row[] = [
  { qualified: true, company: "Northwind Capital", initials: "NC", detail: "500–1k · Fintech", opp: true },
  { qualified: true, company: "Meridian Labs", initials: "ML", detail: "1k–5k · SaaS" },
  { qualified: false, detail: "No company match · bot signature" },
  { qualified: true, company: "Outpost Systems", initials: "OS", detail: "200–500 · DevTools" },
];

export function Attribution() {
  return (
    <section id="attribution" className="nn-cloud-deep scroll-mt-20 py-[var(--nn-section-y)]">
      <div className="nn-container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            A click only counts when it could buy.
          </h2>
          <p className="mt-5 max-w-md text-lg text-nn-muted">
            Impressions flatter everyone. naano pays for the clicks that carry
            real buying intent — filtered, resolved to a company, and tied to
            the pipeline they move.
          </p>

          <ul className="mt-8 flex list-none flex-col divide-y divide-nn-line border-y border-nn-line p-0">
            {POINTS.map(({ Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nn-blue-50 text-nn-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-nn-ink">{title}</p>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-nn-muted">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <figure className="nn-card m-0 overflow-hidden p-0">
            <figcaption className="flex items-center justify-between border-b border-nn-line px-5 py-4 sm:px-6">
              <span className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="nn-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nn-blue" />
                </span>
                <span className="text-sm font-bold text-nn-ink">Incoming clicks</span>
              </span>
              <span className="text-[0.7rem] font-bold tracking-[0.14em] text-nn-muted uppercase">
                Illustrative
              </span>
            </figcaption>

            <ul className="flex list-none flex-col gap-2.5 p-4 sm:p-5">
              {ROWS.map((row, i) =>
                row.qualified ? (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-nn-blue/25 bg-nn-blue-50 px-3.5 py-3"
                  >
                    <span className="nn-num flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nn-blue text-[0.8rem] font-bold text-nn-white">
                      {row.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.95rem] font-semibold text-nn-ink">
                        {row.company}
                      </p>
                      <p className="truncate text-xs text-nn-muted">
                        {row.detail}
                        {row.opp ? " · opportunity opened" : ""}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-nn-blue px-2.5 py-1 text-[0.7rem] font-bold text-nn-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                      Qualified
                    </span>
                  </li>
                ) : (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-nn-line bg-nn-white px-3.5 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nn-ink/5 text-nn-muted">
                      <XIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.95rem] font-semibold text-nn-muted line-through decoration-nn-muted/40">
                        Anonymous click
                      </p>
                      <p className="truncate text-xs text-nn-muted/80">{row.detail}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-nn-line px-2.5 py-1 text-[0.7rem] font-semibold text-nn-muted">
                      Filtered
                    </span>
                  </li>
                ),
              )}
            </ul>

            <div className="flex items-center justify-between border-t border-nn-line px-5 py-4 sm:px-6">
              <span className="text-sm text-nn-muted">
                <span className="font-bold text-nn-ink">3 of 4 qualified</span> ·
                3 companies
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-nn-blue">
                1 opportunity
                <AttributeIcon className="h-4 w-4" />
              </span>
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
