"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type DrawPathProps = {
  /** SVG coordinate space, e.g. "0 0 100 60". */
  viewBox: string;
  /** The main thread path `d`. */
  d: string;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  /** Extra SVG elements drawn beneath the animated thread (faint guides, dots). */
  svgUnder?: ReactNode;
  /** Extra SVG elements drawn above the animated thread (node markers). */
  svgOver?: ReactNode;
  /** HTML overlay positioned on top of the figure (labels, chips). */
  children?: ReactNode;
  /** Accessible description of the figure. */
  label: string;
};

/**
 * Draws an attribution thread that animates itself into existence the first
 * time it enters the viewport. The stroke length is measured at runtime so the
 * dash animation is exact; with no JS or reduced motion the CSS default leaves
 * the thread fully drawn. Stroke stays a constant width under non-uniform
 * scaling via `vector-effect`.
 */
export function DrawPath({
  viewBox,
  d,
  className = "",
  style,
  strokeWidth = 2,
  svgUnder,
  svgOver,
  children,
  label,
}: DrawPathProps) {
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
      { threshold: 0.3 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} style={style}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="block h-full w-full"
        role="img"
        aria-label={label}
      >
        {svgUnder}
        <path
          ref={pathRef}
          className="nn-thread-path"
          d={d}
          fill="none"
          stroke="var(--nn-blue)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={
            len ? ({ "--nn-thread-len": len } as CSSProperties) : undefined
          }
        />
        {svgOver}
      </svg>
      {children}
    </div>
  );
}
