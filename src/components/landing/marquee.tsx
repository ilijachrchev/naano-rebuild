import type { ReactElement, SVGProps } from "react";

/**
 * Illustrative placeholder wordmarks — invented companies, not real brands.
 * Each pairs a small authored geometric glyph with a name so the row reads as
 * a logo wall without imitating anyone's identity.
 */
const MARKS: { name: string; Glyph: (p: SVGProps<SVGSVGElement>) => ReactElement }[] = [
  { name: "Northwind", Glyph: GlyphChevrons },
  { name: "Ledgerly", Glyph: GlyphBars },
  { name: "Cadence", Glyph: GlyphWave },
  { name: "Meridian", Glyph: GlyphRing },
  { name: "Outpost", Glyph: GlyphTriangle },
  { name: "Payload", Glyph: GlyphCube },
  { name: "Fathom", Glyph: GlyphDrop },
  { name: "Vantage", Glyph: GlyphDiamond },
  { name: "Beacon", Glyph: GlyphSpark },
];

export function Marquee() {
  const row = [...MARKS, ...MARKS];
  return (
    <div className="nn-marquee" role="group" aria-label="Illustrative customer logos (placeholder)">
      <div className="nn-marquee-track">
        {row.map(({ name, Glyph }, i) => (
          <div
            key={`${name}-${i}`}
            aria-hidden={i >= MARKS.length ? true : undefined}
            className="flex shrink-0 items-center gap-2.5 px-8 py-2 text-nn-muted"
          >
            <Glyph className="h-5 w-5 text-nn-blue/70" />
            <span className="nn-display text-2xl tracking-[-0.02em]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function base(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

function GlyphChevrons(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M5 7l5 5-5 5M12 7l5 5-5 5" />
    </svg>
  );
}
function GlyphBars(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M6 18V11M12 18V5M18 18v-4" />
    </svg>
  );
}
function GlyphWave(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M4 14c2.5 0 2.5-5 5-5s2.5 5 5 5 2.5-5 5-5" />
    </svg>
  );
}
function GlyphRing(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function GlyphTriangle(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M12 5l7 13H5z" />
    </svg>
  );
}
function GlyphCube(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M12 4l7 4v8l-7 4-7-4V8z" />
      <path d="M12 12l7-4M12 12v8M12 12L5 8" />
    </svg>
  );
}
function GlyphDrop(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M12 4c3.5 4 5.5 6.5 5.5 9.2A5.5 5.5 0 0 1 6.5 13.2C6.5 10.5 8.5 8 12 4Z" />
    </svg>
  );
}
function GlyphDiamond(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M12 4l6 8-6 8-6-8z" />
    </svg>
  );
}
function GlyphSpark(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} aria-hidden="true">
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
    </svg>
  );
}
