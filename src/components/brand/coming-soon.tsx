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
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <BrandSidebar workspaceName={workspaceName} activeHref={activeHref} />

      <section className="min-h-screen bg-nn-paper">
        <header className="flex min-h-20 items-center border-nn-line border-b px-6 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">Brand workspace</p>
            <p className="text-sm text-nn-muted">{section}</p>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-5rem)] items-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="max-w-3xl">
            <span className="nn-chip">Coming soon</span>
            <h1 className="display-type mt-5 text-5xl leading-[0.95] text-nn-ink sm:text-6xl">
              {section} is coming soon.
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
}
