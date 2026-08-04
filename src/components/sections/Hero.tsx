import { HeroAtmosphere } from "@/components/sections/HeroAtmosphere";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { hero } from "@/content/en";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      data-cursor="hero"
      className="relative isolate overflow-hidden bg-hero text-inverse"
    >
      <HeroAtmosphere />

      <div className="relative z-10 mx-auto flex min-h-[343px] max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center md:min-h-[640px] md:px-20 md:py-[7.5rem]">
        <Reveal>
          <p className="mb-3 text-[13px] font-medium tracking-wide text-hero-kicker md:mb-4 md:text-[15px]">
            {hero.kicker}
          </p>
        </Reveal>

        <Reveal delayMs={80}>
          <h1
            id="hero-heading"
            className="max-w-[16ch] font-display text-[42px] font-bold leading-[1.05] tracking-tight text-inverse md:max-w-[12ch] md:text-[56px]"
          >
            {hero.headline}
          </h1>
        </Reveal>

        <Reveal delayMs={160}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-3.5 md:mt-9">
            <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="ghost">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </Reveal>

        <Reveal delayMs={240}>
          <p className="mt-8 max-w-[36ch] text-[13px] leading-relaxed text-hero-support md:mt-10 md:text-sm">
            {hero.support}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
