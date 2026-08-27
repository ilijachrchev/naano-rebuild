import { HeroFigure } from "./hero-figure";
import { CtaButton } from "./ui";

export function Hero() {
  return (
    <section className="nn-cloud relative overflow-hidden">
      <div className="nn-container grid items-center gap-12 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24 lg:pb-28">
        <div className="max-w-xl">
          <h1 className="nn-display text-[clamp(2.6rem,6.2vw,4.7rem)] text-nn-ink">
            Creator marketing you can put in the{" "}
            <span className="text-nn-blue">pipeline report</span>.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-nn-muted">
            naano books vetted LinkedIn creators, prices every post by the
            qualified clicks it drives, and traces each click back to the
            companies and pipeline it creates.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton href="/auth" withArrow>
              Book creators
            </CtaButton>
            <CtaButton href="#attribution" variant="secondary">
              See how attribution works
            </CtaButton>
          </div>

          <p className="mt-6 text-sm font-medium text-nn-muted">
            Fixed price per post · Measured per qualified click · Attributed to
            pipeline
          </p>
        </div>

        <div className="lg:pl-6">
          <HeroFigure />
        </div>
      </div>
    </section>
  );
}
