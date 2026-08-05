"use client";

import SplitText from "@/components/SplitText";
import { useContent, useLocale } from "@/components/i18n/LocaleProvider";

type StepIconName = "phone" | "brief" | "build" | "launch";

function StepIcon({ name }: { name: StepIconName }) {
  const common = "h-8 w-8 text-teal";
  if (name === "phone") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden="true">
        <rect
          x="10"
          y="4"
          width="12"
          height="24"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M13 7.5h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="16" cy="24" r="1.4" fill="currentColor" />
      </svg>
    );
  }
  if (name === "brief") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden="true">
        <rect
          x="8"
          y="5"
          width="16"
          height="22"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 12h8M12 16h8M12 20h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "build") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden="true">
        <rect
          x="6"
          y="8"
          width="14"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="12"
          y="13"
          width="14"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="19" cy="18.5" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden="true">
      <path
        d="M10 22V12l6-5 6 5v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13 22v-5h6v5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="8.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function Process() {
  const { locale } = useLocale();
  const { process } = useContent();

  return (
    <section
      id="process"
      data-cursor="process"
      className="section-texture-mint px-5 py-7 md:px-20 md:py-[88px]"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="md:hidden">
          <SplitText
            key={`${locale}-mobile`}
            tag="h2"
            text={process.mobileTitle}
            splitType="words"
            delay={70}
            duration={0.65}
            textAlign="left"
            className="font-display text-[22px] font-bold tracking-tight text-ink"
          />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {process.steps.map((step) => (
              <article
                key={step.id}
                className="rounded-[14px] bg-white px-3 py-3.5"
              >
                <h3 className="font-display text-base font-semibold text-ink">
                  {step.mobileTitle}
                </h3>
                <p className="mt-1.5 text-xs text-muted">
                  {step.mobileDescription}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {process.note}
          </p>
        </div>

        <div className="hidden md:block">
          <SplitText
            key={`${locale}-desktop`}
            tag="h2"
            text={process.title}
            splitType="words"
            delay={60}
            duration={0.7}
            textAlign="left"
            className="max-w-[22ch] font-display text-[34px] font-bold tracking-tight text-ink"
          />
          <p className="mt-2.5 max-w-[720px] text-base text-[#3a4a4e]">
            {process.intro}
          </p>

          <div className="mt-9 grid grid-cols-4 gap-5">
            {process.steps.map((step) => (
              <article key={step.id} className="rounded-xl px-5 py-[22px]">
                <StepIcon name={step.icon} />
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#3a4a4e]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-9 text-sm text-muted">{process.note}</p>
        </div>
      </div>
    </section>
  );
}
