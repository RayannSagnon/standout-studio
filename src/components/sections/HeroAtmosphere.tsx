"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LiquidEther = dynamic(() => import("@/components/LiquidEther"), {
  ssr: false,
});

const HERO_COLORS = ["#062928", "#0F766E", "#2BB3A5"];

type HeroAtmosphereProps = {
  active?: boolean;
};

export function HeroAtmosphere({ active = true }: HeroAtmosphereProps) {
  const [canRun, setCanRun] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setCanRun(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-hero" />
      {active && canRun ? (
        <div className="absolute inset-0 opacity-85">
          <LiquidEther
            colors={HERO_COLORS}
            mouseForce={14}
            cursorSize={80}
            isViscous={false}
            iterationsViscous={8}
            iterationsPoisson={10}
            resolution={0.22}
            BFECC={false}
            isBounce={false}
            autoDemo
            autoSpeed={0.35}
            autoIntensity={1.6}
            takeoverDuration={0.2}
            autoResumeDelay={4000}
            autoRampDuration={0.5}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}
