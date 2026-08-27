import { Reveal } from "./motion";
import { AttributeIcon, BookIcon, BriefIcon, DiscoverIcon } from "./ui";

const STEPS = [
  {
    Icon: DiscoverIcon,
    title: "Discover",
    body: "Browse a vetted roster matched to your ICP — ranked by audience fit, not follower count.",
  },
  {
    Icon: BriefIcon,
    title: "Brief",
    body: "Draft a campaign brief with AI, then edit. Creators get exactly what to say and where to point.",
  },
  {
    Icon: BookIcon,
    title: "Book",
    body: "Book at a fixed price per post, or negotiate a rate. Wallet-gated, with the brief attached.",
  },
  {
    Icon: AttributeIcon,
    title: "Attribute",
    body: "Every post ships a tracked link. Qualified clicks resolve to companies and pipeline.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-[var(--nn-section-y)]">
      <div className="nn-container">
        <Reveal className="max-w-2xl">
          <h2 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            From brief to booked to attributed.
          </h2>
          <p className="mt-4 text-lg text-nn-muted">
            Four steps on one thread — every dollar of spend stays connected to
            the pipeline it produces.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* Desktop: one bold thread through every node */}
          <span
            aria-hidden="true"
            className="nn-trace-line nn-trace-line--h absolute right-[12.5%] left-[12.5%] hidden h-[3px] lg:block"
            style={{ top: 26.5 }}
          />

          <ol className="grid list-none grid-cols-1 gap-y-8 p-0 lg:grid-cols-4 lg:gap-x-8">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="relative">
                {/* Mobile: bold vertical thread into the next step */}
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="nn-trace-line absolute z-0 w-[3px] lg:hidden"
                    style={{ left: 26.5, top: 28, height: "calc(100% + 2rem)" }}
                  />
                ) : null}

                <Reveal
                  delay={i * 90}
                  className="flex items-start gap-5 lg:flex-col lg:items-center lg:text-center"
                >
                  <span
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-nn-blue text-nn-white shadow-[0_12px_30px_-10px_rgb(31_68_255_/_0.65)] ring-4 ring-nn-white"
                  >
                    <Icon className="h-6 w-6" />
                    <span className="nn-num absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-nn-white text-xs font-bold text-nn-blue ring-1 ring-nn-blue/20">
                      {i + 1}
                    </span>
                  </span>

                  <div className="lg:mt-7">
                    <h3 className="nn-display text-2xl text-nn-ink">{title}</h3>
                    <p className="mt-2 max-w-xs text-[0.95rem] leading-relaxed text-nn-muted lg:mx-auto">
                      {body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
