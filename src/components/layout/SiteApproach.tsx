"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SiteApproachProps = {
  children: ReactNode;
};

export function SiteApproach({ children }: SiteApproachProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const panel = panelRef.current;
      if (!root || !panel) return;

      const work = document.getElementById("work");
      // Clear any stuck opacity from older approach builds.
      if (work) gsap.set(work, { clearProps: "opacity,filter,transform" });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (reduce || !desktop) return;

      gsap.fromTo(
        panel,
        { y: 72, force3D: true },
        {
          y: 0,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "top 18%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative z-10">
      <div ref={panelRef}>{children}</div>
    </div>
  );
}
