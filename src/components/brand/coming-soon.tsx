import { BrandSidebar, type BrandNavigationHref } from "@/components/brand/sidebar";

export function BrandComingSoon({
  workspaceName,
  activeHref,
  section,
}: {
  workspaceName: string;
  activeHref: BrandNavigationHref;
  section: string;
}) {
  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref={activeHref} />

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 items-center border-carbon/16 border-b px-6 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Brand workspace
            </p>
            <p className="text-sm text-carbon/55">{section}</p>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-5rem)] items-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="max-w-3xl border-carbon/18 border-y py-12">
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              Coming soon
            </p>
            <h1 className="display-type mt-4 text-5xl leading-[0.92] sm:text-6xl">
              {section} is coming soon.
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
}
