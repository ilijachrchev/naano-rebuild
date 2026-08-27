import { Reveal } from "./motion";
import { CtaButton } from "./ui";

export function FinalCta() {
  return (
    <section className="nn-cloud">
      <div className="nn-container py-[var(--nn-section-y)]">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="nn-display text-[clamp(2.1rem,4.6vw,3.5rem)] text-nn-ink">
            Make LinkedIn a channel you can defend in the board deck.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-nn-muted">
            Book vetted creators, pay for qualified clicks, and show the
            pipeline behind every post.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton href="/auth" withArrow>
              Book creators
            </CtaButton>
            <CtaButton href="/auth" variant="secondary">
              Sign in
            </CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
