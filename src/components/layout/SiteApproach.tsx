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

      if (work) {
        ScrollTrigger.create({
          trigger: work,
          start: "bottom bottom",
          endTrigger: root,
          end: "top top",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });
      }

      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "top top",
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      });

      entrance.fromTo(
        panel,
        {
          yPercent: 28,
          scale: 0.86,
          transformOrigin: "50% 0%",
          filter: "brightness(0.96)",
          force3D: true,
        },
        {
          yPercent: 0,
          scale: 1,
          filter: "brightness(1)",
          ease: "none",
          force3D: true,
        },
        0,
      );

      if (work) {
        entrance.fromTo(
          work,
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            transformOrigin: "50% 70%",
            force3D: true,
          },
          {
            scale: 0.9,
            opacity: 0.35,
            filter: "blur(3px)",
            ease: "none",
            force3D: true,
          },
          0,
        );
      }

      return () => {
        if (work) gsap.set(work, { clearProps: "all" });
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative z-20">
      <div
        ref={panelRef}
        className="will-change-transform [transform-style:preserve-3d]"
      >
        {children}
      </div>
    </div>
  );
}
