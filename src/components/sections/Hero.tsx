"use client";

import { useEffect, useState } from "react";
import ScrollExpand from "@/components/ScrollExpand";
import SplitText from "@/components/SplitText";
import { publishHeroProgress } from "@/components/layout/SiteHeader";
import { HeroAtmosphere } from "@/components/sections/HeroAtmosphere";
import { Button } from "@/components/ui/Button";
import { hero } from "@/content/en";

export function Hero() {
  const [etherReady, setEtherReady] = useState(false);
  const [expandEnabled, setExpandEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setExpandEnabled(!media.matches);
      if (media.matches) setEtherReady(true);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      data-cursor="hero"
      className="relative isolate bg-hero text-inverse"
    >
      <h1 id="hero-heading" className="sr-only">
        {hero.headline}
      </h1>

      <ScrollExpand
        src="/hero/expand-still.jpg"
        alt=""
        title={hero.headline}
        scrollHint="Scroll"
        useWindowScroll
        enabled={expandEnabled}
        startWidth={42}
        startHeight={58}
        startRadius={28}
        endRadius={0}
        mediaZoom={1.28}
        scrollDistance={1.15}
        holdDistance={0.28}
        smoothing={0.1}
        overlayScrim={0.28}
        onProgress={(progress) => {
          publishHeroProgress(progress);
          const ready = progress >= 0.72;
          setEtherReady((prev) => (prev === ready ? prev : ready));
        }}
      >
        <div className="relative h-full w-full">
          <HeroAtmosphere active={etherReady} />

          <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center md:px-20 md:py-[7.5rem]">
            <p className="mb-3 text-[13px] font-medium tracking-wide text-hero-kicker md:mb-4 md:text-[15px]">
              {hero.kicker}
            </p>

            {etherReady ? (
              <SplitText
                tag="p"
                text={hero.headline}
                className="max-w-[16ch] font-display text-[42px] font-bold leading-[1.05] tracking-tight text-inverse md:max-w-[12ch] md:text-[56px]"
                splitType="chars"
                delay={35}
                duration={0.65}
                ease="power3.out"
                from={{ opacity: 0, y: 28 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.01}
                rootMargin="0px"
                textAlign="center"
              />
            ) : (
              <p
                aria-hidden="true"
                className="max-w-[16ch] font-display text-[42px] font-bold leading-[1.05] tracking-tight text-inverse opacity-0 md:max-w-[12ch] md:text-[56px]"
              >
                {hero.headline}
              </p>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-3.5 md:mt-9">
              <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
              <Button href={hero.secondaryCta.href} variant="ghost">
                {hero.secondaryCta.label}
              </Button>
            </div>

            <p className="mt-8 max-w-[36ch] text-[13px] leading-relaxed text-hero-support md:mt-10 md:text-sm">
              {hero.support}
            </p>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}
