import { DrawPath } from "./draw-path";
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
            Four steps, one thread — every dollar of spend stays connected to the
            pipeline it produces.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* Desktop horizontal thread through all four dots */}
          <div className="pointer-events-none absolute top-5 right-[12.5%] left-[12.5%] hidden h-1 lg:block">
            <DrawPath
              viewBox="0 0 100 4"
              d="M0 2 H100"
              className="h-full w-full"
              label="A thread connecting the four steps"
            />
          </div>

          <ol className="grid list-none grid-cols-1 gap-x-8 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="relative">
                {/* Mobile vertical connector into the next step */}
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-10 left-5 h-[calc(100%+2.5rem)] w-px bg-nn-line sm:hidden"
                  />
                ) : null}
                <Reveal delay={i * 90} className="flex items-start gap-4 sm:block">
                  <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-nn-blue/25 bg-nn-white text-nn-blue shadow-[0_2px_10px_-3px_rgb(47_91_255_/_0.45)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="sm:mt-6">
                    <div className="flex items-baseline gap-2">
                      <span className="nn-num text-sm font-bold text-nn-blue">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="nn-display text-2xl text-nn-ink">{title}</h3>
                    </div>
                    <p className="mt-2 max-w-xs text-[0.95rem] leading-relaxed text-nn-muted">
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
