import Link from "next/link";

import { signOutBrand } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand/dossier";

const navigation = [
  { label: "Overview", href: "/brand" },
  { label: "Creators", href: "/brand/creators" },
  { label: "Campaigns", href: "/brand/campaigns" },
  { label: "Collaborations", href: "/brand/collaborations" },
  { label: "Wallet", href: "/brand/wallet" },
] as const;

export type BrandNavigationHref = (typeof navigation)[number]["href"];

export function BrandSidebar({
  workspaceName,
  activeHref,
}: {
  workspaceName: string;
  activeHref: BrandNavigationHref;
}) {
  return (
    <aside className="flex bg-carbon px-6 py-6 text-mineral lg:min-h-screen lg:flex-col lg:px-8 lg:py-8">
      <div className="flex w-full items-center justify-between lg:block">
        <BrandMark inverse />
        <div className="ml-auto text-right lg:mt-14 lg:ml-0 lg:text-left">
          <p className="text-[0.7rem] font-bold tracking-[0.12em] text-mineral/45 uppercase">
            Workspace
          </p>
          <p className="mt-1 font-bold">{workspaceName}</p>
        </div>
      </div>

      <nav aria-label="Brand navigation" className="mt-10 hidden lg:block">
        <ul className="space-y-1">
          {navigation.map((item, index) => {
            const active = item.href === activeHref;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center justify-between border-0 px-3 py-3 text-left text-sm font-semibold ${
                    active
                      ? "bg-signal text-carbon"
                      : "bg-transparent text-mineral/72 hover:text-signal"
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
  );
}
