"use client";

import BlurText from "@/components/BlurText";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";
import { WhyDevices } from "@/components/mockups/WhyDevices";
import { Reveal } from "@/components/ui/Reveal";

export function Why() {
  const { locale } = useLocale();
  const { why } = useContent();

  return (
    <section
      id="why"
      data-cursor="why"
      className="section-texture-inkwash px-5 py-10 md:px-12 md:py-[72px] lg:px-20"
    >
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[minmax(0,632px)_minmax(0,1fr)] lg:gap-10">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.12em] text-teal">
            {why.kicker}
          </p>
          <BlurText
            key={locale}
            as="h2"
            text={why.title}
            animateBy="words"
            direction="top"
            delay={100}
            stepDuration={0.3}
            className="mt-2.5 max-w-[16ch] font-display text-[20px] font-bold leading-tight tracking-tight text-ink md:text-[36px]"
          />

          <p className="mt-3.5 hidden max-w-[560px] text-base leading-relaxed text-[#3a4a4e] md:block">
            {why.body}
          </p>

          <ul className="mt-5 hidden space-y-2.5 md:block">
            {why.points.map((point, index) => (
              <Reveal
                key={point}
                as="li"
                delayMs={120 + index * 90}
                className="list-none"
              >
                <span className="flex items-start gap-2 text-[15px] text-ink">
                  <span className="text-teal" aria-hidden="true">
                    ✓
                  </span>
                  <span>{point}</span>
                </span>
              </Reveal>
            ))}
          </ul>

          <div className="mt-4 flex gap-3.5 md:hidden">
            <ul className="flex w-[171px] shrink-0 flex-col gap-2">
              {why.mobilePoints.map((point) => (
                <li
                  key={point}
                  className="rounded-xl bg-page px-3 py-2.5 text-[13px] text-ink"
                >
                  <span className="text-teal" aria-hidden="true">
                    ✓{" "}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-[#3a4a4e]">{why.body}</p>
          </div>
        </Reveal>

        <Reveal delayMs={140}>
          <WhyDevices />
        </Reveal>
      </div>
    </section>
  );
}
