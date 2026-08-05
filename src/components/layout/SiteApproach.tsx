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
 * Selected Work scrolls fully, then pins as Packages enters from the bottom
 * and rises over it. Desktop only.
 */
export function SiteApproach({ children }: SiteApproachProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const workWrapRef = useRef<HTMLDivElement>(null);
  const packWrapRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const work = items[0];
  const overlay = items[1];

  useGSAP(
    () => {
      const root = rootRef.current;
      const workWrap = workWrapRef.current;
      const packWrap = packWrapRef.current;
      if (!root || !workWrap || !packWrap) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (reduce || !desktop) return;

      const workEl = workWrap.querySelector<HTMLElement>("#work") ?? workWrap;
      const packEl =
        packWrap.querySelector<HTMLElement>("#packages") ?? packWrap;

      // Pin Work only once Packages starts entering the viewport —
      // so the cover begins at the end of Work, not mid-cards.
      ScrollTrigger.create({
        trigger: packEl,
        start: "top bottom",
        end: "top top",
        pin: workEl,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      gsap.fromTo(
        packWrap,
        { y: 56 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: packEl,
            start: "top bottom",
            end: "top 35%",
            scrub: 0.45,
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
      <div ref={workWrapRef} className="relative z-10">
        {work}
      </div>
      <div ref={packWrapRef} className="relative z-20 will-change-transform">
        {overlay}
      </div>
    </div>
  );
}
