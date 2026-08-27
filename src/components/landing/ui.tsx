import Link from "next/link";
import type { ReactNode, SVGProps } from "react";

/* ---- Brand mark -------------------------------------------------------- */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`nn-display inline-flex items-baseline text-[1.7rem] leading-none tracking-[-0.03em] text-nn-ink ${className}`}
      aria-label="naano — home"
    >
      naano
      <span
        aria-hidden="true"
        className="ml-[3px] inline-block h-[7px] w-[7px] translate-y-[-1px] rounded-full bg-nn-blue"
      />
    </Link>
  );
}

/* ---- Call to action ---------------------------------------------------- */

type CtaButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  withArrow?: boolean;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  className = "",
  withArrow = false,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={`nn-btn ${variant === "primary" ? "nn-btn-primary" : "nn-btn-secondary"} ${className}`}
    >
      {children}
      {withArrow ? <ArrowIcon className="h-[18px] w-[18px]" /> : null}
    </Link>
  );
}

/* ---- Icons (authored, single 1.75 stroke, currentColor) ---------------- */

function icon(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <path d="M4 12.5l5 5 11-12" />
    </svg>
  );
}

/** Discover — a viewfinder framing a match. */
export function DiscoverIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" />
      <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" />
      <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" />
      <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

/** Brief — a document with lines. */
export function BriefIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <path d="M6 3.5h7L18 8v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
      <path d="M13 3.5V8h4.5" />
      <path d="M8.5 12.5h6M8.5 15.5h6" />
    </svg>
  );
}

/** Book — a calendar with a confirmed slot. */
export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 9h16M8 3.5v3M16 3.5v3" />
      <path d="M9 14.5l2 2 4-4.5" />
    </svg>
  );
}

/** Attribute — a signal resolving to a mark. */
export function AttributeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <path d="M3 13h3l2.5-6 3 12 2.5-7 1.5 2H21" />
    </svg>
  );
}

export function ClickIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <path d="M9 4.5V3M4.5 9H3M6.2 6.2 5 5M11.5 11.5 20 14l-3.2 1.4L15.5 20l-4-8.5Z" />
    </svg>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...icon(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.2 8.4 12S9.6 5.8 12 3.5Z" />
    </svg>
  );
}

/* ---- Thread node dot --------------------------------------------------- */

export function NodeDot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-nn-blue ring-4 ring-nn-blue/15 ${className}`}
    />
  );
}
