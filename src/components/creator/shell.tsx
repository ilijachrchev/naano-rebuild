import Link from "next/link";
import type { ReactNode } from "react";

import { signOutBrand } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand/dossier";

const navigation = [
  { label: "Overview", href: "/creator" },
  { label: "Opportunities", href: "/creator/opportunities" },
  { label: "Earnings", href: "/creator/earnings" },
] as const;

export type CreatorNavigationHref = (typeof navigation)[number]["href"];

export function CreatorShell({
  creatorName,
  activeHref,
  eyebrow,
  detail,
  marker,
  children,
}: {
  creatorName: string;
  activeHref: CreatorNavigationHref;
  eyebrow: string;
  detail: string;
  marker: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-mineral lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex bg-carbon px-6 py-6 text-mineral lg:min-h-screen lg:flex-col lg:px-8 lg:py-8">
        <div className="flex w-full items-center justify-between lg:block">
          <BrandMark inverse />
          <div className="ml-auto text-right lg:mt-14 lg:ml-0 lg:text-left">
            <p className="text-[0.7rem] font-bold tracking-[0.12em] text-mineral/45 uppercase">
              Creator
            </p>
            <p className="mt-1 font-bold">{creatorName}</p>
          </div>
        </div>

        <nav aria-label="Creator navigation" className="mt-10 hidden lg:block">
          <ul className="space-y-1">
            {navigation.map((item, index) => {
              const active = item.href === activeHref;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center justify-between px-3 py-3 text-sm font-semibold ${
                      active
                        ? "bg-signal text-carbon"
                        : "text-mineral/72 hover:text-signal"
                    }`}
                  >
                    {item.label}
                    <span className="display-type text-base">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
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
            <p className="text-xs font-bold tracking-[0.12em] text-aubergine uppercase">
              {eyebrow}
            </p>
            <p className="text-sm text-carbon/55">{detail}</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" /> {marker}
          </span>
        </header>

        <nav aria-label="Creator navigation" className="border-carbon/16 border-b bg-mist/45 lg:hidden">
          <ul className="grid grid-cols-3">
            {navigation.map((item) => {
              const active = item.href === activeHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block px-3 py-4 text-center text-[0.68rem] font-bold tracking-[0.08em] uppercase ${
                      active ? "bg-signal text-carbon" : "text-carbon/58"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {children}
      </section>
    </main>
  );
}
