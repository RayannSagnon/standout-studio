"use client";

import BlurText from "@/components/BlurText";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";
import { AboutIllustration } from "@/components/sections/AboutIllustration";

export function About() {
  const { locale } = useLocale();
  const { about } = useContent();

  return (
    <section
      id="about"
      data-cursor="about"
      className="section-texture-soft px-5 py-7 md:px-20 md:py-[88px]"
    >
      <div className="mx-auto max-w-[1280px]">
        <p className="text-xs font-semibold tracking-[0.12em] text-teal md:text-[13px]">
          {about.kicker}
        </p>
        <BlurText
          key={locale}
          as="p"
          text={about.lead}
          animateBy="words"
          direction="bottom"
          delay={45}
          stepDuration={0.28}
          className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-ink md:mt-4 md:max-w-none md:text-[22px] md:leading-snug"
        />

        <div className="mt-8 grid items-center gap-6 md:mt-10 md:grid-cols-[560px_24px_1fr] md:gap-0">
          <AboutIllustration />

          <div
            className="hidden justify-center md:flex"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="280"
              viewBox="0 0 24 280"
              fill="none"
              className="animate-wave-drift"
            >
              <path
                d="M12 0C16 24 6 48 12 72C18 96 6 120 12 144C18 168 6 192 12 216C18 240 8 260 12 280"
                stroke="#0A4F4F"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="max-w-[624px] md:pl-6">
            <p className="text-sm leading-relaxed text-muted md:text-lg md:text-[#3a4a4e]">
              {about.body}
            </p>
            <p className="mt-4 text-sm font-medium text-teal md:mt-4 md:text-base">
              {about.locale}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
