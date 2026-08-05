import BlurText from "@/components/BlurText";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { whatWeDo } from "@/content/en";

export function WhatWeDo() {
  return (
    <section
      id="what-we-do"
      data-cursor="services"
      className="section-texture-dots px-5 py-10 md:px-20 md:py-[88px]"
    >
      <div className="mx-auto max-w-[1280px]">
        <Reveal className="mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            {whatWeDo.kicker}
          </p>
          <BlurText
            as="h2"
            text={whatWeDo.title}
            animateBy="words"
            direction="top"
            delay={90}
            stepDuration={0.32}
            className="mt-2.5 font-display text-[clamp(0.95rem,2.55vw,2.125rem)] font-bold leading-none tracking-tight text-ink"
            style={{ display: "flex", flexWrap: "nowrap", justifyContent: "center" }}
          />
          <p className="mt-3 hidden text-base text-[#3a4a4e] md:block">
            {whatWeDo.intro}
          </p>
          <p className="mt-2 text-[13px] text-muted md:hidden">
            {whatWeDo.swipeHint}
          </p>
        </Reveal>

        <div className="mt-6 hidden gap-4 md:mt-9 md:grid md:grid-cols-2">
          {whatWeDo.items.map((item, index) => (
            <Reveal key={item.id} delayMs={index * 60} as="article">
              <div className="lift-card flex h-full gap-4 rounded-[14px] bg-surface px-5 py-[22px]">
                <ServiceIcon name={item.icon} />
                <div className="min-w-0">
                  <h3 className="font-display text-[20px] font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#3a4a4e]">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {whatWeDo.items.map((item) => (
            <article
              key={item.id}
              className="w-[200px] shrink-0 rounded-[20px] border border-border bg-surface p-4"
            >
              <ServiceIcon name={item.icon} className="h-9 w-9" />
              <h3 className="mt-3 font-display text-[17px] font-semibold tracking-tight text-ink">
                {item.mobileTitle}
              </h3>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">
                {item.mobileDescription}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
