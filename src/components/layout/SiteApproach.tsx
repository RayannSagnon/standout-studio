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
      const work = document.getElementById("work");
      if (!root || !panel) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (reduce || !desktop) return;

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "top 18%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // Translate only — no pin, no scale (those were collapsing / shifting layout).
      entrance.fromTo(
        panel,
        { y: 72, force3D: true },
        { y: 0, ease: "none", force3D: true },
        0,
      );

      if (work) {
        entrance.fromTo(
          work,
          { opacity: 1 },
          { opacity: 0.5, ease: "none" },
          0,
        );
      }

      return () => {
        if (work) gsap.set(work, { clearProps: "opacity" });
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative z-10">
      <div ref={panelRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
