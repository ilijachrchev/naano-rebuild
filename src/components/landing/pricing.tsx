import { Reveal } from "./motion";
import { CheckIcon, CtaButton } from "./ui";

const SELF_SERVE = [
  "Browse the vetted, ICP-matched roster",
  "AI-assisted briefs you can edit",
  "Book at a fixed price per post",
  "Tracked links on every post",
];

const TEAMS = [
  "Everything in self-serve",
  "Negotiated rates and bundles",
  "Qualified-click attribution to pipeline",
  "Company-level engagement reporting",
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-[var(--nn-section-y)]">
      <div className="nn-container">
        <Reveal className="max-w-2xl">
          <h2 className="nn-display text-[clamp(2rem,4.2vw,3.25rem)] text-nn-ink">
            Priced like performance, not a billboard.
          </h2>
          <p className="mt-4 text-lg text-nn-muted">
            A fixed price per post, measured by the qualified clicks it earns.
            No retainers, no impression math. Start self-serve, grow into a
            measured program.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* Self-serve — quiet */}
          <Reveal className="nn-card flex flex-col p-7 sm:p-8">
            <h3 className="nn-display text-2xl text-nn-ink">Self-serve</h3>
            <p className="mt-2 text-[0.95rem] text-nn-muted">
              For marketers booking their first creators.
            </p>
            <ul className="mt-6 flex flex-1 list-none flex-col gap-3 p-0">
              {SELF_SERVE.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[0.95rem] text-nn-ink">
                  <CheckIcon className="h-4 w-4 shrink-0 text-nn-blue" />
                  {item}
                </li>
              ))}
            </ul>
            <CtaButton href="/auth" variant="secondary" className="mt-8 w-full">
              Start free
            </CtaButton>
          </Reveal>

          {/* Teams — featured */}
          <Reveal
            delay={110}
            className="relative flex flex-col overflow-hidden rounded-[var(--nn-radius)] border border-nn-blue/30 bg-nn-blue-50 p-7 shadow-[0_28px_60px_-40px_rgb(47_91_255_/_0.6)] sm:p-8"
          >
            <span className="absolute top-6 right-6 nn-chip bg-nn-white">
              Most measured
            </span>
            <h3 className="nn-display text-2xl text-nn-ink">Teams</h3>
            <p className="mt-2 text-[0.95rem] text-nn-muted">
              For programs proving pipeline at scale.
            </p>
            <ul className="mt-6 flex flex-1 list-none flex-col gap-3 p-0">
              {TEAMS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[0.95rem] font-medium text-nn-ink">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nn-blue text-nn-white">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <CtaButton href="/auth" className="mt-8 w-full">
              Get started
            </CtaButton>
          </Reveal>
        </div>

        <p className="mt-6 text-sm text-nn-muted">
          Pricing scales with qualified clicks. Exact plans are being finalized.
        </p>
      </div>
    </section>
  );
}
