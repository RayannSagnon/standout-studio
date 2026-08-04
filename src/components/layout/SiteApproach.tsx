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
      if (work) gsap.set(work, { clearProps: "opacity,filter,transform" });
      gsap.set(panel, { clearProps: "transform,filter,opacity" });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (reduce || !desktop) return;

      gsap.fromTo(
        panel,
        {
          yPercent: 28,
          transformOrigin: "50% 0%",
          force3D: true,
        },
        {
          yPercent: 0,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: root,
            start: "top 95%",
            end: "top 30%",
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative z-20 overflow-x-clip">
      <div ref={panelRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
