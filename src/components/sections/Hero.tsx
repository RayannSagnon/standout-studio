"use client";

import { useEffect, useRef, useState } from "react";
import ScrollExpand from "@/components/ScrollExpand";
import { publishHeroProgress } from "@/components/layout/SiteHeader";
import { HeroAtmosphere } from "@/components/sections/HeroAtmosphere";
import { Button } from "@/components/ui/Button";
import { hero } from "@/content/en";

export function Hero() {
  const [etherReady, setEtherReady] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [expandEnabled, setExpandEnabled] = useState(true);
  const [copyReady, setCopyReady] = useState(false);
  const openedRef = useRef(false);
  const copyReadyRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setExpandEnabled(!media.matches);
      if (media.matches) {
        openedRef.current = true;
        copyReadyRef.current = true;
        setCopyReady(true);
        setEtherReady(true);
        document.documentElement.classList.remove("is-hero-expanding");
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>('[data-cursor="hero"]');
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting && entry.intersectionRatio > 0.05);
      },
      { threshold: [0, 0.05, 0.2] },
    );
    io.observe(section);
    return () => io.disconnect();
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
        title={hero.expandTitle}
        scrollHint="Scroll"
        useWindowScroll
        enabled={expandEnabled}
        startWidth={42}
        startHeight={58}
        startRadius={28}
        endRadius={0}
        mediaZoom={1.22}
        scrollDistance={1.35}
        holdDistance={0.22}
        smoothing={0.045}
        overlayScrim={0.22}
        onProgress={(progress) => {
          publishHeroProgress(progress);
          if (progress >= 0.7 && !copyReadyRef.current) {
            copyReadyRef.current = true;
            setCopyReady(true);
          }
          if (progress >= 0.98 && !openedRef.current) {
            openedRef.current = true;
            document.documentElement.classList.remove("is-hero-expanding");
            window.requestAnimationFrame(() => setEtherReady(true));
          }
        }}
      >
        <div className="relative h-full w-full">
          <HeroAtmosphere active={etherReady && heroInView} />

          <div
            className={[
              "relative z-10 mx-auto flex h-full min-h-0 max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center md:px-20 md:py-[7.5rem]",
              copyReady ? "animate-hero-copy-fade" : "opacity-0",
            ].join(" ")}
          >
            <p className="mb-3 text-[13px] font-medium tracking-wide text-hero-kicker md:mb-4 md:text-[15px]">
              {hero.kicker}
            </p>

            <p className="max-w-[20ch] font-display text-[34px] font-bold leading-[1.08] tracking-tight text-inverse md:max-w-[18ch] md:text-[52px]">
              {hero.headline}
            </p>

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
