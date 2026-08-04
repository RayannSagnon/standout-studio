"use client";

import dynamic from "next/dynamic";

const LiquidEther = dynamic(() => import("@/components/LiquidEther"), {
  ssr: false,
});

const HERO_COLORS = ["#062928", "#0F766E", "#2BB3A5"];

export function HeroAtmosphere() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-hero" />
      <div className="absolute inset-0 opacity-90">
        <LiquidEther
          colors={HERO_COLORS}
          mouseForce={18}
          cursorSize={90}
          isViscous={false}
          viscous={30}
          iterationsViscous={24}
          iterationsPoisson={24}
          resolution={0.45}
          isBounce={false}
          autoDemo
          autoSpeed={0.45}
          autoIntensity={2}
          takeoverDuration={0.25}
          autoResumeDelay={2500}
          autoRampDuration={0.6}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}
