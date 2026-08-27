import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutBrand } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand/dossier";
import { CreatorMarketplace } from "@/components/brand/creators/creator-marketplace";
import { getBrandContext, getBrandDestination } from "@/lib/brand/context";
import { getMarketplaceCreators } from "@/lib/marketplace/creators";

const navigation = [
  { label: "Overview", href: "/brand" },
  { label: "Creators", href: "/brand/creators" },
  { label: "Campaigns" },
  { label: "Collaborations" },
  { label: "Wallet" },
];

export default async function BrandCreatorsPage() {
  const context = await getBrandContext();
  const destination = getBrandDestination(context);

  if (destination !== "/brand") redirect(destination);

  const creators = await getMarketplaceCreators();
  const workspace = context.workspace!;

  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex bg-carbon px-6 py-6 text-mineral lg:min-h-screen lg:flex-col lg:px-8 lg:py-8">
        <div className="flex w-full items-center justify-between lg:block">
          <BrandMark inverse />
          <div className="ml-auto text-right lg:mt-14 lg:ml-0 lg:text-left">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] text-mineral/45 uppercase">Workspace</p>
            <p className="mt-1 font-bold">{workspace.name}</p>
          </div>
        </div>

        <nav aria-label="Brand navigation" className="mt-10 hidden lg:block">
          <ul className="space-y-1">
            {navigation.map((item, index) => {
              const active = item.href === "/brand/creators";
              const className = `flex w-full items-center justify-between border-0 px-3 py-3 text-left text-sm font-semibold ${
                active ? "bg-signal text-carbon" : item.href ? "text-mineral/72 hover:text-signal" : "text-mineral/38"
              }`;

              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={className}>
                      {item.label}
                      <span className="display-type text-base">{String(index + 1).padStart(2, "0")}</span>
                    </Link>
                  ) : (
                    <span className={className} aria-disabled="true">
                      {item.label}
                      <span className="display-type text-base">{String(index + 1).padStart(2, "0")}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <form action={signOutBrand} className="mt-auto hidden border-white/18 border-t pt-6 lg:block">
          <button className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-mineral/65 hover:text-signal">
            Sign out
          </button>
        </form>
      </aside>

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-carbon/16 border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Creator marketplace</p>
            <p className="text-sm text-carbon/55">Seeded profiles, filtered through row-level security</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" /> Matched
          </span>
        </header>

        <div className="px-6 py-9 sm:px-10 lg:px-14 lg:py-12">
          <div className="grid gap-7 border-carbon/18 border-b pb-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">Discovery dossier · 02</p>
              <h1 className="display-type mt-3 max-w-4xl text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
                Creators matched to your market signal.
              </h1>
            </div>
            <div className="border-carbon/18 border-l-2 border-l-aubergine bg-mist/38 px-5 py-4">
              <p className="text-sm leading-6 text-carbon/64">
                Compare reach, expected efficiency, and audience evidence before opening a creator dossier. Booking and invitations are intentionally out of scope.
              </p>
            </div>
          </div>

          <div className="mt-9">
            <CreatorMarketplace creators={creators} />
          </div>
        </div>
      </section>
    </main>
  );
}
