import { Reveal } from "./motion";
import { CheckIcon, ClickIcon } from "./ui";

const POINTS = [
  {
    title: "Noise filtered out",
    body: "Bots, accidental taps, and off-ICP traffic never count toward what you pay.",
  },
  {
    title: "Resolved to the company",
    body: "Each qualifying click is matched to the organization behind it — not just a device.",
  },
  {
    title: "Mapped to pipeline",
    body: "Qualified clicks attach to the opportunities they influenced, so spend has a destination.",
  },
];

const ROWS = [
  { company: "Northwind Capital", detail: "500–1k · Fintech", qualified: true },
  { company: "Meridian Labs", detail: "1k–5k · SaaS", qualified: true },
  { company: null, detail: "No company match — filtered", qualified: false },
  { company: "Outpost Systems", detail: "200–500 · DevTools", qualified: true },
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

          <ul className="mt-8 flex list-none flex-col gap-5 p-0">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nn-blue text-nn-white">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-nn-ink">{point.title}</p>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-nn-muted">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <figure className="nn-card m-0 p-6 sm:p-7">
            <figcaption className="mb-5 flex items-center justify-between">
              <span className="nn-chip">Incoming clicks</span>
              <span className="text-xs font-semibold tracking-[0.14em] text-nn-muted uppercase">
                Illustrative
              </span>
            </figcaption>

            <ul className="flex list-none flex-col gap-2.5 p-0">
              {ROWS.map((row, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                    row.qualified
                      ? "border-nn-blue/15 bg-nn-blue-50"
                      : "border-nn-line bg-nn-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      row.qualified
                        ? "bg-nn-blue/10 text-nn-blue"
                        : "bg-nn-ink/5 text-nn-muted"
                    }`}
                  >
                    <ClickIcon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[0.95rem] font-semibold ${
                        row.qualified ? "text-nn-ink" : "text-nn-muted line-through decoration-nn-muted/40"
                      }`}
                    >
                      {row.company ?? "Anonymous click"}
                    </p>
                    <p className="truncate text-xs text-nn-muted">{row.detail}</p>
                  </div>
                  {row.qualified ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-nn-blue">
                      <CheckIcon className="h-4 w-4" />
                      Qualified
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-nn-muted">
                      Filtered
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-nn-line pt-4 text-sm text-nn-muted">
              <span className="font-semibold text-nn-ink">3 of 4 qualified</span>{" "}
              — resolved to 3 companies, one opportunity opened.
            </p>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
