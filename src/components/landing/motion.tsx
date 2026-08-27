"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Enables scroll/entrance animation across the landing page by stamping
 * `data-nn-anim="on"` on <html> once JS has mounted and the visitor has not
 * asked to reduce motion. Until then (and forever for no-JS / crawlers /
 * reduced-motion) every `.nn-reveal` and the attribution thread render in
 * their fully-visible, fully-drawn state.
 */
export function MotionRoot() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const root = document.documentElement;
    root.setAttribute("data-nn-anim", "on");
    return () => root.removeAttribute("data-nn-anim");
  }, []);
  return null;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
};

/** Fades a block up into place the first time it scrolls into view. */
export function Reveal({ children, className = "", delay = 0, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      const id = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`nn-reveal ${inView ? "is-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
    >
      {children}
    </div>
  );
}
