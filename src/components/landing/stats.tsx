import { CountUp } from "./count-up";
import { Reveal } from "./motion";

const STATS = [
  { value: 1200, suffix: "+", label: "Creators vetted for B2B fit" },
  { value: 42, label: "Countries in reach" },
  { value: 100, suffix: "%", label: "Qualified clicks attributed to a source" },
  { value: 0, prefix: "$", label: "Billed for unqualified clicks" },
];

export function StatsBand() {
  return (
    <section className="bg-nn-blue text-nn-white">
      <div className="nn-container py-16 sm:py-20">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="nn-display text-[clamp(1.9rem,3.6vw,2.75rem)] text-nn-white">
            Built to be measured.
          </h2>
          <p className="mt-3 text-sm font-medium text-nn-white/80">
            Illustrative figures — placeholder data to show the model, not
            customer results.
          </p>
        </Reveal>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90} className="text-center lg:text-left">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="m-0">
                <span className="nn-display block text-[clamp(2.8rem,6vw,4rem)] leading-none text-nn-white">
                  <CountUp
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </span>
                <span className="mt-3 block text-sm font-medium text-nn-white/85">
                  {stat.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
