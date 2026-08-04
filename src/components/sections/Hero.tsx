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
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        aria-hidden="true"
      >
        <div className="absolute -left-[18%] -top-[25%] h-[28rem] w-[50rem] rounded-full bg-[#266166]/[0.22] blur-3xl transition-transform duration-[4s]" />
        <div className="absolute -right-[8%] bottom-[-10%] h-[26rem] w-[45rem] rounded-full bg-[#052425]/[0.25] blur-3xl" />
        <div className="absolute right-[10%] -top-[12%] h-[18rem] w-[32rem] rounded-full bg-[#0f736b]/[0.16] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute left-1/2 top-[8%] h-[36rem] w-[76rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.28),transparent_68%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[343px] max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center md:min-h-[640px] md:px-20 md:py-[7.5rem]">
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
