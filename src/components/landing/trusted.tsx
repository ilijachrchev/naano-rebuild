import { Marquee } from "./marquee";

export function Trusted() {
  return (
    <section className="border-y border-nn-line bg-nn-white py-12">
      <div className="nn-container">
        <p className="mb-7 text-center text-sm font-semibold tracking-[0.02em] text-nn-muted">
          Built for the teams that treat LinkedIn like a revenue channel
        </p>
      </div>
      <Marquee />
      <p className="mt-7 text-center text-xs text-nn-muted/80">
        Placeholder wordmarks shown for layout — not real customers.
      </p>
    </section>
  );
}
