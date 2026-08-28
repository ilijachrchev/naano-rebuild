import type { ReactNode } from "react";

const defaultSteps = ["Access", "Workspace", "Profile", "Dashboard"];

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h13M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
      <path d="m5.5 12.5 4 4 9-10" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${inverse ? "text-mineral" : "text-carbon"}`}>
      <span className="display-type text-[2rem] leading-none">naano</span>
      <span className="h-2.5 w-2.5 rounded-[3px] bg-nn-blue" aria-hidden="true" />
    </div>
  );
}

export function ProgressIndex({
  activeStep,
  steps = defaultSteps,
}: {
  activeStep: number;
  steps?: readonly string[];
}) {
  return (
    <nav aria-label="Onboarding progress" className="border-white/18 border-y text-mineral lg:border-y-0 lg:border-r">
      <ol className="grid grid-cols-4 lg:h-full lg:grid-cols-1 lg:grid-rows-4">
        {steps.map((step, index) => {
          const complete = index < activeStep;
          const active = index === activeStep;
          return (
            <li
              key={step}
              aria-current={active ? "step" : undefined}
              className={`relative flex min-h-20 flex-col justify-center border-white/18 px-3 py-3 lg:min-h-0 lg:border-b lg:px-5 ${
                active ? "text-nn-blue-bright" : complete ? "text-mineral" : "text-mineral/48"
              }`}
            >
              {active ? (
                <span className="absolute top-1/2 right-[-1px] hidden h-9 w-3.5 -translate-y-1/2 bg-nn-blue [clip-path:polygon(0_0,100%_50%,0_100%)] lg:block" />
              ) : null}
              <span className="display-type text-2xl leading-none">{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-1 hidden text-[0.7rem] font-bold tracking-[0.1em] uppercase sm:block">{step}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function DossierShell({
  activeStep,
  steps = defaultSteps,
  aside,
  children,
}: {
  activeStep: number;
  steps?: readonly string[];
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-carbon lg:grid lg:grid-cols-[106px_520px_minmax(0,1fr)] xl:grid-cols-[106px_580px_minmax(0,1fr)]">
      <ProgressIndex activeStep={activeStep} steps={steps} />
      <aside className="flex min-h-[36vh] flex-col justify-between border-white/18 border-b px-6 py-7 text-mineral sm:px-10 lg:min-h-screen lg:border-r lg:border-b-0 lg:px-10 lg:py-8">
        {aside}
      </aside>
      <section className="dossier-paper min-h-[64vh] text-carbon lg:min-h-screen">{children}</section>
    </main>
  );
}

export function DossierTabs({
  activeStep,
  steps = defaultSteps,
}: {
  activeStep: number;
  steps?: readonly string[];
}) {
  return (
    <div className="flex h-14 overflow-hidden border-carbon/16 border-b bg-mist/55 sm:h-16">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`index-tab -mr-2 flex min-w-28 items-center gap-2 border-carbon/20 border-r px-5 text-[0.7rem] font-bold tracking-[0.11em] uppercase sm:min-w-36 ${
            index === activeStep ? "bg-paper text-carbon" : "bg-mist/55 text-carbon/52"
          }`}
        >
          <span className={index === activeStep ? "text-aubergine" : ""}>{String(index + 1).padStart(2, "0")}</span>
          {step}
        </div>
      ))}
    </div>
  );
}

export function EvidenceMark({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[0.7rem] font-bold tracking-[0.1em] uppercase">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nn-blue text-white">
        <CheckIcon className="h-4 w-4" />
      </span>
      {children}
    </div>
  );
}
