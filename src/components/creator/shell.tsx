import Link from "next/link";
import type { ReactNode } from "react";

import { signOutCreator } from "@/app/creator/auth/actions";
import { BrandMark } from "@/components/brand/dossier";

const navigation = [
  { label: "Overview", href: "/creator" },
  { label: "Opportunities", href: "/creator/opportunities" },
  { label: "Collaborations", href: "/creator/collaborations" },
  { label: "Earnings", href: "/creator/earnings" },
  { label: "Referrals", href: "/creator/referrals" },
] as const;

export type CreatorNavigationHref = (typeof navigation)[number]["href"];

const activeClass = "bg-nn-blue text-white shadow-[0_8px_20px_-10px_rgb(31_68_255/0.55)]";
const idleClass = "text-nn-muted hover:bg-nn-blue-50 hover:text-nn-blue";

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
    <main className="min-h-screen bg-nn-white lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-nn-line border-b bg-nn-white px-6 py-6 text-nn-ink lg:min-h-screen lg:border-r lg:border-b-0 lg:px-7 lg:py-8">
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start lg:gap-8">
          <BrandMark />
          <div className="text-right lg:text-left">
            <p className="text-[0.68rem] font-bold tracking-[0.14em] text-nn-muted/70 uppercase">
              Creator
            </p>
            <p className="mt-1 font-bold text-nn-ink">{creatorName}</p>
          </div>
        </div>

        <nav aria-label="Creator navigation" className="lg:mt-4">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navigation.map((item) => {
              const active = item.href === activeHref;

              return (
                <li key={item.href} className="shrink-0 lg:shrink">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-[0.7rem] px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors lg:px-3.5 lg:py-3 ${
                      active ? activeClass : idleClass
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <form action={signOutCreator} className="mt-auto hidden border-nn-line border-t pt-6 lg:block">
          <button className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-nn-muted hover:text-nn-blue">
            Sign out
          </button>
        </form>
      </aside>

      <section className="dossier-paper min-h-screen">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-nn-line border-b px-6 py-4 sm:px-10 lg:px-14">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-nn-blue uppercase">{eyebrow}</p>
            <p className="text-sm text-nn-muted">{detail}</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.09em] text-nn-muted uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-nn-blue" aria-hidden="true" /> {marker}
          </span>
        </header>

        {children}
      </section>
    </main>
  );
}
