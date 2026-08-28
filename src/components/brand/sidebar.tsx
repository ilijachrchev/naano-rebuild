import Link from "next/link";

import { signOutBrand } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand/dossier";

const navigation = [
  { label: "Overview", href: "/brand" },
  { label: "Creators", href: "/brand/creators" },
  { label: "Campaigns", href: "/brand/campaigns" },
  { label: "Collaborations", href: "/brand/collaborations" },
  { label: "Analytics", href: "/brand/analytics" },
  { label: "Wallet", href: "/brand/wallet" },
] as const;

export type BrandNavigationHref = (typeof navigation)[number]["href"];

const activeClass = "bg-nn-blue text-white shadow-[0_8px_20px_-10px_rgb(31_68_255/0.55)]";
const idleClass = "text-nn-muted hover:bg-nn-blue-50 hover:text-nn-blue";

export function BrandSidebar({
  workspaceName,
  activeHref,
}: {
  workspaceName: string;
  activeHref: BrandNavigationHref;
}) {
  return (
    <aside className="flex flex-col gap-6 border-nn-line border-b bg-nn-white px-6 py-6 text-nn-ink lg:min-h-screen lg:border-r lg:border-b-0 lg:px-7 lg:py-8">
      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start lg:gap-8">
        <BrandMark />
        <div className="text-right lg:text-left">
          <p className="text-[0.68rem] font-bold tracking-[0.14em] text-nn-muted/70 uppercase">
            Workspace
          </p>
          <p className="mt-1 font-bold text-nn-ink">{workspaceName}</p>
        </div>
      </div>

      <nav aria-label="Brand navigation" className="lg:mt-4">
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

      <form action={signOutBrand} className="mt-auto hidden border-nn-line border-t pt-6 lg:block">
        <button className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-nn-muted hover:text-nn-blue">
          Sign out
        </button>
      </form>
    </aside>
  );
}
