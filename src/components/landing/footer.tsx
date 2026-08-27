import Link from "next/link";

import { GlobeIcon, Logo } from "./ui";

const REGIONS = [
  "North America",
  "UK & Ireland",
  "DACH",
  "Nordics",
  "Benelux",
  "France",
  "Iberia",
  "India",
  "ANZ",
  "Singapore",
];

const PRODUCT_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#attribution", label: "Attribution" },
  { href: "#pricing", label: "Pricing" },
  { href: "/auth", label: "Sign in" },
];

const COMPANY_LINKS = [
  { href: "#", label: "About" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-nn-line bg-nn-white">
      <div className="nn-container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + reach */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-nn-muted">
              The B2B LinkedIn creator marketplace where every post is priced,
              tracked, and attributed to pipeline.
            </p>

            <div className="mt-7 rounded-2xl border border-nn-line bg-nn-paper p-4">
              <div className="flex items-center gap-2.5 text-nn-ink">
                <GlobeIcon className="h-5 w-5 text-nn-blue" />
                <span className="text-sm font-semibold">
                  Creators in reach across 42 countries
                </span>
              </div>
              <ul className="mt-3 flex list-none flex-wrap gap-1.5 p-0">
                {REGIONS.map((region) => (
                  <li
                    key={region}
                    className="rounded-full border border-nn-line bg-nn-white px-2.5 py-1 text-xs font-medium text-nn-muted"
                  >
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-nn-line pt-6 text-sm text-nn-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">© {new Date().getFullYear()} naano. Figures shown are illustrative.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-nn-ink">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-nn-ink">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-bold tracking-[0.14em] text-nn-ink uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex list-none flex-col gap-3 p-0">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[0.95rem] text-nn-muted transition-colors hover:text-nn-blue"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
