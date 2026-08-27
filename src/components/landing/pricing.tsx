import { Reveal } from "./motion";
import { CheckIcon, CtaButton } from "./ui";

type Plan = {
  name: string;
  blurb: string;
  priceLead: string;
  priceSub: string;
  features: string[];
  featured?: boolean;
};

const SELF_SERVE: Plan = {
  name: "Self-serve",
  blurb: "For marketers booking their first creators.",
  priceLead: "Per post",
  priceSub: "Fixed rate + pay per qualified click",
  features: [
    "Browse the ICP-matched creator roster",
    "AI-assisted briefs you can edit",
    "Book at a fixed price per post",
    "Tracked links on every post",
    "Wallet and simple checkout",
  ],
};

const TEAMS: Plan = {
  name: "Teams",
  blurb: "For programs proving pipeline at scale.",
  priceLead: "Volume",
  priceSub: "Negotiated rates + full attribution",
  featured: true,
  features: [
    "Everything in Self-serve",
    "Negotiated rates and creator bundles",
    "Qualified-click attribution to pipeline",
    "Company-level engagement reporting",
    "The analytics dashboard",
  ],
};

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

        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 lg:grid-cols-2">
          <PlanCard plan={SELF_SERVE} cta="Start free" ctaVariant="secondary" />
          <PlanCard plan={TEAMS} cta="Get started" ctaVariant="primary" />
        </div>

        <p className="mt-6 text-center text-sm text-nn-muted">
          Illustrative plans — exact pricing scales with qualified clicks and is
          being finalized.
        </p>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  cta,
  ctaVariant,
}: {
  plan: Plan;
  cta: string;
  ctaVariant: "primary" | "secondary";
}) {
  const featured = plan.featured;
  return (
    <Reveal
      delay={featured ? 110 : 0}
      className={
        featured
          ? "relative flex flex-col overflow-hidden rounded-[var(--nn-radius)] border-2 border-nn-blue bg-nn-white p-7 shadow-[0_36px_70px_-44px_rgb(31_68_255_/_0.65)] sm:p-9 lg:-mt-3 lg:mb-3"
          : "relative flex flex-col rounded-[var(--nn-radius)] border border-nn-line bg-nn-white p-7 sm:p-9"
      }
    >
      {featured ? (
        <span className="absolute top-0 right-0 rounded-bl-xl bg-nn-blue px-3.5 py-1.5 text-[0.7rem] font-bold tracking-[0.12em] text-nn-white uppercase">
          Recommended
        </span>
      ) : null}

      <h3 className="nn-display text-2xl text-nn-ink">{plan.name}</h3>
      <p className="mt-1.5 text-[0.95rem] text-nn-muted">{plan.blurb}</p>

      <div className="mt-6 border-t border-nn-line pt-6">
        <p className="nn-display text-3xl text-nn-ink">{plan.priceLead}</p>
        <p className="mt-1 text-sm text-nn-muted">{plan.priceSub}</p>
      </div>

      <ul className="mt-6 flex flex-1 list-none flex-col gap-3.5 p-0">
        {plan.features.map((item, i) => {
          const strong = featured && i === 0;
          return (
            <li key={item} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  featured
                    ? "bg-nn-blue text-nn-white"
                    : "bg-nn-blue-50 text-nn-blue"
                }`}
              >
                <CheckIcon className="h-3 w-3" />
              </span>
              <span
                className={`text-[0.95rem] ${strong ? "font-semibold text-nn-ink" : "text-nn-ink"}`}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>

      <CtaButton href="/auth" variant={ctaVariant} className="mt-8 w-full">
        {cta}
      </CtaButton>
    </Reveal>
  );
}
