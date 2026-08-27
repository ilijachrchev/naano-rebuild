import Link from "next/link";

import { CtaButton, Logo } from "./ui";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#attribution", label: "Attribution" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-nn-line bg-nn-paper/80 backdrop-blur-md">
      <nav className="nn-container flex h-16 items-center justify-between gap-6">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-nn-muted transition-colors hover:text-nn-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth"
            className="hidden text-sm font-semibold text-nn-ink transition-colors hover:text-nn-blue sm:inline-flex"
          >
            Sign in
          </Link>
          <CtaButton href="/auth" className="!min-h-[2.75rem] !px-4 text-sm">
            Get started
          </CtaButton>
        </div>
      </nav>
    </header>
  );
}
