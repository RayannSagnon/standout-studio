"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Children, isValidElement, useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SiteApproachProps = {
  children: ReactNode;
};

/**
 * Packages rises gently as it enters. No pin — pinning Work was pulling it
 * into the hero expand viewport.
 */
export function SiteApproach({ children }: SiteApproachProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const packWrapRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const work = items[0];
  const overlay = items[1];

  useGSAP(
    () => {
      const packWrap = packWrapRef.current;
      if (!packWrap) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (reduce || !desktop) return;

      const packEl =
        packWrap.querySelector<HTMLElement>("#packages") ?? packWrap;

      gsap.fromTo(
        packWrap,
        { y: 72 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: packEl,
            start: "top bottom",
            end: "top 40%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: rootRef },
  );

  if (!isValidElement(work) || !overlay) {
    return <div ref={rootRef}>{children}</div>;
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative z-10">{work}</div>
      <div ref={packWrapRef} className="relative z-20 will-change-transform">
        {overlay}
      </div>
    </div>
  );
}
