"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  AttributeIcon,
  BookIcon,
  ClickIcon,
  DiscoverIcon,
} from "./ui";

const STAGES = [
  { Icon: BookIcon, label: "Post published", meta: "Creator goes live" },
  { Icon: ClickIcon, label: "Qualified click", meta: "Real intent, filtered" },
  { Icon: DiscoverIcon, label: "Company identified", meta: "Northwind, 500–1k" },
  { Icon: AttributeIcon, label: "Pipeline created", meta: "Opportunity opened" },
] as const;

const ROW = 76; // px per stage row
const INSET = ROW / 2;

/**
 * The landing page's signature figure: a single blue thread drawn top-to-bottom
 * through the four stages of one attributed click. The thread draws itself the
 * first time it enters view; no-JS and reduced-motion visitors see it complete.
 */
export function HeroFigure() {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [len, setLen] = useState<number | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;
    try {
      setLen(path.getTotalLength());
    } catch {
      setLen(null);
    }
    if (!("IntersectionObserver" in window)) {
      path.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            path.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="nn-card w-full p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="nn-chip">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-nn-blue opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-nn-blue" />
          </span>
          One click, traced
        </span>
        <span className="text-xs font-semibold tracking-[0.14em] text-nn-muted uppercase">
          Illustrative
        </span>
      </div>

      <div className="relative mt-6" style={{ height: STAGES.length * ROW }}>
        {/* The thread rail */}
        <svg
          className="absolute left-4 w-2"
          style={{ top: INSET, height: STAGES.length * ROW - ROW }}
          viewBox="0 0 8 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            className="nn-thread-path"
            d="M4 0 V100"
            fill="none"
            stroke="var(--nn-blue)"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={len ? ({ "--nn-thread-len": len } as CSSProperties) : undefined}
          />
        </svg>

        <ul className="relative m-0 list-none p-0">
          {STAGES.map(({ Icon, label, meta }) => (
            <li
              key={label}
              className="flex items-center gap-4"
              style={{ height: ROW }}
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-nn-blue/25 bg-nn-white text-nn-blue shadow-[0_2px_8px_-2px_rgb(47_91_255_/_0.4)]">
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3 border-b border-nn-line pb-3">
                <span className="text-[0.95rem] font-semibold text-nn-ink">
                  {label}
                </span>
                <span className="nn-num truncate text-sm text-nn-muted">
                  {meta}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-sm text-nn-muted">
        Every stage links to the last — so spend maps to pipeline, not guesswork.
      </p>
    </div>
  );
}
